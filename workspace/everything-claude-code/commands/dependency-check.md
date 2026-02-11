# Dependency Check

Check all project dependencies for vulnerabilities, outdated versions, and license compliance:

1. Vulnerability scan:
   - `npm audit --json`
   - Count by severity: critical, high, moderate, low
   - List actionable fixes: `npm audit fix --dry-run`
   - Flag unfixable vulnerabilities for manual review

2. Outdated dependencies:
   - `npm outdated`
   - Categorize: major (breaking), minor (features), patch (fixes)
   - Highlight dependencies more than 1 major version behind
   - Check if deprecated packages are in use

3. License compliance:
   - `npx license-checker --summary`
   - Verify all licenses are in allowed list (MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC)
   - Flag any GPL, AGPL, or SSPL licensed dependencies
   - Flag packages with missing or unknown licenses

4. Unused dependencies:
   - `npx depcheck`
   - List packages in package.json that are never imported
   - List packages imported but not in package.json (missing deps)
   - Suggest removals to reduce install size

5. Dependency size impact:
   - List top 10 largest dependencies by install size
   - Suggest lighter alternatives where available (moment -> dayjs, lodash -> native)

6. Generate summary:
   - Total dependencies (direct + transitive)
   - Vulnerabilities by severity with fix availability
   - Outdated count by update type
   - License violations
   - Unused dependencies to remove
   - Estimated size savings from cleanup

Use the **dependency-auditor** agent for deep analysis.
