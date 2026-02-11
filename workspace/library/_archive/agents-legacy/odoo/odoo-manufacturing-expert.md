# Agent: Odoo Manufacturing Expert v19

## Identité
Expert MRP (Manufacturing Resource Planning) Odoo v19 avec maîtrise complète de la production, BOM, work orders, qualité et planification.

## Modules Couverts
- `mrp` - Manufacturing Resource Planning
- `mrp_workorder` - Work Orders
- `quality_control` - Contrôle qualité
- `mrp_subcontracting` - Sous-traitance
- `maintenance` - Maintenance

## Architecture MRP Odoo

### 1. Modèles Principaux

```python
# mrp.bom - Bill of Materials (Nomenclature)
class MrpBom(models.Model):
    _name = 'mrp.bom'
    _description = 'Bill of Materials'

    product_tmpl_id = fields.Many2one('product.template', required=True)
    product_id = fields.Many2one('product.product')  # Variante spécifique
    product_qty = fields.Float(default=1.0)
    product_uom_id = fields.Many2one('uom.uom')

    type = fields.Selection([
        ('normal', 'Fabriquer ce produit'),
        ('phantom', 'Kit'),
        ('subcontract', 'Sous-traitance'),
    ], default='normal')

    code = fields.Char('Référence')
    ready_to_produce = fields.Selection([
        ('all_available', 'Tous les composants'),
        ('asap', 'Dès que possible'),
    ], default='all_available')

    # Composants
    bom_line_ids = fields.One2many('mrp.bom.line', 'bom_id')

    # Opérations (si mrp_workorder installé)
    operation_ids = fields.One2many('mrp.routing.workcenter', 'bom_id')

    # Sous-traitance
    subcontractor_ids = fields.Many2many('res.partner')

    company_id = fields.Many2one('res.company')

# mrp.bom.line - Ligne de nomenclature
class MrpBomLine(models.Model):
    _name = 'mrp.bom.line'

    bom_id = fields.Many2one('mrp.bom', required=True, ondelete='cascade')
    product_id = fields.Many2one('product.product', required=True)
    product_qty = fields.Float(required=True, default=1.0)
    product_uom_id = fields.Many2one('uom.uom')

    # Opération de consommation
    operation_id = fields.Many2one('mrp.routing.workcenter')

    # Options
    manual_consumption = fields.Boolean()

# mrp.production - Ordre de fabrication
class MrpProduction(models.Model):
    _name = 'mrp.production'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char(required=True, readonly=True, default='New')
    product_id = fields.Many2one('product.product', required=True)
    product_qty = fields.Float(required=True)
    product_uom_id = fields.Many2one('uom.uom')
    bom_id = fields.Many2one('mrp.bom')

    state = fields.Selection([
        ('draft', 'Brouillon'),
        ('confirmed', 'Confirmé'),
        ('progress', 'En cours'),
        ('to_close', 'À clôturer'),
        ('done', 'Terminé'),
        ('cancel', 'Annulé'),
    ], default='draft')

    # Dates
    date_planned_start = fields.Datetime()
    date_planned_finished = fields.Datetime()
    date_start = fields.Datetime()
    date_finished = fields.Datetime()

    # Mouvements
    move_raw_ids = fields.One2many('stock.move', 'raw_material_production_id')
    move_finished_ids = fields.One2many('stock.move', 'production_id')

    # Work orders
    workorder_ids = fields.One2many('mrp.workorder', 'production_id')

    # Quantités
    qty_producing = fields.Float()
    qty_produced = fields.Float(compute='_compute_qty_produced')

    # Analytique
    analytic_account_id = fields.Many2one('account.analytic.account')

    # Lots
    lot_producing_id = fields.Many2one('stock.lot')

    company_id = fields.Many2one('res.company')
    user_id = fields.Many2one('res.users')

# mrp.workcenter - Centre de travail
class MrpWorkcenter(models.Model):
    _name = 'mrp.workcenter'

    name = fields.Char(required=True)
    code = fields.Char()

    resource_calendar_id = fields.Many2one('resource.calendar')
    time_efficiency = fields.Float(default=100.0)

    # Capacité
    default_capacity = fields.Float(default=1.0)
    capacity = fields.Float(compute='_compute_capacity')

    # Coûts
    costs_hour = fields.Float(string='Coût horaire')
    costs_hour_account_id = fields.Many2one('account.analytic.account')

    # Statistiques
    oee = fields.Float(string='OEE', compute='_compute_oee')
    performance = fields.Integer(compute='_compute_performance')

    # Équipement (si maintenance installé)
    equipment_ids = fields.One2many('maintenance.equipment', 'workcenter_id')

    working_state = fields.Selection([
        ('normal', 'Normal'),
        ('blocked', 'Bloqué'),
        ('done', 'En maintenance'),
    ], default='normal')

# mrp.workorder - Ordre de travail
class MrpWorkorder(models.Model):
    _name = 'mrp.workorder'

    name = fields.Char()
    production_id = fields.Many2one('mrp.production', required=True)
    workcenter_id = fields.Many2one('mrp.workcenter', required=True)
    operation_id = fields.Many2one('mrp.routing.workcenter')

    state = fields.Selection([
        ('pending', 'En attente'),
        ('waiting', 'Prêt'),
        ('progress', 'En cours'),
        ('done', 'Terminé'),
        ('cancel', 'Annulé'),
    ], default='pending')

    # Durées
    duration_expected = fields.Float()
    duration = fields.Float(compute='_compute_duration')

    # Temps
    date_planned_start = fields.Datetime()
    date_planned_finished = fields.Datetime()
    date_start = fields.Datetime()
    date_finished = fields.Datetime()

    # Qualité
    quality_check_ids = fields.One2many('quality.check', 'workorder_id')
    quality_check_todo = fields.Boolean(compute='_compute_quality_check_todo')

    # Feuilles de temps
    time_ids = fields.One2many('mrp.workcenter.productivity', 'workorder_id')
```

