export type AppErrorCode =
  | "CONFLICT"
  | "NOT_FOUND"
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "VALIDATION"
  | "INTERNAL";

export class AppError extends Error {
  public code: AppErrorCode;

  /**
   * @param message - Human-readable error message
   * @param code - Machine-readable error code for programmatic handling
   */
  constructor(message: string, code: AppErrorCode = "INTERNAL") {
    super(message);
    this.code = code;
    this.name = "AppError";

    // Set the prototype explicitly to ensure instanceof works correctly in TypeScript
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
