import Link from "next/link";

import { getSignInUrl, withAuth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });
  const { user } = await withAuth();
  const signInUrl = await getSignInUrl();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Create <span className="text-[hsl(280,100%,70%)]">Noctilum</span> App
          </h1>

          <div className="max-w-2xl rounded-xl bg-white/10 p-6">
            <h2 className="mb-4 text-2xl font-bold">Getting Started</h2>
            <ol className="space-y-4 text-left">
              <li>
                <h3 className="font-semibold text-lg">1. Database Setup</h3>
                <p className="text-sm text-white/80">
                  Configure <code className="rounded bg-white/10 px-1">DATABASE_URL</code> in .env
                </p>
                <p className="text-sm text-white/80">
                  Run: <code className="rounded bg-white/10 px-1">bun run db:push</code>
                </p>
              </li>
              <li>
                <h3 className="font-semibold text-lg">2. Authentication</h3>
                <p className="text-sm text-white/80">
                  Set up WorkOS credentials in .env
                </p>
                <p className="text-sm text-white/80">
                  Sign in with the button below
                </p>
              </li>
              <li>
                <h3 className="font-semibold text-lg">3. Start Building</h3>
                <p className="text-sm text-white/80">
                  Edit <code className="rounded bg-white/10 px-1">src/app/page.tsx</code>
                </p>
                <p className="text-sm text-white/80">
                  Create API routes in <code className="rounded bg-white/10 px-1">src/app/api</code>
                </p>
                <p className="text-sm text-white/80">
                  Add tRPC procedures in <code className="rounded bg-white/10 px-1">src/server/api</code>
                </p>
              </li>
            </ol>
          </div>

          <div className="flex flex-col items-center gap-2">
            <p className="text-2xl text-white">
              {hello ? hello.greeting : "Loading tRPC query..."}
            </p>

            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-center text-2xl text-white">
                {user ? (
                  <span>
                    Logged in as {user.firstName} {user.lastName}
                  </span>
                ) : (
                  <span>Not logged in</span>
                )}
              </p>
              <Link
                href={user ? "/api/auth/signout" : signInUrl}
                className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
              >
                {user ? "Sign out" : "Sign in"}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
