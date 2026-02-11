# Odoo OWL Frontend Guide

## Vue d'ensemble

Guide complet pour développer des interfaces frontend Odoo avec le framework OWL (Odoo Web Library) v2.x.

---

## 1. Introduction à OWL

### Architecture OWL dans Odoo

```
Odoo Web Client
├── Core Services (notification, rpc, orm, ...)
├── Components Registry
├── Actions & Views
│   ├── Form View
│   ├── List View
│   ├── Kanban View
│   └── Custom Views
└── OWL Framework
    ├── Components
    ├── Hooks
    ├── Reactivity (useState, useRef)
    └── Templates (QWeb)
```

### Structure des Fichiers JavaScript

```
my_module/
├── static/
│   └── src/
│       ├── js/
│       │   ├── components/
│       │   │   ├── my_component.js
│       │   │   └── my_widget.js
│       │   ├── views/
│       │   │   └── my_custom_view.js
│       │   └── services/
│       │       └── my_service.js
│       ├── xml/
│       │   └── my_templates.xml
│       └── scss/
│           └── my_styles.scss
└── __manifest__.py
```

---

## 2. Composants OWL de Base

### Composant Simple

```javascript
/** @odoo-module **/

import { Component, useState, useRef } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";

export class MyComponent extends Component {
    static template = "my_module.MyComponent";
    static props = {
        title: { type: String, optional: true },
        items: { type: Array },
        onItemClick: { type: Function, optional: true },
    };
    static defaultProps = {
        title: "Default Title",
    };

    setup() {
        // Services Odoo
        this.notification = useService("notification");
        this.orm = useService("orm");
        this.action = useService("action");
        this.rpc = useService("rpc");

        // État réactif
        this.state = useState({
            count: 0,
            loading: false,
            data: [],
        });

        // Références DOM
        this.inputRef = useRef("inputElement");
    }

    // Méthodes
    increment() {
        this.state.count++;
    }

    async loadData() {
        this.state.loading = true;
        try {
            const data = await this.orm.searchRead(
                "res.partner",
                [["is_company", "=", true]],
                ["name", "email"],
                { limit: 10 }
            );
            this.state.data = data;
        } catch (error) {
            this.notification.add("Error loading data", { type: "danger" });
        } finally {
            this.state.loading = false;
        }
    }

    onItemClicked(item) {
        this.props.onItemClick?.(item);
    }

    get formattedCount() {
        return `Count: ${this.state.count}`;
    }
}

// Template QWeb
MyComponent.template = xml`
    <div class="my-component">
        <h2 t-esc="props.title"/>
        <p t-esc="formattedCount"/>
        <button class="btn btn-primary" t-on-click="increment">
            Increment
        </button>
        <button class="btn btn-secondary" t-on-click="loadData">
            Load Data
        </button>

        <div t-if="state.loading" class="spinner-border"/>

        <ul t-else="">
            <li t-foreach="state.data" t-as="item" t-key="item.id">
                <span t-on-click="() => this.onItemClicked(item)">
                    <t t-esc="item.name"/>
                </span>
            </li>
        </ul>

        <input t-ref="inputElement" type="text" class="form-control"/>
    </div>
`;
```

### Template XML Séparé

```xml
<?xml version="1.0" encoding="UTF-8"?>
<templates xml:space="preserve">

    <t t-name="my_module.MyComponent">
        <div class="my-component">
            <h2 t-esc="props.title"/>

            <div class="d-flex gap-2 mb-3">
                <button class="btn btn-primary" t-on-click="increment">
                    <i class="fa fa-plus"/> Increment (<t t-esc="state.count"/>)
                </button>
                <button class="btn btn-secondary" t-on-click="loadData" t-att-disabled="state.loading">
                    <t t-if="state.loading">
                        <span class="spinner-border spinner-border-sm"/>
                    </t>
                    <t t-else="">Load Data</t>
                </button>
            </div>

            <t t-if="state.data.length">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr t-foreach="state.data" t-as="item" t-key="item.id">
                            <td t-esc="item.name"/>
                            <td t-esc="item.email"/>
                            <td>
                                <button class="btn btn-sm btn-info" t-on-click="() => this.onItemClicked(item)">
                                    View
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </t>
            <t t-else="">
                <p class="text-muted">No data loaded</p>
            </t>
        </div>
    </t>

</templates>
```

---

## 3. Hooks OWL

### Hooks Natifs

