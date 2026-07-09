# Next.js Survey Platform System Design

**Document purpose:** Development reference for building a modern LimeSurvey-like survey system using Next.js.

**Target stack:** Next.js App Router, TypeScript, PostgreSQL, Prisma, Auth.js/NextAuth, Tailwind CSS, shadcn/ui, Zod, React Hook Form, optional Redis/BullMQ for background jobs.

**Document date:** 2026-07-03

---

## 1. Executive Summary

This document describes a full system design for building a new modern survey platform inspired by LimeSurvey. The goal is not to copy LimeSurvey's legacy Yii/PHP implementation or database structure exactly. The goal is to copy the product concepts and core behavior:

- Create surveys.
- Build questions and sections.
- Publish versioned survey forms.
- Collect public or private responses.
- Support skip logic, conditions, quotas, tokens, and invitations.
- Analyze responses.
- Export results.
- Manage users, permissions, and organizations.
- Provide an extensible module/plugin-like architecture.

The recommended architecture is a **modular monolith** using Next.js first. This means one main application codebase, but internally separated into clear modules. This is easier to build and deploy than microservices during early development, while still allowing future extraction into services if the system grows.

---

## 2. Important Design Decision

### 2.1 Do not copy LimeSurvey's dynamic response table model exactly

LimeSurvey commonly stores responses in dynamic survey-specific tables, such as `survey_123456`, where the table structure depends on the survey questions. That design is useful for legacy reporting and direct flat exports, but it is harder to manage in a modern ORM-based Next.js application.

For this new system, use:

1. **Stable normalized tables** for surveys, questions, responses, participants, logic, and permissions.
2. **JSONB metadata fields** for flexible question configuration.
3. **Versioned survey snapshots** so that published surveys do not break when admins edit drafts.
4. **Analytics/export views** to generate flat report tables when needed.

### 2.2 Recommended response storage model

Use this model:

- `ResponseSession` = one respondent's attempt/submission.
- `Answer` = one answer to one question within a response session.
- `Answer.valueJson` = flexible JSONB value for different question types.
- `SurveyVersion.schemaJson` = immutable published survey schema snapshot.

This makes the runtime safe and avoids schema migration every time a user edits questions.

---

## 3. Goals and Non-Goals

### 3.1 Goals

| Goal                    | Description                                                                                                                |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Modern survey builder   | Drag/drop or structured builder for sections, questions, options, validation, and logic.                                   |
| Versioned publishing    | Draft edits should not corrupt already published surveys or existing responses.                                            |
| Flexible question types | Support text, number, date, radio, checkbox, dropdown, matrix, ranking, rating, file upload, consent, and computed fields. |
| Public survey runtime   | Respondents can answer surveys through public links or private tokens.                                                     |
| Skip logic              | Support conditional display, branching, default values, and computed behavior.                                             |
| Participants/tokens     | Invite specific participants using unique secure tokens.                                                                   |
| Reporting               | Summary dashboard, response table, filters, charts, exports.                                                               |
| RBAC                    | Role-based access control for admin users.                                                                                 |
| Auditability            | Track important changes and admin actions.                                                                                 |
| Extensibility           | Build modules cleanly so custom plugins/integrations are possible later.                                                   |

### 3.2 Non-Goals for Version 1

| Non-Goal                           | Reason                                                              |
| ---------------------------------- | ------------------------------------------------------------------- |
| 100% LimeSurvey feature parity     | LimeSurvey has years of legacy features. Build core features first. |
| Dynamic database tables per survey | Harder to maintain with Prisma/Next.js. Use normalized + JSONB.     |
| Microservices from day one         | Adds complexity before product-market/feature stability.            |
| Advanced plugin marketplace        | Start with internal module hooks/events first.                      |
| Real-time collaborative builder    | Can be added later after basic builder is stable.                   |

---

## 4. Recommended Tech Stack

### 4.1 Core Application

| Layer           | Recommended Tool                    | Reason                                                                                          |
| --------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------- |
| Framework       | Next.js App Router                  | Full-stack React framework with Server Components, Route Handlers, layouts, and modern routing. |
| Language        | TypeScript                          | Type safety for survey schema, question configs, API responses, and logic rules.                |
| UI              | Tailwind CSS + shadcn/ui            | Fast admin dashboard development and consistent component system.                               |
| Forms           | React Hook Form + Zod               | Strong validation and clean dynamic form handling.                                              |
| Database        | PostgreSQL                          | Reliable relational DB with JSONB support for flexible survey metadata.                         |
| ORM             | Prisma                              | Type-safe database access and schema management.                                                |
| Authentication  | Auth.js / NextAuth                  | OAuth/email/session support for Next.js apps.                                                   |
| Background Jobs | BullMQ + Redis                      | Exports, email invitations, analytics processing. Optional for V1.                              |
| File Storage    | S3-compatible storage               | Uploaded files, exports, logos, attachments.                                                    |
| Charts          | Recharts / Tremor / ECharts         | Reporting dashboard charts.                                                                     |
| Testing         | Vitest, Playwright, Testing Library | Unit, integration, and end-to-end tests.                                                        |
| Deployment      | Docker + VPS or Vercel + managed DB | VPS gives control; Vercel gives easier deployment.                                              |

### 4.2 Recommended Initial Architecture

Use a **Next.js modular monolith**:

```txt
Next.js App
├── Admin dashboard
├── Survey builder
├── Public survey runtime
├── API routes / server actions
├── Auth + RBAC
├── Reporting
├── Export jobs
└── PostgreSQL database
```

Move to separate backend services only when needed.

### 4.3 When to add a separate backend

Keep everything in Next.js initially unless you need:

- Heavy background processing.
- Complex API consumed by many external apps.
- Very high traffic public surveys.
- Separate mobile apps.
- Complex workflow engine.
- Dedicated analytics pipeline.

If you later separate backend, good choices are:

- **NestJS** for Node.js/TypeScript API.
- **Laravel** if your team prefers PHP backend.
- **ASP.NET Core** if company stack is Microsoft-heavy.

---

## 5. System Context

```mermaid
flowchart TD
    A[Admin User] --> B[Next.js Admin Dashboard]
    R[Respondent] --> C[Public Survey Runtime]
    B --> D[Application Core Modules]
    C --> D
    D --> E[(PostgreSQL)]
    D --> F[S3/File Storage]
    D --> G[Redis Queue Optional]
    G --> H[Worker Jobs]
    H --> E
    H --> F
    D --> I[Email Provider]
    D --> J[External API Integrations]
```

---

## 6. High-Level Architecture

```mermaid
flowchart LR
    subgraph UI[Next.js UI Layer]
        UI1[Admin Dashboard]
        UI2[Survey Builder]
        UI3[Public Survey Page]
        UI4[Reports Dashboard]
    end

    subgraph APP[Application Layer]
        A1[Auth Service]
        A2[Survey Service]
        A3[Question Service]
        A4[Logic Engine]
        A5[Response Service]
        A6[Participant Service]
        A7[Report Service]
        A8[Export Service]
        A9[Audit Service]
    end

    subgraph DATA[Data Layer]
        DB[(PostgreSQL)]
        FS[S3 Storage]
        REDIS[Redis]
    end

    UI --> APP
    APP --> DATA
```

---

## 7. Application Architecture Pattern

Use a modular structure:

```txt
src/
├── app/                       # Next.js routes and pages
├── components/                # Shared UI components
├── features/                  # Business modules
├── lib/                       # Shared utilities
├── server/                    # Server-only logic
├── types/                     # Shared TypeScript types
├── prisma/                    # Prisma schema/migrations
└── tests/                     # Unit/e2e tests
```

Each business feature should contain:

```txt
features/surveys/
├── actions.ts                 # Server actions for UI mutations
├── api.ts                     # API helper if needed
├── components/                # Feature-specific UI
├── constants.ts
├── permissions.ts
├── queries.ts                 # DB read queries
├── service.ts                 # Business logic
├── validators.ts              # Zod schemas
└── types.ts
```

Rule: **UI should not contain business logic.** Business rules should live in services, validators, and domain modules.

---

## 8. Main Modules

## 8.1 Authentication Module

### Responsibilities

- User login.
- User logout.
- OAuth login if required.
- Email/password or magic link login.
- Session management.
- Password reset if using credentials.
- Protect admin routes.

### Main entities

- `User`
- `Account`
- `Session`
- `VerificationToken`

### Main flows

1. User visits `/login`.
2. User authenticates.
3. Session is created.
4. Middleware protects `/admin/**` routes.
5. Permission checks happen server-side before DB actions.

### Recommended routes

```txt
/login
/logout
/admin
/api/auth/[...nextauth]
```

---

## 8.2 Organization / Workspace Module

### Responsibilities

- Support multiple organizations/workspaces.
- Users may belong to one or more organizations.
- Surveys belong to an organization.
- Roles are assigned per organization.

### Main entities

- `Organization`
- `OrganizationMember`
- `Role`
- `Permission`

### Example roles

| Role               | Description                                                   |
| ------------------ | ------------------------------------------------------------- |
| Super Admin        | Full system access.                                           |
| Organization Owner | Full access inside one organization.                          |
| Admin              | Manage users and surveys in organization.                     |
| Survey Manager     | Create/edit/publish surveys.                                  |
| Analyst            | View reports and export responses.                            |
| Viewer             | Read-only access.                                             |
| Respondent         | Public/private survey participant, usually not an admin user. |

---

## 8.3 Survey Management Module

### Responsibilities

- Create survey.
- Edit metadata.
- Configure language, status, visibility, start/end date.
- Create sections/pages.
- Manage survey versions.
- Publish/unpublish/archive survey.

### Survey statuses

| Status    | Meaning                                |
| --------- | -------------------------------------- |
| Draft     | Editable, not public.                  |
| Published | Public/runtime can use active version. |
| Paused    | Not accepting new responses.           |
| Closed    | Ended, no new responses.               |
| Archived  | Hidden from normal workflow.           |

### Versioning rule

A survey has many versions:

- Draft version is editable.
- Published version is immutable.
- Responses always link to a specific `SurveyVersion`.

This prevents old responses from becoming invalid after question edits.

---

## 8.4 Survey Builder Module

### Responsibilities

- Add/edit/reorder pages.
- Add/edit/reorder questions.
- Add answer options.
- Configure validation.
- Configure display logic.
- Preview survey.
- Save draft.
- Publish version.

### Builder UI layout

```txt
+------------------------------------------------------+
| Top bar: Survey title, Save, Preview, Publish         |
+----------------+-------------------+-----------------+
| Left panel     | Center canvas      | Right settings  |
| Sections       | Questions          | Selected item   |
| Question list  | Page preview       | Validation      |
| Add question   | Drag/reorder       | Logic/settings  |
+----------------+-------------------+-----------------+
```

