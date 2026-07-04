import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    username?: string | null;
    role?: string;
    orgName?: string | null;
    orgRole?: string | null;
  }

  interface Session {
    user: User & {
      id: string;
      username?: string | null;
      role?: string;
      orgName?: string | null;
      orgRole?: string | null;
    }
  }
}
