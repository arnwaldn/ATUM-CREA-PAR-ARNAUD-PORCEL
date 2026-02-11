# Odoo Testing Guide - pytest-odoo

## Vue d'ensemble

Guide complet pour tester les modules Odoo v19 avec pytest-odoo et les frameworks de test natifs.

---

## 1. Configuration pytest-odoo

### Installation

```bash
pip install pytest-odoo pytest-cov pytest-xdist
```

### Configuration pytest.ini

```ini
# pytest.ini
[pytest]
addopts =
    --odoo-database=test_db
    -v
    --tb=short
    --strict-markers
    -ra

markers =
    slow: marks tests as slow
    integration: marks tests as integration tests
    api: marks tests that require API access

filterwarnings =
    ignore::DeprecationWarning
    ignore::PendingDeprecationWarning

testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
```

### conftest.py

```python
# tests/conftest.py
import pytest
from odoo.tests.common import TransactionCase, tagged
from odoo import SUPERUSER_ID
from odoo.api import Environment


@pytest.fixture(scope='module')
def env():
    """Environnement Odoo pour les tests"""
    with Environment.manage():
        registry = odoo.registry(get_db_name())
        with registry.cursor() as cr:
            yield Environment(cr, SUPERUSER_ID, {})


@pytest.fixture
def partner_model(env):
    """Fixture pour res.partner"""
    return env['res.partner']


@pytest.fixture
def test_partner(env):
    """Crée un partenaire de test"""
    partner = env['res.partner'].create({
        'name': 'Test Partner',
        'email': 'test@example.com',
    })
    yield partner
    # Cleanup
    partner.unlink()


@pytest.fixture
def admin_user(env):
    """Utilisateur admin pour les tests"""
    return env.ref('base.user_admin')


@pytest.fixture
def demo_user(env):
    """Utilisateur demo pour les tests"""
    return env.ref('base.user_demo')


def pytest_configure(config):
    """Configuration pytest"""
    config.addinivalue_line(
        "markers", "at_install: mark test to run at module install"
    )
    config.addinivalue_line(
        "markers", "post_install: mark test to run after module install"
    )
```

---

## 2. Types de Tests

### Tests Unitaires

```python
# tests/test_unit.py
from odoo.tests.common import TransactionCase
from odoo.exceptions import ValidationError, UserError
import pytest


class TestProductUnit(TransactionCase):
    """Tests unitaires pour product.product"""

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.product_model = cls.env['product.product']
        cls.category = cls.env['product.category'].create({
            'name': 'Test Category',
        })

    def test_create_product(self):
        """Test création produit"""
        product = self.product_model.create({
            'name': 'Test Product',
            'list_price': 100.0,
            'categ_id': self.category.id,
        })

        self.assertTrue(product.id)
        self.assertEqual(product.name, 'Test Product')
        self.assertEqual(product.list_price, 100.0)

    def test_product_default_values(self):
        """Test valeurs par défaut"""
        product = self.product_model.create({
            'name': 'Minimal Product',
        })

        self.assertEqual(product.type, 'consu')
        self.assertTrue(product.active)
        self.assertEqual(product.list_price, 0.0)

    def test_product_name_required(self):
        """Test contrainte nom obligatoire"""
        with self.assertRaises(Exception):
            self.product_model.create({
                'list_price': 50.0,
            })

    def test_product_compute_field(self):
        """Test champ calculé"""
        product = self.product_model.create({
            'name': 'Computed Test',
            'list_price': 100.0,
        })

        # Simuler un champ calculé margin
        # self.assertEqual(product.margin, expected_value)

    def test_product_constraint(self):
        """Test contrainte SQL/Python"""
        with pytest.raises(ValidationError):
            self.product_model.create({
                'name': 'Negative Price',
                'list_price': -10.0,  # Si contrainte prix positif
            })


class TestPartnerUnit(TransactionCase):
    """Tests unitaires pour res.partner"""

    def test_create_company(self):
        """Test création société"""
        company = self.env['res.partner'].create({
            'name': 'Test Company',
            'is_company': True,
        })

        self.assertTrue(company.is_company)

    def test_create_contact(self):
        """Test création contact avec parent"""
        company = self.env['res.partner'].create({
            'name': 'Parent Company',
            'is_company': True,
        })

        contact = self.env['res.partner'].create({
            'name': 'Contact Person',
            'parent_id': company.id,
        })

        self.assertEqual(contact.parent_id, company)
        self.assertFalse(contact.is_company)

    def test_email_format(self):
        """Test format email"""
        partner = self.env['res.partner'].create({
            'name': 'Email Test',
            'email': 'valid@email.com',
        })

        self.assertEqual(partner.email, 'valid@email.com')
```