```javascript
/** @odoo-module **/

import {
    Component,
    useState,
    useRef,
    useEffect,
    onWillStart,
    onMounted,
    onWillUpdateProps,
    onWillUnmount,
    onPatched,
    onWillRender,
    onRendered,
} from "@odoo/owl";

export class HooksDemo extends Component {
    static template = "my_module.HooksDemo";

    setup() {
        // État réactif
        this.state = useState({
            value: 0,
            items: [],
        });

        // Référence DOM
        this.containerRef = useRef("container");

        // onWillStart: avant le premier rendu (async supporté)
        onWillStart(async () => {
            console.log("Component will start");
            // Charger des données initiales
            this.state.items = await this.loadInitialData();
        });

        // onMounted: après le premier rendu dans le DOM
        onMounted(() => {
            console.log("Component mounted");
            // Accès au DOM possible
            const container = this.containerRef.el;
            // Initialiser des listeners externes
            this.observer = new ResizeObserver(() => this.onResize());
            this.observer.observe(container);
        });

        // onWillUpdateProps: quand les props vont changer
        onWillUpdateProps((nextProps) => {
            console.log("Props will update", nextProps);
        });

        // onPatched: après chaque re-rendu
        onPatched(() => {
            console.log("Component patched (re-rendered)");
        });

        // onWillUnmount: avant destruction
        onWillUnmount(() => {
            console.log("Component will unmount");
            // Cleanup
            this.observer?.disconnect();
        });

        // useEffect: réagir aux changements
        useEffect(
            () => {
                console.log("Value changed:", this.state.value);
                // Cleanup function (optionnel)
                return () => {
                    console.log("Cleaning up previous effect");
                };
            },
            () => [this.state.value] // Dépendances
        );
    }

    async loadInitialData() {
        // Simulation
        return [1, 2, 3];
    }

    onResize() {
        console.log("Container resized");
    }
}
```

### Hooks Odoo

```javascript
/** @odoo-module **/

import { Component, useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { useBus } from "@web/core/utils/hooks";
import { useDebounced } from "@web/core/utils/timing";
import { useAutofocus } from "@web/core/utils/hooks";

export class OdooHooksDemo extends Component {
    static template = "my_module.OdooHooksDemo";

    setup() {
        // Services Odoo
        this.orm = useService("orm");
        this.notification = useService("notification");
        this.dialog = useService("dialog");
        this.action = useService("action");
        this.user = useService("user");
        this.company = useService("company");
        this.title = useService("title");

        // Bus de messagerie
        useBus(this.env.bus, "SOME_EVENT", (ev) => {
            console.log("Event received:", ev.detail);
        });

        // Debounce pour la recherche
        this.debouncedSearch = useDebounced(this.search.bind(this), 300);

        // Autofocus sur un input
        useAutofocus({ refName: "searchInput" });

        this.state = useState({
            searchTerm: "",
            results: [],
        });
    }

    async search() {
        if (!this.state.searchTerm) {
            this.state.results = [];
            return;
        }

        const results = await this.orm.searchRead(
            "res.partner",
            [["name", "ilike", this.state.searchTerm]],
            ["name", "email"],
            { limit: 20 }
        );
        this.state.results = results;
    }

    onSearchInput(ev) {
        this.state.searchTerm = ev.target.value;
        this.debouncedSearch();
    }

    async openPartner(partnerId) {
        await this.action.doAction({
            type: "ir.actions.act_window",
            res_model: "res.partner",
            res_id: partnerId,
            views: [[false, "form"]],
            target: "current",
        });
    }

    showNotification() {
        this.notification.add("This is a notification!", {
            type: "success", // info, warning, danger, success
            sticky: false,
            title: "Success",
        });
    }

    async confirmAction() {
        return new Promise((resolve) => {
            this.dialog.add(ConfirmationDialog, {
                body: "Are you sure?",
                confirm: () => {
                    resolve(true);
                },
                cancel: () => {
                    resolve(false);
                },
            });
        });
    }
}
```

---

## 4. Widgets de Champs

### Widget Personnalisé

