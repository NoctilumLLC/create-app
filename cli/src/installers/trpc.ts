import path from "path";
import fs from "fs-extra";

import { PKG_ROOT } from "~/consts.js";
import { type Installer } from "~/installers/index.js";
import { addPackageDependency } from "~/utils/addPackageDependency.js";

export const trpcInstaller: Installer = ({
  projectDir,
  packages,
  appRouter,
  mode,
}) => {
  // Only NextAuth has the auth() function for tRPC context
  // WorkOS uses withAuth middleware differently
  const usingAuth = packages?.nextAuth.inUse;
  const usingPrisma = packages?.prisma.inUse;
  const usingDrizzle = packages?.drizzle.inUse;
  const usingDb = usingPrisma === true || usingDrizzle === true;

  const extrasDir = path.join(PKG_ROOT, "template/extras");

  if (mode === "monorepo") {
    // In monorepo mode, tRPC API goes to packages/api
    const apiPackageDir = path.join(projectDir, "packages/api");
    const webAppDir = path.join(projectDir, "apps/web");

    // Add dependencies to api package
    addPackageDependency({
      projectDir: apiPackageDir,
      dependencies: ["@trpc/server", "superjson"],
      devMode: false,
    });

    // Add dependencies to web app
    addPackageDependency({
      projectDir: webAppDir,
      dependencies: [
        "@tanstack/react-query",
        "@trpc/client",
        "@trpc/react-query",
        "server-only",
      ],
      devMode: false,
    });

    // Copy API files to packages/api
    const trpcFile =
      usingAuth && usingDb
        ? "with-auth-db.ts"
        : usingAuth
          ? "with-auth.ts"
          : usingDb
            ? "with-db.ts"
            : "base.ts";

    const trpcSrc = path.join(
      extrasDir,
      "src/server/api/trpc-app",
      trpcFile
    );
    const trpcDest = path.join(apiPackageDir, "src/trpc.ts");

    const rootRouterSrc = path.join(extrasDir, "src/server/api/root.ts");
    const rootRouterDest = path.join(apiPackageDir, "src/root.ts");

    const exampleRouterFile =
      usingAuth && usingPrisma
        ? "with-auth-prisma.ts"
        : usingAuth && usingDrizzle
          ? "with-auth-drizzle.ts"
          : usingAuth
            ? "with-auth.ts"
            : usingPrisma
              ? "with-prisma.ts"
              : usingDrizzle
                ? "with-drizzle.ts"
                : "base.ts";

    const exampleRouterSrc = path.join(
      extrasDir,
      "src/server/api/routers/post",
      exampleRouterFile
    );

    fs.mkdirSync(path.join(apiPackageDir, "src/routers"), { recursive: true });
    const exampleRouterDest = path.join(
      apiPackageDir,
      "src/routers/post.ts"
    );

    // Copy web app API handler
    const apiHandlerSrc = path.join(extrasDir, "src/app/api/trpc/[trpc]/route.ts");
    const apiHandlerDest = path.join(webAppDir, "src/app/api/trpc/[trpc]/route.ts");

    // Copy web app tRPC utilities
    const trpcDir = path.join(extrasDir, "src/trpc");

    fs.copySync(trpcSrc, trpcDest);
    fs.copySync(rootRouterSrc, rootRouterDest);
    fs.copySync(exampleRouterSrc, exampleRouterDest);
    fs.copySync(apiHandlerSrc, apiHandlerDest);

    // Update imports in API package files to use @repo/* instead of ~/server/*
    // Update trpc.ts
    let trpcContent = fs.readFileSync(trpcDest, "utf-8");
    trpcContent = trpcContent.replace(
      /from "~\/server\/auth"/g,
      'from "@repo/auth"'
    );
    trpcContent = trpcContent.replace(
      /from "~\/server\/db"/g,
      'from "@repo/db"'
    );
    fs.writeFileSync(trpcDest, trpcContent);

    // Update root.ts
    let rootContent = fs.readFileSync(rootRouterDest, "utf-8");
    rootContent = rootContent.replace(
      /from "~\/server\/api\/routers\/post"/g,
      'from "./routers/post"'
    );
    rootContent = rootContent.replace(
      /from "~\/server\/api\/trpc"/g,
      'from "./trpc"'
    );
    fs.writeFileSync(rootRouterDest, rootContent);

    // Update routers/post.ts
    let exampleRouterContent = fs.readFileSync(exampleRouterDest, "utf-8");
    exampleRouterContent = exampleRouterContent.replace(
      /from "~\/server\/api\/trpc"/g,
      'from "../trpc"'
    );
    exampleRouterContent = exampleRouterContent.replace(
      /from "~\/server\/db"/g,
      'from "@repo/db"'
    );
    fs.writeFileSync(exampleRouterDest, exampleRouterContent);
    fs.copySync(
      path.join(trpcDir, "server.ts"),
      path.join(webAppDir, "src/trpc/server.ts")
    );
    fs.copySync(
      path.join(trpcDir, "react.tsx"),
      path.join(webAppDir, "src/trpc/react.tsx")
    );
    fs.copySync(
      path.join(trpcDir, "query-client.ts"),
      path.join(webAppDir, "src/trpc/query-client.ts")
    );
    fs.copySync(
      path.join(
        extrasDir,
        "src/app/_components",
        packages?.tailwind.inUse ? "post-tw.tsx" : "post.tsx"
      ),
      path.join(webAppDir, "src/app/_components/post.tsx")
    );

    // Update imports in monorepo mode to use @repo/api instead of ~/server/api
    const serverTsPath = path.join(webAppDir, "src/trpc/server.ts");
    let serverTsContent = fs.readFileSync(serverTsPath, "utf-8");
    serverTsContent = serverTsContent.replace(
      /from "~\/server\/api\/root"/g,
      'from "@repo/api/root"'
    );
    serverTsContent = serverTsContent.replace(
      /from "~\/server\/api\/trpc"/g,
      'from "@repo/api/trpc"'
    );
    fs.writeFileSync(serverTsPath, serverTsContent);

    const reactTsxPath = path.join(webAppDir, "src/trpc/react.tsx");
    let reactTsxContent = fs.readFileSync(reactTsxPath, "utf-8");
    reactTsxContent = reactTsxContent.replace(
      /from "~\/server\/api\/root"/g,
      'from "@repo/api/root"'
    );
    fs.writeFileSync(reactTsxPath, reactTsxContent);

    const apiHandlerPath = path.join(webAppDir, "src/app/api/trpc/[trpc]/route.ts");
    let apiHandlerContent = fs.readFileSync(apiHandlerPath, "utf-8");
    apiHandlerContent = apiHandlerContent.replace(
      /from "~\/server\/api\/root"/g,
      'from "@repo/api/root"'
    );
    apiHandlerContent = apiHandlerContent.replace(
      /from "~\/server\/api\/trpc"/g,
      'from "@repo/api/trpc"'
    );
    fs.writeFileSync(apiHandlerPath, apiHandlerContent);

    return;
  }

  // Normal mode (existing code)
  addPackageDependency({
    projectDir,
    dependencies: [
      "@tanstack/react-query",
      "superjson",
      "@trpc/server",
      "@trpc/client",
      "@trpc/react-query",
    ],
    devMode: false,
  });

  const apiHandlerFile = "src/pages/api/trpc/[trpc].ts";
  const routeHandlerFile = "src/app/api/trpc/[trpc]/route.ts";
  const srcToUse = appRouter ? routeHandlerFile : apiHandlerFile;

  const apiHandlerSrc = path.join(extrasDir, srcToUse);
  const apiHandlerDest = path.join(projectDir, srcToUse);

  const trpcFile =
    usingAuth && usingDb
      ? "with-auth-db.ts"
      : usingAuth
        ? "with-auth.ts"
        : usingDb
          ? "with-db.ts"
          : "base.ts";
  const trpcSrc = path.join(
    extrasDir,
    "src/server/api",
    appRouter ? "trpc-app" : "trpc-pages",
    trpcFile
  );
  const trpcDest = path.join(projectDir, "src/server/api/trpc.ts");

  const rootRouterSrc = path.join(extrasDir, "src/server/api/root.ts");
  const rootRouterDest = path.join(projectDir, "src/server/api/root.ts");

  const exampleRouterFile =
    usingAuth && usingPrisma
      ? "with-auth-prisma.ts"
      : usingAuth && usingDrizzle
        ? "with-auth-drizzle.ts"
        : usingAuth
          ? "with-auth.ts"
          : usingPrisma
            ? "with-prisma.ts"
            : usingDrizzle
              ? "with-drizzle.ts"
              : "base.ts";

  const exampleRouterSrc = path.join(
    extrasDir,
    "src/server/api/routers/post",
    exampleRouterFile
  );
  const exampleRouterDest = path.join(
    projectDir,
    "src/server/api/routers/post.ts"
  );

  const copySrcDest: [string, string][] = [
    [apiHandlerSrc, apiHandlerDest],
    [trpcSrc, trpcDest],
    [rootRouterSrc, rootRouterDest],
    [exampleRouterSrc, exampleRouterDest],
  ];

  if (appRouter) {
    addPackageDependency({
      dependencies: ["server-only"],
      devMode: false,
      projectDir,
    });

    const trpcDir = path.join(extrasDir, "src/trpc");
    copySrcDest.push(
      [
        path.join(trpcDir, "server.ts"),
        path.join(projectDir, "src/trpc/server.ts"),
      ],
      [
        path.join(trpcDir, "react.tsx"),
        path.join(projectDir, "src/trpc/react.tsx"),
      ],
      [
        path.join(
          extrasDir,
          "src/app/_components",
          packages?.tailwind.inUse ? "post-tw.tsx" : "post.tsx"
        ),
        path.join(projectDir, "src/app/_components/post.tsx"),
      ],
      [
        path.join(extrasDir, "src/trpc/query-client.ts"),
        path.join(projectDir, "src/trpc/query-client.ts"),
      ]
    );
  } else {
    addPackageDependency({
      dependencies: ["@trpc/next"],
      devMode: false,
      projectDir,
    });

    const utilsSrc = path.join(extrasDir, "src/utils/api.ts");
    const utilsDest = path.join(projectDir, "src/utils/api.ts");
    copySrcDest.push([utilsSrc, utilsDest]);
  }

  copySrcDest.forEach(([src, dest]) => {
    fs.copySync(src, dest);
  });
};
