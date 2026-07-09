import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 p-8 text-center">
      <h2 className="text-4xl font-bold tracking-tight">404</h2>
      <h3 className="text-2xl font-semibold">Page not found</h3>
      <p className="text-muted-foreground">
        Sorry, we couldn't find the page you're looking for.
      </p>
      <Button asChild variant="default">
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
}
