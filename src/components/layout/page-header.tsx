import { ReactNode } from "react";

interface PageHeaderProps {
  /** Main heading text */
  title: string;
  /** Subtitle / helper text rendered below the title */
  description?: string;
  /** Optional badge or pill to render next to the title (e.g. warning badge) */
  badge?: ReactNode;
  /** Optional action area rendered on the right (e.g. a "Create" button) */
  action?: ReactNode;
}

/**
 * Consistent page-level heading used across all standard admin pages.
 * Renders a gradient title, optional badge, optional description, and an
 * optional right-aligned action slot.
 *
 * Usage:
 *   <PageHeader
 *     title="Surveys"
 *     description="Manage and analyze your surveys."
 *     action={<Button asChild><Link href="/admin/surveys/new">Create Survey</Link></Button>}
 *   />
 */
export function PageHeader({ title, description, badge, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            {title}
          </h1>
          {badge && <div className="shrink-0">{badge}</div>}
        </div>
        {description && (
          <p className="text-muted-foreground font-medium text-sm md:text-base">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
