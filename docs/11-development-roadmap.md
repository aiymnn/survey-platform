# 11 - Development Roadmap and Implementation Order

## 1. Purpose

This roadmap gives a practical implementation order for building the platform. The goal is to avoid building advanced LimeSurvey-like features before the core runtime and data model are stable.

## 2. Phase 1 - Foundation

| Sprint | Scope |
|---|---|
| 1 | Project setup, Next.js, TypeScript, Tailwind, shadcn/ui, Prisma, PostgreSQL. |
| 2 | Auth, organization/workspace, base RBAC. |
| 3 | Survey CRUD, status, base settings, audit logging. |
| 4 | Survey pages/questions/options data model. |

## 3. Phase 2 - Builder and Runtime MVP

| Sprint | Scope |
|---|---|
| 5 | Builder UI shell: left tree, center canvas, right settings. |
| 6 | Basic question types: short text, long text, number, date, single choice. |
| 7 | Multiple choice, rating, matrix single, display text. |
| 8 | Publish flow and immutable `SurveyVersion.schemaJson`. |
| 9 | Public survey runtime and response session. |
| 10 | Save partial and final submit validation. |

## 4. Phase 3 - Core LimeSurvey-like Features

| Sprint | Scope |
|---|---|
| 11 | Basic logic engine: show/hide by answer. |
| 12 | Advanced Expression Manager parser/evaluator foundation. |
| 13 | Token participant list, CSV import, invitation token validation. |
| 14 | Email templates, invitation sending, reminder workflow. |
| 15 | Quotas and screen-out rules. |
| 16 | More question types: array, ranking, file upload, equation. |

## 5. Phase 4 - Reporting and Exports

| Sprint | Scope |
|---|---|
| 17 | Response table and individual response view. |
| 18 | Question summary statistics. |
| 19 | Filters, date range, answer conditions. |
| 20 | CSV/XLSX/JSON export jobs. |
| 21 | PDF report/export. |
| 22 | Cross-tab and trend charts. |

## 6. Phase 5 - Multilingual and Theme System

| Sprint | Scope |
|---|---|
| 23 | Survey languages and translation tables. |
| 24 | Translation editor and fallback logic. |
| 25 | Localized runtime and localized exports. |
| 26 | Theme model, organization theme, survey theme. |
| 27 | Runtime template engine and CSS variables. |

## 7. Phase 6 - Advanced Admin and Plugin Architecture

| Sprint | Scope |
|---|---|
| 28 | System settings and ConfigService. |
| 29 | SMTP/storage/queue/cache admin pages. |
| 30 | System health dashboard. |
| 31 | Plugin manifest and internal plugin registry. |
| 32 | Plugin hooks/events/navigation/settings. |

## 8. Phase 7 - Import/Export Compatibility and AI

| Sprint | Scope |
|---|---|
| 33 | Native JSON import/export. |
| 34 | `.lsq` question import/export. |
| 35 | `.lss` survey structure import basic. |
| 36 | `.lsa` archive import investigation and partial support. |
| 37 | AI analytics pipeline for text answers. |
| 38 | AI report dashboard/export. |

## 9. Phase 8 - Hardening

| Sprint | Scope |
|---|---|
| 39 | Performance optimization and caching. |
| 40 | Security testing, rate limits, file upload hardening. |
| 41 | E2E testing with Playwright. |
| 42 | Migration scripts and production deployment checklist. |

## 10. MVP Cut Line

A realistic MVP should include:

- Auth and organization.
- Survey builder with basic question types.
- Publish/versioning.
- Public runtime.
- Response storage.
- Basic logic.
- Reporting overview.
- CSV/XLSX export.

Do not block MVP on `.lss/.lsa` compatibility, full plugin marketplace, advanced Expression Manager parity, or complete AI analytics.

## 11. Technical Risk Ranking

| Risk | Difficulty |
|---|---|
| Expression Manager | Very High |
| Question type parity | High |
| Import/export `.lss/.lsa` | High |
| Statistics/cross-tab performance | Medium-High |
| Plugin framework | Medium-High |
| Multilingual survey snapshots | Medium |
| Theme engine | Medium |
| Email/token workflow | Medium |
| Basic survey CRUD/runtime | Low-Medium |

## 12. Recommendation

Build the core runtime first. A beautiful builder is useless if published surveys cannot reliably collect and validate responses. After runtime stability, expand question types, logic, reporting, multilingual support, and compatibility features.
