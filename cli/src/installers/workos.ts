import path from "path";
import fs from "fs-extra";

import { PKG_ROOT } from "~/consts.js";
import { type AvailableDependencies } from "~/installers/dependencyVersionMap.js";
import { type Installer } from "~/installers/index.js";
import { addPackageDependency } from "~/utils/addPackageDependency.js";

export const workosInstaller: Installer = ({ projectDir }) => {
  const deps: AvailableDependencies[] = ["@workos-inc/authkit-nextjs"];

  addPackageDependency({
    projectDir,
    dependencies: deps,
    devMode: false,
  });

  const extrasDir = path.join(PKG_ROOT, "template/extras");

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
