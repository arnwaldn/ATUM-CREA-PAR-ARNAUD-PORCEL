# MCP Odoo Integration Guide

## Vue d'ensemble

Guide pour intégrer les serveurs MCP Odoo avec Claude Code pour interaction directe avec les instances Odoo.

## Serveurs MCP Disponibles

### 1. mcp-server-odoo (Recommandé)

**Repository:** https://pypi.org/project/mcp-server-odoo/
**Version:** 0.3.0+
**Auteur:** ivnvxd

#### Fonctionnalités
- CRUD complet (Create, Read, Update, Delete)
- Recherche avec domaines
- Mode YOLO (opérations risquées)
- Support multi-base de données

#### Installation

```bash
# Via pip
pip install mcp-server-odoo

# Via uvx (recommandé)
uvx mcp-server-odoo
```

#### Configuration Claude Desktop

```json
{
  "mcpServers": {
    "odoo": {
      "command": "uvx",
      "args": ["mcp-server-odoo"],
      "env": {
        "ODOO_URL": "https://your-instance.odoo.com",
        "ODOO_DB": "your_database",
        "ODOO_USERNAME": "your_username",
        "ODOO_PASSWORD": "your_api_key",
        "ODOO_YOLO_MODE": "false"
      }
    }
  }
}
```

#### Outils Disponibles

| Outil | Description |
|-------|-------------|
| `search` | Recherche d'enregistrements avec domaine |
| `read` | Lecture d'enregistrements par ID |
| `create` | Création d'enregistrements |
| `update` | Mise à jour d'enregistrements |
| `delete` | Suppression d'enregistrements (YOLO mode) |
| `execute` | Exécution de méthodes personnalisées |

#### Exemples d'Utilisation

```python
# Rechercher des partenaires
search("res.partner", [["is_company", "=", True]], fields=["name", "email"])

# Créer un partenaire
create("res.partner", {"name": "New Company", "is_company": True})

# Mettre à jour
update("res.partner", [42], {"email": "new@email.com"})

# Exécuter une méthode
execute("sale.order", "action_confirm", [[1, 2, 3]])
```

---

### 2. mcp-odoo (Alternative)

**Repository:** https://github.com/tuanle96/mcp-odoo
**Stars:** 234+
**Auteur:** tuanle96

#### Fonctionnalités
- Connexion XML-RPC
- Recherche et lecture
- Support basique CRUD

#### Installation

```bash
# Clone et setup
git clone https://github.com/tuanle96/mcp-odoo
cd mcp-odoo
npm install
```

#### Configuration

```json
{
  "mcpServers": {
    "odoo-basic": {
      "command": "node",
      "args": ["path/to/mcp-odoo/index.js"],
      "env": {
        "ODOO_URL": "https://your-instance.odoo.com",
        "ODOO_DB": "your_database",
        "ODOO_USER": "your_username",
        "ODOO_PASSWORD": "your_password"
      }
    }
  }
}
```

---

## Configuration Recommandée

### Pour le Développement

```json
{
  "mcpServers": {
    "odoo-dev": {
      "command": "uvx",
      "args": ["mcp-server-odoo"],
      "env": {
        "ODOO_URL": "http://localhost:8069",
        "ODOO_DB": "dev_db",
        "ODOO_USERNAME": "admin",
        "ODOO_PASSWORD": "admin",
        "ODOO_YOLO_MODE": "true"
      }
    }
  }
}
```

### Pour la Production

```json
{
  "mcpServers": {
    "odoo-prod": {
      "command": "uvx",
      "args": ["mcp-server-odoo"],
      "env": {
        "ODOO_URL": "https://production.odoo.com",
        "ODOO_DB": "production",
        "ODOO_USERNAME": "api_user",
        "ODOO_PASSWORD": "${ODOO_API_KEY}",
        "ODOO_YOLO_MODE": "false"
      }
    }
  }
}
```

---

## Cas d'Utilisation

### 1. Exploration de Données

```
User: "Montre-moi les 10 dernières commandes de vente"

Claude: Utilise l'outil MCP search:
- Modèle: sale.order
- Domaine: [['state', '=', 'sale']]
- Champs: ['name', 'partner_id', 'amount_total', 'date_order']
- Ordre: date_order desc
- Limite: 10
```

### 2. Création de Données

```
User: "Crée un nouveau client nommé 'Acme Corp'"

Claude: Utilise l'outil MCP create:
- Modèle: res.partner
- Valeurs: {
    'name': 'Acme Corp',
    'is_company': True,
    'customer_rank': 1
  }
```

### 3. Analyse de Modèle

```
User: "Quels champs sont disponibles sur sale.order?"

Claude: Utilise l'outil MCP execute:
- Modèle: ir.model.fields
- Méthode: search_read
- Arguments: [[['model', '=', 'sale.order']]]
```

### 4. Exécution de Workflow

```
User: "Confirme les commandes 1, 2 et 3"

Claude: Utilise l'outil MCP execute:
- Modèle: sale.order
- Méthode: action_confirm
- Arguments: [[1, 2, 3]]
```

---

## Sécurité

### Bonnes Pratiques

1. **Ne jamais utiliser YOLO mode en production**
2. **Utiliser des API keys au lieu de mots de passe**
3. **Créer un utilisateur dédié pour l'API avec droits limités**
4. **Auditer les accès API**

### Configuration Utilisateur API

```python
# Dans Odoo, créer un utilisateur API
user = env['res.users'].create({
    'name': 'API User',
    'login': 'api_user',
    'groups_id': [(6, 0, [
        env.ref('base.group_user').id,
        # Ajouter uniquement les groupes nécessaires
    ])],
})

# Générer une clé API (Odoo 14+)
api_key = user._generate_api_key()
```

---

## Dépannage

### Erreur de Connexion

```bash
# Tester la connexion
curl -X POST https://your-odoo.com/jsonrpc \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"call","params":{"service":"common","method":"version","args":[]},"id":1}'
```

### Erreur d'Authentification

1. Vérifier que l'utilisateur existe
2. Vérifier que le mot de passe/API key est correct
3. Vérifier que l'utilisateur a accès à la base de données

### Erreur de Permission

1. Vérifier les groupes de l'utilisateur API
2. Vérifier les record rules
3. Activer le mode debug pour voir les erreurs détaillées

---

## Intégration avec Claude Code

### Workflow Recommandé

1. **Analyse**: Utiliser MCP pour explorer les données existantes
2. **Planification**: Comprendre la structure des modèles
3. **Développement**: Écrire le code Odoo
4. **Test**: Utiliser MCP pour vérifier les résultats
5. **Déploiement**: Valider en staging avant production

### Commandes Utiles

```
# Avec MCP Odoo configuré:
/odoo - Créer un module Odoo
/odoo-audit - Auditer un module
/odoo-migrate - Migrer un module
```