### Builder state strategy

Use local client state for editing, then save to server:

- React state or Zustand for builder canvas.
- Zod validation before save.
- Server action saves draft.
- Publish action creates immutable `SurveyVersion` snapshot.

---

## 8.5 Question Module

### Responsibilities

- Support multiple question types.
- Store question settings.
- Validate answer format.
- Render runtime component.
- Render report component.

### Question type registry

Use a registry pattern:

```ts
export const questionTypeRegistry = {
  short_text: {
    label: "Short Text",
    builderComponent: ShortTextBuilder,
    runtimeComponent: ShortTextRuntime,
    reportComponent: ShortTextReport,
    validateAnswer: validateShortText,
  },
  single_choice: {
    label: "Single Choice",
    builderComponent: SingleChoiceBuilder,
    runtimeComponent: SingleChoiceRuntime,
    reportComponent: SingleChoiceReport,
    validateAnswer: validateSingleChoice,
  },
};
```

### Recommended question types for V1

| Type              | Description                          | Value format                               |
| ----------------- | ------------------------------------ | ------------------------------------------ |
| `short_text`      | Single-line text                     | `{ "text": "Ali" }`                        |
| `long_text`       | Multi-line text                      | `{ "text": "Feedback..." }`                |
| `number`          | Numeric input                        | `{ "number": 10 }`                         |
| `date`            | Date input                           | `{ "date": "2026-07-03" }`                 |
| `single_choice`   | Radio/dropdown                       | `{ "optionId": "opt_1" }`                  |
| `multiple_choice` | Checkbox                             | `{ "optionIds": ["opt_1", "opt_2"] }`      |
| `rating`          | Rating scale                         | `{ "rating": 4 }`                          |
| `nps`             | Net Promoter Score                   | `{ "score": 9 }`                           |
| `matrix_single`   | Matrix with one answer per row       | `{ "rows": { "row1": "col2" } }`           |
| `matrix_multi`    | Matrix with multiple answers per row | `{ "rows": { "row1": ["col1", "col3"] } }` |
| `ranking`         | Rank options                         | `{ "order": ["opt_3", "opt_1"] }`          |
| `file_upload`     | File upload                          | `{ "fileIds": ["file_123"] }`              |
| `consent`         | Agreement checkbox                   | `{ "accepted": true }`                     |
| `display_text`    | Instruction text, no answer          | `{}`                                       |
| `computed`        | Hidden/computed value                | `{ "value": 123 }`                         |

### Question config examples

#### Short text config

```json
{
  "placeholder": "Enter your name",
  "minLength": 2,
  "maxLength": 100,
  "isRequired": true
}
```

#### Number config

```json
{
  "min": 0,
  "max": 100,
  "step": 1,
  "unit": "kg",
  "isRequired": true
}
```

#### Single choice config

```json
{
  "display": "radio",
  "randomizeOptions": false,
  "allowOther": true,
  "isRequired": true
}
```

---

## 8.6 Logic Engine Module

### Responsibilities

- Show/hide question based on previous answers.
- Show/hide page/section.
- Branch to specific page.
- Calculate computed values.
- Validate conditional required rules.
- Evaluate quotas.

### Logic rule structure

```json
{
  "id": "rule_001",
  "scope": "question",
  "targetQuestionId": "q_002",
  "action": "show",
  "condition": {
    "all": [
      {
        "questionId": "q_001",
        "operator": "equals",
        "value": "yes"
      }
    ]
  }
}
```

### Operators

| Operator        | Meaning                                         |
| --------------- | ----------------------------------------------- |
| `equals`        | Answer equals value.                            |
| `not_equals`    | Answer does not equal value.                    |
| `contains`      | Multiple-choice answer contains option.         |
| `not_contains`  | Multiple-choice answer does not contain option. |
| `greater_than`  | Numeric answer greater than value.              |
| `less_than`     | Numeric answer less than value.                 |
| `between`       | Numeric/date answer in range.                   |
| `is_empty`      | No answer.                                      |
| `is_not_empty`  | Has answer.                                     |
| `matches_regex` | Text answer matches regex.                      |

### Condition structure

Support `all` and `any` groups:

```json
{
  "any": [
    {
      "all": [
        { "questionId": "q_age", "operator": "greater_than", "value": 17 },
        { "questionId": "q_country", "operator": "equals", "value": "MY" }
      ]
    },
    {
      "questionId": "q_staff",
      "operator": "equals",
      "value": true
    }
  ]
}
```

### Runtime logic flow

```mermaid
flowchart TD
    A[Load published survey schema] --> B[Initialize response state]
    B --> C[Render current page]
    C --> D[User answers question]
    D --> E[Update answer state]
    E --> F[Evaluate logic rules]
    F --> G[Hide/show questions]
    G --> H[Validate current page]
    H --> I{Can continue?}
    I -->|Yes| J[Go next]
    I -->|No| C
    J --> K{End?}
    K -->|No| C
    K -->|Yes| L[Submit response]
```

---

## 8.7 Public Survey Runtime Module

### Responsibilities

- Render published survey.
- Validate answers.
- Save partial response if enabled.
- Submit final response.
- Prevent duplicate submission if token-based.
- Show thank-you screen.

### Public routes

```txt
/s/[surveySlug]
/s/[surveySlug]/start
/s/[surveySlug]/page/[pageIndex]
/s/[surveySlug]/thank-you
/t/[token]
```

### Runtime modes

| Mode                | Description                                |
| ------------------- | ------------------------------------------ |
| Public anonymous    | Anyone with link can answer.               |
| Public with captcha | Anyone with link, but bot protection.      |
| Private token       | Only invited participants with token.      |
| Authenticated       | User must log in before answering.         |
| Kiosk mode          | Same device can submit multiple responses. |

### Response lifecycle

| Status       | Meaning                                      |
| ------------ | -------------------------------------------- |
| Started      | Response session created.                    |
| In Progress  | Some answers saved.                          |
| Submitted    | Final response submitted.                    |
| Screened Out | Respondent failed screening/qualification.   |
| Quota Full   | Respondent blocked because quota is reached. |
| Abandoned    | Started but not submitted after timeout.     |
| Deleted      | Soft-deleted by admin.                       |

---

## 8.8 Participant and Token Module

### Responsibilities

- Create participant list.
- Import participants from CSV.
- Generate secure tokens.
- Send invitation emails.
- Track invitation status.
- Allow reminder emails.
- Prevent duplicate submission.

### Token requirements

- Use random cryptographically secure token.
- Store token hash, not plain token, if high security is required.
- Token should be unique per participant per survey.
- Token can expire.
- Token can be single-use or reusable depending on setting.

### Invitation statuses

| Status       | Meaning                              |
| ------------ | ------------------------------------ |
| Pending      | Created but not sent.                |
| Sent         | Invitation email sent.               |
| Opened       | Email opened if tracking is enabled. |
| Started      | Participant opened survey.           |
| Completed    | Participant submitted response.      |
| Bounced      | Email failed.                        |
| Unsubscribed | Participant opted out.               |

---

## 8.9 Quota Module

### Responsibilities

- Define quota rules.
- Count submitted responses matching quota conditions.
- Stop new responses after quota limit.
- Redirect or show custom message.

### Example quota

```json
{
  "name": "Male respondents from Malaysia",
  "limit": 100,
  "condition": {
    "all": [
      { "questionId": "q_gender", "operator": "equals", "value": "male" },
      { "questionId": "q_country", "operator": "equals", "value": "MY" }
    ]
  },
  "onFull": {
    "action": "screen_out",
    "message": "Thank you. This quota is already full."
  }
}
```

---

## 8.10 Reporting and Analytics Module

### Responsibilities

- View response count.
- View completion rate.
- View question-level summaries.
- Filter responses.
- View individual response details.
- Export CSV/XLSX/JSON/PDF.
- Generate charts.

### Report types

| Report              | Description                                        |
| ------------------- | -------------------------------------------------- |
| Overview            | Response count, completion rate, average duration. |
| Question summary    | Aggregated answers per question.                   |
| Response table      | One row per submitted response.                    |
| Individual response | Detailed answers from one respondent.              |
| Cross-tab           | Compare answers across two or more questions.      |
| Time trend          | Responses over time.                               |
| Export              | CSV/XLSX/JSON/PDF download.                        |

### Report data strategy

For small/medium scale:

- Query `ResponseSession` and `Answer` tables directly.
- Build charts dynamically.

For larger scale:

- Create materialized reporting tables.
- Process response submissions into analytics tables.
- Use background jobs to update aggregates.

### Flat export generation

Although the database stores normalized answers, exports should be flat:

```txt
response_id | submitted_at | q_name | q_age | q_gender | q_feedback
```

To generate this:

1. Load published survey schema.
2. Get all submitted response sessions.
3. Map question IDs to export column names.
4. Transform answer JSON into display/export value.
5. Write CSV/XLSX.
6. Store file in object storage.
7. Return download link.

---

## 8.11 Theme and Branding Module

### Responsibilities

- Survey logo.
- Primary color.
- Font family.
- Custom thank-you page.
- Custom welcome page.
- Survey layout template.
- CSS overrides if allowed.

### Theme model

A survey can use:

- Organization default theme.
- Survey-specific theme.
- System default theme.

Theme config example:

```json
{
  "primaryColor": "#2563eb",
  "backgroundColor": "#ffffff",
  "fontFamily": "Inter",
  "logoFileId": "file_123",
  "layout": "centered",
  "showProgressBar": true,
  "buttonStyle": "rounded"
}
```

---

## 8.12 Notification Module

### Responsibilities

- Invitation email.
- Reminder email.
- Completion notification.
- Export ready notification.
- Admin system alerts.

### Email templates

| Template     | Variables                                                    |
| ------------ | ------------------------------------------------------------ |
| Invitation   | `participantName`, `surveyTitle`, `surveyLink`, `expiryDate` |
| Reminder     | `participantName`, `surveyTitle`, `surveyLink`               |
| Thank you    | `participantName`, `surveyTitle`                             |
| Export ready | `userName`, `exportLink`, `expiryDate`                       |

---

## 8.13 Audit Log Module

### Responsibilities

Track important admin actions:

- User login.
- Survey created.
- Survey updated.
- Survey published.
- Survey closed.
- Question added/updated/deleted.
- Responses exported.
- Participant imported.
- Permissions changed.

Audit logs should be append-only.

---

## 8.14 File Upload Module

### Responsibilities

- Store uploaded respondent files.
- Store survey logos/assets.
- Store generated exports.
- Virus scan if needed.
- Enforce file size/type rules.

