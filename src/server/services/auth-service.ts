import { prisma } from "@/lib/prisma";

import crypto from "crypto";

export class AuthService {
  /**
   * Registers a new user and creates a personal organization workspace for them.
   * Retries upon unique constraint failures to ensure username/slug robustness.
   */
  static async registerUser(data: { name?: string; email: string; passwordHash: string }) {
    const baseName = data.name || data.email.split("@")[0] || "User";
    const slugBase = baseName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    
    let retries = 0;
    const MAX_RETRIES = 5;

    while (retries < MAX_RETRIES) {
      // For the first try, we just use a small random string. If it fails, we increase randomness.
      const suffix = crypto.randomBytes(retries > 0 ? 4 : 2).toString("hex");
      const username = `${slugBase}-${suffix}`;
      const orgSlug = `${slugBase}-workspace-${suffix}`;

      try {
        return await prisma.$transaction(async (tx) => {
          // Create User
          const user = await tx.user.create({
            data: {
              name: data.name,
              email: data.email,
              passwordHash: data.passwordHash,
              username,
            },
          });

          // Create Personal Organization
          const org = await tx.organization.create({
            data: {
              name: `${baseName}'s Workspace`,
              slug: orgSlug,
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
      } catch (err) {
        if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002") {
          // Unique constraint failed. Retry.
          retries++;
          if (retries >= MAX_RETRIES) {
            throw new Error("Unable to generate a unique username/organization slug. Please try a different name.");
          }
          continue;
        }
        throw err;
      }
    }

    throw new Error("Registration failed.");
  }
}
