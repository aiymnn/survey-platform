# Survey Platform Documentation Index

This folder extends the main `survey-platform-design.md` into a more complete LimeSurvey-like architecture reference for development.

## Recommended Reading Order

1. `survey-platform-design-enhanced.md` - Main system design and overview.
2. `01-expression-manager.md` - Advanced expression, relevance, validation, and calculation engine.
3. `02-multilingual-localization.md` - Survey language, translation, localization, and fallback architecture.
4. `03-question-type-mapping-limesurvey.md` - Detailed LimeSurvey-like question type registry and mapping.
5. `04-permissions-rbac-granular.md` - Granular survey permissions similar to LimeSurvey.
6. `05-theme-template-engine.md` - Theme, template, branding, renderer, and white-label architecture.
7. `06-plugin-lifecycle.md` - Install, activate, configure, hooks, events, and plugin runtime lifecycle.
8. `07-email-token-workflow.md` - Email templates, invitations, reminders, token flows, and queue handling.
9. `08-import-export-compatibility.md` - `.lss`, `.lsa`, `.lsq`, CSV, Excel, JSON, and migration compatibility.
10. `09-statistics-engine.md` - Statistics, aggregation, filtering, cross-tab, charts, and export architecture.
11. `10-admin-system-config.md` - Global admin settings, SMTP, storage, queues, cache, security, and system health.
12. `11-development-roadmap.md` - Suggested implementation order and milestones.

## Documentation Strategy

The main document should remain the product-level and system-level reference. These extra documents provide deeper module-level architecture so developers can implement each subsystem without making the main document too long.

## Core Principle

This project is not a direct Yii/PHP code conversion. It is a modern rebuild that uses LimeSurvey as a product and architecture reference while using a cleaner Next.js/TypeScript/PostgreSQL architecture.
