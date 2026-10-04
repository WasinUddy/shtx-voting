import { createHash, timingSafeEqual } from "node:crypto";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

function passwordsMatch(provided: string, expected: string) {
  const providedHash = createHash("sha256").update(provided).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(providedHash, expectedHash);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        password: { type: "password" },
      },
      authorize: async (credentials) => {
        const password = credentials?.password;
        const expected = process.env.ADMIN_PASSWORD;
        if (typeof password !== "string" || !expected) {
          return null;
        }
        if (!passwordsMatch(password, expected)) {
          return null;
        }
        return { id: "admin", name: "Admin" };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
});
