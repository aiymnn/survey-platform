import { prisma } from "@/lib/prisma";
import type { CreateSurveyInput } from "./validators";

export async function ensureDefaultOrganization(userId: string) {
  // Find an existing organization where the user is an OWNER
  const membership = await prisma.organizationMember.findFirst({
    where: { userId, role: "OWNER" },
    include: { organization: true },
  });

  if (membership) {
    return membership.organization;
  }

  // Create a default organization if none exists
  const org = await prisma.organization.create({
    data: {
      name: "Default Workspace",
      slug: `workspace-${userId.substring(0, 8)}`,
      members: {
        create: {
          userId,
          role: "OWNER",
        },
      },
    },
  });

  return org;
}

export async function createSurvey(input: CreateSurveyInput, userId: string) {
  const org = await ensureDefaultOrganization(userId);
  
  // Generate a URL-friendly slug from the title
  const baseSlug = input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  const slug = `${baseSlug}-${randomSuffix}`;

  const survey = await prisma.survey.create({
    data: {
      title: input.title,
      description: input.description ?? "",
      slug,
      status: "DRAFT",
      organizationId: org.id,
      createdById: userId,
      settingsJson: {
        welcomeMessage: input.welcomeMessage,
        endMessage: input.endMessage,
      },
      // Create the initial Version 1
      versions: {
        create: {
          versionNumber: 1,
          status: "DRAFT",
          schemaJson: {
            title: input.title,
            description: input.description ?? "",
            questions: [],
            logicRules: []
          },
        },
      },
    },
  });

  return survey;
}

export async function getSurveys(userId: string) {
  const org = await ensureDefaultOrganization(userId);
  
  return prisma.survey.findMany({
    where: {
      organizationId: org.id,
      status: { not: "ARCHIVED" },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: { responseSessions: true },
      },
      createdBy: {
        select: { name: true, email: true },
      },
    },
  });
}