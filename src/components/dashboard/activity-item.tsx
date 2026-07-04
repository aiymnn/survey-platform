interface ActivityItemProps {
  text: string;
  time: string;
  color: string;
}

export function ActivityItem({ text, time, color }: ActivityItemProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="relative flex h-3 w-3 mt-1.5 items-center justify-center">
        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-20 ${color}`} />
        <span className={`relative inline-flex h-2 w-2 rounded-full ${color}`} />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium leading-none">{text}</p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  );
}