### Tests d'Intégration

```python
# tests/test_integration.py
from odoo.tests.common import TransactionCase, Form
from odoo.tests import tagged
from datetime import datetime, timedelta


@tagged('integration', '-at_install', 'post_install')
class TestSaleOrderIntegration(TransactionCase):
    """Tests d'intégration pour sale.order"""

    @classmethod
    def setUpClass(cls):
        super().setUpClass()

        # Créer les données de test
        cls.partner = cls.env['res.partner'].create({
            'name': 'Integration Customer',
            'email': 'customer@test.com',
        })

        cls.product = cls.env['product.product'].create({
            'name': 'Integration Product',
            'type': 'consu',
            'list_price': 150.0,
            'invoice_policy': 'order',
        })

        cls.pricelist = cls.env['product.pricelist'].create({
            'name': 'Test Pricelist',
            'currency_id': cls.env.ref('base.EUR').id,
        })

    def test_full_sale_workflow(self):
        """Test workflow complet de vente"""
        # 1. Créer le devis
        order = self.env['sale.order'].create({
            'partner_id': self.partner.id,
            'pricelist_id': self.pricelist.id,
        })

        # 2. Ajouter une ligne
        self.env['sale.order.line'].create({
            'order_id': order.id,
            'product_id': self.product.id,
            'product_uom_qty': 5,
        })

        # 3. Vérifier les calculs
        self.assertEqual(order.amount_total, 750.0)

        # 4. Confirmer la commande
        order.action_confirm()
        self.assertEqual(order.state, 'sale')

        # 5. Créer la facture
        invoice = order._create_invoices()
        self.assertTrue(invoice)
        self.assertEqual(invoice.amount_total, 750.0)

    def test_sale_with_discount(self):
        """Test vente avec remise"""
        order = self.env['sale.order'].create({
            'partner_id': self.partner.id,
        })

        self.env['sale.order.line'].create({
            'order_id': order.id,
            'product_id': self.product.id,
            'product_uom_qty': 10,
            'discount': 10.0,  # 10% discount
        })

        # 1500 - 10% = 1350
        self.assertEqual(order.amount_untaxed, 1350.0)

    def test_sale_order_form(self):
        """Test via Form (UI simulation)"""
        with Form(self.env['sale.order']) as order_form:
            order_form.partner_id = self.partner

            with order_form.order_line.new() as line:
                line.product_id = self.product
                line.product_uom_qty = 3

        order = order_form.save()

        self.assertEqual(len(order.order_line), 1)
        self.assertEqual(order.amount_total, 450.0)


@tagged('integration', '-at_install', 'post_install')
class TestPurchaseIntegration(TransactionCase):
    """Tests d'intégration pour purchase.order"""

    @classmethod
    def setUpClass(cls):
        super().setUpClass()

        cls.supplier = cls.env['res.partner'].create({
            'name': 'Test Supplier',
            'supplier_rank': 1,
        })

        cls.product = cls.env['product.product'].create({
            'name': 'Purchasable Product',
            'type': 'product',
            'standard_price': 80.0,
        })

    def test_purchase_to_receipt(self):
        """Test achat jusqu'à réception"""
        # Créer commande d'achat
        po = self.env['purchase.order'].create({
            'partner_id': self.supplier.id,
        })

        self.env['purchase.order.line'].create({
            'order_id': po.id,
            'product_id': self.product.id,
            'product_qty': 10,
            'price_unit': 80.0,
        })

        # Confirmer
        po.button_confirm()
        self.assertEqual(po.state, 'purchase')

        # Vérifier le picking
        self.assertTrue(po.picking_ids)
        picking = po.picking_ids[0]

        # Réceptionner
        picking.move_ids.quantity = 10
        picking.button_validate()

        self.assertEqual(picking.state, 'done')
```

### Tests API

