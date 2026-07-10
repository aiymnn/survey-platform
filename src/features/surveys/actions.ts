"use server";

import { prisma } from "@/lib/prisma";

import { auth } from "@/auth";
import { createSurvey } from "./service";
import { createSurveySchema, updateSurveySettingsSchema, type CreateSurveyInput } from "./validators";
import { revalidatePath } from "next/cache";

export async function createSurveyAction(input: CreateSurveyInput) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const parsed = createSurveySchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid input");
  }

  const survey = await createSurvey(parsed.data, session.user.id);

  revalidatePath("/admin/surveys");
  return { id: survey.id };
}

export async function updateSurveyMetadataAction(
  surveyId: string,
  input: { title: string; description?: string; welcomeMessage?: string; endMessage?: string },
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const parsed = updateSurveySettingsSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid input");

  // In a real app, verify ownership
  const currentSurvey = await prisma.survey.findUnique({ where: { id: surveyId } });
  if (!currentSurvey) throw new Error("Survey not found");

  const existingSettings =
    currentSurvey.settingsJson && typeof currentSurvey.settingsJson === "object"
      ? (currentSurvey.settingsJson as Record<string, unknown>)
      : {};

  await prisma.survey.update({
    where: { id: surveyId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      settingsJson: {
        ...existingSettings,
        welcomeMessage: parsed.data.welcomeMessage,
        endMessage: parsed.data.endMessage,
      }
    }
  });

  revalidatePath("/admin/surveys");
  revalidatePath(`/admin/surveys/${surveyId}/settings`);
  return { success: true };
}

export async function deleteSurveysAction(ids: string[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // In a real app, ensure the user has permission to delete these specific surveys
  await prisma.survey.deleteMany({
    where: {
      id: { in: ids },
    },
  });

  revalidatePath("/admin/surveys");
  return { success: true };
}