import path from "path";
import fs from "fs-extra";

import { PKG_ROOT } from "~/consts.js";
import { type Installer } from "~/installers/index.js";

export const packagesInstaller: Installer = ({ projectDir, projectName }) => {
  const extrasDir = path.join(PKG_ROOT, "template/monorepo-packages");
  const packagesDir = path.join(projectDir, "packages");

  // Copy all package templates
  const packages = ["api", "db", "auth", "ui", "config"];

  packages.forEach((pkg) => {
    const srcDir = path.join(extrasDir, pkg);
    const destDir = path.join(packagesDir, pkg);

    fs.copySync(srcDir, destDir);

    // Package names stay as @repo/* for consistency
    // No need to update package.json names
  });
};
