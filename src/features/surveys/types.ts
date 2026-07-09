export type QuestionType = "text_short" | "text_long" | "choice_single";

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
}

export interface QuestionSchema {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  options?: QuestionOption[]; // Used for choice_single
}

export interface SurveySchemaJson {
  title: string;
  description: string;
  questions: QuestionSchema[];
}
