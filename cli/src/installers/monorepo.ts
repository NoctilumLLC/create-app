import path from "path";
import fs from "fs-extra";

import { PKG_ROOT } from "~/consts.js";
import { type Installer } from "~/installers/index.js";

export const monorepoInstaller: Installer = ({
  projectDir,
  projectName,
}) => {
  const extrasDir = path.join(PKG_ROOT, "template/monorepo-base");

  // Copy root package.json
  const packageJsonSrc = path.join(extrasDir, "package.json");
  const packageJsonDest = path.join(projectDir, "package.json");
  let packageJsonContent = fs.readFileSync(packageJsonSrc, "utf-8");

  // Replace app name in package.json
  packageJsonContent = packageJsonContent.replace(
    '"name": "create-t3-app"',
    `"name": "${projectName}"`
  );

  fs.writeFileSync(packageJsonDest, packageJsonContent);

  // Copy .gitignore
  const gitignoreSrc = path.join(extrasDir, ".gitignore");
  const gitignoreDest = path.join(projectDir, ".gitignore");
  fs.copySync(gitignoreSrc, gitignoreDest);

  // Copy README.md
  const readmeSrc = path.join(extrasDir, "README.md");
  const readmeDest = path.join(projectDir, "README.md");
  fs.copySync(readmeSrc, readmeDest);

  // Copy .moon directory
  const moonSrc = path.join(extrasDir, ".moon");
  const moonDest = path.join(projectDir, ".moon");
  fs.copySync(moonSrc, moonDest);

  // Create apps and packages directories
  fs.mkdirSync(path.join(projectDir, "apps"), { recursive: true });
  fs.mkdirSync(path.join(projectDir, "packages"), { recursive: true });

  // Create apps/web directory (will be populated by web app installer)
  fs.mkdirSync(path.join(projectDir, "apps/web"), { recursive: true });

  // Create apps/expo directory (will be populated by expo installer)
  fs.mkdirSync(path.join(projectDir, "apps/expo"), { recursive: true });

  // Create package directories (will be populated by package installers)
  const packages = ["api", "db", "auth", "ui", "config"];
  packages.forEach((pkg) => {
    fs.mkdirSync(path.join(projectDir, `packages/${pkg}`), { recursive: true });
  });
};
