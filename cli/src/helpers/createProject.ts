import fs from "fs";
import path from "path";

import { PKG_ROOT } from "~/consts.js";
import { installPackages } from "~/helpers/installPackages.js";
import { scaffoldProject } from "~/helpers/scaffoldProject.js";
import {
  selectAppFile,
  selectIndexFile,
  selectLayoutFile,
  selectPageFile,
} from "~/helpers/selectBoilerplate.js";
import {
  type DatabaseProvider,
  type PkgInstallerMap,
} from "~/installers/index.js";
import { getUserPkgManager } from "~/utils/getUserPkgManager.js";

interface CreateProjectOptions {
  projectName: string;
  packages: PkgInstallerMap;
  scopedAppName: string;
  noInstall: boolean;
  importAlias: string;
  appRouter: boolean;
  databaseProvider: DatabaseProvider;
  mode: "normal" | "monorepo";
}

export const createProject = async ({
  projectName,
  scopedAppName,
  packages,
  noInstall,
  appRouter,
  databaseProvider,
  mode,
}: CreateProjectOptions) => {
  const pkgManager = getUserPkgManager();
  const projectDir = path.resolve(process.cwd(), projectName);

  // Bootstraps the base Next.js application
  await scaffoldProject({
    projectName,
    projectDir,
    pkgManager,
    scopedAppName,
    noInstall,
    appRouter,
    databaseProvider,
    mode,
  });

  // Install the selected packages
  installPackages({
    projectName,
    scopedAppName,
    projectDir,
    pkgManager,
    packages,
    noInstall,
    appRouter,
    databaseProvider,
    mode,
  });

  // Select necessary _app,index / layout,page files
  const webAppDir = mode === "monorepo" ? path.join(projectDir, "apps/web") : projectDir;

  if (appRouter) {
    // Replace next.config
    fs.copyFileSync(
      path.join(PKG_ROOT, "template/extras/config/next-config-appdir.js"),
      path.join(webAppDir, "next.config.js")
    );

    selectLayoutFile({ projectDir: webAppDir, packages, mode });
    selectPageFile({ projectDir: webAppDir, packages, mode });
  } else {
    selectAppFile({ projectDir: webAppDir, packages });
    selectIndexFile({ projectDir: webAppDir, packages });
  }

  // If no tailwind, select use css modules
  if (!packages.tailwind.inUse) {
    const indexModuleCss = path.join(
      PKG_ROOT,
      "template/extras/src/index.module.css"
    );
    const indexModuleCssDest = path.join(
      webAppDir,
      "src",
      appRouter ? "app" : "pages",
      "index.module.css"
    );
    fs.copyFileSync(indexModuleCss, indexModuleCssDest);
  }

  return projectDir;
};
