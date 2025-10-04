import chalk from "chalk";
import ora from "ora";

import {
  type InstallerOptions,
  type PkgInstallerMap,
} from "~/installers/index.js";
import { monorepoInstaller } from "~/installers/monorepo.js";
import { packagesInstaller } from "~/installers/packages.js";
import { webappInstaller } from "~/installers/webapp.js";
import { expoInstaller } from "~/installers/expo.js";
import { moonrepoInstaller } from "~/installers/moonrepo.js";
import { shadcnInstaller } from "~/installers/shadcn.js";
import { logger } from "~/utils/logger.js";

type InstallPackagesOptions = InstallerOptions & {
  packages: PkgInstallerMap;
};
// This runs the installer for all the packages that the user has selected
export const installPackages = (options: InstallPackagesOptions) => {
  const { packages, mode } = options;

  // In monorepo mode, run special installers first
  if (mode === "monorepo") {
    logger.info("Setting up monorepo structure...\n");

    // Run monorepo-specific installers
    let spinner = ora(`Setting up monorepo base...`).start();
    monorepoInstaller(options);
    spinner.succeed(chalk.green(`Successfully setup monorepo base`));

    spinner = ora(`Setting up shared packages...`).start();
    packagesInstaller(options);
    spinner.succeed(chalk.green(`Successfully setup shared packages`));

    spinner = ora(`Setting up web app...`).start();
    webappInstaller(options);
    spinner.succeed(chalk.green(`Successfully setup web app`));

    spinner = ora(`Setting up Expo app...`).start();
    expoInstaller(options);
    spinner.succeed(chalk.green(`Successfully setup Expo app`));

    spinner = ora(`Setting up moonrepo...`).start();
    moonrepoInstaller(options);
    spinner.succeed(chalk.green(`Successfully setup moonrepo`));

    spinner = ora(`Setting up shadcn-ui...`).start();
    shadcnInstaller(options);
    spinner.succeed(chalk.green(`Successfully setup shadcn-ui`));

    logger.info("");
  }

  logger.info("Adding boilerplate...");

  for (const [name, pkgOpts] of Object.entries(packages)) {
    if (pkgOpts.inUse) {
      const spinner = ora(`Boilerplating ${name}...`).start();
      pkgOpts.installer(options);
      spinner.succeed(
        chalk.green(
          `Successfully setup boilerplate for ${chalk.green.bold(name)}`
        )
      );
    }
  }

  logger.info("");
};