### File categories

| Category        | Description                  |
| --------------- | ---------------------------- |
| Survey asset    | Logo, background image.      |
| Response upload | File uploaded by respondent. |
| Export          | Generated CSV/XLSX/PDF.      |
| Import          | Uploaded participant CSV.    |

---

## 8.15 Integration/API Module

### Responsibilities

- External system can create surveys.
- External system can get survey list.
- External system can redirect users to survey.
- External system can get response data.
- Webhook on response submitted.

### API authentication options

| Method     | Use case                                         |
| ---------- | ------------------------------------------------ |
| API key    | Server-to-server simple integration.             |
| OAuth2     | Larger third-party integration.                  |
| Signed URL | Secure redirect to survey.                       |
| JWT        | Application A passes authenticated user context. |

### Example external redirect flow

```mermaid
sequenceDiagram
    participant A as Application A
    participant S as Survey Platform
    participant R as Respondent

    A->>S: POST /api/integrations/survey-links
    S->>S: Validate API key + params
    S->>S: Create token/session
    S-->>A: Return secure survey URL
    A-->>R: Redirect/open new tab
    R->>S: Open survey URL
    S->>S: Validate token
    S-->>R: Render survey
```

---

## 8.16 Plugin-like Extension Module

Do not build a full marketplace in V1. Start with internal extension points.

### Extension points

| Event                  | Example use                       |
| ---------------------- | --------------------------------- |
| `survey.created`       | Send notification.                |
| `survey.published`     | Generate search index/cache.      |
| `response.started`     | Track participant started.        |
| `response.submitted`   | Send webhook, update analytics.   |
| `export.created`       | Notify user when export is ready. |
| `participant.imported` | Validate/import custom fields.    |

### Event interface example

```ts
type DomainEvent<TPayload> = {
  id: string;
  type: string;
  payload: TPayload;
  createdAt: Date;
};
```

### Event handling approach

For V1:

- Use direct function calls inside service layer.
- Record events in `DomainEvent` table.

For V2:

- Add queue-based event processing.
- Add webhook subscriptions.
- Add plugin registry.

---

# 9. Use Cases

## 9.1 Admin Use Cases

| Code   | Use Case            | Actor           | Description                      |
| ------ | ------------------- | --------------- | -------------------------------- |
| UC-A01 | Login               | Admin User      | User logs into admin dashboard.  |
| UC-A02 | Create organization | Super Admin     | Create a workspace/organization. |
| UC-A03 | Invite user         | Org Owner/Admin | Invite another admin user.       |
| UC-A04 | Assign role         | Org Owner/Admin | Assign permission role to user.  |
| UC-A05 | View audit log      | Org Owner/Admin | Review important system actions. |

## 9.2 Survey Builder Use Cases

| Code   | Use Case                 | Actor          | Description                                 |
| ------ | ------------------------ | -------------- | ------------------------------------------- |
| UC-S01 | Create survey            | Survey Manager | Create new survey draft.                    |
| UC-S02 | Edit survey settings     | Survey Manager | Update title, description, dates, language. |
| UC-S03 | Add section/page         | Survey Manager | Add survey page/group.                      |
| UC-S04 | Add question             | Survey Manager | Add question to page.                       |
| UC-S05 | Configure answer options | Survey Manager | Add options for choice questions.           |
| UC-S06 | Configure validation     | Survey Manager | Required, min/max, regex, etc.              |
| UC-S07 | Configure logic          | Survey Manager | Add display/branching rules.                |
| UC-S08 | Preview survey           | Survey Manager | Preview before publishing.                  |
| UC-S09 | Publish survey           | Survey Manager | Create immutable published version.         |
| UC-S10 | Close survey             | Survey Manager | Stop accepting responses.                   |

## 9.3 Respondent Use Cases

| Code   | Use Case              | Actor             | Description                                |
| ------ | --------------------- | ----------------- | ------------------------------------------ |
| UC-R01 | Open public survey    | Respondent        | Access survey via public link.             |
| UC-R02 | Open token survey     | Participant       | Access survey via secure token.            |
| UC-R03 | Answer questions      | Respondent        | Fill out survey pages.                     |
| UC-R04 | Save partial response | Respondent/System | Save progress if enabled.                  |
| UC-R05 | Submit response       | Respondent        | Complete final submission.                 |
| UC-R06 | Screen out            | System            | End survey if respondent does not qualify. |
| UC-R07 | Quota full            | System            | Stop survey if quota already full.         |

## 9.4 Reporting Use Cases

| Code   | Use Case                 | Actor   | Description                         |
| ------ | ------------------------ | ------- | ----------------------------------- |
| UC-P01 | View overview            | Analyst | See response count/completion rate. |
| UC-P02 | View question summary    | Analyst | See answer distribution.            |
| UC-P03 | Filter responses         | Analyst | Filter by answer/date/status.       |
| UC-P04 | View individual response | Analyst | Inspect one full submission.        |
| UC-P05 | Export responses         | Analyst | Export CSV/XLSX/JSON/PDF.           |
| UC-P06 | Generate cross-tab       | Analyst | Compare answers between questions.  |

## 9.5 Integration Use Cases

| Code   | Use Case             | Actor        | Description                           |
| ------ | -------------------- | ------------ | ------------------------------------- |
| UC-I01 | Create API key       | Admin        | Create server-to-server key.          |
| UC-I02 | Generate survey link | External App | Get secure survey URL.                |
| UC-I03 | Fetch response data  | External App | Pull survey responses.                |
| UC-I04 | Receive webhook      | External App | Get notified when response submitted. |

---

# 10. Detailed User Flows

## 10.1 Create and Publish Survey Flow

```mermaid
sequenceDiagram
    participant U as Survey Manager
    participant UI as Next.js Admin UI
    participant S as Survey Service
    participant DB as PostgreSQL

    U->>UI: Click Create Survey
    UI->>S: createSurvey(data)
    S->>DB: Insert Survey + Draft Version
    DB-->>S: Survey created
    S-->>UI: Return survey id
    U->>UI: Add pages/questions/options
    UI->>S: saveDraft(schema)
    S->>DB: Update draft version schema
    U->>UI: Click Publish
    UI->>S: publishSurvey(surveyId)
    S->>S: Validate schema
    S->>DB: Create immutable SurveyVersion
    S->>DB: Set survey activeVersionId
    S-->>UI: Published
```

## 10.2 Respondent Submission Flow

```mermaid
sequenceDiagram
    participant R as Respondent
    participant UI as Public Survey UI
    participant S as Runtime Service
    participant L as Logic Engine
    participant DB as PostgreSQL

    R->>UI: Open survey link
    UI->>S: loadSurvey(slug/token)
    S->>DB: Get active SurveyVersion
    S-->>UI: Return schema
    R->>UI: Answer page 1
    UI->>L: Evaluate rules locally/server-side
    L-->>UI: Visible questions + validation
    UI->>S: savePartial(answers)
    S->>DB: Upsert ResponseSession + Answers
    R->>UI: Submit final
    UI->>S: submitResponse()
    S->>S: Server-side validate all answers
    S->>DB: Mark response submitted
    S-->>UI: Show thank-you page
```

## 10.3 Token Invitation Flow

```mermaid
sequenceDiagram
    participant A as Admin
    participant UI as Admin UI
    participant P as Participant Service
    participant E as Email Provider
    participant DB as PostgreSQL
    participant R as Participant

    A->>UI: Import CSV participants
    UI->>P: importParticipants(csv)
    P->>DB: Create participants + invitations
    A->>UI: Send invitations
    UI->>P: sendInvitations(surveyId)
    P->>E: Send email with token link
    E-->>R: Invitation email
    R->>UI: Open token link
    UI->>P: validateToken(token)
    P->>DB: Mark started
```

## 10.4 Export Flow

```mermaid
sequenceDiagram
    participant U as Analyst
    participant UI as Reports UI
    participant R as Report Service
    participant Q as Queue
    participant W as Worker
    participant F as File Storage
    participant DB as PostgreSQL

    U->>UI: Click Export CSV
    UI->>R: requestExport(filters)
    R->>DB: Create ExportJob
    R->>Q: Add export job
    Q-->>UI: Job queued
    W->>DB: Load survey schema + responses
    W->>W: Transform to flat table
    W->>F: Store CSV/XLSX
    W->>DB: Mark export ready
    UI->>R: Poll export status
    R-->>UI: Download URL
```

---

# 11. Database Design

## 11.1 ERD Overview

```mermaid
erDiagram
    User ||--o{ OrganizationMember : belongs_to
    Organization ||--o{ OrganizationMember : has
    Organization ||--o{ Survey : owns
    Survey ||--o{ SurveyVersion : has
    Survey ||--o{ Participant : has
    Survey ||--o{ ResponseSession : has
    SurveyVersion ||--o{ SurveyPage : snapshot_contains
    SurveyVersion ||--o{ Question : snapshot_contains
    SurveyVersion ||--o{ ResponseSession : answered_against
    SurveyPage ||--o{ Question : has
    Question ||--o{ QuestionOption : has
    ResponseSession ||--o{ Answer : has
    Question ||--o{ Answer : answered_by
    Participant ||--o{ Invitation : receives
    Invitation ||--o{ ResponseSession : starts
    Survey ||--o{ Quota : has
    Survey ||--o{ WebhookSubscription : has
    User ||--o{ AuditLog : performs
    FileAsset ||--o{ AnswerFile : attached_to
    Answer ||--o{ AnswerFile : includes
```

---

## 11.2 Main Tables

### User

Stores admin users.

| Column       | Type            | Notes                 |
| ------------ | --------------- | --------------------- |
| id           | UUID            | Primary key.          |
| name         | String          | Display name.         |
| email        | String          | Unique.               |
| passwordHash | String nullable | If using credentials. |
| image        | String nullable | Profile image.        |
| status       | Enum            | ACTIVE, SUSPENDED.    |
| createdAt    | DateTime        | Created timestamp.    |
| updatedAt    | DateTime        | Updated timestamp.    |

### Organization

Workspace/company/team.

| Column       | Type     | Notes                                 |
| ------------ | -------- | ------------------------------------- |
| id           | UUID     | Primary key.                          |
| name         | String   | Organization name.                    |
| slug         | String   | Unique URL slug.                      |
| settingsJson | JSONB    | Default timezone, language, branding. |
| createdAt    | DateTime | Created timestamp.                    |
| updatedAt    | DateTime | Updated timestamp.                    |

### OrganizationMember

Many-to-many user membership.