```javascript
/** @odoo-module **/

import { Component, useState } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { standardFieldProps } from "@web/views/fields/standard_field_props";
import { useInputField } from "@web/views/fields/input_field_hook";

export class ColorPickerField extends Component {
    static template = "my_module.ColorPickerField";
    static props = {
        ...standardFieldProps,
    };

    setup() {
        useInputField({
            getValue: () => this.props.record.data[this.props.name] || "#000000",
            refName: "colorInput",
        });

        this.state = useState({
            showPicker: false,
        });
    }

    get value() {
        return this.props.record.data[this.props.name] || "#000000";
    }

    onChange(ev) {
        this.props.record.update({ [this.props.name]: ev.target.value });
    }

    togglePicker() {
        this.state.showPicker = !this.state.showPicker;
    }
}

ColorPickerField.template = xml`
    <div class="color-picker-field">
        <div class="d-flex align-items-center gap-2">
            <div
                class="color-preview"
                t-att-style="'background-color: ' + value + '; width: 30px; height: 30px; border-radius: 4px; cursor: pointer;'"
                t-on-click="togglePicker"
            />
            <input
                t-ref="colorInput"
                type="color"
                class="form-control form-control-color"
                t-att-value="value"
                t-on-change="onChange"
                t-att-readonly="props.readonly"
            />
            <span t-esc="value"/>
        </div>
    </div>
`;

// Enregistrer le widget
registry.category("fields").add("color_picker", {
    component: ColorPickerField,
    supportedTypes: ["char"],
});
```

### Widget Many2One Personnalisé

```javascript
/** @odoo-module **/

import { Component, useState } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { Many2OneField } from "@web/views/fields/many2one/many2one_field";
import { useService } from "@web/core/utils/hooks";

export class EnhancedMany2OneField extends Many2OneField {
    static template = "my_module.EnhancedMany2OneField";

    setup() {
        super.setup();
        this.orm = useService("orm");
        this.state = useState({
            extraInfo: null,
        });
    }

    async onRecordSelected(record) {
        await super.onRecordSelected(record);

        // Charger des infos supplémentaires
        if (record.id) {
            const [data] = await this.orm.read(
                this.props.relation,
                [record.id],
                ["email", "phone", "city"]
            );
            this.state.extraInfo = data;
        }
    }

    get displayExtraInfo() {
        return this.state.extraInfo && this.props.record.data[this.props.name];
    }
}

EnhancedMany2OneField.template = xml`
    <div class="enhanced-many2one">
        <t t-call="web.Many2OneField"/>
        <div t-if="displayExtraInfo" class="extra-info text-muted small mt-1">
            <span t-if="state.extraInfo.email">
                <i class="fa fa-envelope"/> <t t-esc="state.extraInfo.email"/>
            </span>
            <span t-if="state.extraInfo.phone" class="ms-2">
                <i class="fa fa-phone"/> <t t-esc="state.extraInfo.phone"/>
            </span>
        </div>
    </div>
`;

registry.category("fields").add("enhanced_many2one", {
    component: EnhancedMany2OneField,
    supportedTypes: ["many2one"],
});
```

---

## 5. Vues Personnalisées

### Vue Client Action

```javascript
/** @odoo-module **/

import { Component, useState, onWillStart } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { Layout } from "@web/search/layout";
import { useSetupView } from "@web/views/view_hook";

export class MyDashboard extends Component {
    static template = "my_module.MyDashboard";
    static components = { Layout };

    setup() {
        this.orm = useService("orm");
        this.action = useService("action");

        this.state = useState({
            stats: {},
            loading: true,
        });

        onWillStart(async () => {
            await this.loadStats();
        });
    }

    async loadStats() {
        this.state.loading = true;
        try {
            // Appel RPC personnalisé
            const stats = await this.orm.call(
                "my.model",
                "get_dashboard_stats",
                [],
                {}
            );
            this.state.stats = stats;
        } finally {
            this.state.loading = false;
        }
    }

    async openRecords(domain) {
        await this.action.doAction({
            type: "ir.actions.act_window",
            name: "Records",
            res_model: "my.model",
            views: [[false, "list"], [false, "form"]],
            domain: domain,
            target: "current",
        });
    }

    get display() {
        return {
            controlPanel: {},
        };
    }
}

MyDashboard.template = xml`
    <Layout display="display">
        <div class="o_my_dashboard">
            <div t-if="state.loading" class="text-center p-5">
                <div class="spinner-border"/>
            </div>
            <div t-else="" class="container-fluid">
                <div class="row g-4">
                    <div class="col-md-4">
                        <div class="card bg-primary text-white">
                            <div class="card-body">
                                <h5 class="card-title">Total Records</h5>
                                <h2 t-esc="state.stats.total"/>
                                <button class="btn btn-light btn-sm" t-on-click="() => this.openRecords([])">
                                    View All
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card bg-success text-white">
                            <div class="card-body">
                                <h5 class="card-title">Completed</h5>
                                <h2 t-esc="state.stats.done"/>
                                <button class="btn btn-light btn-sm" t-on-click="() => this.openRecords([['state', '=', 'done']])">
                                    View
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card bg-warning">
                            <div class="card-body">
                                <h5 class="card-title">Pending</h5>
                                <h2 t-esc="state.stats.pending"/>
                                <button class="btn btn-dark btn-sm" t-on-click="() => this.openRecords([['state', '=', 'draft']])">
                                    View
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Layout>
`;

// Enregistrer comme action client
registry.category("actions").add("my_module.dashboard", MyDashboard);
```

