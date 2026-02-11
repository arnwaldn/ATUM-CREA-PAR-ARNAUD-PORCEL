#!/usr/bin/env node
/**
 * ULTRA-CREATE API Cost Tracker v1.0
 * Suivi des coûts d'utilisation des APIs
 *
 * Services trackés:
 * - Claude API (tokens)
 * - OpenAI (tokens + images)
 * - Replicate (predictions)
 * - Firecrawl (pages)
 * - DeepL (characters)
 * - Et autres...
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'projects.db');

// Tarifs approximatifs (à ajuster selon les plans)
const PRICING = {
  'claude': {
    name: 'Claude API',
    unit: 'tokens',
    inputPrice: 0.003 / 1000,   // $3/MTok input
    outputPrice: 0.015 / 1000,  // $15/MTok output
    freeLimit: 0
  },
  'openai-gpt4': {
    name: 'OpenAI GPT-4',
    unit: 'tokens',
    inputPrice: 0.01 / 1000,
    outputPrice: 0.03 / 1000,
    freeLimit: 0
  },
  'openai-dalle': {
    name: 'DALL-E 3',
    unit: 'images',
    price: 0.04,  // Standard quality
    freeLimit: 0
  },
  'replicate': {
    name: 'Replicate',
    unit: 'predictions',
    price: 0.0023,  // CPU secondes moyenne
    freeLimit: 50  // Crédits de départ
  },
  'firecrawl': {
    name: 'Firecrawl',
    unit: 'pages',
    price: 0.001,  // Par page scrapée
    freeLimit: 500  // Free tier
  },
  'deepl': {
    name: 'DeepL',
    unit: 'characters',
    price: 0.00002,  // $20/1M chars
    freeLimit: 500000  // Free tier mensuel
  },
  'posthog': {
    name: 'PostHog',
    unit: 'events',
    price: 0.00045,
    freeLimit: 1000000  // 1M events/mois
  },
  'resend': {
    name: 'Resend',
    unit: 'emails',
    price: 0.001,
    freeLimit: 3000  // 3k emails/mois
  },
  'supabase': {
    name: 'Supabase',
    unit: 'requests',
    price: 0,  // Free tier généreux
    freeLimit: Infinity
  },
  'upstash': {
    name: 'Upstash Redis',
    unit: 'commands',
    price: 0.0000002,  // $0.2/100k
    freeLimit: 10000  // Par jour
  }
};

class ApiCostTracker {
  constructor() {
    this.db = new Database(DB_PATH);
    this.ensureTable();
  }

  ensureTable() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS api_costs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id TEXT,
        service TEXT NOT NULL,
        operation TEXT,
        units_used REAL,
        estimated_cost REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS api_budgets (
        service TEXT PRIMARY KEY,
        monthly_budget REAL,
        alert_threshold REAL DEFAULT 0.8
      );

      CREATE INDEX IF NOT EXISTS idx_api_costs_date ON api_costs(created_at);
      CREATE INDEX IF NOT EXISTS idx_api_costs_service ON api_costs(service);
    `);
  }

  // Enregistrer une utilisation
  track(service, units, operation = null, projectId = null) {
    const pricing = PRICING[service];
    if (!pricing) {
      console.warn(`Unknown service: ${service}`);
      return;
    }

    const cost = units * (pricing.price || pricing.inputPrice || 0);

    const stmt = this.db.prepare(`
      INSERT INTO api_costs (project_id, service, operation, units_used, estimated_cost)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(projectId, service, operation, units, cost);

    // Vérifier si on dépasse le seuil d'alerte
    this.checkBudgetAlert(service);

    return { service, units, cost };
  }

  // Définir un budget mensuel
  setBudget(service, monthlyBudget, alertThreshold = 0.8) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO api_budgets (service, monthly_budget, alert_threshold)
      VALUES (?, ?, ?)
    `);
    stmt.run(service, monthlyBudget, alertThreshold);
  }

  // Vérifier les alertes budget
  checkBudgetAlert(service) {
    const budget = this.db.prepare('SELECT * FROM api_budgets WHERE service = ?').get(service);
    if (!budget) return;

    const monthlyUsage = this.getMonthlyUsage(service);
    const usageRatio = monthlyUsage.totalCost / budget.monthly_budget;

    if (usageRatio >= budget.alert_threshold) {
      console.warn(`
⚠️  BUDGET ALERT: ${service}
   Usage: $${monthlyUsage.totalCost.toFixed(4)} / $${budget.monthly_budget.toFixed(2)} (${(usageRatio * 100).toFixed(1)}%)
   Consider reducing usage or increasing budget.
      `);
    }
  }

  // Usage mensuel par service
  getMonthlyUsage(service = null) {
    let query = `
      SELECT
        service,
        SUM(units_used) as totalUnits,
        SUM(estimated_cost) as totalCost,
        COUNT(*) as operations
      FROM api_costs
      WHERE created_at >= date('now', 'start of month')
    `;

    if (service) {
      query += ` AND service = ?`;
      const row = this.db.prepare(query).get(service);
      return row || { service, totalUnits: 0, totalCost: 0, operations: 0 };
    }

    query += ` GROUP BY service ORDER BY totalCost DESC`;
    return this.db.prepare(query).all();
  }

  // Usage quotidien
  getDailyUsage(days = 7) {
    const stmt = this.db.prepare(`
      SELECT
        date(created_at) as date,
        service,
        SUM(units_used) as units,
        SUM(estimated_cost) as cost
      FROM api_costs
      WHERE created_at >= date('now', '-' || ? || ' days')
      GROUP BY date(created_at), service
      ORDER BY date DESC
    `);
    return stmt.all(days);
  }

  // Rapport complet
  generateReport() {
    const monthlyUsage = this.getMonthlyUsage();
    const dailyUsage = this.getDailyUsage(7);
    const budgets = this.db.prepare('SELECT * FROM api_budgets').all();

    let totalMonthlyCost = 0;
    const report = {
      generatedAt: new Date().toISOString(),
      period: 'current_month',
      services: {},
      totalCost: 0,
      budgetStatus: []
    };

    monthlyUsage.forEach(usage => {
      const pricing = PRICING[usage.service] || {};
      const budget = budgets.find(b => b.service === usage.service);

      report.services[usage.service] = {
        name: pricing.name || usage.service,
        unit: pricing.unit || 'units',
        unitsUsed: usage.totalUnits,
        freeLimit: pricing.freeLimit || 0,
        billableUnits: Math.max(0, usage.totalUnits - (pricing.freeLimit || 0)),
        estimatedCost: usage.totalCost,
        operations: usage.operations
      };

      totalMonthlyCost += usage.totalCost;

      if (budget) {
        report.budgetStatus.push({
          service: usage.service,
          budget: budget.monthly_budget,
          used: usage.totalCost,
          remaining: budget.monthly_budget - usage.totalCost,
          percentUsed: (usage.totalCost / budget.monthly_budget * 100).toFixed(1)
        });
      }
    });

    report.totalCost = totalMonthlyCost;

    return report;
  }

  // Afficher le dashboard
  printDashboard() {
    const report = this.generateReport();

    console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    ULTRA-CREATE API COST DASHBOARD                            ║
║                    ${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }).toUpperCase().padStart(30)}                           ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`);

    console.log('SERVICE USAGE THIS MONTH:');
    console.log('─'.repeat(75));
    console.log(`${'Service'.padEnd(20)} ${'Units'.padStart(12)} ${'Free Tier'.padStart(12)} ${'Billable'.padStart(12)} ${'Cost'.padStart(12)}`);
    console.log('─'.repeat(75));

    Object.entries(report.services).forEach(([key, svc]) => {
      const freeStr = svc.freeLimit === Infinity ? '∞' : svc.freeLimit.toLocaleString();
      console.log(
        `${svc.name.padEnd(20)} ${svc.unitsUsed.toLocaleString().padStart(12)} ${freeStr.padStart(12)} ${svc.billableUnits.toLocaleString().padStart(12)} $${svc.estimatedCost.toFixed(4).padStart(11)}`
      );
    });

    console.log('─'.repeat(75));
    console.log(`${'TOTAL'.padEnd(20)} ${''.padStart(12)} ${''.padStart(12)} ${''.padStart(12)} $${report.totalCost.toFixed(4).padStart(11)}`);

    if (report.budgetStatus.length > 0) {
      console.log('\n\nBUDGET STATUS:');
      console.log('─'.repeat(75));
      report.budgetStatus.forEach(b => {
        const bar = '█'.repeat(Math.min(20, Math.floor(b.percentUsed / 5))) + '░'.repeat(Math.max(0, 20 - Math.floor(b.percentUsed / 5)));
        const status = b.percentUsed >= 90 ? '🔴' : b.percentUsed >= 70 ? '🟡' : '🟢';
        console.log(`${status} ${b.service.padEnd(15)} [${bar}] ${b.percentUsed}% ($${b.used.toFixed(2)}/$${b.budget.toFixed(2)})`);
      });
    }

    console.log('\n');
  }

  close() {
    this.db.close();
  }
}

// Export
module.exports = { ApiCostTracker, PRICING };

// CLI
if (require.main === module) {
  const tracker = new ApiCostTracker();
  const args = process.argv.slice(2);

  switch(args[0]) {
    case 'track':
      // node api-cost-tracker.js track <service> <units> [operation]
      const result = tracker.track(args[1], parseFloat(args[2]), args[3]);
      console.log(`Tracked: ${JSON.stringify(result)}`);
      break;

    case 'budget':
      // node api-cost-tracker.js budget <service> <amount>
      tracker.setBudget(args[1], parseFloat(args[2]));
      console.log(`Budget set: ${args[1]} = $${args[2]}/month`);
      break;

    case 'report':
      console.log(JSON.stringify(tracker.generateReport(), null, 2));
      break;

    case 'dashboard':
    default:
      tracker.printDashboard();
      break;
  }

  tracker.close();
}
