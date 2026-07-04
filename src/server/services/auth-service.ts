import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export class AuthService {
  /**
   * Registers a new user and creates a personal organization workspace for them.
   */
  static async registerUser(data: { name?: string; email: string; passwordHash: string }) {
    // Generate a default username and organization name based on email or name
    const baseName = data.name || data.email.split("@")[0] || "User";
    const slugBase = baseName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    
    // Create the user, organization, and membership in a transaction
    return await prisma.$transaction(async (tx) => {
      // Create User
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          passwordHash: data.passwordHash,
          // Generate a uniqueish username
          username: `${slugBase}-${Date.now().toString().slice(-4)}`,
        },
      });

      // Create Personal Organization
      const org = await tx.organization.create({
        data: {
          name: `${baseName}'s Workspace`,
          slug: `${slugBase}-workspace-${Date.now().toString().slice(-4)}`,
        },
      });

      // Link User to Organization as OWNER
      await tx.organizationMember.create({
        data: {
          organizationId: org.id,
          userId: user.id,
          role: "OWNER",
        },
      });

      return user;
    });
  }
}
