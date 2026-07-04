"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProfileSettings(formData: FormData) {
  try {
    const session = await auth();

    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    if (session.user.role !== "SUPERADMIN") {
      return { error: "Only Superadmins can update global app identity settings." };
    }

    const username = formData.get("username") as string;
    const email = formData.get("email") as string;

    if (!username || !email) {
      return { error: "Username and email are required." };
    }

    // Check if email or username already exists on another user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
        NOT: { id: session.user.id },
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return { error: "Email is already in use by another user." };
      }
      if (existingUser.username === username) {
        return { error: "Username is already taken." };
      }
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        username,
        email,
      },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/admin");

    return { success: "Profile updated successfully." };
  } catch (err) {
    console.error("Error updating profile:", err);
    return { error: "An unexpected error occurred." };
  }
}
