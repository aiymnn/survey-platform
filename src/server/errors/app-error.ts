export type AppErrorCode = "CONFLICT" | "NOT_FOUND" | "BAD_REQUEST" | "UNAUTHORIZED" | "INTERNAL";

export class AppError extends Error {
  public code: AppErrorCode;

  constructor(code: AppErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "AppError";

    // Set the prototype explicitly to ensure instanceof works correctly in TypeScript
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
