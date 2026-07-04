import { prisma } from "@/lib/prisma";
import { AppError } from "@/server/errors/app-error";

export class UserService {
  /**
   * Updates the global identity profile for a user.
   */
  static async updateProfile(userId: string, data: { username: string; email: string }) {
    // Check if email or username already exists on another user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { username: data.username }],
        NOT: { id: userId },
      },
    });

    if (existingUser) {
      if (existingUser.email === data.email) {
        throw new AppError("CONFLICT", "Email is already in use by another user.");
      }
      if (existingUser.username === data.username) {
        throw new AppError("CONFLICT", "Username is already taken.");
      }
    }

    return await prisma.user.update({
      where: { id: userId },
      data: {
        username: data.username,
        email: data.email,
      },
    });
  }
}
