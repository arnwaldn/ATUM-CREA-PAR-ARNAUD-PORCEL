# Odoo Deployment Guide

## Vue d'ensemble

Guide complet pour déployer Odoo en production : Odoo.sh, Docker, serveurs dédiés, et CI/CD.

---

## 1. Odoo.sh (Platform as a Service)

### Configuration du Projet

```yaml
# .odoo.sh.conf (à la racine du repo)
[options]
# Addons path
addons_path = ./addons,./enterprise

# Database
db_name = production
db_filter = ^%d$

# Workers
workers = 4
max_cron_threads = 1

# Limits
limit_memory_hard = 2684354560
limit_memory_soft = 2147483648
limit_time_cpu = 600
limit_time_real = 1200

# Logging
log_level = warn
```

### Structure du Repository

```
my-odoo-project/
├── .odoo.sh.conf
├── requirements.txt
├── addons/
│   ├── my_module_1/
│   └── my_module_2/
├── enterprise/          # Submodule ou copie
└── README.md
```

### Déploiement sur Odoo.sh

```bash
# 1. Connecter le repo GitHub à Odoo.sh
# Via l'interface web odoo.sh

# 2. Configurer les branches
# - Production: main
# - Staging: staging
# - Development: develop

# 3. Push pour déployer
git push origin main

# 4. Les builds sont automatiques
# Voir les logs dans l'interface Odoo.sh
```

### Variables d'Environnement Odoo.sh

```python
# Accéder aux variables d'environnement
import os

# Variables prédéfinies
ODOO_STAGE = os.environ.get('ODOO_STAGE')  # production, staging, development
DATABASE_URL = os.environ.get('DATABASE_URL')

# Variables personnalisées (définies dans l'interface)
API_KEY = os.environ.get('MY_API_KEY')
```

---

## 2. Déploiement Docker

### Dockerfile Odoo

```dockerfile
# Dockerfile
FROM odoo:17.0

USER root

# Dépendances système
RUN apt-get update && apt-get install -y \
    python3-dev \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Dépendances Python
COPY requirements.txt /tmp/
RUN pip3 install --no-cache-dir -r /tmp/requirements.txt

# Copier les addons personnalisés
COPY ./addons /mnt/extra-addons

# Configuration
COPY ./config/odoo.conf /etc/odoo/

USER odoo
```

### Docker Compose Production

```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    build: .
    image: mycompany/odoo:17.0
    depends_on:
      - db
      - redis
    ports:
      - "8069:8069"
      - "8072:8072"
    volumes:
      - odoo-web-data:/var/lib/odoo
      - ./addons:/mnt/extra-addons:ro
      - ./config:/etc/odoo:ro
    environment:
      - HOST=db
      - USER=odoo
      - PASSWORD=${DB_PASSWORD}
    command: >
      -- --workers=4
         --max-cron-threads=1
         --limit-memory-hard=2684354560
         --proxy-mode
    restart: unless-stopped
    networks:
      - odoo-network

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=postgres
      - POSTGRES_USER=odoo
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - PGDATA=/var/lib/postgresql/data/pgdata
    volumes:
      - odoo-db-data:/var/lib/postgresql/data/pgdata
    restart: unless-stopped
    networks:
      - odoo-network

  redis:
    image: redis:7-alpine
    volumes:
      - odoo-redis-data:/data
    restart: unless-stopped
    networks:
      - odoo-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - web
    restart: unless-stopped
    networks:
      - odoo-network

volumes:
  odoo-web-data:
  odoo-db-data:
  odoo-redis-data:

networks:
  odoo-network:
    driver: bridge
```

### Configuration Nginx

```nginx
# nginx/nginx.conf
upstream odoo {
    server web:8069;
}

upstream odoo-chat {
    server web:8072;
}

server {
    listen 80;
    server_name odoo.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name odoo.example.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Proxy headers
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # Gzip
    gzip on;
    gzip_types text/css text/plain application/json application/javascript;

    # Cache statique
    location ~* /web/static/ {
        proxy_cache_valid 200 90d;
        proxy_buffering on;
        expires 90d;
        proxy_pass http://odoo;
    }

    # Longpolling
    location /longpolling {
        proxy_pass http://odoo-chat;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Main
    location / {
        proxy_pass http://odoo;
        proxy_redirect off;
        proxy_read_timeout 720s;
        proxy_connect_timeout 720s;
        client_max_body_size 200m;
    }
}
```

