"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import type { SurveySettingsData } from "@/features/surveys/types";

export type { SurveySettingsData };

interface SurveySettingsFormProps {
  data: SurveySettingsData;
  onChange: (data: SurveySettingsData) => void;
}

export function SurveySettingsForm({ data, onChange }: SurveySettingsFormProps) {
  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      <Card>
        <CardHeader>
          <CardTitle>Core Details</CardTitle>
          <CardDescription>The internal title and description for this survey.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="survey-title">Survey Title</Label>
            <Input
              id="survey-title"
              value={data.title}
              onChange={(e) => onChange({ ...data, title: e.target.value })}
              placeholder="e.g., Q3 Customer Feedback"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="survey-description">Description</Label>
            <Textarea
              id="survey-description"
              value={data.description}
              onChange={(e) => onChange({ ...data, description: e.target.value })}
              placeholder="Internal notes about this survey..."
              className="resize-none h-20"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Respondent Messaging</CardTitle>
          <CardDescription>
            Customize the messages shown to users before and after they take the survey.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="survey-welcome">Welcome Message (Optional)</Label>
            <Textarea
              id="survey-welcome"
              value={data.welcomeMessage}
              onChange={(e) => onChange({ ...data, welcomeMessage: e.target.value })}
              placeholder="e.g., Thanks for taking our survey! Your feedback is important to us."
              className="resize-none h-24"
            />
            <p className="text-xs text-muted-foreground">
              This is shown on the very first page before questions start.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="survey-end">End Message (Optional)</Label>
            <Textarea
              id="survey-end"
              value={data.endMessage}
              onChange={(e) => onChange({ ...data, endMessage: e.target.value })}
              placeholder="e.g., Thank you for your time!"
              className="resize-none h-24"
            />
            <p className="text-xs text-muted-foreground">
              This is shown after the respondent submits their answers.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
