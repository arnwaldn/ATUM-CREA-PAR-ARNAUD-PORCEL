===========================
Real Estate Agency Module
===========================

Complete real estate agency and property management for Odoo 17.

Features
========

Property Management
-------------------
* Complete property listings with detailed characteristics
* Multiple property types (apartment, house, villa, commercial, etc.)
* Image gallery with main image selection
* Energy performance (DPE) tracking
* Location with GPS coordinates

Sales Management
----------------
* Simple and exclusive mandates
* Commission management (percentage or fixed)
* Mandate validity and auto-renewal
* Marketing options (online, portals, signage)

Visit Scheduling
----------------
* Calendar integration
* Visitor management
* Interest level tracking
* Follow-up scheduling
* Direct offer creation from visit

Offer Management
----------------
* Full offer workflow (submit, negotiate, accept, reject)
* Counter-offer support
* Financing conditions tracking
* Deposit management
* Automatic expiry handling

Rental Management
-----------------
* Multiple lease types (unfurnished, furnished, mobility, student, commercial)
* Tenant management with employment verification
* Rent and charges tracking
* Deposit management
* Rent review (IRL, ILC, fixed percentage)
* Payment tracking
* Move-in/move-out inventory

Reports
-------
* Property sheet PDF for marketing
* Property portfolio reports

Security
========

The module defines two security groups:

1. **Agent** - Manage assigned properties, visits, offers
2. **Manager** - Full access including configuration and financial data

Installation
============

1. Copy the module to your Odoo addons directory
2. Update the apps list
3. Install "Real Estate Agency Management"

Dependencies:
* base
* mail
* calendar
* account
* portal

Configuration
=============

1. Go to Real Estate → Configuration
2. Create agent users and assign security groups
3. Set up property owners
4. Configure default commission rates

Usage
=====

Property Listing Workflow
-------------------------

1. **Add property** - Real Estate → Properties → Create
2. **Add images** - Upload property photos, set main image
3. **Create mandate** - Set commission, validity, marketing options
4. **Activate mandate** - Property becomes available
5. **Schedule visits** - Track visitor interest
6. **Manage offers** - Negotiate, accept, or reject
7. **Complete sale** - Mark property as sold

Rental Workflow
---------------

1. **List for rent** - Create property with transaction_type='rent'
2. **Screen tenants** - Create tenant records with verification
3. **Create lease** - Set dates, rent, deposit
4. **Activate lease** - After signature and deposit
5. **Track payments** - Record monthly rent
6. **Handle renewal** - Renew or terminate lease

Credits
=======

**Author:** ULTRA-CREATE

**License:** LGPL-3

Changelog
=========

17.0.1.0.0
----------
* Initial release
* Property management
* Mandate and commission tracking
* Visit scheduling
* Offer management
* Lease management
* PDF property sheet
