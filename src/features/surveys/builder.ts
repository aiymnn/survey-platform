"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

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

export async function updateSurveySchemaAction(versionId: string, schemaJson: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // In a real app, you would check if the user has permission to edit this survey.
  
  await prisma.surveyVersion.update({
    where: { id: versionId },
    data: {
      schemaJson,
    },
  });

  return { success: true };
}

export async function updateSurveySettingsAction(surveyId: string, data: { title: string, description: string, settingsJson: any }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // In a real app, verify permissions here

  await prisma.survey.update({
    where: { id: surveyId },
    data: {
      title: data.title,
      description: data.description,
      settingsJson: data.settingsJson,
    }
  });

  return { success: true };
}
