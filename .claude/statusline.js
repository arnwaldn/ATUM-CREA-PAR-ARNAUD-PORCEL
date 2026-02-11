#!/usr/bin/env node
// ATUM CREA Status Line - Node.js

let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
    try {
        const data = JSON.parse(input);

        // Extract fields with null safety
        const model = data?.model?.display_name || '?';
        const currentDir = data?.workspace?.current_dir || '';
        // Use path module for better cross-platform handling
        const path = require('path');
        const dir = currentDir ? path.basename(currentDir) : '?';
        const pct = Math.floor(data?.context_window?.used_percentage || 0);
        const cost = (data?.cost?.total_cost_usd || 0).toFixed(2);

        // ATUM CREA cycle phases based on context usage
        const phases = ['RECHERCHER', 'PLANIFIER', 'CONSTRUIRE', 'VERIFIER', 'MEMORISER'];
        const phaseIndex = Math.min(Math.floor(pct / 20), 4);
        const phase = phases[phaseIndex];

        // Git branch if available
        let branch = '';
        try {
            const { execSync } = require('child_process');
            execSync('git rev-parse --git-dir', { stdio: 'ignore' });
            const gitBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
            if (gitBranch) branch = ` | ${gitBranch}`;
        } catch {}

        // Time
        const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

        // Output: [Model] Phase | Dir | Context% | Cost | Time
        console.log(`[${model}] ${phase} | ${dir}${branch} | ${pct}% | $${cost} | ${time}`);
    } catch (error) {
        // Fallback output showing the error for debugging
        console.log(`[ATUM] Status (error: ${error.message})`);
    }
});
