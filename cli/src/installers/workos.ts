import path from "path";
import fs from "fs-extra";

import { PKG_ROOT } from "~/consts.js";
import { type AvailableDependencies } from "~/installers/dependencyVersionMap.js";
import { type Installer } from "~/installers/index.js";
import { addPackageDependency } from "~/utils/addPackageDependency.js";

export const workosInstaller: Installer = ({ projectDir, mode }) => {
  const deps: AvailableDependencies[] = ["@workos-inc/authkit-nextjs"];

  const extrasDir = path.join(PKG_ROOT, "template/extras");

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
      "src/app/api/auth/callback/route.ts"
    );
    const callbackRouteDest = path.join(
      webAppDir,
      "src/app/api/auth/callback/route.ts"
    );

    // Copy middleware to web app
    const middlewareSrc = path.join(extrasDir, "src/middleware-workos.ts");
    const middlewareDest = path.join(webAppDir, "src/middleware.ts");

    fs.copySync(callbackRouteSrc, callbackRouteDest);
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
    "src/app/api/auth/callback/route.ts"
  );
  const callbackRouteDest = path.join(
    projectDir,
    "src/app/api/auth/callback/route.ts"
  );

  // Copy middleware
  const middlewareSrc = path.join(extrasDir, "src/middleware-workos.ts");
  const middlewareDest = path.join(projectDir, "src/middleware.ts");

  // Copy auth helper
  const authHelperSrc = path.join(extrasDir, "src/server/auth/workos.ts");
  const authHelperDest = path.join(projectDir, "src/server/auth.ts");

  fs.copySync(callbackRouteSrc, callbackRouteDest);
  fs.copySync(middlewareSrc, middlewareDest);
  fs.copySync(authHelperSrc, authHelperDest);
};