| Column         | Type     | Notes                                          |
| -------------- | -------- | ---------------------------------------------- |
| id             | UUID     | Primary key.                                   |
| organizationId | UUID     | FK.                                            |
| userId         | UUID     | FK.                                            |
| role           | Enum     | OWNER, ADMIN, SURVEY_MANAGER, ANALYST, VIEWER. |
| createdAt      | DateTime | Created timestamp.                             |

### Survey

Main survey record.

| Column          | Type              | Notes                                       |
| --------------- | ----------------- | ------------------------------------------- |
| id              | UUID              | Primary key.                                |
| organizationId  | UUID              | FK.                                         |
| title           | String            | Survey title.                               |
| slug            | String            | Public slug.                                |
| description     | Text              | Survey description.                         |
| status          | Enum              | DRAFT, PUBLISHED, PAUSED, CLOSED, ARCHIVED. |
| activeVersionId | UUID nullable     | Current published version.                  |
| settingsJson    | JSONB             | Runtime settings.                           |
| startAt         | DateTime nullable | Optional open date.                         |
| endAt           | DateTime nullable | Optional close date.                        |
| createdById     | UUID              | User who created survey.                    |
| createdAt       | DateTime          | Created timestamp.                          |
| updatedAt       | DateTime          | Updated timestamp.                          |

### SurveyVersion

Immutable published/draft version snapshot.

| Column        | Type              | Notes                        |
| ------------- | ----------------- | ---------------------------- |
| id            | UUID              | Primary key.                 |
| surveyId      | UUID              | FK.                          |
| versionNumber | Int               | 1, 2, 3...                   |
| status        | Enum              | DRAFT, PUBLISHED, ARCHIVED.  |
| schemaJson    | JSONB             | Full survey schema snapshot. |
| publishedAt   | DateTime nullable | Set when published.          |
| publishedById | UUID nullable     | User.                        |
| createdAt     | DateTime          | Created timestamp.           |

### SurveyPage

Page/section/group inside a survey version.

| Column          | Type          | Notes          |
| --------------- | ------------- | -------------- |
| id              | UUID          | Primary key.   |
| surveyVersionId | UUID          | FK.            |
| title           | String        | Page title.    |
| description     | Text nullable | Page intro.    |
| orderIndex      | Int           | Sort order.    |
| settingsJson    | JSONB         | Page settings. |

### Question

Question inside a survey version/page.

| Column          | Type          | Notes                                  |
| --------------- | ------------- | -------------------------------------- |
| id              | UUID          | Primary key.                           |
| surveyVersionId | UUID          | FK.                                    |
| pageId          | UUID          | FK.                                    |
| code            | String        | Human-readable export code, e.g. `Q1`. |
| type            | String        | Question type.                         |
| title           | Text          | Question text.                         |
| description     | Text nullable | Help text.                             |
| orderIndex      | Int           | Sort order.                            |
| isRequired      | Boolean       | Required flag.                         |
| configJson      | JSONB         | Type-specific config.                  |
| validationJson  | JSONB         | Validation rules.                      |
| logicJson       | JSONB         | Display/branch logic.                  |

### QuestionOption

Answer options for choice/ranking/matrix questions.

| Column       | Type    | Notes              |
| ------------ | ------- | ------------------ |
| id           | UUID    | Primary key.       |
| questionId   | UUID    | FK.                |
| value        | String  | Stored value.      |
| label        | String  | Display label.     |
| orderIndex   | Int     | Sort order.        |
| isOther      | Boolean | Is "Other" option. |
| metadataJson | JSONB   | Extra config.      |

### Participant

Respondent record for private surveys.

| Column         | Type            | Notes                    |
| -------------- | --------------- | ------------------------ |
| id             | UUID            | Primary key.             |
| surveyId       | UUID            | FK.                      |
| email          | String nullable | Participant email.       |
| name           | String nullable | Participant name.        |
| externalId     | String nullable | ID from external system. |
| attributesJson | JSONB           | Custom fields.           |
| createdAt      | DateTime        | Created timestamp.       |

### Invitation

Private survey token/invitation.

| Column        | Type              | Notes                                                |
| ------------- | ----------------- | ---------------------------------------------------- |
| id            | UUID              | Primary key.                                         |
| participantId | UUID              | FK.                                                  |
| surveyId      | UUID              | FK.                                                  |
| tokenHash     | String            | Secure token hash.                                   |
| status        | Enum              | PENDING, SENT, STARTED, COMPLETED, EXPIRED, BOUNCED. |
| sentAt        | DateTime nullable | Sent timestamp.                                      |
| expiresAt     | DateTime nullable | Token expiry.                                        |
| usedAt        | DateTime nullable | Used timestamp.                                      |

### ResponseSession

One respondent attempt/submission.

| Column          | Type              | Notes                                                                          |
| --------------- | ----------------- | ------------------------------------------------------------------------------ |
| id              | UUID              | Primary key.                                                                   |
| surveyId        | UUID              | FK.                                                                            |
| surveyVersionId | UUID              | FK.                                                                            |
| participantId   | UUID nullable     | FK if private.                                                                 |
| invitationId    | UUID nullable     | FK if token-based.                                                             |
| status          | Enum              | STARTED, IN_PROGRESS, SUBMITTED, SCREENED_OUT, QUOTA_FULL, ABANDONED, DELETED. |
| startedAt       | DateTime          | Started timestamp.                                                             |
| submittedAt     | DateTime nullable | Submitted timestamp.                                                           |
| lastActivityAt  | DateTime          | Last activity.                                                                 |
| ipHash          | String nullable   | Privacy-safe IP hash.                                                          |
| userAgent       | String nullable   | Optional.                                                                      |
| metadataJson    | JSONB             | Device, UTM, source, etc.                                                      |

### Answer

One answer to one question.

| Column            | Type          | Notes                       |
| ----------------- | ------------- | --------------------------- |
| id                | UUID          | Primary key.                |
| responseSessionId | UUID          | FK.                         |
| questionId        | UUID          | FK.                         |
| valueJson         | JSONB         | Flexible answer value.      |
| displayValue      | Text nullable | Precomputed readable value. |
| createdAt         | DateTime      | Created timestamp.          |
| updatedAt         | DateTime      | Updated timestamp.          |

### Quota

Quota/screening rule.

| Column        | Type    | Notes                             |
| ------------- | ------- | --------------------------------- |
| id            | UUID    | Primary key.                      |
| surveyId      | UUID    | FK.                               |
| name          | String  | Quota name.                       |
| limit         | Int     | Max matching submitted responses. |
| conditionJson | JSONB   | Condition structure.              |
| actionJson    | JSONB   | Message/redirect/action.          |
| isActive      | Boolean | Enabled flag.                     |

### FileAsset

Files uploaded/generated by system.

| Column         | Type          | Notes                                          |
| -------------- | ------------- | ---------------------------------------------- |
| id             | UUID          | Primary key.                                   |
| organizationId | UUID nullable | FK.                                            |
| ownerUserId    | UUID nullable | FK.                                            |
| storageKey     | String        | Object storage key.                            |
| filename       | String        | Original filename.                             |
| mimeType       | String        | MIME type.                                     |
| sizeBytes      | Int           | Size.                                          |
| category       | Enum          | SURVEY_ASSET, RESPONSE_UPLOAD, EXPORT, IMPORT. |
| createdAt      | DateTime      | Created timestamp.                             |

### ExportJob

Export request status.

| Column        | Type              | Notes                              |
| ------------- | ----------------- | ---------------------------------- |
| id            | UUID              | Primary key.                       |
| surveyId      | UUID              | FK.                                |
| requestedById | UUID              | FK user.                           |
| type          | Enum              | CSV, XLSX, JSON, PDF.              |
| status        | Enum              | QUEUED, PROCESSING, READY, FAILED. |
| filtersJson   | JSONB             | Export filters.                    |
| fileAssetId   | UUID nullable     | Generated file.                    |
| errorMessage  | Text nullable     | Failure reason.                    |
| createdAt     | DateTime          | Created timestamp.                 |
| completedAt   | DateTime nullable | Done timestamp.                    |

### AuditLog

Admin/system action log.

| Column         | Type          | Notes                    |
| -------------- | ------------- | ------------------------ |
| id             | UUID          | Primary key.             |
| organizationId | UUID nullable | FK.                      |
| actorUserId    | UUID nullable | FK.                      |
| action         | String        | e.g. `survey.published`. |
| entityType     | String        | e.g. `Survey`.           |
| entityId       | UUID nullable | Entity ID.               |
| metadataJson   | JSONB         | Extra data.              |
| createdAt      | DateTime      | Timestamp.               |

---

## 11.3 Prisma Schema Draft

This is a strong starting schema. You can adjust naming and fields during implementation.

> **Note (Prisma 7+):** as of Prisma ORM v7, `schema.prisma` no longer holds the database connection URL. The `datasource` block only declares the `provider`. The actual `url` moves to `prisma.config.ts` (see below), and `PrismaClient` requires an explicit driver adapter (e.g. `@prisma/adapter-pg` for PostgreSQL) instead of the old built-in engine. If you are using Prisma 6 or earlier, add back `url = env("DATABASE_URL")` inside the `datasource` block and skip the `prisma.config.ts` / driver adapter steps below.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

enum UserStatus {
  ACTIVE
  SUSPENDED
}

enum OrganizationRole {
  OWNER
  ADMIN
  SURVEY_MANAGER
  ANALYST
  VIEWER
}

enum SurveyStatus {
  DRAFT
  PUBLISHED
  PAUSED
  CLOSED
  ARCHIVED
}

enum SurveyVersionStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum ResponseStatus {
  STARTED
  IN_PROGRESS
  SUBMITTED
  SCREENED_OUT
  QUOTA_FULL
  ABANDONED
  DELETED
}

enum InvitationStatus {
  PENDING
  SENT
  STARTED
  COMPLETED
  EXPIRED
  BOUNCED
  UNSUBSCRIBED
}

enum FileCategory {
  SURVEY_ASSET
  RESPONSE_UPLOAD
  EXPORT
  IMPORT
}

enum ExportType {
  CSV
  XLSX
  JSON
  PDF
}

enum ExportStatus {
  QUEUED
  PROCESSING
  READY
  FAILED
}

model User {
  id           String       @id @default(uuid())
  name         String?
  email        String       @unique
  passwordHash String?
  image        String?
  status       UserStatus   @default(ACTIVE)
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  memberships  OrganizationMember[]
  createdSurveys Survey[]   @relation("SurveyCreatedBy")
  publishedVersions SurveyVersion[] @relation("SurveyVersionPublishedBy")
  auditLogs    AuditLog[]
  exportJobs   ExportJob[]
  files        FileAsset[]
}

