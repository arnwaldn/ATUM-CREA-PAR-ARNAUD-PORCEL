# Rule: Production-Grade Standards

## Every Project Must Have
1. **Error boundaries** - Global error handler + component-level error boundaries
2. **Loading states** - Skeleton screens or spinners for all async operations
3. **Empty states** - Meaningful UI when no data exists
4. **Responsive design** - Mobile-first, works at 375px, 768px, 1440px
5. **SEO basics** - Meta tags, Open Graph, semantic HTML, sitemap
6. **Performance** - Lighthouse score 90+ (Performance, Accessibility, Best Practices, SEO)
7. **Environment config** - .env.example with all required variables documented
8. **README** - Setup instructions, architecture overview, deployment guide

## Before Shipping (Pre-Deployment Checklist)
- [ ] Build passes with zero errors
- [ ] All tests pass with 80%+ coverage
- [ ] No console.log or debug statements in production code
- [ ] No hardcoded secrets or API keys
- [ ] Environment variables properly configured
- [ ] Error tracking configured (Sentry or equivalent)
- [ ] Structured logging (no console.log in prod - use Pino or similar)
- [ ] Database migrations are reversible
- [ ] API endpoints have rate limiting
- [ ] Authentication flows are tested end-to-end
- [ ] CORS configured correctly for production domains
- [ ] SSL/HTTPS enforced
- [ ] Cache headers set appropriately

## Performance Targets
- First Contentful Paint: < 1.8s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- Time to Interactive: < 3.8s
- Bundle size: < 200KB initial JS (gzipped)

## Accessibility (A11y) Minimum
- All images have alt text
- Color contrast ratio 4.5:1 minimum
- Keyboard navigable (Tab, Enter, Escape)
- Screen reader compatible (ARIA labels)
- Focus indicators visible
