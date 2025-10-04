import path from "path";
import fs from "fs-extra";

import { PKG_ROOT } from "~/consts.js";
import { type Installer } from "~/installers/index.js";

export const webappInstaller: Installer = ({ projectDir, projectName }) => {
  // In monorepo mode, scaffold the base Next.js app in apps/web
  const webAppDir = path.join(projectDir, "apps/web");
  const baseDir = path.join(PKG_ROOT, "template/base");
  const monorepoWebDir = path.join(PKG_ROOT, "template/monorepo-web");

  // Copy base Next.js template to apps/web
  fs.copySync(baseDir, webAppDir);

  // Copy moon.yml for web app
  const moonYmlSrc = path.join(monorepoWebDir, "moon.yml");
  const moonYmlDest = path.join(webAppDir, "moon.yml");
  if (fs.existsSync(moonYmlSrc)) {
    fs.copySync(moonYmlSrc, moonYmlDest);
  }

  // Rename _gitignore (we don't need it in apps/web, only at root)
  const gitignorePath = path.join(webAppDir, "_gitignore");
  if (fs.existsSync(gitignorePath)) {
    fs.removeSync(gitignorePath);
  }

  // Update package.json name and add workspace dependencies
  const packageJsonPath = path.join(webAppDir, "package.json");
  const packageJson = fs.readJSONSync(packageJsonPath);

  packageJson.name = `@${projectName}/web`;

  // Add workspace dependencies manually
  if (!packageJson.dependencies) {
    packageJson.dependencies = {};
  }
  packageJson.dependencies["@repo/api"] = "workspace:*";
  packageJson.dependencies["@repo/db"] = "workspace:*";
  packageJson.dependencies["@repo/auth"] = "workspace:*";
  packageJson.dependencies["@repo/ui"] = "workspace:*";

  if (!packageJson.devDependencies) {
    packageJson.devDependencies = {};
  }
  packageJson.devDependencies["@repo/config"] = "workspace:*";

  fs.writeJSONSync(packageJsonPath, packageJson, { spaces: 2 });
};
