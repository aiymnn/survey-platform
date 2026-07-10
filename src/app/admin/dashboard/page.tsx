import {
  Users,
  FileText,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ActivityItem } from "@/components/dashboard/activity-item";
import { PageLayout } from "@/components/layout/page-layout";
import { PageHeader } from "@/components/layout/page-header";

const METRIC_STATS = [
  {
    title: "Total Surveys",
    value: "12",
    icon: FileText,
    change: "+2 this week",
    trend: "up" as const,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "Total Responses",
    value: "2,845",
    icon: Users,
    change: "+14% from last month",
    trend: "up" as const,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    title: "Completion Rate",
    value: "68%",
    icon: CheckCircle2,
    change: "+5.4% from last week",
    trend: "up" as const,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    title: "Active Campaigns",
    value: "3",
    icon: TrendingUp,
    change: "1 ending soon",
    trend: "neutral" as const,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
] as const;

const RECENT_ACTIVITY = [
  { text: "Customer Feedback Q3 published", time: "2h ago", color: "bg-blue-500" },
  { text: "50 new responses received", time: "4h ago", color: "bg-emerald-500" },
  { text: "Employee pulse survey closed", time: "1d ago", color: "bg-amber-500" },
  { text: "New team member invited", time: "2d ago", color: "bg-primary" },
] as const;

const CHART_HEIGHTS = [40, 25, 45, 30, 60, 85, 40, 50, 70, 95, 60, 45] as const;

export default function DashboardPage() {
  return (
    <PageLayout>
      <PageHeader
        title="Overview"
        description="Welcome back to your workspace. Here's what's happening today."
        badge={
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-amber-500/10 text-amber-500 border-amber-500/20">
            <AlertTriangle className="w-3 h-3 mr-1" aria-hidden />
            Placeholder Data
          </div>
        }
        action={
          <Button asChild>
            <Link href="/admin/surveys/new">
              Create Survey
              <ArrowUpRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </Button>
        }
      />

      {/* Metric Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {METRIC_STATS.map((stat) => (
          <MetricCard key={stat.title} {...stat} />
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
            {CHART_HEIGHTS.map((height, i) => (
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
            {RECENT_ACTIVITY.map((activity) => (
              <ActivityItem key={activity.text} {...activity} />
            ))}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