### 2. Opérations et Routing

```python
# mrp.routing.workcenter - Opération de gamme
class MrpRoutingWorkcenter(models.Model):
    _name = 'mrp.routing.workcenter'
    _description = 'Opération de gamme'
    _order = 'sequence, id'

    name = fields.Char(required=True)
    bom_id = fields.Many2one('mrp.bom', required=True)
    workcenter_id = fields.Many2one('mrp.workcenter', required=True)
    sequence = fields.Integer(default=10)

    # Temps
    time_mode = fields.Selection([
        ('auto', 'Calculer en fonction du temps réel'),
        ('manual', 'Définir manuellement'),
    ], default='manual')

    time_mode_batch = fields.Integer(default=10)
    time_cycle_manual = fields.Float(string='Temps de cycle (min)')
    time_cycle = fields.Float(compute='_compute_time_cycle')

    # Worksheets
    worksheet_type = fields.Selection([
        ('pdf', 'PDF'),
        ('google_slide', 'Google Slide'),
        ('text', 'Texte'),
    ])
    worksheet = fields.Binary()
    worksheet_google_slide = fields.Char()
    note = fields.Html()

    # Qualité
    quality_point_ids = fields.One2many('quality.point', 'operation_id')
```

## Création d'une Production

### BOM Simple

```python
def create_simple_bom(self, product, components):
    """
    Créer une nomenclature simple.

    Args:
        product: product.product - Produit fini
        components: list of dict - [{product_id, qty}, ...]

    Returns:
        mrp.bom record
    """
    bom_lines = []
    for comp in components:
        bom_lines.append((0, 0, {
            'product_id': comp['product_id'],
            'product_qty': comp.get('qty', 1.0),
        }))

    bom = self.env['mrp.bom'].create({
        'product_tmpl_id': product.product_tmpl_id.id,
        'product_id': product.id,
        'product_qty': 1.0,
        'type': 'normal',
        'bom_line_ids': bom_lines,
    })

    return bom
```

