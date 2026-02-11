=======================
Association Management
=======================

.. |badge1| image:: https://img.shields.io/badge/maturity-Production%2FStable-green.png
    :target: https://odoo-community.org/page/development-status
    :alt: Production/Stable
.. |badge2| image:: https://img.shields.io/badge/licence-LGPL--3-blue.png
    :target: http://www.gnu.org/licenses/lgpl-3.0-standalone.html
    :alt: License: LGPL-3
.. |badge3| image:: https://img.shields.io/badge/github-OCA%2Fvertical--association-lightgray.png?logo=github
    :target: https://github.com/OCA/vertical-association
    :alt: OCA/vertical-association

|badge1| |badge2| |badge3|

Complete association and non-profit organization management for Odoo. This module provides comprehensive tools for managing members, events, activities, donations, and resources for associations, clubs, and non-profit organizations.

**Table of contents**

.. contents::
   :local:

Features
========

Member Management
-----------------

* **Member Registry**: Complete member profiles with personal information, contact details, and emergency contacts
* **Member Types**: Configurable membership types (Regular, Student, Senior, Family, Honorary, etc.)
* **Membership Lifecycle**: Track member status from prospect to active to expired
* **Skills & Interests**: Tag members with skills and interests for volunteer matching
* **Member Statistics**: Track event participation, volunteer hours, and donation history
* **Membership Cards**: Generate printable membership cards (credit card format)

Membership Subscriptions
------------------------

* **Subscription Management**: Track membership periods with start/end dates
* **Automatic Renewals**: Support for auto-renewal memberships
* **Payment Tracking**: Monitor payment status for memberships
* **Expiry Alerts**: Automatic notifications for expiring memberships
* **Renewal Wizard**: Bulk renewal tool for multiple members

Event Management
----------------

* **Event Planning**: Create and manage association events with full details
* **Event Types**: Categorize events (Meetings, Workshops, Conferences, Social, Fundraisers)
* **Venue Management**: Track event locations and facilities
* **Online Events**: Support for virtual events with meeting links
* **Registration System**: Member and non-member registration with capacity tracking
* **Pricing Tiers**: Different pricing for members vs non-members
* **Member-Only Events**: Restrict events to active members
* **Attendance Tracking**: Mark attendance at events
* **Calendar Integration**: Visual calendar view of all events

Activity Management
-------------------

* **Regular Activities**: Manage recurring activities (classes, workshops, clubs)
* **Session Scheduling**: Generate and track individual sessions
* **Attendance Tracking**: Record participant attendance per session
* **Instructor Management**: Assign instructors to activities
* **Capacity Management**: Track enrollment and available spots
* **Multi-level Activities**: Support for beginner, intermediate, advanced levels

Donation & Fundraising
----------------------

* **Donation Tracking**: Record monetary and in-kind donations
* **Anonymous Donations**: Support for anonymous donors
* **Fundraising Campaigns**: Create and track fundraising campaigns with goals
* **Campaign Progress**: Visual progress tracking toward campaign goals
* **Thank You Management**: Track acknowledgment status and send thank you emails
* **Tax Receipts**: Generate annual tax receipts for donors
* **Donation Reports**: Analyze donations by donor, campaign, and period

Resource Management
-------------------

* **Resource Catalog**: Manage equipment, rooms, and other bookable resources
* **Booking System**: Reserve resources with date/time selection
* **Availability Rules**: Configure available hours and days
* **Approval Workflow**: Optional approval requirement for bookings
* **Conflict Detection**: Automatic overlap checking for bookings
* **Pricing Options**: Hourly or daily rates with member discounts

Reporting & Analytics
---------------------

* **Member Statistics**: Active members, growth trends, retention rates
* **Event Analytics**: Registration rates, attendance, popular events
* **Donation Analysis**: Total donations, average gift size, donor retention
* **Financial Reports**: Revenue from memberships, events, and donations

Configuration
=============

After installation, configure the module:

1. **Member Types**: Go to Association > Configuration > Member Types

   - Set annual fees and duration
   - Configure age restrictions if needed
   - Define benefits for each type

2. **Event Types**: Go to Association > Configuration > Event Types

   - Create categories for your events
   - Assign colors for calendar display

3. **Activity Types**: Go to Association > Configuration > Activity Types

   - Define activity categories
   - Set default pricing

4. **Skills & Interests**: Go to Association > Configuration

   - Add skills for volunteer matching
   - Add interests for member profiling

5. **Venues**: Go to Association > Resources > Venues

   - Create your event locations
   - Record capacity and facilities

6. **Security Groups**: Assign users to appropriate groups

   - Association / Member: View own data only
   - Association / Volunteer: Help manage events
   - Association / Officer: Full data access
   - Association / Administrator: Configuration access

Usage
=====

Managing Members
----------------

1. Go to Association > Members > Members
2. Click "Create" to add a new member
3. Fill in personal and contact information
4. Select member type and join date
5. Save and use "Approve" button to activate membership

Creating Events
---------------

1. Go to Association > Events > Events
2. Click "Create" to add a new event
3. Fill in event details:

   - Name and type
   - Venue or online link
   - Start/end dates
   - Registration deadline
   - Capacity limits
   - Pricing for members/non-members

4. Click "Publish" to open registration
5. Use "Take Attendance" to mark attendees

Recording Donations
-------------------

1. Go to Association > Donations > Donations
2. Click "Create" or use the Quick Donation wizard
3. Select donor (member or contact)
4. Enter amount and payment method
5. Mark as received when payment confirmed
6. Send thank you and generate tax receipt as needed

Booking Resources
-----------------

1. Go to Association > Resources > Bookings
2. Use the calendar view to see availability
3. Click to create a booking
4. Select resource, date/time, and purpose
5. Submit for approval if required

Known Issues / Roadmap
======================

* [ ] Portal access for members to view/update their profile
* [ ] Online event registration through website
* [ ] Integration with payment providers for online payments
* [ ] Mobile app for event check-in
* [ ] Volunteer scheduling module
* [ ] Committee and board management

Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/vertical-association/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smashing it by providing detailed feedback.

Credits
=======

Authors
-------

* Your Company Name

Contributors
------------

* Developer Name <developer@example.com>

Maintainers
-----------

This module is maintained by the OCA.

.. image:: https://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: https://odoo-community.org

OCA, or the Odoo Community Association, is a nonprofit organization whose
mission is to support the collaborative development of Odoo features and
promote its widespread use.

This module is part of the `OCA/vertical-association <https://github.com/OCA/vertical-association>`_ project on GitHub.

You are welcome to contribute. To learn how please visit https://odoo-community.org/page/Contribute.