model Organization {
  id           String       @id @default(uuid())
  name         String
  slug         String       @unique
  settingsJson Json         @default("{}")
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  members      OrganizationMember[]
  surveys      Survey[]
  auditLogs    AuditLog[]
  files        FileAsset[]
  apiKeys      ApiKey[]
}

model OrganizationMember {
  id             String           @id @default(uuid())
  organizationId String
  userId         String
  role           OrganizationRole
  createdAt      DateTime         @default(now())

  organization   Organization     @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user           User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([organizationId, userId])
  @@index([userId])
}

model Survey {
  id              String        @id @default(uuid())
  organizationId  String
  title           String
  slug            String
  description     String?
  status          SurveyStatus  @default(DRAFT)
  activeVersionId String?
  settingsJson    Json          @default("{}")
  startAt         DateTime?
  endAt           DateTime?
  createdById     String
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  organization    Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  createdBy       User          @relation("SurveyCreatedBy", fields: [createdById], references: [id])
  versions        SurveyVersion[]
  participants    Participant[]
  invitations     Invitation[]
  responseSessions ResponseSession[]
  quotas          Quota[]
  exportJobs      ExportJob[]
  webhooks        WebhookSubscription[]

  @@unique([organizationId, slug])
  @@index([organizationId, status])
}

model SurveyVersion {
  id             String       @id @default(uuid())
  surveyId       String
  versionNumber  Int
  status         SurveyVersionStatus @default(DRAFT)
  schemaJson     Json         @default("{}")
  publishedAt    DateTime?
  publishedById  String?
  createdAt      DateTime     @default(now())

  survey         Survey       @relation(fields: [surveyId], references: [id], onDelete: Cascade)
  publishedBy    User?        @relation("SurveyVersionPublishedBy", fields: [publishedById], references: [id])
  pages          SurveyPage[]
  questions      Question[]
  responseSessions ResponseSession[]

  @@unique([surveyId, versionNumber])
  @@index([surveyId, status])
}

model SurveyPage {
  id              String        @id @default(uuid())
  surveyVersionId String
  title           String
  description     String?
  orderIndex      Int
  settingsJson    Json          @default("{}")

  surveyVersion   SurveyVersion @relation(fields: [surveyVersionId], references: [id], onDelete: Cascade)
  questions       Question[]

  @@index([surveyVersionId, orderIndex])
}

model Question {
  id              String        @id @default(uuid())
  surveyVersionId String
  pageId          String
  code            String
  type            String
  title           String
  description     String?
  orderIndex      Int
  isRequired      Boolean       @default(false)
  configJson      Json          @default("{}")
  validationJson  Json          @default("{}")
  logicJson       Json          @default("{}")

  surveyVersion   SurveyVersion @relation(fields: [surveyVersionId], references: [id], onDelete: Cascade)
  page            SurveyPage    @relation(fields: [pageId], references: [id], onDelete: Cascade)
  options         QuestionOption[]
  answers         Answer[]

  @@unique([surveyVersionId, code])
  @@index([pageId, orderIndex])
  @@index([surveyVersionId])
}

model QuestionOption {
  id           String     @id @default(uuid())
  questionId   String
  value        String
  label        String
  orderIndex   Int
  isOther      Boolean    @default(false)
  metadataJson Json       @default("{}")

  question     Question   @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@unique([questionId, value])
  @@index([questionId, orderIndex])
}

model Participant {
  id             String       @id @default(uuid())
  surveyId       String
  email          String?
  name           String?
  externalId     String?
  attributesJson Json         @default("{}")
  createdAt      DateTime     @default(now())

  survey         Survey       @relation(fields: [surveyId], references: [id], onDelete: Cascade)
  invitations    Invitation[]
  responseSessions ResponseSession[]

  @@index([surveyId, email])
  @@index([surveyId, externalId])
}

model Invitation {
  id            String           @id @default(uuid())
  participantId String
  surveyId      String
  tokenHash     String           @unique
  status        InvitationStatus @default(PENDING)
  sentAt        DateTime?
  expiresAt     DateTime?
  usedAt        DateTime?
  createdAt     DateTime         @default(now())

  participant   Participant      @relation(fields: [participantId], references: [id], onDelete: Cascade)
  survey        Survey           @relation(fields: [surveyId], references: [id], onDelete: Cascade)
  responseSessions ResponseSession[]

  @@index([surveyId, status])
}

model ResponseSession {
  id              String         @id @default(uuid())
  surveyId        String
  surveyVersionId String
  participantId   String?
  invitationId    String?
  status          ResponseStatus @default(STARTED)
  startedAt       DateTime       @default(now())
  submittedAt     DateTime?
  lastActivityAt  DateTime       @default(now())
  ipHash          String?
  userAgent       String?
  metadataJson    Json           @default("{}")

  survey          Survey         @relation(fields: [surveyId], references: [id], onDelete: Cascade)
  surveyVersion   SurveyVersion  @relation(fields: [surveyVersionId], references: [id])
  participant     Participant?   @relation(fields: [participantId], references: [id])
  invitation      Invitation?    @relation(fields: [invitationId], references: [id])
  answers         Answer[]

  @@index([surveyId, status])
  @@index([surveyVersionId])
  @@index([participantId])
  @@index([submittedAt])
}

model Answer {
  id                String          @id @default(uuid())
  responseSessionId String
  questionId        String
  valueJson         Json            @default("{}")
  displayValue      String?
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  responseSession   ResponseSession @relation(fields: [responseSessionId], references: [id], onDelete: Cascade)
  question          Question        @relation(fields: [questionId], references: [id])
  files             AnswerFile[]

  @@unique([responseSessionId, questionId])
  @@index([questionId])
}

model Quota {
  id            String    @id @default(uuid())
  surveyId      String
  name          String
  limit         Int
  conditionJson Json      @default("{}")
  actionJson    Json      @default("{}")
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  survey        Survey    @relation(fields: [surveyId], references: [id], onDelete: Cascade)

  @@index([surveyId, isActive])
}

model FileAsset {
  id             String       @id @default(uuid())
  organizationId String?
  ownerUserId    String?
  storageKey     String       @unique
  filename       String
  mimeType       String
  sizeBytes      Int
  category       FileCategory
  createdAt      DateTime     @default(now())

  organization   Organization? @relation(fields: [organizationId], references: [id])
  ownerUser      User?         @relation(fields: [ownerUserId], references: [id])
  answerFiles    AnswerFile[]
  exportJobs     ExportJob[]

  @@index([organizationId, category])
}

model AnswerFile {
  id          String    @id @default(uuid())
  answerId    String
  fileAssetId String

  answer      Answer    @relation(fields: [answerId], references: [id], onDelete: Cascade)
  fileAsset   FileAsset @relation(fields: [fileAssetId], references: [id])

  @@unique([answerId, fileAssetId])
}

model ExportJob {
  id            String       @id @default(uuid())
  surveyId      String
  requestedById String
  type          ExportType
  status        ExportStatus @default(QUEUED)
  filtersJson   Json         @default("{}")
  fileAssetId   String?
  errorMessage  String?
  createdAt     DateTime     @default(now())
  completedAt   DateTime?

  survey        Survey       @relation(fields: [surveyId], references: [id], onDelete: Cascade)
  requestedBy   User         @relation(fields: [requestedById], references: [id])
  fileAsset     FileAsset?   @relation(fields: [fileAssetId], references: [id])

  @@index([surveyId, status])
  @@index([requestedById])
}

model AuditLog {
  id             String        @id @default(uuid())
  organizationId String?
  actorUserId    String?
  action         String
  entityType     String
  entityId       String?
  metadataJson   Json          @default("{}")
  createdAt      DateTime      @default(now())

  organization   Organization? @relation(fields: [organizationId], references: [id])
  actorUser      User?         @relation(fields: [actorUserId], references: [id])

  @@index([organizationId, createdAt])
  @@index([action])
  @@index([entityType, entityId])
}

model ApiKey {
  id             String       @id @default(uuid())
  organizationId String
  name           String
  keyHash        String       @unique
  scopesJson     Json         @default("[]")
  lastUsedAt     DateTime?
  expiresAt      DateTime?
  createdAt      DateTime     @default(now())

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@index([organizationId])
}

model WebhookSubscription {
  id          String    @id @default(uuid())
  surveyId    String
  url         String
  eventTypes  Json      @default("[]")
  secret      String
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())

  survey      Survey    @relation(fields: [surveyId], references: [id], onDelete: Cascade)

  @@index([surveyId, isActive])
}

model DomainEvent {
  id          String    @id @default(uuid())
  type        String
  payloadJson Json      @default("{}")
  processedAt DateTime?
  createdAt   DateTime  @default(now())

  @@index([type, createdAt])
  @@index([processedAt])
}
```

### 11.3.1 prisma.config.ts (Prisma 7+ only)

Create this file at the project root (same level as `package.json`), not inside `prisma/`:

```typescript
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

This file is read by the Prisma **CLI** (`migrate`, `studio`, `db push`, etc.). It does not affect the runtime `PrismaClient` used inside the app — that is configured separately via a driver adapter.

### 11.3.2 PrismaClient with driver adapter (Prisma 7+ only)

Prisma 7 removed the bundled query engine, so `PrismaClient` must be given a driver adapter explicitly. Install it first:

```bash
npm install @prisma/adapter-pg pg
npm install -D @types/pg
```

Then create `src/lib/prisma.ts`:

```typescript
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

Import `prisma` from this file everywhere in the app instead of instantiating `new PrismaClient()` directly.

---

# 12. Survey Schema JSON Design

The `SurveyVersion.schemaJson` stores the complete immutable survey definition used by runtime.

## 12.1 Example Survey Schema

```json
{
  "surveyId": "survey_001",
  "versionId": "version_001",
  "versionNumber": 1,
  "title": "Customer Satisfaction Survey",
  "language": "en",
  "settings": {
    "showProgressBar": true,
    "allowBack": true,
    "savePartial": true,
    "anonymous": true
  },
  "pages": [
    {
      "id": "page_001",
      "title": "Basic Information",
      "orderIndex": 1,
      "questions": [
        {
          "id": "q_001",
          "code": "Q1",
          "type": "single_choice",
          "title": "Are you satisfied with our service?",
          "isRequired": true,
          "options": [
            { "id": "opt_1", "value": "yes", "label": "Yes" },
            { "id": "opt_2", "value": "no", "label": "No" }
          ],
          "config": {
            "display": "radio"
          },
          "validation": {},
          "logic": {}
        }
      ]
    }
  ],
  "logicRules": [
    {
      "id": "logic_001",
      "targetQuestionId": "q_002",
      "action": "show",
      "condition": {
        "all": [{ "questionId": "q_001", "operator": "equals", "value": "no" }]
      }
    }
  ]
}
```

## 12.2 Why keep both normalized tables and schemaJson?

Use both because each has a purpose:

| Storage                                       | Purpose                                                   |
| --------------------------------------------- | --------------------------------------------------------- |
| Normalized `Question`, `QuestionOption`, etc. | Querying, editing, reporting, permissions, validation.    |
| `schemaJson` snapshot                         | Fast immutable runtime rendering and historical accuracy. |

When publishing a survey:

1. Validate draft normalized records.
2. Generate `schemaJson` from normalized records.
3. Save immutable `SurveyVersion`.
4. Runtime uses `schemaJson`.

---

# 13. API Design

## 13.1 API Style

Use a combination of:

- **Server Actions** for admin UI mutations.
- **Route Handlers** for public APIs, webhooks, external integrations, and file downloads.
- **Server Components** for admin read pages where possible.

## 13.2 Internal Admin Routes

```txt
/admin
/admin/surveys
/admin/surveys/new
/admin/surveys/[surveyId]
/admin/surveys/[surveyId]/builder
/admin/surveys/[surveyId]/settings
/admin/surveys/[surveyId]/participants
/admin/surveys/[surveyId]/responses
/admin/surveys/[surveyId]/reports
/admin/surveys/[surveyId]/exports
/admin/organization/users
/admin/organization/settings
/admin/audit-logs
```

## 13.3 Public Runtime Routes

```txt
/s/[slug]
/s/[slug]/thank-you
/t/[token]
```

## 13.4 Route Handler API Endpoints

### Auth

```txt
GET/POST /api/auth/[...nextauth]
```

### Survey runtime

```txt
GET  /api/public/surveys/[slug]
POST /api/public/surveys/[slug]/sessions
PATCH /api/public/sessions/[sessionId]/answers
POST /api/public/sessions/[sessionId]/submit
GET  /api/public/tokens/[token]
```

### Admin survey management

```txt
GET    /api/admin/surveys
POST   /api/admin/surveys
GET    /api/admin/surveys/[surveyId]
PATCH  /api/admin/surveys/[surveyId]
DELETE /api/admin/surveys/[surveyId]
POST   /api/admin/surveys/[surveyId]/publish
POST   /api/admin/surveys/[surveyId]/pause
POST   /api/admin/surveys/[surveyId]/close
```

### Builder

```txt
GET   /api/admin/surveys/[surveyId]/draft
PUT   /api/admin/surveys/[surveyId]/draft
POST  /api/admin/surveys/[surveyId]/pages
PATCH /api/admin/pages/[pageId]
POST  /api/admin/pages/[pageId]/questions
PATCH /api/admin/questions/[questionId]
DELETE /api/admin/questions/[questionId]
```

### Participants

```txt
GET  /api/admin/surveys/[surveyId]/participants
POST /api/admin/surveys/[surveyId]/participants/import
POST /api/admin/surveys/[surveyId]/invitations/send
POST /api/admin/surveys/[surveyId]/invitations/remind
```

### Reports/exports

```txt
GET  /api/admin/surveys/[surveyId]/reports/overview
GET  /api/admin/surveys/[surveyId]/reports/questions
GET  /api/admin/surveys/[surveyId]/responses
GET  /api/admin/surveys/[surveyId]/responses/[responseId]
POST /api/admin/surveys/[surveyId]/exports
GET  /api/admin/exports/[exportJobId]
```

### Integration API

```txt
POST /api/v1/survey-links
GET  /api/v1/surveys
GET  /api/v1/surveys/[surveyId]/responses
POST /api/v1/webhooks/test
```

## 13.5 Example API Contracts

### Create Survey

Request:

```json
{
  "organizationId": "org_001",
  "title": "Customer Feedback",
  "description": "Monthly customer feedback survey"
}
```

Response:

```json
{
  "id": "survey_001",
  "title": "Customer Feedback",
  "status": "DRAFT",
  "builderUrl": "/admin/surveys/survey_001/builder"
}
```

### Submit Response

Request:

```json
{
  "answers": [
    {
      "questionId": "q_001",
      "valueJson": { "optionId": "opt_yes" }
    },
    {
      "questionId": "q_002",
      "valueJson": { "text": "Good service" }
    }
  ]
}
```

Response:

```json
{
  "status": "SUBMITTED",
  "responseSessionId": "resp_001",
  "thankYouUrl": "/s/customer-feedback/thank-you"
}
```

---

# 14. Permissions and RBAC

## 14.1 Permission Matrix

| Permission                   | Owner | Admin | Survey Manager | Analyst | Viewer |
| ---------------------------- | ----: | ----: | -------------: | ------: | -----: |
| Manage organization settings |   Yes |   Yes |             No |      No |     No |
| Manage users                 |   Yes |   Yes |             No |      No |     No |
| Create survey                |   Yes |   Yes |            Yes |      No |     No |
| Edit survey                  |   Yes |   Yes |            Yes |      No |     No |
| Publish survey               |   Yes |   Yes |            Yes |      No |     No |
| Close survey                 |   Yes |   Yes |            Yes |      No |     No |
| Manage participants          |   Yes |   Yes |            Yes |      No |     No |
| View reports                 |   Yes |   Yes |            Yes |     Yes |    Yes |
| Export responses             |   Yes |   Yes |            Yes |     Yes |     No |
| View audit logs              |   Yes |   Yes |             No |      No |     No |
| Manage API keys              |   Yes |   Yes |             No |      No |     No |

## 14.2 Permission check pattern

Never rely only on frontend hiding buttons.

Every server action/API route should check:

1. User is authenticated.
2. User belongs to organization.
3. User has required role/permission.
4. Target resource belongs to same organization.

Example:

```ts
await requirePermission({
  userId: session.user.id,
  organizationId,
  permission: "survey.publish",
});
```

---

# 15. Validation Design

## 15.1 Validation levels

| Level                | Purpose                                          |
| -------------------- | ------------------------------------------------ |
| UI validation        | Fast feedback to user.                           |
| Server validation    | Security and data correctness.                   |
| Database constraints | Last line of defense.                            |
| Publish validation   | Ensure survey schema is valid before public use. |

## 15.2 Question answer validation

Each question type should provide a validator:

```ts
type QuestionAnswerValidator = (args: {
  question: SurveyQuestionSchema;
  value: unknown;
  allAnswers: Record<string, unknown>;
}) => ValidationResult;
```

Example validation result:

```ts
type ValidationResult = {
  valid: boolean;
  errors: Array<{
    code: string;
    message: string;
  }>;
};
```

## 15.3 Publish validation checklist

Before publishing:

- Survey has title.
- Survey has at least one page.
- Survey has at least one answerable question.
- Each question has unique code.
- Required choice questions have options.
- Logic rules reference existing questions/options.
- No circular branching logic.
- Quota rules reference existing questions/options.
- File upload rules have max size/type.
- Thank-you message/page exists.

---

# 16. Security Design

## 16.1 Admin security

- Use secure authentication.
- Enable CSRF protection for mutations.
- Use server-side permission checks.
- Validate all input using Zod.
- Rate-limit sensitive endpoints.
- Log admin actions.
- Use secure cookies.
- Use HTTPS only.

## 16.2 Public survey security

- Rate-limit survey start and submit endpoints.
- Add CAPTCHA for public anonymous surveys if spam is a concern.
- Validate token survey access.
- Prevent duplicate token submission if configured.
- Sanitize text displayed from user input.
- Limit file upload size and MIME type.
- Store uploaded files outside public web root.

## 16.3 API security

- Hash API keys in database.
- Use scopes.
- Use rate limits.
- Support key expiry.
- Log API access.
- Use signed webhook payloads.

## 16.4 Privacy

- Avoid storing raw IP address if not required.
- Store IP hash if needed for duplicate detection.
- Allow deleting/anonymizing responses if required.
- Separate participant identity from response answers when anonymous mode is enabled.
- Apply data retention rules per organization/survey.

---

# 17. Survey Runtime Rules

## 17.1 Survey availability check

Before showing survey:

1. Survey exists.
2. Survey status is `PUBLISHED`.
3. Active version exists.
4. Current date is after `startAt` if set.
5. Current date is before `endAt` if set.
6. Token is valid if private.
7. Quota is not full before starting if pre-check is possible.

## 17.2 Page navigation

When respondent clicks Next:

1. Save current page answers.
2. Evaluate logic rules.
3. Validate visible required questions.
4. Check quotas/screening rules.
5. Determine next visible page.
6. Continue or submit.

## 17.3 Hidden question handling

When a question becomes hidden due to logic:

Option A: Keep old answer but mark hidden.

Option B: Clear answer.

Recommended default: **Clear hidden answers on final submit**, unless survey setting says preserve hidden answers.

Reason: hidden answers can pollute reports.

---

# 18. Reporting Model

## 18.1 Question summary logic

### Single choice

Count selected option IDs.

```json
{
  "questionId": "q_gender",
  "type": "single_choice",
  "total": 100,
  "options": [
    { "optionId": "male", "label": "Male", "count": 60, "percent": 60 },
    { "optionId": "female", "label": "Female", "count": 40, "percent": 40 }
  ]
}
```

### Multiple choice

Count each option independently.

### Text

Show response list, word cloud optional, AI summary optional.

### Matrix

Aggregate by row and column.

### Rating/NPS

Show average, distribution, min/max.

## 18.2 Filtering

Filters should support:

- Date range.
- Response status.
- Participant attribute.
- Answer condition.
- Token/invitation status.
- Completion duration.

Filter example:

```json
{
  "status": "SUBMITTED",
  "dateRange": {
    "from": "2026-07-01",
    "to": "2026-07-31"
  },
  "answers": [
    {
      "questionId": "q_country",
      "operator": "equals",
      "value": "MY"
    }
  ]
}
```

---

# 19. Folder Structure

## 19.1 Recommended Project Structure

```txt
survey-platform/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (admin)/
│   │   └── admin/
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       ├── surveys/
│   │       │   ├── page.tsx
│   │       │   ├── new/
│   │       │   └── [surveyId]/
│   │       │       ├── page.tsx
│   │       │       ├── builder/
│   │       │       ├── settings/
│   │       │       ├── participants/
│   │       │       ├── responses/
│   │       │       ├── reports/
│   │       │       └── exports/
│   │       ├── organization/
│   │       └── audit-logs/
│   ├── s/
│   │   └── [slug]/
│   │       ├── page.tsx
│   │       └── thank-you/
│   ├── t/
│   │   └── [token]/
│   │       └── page.tsx
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── public/
│       ├── admin/
│       └── v1/
├── components/
│   ├── ui/
│   ├── layout/
│   └── charts/
├── features/
│   ├── auth/
│   ├── organizations/
│   ├── surveys/
│   ├── builder/
│   ├── questions/
│   ├── logic/
│   ├── runtime/
│   ├── participants/
│   ├── responses/
│   ├── reports/
│   ├── exports/
│   ├── files/
│   ├── audit/
│   └── integrations/
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   ├── env.ts
│   ├── permissions.ts
│   ├── rate-limit.ts
│   └── utils.ts
├── server/
│   ├── jobs/
│   ├── email/
│   ├── storage/
│   └── events/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── types/
│   ├── survey-schema.ts
│   ├── question-types.ts
│   └── api.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docker-compose.yml
├── Dockerfile
├── next.config.ts
├── package.json
└── README.md
```

---

# 20. Key Services

## 20.1 SurveyService

Responsibilities:

- Create survey.
- Update settings.
- Get survey list.
- Archive survey.
- Publish survey.
- Validate survey before publishing.

Important methods:

```ts
createSurvey(input);
updateSurvey(surveyId, input);
getSurveyById(surveyId);
getSurveyDraft(surveyId);
publishSurvey(surveyId);
closeSurvey(surveyId);
archiveSurvey(surveyId);
```

## 20.2 BuilderService

Responsibilities:

- Save pages/questions/options.
- Reorder pages/questions/options.
- Validate draft schema.
- Generate schema snapshot.

Important methods:

```ts
saveDraft(surveyId, draft);
addPage(surveyId, input);
updatePage(pageId, input);
addQuestion(pageId, input);
updateQuestion(questionId, input);
deleteQuestion(questionId);
generateSurveySchema(surveyId);
```

## 20.3 RuntimeService

Responsibilities:

- Load active survey.
- Start response session.
- Save partial answers.
- Submit response.
- Validate runtime answers.

Important methods:

```ts
loadPublicSurvey(slug);
loadTokenSurvey(token);
startSession(surveyId, context);
saveAnswers(sessionId, answers);
submitResponse(sessionId, answers);
```

## 20.4 LogicEngine

Responsibilities:

- Evaluate conditions.
- Determine visibility.
- Determine branching.
- Evaluate quota conditions.

Important methods:

```ts
evaluateCondition(condition, answers);
getVisibleQuestions(schema, answers);
getNextPage(schema, currentPageId, answers);
evaluateQuotas(surveyId, answers);
```

## 20.5 ReportService

Responsibilities:

- Overview metrics.
- Question summaries.
- Response table.
- Individual response view.
- Filters.

Important methods:

```ts
getOverview(surveyId, filters);
getQuestionSummary(surveyId, questionId, filters);
getResponseTable(surveyId, filters);
getResponseDetail(responseSessionId);
```

## 20.6 ExportService

Responsibilities:

- Create export job.
- Transform normalized answers to flat rows.
- Generate CSV/XLSX/PDF.
- Store export file.

Important methods:

```ts
requestExport(surveyId, type, filters);
processExportJob(exportJobId);
buildFlatRows(surveyVersion, responses);
```

---

# 21. Logic Engine Detailed Design

## 21.1 Answer access helper

The logic engine needs a consistent way to read answers.

```ts
type AnswerMap = Record<string, unknown>;