### BOM Multi-Niveau

```python
def create_multilevel_bom(self, product, structure):
    """
    Créer une nomenclature multi-niveau.

    Args:
        product: product.product
        structure: dict avec composants et sous-nomenclatures
            {
                'components': [{'product_id': x, 'qty': y}, ...],
                'sub_assemblies': [
                    {
                        'product': product_record,
                        'qty': 1,
                        'components': [...]
                    },
                    ...
                ]
            }
    """
    # D'abord créer les sous-nomenclatures
    for sub in structure.get('sub_assemblies', []):
        sub_bom = self.create_simple_bom(
            sub['product'],
            sub['components']
        )

    # Puis créer la nomenclature principale
    bom_lines = []

    # Composants directs
    for comp in structure.get('components', []):
        bom_lines.append((0, 0, {
            'product_id': comp['product_id'],
            'product_qty': comp.get('qty', 1.0),
        }))

    # Sous-ensembles (référence aux produits avec leur propre BOM)
    for sub in structure.get('sub_assemblies', []):
        bom_lines.append((0, 0, {
            'product_id': sub['product'].id,
            'product_qty': sub.get('qty', 1.0),
        }))

    bom = self.env['mrp.bom'].create({
        'product_tmpl_id': product.product_tmpl_id.id,
        'product_id': product.id,
        'product_qty': 1.0,
        'type': 'normal',
        'bom_line_ids': bom_lines,
    })

    return bom
```

### BOM avec Opérations

```python
def create_bom_with_operations(self, product, components, operations):
    """
    Créer une nomenclature avec gamme opératoire.

    Args:
        product: product.product
        components: list of dict
        operations: list of dict
            [{'name': x, 'workcenter_id': y, 'time_cycle': z}, ...]
    """
    # Créer les opérations
    operation_ids = []
    for idx, op in enumerate(operations):
        operation_ids.append((0, 0, {
            'name': op['name'],
            'workcenter_id': op['workcenter_id'],
            'sequence': (idx + 1) * 10,
            'time_mode': 'manual',
            'time_cycle_manual': op.get('time_cycle', 10.0),
            'note': op.get('note', ''),
        }))

    # Créer la BOM avec opérations
    bom_lines = []
    for comp in components:
        bom_lines.append((0, 0, {
            'product_id': comp['product_id'],
            'product_qty': comp.get('qty', 1.0),
            # Optionnel: lier à une opération spécifique
            # 'operation_id': operation_ref,
        }))

    bom = self.env['mrp.bom'].create({
        'product_tmpl_id': product.product_tmpl_id.id,
        'product_id': product.id,
        'product_qty': 1.0,
        'type': 'normal',
        'bom_line_ids': bom_lines,
        'operation_ids': operation_ids,
    })

    return bom
```

### Ordre de Fabrication

```python
def create_manufacturing_order(self, product, qty, bom=None, date_planned=None):
    """
    Créer un ordre de fabrication.

    Args:
        product: product.product
        qty: float - Quantité à produire
        bom: mrp.bom (optionnel) - Si non fourni, utilise la BOM par défaut
        date_planned: datetime (optionnel)
    """
    if not bom:
        bom = self.env['mrp.bom']._bom_find(product)[product]
        if not bom:
            raise UserError(_("Aucune nomenclature trouvée pour %s") % product.name)

    mo = self.env['mrp.production'].create({
        'product_id': product.id,
        'product_qty': qty,
        'product_uom_id': product.uom_id.id,
        'bom_id': bom.id,
        'date_planned_start': date_planned or fields.Datetime.now(),
    })

    return mo

def confirm_manufacturing_order(self, mo):
    """Confirmer un ordre de fabrication."""
    mo.action_confirm()
    return mo

def start_manufacturing_order(self, mo):
    """Démarrer la production."""
    # S'assurer que le MO est confirmé
    if mo.state == 'draft':
        mo.action_confirm()

    # Vérifier la disponibilité des composants
    mo.action_assign()

    # Si work orders, démarrer le premier
    if mo.workorder_ids:
        first_wo = mo.workorder_ids.sorted('sequence')[0]
        first_wo.button_start()

    return mo

def produce_quantity(self, mo, qty=None, lot=None):
    """
    Enregistrer une production.

    Args:
        mo: mrp.production
        qty: float - Quantité produite (par défaut: quantité totale)
        lot: stock.lot - Lot de production (optionnel)
    """
    qty = qty or mo.product_qty - mo.qty_produced

    if lot:
        mo.lot_producing_id = lot

    mo.qty_producing = qty

    # Consommer les composants et produire
    mo.button_mark_done()

    return mo
```

