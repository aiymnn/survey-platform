"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { UserService } from "@/server/services/user-service";
import { AppError } from "@/server/errors/app-error";

export async function updateProfileSettings(formData: FormData) {
  try {
    const session = await auth();

    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    if (session.user.role !== "SUPERADMIN") {
      return {
        error: "Only Superadmins can update global app identity settings.",
      };
    }

    const username = formData.get("username") as string;
    const email = formData.get("email") as string;

    if (!username || !email) {
      return { error: "Username and email are required." };
    }

    try {
      await UserService.updateProfile(session.user.id, { username, email });
    } catch (error) {
      if (error instanceof AppError) {
        return { error: error.message };
      }
      if (error instanceof Error) {
        return { error: error.message };
      }
      return { error: "An unexpected error occurred." };
    }

    revalidatePath("/admin/settings");
    revalidatePath("/admin");

    return { success: "Profile updated successfully." };
  } catch (err) {
    console.error("Error updating profile:", err);
    return { error: "An unexpected error occurred." };
  }
}
