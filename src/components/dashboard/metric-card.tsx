import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  change: string;
  trend: "up" | "down" | "neutral";
  color: string;
  bg: string;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  change,
  trend,
  color,
  bg,
}: MetricCardProps) {
  return (
    <Card className="group relative overflow-hidden rounded-2xl border-border/50 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
        <CardTitle className="text-sm font-semibold text-muted-foreground tracking-wide">
          {title}
        </CardTitle>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}
        >
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="mt-2 text-xs font-medium text-muted-foreground flex items-center gap-1">
          <span
            className={
              trend === "up"
                ? "text-emerald-500"
                : trend === "down"
                  ? "text-destructive"
                  : "text-amber-500"
            }
          >
            {change}
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
