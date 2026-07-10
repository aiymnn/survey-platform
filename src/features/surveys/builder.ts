"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import type { SurveySchemaJson } from "./types";

export async function getSurveyBuilderData(surveyId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
    include: {
      versions: {
        where: { status: "DRAFT" },
        take: 1,
      },
    },
  });

  if (!survey) throw new Error("Survey not found");
  if (survey.versions.length === 0) throw new Error("No draft version found");

  return {
    survey,
    draftVersion: survey.versions[0],
  };
}

export async function updateSurveySchemaAction(versionId: string, schemaJson: SurveySchemaJson) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.surveyVersion.update({
    where: { id: versionId },
    data: { schemaJson: schemaJson as object },
  });

  return { success: true };
}

interface UpdateSurveySettingsPayload {
  title: string;
  description: string;
  settingsJson: {
    welcomeMessage: string;
    endMessage: string;
  };
}

export async function updateSurveySettingsAction(
  surveyId: string,
  data: UpdateSurveySettingsPayload,
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.survey.update({
    where: { id: surveyId },
    data: {
      title: data.title,
      description: data.description,
      settingsJson: data.settingsJson as object,
    },
  });

  return { success: true };
}
