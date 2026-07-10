"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { 
  updateSurveySettingsSchema, 
  type UpdateSurveySettingsInput 
} from "@/features/surveys/validators";
import { updateSurveyMetadataAction } from "@/features/surveys/actions";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface SurveySettingsFormProps {
  surveyId: string;
  initialData: UpdateSurveySettingsInput;
}

export function SurveySettingsForm({ surveyId, initialData }: SurveySettingsFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<UpdateSurveySettingsInput>({
    resolver: zodResolver(updateSurveySettingsSchema),
    defaultValues: initialData,
  });

  function onSubmit(data: UpdateSurveySettingsInput) {
    startTransition(async () => {
      try {
        await updateSurveyMetadataAction(surveyId, data);
        toast.success("Survey settings updated successfully!");
      } catch {
        toast.error("Failed to update settings. Please try again.");
      }
    });
  }

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle>Metadata</CardTitle>
        <CardDescription>
          These details are shown to participants when they take the survey.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Survey Title</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g. Customer Satisfaction 2026" {...field} />
                  </FormControl>
                  <FormDescription>
                    The public-facing name of the survey.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Briefly describe the purpose of this survey..." 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 border-t border-border/50">
              <h3 className="text-lg font-medium mb-4">Messages</h3>
              
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="welcomeMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Welcome Message (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Welcome! Thank you for taking the time to complete this survey..." 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Shown on the very first screen before the survey starts.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Message (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Thank you! Your responses have been recorded." 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Shown after the participant submits their final response.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/surveys">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Surveys
                </Link>
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
