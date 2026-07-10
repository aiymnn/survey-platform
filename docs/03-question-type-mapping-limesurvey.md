# 03 - LimeSurvey-like Question Type Mapping

## 1. Purpose

This document defines a more complete question type registry inspired by LimeSurvey. Each question type must have builder behavior, runtime rendering, answer validation, reporting aggregation, and export transformation.

## 2. Registry Contract

```ts
type QuestionTypeDefinition = {
  type: string;
  limeSurveyCode?: string;
  label: string;
  category: string;
  builderComponent: React.ComponentType<any>;
  runtimeComponent: React.ComponentType<any>;
  reportComponent: React.ComponentType<any>;
  defaultConfig: Record<string, unknown>;
  validateConfig: (config: unknown) => ValidationResult;
  validateAnswer: (answer: unknown, question: SurveyQuestionSchema) => ValidationResult;
  toDisplayValue: (answer: unknown, question: SurveyQuestionSchema, locale: string) => string;
  toExportValue: (answer: unknown, question: SurveyQuestionSchema, format: ExportFormat) => unknown;
};
```

## 3. Question Categories

| Category | Description |
|---|---|
| Mask Questions | Date, numeric, text, file upload, equation. |
| Single Choice | Yes/no, gender, list radio, list dropdown, language switch. |
| Multiple Choice | Checkbox, checkbox with comments. |
| Array/Matrix | Array radio, checkbox matrix, text matrix, numeric matrix, dual scale. |
| Ranking/Rating | Ranking, rating scale, NPS, slider. |
| Text Display | Text display, boilerplate, consent. |
| Advanced/Computed | Equation, hidden field, computed score. |

## 4. Mapping Table

| New Type | LimeSurvey-like Code | Category | Answer Shape | Reporting |
|---|---:|---|---|---|
| `short_text` | `S` | Mask | `{ "text": "..." }` | Text list/search. |
| `long_text` | `T` | Mask | `{ "text": "..." }` | Text list/AI summary. |
| `huge_text` | `U` | Mask | `{ "text": "..." }` | Text list/AI summary. |
| `number` | `N` | Mask | `{ "number": 10 }` | Avg/min/max/distribution. |
| `multiple_numeric` | `K` | Mask | `{ "items": {"sq1": 10} }` | Per-row numeric summary. |
| `date` | `D` | Mask | `{ "date": "2026-07-03" }` | Date distribution. |
| `file_upload` | `|` | Mask | `{ "fileIds": [] }` | File list/count. |
| `equation` | `*` | Advanced | `{ "value": 123 }` | Computed value. |
| `yes_no` | `Y` | Single Choice | `{ "optionId": "Y" }` | Yes/no count. |
| `gender` | `G` | Single Choice | `{ "optionId": "M" }` | Option count. |
| `single_choice_radio` | `L` | Single Choice | `{ "optionId": "A1" }` | Option count. |
| `single_choice_dropdown` | `!` | Single Choice | `{ "optionId": "A1" }` | Option count. |
| `single_choice_comment` | `O` | Single Choice | `{ "optionId": "A1", "comment": "..." }` | Option count + comments. |
| `language_switch` | `I` | Single Choice | `{ "language": "ms" }` | Language count. |
| `multiple_choice` | `M` | Multiple Choice | `{ "optionIds": ["A1"] }` | Independent option count. |
| `multiple_choice_comment` | `P` | Multiple Choice | `{ "items": {"A1": {"checked": true, "comment": "..."}} }` | Option count + comments. |
| `array_single` | `F` | Array | `{ "rows": {"SQ1": "A1"} }` | Matrix distribution. |
| `array_5_point` | `5` | Array | `{ "rows": {"SQ1": 3} }` | Likert summary. |
| `array_10_point` | `B` | Array | `{ "rows": {"SQ1": 7} }` | Likert summary. |
| `array_yes_no_uncertain` | `C` | Array | `{ "rows": {"SQ1": "Y"} }` | Per-row count. |
| `array_increase_same_decrease` | `E` | Array | `{ "rows": {"SQ1": "I"} }` | Per-row count. |
| `array_multi` | `A` | Array | `{ "rows": {"SQ1": ["A1"]} }` | Checkbox matrix. |
| `array_text` | `;` | Array | `{ "rows": {"SQ1": {"A1": "text"}} }` | Text matrix. |
| `array_numbers` | `:` | Array | `{ "rows": {"SQ1": {"A1": 10}} }` | Numeric matrix. |
| `array_dual_scale` | `1` | Array | `{ "rows": {"SQ1": {"scale1":"A1", "scale2":"B1"}} }` | Dual distribution. |
| `ranking` | `R` | Ranking | `{ "order": ["A3", "A1"] }` | Average rank. |
| `slider` | `slider` | Rating | `{ "value": 50 }` | Avg/min/max. |
| `nps` | `nps` | Rating | `{ "score": 9 }` | NPS score. |
| `display_text` | `X` | Text Display | `{}` | No answer. |
| `consent` | `consent` | Text Display | `{ "accepted": true }` | Accepted count. |

## 5. Question Definition Example

```json
{
  "id": "q_001",
  "code": "Q1",
  "type": "array_5_point",
  "title": "Please rate the following services",
  "subquestions": [
    { "id": "sq_001", "code": "SQ001", "label": "Support" },
    { "id": "sq_002", "code": "SQ002", "label": "Delivery" }
  ],
  "options": [
    { "id": "a_1", "value": "1", "label": "Strongly disagree" },
    { "id": "a_2", "value": "2", "label": "Disagree" },
    { "id": "a_3", "value": "3", "label": "Neutral" },
    { "id": "a_4", "value": "4", "label": "Agree" },
    { "id": "a_5", "value": "5", "label": "Strongly agree" }
  ],
  "config": {
    "randomizeRows": false,
    "randomizeColumns": false,
    "mandatory": true
  }
}
```

## 6. Additional Data Model

Subquestions are first-class records for array/matrix/multiple-numeric types.

```prisma
model QuestionSubquestion {
  id           String @id @default(uuid())
  questionId   String
  code         String
  label        String
  orderIndex   Int
  metadataJson Json   @default("{}")

  @@unique([questionId, code])
  @@index([questionId, orderIndex])
}
```

## 7. Export Column Strategy

| Type | Export Columns |
|---|---|
| Single choice | `Q1` |
| Multiple choice | `Q1_A1`, `Q1_A2`, `Q1_OTHER` |
| Array single | `Q1_SQ001`, `Q1_SQ002` |
| Array dual scale | `Q1_SQ001_0`, `Q1_SQ001_1` |
| Multiple choice with comment | `Q1_A1`, `Q1_A1comment` |
| File upload | `Q1_file_count`, `Q1_files` |
| Ranking | `Q1_rank_1`, `Q1_rank_2`, `Q1_rank_3` |

## 8. Implementation Notes

- Each type must be isolated in its own folder.
- Do not hardcode rendering in the survey runtime.
- Use the registry to map type to components and services.
- Add unit tests for every question type's config validation, answer validation, export transformation, and report aggregation.