---

## 3. CI/CD avec GitHub Actions

### Workflow Complet

```yaml
# .github/workflows/odoo-ci.yml
name: Odoo CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  PYTHON_VERSION: '3.11'
  POSTGRES_USER: odoo
  POSTGRES_PASSWORD: odoo
  POSTGRES_DB: test_db

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ env.PYTHON_VERSION }}

      - name: Install linters
        run: |
          pip install flake8 pylint-odoo isort black

      - name: Run flake8
        run: flake8 addons/ --max-line-length=120

      - name: Run pylint-odoo
        run: pylint --load-plugins=pylint_odoo addons/*/

      - name: Check imports with isort
        run: isort --check-only addons/

      - name: Check formatting with black
        run: black --check addons/

  test:
    needs: lint
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: ${{ env.POSTGRES_USER }}
          POSTGRES_PASSWORD: ${{ env.POSTGRES_PASSWORD }}
          POSTGRES_DB: ${{ env.POSTGRES_DB }}
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ env.PYTHON_VERSION }}

      - name: Cache pip
        uses: actions/cache@v3
        with:
          path: ~/.cache/pip
          key: ${{ runner.os }}-pip-${{ hashFiles('requirements.txt') }}

      - name: Install Odoo
        run: |
          git clone --depth 1 --branch 17.0 https://github.com/odoo/odoo.git /tmp/odoo
          pip install -r /tmp/odoo/requirements.txt
          pip install -r requirements.txt
          pip install pytest pytest-odoo coverage

      - name: Run tests
        run: |
          pytest addons/ \
            --odoo-database=${{ env.POSTGRES_DB }} \
            --odoo-config=test.conf \
            -v \
            --cov=addons \
            --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  security-scan:
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          severity: 'HIGH,CRITICAL'

      - name: Run Bandit security linter
        run: |
          pip install bandit
          bandit -r addons/ -ll

  build:
    needs: [test, security-scan]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to DockerHub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            mycompany/odoo:latest
            mycompany/odoo:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment: staging
    steps:
      - name: Deploy to staging
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.SSH_USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/odoo
            docker-compose pull
            docker-compose up -d
            docker-compose exec -T web odoo -u all --stop-after-init

  deploy-production:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - name: Deploy to production
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.SSH_USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/odoo
            # Backup avant déploiement
            ./scripts/backup.sh
            # Pull et restart
            docker-compose pull
            docker-compose up -d --no-deps web
            # Mise à jour de la base
            docker-compose exec -T web odoo -u all --stop-after-init
```

### Pre-commit Configuration

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-xml
      - id: check-json
      - id: check-added-large-files

  - repo: https://github.com/psf/black
    rev: 23.12.1
    hooks:
      - id: black
        args: [--line-length=120]

  - repo: https://github.com/pycqa/isort
    rev: 5.13.2
    hooks:
      - id: isort
        args: [--profile=black]

  - repo: https://github.com/pycqa/flake8
    rev: 7.0.0
    hooks:
      - id: flake8
        args: [--max-line-length=120]

  - repo: https://github.com/OCA/pylint-odoo
    rev: v9.0.5
    hooks:
      - id: pylint_odoo
```

---

## 4. Serveur Dédié (Bare Metal)

### Script d'Installation Ubuntu

```bash
#!/bin/bash
# install_odoo.sh

set -e

ODOO_VERSION="17.0"
ODOO_USER="odoo"
ODOO_HOME="/opt/odoo"
ODOO_CONFIG="/etc/odoo/odoo.conf"

# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y \
    git \
    python3-dev \
    python3-pip \
    python3-venv \
    build-essential \
    libxslt-dev \
    libzip-dev \
    libldap2-dev \
    libsasl2-dev \
    libpq-dev \
    libjpeg-dev \
    node-less \
    npm

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib
sudo -u postgres createuser -s $ODOO_USER || true

# Create Odoo user
sudo useradd -m -d $ODOO_HOME -U -r -s /bin/bash $ODOO_USER || true

# Clone Odoo
sudo -u $ODOO_USER git clone --depth 1 --branch $ODOO_VERSION \
    https://github.com/odoo/odoo.git $ODOO_HOME/odoo

# Create virtual environment
sudo -u $ODOO_USER python3 -m venv $ODOO_HOME/venv
sudo -u $ODOO_USER $ODOO_HOME/venv/bin/pip install wheel
sudo -u $ODOO_USER $ODOO_HOME/venv/bin/pip install -r $ODOO_HOME/odoo/requirements.txt

