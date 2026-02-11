# Accessibility Rules

## WCAG 2.1 Level AA Compliance (MANDATORY)

All user-facing interfaces MUST meet WCAG 2.1 Level AA. Accessibility is not optional -- it is a legal requirement and a design fundamental.

## Semantic HTML

ALWAYS use the correct HTML element for its purpose:

```
WRONG:
  <div onclick="...">Click me</div>           (div as button)
  <div class="heading">Title</div>            (div as heading)
  <span class="link" onclick="navigate()">    (span as link)

CORRECT:
  <button type="button" onclick="...">Click me</button>
  <h2>Title</h2>
  <a href="/page">Navigate</a>
```

Rules:
- Use `<button>` for actions, `<a>` for navigation
- Use `<nav>`, `<main>`, `<header>`, `<footer>`, `<aside>` for landmarks
- Use `<ul>`/`<ol>` for lists, `<table>` for tabular data
- Use `<h1>` through `<h6>` in logical order (never skip levels)
- Use `<label>` for every form input
- Use `<fieldset>` and `<legend>` for related form groups

## ARIA Roles and Attributes

USE ARIA only when native HTML is insufficient:

```
Rule: No ARIA is better than bad ARIA.

WRONG:
  <div role="button" tabindex="0">Submit</div>    (use <button>)
  <span role="heading" aria-level="2">Title</span> (use <h2>)

CORRECT (when native element is not possible):
  <div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
    <h2 id="dialog-title">Confirm Action</h2>
  </div>

  <div role="alert">Error: Invalid email address</div>

  <div role="status" aria-live="polite">3 results found</div>
```

Rules:
- Never override native semantics: `<button role="heading">` is always wrong
- Use `aria-label` or `aria-labelledby` for elements without visible text
- Use `aria-describedby` for supplementary descriptions
- Use `aria-expanded` for collapsible content (accordions, dropdowns)
- Use `aria-current="page"` for active navigation items
- Use `aria-live="polite"` for non-urgent dynamic updates
- Use `role="alert"` for urgent notifications (errors, warnings)

## Keyboard Focus Management

ALL interactive elements MUST be keyboard accessible:

```
Requirements:
- Tab: Move focus to next interactive element
- Shift+Tab: Move focus to previous interactive element
- Enter/Space: Activate buttons and links
- Escape: Close modals, popovers, dropdowns
- Arrow keys: Navigate within widgets (tabs, menus, radio groups)
```

Rules:
- Visible focus indicator on ALL focusable elements (minimum 2px outline)
- Focus indicator contrast ratio >= 3:1 against adjacent colors
- Focus order follows visual reading order (left-to-right, top-to-bottom)
- No keyboard traps (user can always Tab away from any element)
- Focus moves into modals on open, returns to trigger on close
- Skip navigation link as first focusable element on every page

```css
/* MANDATORY: Visible focus indicator */
:focus-visible {
  outline: 2px solid #005fcc;
  outline-offset: 2px;
}

/* NEVER: Removing focus indicators */
/* :focus { outline: none; }   <-- FORBIDDEN */
```

## Color Contrast

MANDATORY minimum contrast ratios:

```
Normal text (< 18px or < 14px bold):
  - Minimum ratio: 4.5:1

Large text (>= 18px or >= 14px bold):
  - Minimum ratio: 3:1

Non-text elements (icons, borders, focus indicators):
  - Minimum ratio: 3:1

NEVER rely on color alone to convey information:
  - Error states: use icon + text + color (not just red text)
  - Required fields: use asterisk + label (not just color)
  - Status indicators: use icon + label (not just green/red dot)
  - Chart data: use patterns + labels (not just colors)
```

## Skip Navigation

EVERY page MUST have a skip navigation link:

```html
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <header>...</header>
  <nav>...</nav>
  <main id="main-content">...</main>
</body>
```

```css
.skip-link {
  position: absolute;
  left: -9999px;
  z-index: 999;
}

.skip-link:focus {
  position: fixed;
  top: 0.5rem;
  left: 0.5rem;
  background: #ffffff;
  color: #000000;
  padding: 0.5rem 1rem;
  z-index: 9999;
}
```

## Alt Text for Images

EVERY image MUST have appropriate alt text:

```
Informative images:
  <img src="chart.png" alt="Sales increased 40% from Q1 to Q4 2024" />

Decorative images:
  <img src="divider.svg" alt="" role="presentation" />

Complex images (charts, infographics):
  <img src="org-chart.png" alt="Organization chart" aria-describedby="org-desc" />
  <div id="org-desc" class="sr-only">
    CEO reports to Board. VP Engineering and VP Product report to CEO...
  </div>

Icons with meaning:
  <button>
    <svg aria-hidden="true">...</svg>
    <span class="sr-only">Close dialog</span>
  </button>
```

Rules:
- Alt text describes the content or function, not the image itself
- "Image of..." and "Photo of..." are redundant -- skip them
- Decorative images get `alt=""` (empty, not missing)
- Icons inside buttons: hide icon from AT, add sr-only text

## Forms

EVERY form input MUST have an associated label:

```html
<!-- Visible label (PREFERRED) -->
<label for="email">Email address</label>
<input id="email" type="email" required aria-required="true" />

<!-- Visually hidden label (when design requires) -->
<label for="search" class="sr-only">Search products</label>
<input id="search" type="search" placeholder="Search..." />

<!-- Error messages linked to input -->
<label for="password">Password</label>
<input id="password" type="password" aria-describedby="password-error" aria-invalid="true" />
<p id="password-error" role="alert">Password must be at least 8 characters</p>

<!-- Required field indication -->
<label for="name">Full name <span aria-hidden="true">*</span></label>
<input id="name" type="text" required aria-required="true" />
```

## Accessibility Checklist

Before marking UI work complete:
- [ ] Semantic HTML elements used correctly
- [ ] Heading hierarchy is logical (h1 > h2 > h3, no skips)
- [ ] All images have appropriate alt text
- [ ] All form inputs have labels
- [ ] Color contrast >= 4.5:1 for normal text
- [ ] Color contrast >= 3:1 for large text and non-text elements
- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible (>= 2px, >= 3:1 contrast)
- [ ] Skip navigation link present
- [ ] No keyboard traps
- [ ] Dynamic content uses aria-live regions
- [ ] Error messages are associated with inputs
- [ ] Page has lang attribute on html element
- [ ] Touch targets are >= 44x44 CSS pixels

## Agent Support

- **accessibility-reviewer** - Use PROACTIVELY after building or modifying UI components
