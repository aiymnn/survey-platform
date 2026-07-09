import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("utils cn() function", () => {
  it("merges tailwind classes correctly", () => {
    const result = cn("text-red-500", "bg-blue-500");
    expect(result).toBe("text-red-500 bg-blue-500");
  });

  it("handles conditional classes", () => {
    const condition = true;
    const result = cn("p-4", condition && "m-4", false && "opacity-0");
    expect(result).toBe("p-4 m-4");
  });
});