# Create directories
sudo mkdir -p /etc/odoo
sudo mkdir -p /var/log/odoo
sudo mkdir -p $ODOO_HOME/custom-addons
sudo chown -R $ODOO_USER:$ODOO_USER /var/log/odoo
sudo chown -R $ODOO_USER:$ODOO_USER $ODOO_HOME

# Create config file
sudo tee $ODOO_CONFIG > /dev/null <<EOF
[options]
admin_passwd = $(openssl rand -base64 32)
db_host = False
db_port = False
db_user = $ODOO_USER
db_password = False
addons_path = $ODOO_HOME/odoo/addons,$ODOO_HOME/custom-addons
logfile = /var/log/odoo/odoo.log
log_level = warn
workers = 4
max_cron_threads = 1
limit_memory_hard = 2684354560
limit_memory_soft = 2147483648
limit_time_cpu = 600
limit_time_real = 1200
proxy_mode = True
EOF

sudo chown $ODOO_USER:$ODOO_USER $ODOO_CONFIG
sudo chmod 640 $ODOO_CONFIG

# Create systemd service
sudo tee /etc/systemd/system/odoo.service > /dev/null <<EOF
[Unit]
Description=Odoo
After=network.target postgresql.service

[Service]
Type=simple
User=$ODOO_USER
Group=$ODOO_USER
ExecStart=$ODOO_HOME/venv/bin/python $ODOO_HOME/odoo/odoo-bin -c $ODOO_CONFIG
StandardOutput=journal+console
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable odoo
sudo systemctl start odoo

echo "Odoo installed successfully!"
echo "Access at: http://$(hostname -I | awk '{print $1}'):8069"
```

### Configuration Logrotate

```
# /etc/logrotate.d/odoo
/var/log/odoo/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 640 odoo odoo
    postrotate
        systemctl reload odoo > /dev/null 2>&1 || true
    endscript
}
```

### Patterns Avancés v24.1 (Multi-architecture)

> Source: Yenthe666/InstallScript - Patterns modernes pour déploiements 2025

#### 1. Détection Architecture (ARM/x86)

```bash
# Fonction detect_arch - Support Raspberry Pi, Mac M1/M2, AWS Graviton
detect_arch() {
  local arch_raw
  arch_raw="$(dpkg --print-architecture 2>/dev/null || uname -m)"
  case "$arch_raw" in
    amd64|x86_64)   ARCH_DEB="amd64";;
    arm64|aarch64)  ARCH_DEB="arm64";;
    armhf|armv7l)   ARCH_DEB="armhf";;
    *)              ARCH_DEB="$arch_raw";;
  esac
  echo "Architecture détectée: $ARCH_DEB"
}

# Appeler au début du script
detect_arch
```

#### 2. pip_install Helper (PEP 668 - Ubuntu 24.04+)

```bash
# Helper obligatoire pour Ubuntu 24.04+ (externally-managed-environment)
pip_install() {
  if pip3 help install 2>/dev/null | grep -q -- '--break-system-packages'; then
    sudo -H pip3 install --break-system-packages "$@"
  else
    sudo -H pip3 install "$@"
  fi
}

# Usage
pip_install wheel setuptools
pip_install -r requirements.txt
```

#### 3. PostgreSQL 16 + pgvector (AI/RAG Ready)

```bash
# Installation PostgreSQL 16 avec extension pgvector pour embeddings IA
# Requis pour: recherche sémantique, RAG Odoo, intégrations LLM

# Ajouter repo PostgreSQL 16
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update

# Installer PostgreSQL 16 + pgvector
sudo apt install -y postgresql-16 postgresql-16-pgvector

# Activer extension dans template
sudo -u postgres psql -d template1 -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Vérifier installation
sudo -u postgres psql -c "SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';"
```

#### 4. wkhtmltopdf Multi-Architecture

```bash
# Installation wkhtmltopdf avec détection automatique d'architecture
# Requis pour: génération rapports PDF Odoo

WKHTMLTOX_VERSION="0.12.6.1-3"
UBUNTU_CODENAME=$(lsb_release -cs)

