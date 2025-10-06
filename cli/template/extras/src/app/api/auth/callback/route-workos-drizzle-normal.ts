import { eq } from "drizzle-orm";
import { handleAuth } from "@workos-inc/authkit-nextjs";

import { db, schema } from "~/server/db";

export const GET = handleAuth({
  onSuccess: async ({ user }) => {
    // Sync WorkOS user to database
    await db
      .insert(schema.users)
      .values({
        id: user.id,
        email: user.email,
        name:
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`.trim()
            : user.firstName || user.lastName || null,
        emailVerified: user.emailVerified ? new Date() : null,
        image: user.profilePictureUrl || null,
      })
      .onConflictDoUpdate({
        target: schema.users.id,
        set: {
          email: user.email,
          name:
            user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`.trim()
              : user.firstName || user.lastName || null,
          emailVerified: user.emailVerified ? new Date() : null,
          image: user.profilePictureUrl || null,
        },
      });
  },
});
