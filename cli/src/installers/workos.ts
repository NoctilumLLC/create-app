import path from "path";
import fs from "fs-extra";

import { PKG_ROOT } from "~/consts.js";
import { type AvailableDependencies } from "~/installers/dependencyVersionMap.js";
import { type Installer } from "~/installers/index.js";
import { addPackageDependency } from "~/utils/addPackageDependency.js";

export const workosInstaller: Installer = ({ projectDir, packages, mode }) => {
  const deps: AvailableDependencies[] = ["@workos-inc/authkit-nextjs"];

  const extrasDir = path.join(PKG_ROOT, "template/extras");

  // Determine which ORM is being used to select the correct callback route
  const usingPrisma = packages?.prisma.inUse;
  const usingDrizzle = packages?.drizzle.inUse;

  // Select callback route based on mode and ORM
  let callbackRouteFile: string;
  if (mode === "monorepo") {
    if (usingPrisma) {
      callbackRouteFile = "route-workos-prisma-monorepo.ts";
    } else if (usingDrizzle) {
      callbackRouteFile = "route-workos-drizzle-monorepo.ts";
    } else {
      callbackRouteFile = "route.ts";
    }
  } else {
    if (usingPrisma) {
      callbackRouteFile = "route-workos-prisma-normal.ts";
    } else if (usingDrizzle) {
      callbackRouteFile = "route-workos-drizzle-normal.ts";
    } else {
      callbackRouteFile = "route.ts";
    }
  }

  if (mode === "monorepo") {
    // In monorepo mode, WorkOS config goes to packages/auth
    const authPackageDir = path.join(projectDir, "packages/auth");
    const webAppDir = path.join(projectDir, "apps/web");

    addPackageDependency({
      projectDir: authPackageDir,
      dependencies: deps,
      devMode: false,
    });

    // Copy auth helper to packages/auth
    const authHelperSrc = path.join(extrasDir, "src/server/auth/workos.ts");
    const authHelperDest = path.join(authPackageDir, "src/index.ts");

    fs.copySync(authHelperSrc, authHelperDest);

    // Copy callback route to web app
    const callbackRouteSrc = path.join(
      extrasDir,
      `src/app/api/auth/callback/${callbackRouteFile}`
    );
    const callbackRouteDest = path.join(
      webAppDir,
      "src/app/api/auth/callback/route.ts"
    );

    // Copy signout route to web app
    const signoutRouteSrc = path.join(
      extrasDir,
      "src/app/api/auth/signout/route.ts"
    );
    const signoutRouteDest = path.join(
      webAppDir,
      "src/app/api/auth/signout/route.ts"
    );

    // Copy middleware to web app
    const middlewareSrc = path.join(extrasDir, "src/middleware-workos.ts");
    const middlewareDest = path.join(webAppDir, "src/middleware.ts");

    fs.copySync(callbackRouteSrc, callbackRouteDest);
    fs.copySync(signoutRouteSrc, signoutRouteDest);
    fs.copySync(middlewareSrc, middlewareDest);

    return;
  }

  // Normal mode (existing code)
  addPackageDependency({
    projectDir,
    dependencies: deps,
    devMode: false,
  });

  // Copy callback route
  const callbackRouteSrc = path.join(
    extrasDir,
    `src/app/api/auth/callback/${callbackRouteFile}`
  );
  const callbackRouteDest = path.join(
    projectDir,
    "src/app/api/auth/callback/route.ts"
  );

  // Copy signout route
  const signoutRouteSrc = path.join(
    extrasDir,
    "src/app/api/auth/signout/route.ts"
  );
  const signoutRouteDest = path.join(
    projectDir,
    "src/app/api/auth/signout/route.ts"
  );

  // Copy middleware
  const middlewareSrc = path.join(extrasDir, "src/middleware-workos.ts");
  const middlewareDest = path.join(projectDir, "src/middleware.ts");

  // Copy auth helper
  const authHelperSrc = path.join(extrasDir, "src/server/auth/workos.ts");
  const authHelperDest = path.join(projectDir, "src/server/auth.ts");

  fs.copySync(callbackRouteSrc, callbackRouteDest);
  fs.copySync(signoutRouteSrc, signoutRouteDest);
  fs.copySync(middlewareSrc, middlewareDest);
  fs.copySync(authHelperSrc, authHelperDest);
};
