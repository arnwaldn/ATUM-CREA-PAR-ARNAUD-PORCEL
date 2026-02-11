# Accessibility Audit

Run a comprehensive WCAG 2.1 AA accessibility audit:

1. Automated scan with axe-core:
   - `npx @axe-core/cli http://localhost:3000`
   - Parse results by impact: critical, serious, moderate, minor
   - List all failing WCAG criteria

2. Lighthouse accessibility score:
   - `npx lighthouse http://localhost:3000 --only-categories=accessibility --output=json`
   - Extract score and individual audit results
   - Flag if score < 90

3. Static analysis with eslint-plugin-jsx-a11y:
   - `npx eslint . --plugin jsx-a11y --ext .tsx,.jsx`
   - Check for missing alt text, unlabeled inputs, non-semantic elements

4. Manual checklist verification:

   Semantic HTML:
   - [ ] Heading hierarchy logical (h1 > h2 > h3, no skips)
   - [ ] Landmarks present (nav, main, header, footer)
   - [ ] Lists use ul/ol elements
   - [ ] Tables have th and caption

   Keyboard:
   - [ ] All interactive elements reachable via Tab
   - [ ] Focus indicators visible (>= 2px, >= 3:1 contrast)
   - [ ] No keyboard traps
   - [ ] Skip navigation link present
   - [ ] Modals trap focus and return focus on close

   Visual:
   - [ ] Text contrast >= 4.5:1 (normal) / 3:1 (large)
   - [ ] No information conveyed by color alone
   - [ ] Content readable at 200% zoom
   - [ ] Touch targets >= 44x44px

   Content:
   - [ ] All images have alt text
   - [ ] All form inputs have labels
   - [ ] Error messages linked to inputs (aria-describedby)
   - [ ] Dynamic content announced (aria-live)
   - [ ] Page has lang attribute

5. Generate report with:
   - WCAG criterion reference (e.g., 1.1.1 Non-text Content)
   - Impact level and affected users
   - Component or page location
   - Current state vs. expected state
   - Specific fix with code example

6. Flag as non-compliant if any critical or serious issues found

Use the **accessibility-reviewer** agent for deep analysis.