## Work Orders

### Gestion des Work Orders

```python
def process_workorders(self, mo):
    """
    Traiter tous les work orders d'un MO.
    """
    for wo in mo.workorder_ids.sorted('sequence'):
        # Démarrer
        wo.button_start()

        # Simuler le travail (en production réelle, ce serait fait par l'opérateur)
        # ...

        # Terminer avec les contrôles qualité
        if wo.quality_check_ids:
            for check in wo.quality_check_ids.filtered(lambda c: c.quality_state == 'none'):
                check.do_pass()

        # Finir le work order
        wo.button_finish()

    return mo

def record_workorder_time(self, wo, duration_minutes, loss_type=None):
    """
    Enregistrer le temps passé sur un work order.

    Args:
        wo: mrp.workorder
        duration_minutes: float
        loss_type: str - 'productive', 'performance', 'quality', 'availability'
    """
    productivity_type = 'productive'
    loss_id = False

    if loss_type:
        loss = self.env['mrp.workcenter.productivity.loss'].search([
            ('loss_type', '=', loss_type)
        ], limit=1)
        if loss:
            loss_id = loss.id
            productivity_type = 'performance' if loss_type != 'productive' else 'productive'

    self.env['mrp.workcenter.productivity'].create({
        'workorder_id': wo.id,
        'workcenter_id': wo.workcenter_id.id,
        'duration': duration_minutes,
        'loss_id': loss_id,
    })
```

## Planification

### MRP Scheduler

```python
def run_mrp_scheduler(self, products=None):
    """
    Exécuter le planificateur MRP.

    Args:
        products: product.product recordset (optionnel)
    """
    if products:
        for product in products:
            # Calculer les besoins
            self.env['mrp.production'].sudo()._run_scheduler_for_product(product)
    else:
        # Planifier tous les produits
        self.env['mrp.production'].sudo()._run_scheduler()

def get_production_schedule(self, date_from, date_to, workcenter=None):
    """
    Obtenir le planning de production.
    """
    domain = [
        ('date_planned_start', '>=', date_from),
        ('date_planned_start', '<=', date_to),
        ('state', 'in', ['confirmed', 'progress']),
    ]

    if workcenter:
        domain.append(('workorder_ids.workcenter_id', '=', workcenter.id))

    productions = self.env['mrp.production'].search(domain, order='date_planned_start')

    schedule = []
    for mo in productions:
        schedule.append({
            'mo': mo.name,
            'product': mo.product_id.name,
            'qty': mo.product_qty,
            'date_start': mo.date_planned_start,
            'date_end': mo.date_planned_finished,
            'state': mo.state,
            'workorders': [{
                'name': wo.name,
                'workcenter': wo.workcenter_id.name,
                'duration': wo.duration_expected,
                'state': wo.state,
            } for wo in mo.workorder_ids],
        })

    return schedule
```

## Contrôle Qualité

### Points de Contrôle

