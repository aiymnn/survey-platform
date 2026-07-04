import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
    session: { strategy: "jwt" },
    pages: {
        signIn: "/login",
    },
    providers: [
        Credentials({
            credentials: {
                email: {},
                password: {},
            },
            authorize: async (credentials) => {
                if (!credentials?.email || !credentials?.password) return null;

                // Support login via either email or username
                const loginIdentifier = credentials.email as string;
                const user = await prisma.user.findFirst({
                    where: {
                        OR: [
                            { email: loginIdentifier },
                            { username: loginIdentifier },
                        ]
                    },
                    include: {
                        memberships: {
                            include: {
                                organization: true
                            }
                        }
                    }
                });
                
                if (!user || !user.passwordHash) return null;

                const valid = await bcrypt.compare(
                    credentials.password as string,
                    user.passwordHash
                );
                if (!valid) return null;

                const primaryMembership = user.memberships[0];

                return { 
                    id: user.id, 
                    email: user.email, 
                    name: user.name,
                    username: user.username,
                    role: user.role,
                    orgName: primaryMembership?.organization?.name,
                    orgRole: primaryMembership?.role,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }: { token: any; user: any }) {
            if (user) {
                token.id = user.id;
                token.username = user.username;
                token.role = user.role;
                token.orgName = user.orgName;
                token.orgRole = user.orgRole;
            }
            return token;
        },
        async session({ session, token }: { session: any; token: any }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.username = token.username as string | undefined;
                session.user.role = token.role as string;
                session.user.orgName = token.orgName as string | undefined;
                session.user.orgRole = token.orgRole as string | undefined;
            }
            return session;
        }
    }
});