import { Users, FileText, CheckCircle2, TrendingUp, ArrowUpRight, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ActivityItem } from "@/components/dashboard/activity-item";

export default function DashboardPage() {
  return (
    <main className="h-full w-full p-4 lg:p-8 transition-opacity duration-500">
      <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                Overview
              </h1>
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-amber-500/10 text-amber-500 border-amber-500/20">
                <AlertTriangle className="w-3 h-3 mr-1" /> Placeholder Data
              </div>
            </div>
            <p className="text-muted-foreground font-medium text-sm md:text-base">
              Welcome back to your workspace. Here&apos;s what&apos;s happening today.
            </p>
          </div>
          <div className="flex items-center gap-3">
          <button className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300">
            Create Survey
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Surveys", value: "12", icon: FileText, change: "+2 this week", trend: "up" as const, color: "text-blue-500", bg: "bg-blue-500/10" },
          { title: "Total Responses", value: "2,845", icon: Users, change: "+14% from last month", trend: "up" as const, color: "text-primary", bg: "bg-primary/10" },
          { title: "Completion Rate", value: "68%", icon: CheckCircle2, change: "+5.4% from last week", trend: "up" as const, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { title: "Active Campaigns", value: "3", icon: TrendingUp, change: "1 ending soon", trend: "neutral" as const, color: "text-amber-500", bg: "bg-amber-500/10" }
        ].map((stat, i) => (
          <MetricCard key={i} {...stat} />
        ))}
      </div>

      {/* Charts / Main Content Area */}
      <div className="grid gap-6 md:grid-cols-7">
        <Card className="col-span-1 md:col-span-4 lg:col-span-5 flex flex-col rounded-2xl shadow-sm border-border/50 overflow-hidden">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="text-lg">Response Analytics</CardTitle>
            <p className="text-sm text-muted-foreground">Responses over the last 30 days.</p>
          </CardHeader>
          <CardContent className="p-6 flex-1 min-h-[300px] flex items-end gap-2 pt-12">
            {/* Fake Bar Chart */}
            {[40, 25, 45, 30, 60, 85, 40, 50, 70, 95, 60, 45].map((height, i) => (
              <div key={i} className="flex-1 group relative flex justify-center">
                <div 
                  className="w-full bg-primary/20 rounded-t-sm group-hover:bg-primary transition-colors duration-300 relative" 
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-xs py-1 px-2 rounded font-medium">
                    {height * 12}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-3 lg:col-span-2 flex flex-col rounded-2xl shadow-sm border-border/50 overflow-hidden">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <p className="text-sm text-muted-foreground">Latest interactions</p>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {[
              { text: "Customer Feedback Q3 published", time: "2h ago", color: "bg-blue-500" },
              { text: "50 new responses received", time: "4h ago", color: "bg-emerald-500" },
              { text: "Employee pulse survey closed", time: "1d ago", color: "bg-amber-500" },
              { text: "New team member invited", time: "2d ago", color: "bg-primary" },
            ].map((activity, i) => (
              <ActivityItem key={i} {...activity} />
            ))}
          </CardContent>
        </Card>
      </div>
      </div>
    </main>
  );
}
