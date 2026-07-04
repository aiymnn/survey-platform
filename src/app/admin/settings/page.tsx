import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { updateProfileSettings } from "@/app/actions/settings";
import { ShieldAlert, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "./submit-button"; // We will create this

export default async function SettingsPage({ searchParams }: { searchParams: { success?: string, error?: string } }) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  const isSuperAdmin = session.user.role === "SUPERADMIN";

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          Profile Settings
        </h1>
        <p className="text-muted-foreground font-medium text-sm md:text-base">
          Manage your account identity and preferences.
        </p>
      </div>

      {!isSuperAdmin && (
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm font-medium text-foreground">
            <p>You are logged in as a Standard User.</p>
            <p className="text-muted-foreground font-normal mt-1">Profile settings (Username & Email) are locked and can only be modified by the System Superadmin.</p>
          </div>
        </div>
      )}

      <Card className="border-border/40 shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Identity Information</CardTitle>
          <CardDescription>
            Update your global app identity.
          </CardDescription>
        </CardHeader>
        
        <form action={async (formData: FormData) => {
          "use server"
          const result = await updateProfileSettings(formData);
          // In Next.js 14 server actions, we could redirect here or use useActionState on client.
          // For simplicity in a Server Component form, we'll redirect to inject searchParams.
          const { redirect: serverRedirect } = await import("next/navigation");
          
          if (result.error) {
            serverRedirect(`/admin/settings?error=${encodeURIComponent(result.error)}`);
          } else if (result.success) {
            serverRedirect(`/admin/settings?success=${encodeURIComponent(result.success)}`);
          }
        }}>
          <CardContent className="space-y-6">
            
            {searchParams.success && (
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-sm text-green-600 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span className="font-medium mt-0.5">{searchParams.success}</span>
              </div>
            )}
            
            {searchParams.error && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="font-medium mt-0.5">{searchParams.error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                name="username" 
                defaultValue={session.user.username || ""} 
                disabled={!isSuperAdmin}
                className="bg-background max-w-md"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                name="email" 
                type="email"
                defaultValue={session.user.email || ""} 
                disabled={!isSuperAdmin}
                className="bg-background max-w-md"
                required
              />
            </div>
          </CardContent>
          
          {isSuperAdmin && (
            <CardFooter className="bg-muted/50 border-t border-border/40 py-4 px-6 flex justify-end">
              <SubmitButton />
            </CardFooter>
          )}
        </form>
      </Card>
    </div>
  );
}
