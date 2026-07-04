import { redirect } from "next/navigation";
import { auth } from "@/auth";
import LoginForm from "./login-form";
import Link from "next/link";
import { Zap } from "lucide-react";

export default async function LoginPage() {
  const session = await auth();

  // If the user is already logged in, redirect them to the admin dashboard
  if (session?.user) {
    redirect("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center relative overflow-hidden bg-background">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] z-0" />

      <div className="z-10 w-full max-w-md px-4 sm:px-0">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/25 group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-300">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
              SurveyPlatform
            </span>
          </Link>
        </div>
        
        <LoginForm />
      </div>
    </main>
  );
}
