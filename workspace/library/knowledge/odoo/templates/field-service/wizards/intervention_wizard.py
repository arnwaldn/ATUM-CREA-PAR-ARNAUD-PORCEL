# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import UserError
from datetime import timedelta


class InterventionScheduleWizard(models.TransientModel):
    """Wizard to schedule or reschedule interventions"""
    _name = 'fsm.intervention.schedule.wizard'
    _description = 'Schedule Intervention Wizard'

    intervention_id = fields.Many2one(
        'fsm.intervention',
        string='Intervention',
        required=True,
    )
    scheduled_date = fields.Datetime(
        string='Scheduled Date',
        required=True,
    )
    duration_planned = fields.Float(
        string='Planned Duration (hours)',
        required=True,
        default=1.0,
    )
    technician_id = fields.Many2one(
        'fsm.technician',
        string='Technician',
        required=True,
    )
    send_notification = fields.Boolean(
        string='Send Notification to Customer',
        default=True,
    )
    notes = fields.Text(
        string='Notes',
    )

    @api.model
    def default_get(self, fields_list):
        res = super().default_get(fields_list)
        active_id = self.env.context.get('active_id')
        if active_id:
            intervention = self.env['fsm.intervention'].browse(active_id)
            res.update({
                'intervention_id': intervention.id,
                'scheduled_date': intervention.scheduled_date or fields.Datetime.now(),
                'duration_planned': intervention.duration_planned or
                                   (intervention.intervention_type_id.default_duration if intervention.intervention_type_id else 1.0),
                'technician_id': intervention.technician_id.id,
            })
        return res

    def action_schedule(self):
        """Schedule the intervention"""
        self.ensure_one()

        # Check technician availability
        if self.technician_id.availability_status == 'unavailable':
            raise UserError(_('The selected technician is not available.'))

        # Update intervention
        self.intervention_id.write({
            'scheduled_date': self.scheduled_date,
            'duration_planned': self.duration_planned,
            'technician_id': self.technician_id.id,
        })

        # Schedule the intervention
        self.intervention_id.action_schedule()

        # Send notification
        if self.send_notification and self.intervention_id.partner_id.email:
            template = self.env.ref('field_service.mail_template_intervention_scheduled', raise_if_not_found=False)
            if template:
                template.send_mail(self.intervention_id.id, force_send=True)

        return {'type': 'ir.actions.act_window_close'}


class InterventionCompleteWizard(models.TransientModel):
    """Wizard to complete an intervention with details"""
    _name = 'fsm.intervention.complete.wizard'
    _description = 'Complete Intervention Wizard'

    intervention_id = fields.Many2one(
        'fsm.intervention',
        string='Intervention',
        required=True,
    )
    end_datetime = fields.Datetime(
        string='End Time',
        required=True,
        default=fields.Datetime.now,
    )
    work_done = fields.Html(
        string='Work Performed',
        required=True,
    )
    resolution_notes = fields.Text(
        string='Resolution Notes',
    )
    request_signature = fields.Boolean(
        string='Request Customer Signature',
        default=True,
    )
    request_feedback = fields.Boolean(
        string='Request Customer Feedback',
        default=True,
    )

    @api.model
    def default_get(self, fields_list):
        res = super().default_get(fields_list)
        active_id = self.env.context.get('active_id')
        if active_id:
            intervention = self.env['fsm.intervention'].browse(active_id)
            res.update({
                'intervention_id': intervention.id,
                'work_done': intervention.work_done,
                'resolution_notes': intervention.resolution_notes,
            })
        return res

    def action_complete(self):
        """Complete the intervention"""
        self.ensure_one()

        self.intervention_id.write({
            'end_datetime': self.end_datetime,
            'work_done': self.work_done,
            'resolution_notes': self.resolution_notes,
        })

        self.intervention_id.action_complete()

        # Send feedback request
        if self.request_feedback and self.intervention_id.partner_id.email:
            template = self.env.ref('field_service.mail_template_intervention_feedback', raise_if_not_found=False)
            if template:
                template.send_mail(self.intervention_id.id, force_send=True)

        return {'type': 'ir.actions.act_window_close'}


class InterventionMassAssignWizard(models.TransientModel):
    """Wizard to mass assign interventions to a technician"""
    _name = 'fsm.intervention.mass.assign.wizard'
    _description = 'Mass Assign Interventions Wizard'

    intervention_ids = fields.Many2many(
        'fsm.intervention',
        string='Interventions',
        required=True,
    )
    technician_id = fields.Many2one(
        'fsm.technician',
        string='Technician',
        required=True,
    )
    optimize_route = fields.Boolean(
        string='Optimize Route Order',
        default=True,
        help='Reorder interventions by proximity (requires GPS coordinates)',
    )

    @api.model
    def default_get(self, fields_list):
        res = super().default_get(fields_list)
        active_ids = self.env.context.get('active_ids', [])
        if active_ids:
            res['intervention_ids'] = [(6, 0, active_ids)]
        return res

    def action_assign(self):
        """Assign selected interventions to technician"""
        self.ensure_one()

        if self.technician_id.availability_status == 'unavailable':
            raise UserError(_('The selected technician is not available.'))

        for intervention in self.intervention_ids:
            if intervention.state == 'draft':
                intervention.write({'technician_id': self.technician_id.id})

        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _('Success'),
                'message': _('%d interventions assigned to %s') % (
                    len(self.intervention_ids), self.technician_id.name
                ),
                'type': 'success',
                'sticky': False,
            }
        }