# Déterminer URL selon architecture
case "$ARCH_DEB" in
  amd64)
    WKHTMLTOX_URL="https://github.com/wkhtmltopdf/packaging/releases/download/${WKHTMLTOX_VERSION}/wkhtmltox_${WKHTMLTOX_VERSION}.${UBUNTU_CODENAME}_amd64.deb"
    ;;
  arm64)
    WKHTMLTOX_URL="https://github.com/wkhtmltopdf/packaging/releases/download/${WKHTMLTOX_VERSION}/wkhtmltox_${WKHTMLTOX_VERSION}.${UBUNTU_CODENAME}_arm64.deb"
    ;;
  *)
    echo "Architecture $ARCH_DEB non supportée pour wkhtmltopdf"
    exit 1
    ;;
esac

# Télécharger et installer
wget -q "$WKHTMLTOX_URL" -O /tmp/wkhtmltox.deb
sudo apt install -y /tmp/wkhtmltox.deb
rm /tmp/wkhtmltox.deb

# Vérifier installation
wkhtmltopdf --version
```

#### Script Complet Modernisé

```bash
#!/bin/bash
# install_odoo_modern.sh - Script v24.1 avec support multi-architecture
set -e

ODOO_VERSION="18.0"
ODOO_USER="odoo"
ODOO_HOME="/opt/odoo"

# 1. Détection architecture
detect_arch() {
  local arch_raw
  arch_raw="$(dpkg --print-architecture 2>/dev/null || uname -m)"
  case "$arch_raw" in
    amd64|x86_64)   ARCH_DEB="amd64";;
    arm64|aarch64)  ARCH_DEB="arm64";;
    *)              echo "Architecture non supportée"; exit 1;;
  esac
}
detect_arch

# 2. Helper pip PEP 668
pip_install() {
  if pip3 help install 2>/dev/null | grep -q -- '--break-system-packages'; then
    sudo -H pip3 install --break-system-packages "$@"
  else
    sudo -H pip3 install "$@"
  fi
}

# 3. Update système
sudo apt update && sudo apt upgrade -y

# 4. Dépendances de base
sudo apt install -y git python3-dev python3-pip python3-venv build-essential \
    libxslt-dev libzip-dev libldap2-dev libsasl2-dev libpq-dev libjpeg-dev npm

# 5. PostgreSQL 16 + pgvector
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update
sudo apt install -y postgresql-16 postgresql-16-pgvector
sudo -u postgres psql -d template1 -c "CREATE EXTENSION IF NOT EXISTS vector;"
sudo -u postgres createuser -s $ODOO_USER || true

# 6. wkhtmltopdf multi-arch
WKHTMLTOX_VERSION="0.12.6.1-3"
WKHTMLTOX_URL="https://github.com/wkhtmltopdf/packaging/releases/download/${WKHTMLTOX_VERSION}/wkhtmltox_${WKHTMLTOX_VERSION}.$(lsb_release -cs)_${ARCH_DEB}.deb"
wget -q "$WKHTMLTOX_URL" -O /tmp/wkhtmltox.deb && sudo apt install -y /tmp/wkhtmltox.deb

# 7. Créer utilisateur et cloner Odoo
sudo useradd -m -d $ODOO_HOME -U -r -s /bin/bash $ODOO_USER || true
sudo -u $ODOO_USER git clone --depth 1 --branch $ODOO_VERSION https://github.com/odoo/odoo.git $ODOO_HOME/odoo

# 8. Virtual env avec pip PEP 668 compatible
sudo -u $ODOO_USER python3 -m venv $ODOO_HOME/venv
sudo -u $ODOO_USER $ODOO_HOME/venv/bin/pip install wheel
sudo -u $ODOO_USER $ODOO_HOME/venv/bin/pip install -r $ODOO_HOME/odoo/requirements.txt

echo "✅ Installation Odoo $ODOO_VERSION complète sur architecture $ARCH_DEB"
echo "   PostgreSQL 16 + pgvector activé pour IA/RAG"
```

---

## 5. Backup et Restore

### Script de Backup

```bash
#!/bin/bash
# backup_odoo.sh

BACKUP_DIR="/backup/odoo"
DB_NAME="production"
FILESTORE="/var/lib/odoo/filestore/$DB_NAME"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR/$DATE

# Backup database
pg_dump -Fc $DB_NAME > $BACKUP_DIR/$DATE/db.dump

# Backup filestore
tar -czf $BACKUP_DIR/$DATE/filestore.tar.gz -C $FILESTORE .