```python
# tests/test_api.py
from odoo.tests.common import HttpCase
from odoo.tests import tagged
import json


@tagged('api', '-at_install', 'post_install')
class TestAPIEndpoints(HttpCase):
    """Tests des endpoints API"""

    @classmethod
    def setUpClass(cls):
        super().setUpClass()

        # Créer une clé API de test
        cls.api_key = cls.env['api.key'].create({
            'name': 'Test API Key',
            'user_id': cls.env.ref('base.user_admin').id,
        })

    def test_get_products(self):
        """Test GET /api/v1/products"""
        response = self.url_open(
            '/api/v1/products',
            headers={
                'X-API-Key': self.api_key.key,
            },
        )

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.text)
        self.assertTrue(data.get('success'))

    def test_create_product(self):
        """Test POST /api/v1/products"""
        response = self.url_open(
            '/api/v1/products',
            data=json.dumps({
                'name': 'API Created Product',
                'list_price': 99.99,
            }),
            headers={
                'X-API-Key': self.api_key.key,
                'Content-Type': 'application/json',
            },
        )

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.text)
        self.assertTrue(data.get('result', {}).get('success'))

    def test_unauthorized_access(self):
        """Test accès non autorisé"""
        response = self.url_open('/api/v1/products')

        self.assertEqual(response.status_code, 401)

    def test_invalid_api_key(self):
        """Test clé API invalide"""
        response = self.url_open(
            '/api/v1/products',
            headers={
                'X-API-Key': 'invalid_key',
            },
        )

        self.assertEqual(response.status_code, 401)


@tagged('api', '-at_install', 'post_install')
class TestWebhookEndpoints(HttpCase):
    """Tests des webhooks"""

    def test_stripe_webhook(self):
        """Test webhook Stripe"""
        import hmac
        import hashlib
        import time

        payload = json.dumps({
            'type': 'checkout.session.completed',
            'data': {
                'object': {
                    'id': 'cs_test_123',
                    'metadata': {
                        'odoo_order_id': '1',
                    },
                },
            },
        })

        timestamp = str(int(time.time()))
        secret = 'test_webhook_secret'
        signature = hmac.new(
            secret.encode(),
            f"{timestamp}.{payload}".encode(),
            hashlib.sha256,
        ).hexdigest()

        response = self.url_open(
            '/webhook/stripe',
            data=payload,
            headers={
                'Content-Type': 'application/json',
                'Stripe-Signature': f't={timestamp},v1={signature}',
            },
        )

        self.assertEqual(response.status_code, 200)
```

---

## 3. Tests de Performance

```python
# tests/test_performance.py
from odoo.tests.common import TransactionCase
from odoo.tests import tagged
import time
import cProfile
import pstats
import io


@tagged('performance', '-at_install', 'post_install')
class TestPerformance(TransactionCase):
    """Tests de performance"""

    def test_bulk_create_performance(self):
        """Test performance création en masse"""
        start = time.time()

        # Créer 1000 enregistrements
        vals_list = [
            {'name': f'Product {i}', 'list_price': i * 10}
            for i in range(1000)
        ]

        self.env['product.product'].create(vals_list)

        elapsed = time.time() - start

        # Ne devrait pas prendre plus de 5 secondes
        self.assertLess(elapsed, 5.0)

    def test_search_performance(self):
        """Test performance recherche"""
        # Préparer données
        self.env['product.product'].create([
            {'name': f'Searchable {i}'}
            for i in range(500)
        ])

        start = time.time()

        # Recherche avec domaine complexe
        results = self.env['product.product'].search([
            ('name', 'ilike', 'Searchable'),
            ('active', '=', True),
        ])

        elapsed = time.time() - start

        self.assertGreater(len(results), 0)
        self.assertLess(elapsed, 1.0)  # Max 1 seconde

    def test_compute_field_performance(self):
        """Test performance champs calculés"""
        order = self.env['sale.order'].create({
            'partner_id': self.env.ref('base.res_partner_1').id,
        })

        # Créer 100 lignes
        self.env['sale.order.line'].create([
            {
                'order_id': order.id,
                'name': f'Line {i}',
                'product_uom_qty': i,
                'price_unit': 100,
            }
            for i in range(1, 101)
        ])

        start = time.time()

        # Forcer le calcul
        _ = order.amount_total
        _ = order.amount_untaxed
        _ = order.amount_tax

        elapsed = time.time() - start

        self.assertLess(elapsed, 0.5)

    def profile_operation(self, func):
        """Helper pour profiler une opération"""
        pr = cProfile.Profile()
        pr.enable()

        func()

        pr.disable()
        s = io.StringIO()
        ps = pstats.Stats(pr, stream=s).sort_stats('cumulative')
        ps.print_stats(20)

        return s.getvalue()
```

