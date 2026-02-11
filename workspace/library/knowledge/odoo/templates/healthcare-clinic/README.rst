========================
Healthcare Clinic Module
========================

Complete clinic and medical practice management for Odoo 17.

Features
========

Patient Management
------------------
* Patient registration with demographics
* Medical history tracking
* Allergies and chronic conditions
* Emergency contacts
* Insurance information
* RGPD-compliant data handling

Appointment Scheduling
----------------------
* Calendar integration
* Appointment types (consultation, follow-up, procedure, emergency)
* Status workflow (draft → confirmed → arrived → in progress → done)
* No-show tracking
* Rescheduling wizard
* Conflict detection

Medical Consultations
---------------------
* Vital signs recording (weight, height, BMI, BP, HR, SpO2)
* Chief complaint and history
* Physical examination notes
* Diagnosis with ICD-10 codes
* Treatment plans
* Follow-up scheduling

Prescription Management
-----------------------
* Medication database with dosage defaults
* Prescription lines with detailed instructions
* Validity periods and renewal tracking
* PDF prescription printing
* Dispensing workflow
* Generic substitution controls

Billing
-------
* Consultation fees
* Invoice generation
* Integration with Odoo Accounting

Security
========

The module defines four security groups:

1. **Receptionist** - Manage appointments and basic patient info
2. **Nurse** - Record vital signs, assist consultations
3. **Practitioner** - Full clinical access, prescriptions
4. **Manager** - Full access including configuration

Installation
============

1. Copy the module to your Odoo addons directory
2. Update the apps list
3. Install "Healthcare Clinic Management"

Dependencies:
* base
* mail
* calendar
* account
* product
* portal

Configuration
=============

1. Go to Healthcare → Configuration → Practitioners
2. Create practitioner profiles and link to Odoo users
3. Configure medication database as needed
4. Set up ICD-10 condition codes

Usage
=====

Daily Workflow
--------------

1. **Register patients** - Healthcare → Patients → Create
2. **Schedule appointments** - Healthcare → Appointments → Calendar view
3. **Check-in patients** - Mark as "Arrived" when patient arrives
4. **Start consultation** - Opens consultation form with patient context
5. **Record consultation** - Vital signs, examination, diagnosis
6. **Prescribe medications** - Create prescription from consultation
7. **Complete visit** - Mark consultation done, generate invoice if needed

Credits
=======

**Author:** ULTRA-CREATE

**License:** LGPL-3

Changelog
=========

17.0.1.0.0
----------
* Initial release
* Patient management
* Appointment scheduling
* Consultations with vital signs
* Prescription management with PDF reports
* Invoice integration