function getAnswerValue(answers: AnswerMap, questionId: string) {
  return answers[questionId];
}
```

## 21.2 Condition evaluator pseudocode

```ts
function evaluateCondition(condition, answers) {
  if (condition.all) {
    return condition.all.every((c) => evaluateCondition(c, answers));
  }

  if (condition.any) {
    return condition.any.some((c) => evaluateCondition(c, answers));
  }

  const answer = getAnswerValue(answers, condition.questionId);
  return evaluateOperator(answer, condition.operator, condition.value);
}
```

## 21.3 Visibility evaluation

```ts
function getVisibleQuestions(schema, answers) {
  const hidden = new Set();
  const visible = new Set(schema.questions.map((q) => q.id));

  for (const rule of schema.logicRules) {
    const matched = evaluateCondition(rule.condition, answers);

    if (rule.action === "show") {
      if (!matched) hidden.add(rule.targetQuestionId);
    }

    if (rule.action === "hide") {
      if (matched) hidden.add(rule.targetQuestionId);
    }
  }

  return schema.questions.filter((q) => !hidden.has(q.id));
}
```

---

# 22. Survey Versioning Design

## 22.1 Why versioning is mandatory

Without versioning:

- Admin edits a question after responses exist.
- Old answers may no longer match new question/options.
- Reports become inaccurate.
- Export columns change unexpectedly.

With versioning:

- Response always belongs to the exact schema used during submission.
- Admin can edit draft safely.
- Reports can group by version or combine versions carefully.

## 22.2 Version states

```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Published: Publish
    Published --> Archived: Archive old version
    Published --> Draft: Create new draft from published
    Draft --> Archived: Discard draft
```

## 22.3 Editing published survey

When editing a published survey:

1. Clone active published version into a new draft version.
2. Admin edits the draft.
3. On publish, create new published version.
4. Set old version to archived or keep published but inactive.
5. New responses use new active version.
6. Old responses still point to old version.

---

# 23. Deployment Architecture

## 23.1 Simple VPS Deployment

```mermaid
flowchart TD
    U[User Browser] --> N[Nginx Reverse Proxy]
    N --> A[Next.js Docker Container]
    A --> P[(PostgreSQL Container/Managed DB)]
    A --> R[(Redis Optional)]
    A --> S[S3 Compatible Storage]
    A --> E[Email Provider]
