import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";

export default async function AdminPage() {
  const session = await auth();

  // Protect the route - redirect if not authenticated
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 p-6 transition-colors duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-zinc-800">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
            ✓
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-50">
              Authentication Success
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Successfully authenticated with NextAuth (Auth.js v5)
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div>
            <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">
              User Details
            </span>
            <div className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-xl space-y-2 border border-slate-100 dark:border-zinc-900">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-zinc-400">Name:</span>
                <span className="font-medium text-slate-900 dark:text-zinc-100">
                  {session.user.name || "N/A"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-zinc-400">Email:</span>
                <span className="font-medium text-slate-900 dark:text-zinc-100">
                  {session.user.email}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-zinc-400">User ID:</span>
                <span className="font-mono text-xs text-slate-600 dark:text-zinc-300">
                  {session.user.id || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 py-2.5 px-4 rounded-lg font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 dark:focus:ring-zinc-100 transition duration-200"
          >
            Sign Out
          </button>
        </form>
      </div>
    </main>
  );
}
