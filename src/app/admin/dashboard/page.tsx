import { Skeleton } from "@/components/ui/skeleton";
import { Users, FileText, CheckCircle2, TrendingUp, ArrowUpRight } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Overview
          </h1>
          <p className="text-muted-foreground font-medium text-sm md:text-base">
            Welcome back to your workspace. Here's what's happening today.
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
          { title: "Total Surveys", value: "12", icon: FileText, change: "+2 this week", trend: "up", color: "text-blue-500", bg: "bg-blue-500/10" },
          { title: "Total Responses", value: "2,845", icon: Users, change: "+14% from last month", trend: "up", color: "text-primary", bg: "bg-primary/10" },
          { title: "Completion Rate", value: "68%", icon: CheckCircle2, change: "+5.4% from last week", trend: "up", color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { title: "Active Campaigns", value: "3", icon: TrendingUp, change: "1 ending soon", trend: "neutral", color: "text-amber-500", bg: "bg-amber-500/10" }
        ].map((stat, i) => (
          <div 
            key={i} 
            className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex flex-row items-center justify-between pb-4">
              <h3 className="text-sm font-semibold text-muted-foreground tracking-wide">
                {stat.title}
              </h3>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="mt-2 text-xs font-medium text-muted-foreground flex items-center gap-1">
                <span className={stat.trend === "up" ? "text-emerald-500" : "text-amber-500"}>
                  {stat.change}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts / Main Content Area */}
      <div className="grid gap-6 md:grid-cols-7">
        <div className="col-span-1 md:col-span-4 lg:col-span-5 flex flex-col rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border/40">
            <h3 className="text-lg font-semibold">Response Analytics</h3>
            <p className="text-sm text-muted-foreground">Responses over the last 30 days.</p>
          </div>
          <div className="p-6 flex-1 min-h-[300px] flex items-end gap-2 pt-12">
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
          </div>
        </div>

        <div className="col-span-1 md:col-span-3 lg:col-span-2 flex flex-col rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border/40">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <p className="text-sm text-muted-foreground">Latest interactions</p>
          </div>
          <div className="p-6 space-y-6">
            {[
              { text: "Customer Feedback Q3 published", time: "2h ago", color: "bg-blue-500" },
              { text: "50 new responses received", time: "4h ago", color: "bg-emerald-500" },
              { text: "Employee pulse survey closed", time: "1d ago", color: "bg-amber-500" },
              { text: "New team member invited", time: "2d ago", color: "bg-primary" },
            ].map((activity, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="relative flex h-3 w-3 mt-1.5 items-center justify-center">
                  <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-20 ${activity.color}`}></span>
                  <span className={`relative inline-flex h-2 w-2 rounded-full ${activity.color}`}></span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{activity.text}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