### Extension de Vue Existante

```javascript
/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { FormController } from "@web/views/form/form_controller";
import { ListController } from "@web/views/list/list_controller";

// Patcher le contrôleur Form
patch(FormController.prototype, {
    setup() {
        super.setup();
        console.log("Form controller patched!");
    },

    async onRecordSaved(record) {
        await super.onRecordSaved(record);
        // Action personnalisée après sauvegarde
        if (record.resModel === "my.model") {
            this.notification.add("Record saved successfully!", {
                type: "success",
            });
        }
    },
});

// Ajouter un bouton dans la toolbar
patch(ListController.prototype, {
    setup() {
        super.setup();
        // Ajouter des actions au setup si nécessaire
    },

    getStaticActionMenuItems() {
        const menuItems = super.getStaticActionMenuItems();

        // Ajouter une action personnalisée
        if (this.props.resModel === "my.model") {
            menuItems.push({
                key: "export_custom",
                description: "Custom Export",
                callback: () => this.customExport(),
            });
        }

        return menuItems;
    },

    async customExport() {
        const selectedRecords = await this.getSelectedResIds();
        // Logique d'export personnalisée
        console.log("Exporting records:", selectedRecords);
    },
});
```

---

## 6. Manifest Assets

```python
# __manifest__.py
{
    "name": "My Module",
    "version": "17.0.1.0.0",
    # ...
    "assets": {
        # Assets backend (web client)
        "web.assets_backend": [
            # JavaScript
            "my_module/static/src/js/**/*.js",
            # Templates XML
            "my_module/static/src/xml/**/*.xml",
            # Styles SCSS
            "my_module/static/src/scss/**/*.scss",
        ],
        # Assets frontend (website)
        "web.assets_frontend": [
            "my_module/static/src/frontend/**/*.js",
            "my_module/static/src/frontend/**/*.scss",
        ],
        # Assets spécifiques au Point of Sale
        "point_of_sale._assets_pos": [
            "my_module/static/src/pos/**/*.js",
            "my_module/static/src/pos/**/*.xml",
        ],
        # Tests QUnit
        "web.assets_tests": [
            "my_module/static/tests/**/*.js",
        ],
    },
}
```

---

## 7. Services Personnalisés

```javascript
/** @odoo-module **/

import { registry } from "@web/core/registry";
import { reactive } from "@odoo/owl";

// Définir un service personnalisé
const myService = {
    dependencies: ["orm", "notification"],

    start(env, { orm, notification }) {
        const state = reactive({
            cart: [],
            total: 0,
        });

        function addToCart(product) {
            state.cart.push(product);
            state.total += product.price;
            notification.add(`Added ${product.name} to cart`, { type: "info" });
        }

        function removeFromCart(index) {
            const product = state.cart[index];
            state.total -= product.price;
            state.cart.splice(index, 1);
        }

        async function checkout() {
            if (state.cart.length === 0) {
                notification.add("Cart is empty!", { type: "warning" });
                return;
            }

            await orm.create("sale.order", [{
                // ... order data
            }]);

            state.cart = [];
            state.total = 0;
            notification.add("Order created successfully!", { type: "success" });
        }

        return {
            state,
            addToCart,
            removeFromCart,
            checkout,
        };
    },
};

registry.category("services").add("myCart", myService);

// Utilisation dans un composant
// const cart = useService("myCart");
// cart.addToCart({ name: "Product", price: 100 });
```

---

## 8. Bonnes Pratiques OWL

### Checklist Frontend

```markdown
## Structure
- [ ] Composants dans static/src/js/components/
- [ ] Templates dans static/src/xml/
- [ ] Styles dans static/src/scss/
- [ ] Assets déclarés dans manifest

## Code
- [ ] /** @odoo-module **/ en première ligne
- [ ] Props validées avec static props
- [ ] Services utilisés via useService()
- [ ] Cleanup dans onWillUnmount

## Performance
- [ ] Éviter les re-renders inutiles
- [ ] Utiliser useDebounced pour les inputs
- [ ] Lazy loading pour les gros composants

## Accessibilité
- [ ] Attributs ARIA appropriés
- [ ] Navigation clavier supportée
- [ ] Contrastes de couleurs respectés
```