# Backup config
cp /etc/odoo/odoo.conf $BACKUP_DIR/$DATE/

# Create manifest
cat > $BACKUP_DIR/$DATE/manifest.json <<EOF
{
    "date": "$DATE",
    "database": "$DB_NAME",
    "odoo_version": "17.0"
}
EOF

# Compress all
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz -C $BACKUP_DIR/$DATE .
rm -rf $BACKUP_DIR/$DATE

# Remove old backups
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $BACKUP_DIR/backup_$DATE.tar.gz"
```

### Script de Restore

```bash
#!/bin/bash
# restore_odoo.sh

BACKUP_FILE=$1
DB_NAME="production_restored"
FILESTORE="/var/lib/odoo/filestore/$DB_NAME"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file.tar.gz>"
    exit 1
fi

# Stop Odoo
sudo systemctl stop odoo

# Extract backup
TEMP_DIR=$(mktemp -d)
tar -xzf $BACKUP_FILE -C $TEMP_DIR

# Restore database
dropdb $DB_NAME 2>/dev/null || true
createdb $DB_NAME
pg_restore -d $DB_NAME $TEMP_DIR/db.dump

# Restore filestore
rm -rf $FILESTORE
mkdir -p $FILESTORE
tar -xzf $TEMP_DIR/filestore.tar.gz -C $FILESTORE

# Cleanup
rm -rf $TEMP_DIR

# Start Odoo
sudo systemctl start odoo

echo "Restore completed for database: $DB_NAME"
```

---

## 6. Monitoring

### Script de Health Check

```python
#!/usr/bin/env python3
# health_check.py

import requests
import sys

ODOO_URL = "http://localhost:8069"
TIMEOUT = 30

def check_health():
    try:
        # Check web interface
        response = requests.get(
            f"{ODOO_URL}/web/health",
            timeout=TIMEOUT
        )
        if response.status_code != 200:
            return False, f"Web returned {response.status_code}"

        # Check database
        response = requests.get(
            f"{ODOO_URL}/web/database/selector",
            timeout=TIMEOUT
        )
        if response.status_code != 200:
            return False, f"Database check failed"

        return True, "OK"

    except requests.exceptions.RequestException as e:
        return False, str(e)

if __name__ == "__main__":
    healthy, message = check_health()
    print(f"Status: {message}")
    sys.exit(0 if healthy else 1)
```

### Prometheus Metrics Exporter

```python
# metrics_exporter.py
from prometheus_client import start_http_server, Gauge
import psutil
import time

# Metrics
ODOO_WORKERS = Gauge('odoo_workers_total', 'Number of Odoo workers')
ODOO_MEMORY = Gauge('odoo_memory_bytes', 'Odoo memory usage')
ODOO_CPU = Gauge('odoo_cpu_percent', 'Odoo CPU usage')
DB_CONNECTIONS = Gauge('odoo_db_connections', 'Database connections')

def collect_metrics():
    # Find Odoo processes
    odoo_procs = [p for p in psutil.process_iter(['name', 'cmdline'])
                  if 'odoo' in ' '.join(p.info.get('cmdline', []))]

    ODOO_WORKERS.set(len(odoo_procs))

    total_memory = sum(p.memory_info().rss for p in odoo_procs)
    ODOO_MEMORY.set(total_memory)

    total_cpu = sum(p.cpu_percent() for p in odoo_procs)
    ODOO_CPU.set(total_cpu)

if __name__ == '__main__':
    start_http_server(9100)
    while True:
        collect_metrics()
        time.sleep(15)
```

---

## 7. Checklist Déploiement

```markdown
## Pre-Déploiement
- [ ] Tests passent en CI
- [ ] Backup de production effectué
- [ ] Changelog documenté
- [ ] Rollback plan prêt

## Configuration
- [ ] list_db = False
- [ ] proxy_mode = True
- [ ] admin_passwd changé et fort
- [ ] Workers configurés
- [ ] Limites mémoire/CPU définies

## Sécurité
- [ ] HTTPS configuré
- [ ] Certificats SSL valides
- [ ] Firewall configuré
- [ ] Fail2ban installé

## Monitoring
- [ ] Health checks actifs
- [ ] Logs centralisés
- [ ] Alertes configurées
- [ ] Backups automatiques

## Post-Déploiement
- [ ] Smoke tests effectués
- [ ] Performances vérifiées
- [ ] Utilisateurs notifiés
```
