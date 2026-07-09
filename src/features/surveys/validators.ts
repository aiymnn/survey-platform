import { z } from "zod";

export const createSurveySchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  welcomeMessage: z.string().optional(),
  endMessage: z.string().optional(),
});
export type CreateSurveyInput = z.infer<typeof createSurveySchema>;

export const updateSurveySettingsSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  welcomeMessage: z.string().optional(),
  endMessage: z.string().optional(),
});
export type UpdateSurveySettingsInput = z.infer<typeof updateSurveySettingsSchema>;