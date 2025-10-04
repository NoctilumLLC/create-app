import path from "path";
import fs from "fs-extra";

import { PKG_ROOT } from "~/consts.js";
import { type Installer } from "~/installers/index.js";
import { addPackageDependency } from "~/utils/addPackageDependency.js";
import { addPackageScript } from "~/utils/addPackageScript.js";

export const biomeInstaller: Installer = ({ projectDir, mode }) => {
  if (mode === "monorepo") {
    // In monorepo mode, Biome is configured at the root
    // Add biome as root devDependency and add scripts to root package.json
    addPackageDependency({
      projectDir,
      dependencies: ["@biomejs/biome"],
      devMode: true,
    });

    // Copy biome config to root
    const extrasDir = path.join(PKG_ROOT, "template/extras");
    const biomeConfigSrc = path.join(extrasDir, "config/biome.jsonc");
    const biomeConfigDest = path.join(projectDir, "biome.jsonc");
    fs.copySync(biomeConfigSrc, biomeConfigDest);

    addPackageScript({
      projectDir,
      scripts: {
        "check:unsafe": "biome check --write --unsafe .",
        "check:write": "biome check --write .",
        check: "biome check .",
      },
    });
    return;
  }

  // Normal mode (existing code)
  addPackageDependency({
    projectDir,
    dependencies: ["@biomejs/biome"],
    devMode: true,
  });

  const extrasDir = path.join(PKG_ROOT, "template/extras");
  const biomeConfigSrc = path.join(extrasDir, "config/biome.jsonc");
  const biomeConfigDest = path.join(projectDir, "biome.jsonc");

  fs.copySync(biomeConfigSrc, biomeConfigDest);

  addPackageScript({
    projectDir,
    scripts: {
      "check:unsafe": "biome check --write --unsafe .",
      "check:write": "biome check --write .",
      check: "biome check .",
    },
  });
};
