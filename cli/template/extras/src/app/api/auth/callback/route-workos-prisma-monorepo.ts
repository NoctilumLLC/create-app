import { handleAuth } from "@workos-inc/authkit-nextjs";

import { db } from "@repo/db";

export const GET = handleAuth({
  onSuccess: async ({ user }) => {
    // Sync WorkOS user to database
    await db.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: user.email,
        name: user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`.trim()
          : user.firstName || user.lastName || null,
        emailVerified: user.emailVerified ? new Date() : null,
        image: user.profilePictureUrl || null,
      },
      update: {
        email: user.email,
        name: user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`.trim()
          : user.firstName || user.lastName || null,
        emailVerified: user.emailVerified ? new Date() : null,
        image: user.profilePictureUrl || null,
      },
    });
  },
});