---

## 9. Patterns OWL Avancés

### 9.1 useService Complet

```javascript
/** @odoo-module **/

import { Component, useState, onWillStart } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

export class AdvancedComponent extends Component {
    static template = "module.AdvancedComponent";
    static props = {
        recordId: { type: Number },
        modelName: { type: String },
    };

    setup() {
        // Services Odoo essentiels
        this.orm = useService("orm");                    // Accès base de données
        this.notification = useService("notification");  // Notifications toast
        this.action = useService("action");              // Actions Odoo
        this.dialog = useService("dialog");              // Dialogues modaux
        this.user = useService("user");                  // Info utilisateur
        this.rpc = useService("rpc");                    // Appels RPC bruts
        this.router = useService("router");              // Routage
        this.company = useService("company");            // Société active

        // State réactif
        this.state = useState({
            record: null,
            loading: true,
            error: null,
        });

        // Chargement initial
        onWillStart(async () => {
            await this.loadRecord();
        });
    }

    async loadRecord() {
        try {
            const [record] = await this.orm.read(
                this.props.modelName,
                [this.props.recordId],
                ["name", "state", "partner_id", "amount_total"]
            );
            this.state.record = record;
        } catch (error) {
            this.state.error = error.message;
            this.notification.add("Erreur de chargement", { type: "danger" });
        } finally {
            this.state.loading = false;
        }
    }

    async onSave() {
        await this.orm.write(
            this.props.modelName,
            [this.props.recordId],
            { state: "confirmed" }
        );
        this.notification.add("Enregistré!", { type: "success" });
    }

    async onOpenPartner() {
        await this.action.doAction({
            type: "ir.actions.act_window",
            res_model: "res.partner",
            res_id: this.state.record.partner_id[0],
            views: [[false, "form"]],
            target: "current",
        });
    }
}
```

### 9.2 ORM Service Patterns

```javascript
/** @odoo-module **/

import { Component, useState, onWillStart } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

export class ORMExamples extends Component {
    static template = "module.ORMExamples";

    setup() {
        this.orm = useService("orm");
        this.state = useState({ records: [], count: 0 });

        onWillStart(async () => {
            await this.examples();
        });
    }

    async examples() {
        // searchRead - Recherche + lecture en un appel
        const partners = await this.orm.searchRead(
            "res.partner",
            [["is_company", "=", true], ["country_id.code", "=", "FR"]],
            ["name", "email", "phone", "city"],
            { limit: 10, order: "name asc" }
        );

        // searchCount - Compter les enregistrements
        const count = await this.orm.searchCount(
            "res.partner",
            [["is_company", "=", true]]
        );

        // read - Lire par IDs
        const records = await this.orm.read(
            "res.partner",
            [1, 2, 3],
            ["name", "email"]
        );

        // create - Créer un enregistrement
        const newId = await this.orm.create("res.partner", {
            name: "Nouveau Client",
            email: "client@example.com",
            is_company: true,
        });

        // write - Mettre à jour
        await this.orm.write("res.partner", [newId], {
            phone: "+33 1 23 45 67 89",
        });

        // unlink - Supprimer
        // await this.orm.unlink("res.partner", [newId]);

        // call - Appeler une méthode Python
        const result = await this.orm.call(
            "res.partner",
            "custom_method",
            [[1, 2, 3]],
            { context: { key: "value" } }
        );

        // readGroup - Agrégation
        const grouped = await this.orm.readGroup(
            "sale.order",
            [["state", "=", "sale"]],
            ["partner_id", "amount_total:sum"],
            ["partner_id"],
            { orderby: "amount_total desc", limit: 5 }
        );

        this.state.records = partners;
        this.state.count = count;
    }
}
```

### 9.3 useEffect avec Dependencies

