---
description: Scaffolding module Odoo complet (user)
---

# /odoo-module - Odoo Module Scaffolding

## USAGE
```
/odoo-module "inventory_extension" --version=16
/odoo-module "custom_sales" --type=full
/odoo-module "hr_extension" --minimal
```

## DESCRIPTION
Scaffolding complet d'un module Odoo avec
tous les fichiers necessaires selon le type.

## TYPES DE MODULES

### minimal
Structure minimale
```
module_name/
  __init__.py
  __manifest__.py
  models/
    __init__.py
```

### standard (default)
Structure standard
```
module_name/
  __init__.py
  __manifest__.py
  models/
  views/
  security/
  data/
```

### full
Structure complete
```
module_name/
  __init__.py
  __manifest__.py
  models/
  views/
  security/
  data/
  wizard/
  report/
  controllers/
  static/
  tests/
  i18n/
```

## EXEMPLE COMPLET

```
/odoo-module "custom_inventory" --type=full --version=16
```

### __manifest__.py
```python
{
    'name': 'Custom Inventory',
    'version': '16.0.1.0.0',
    'category': 'Inventory/Inventory',
    'summary': 'Custom inventory management extensions',
    'description': """
        Custom Inventory Module
        =======================
        This module extends inventory functionality.
    """,
    'author': 'Your Company',
    'website': 'https://yourcompany.com',
    'license': 'LGPL-3',
    'depends': [
        'stock',
    ],
    'data': [
        'security/ir.model.access.csv',
        'security/security.xml',
        'views/stock_picking_views.xml',
        'views/menu.xml',
        'data/data.xml',
    ],
    'demo': [
        'demo/demo.xml',
    ],
    'installable': True,
    'application': False,
    'auto_install': False,
}
```

### models/__init__.py
```python
from . import stock_picking
```

### models/stock_picking.py
```python
from odoo import models, fields, api, _
from odoo.exceptions import UserError

class StockPicking(models.Model):
    _inherit = 'stock.picking'

    x_custom_field = fields.Char(
        string='Custom Field',
        help='Add your custom field description'
    )
    x_custom_date = fields.Date(string='Custom Date')
    x_custom_state = fields.Selection([
        ('draft', 'Draft'),
        ('confirmed', 'Confirmed'),
        ('done', 'Done'),
    ], string='Custom State', default='draft')

    def action_custom_method(self):
        """Custom action method"""
        for picking in self:
            if not picking.x_custom_field:
                raise UserError(_('Custom field is required'))
            # Your logic here
        return True
```

### security/ir.model.access.csv
```csv
id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
access_stock_picking_custom,stock.picking.custom,stock.model_stock_picking,stock.group_stock_user,1,1,1,0
```

### views/stock_picking_views.xml
```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <record id="view_picking_form_custom" model="ir.ui.view">
        <field name="name">stock.picking.form.custom</field>
        <field name="model">stock.picking</field>
        <field name="inherit_id" ref="stock.view_picking_form"/>
        <field name="arch" type="xml">
            <xpath expr="//field[@name='origin']" position="after">
                <field name="x_custom_field"/>
                <field name="x_custom_date"/>
                <field name="x_custom_state"/>
            </xpath>
            <xpath expr="//button[@name='action_confirm']" position="after">
                <button name="action_custom_method"
                        string="Custom Action"
                        type="object"
                        class="btn-secondary"/>
            </xpath>
        </field>
    </record>
</odoo>
```

## OPTIONS
| Option | Description |
|--------|-------------|
| --version=X | Version Odoo (14-17) |
| --type=X | minimal, standard, full |
| --inherit=Y | Module a heriter |
| --tests | Inclure tests |

## POST-CREATION

1. Installer module:
```bash
./odoo-bin -d db -i module_name
```

2. Developper:
```bash
./odoo-bin -d db -u module_name --dev=all
```
