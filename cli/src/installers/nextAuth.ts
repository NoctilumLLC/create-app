import path from "path";
import fs from "fs-extra";

import { PKG_ROOT } from "~/consts.js";
import { type AvailableDependencies } from "~/installers/dependencyVersionMap.js";
import { type Installer } from "~/installers/index.js";
import { addPackageDependency } from "~/utils/addPackageDependency.js";

export const nextAuthInstaller: Installer = ({ projectDir, packages, mode }) => {
  const usingPrisma = packages?.prisma.inUse;
  const usingDrizzle = packages?.drizzle.inUse;

  const deps: AvailableDependencies[] = ["next-auth"];
  if (usingPrisma) deps.push("@auth/prisma-adapter");
  if (usingDrizzle) deps.push("@auth/drizzle-adapter");

  const extrasDir = path.join(PKG_ROOT, "template/extras");

  if (mode === "monorepo") {
    // In monorepo mode, auth config goes to packages/auth
    const authPackageDir = path.join(projectDir, "packages/auth");
    const webAppDir = path.join(projectDir, "apps/web");

    addPackageDependency({
      projectDir: authPackageDir,
      dependencies: deps,
      devMode: false,
    });

    // Copy auth config to packages/auth
    const authConfigSrc = path.join(
      extrasDir,
      "src/server/auth/config",
      usingPrisma
        ? "with-prisma.ts"
        : usingDrizzle
          ? "with-drizzle.ts"
          : "base.ts"
    );
    const authConfigDest = path.join(authPackageDir, "src/config.ts");

    const authIndexSrc = path.join(extrasDir, "src/server/auth/index.ts");
    const authIndexDest = path.join(authPackageDir, "src/index.ts");

    fs.copySync(authConfigSrc, authConfigDest);
    fs.copySync(authIndexSrc, authIndexDest);

    // Update imports in auth package config to use @repo/db
    let authConfigContent = fs.readFileSync(authConfigDest, "utf-8");
    authConfigContent = authConfigContent.replace(
      /from "~\/server\/db"/g,
      'from "@repo/db"'
    );
    fs.writeFileSync(authConfigDest, authConfigContent);

    // Copy API handler to web app
    const apiHandlerSrc = path.join(extrasDir, "src/app/api/auth/[...nextauth]/route.ts");
    const apiHandlerDest = path.join(webAppDir, "src/app/api/auth/[...nextauth]/route.ts");

    fs.copySync(apiHandlerSrc, apiHandlerDest);

    // Update imports in API handler to use @repo/auth
    let apiHandlerContent = fs.readFileSync(apiHandlerDest, "utf-8");
    apiHandlerContent = apiHandlerContent.replace(
      /from "~\/server\/auth"/g,
      'from "@repo/auth"'
    );
    fs.writeFileSync(apiHandlerDest, apiHandlerContent);

    return;
  }

  // Normal mode (existing code)
  addPackageDependency({
    projectDir,
    dependencies: deps,
    devMode: false,
  });

  const apiHandlerFile = "src/app/api/auth/[...nextauth]/route.ts";

  const apiHandlerSrc = path.join(extrasDir, apiHandlerFile);
  const apiHandlerDest = path.join(projectDir, apiHandlerFile);

  const authConfigSrc = path.join(
    extrasDir,
    "src/server/auth/config",
    usingPrisma
      ? "with-prisma.ts"
      : usingDrizzle
        ? "with-drizzle.ts"
        : "base.ts"
  );
  const authConfigDest = path.join(projectDir, "src/server/auth/config.ts");

  const authIndexSrc = path.join(extrasDir, "src/server/auth/index.ts");
  const authIndexDest = path.join(projectDir, "src/server/auth/index.ts");

  fs.copySync(apiHandlerSrc, apiHandlerDest);
  fs.copySync(authConfigSrc, authConfigDest);
  fs.copySync(authIndexSrc, authIndexDest);
};