```javascript
/** @odoo-module **/

import { Component, useState, useRef, useEffect, onMounted, onWillUnmount } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

export class EffectComponent extends Component {
    static template = "module.EffectComponent";

    setup() {
        this.orm = useService("orm");
        this.inputRef = useRef("searchInput");

        this.state = useState({
            searchTerm: "",
            results: [],
            selectedId: null,
        });

        // Effect qui se déclenche quand searchTerm change
        useEffect(
            () => {
                this.performSearch();
            },
            () => [this.state.searchTerm]  // Dependencies
        );

        // Effect qui se déclenche quand selectedId change
        useEffect(
            () => {
                if (this.state.selectedId) {
                    this.loadDetails();
                }
                // Cleanup function (optionnel)
                return () => {
                    console.log("Cleanup on selectedId change");
                };
            },
            () => [this.state.selectedId]
        );

        // Effect avec cleanup pour event listeners
        useEffect(
            () => {
                const handler = (e) => this.handleKeydown(e);
                document.addEventListener("keydown", handler);

                // Cleanup quand le composant est détruit ou effect re-run
                return () => {
                    document.removeEventListener("keydown", handler);
                };
            },
            () => []  // Empty deps = run once on mount
        );

        // Alternative: lifecycle hooks explicites
        onMounted(() => {
            this.inputRef.el?.focus();
        });

        onWillUnmount(() => {
            // Cleanup final
        });
    }

    async performSearch() {
        if (this.state.searchTerm.length < 2) {
            this.state.results = [];
            return;
        }

        const results = await this.orm.searchRead(
            "res.partner",
            [["name", "ilike", this.state.searchTerm]],
            ["name", "email"],
            { limit: 10 }
        );
        this.state.results = results;
    }

    async loadDetails() {
        // Charger détails de l'élément sélectionné
    }

    handleKeydown(e) {
        if (e.key === "Escape") {
            this.state.searchTerm = "";
        }
    }

    onSearchInput(ev) {
        this.state.searchTerm = ev.target.value;
    }

    onSelect(id) {
        this.state.selectedId = id;
    }
}
```

### 9.4 Template Avancé

```xml
<?xml version="1.0" encoding="UTF-8"?>
<templates xml:space="preserve">
    <t t-name="module.EffectComponent" owl="1">
        <div class="effect-component">
            <!-- Input avec ref -->
            <input
                t-ref="searchInput"
                type="text"
                class="form-control"
                placeholder="Rechercher..."
                t-att-value="state.searchTerm"
                t-on-input="onSearchInput"
            />

            <!-- Loading state -->
            <div t-if="state.loading" class="text-center my-3">
                <i class="fa fa-spinner fa-spin"/> Chargement...
            </div>

            <!-- Résultats -->
            <ul t-elif="state.results.length" class="list-group mt-2">
                <li
                    t-foreach="state.results"
                    t-as="result"
                    t-key="result.id"
                    class="list-group-item list-group-item-action"
                    t-att-class="{ active: state.selectedId === result.id }"
                    t-on-click="() => this.onSelect(result.id)"
                >
                    <strong t-esc="result.name"/>
                    <small t-if="result.email" class="text-muted ms-2">
                        <t t-esc="result.email"/>
                    </small>
                </li>
            </ul>

            <!-- Empty state -->
            <div t-elif="state.searchTerm.length >= 2" class="text-muted mt-2">
                Aucun résultat pour "<t t-esc="state.searchTerm"/>"
            </div>
        </div>
    </t>
</templates>
```

### 9.5 Dialog et Notifications

```javascript
/** @odoo-module **/

import { Component } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { ConfirmationDialog } from "@web/core/confirmation_dialog/confirmation_dialog";

export class DialogExamples extends Component {
    static template = "module.DialogExamples";

    setup() {
        this.dialog = useService("dialog");
        this.notification = useService("notification");
    }

    async onDelete() {
        // Dialog de confirmation
        this.dialog.add(ConfirmationDialog, {
            title: "Confirmer la suppression",
            body: "Êtes-vous sûr de vouloir supprimer cet enregistrement ?",
            confirm: async () => {
                await this.performDelete();
                this.notification.add("Supprimé avec succès", {
                    type: "success",
                    sticky: false,
                });
            },
            cancel: () => {
                this.notification.add("Annulé", { type: "info" });
            },
        });
    }

    showNotifications() {
        // Types de notifications
        this.notification.add("Info message", { type: "info" });
        this.notification.add("Succès!", { type: "success" });
        this.notification.add("Attention", { type: "warning" });
        this.notification.add("Erreur!", { type: "danger", sticky: true });

        // Notification avec action
        this.notification.add("Voir les détails", {
            type: "info",
            buttons: [{
                name: "Ouvrir",
                onClick: () => this.openDetails(),
            }],
        });
    }
}
```

---

*Guide OWL Frontend Odoo - ULTRA-CREATE v24.1 - Mis à jour le 27 Décembre 2025*
