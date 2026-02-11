---
description: Odoo development (modules, views, models) (user)
---

# /odoo - Odoo Development

## USAGE
```
/odoo module "inventory_extension"
/odoo model "stock.custom.report"
/odoo view "product.template.custom"
/odoo action "generate_report"
/odoo wizard "mass_update"
```

## MODES

### module
Creer module complet
```
/odoo module "my_custom_module"
```

### model
Nouveau modele ou extension
```
/odoo model "sale.order.custom"
```

### view
Vue XML (form, tree, kanban)
```
/odoo view "product.form.custom"
```

### action
Server action
```
/odoo action "send_notification"
```

### wizard
Assistant (transient model)
```
/odoo wizard "product_importer"
```

## STRUCTURE MODULE

```
/odoo module "custom_inventory"
```

Cree:
```
custom_inventory/
  __init__.py
  __manifest__.py
  models/
    __init__.py
    stock_picking.py
  views/
    stock_picking_views.xml
  security/
    ir.model.access.csv
  data/
    data.xml
  static/
    description/
      icon.png
```

## MANIFEST

```python
# __manifest__.py
{
    'name': 'Custom Inventory',
    'version': '16.0.1.0.0',
    'category': 'Inventory',
    'summary': 'Custom inventory extensions',
    'depends': ['stock'],
    'data': [
        'security/ir.model.access.csv',
        'views/stock_picking_views.xml',
    ],
    'installable': True,
    'application': False,
    'auto_install': False,
}
```

## MODEL EXAMPLE

```python
# models/stock_picking.py
from odoo import models, fields, api

class StockPicking(models.Model):
    _inherit = 'stock.picking'

    custom_field = fields.Char(string='Custom Field')
    custom_date = fields.Date(string='Custom Date')

    @api.depends('move_ids')
    def _compute_custom_total(self):
        for picking in self:
            picking.custom_total = sum(picking.move_ids.mapped('quantity_done'))

    custom_total = fields.Float(
        string='Total',
        compute='_compute_custom_total',
        store=True
    )
```

## VIEW EXAMPLE

```xml
<!-- views/stock_picking_views.xml -->
<odoo>
    <record id="view_picking_form_inherit" model="ir.ui.view">
        <field name="name">stock.picking.form.inherit</field>
        <field name="model">stock.picking</field>
        <field name="inherit_id" ref="stock.view_picking_form"/>
        <field name="arch" type="xml">
            <xpath expr="//field[@name='origin']" position="after">
                <field name="custom_field"/>
                <field name="custom_date"/>
            </xpath>
        </field>
    </record>
</odoo>
```

## OPTIONS
| Option | Description |
|--------|-------------|
| --version=X | Version Odoo (14, 15, 16, 17) |
| --enterprise | Features Enterprise |
| --tests | Generer tests |
| --i18n | Fichiers traduction |

## BONNES PRATIQUES ODOO
- Prefixer champs custom
- Utiliser _inherit pas _name pour extensions
- Toujours definir security
- Tests unitaires pour logique business
- Documentation strings

## MCP UTILISES
- Context7 (docs Odoo)
- filesystem (creation module)