```

Recommended VPS setup:

- Nginx reverse proxy.
- Docker Compose.
- Next.js app container.
- PostgreSQL managed DB or container.
- Redis container if using background jobs.
- S3-compatible storage: AWS S3, Cloudflare R2, DigitalOcean Spaces, MinIO.
- Certbot/Let's Encrypt for HTTPS.

## 23.2 Docker Compose Example

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    depends_on:
      - db
      - redis

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: survey_user
      POSTGRES_PASSWORD: survey_password
      POSTGRES_DB: survey_platform
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

## 23.3 Environment Variables

```txt
DATABASE_URL="postgresql://survey_user:survey_password@localhost:5432/survey_platform"
NEXTAUTH_URL="https://survey.example.com"
NEXTAUTH_SECRET="replace-with-secure-secret"
AUTH_SECRET="replace-with-secure-secret"
REDIS_URL="redis://localhost:6379"
S3_ENDPOINT=""
S3_ACCESS_KEY_ID=""
S3_SECRET_ACCESS_KEY=""
S3_BUCKET="survey-platform"
EMAIL_FROM="noreply@example.com"
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASSWORD=""
```

---

# 24. Performance Design

## 24.1 Expected bottlenecks

| Area                  | Risk                     | Solution                                         |
| --------------------- | ------------------------ | ------------------------------------------------ |
| Public survey traffic | Many respondents at once | Cache survey schema, optimize runtime.           |
| Response submission   | High write volume        | Batch writes, indexed tables.                    |
| Reports               | Heavy aggregation        | Precompute aggregates or use materialized views. |
| Exports               | Large file generation    | Background jobs.                                 |
| File uploads          | Large files              | Direct-to-S3 upload.                             |

## 24.2 Caching strategy

Cache:

- Published survey schema by slug/version.
- Question type registry.
- Organization settings.
- Theme config.

Do not cache carelessly:

- Admin permissions without invalidation.
- Response data.
- Token validation result after token is used.

## 24.3 Database indexes

Important indexes:

- `Survey(organizationId, status)`
- `Survey(organizationId, slug)` unique
- `SurveyVersion(surveyId, status)`
- `ResponseSession(surveyId, status)`
- `ResponseSession(submittedAt)`
- `Answer(responseSessionId, questionId)` unique
- `Answer(questionId)`
- `Invitation(tokenHash)` unique
- `Participant(surveyId, email)`
- `AuditLog(organizationId, createdAt)`

---

# 25. Testing Strategy

## 25.1 Unit tests

Test:

- Logic engine.
- Question validators.
- Permission checks.
- Survey publish validation.
- Export row transformation.

## 25.2 Integration tests

Test:

- Create survey flow.
- Publish survey flow.
- Start response session.
- Submit response.
- Token validation.
- Report summary query.

## 25.3 E2E tests

Test with Playwright:

- Admin creates survey.
- Admin adds questions.
- Admin publishes survey.
- Respondent submits survey.
- Analyst views report.
- Analyst exports CSV.

## 25.4 Critical test cases

| Area        | Test                                                   |
| ----------- | ------------------------------------------------------ |
| Versioning  | Old response still valid after survey is edited.       |
| Logic       | Hidden required question does not block submission.    |
| Token       | Used single-use token cannot submit again.             |
| Quota       | Quota full blocks matching respondents.                |
| Export      | Export columns match published version question codes. |
| Permissions | Viewer cannot export responses.                        |

---

# 26. Development Roadmap

## Phase 1: Foundation

- Create Next.js project.
- Setup TypeScript.
- Setup Tailwind/shadcn.
- Setup Prisma/PostgreSQL.
- Setup Auth.js.
- Create organization/user/role models.
- Create admin layout.

## Phase 2: Survey CRUD

- Create survey.
- List surveys.
- Edit survey metadata.
- Survey status management.
- Draft version creation.

## Phase 3: Survey Builder MVP

- Add pages.
- Add questions.
- Add options.
- Reorder items.
- Save draft.
- Preview survey.
- Publish survey.

Recommended V1 question types:

- Short text.
- Long text.
- Number.
- Date.
- Single choice.
- Multiple choice.
- Rating.
- Display text.

## Phase 4: Public Runtime

- Public survey route.
- Render pages/questions.
- Start response session.
- Save answers.
- Submit response.
- Thank-you page.

## Phase 5: Logic and Validation

- Required validation.
- Min/max validation.
- Display logic.
- Basic branching.
- Hidden answer handling.

## Phase 6: Participants and Tokens

- Participant table.
- CSV import.
- Token generation.
- Token survey route.
- Invitation email.
- Duplicate submission prevention.

## Phase 7: Reports

- Overview dashboard.
- Response table.
- Individual response view.
- Question summaries.
- CSV export.

## Phase 8: Advanced Features

- Quotas.
- XLSX/PDF exports.
- File upload question.
- Webhooks.
- API keys.
- Audit logs.
- Advanced analytics.

## Phase 9: Hardening

- Rate limits.
- Logging.
- Monitoring.
- Backups.
- Security testing.
- Performance testing.

---

# 27. MVP Scope Recommendation

For the first working version, build this only:

1. Login.
2. Organization with roles.
3. Survey CRUD.
4. Basic builder.
5. 6-8 question types.
6. Publish version.
7. Public survey response.
8. Basic reports.
9. CSV export.

Do not start with:

- Full plugin engine.
- Advanced ExpressionScript clone.
- Complex matrix question variants.
- AI analytics.
- Multi-language translation.
- Real-time collaboration.

Reason: the survey builder + runtime + reporting core is already a large system.

---

# 28. Comparison with LimeSurvey Concepts

| LimeSurvey Concept            | New System Concept               |
| ----------------------------- | -------------------------------- |
| Survey                        | Survey                           |
| Question group                | SurveyPage / Section             |
| Question                      | Question                         |
| Answer options                | QuestionOption                   |
| Conditions                    | LogicRule / logicJson            |
| Tokens                        | Participant + Invitation         |
| Dynamic survey response table | ResponseSession + Answer         |
| Export responses              | ExportJob + ReportService        |
| Templates/themes              | Theme settings JSON              |
| Plugins                       | Domain events + internal modules |
| RemoteControl API             | Integration API `/api/v1/*`      |
| Statistics                    | ReportService + Analytics module |

---

# 29. Example Implementation Commands

## 29.1 Create project

```bash
npx create-next-app@latest survey-platform \
  --typescript \
  --eslint \
  --tailwind \
  --app \
  --src-dir
```

## 29.2 Install core dependencies

```bash
npm install @prisma/client zod react-hook-form @hookform/resolvers
npm install next-auth
npm install -D prisma
```

For Prisma 7+, also install the PostgreSQL driver adapter (required — see 11.3.2):

```bash
npm install @prisma/adapter-pg pg
npm install -D @types/pg
```

## 29.3 Initialize Prisma

```bash
npx prisma init
```

This generates `prisma/schema.prisma` and, on Prisma 7+, `prisma.config.ts`. Replace the generated `schema.prisma` with the model definitions from section 11.3, and confirm `prisma.config.ts` matches section 11.3.1 (`datasource.url` pointing to `env("DATABASE_URL")`). Do **not** leave `url` inside the `datasource` block of `schema.prisma` on Prisma 7+ — that now causes a `P1012` validation error.

## 29.4 Run migration

```bash
npx prisma migrate dev --name init
```

## 29.5 Generate Prisma client

```bash
npx prisma generate
```

## 29.6 Check your Prisma version

Prisma's config format changed significantly between v6 and v7. Before following 11.3.1/11.3.2, confirm which major version is installed — the steps are not interchangeable:

```bash
npx prisma --version
```

---

# 30. Coding Standards

## 30.1 Naming

| Item            | Convention       | Example          |
| --------------- | ---------------- | ---------------- |
| DB model        | PascalCase       | `SurveyVersion`  |
| DB field        | camelCase        | `createdAt`      |
| Route folder    | kebab-case       | `audit-logs`     |
| Feature folder  | kebab-case       | `survey-builder` |
| TypeScript type | PascalCase       | `SurveySchema`   |
| Constants       | UPPER_SNAKE_CASE | `MAX_FILE_SIZE`  |

## 30.2 Service rule

Do not put Prisma calls directly inside random UI components.

Preferred flow:

```txt
Page/Component -> Server Action/Route Handler -> Service -> Query/Repository -> Prisma
```

## 30.3 Error handling

Use typed errors:

```ts
class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 400
  ) {
    super(message);
  }
}
```

Example codes:

```txt
SURVEY_NOT_FOUND
SURVEY_NOT_PUBLISHED
PERMISSION_DENIED
TOKEN_INVALID
TOKEN_EXPIRED
VALIDATION_FAILED
QUOTA_FULL
EXPORT_FAILED
```

---

# 31. Admin UI Pages

## 31.1 Dashboard

Show:

- Total surveys.
- Active surveys.
- Responses this month.
- Recent activity.
- Recent exports.

## 31.2 Survey List

Columns:

- Title.
- Status.
- Responses.
- Created by.
- Updated at.
- Actions.

Filters:

- Status.
- Owner.
- Date.
- Search title.

## 31.3 Survey Builder

Main features:

- Page list.
- Question canvas.
- Right settings panel.
- Question type selector.
- Preview mode.
- Publish validation result.

## 31.4 Participants Page

Features:

- Import CSV.
- Add manually.
- Generate tokens.
- Send invitations.
- Send reminders.
- View status.

## 31.5 Reports Page

Tabs:

- Overview.
- Question Summary.
- Responses.
- Cross-tab.
- Exports.

---

# 32. Public Survey UI

## 32.1 Public layout

```txt
+---------------------------------------+
| Logo / Survey title                    |
| Progress bar                           |
+---------------------------------------+
| Page title                             |
| Description                            |
| Question 1                             |
| Question 2                             |
| Question 3                             |
+---------------------------------------+
| Back                         Next      |
+---------------------------------------+
```

## 32.2 Accessibility

- Every input must have a label.
- Error messages must be linked to inputs.
- Keyboard navigation must work.
- Color contrast must be acceptable.
- Required questions should be clearly marked.

## 32.3 Mobile behavior

- Single-column layout.
- Large tap targets.
- Sticky next button optional.
- Avoid very wide matrix questions on mobile; use stacked layout.

---

# 33. Data Import and Export

## 33.1 Participant CSV import

Example CSV:

```csv
email,name,department,external_id
ali@example.com,Ali,Sales,E001
siti@example.com,Siti,HR,E002
```

Import process:

1. Upload CSV.
2. Parse headers.
3. Map fields.
4. Validate emails.
5. Preview rows.
6. Confirm import.
7. Create participants.
8. Generate invitations if requested.

## 33.2 Response export

Export formats:

- CSV.
- XLSX.
- JSON.
- PDF summary.

CSV export should include:

- Response ID.
- Status.
- Started at.
- Submitted at.
- Duration.
- Participant fields if allowed.
- One column per question.

---

# 34. AI Analytics Optional Module

This is optional and should come after core reporting.

## 34.1 Features

- Sentiment analysis for text answers.
- Thematic clustering.
- Summary of open-ended feedback.
- Trend analysis over time.
- Suggested action items.

## 34.2 Data flow

```mermaid
flowchart TD
    A[Submitted Responses] --> B[Text Extraction]
    B --> C[AI Processing Job]
    C --> D[Sentiment/Themes/Summary]
    D --> E[(Analytics Tables)]
    E --> F[AI Report Dashboard]
```

## 34.3 AI tables to add later

- `AiAnalysisJob`
- `AiQuestionSummary`
- `AiTheme`
- `AiSentimentResult`

---

# 35. Future Advanced Features

| Feature                   | Notes                                                        |
| ------------------------- | ------------------------------------------------------------ |
| Multi-language surveys    | Add translation tables for survey/page/question/option text. |
| Real-time collaboration   | Use WebSockets/Liveblocks/Yjs.                               |
| Advanced ExpressionScript | Build formula parser/evaluator.                              |
| Offline survey mode       | PWA + local storage sync.                                    |
| White-label domains       | Custom domains per organization.                             |
| Advanced quotas           | Nested quota groups and priority rules.                      |
| Webhook retries           | Retry failed webhooks with exponential backoff.              |
| BI connector              | Export to Bold BI/Power BI using views/API.                  |
| Audit compliance          | Immutable logs and retention policies.                       |

---

# 36. BI / Bold BI Integration Design

If the goal is to use Bold BI or another BI tool, provide clean reporting sources.

## 36.1 Option A: API-based BI

Expose endpoints:

```txt
GET /api/v1/surveys/[surveyId]/responses-flat
GET /api/v1/surveys/[surveyId]/questions
GET /api/v1/surveys/[surveyId]/summary
```

Pros:

- Secure.
- Controlled.
- Can apply permissions.

Cons:

- BI tool must support API source.

## 36.2 Option B: Reporting views

Create database views/materialized views:

```txt
vw_survey_responses_flat
vw_survey_question_summary
vw_survey_participants
```

Pros:

- Easy for BI tools.
- Fast if materialized.

Cons:

- Must manage refresh.
- Dynamic columns are harder.

## 36.3 Option C: Scheduled export

Generate CSV/XLSX on schedule and let BI ingest it.

Pros:

- Simple.
- Works with many tools.

Cons:

- Not real-time.

Recommended: **Start with API + CSV export. Add materialized views later.**

---

# 37. Important Risks

| Risk                              | Impact                 | Mitigation                                      |
| --------------------------------- | ---------------------- | ----------------------------------------------- |
| Builder complexity grows too fast | Development delay      | Limit MVP question types.                       |
| Logic engine becomes too complex  | Bugs in runtime        | Build strong tests for conditions.              |
| Reports become slow               | Bad UX                 | Add aggregates/materialized views.              |
| Survey edits break responses      | Data corruption        | Use immutable versions.                         |
| Token privacy issues              | Security problem       | Hash tokens and separate identity from answers. |
| File upload abuse                 | Storage/security issue | Limit size/type, scan files.                    |
| Permission bugs                   | Data leak              | Server-side RBAC for every action.              |

---

# 38. Recommended First Milestone

Build this first milestone:

```txt
Milestone 1: Working Survey MVP

Admin:
- Login
- Create survey
- Add pages
- Add short text question
- Add single choice question
- Publish survey

Public:
- Open survey link
- Fill survey
- Submit response

Report:
- View response count
- View response table
- Export CSV
```

Once this works end-to-end, add more question types and logic.

---

# 39. References

These references are useful for implementation decisions:

- Next.js Documentation: https://nextjs.org/docs
- Next.js Route Handlers: https://nextjs.org/docs/app/getting-started/route-handlers
- Next.js Server Functions / Mutating Data: https://nextjs.org/docs/app/getting-started/mutating-data
- Next.js Fetching Data: https://nextjs.org/docs/app/getting-started/fetching-data
- Prisma ORM Documentation: https://www.prisma.io/docs/orm
- Prisma Schema Documentation: https://www.prisma.io/docs/orm/prisma-schema/overview
- Prisma Relations Documentation: https://www.prisma.io/docs/orm/prisma-schema/data-model/relations
- Auth.js / NextAuth: https://next-auth.js.org/

---

# 40. Final Recommendation

Use Next.js for the whole system if your team wants one modern TypeScript codebase. Keep the architecture as a modular monolith first. Build the core survey lifecycle before advanced features.

The most important rules are:

1. Use immutable survey versions.
2. Do not use dynamic response tables as the main storage model.
3. Keep question behavior in a question type registry.
4. Keep logic engine isolated and heavily tested.
5. Keep reporting/export transformation separate from runtime submission.
6. Check permissions on the server for every sensitive action.

This design gives you a clean foundation for a modern LimeSurvey-like platform without carrying over unnecessary legacy complexity.
