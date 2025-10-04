import path from "path";
import fs from "fs-extra";

import { PKG_ROOT } from "~/consts.js";
import { type Installer } from "~/installers/index.js";
import { addPackageDependency } from "~/utils/addPackageDependency.js";

export const tailwindInstaller: Installer = ({ projectDir, mode }) => {
  const webAppDir = mode === "monorepo" ? path.join(projectDir, "apps/web") : projectDir;

  addPackageDependency({
    projectDir: webAppDir,
    dependencies: ["tailwindcss", "postcss", "@tailwindcss/postcss"],
    devMode: true,
  });

  const extrasDir = path.join(PKG_ROOT, "template/extras");

  const postcssCfgSrc = path.join(extrasDir, "config/postcss.config.js");
  const postcssCfgDest = path.join(webAppDir, "postcss.config.js");

  const cssSrc = path.join(extrasDir, "src/styles/globals.css");
  const cssDest = path.join(webAppDir, "src/styles/globals.css");

  fs.copySync(postcssCfgSrc, postcssCfgDest);
  fs.copySync(cssSrc, cssDest);
};