---

## 4. Mocking et Fixtures

```python
# tests/test_mocking.py
from odoo.tests.common import TransactionCase
from unittest.mock import patch, MagicMock
import pytest


class TestWithMocking(TransactionCase):
    """Tests avec mocking"""

    @patch('requests.post')
    def test_external_api_call(self, mock_post):
        """Test appel API externe avec mock"""
        # Configuration du mock
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'success': True, 'id': 123}
        mock_post.return_value = mock_response

        # Appeler la méthode qui fait l'appel API
        connector = self.env['external.connector'].create({
            'name': 'Test Connector',
            'api_url': 'https://api.example.com',
        })

        result = connector.send_data({'test': 'data'})

        # Vérifications
        mock_post.assert_called_once()
        self.assertTrue(result.get('success'))

    @patch('odoo.addons.my_module.models.my_model.datetime')
    def test_with_frozen_time(self, mock_datetime):
        """Test avec date fixée"""
        from datetime import datetime

        fixed_date = datetime(2025, 1, 15, 10, 0, 0)
        mock_datetime.now.return_value = fixed_date

        # Votre test utilisant datetime.now()

    def test_with_context(self):
        """Test avec contexte modifié"""
        partner = self.env['res.partner'].create({
            'name': 'Context Test',
        })

        # Tester avec un contexte spécifique
        partner_with_lang = partner.with_context(lang='fr_FR')
        # Assertions...

        partner_as_user = partner.with_user(self.env.ref('base.user_demo'))
        # Assertions...

    def test_with_company_context(self):
        """Test multi-company"""
        company_a = self.env['res.company'].create({
            'name': 'Company A',
        })
        company_b = self.env['res.company'].create({
            'name': 'Company B',
        })

        # Tester avec Company A
        product_a = self.env['product.product'].with_company(company_a).create({
            'name': 'Product Company A',
        })

        # Tester avec Company B
        product_b = self.env['product.product'].with_company(company_b).create({
            'name': 'Product Company B',
        })

        self.assertEqual(product_a.company_id, company_a)
        self.assertEqual(product_b.company_id, company_b)
```

---

## 5. Commandes de Test

### Lancer les tests

```bash
# Tous les tests du module
pytest addons/my_module/tests/ -v

# Test spécifique
pytest addons/my_module/tests/test_unit.py::TestProductUnit::test_create_product -v

# Tests par tag
pytest -m "integration" -v
pytest -m "not slow" -v

# Avec couverture
pytest --cov=addons/my_module --cov-report=html

# En parallèle
pytest -n 4  # 4 workers

# Verbose avec output
pytest -v -s --tb=long

# Arrêter au premier échec
pytest -x

# Relancer les tests échoués
pytest --lf
```

### Tests Odoo natifs

```bash
# Via odoo-bin
./odoo-bin -d test_db -i my_module --test-enable --stop-after-init

# Tests tagged
./odoo-bin -d test_db --test-tags my_module

# Tests post_install uniquement
./odoo-bin -d test_db --test-tags post_install
```

---

## 6. CI/CD avec GitHub Actions

```yaml
# .github/workflows/tests.yml
name: Odoo Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: odoo
          POSTGRES_PASSWORD: odoo
          POSTGRES_DB: test_db
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
          python-version: '3.11'

      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install pytest pytest-odoo pytest-cov

      - name: Run tests
        run: |
          pytest addons/my_module/tests/ -v --cov=addons/my_module --cov-report=xml
        env:
          ODOO_RC: /path/to/odoo.conf

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage.xml
```

---

## 7. Best Practices

### Checklist Tests

```markdown
## Couverture
- [ ] Tests unitaires pour chaque méthode publique
- [ ] Tests d'intégration pour les workflows complets
- [ ] Tests API pour tous les endpoints
- [ ] Tests de régression pour les bugs corrigés

## Qualité
- [ ] Noms de tests descriptifs
- [ ] Assertions claires et spécifiques
- [ ] Isolation des tests (pas de dépendances)
- [ ] Cleanup après chaque test

## Performance
- [ ] Tests marqués @slow séparés
- [ ] Timeout pour éviter les blocages
- [ ] Données de test minimales

## Maintenance
- [ ] Fixtures réutilisables
- [ ] Helpers pour opérations communes
- [ ] Documentation des cas edge
```
