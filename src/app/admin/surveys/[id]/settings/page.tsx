import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SurveySettingsForm } from "./survey-settings-form";

interface SettingsPageProps {
  params: Promise<{ id: string }>;
}

export default async function SettingsPage(props: SettingsPageProps) {
  const params = await props.params;
  const surveyId = params.id;

  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
  });

  if (!survey) {
    notFound();
  }

  // Extract welcome/end messages from settingsJson
  type SettingsJson = { welcomeMessage?: string; endMessage?: string };
  const settings: SettingsJson =
    typeof survey.settingsJson === "object" && survey.settingsJson !== null
      ? (survey.settingsJson as SettingsJson)
      : {};

  return (
    <main className="p-4 lg:p-8 flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Survey Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Update the metadata and messages for this survey.
          </p>
        </div>

        <SurveySettingsForm 
          surveyId={survey.id}
          initialData={{
            title: survey.title,
            description: survey.description || "",
            welcomeMessage: settings.welcomeMessage || "",
            endMessage: settings.endMessage || "",
          }}
        />
      </div>
    </main>
  );
}
