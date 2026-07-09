import { Input } from "@/components/ui/input";

export function ShortTextPreview() {
  return (
    <div className="w-full sm:max-w-md pt-2">
      <Input 
        disabled 
        placeholder="Short answer text" 
        className="w-full h-9 bg-background/50 border-dashed pointer-events-none" 
      />
    </div>
  );
}