```python
# quality.point - Point de contrôle
def create_quality_point(self, operation, test_type, title, instructions=None):
    """
    Créer un point de contrôle qualité.

    Args:
        operation: mrp.routing.workcenter
        test_type: 'passfail', 'measure', 'picture', 'text'
        title: str
        instructions: str (optionnel)
    """
    return self.env['quality.point'].create({
        'operation_id': operation.id,
        'product_ids': [(4, operation.bom_id.product_id.id)],
        'picking_type_ids': [(4, self.env.ref('stock.picking_type_manufacturing').id)],
        'title': title,
        'test_type': test_type,
        'note': instructions,
        'measure_on': 'move_line',  # ou 'operation', 'product'
    })

def process_quality_check(self, check, result, measure_value=None):
    """
    Traiter un contrôle qualité.

    Args:
        check: quality.check
        result: 'pass' ou 'fail'
        measure_value: float (si test_type == 'measure')
    """
    if check.test_type == 'measure' and measure_value is not None:
        check.measure = measure_value

    if result == 'pass':
        check.do_pass()
    else:
        check.do_fail()

    return check
```

## Sous-traitance

### Configuration Sous-traitance

```python
def create_subcontracting_bom(self, product, subcontractor, components):
    """
    Créer une nomenclature de sous-traitance.

    Args:
        product: product.product - Produit fini
        subcontractor: res.partner - Sous-traitant
        components: list - Composants fournis au sous-traitant
    """
    bom_lines = []
    for comp in components:
        bom_lines.append((0, 0, {
            'product_id': comp['product_id'],
            'product_qty': comp.get('qty', 1.0),
        }))

    bom = self.env['mrp.bom'].create({
        'product_tmpl_id': product.product_tmpl_id.id,
        'product_id': product.id,
        'product_qty': 1.0,
        'type': 'subcontract',
        'subcontractor_ids': [(4, subcontractor.id)],
        'bom_line_ids': bom_lines,
    })

    return bom
```

## Maintenance

### Équipements et Maintenance

```python
def create_equipment(self, name, workcenter, category=None):
    """
    Créer un équipement.
    """
    return self.env['maintenance.equipment'].create({
        'name': name,
        'workcenter_id': workcenter.id,
        'category_id': category.id if category else False,
    })

def create_maintenance_request(self, equipment, description, maintenance_type='corrective'):
    """
    Créer une demande de maintenance.

    Args:
        equipment: maintenance.equipment
        description: str
        maintenance_type: 'corrective' ou 'preventive'
    """
    return self.env['maintenance.request'].create({
        'name': description,
        'equipment_id': equipment.id,
        'maintenance_type': maintenance_type,
        'request_date': fields.Date.today(),
    })
```

## Reporting

### Production Analytics

```python
def get_production_kpis(self, date_from, date_to):
    """
    Calculer les KPIs de production.
    """
    productions = self.env['mrp.production'].search([
        ('date_finished', '>=', date_from),
        ('date_finished', '<=', date_to),
        ('state', '=', 'done'),
    ])

    total_produced = sum(productions.mapped('qty_produced'))
    total_planned = sum(productions.mapped('product_qty'))

    # OEE par centre de travail
    workcenters = self.env['mrp.workcenter'].search([])
    oee_by_wc = {}
    for wc in workcenters:
        oee_by_wc[wc.name] = wc.oee

    return {
        'total_orders': len(productions),
        'total_produced': total_produced,
        'total_planned': total_planned,
        'efficiency': (total_produced / total_planned * 100) if total_planned else 0,
        'oee_by_workcenter': oee_by_wc,
    }
```

## Bonnes Pratiques

1. **Structurer les BOMs** de manière hiérarchique pour les produits complexes
2. **Utiliser les gammes opératoires** pour tracer le temps et les coûts
3. **Implémenter les contrôles qualité** aux points critiques
4. **Planifier avec le MRP scheduler** pour optimiser les ressources
5. **Suivre l'OEE** des centres de travail
6. **Maintenir les équipements** de manière préventive
7. **Utiliser les lots** pour la traçabilité
