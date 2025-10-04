import chalk from "chalk";
import { execa } from "execa";
import ora from "ora";

import { type PackageManager } from "~/utils/getUserPkgManager.js";
import { logger } from "~/utils/logger.js";

// Runs format and lint command to ensure created repository is tidy upon creation
export const formatProject = async ({
  pkgManager,
  projectDir,
  eslint,
  biome,
}: {
  pkgManager: PackageManager;
  projectDir: string;
  eslint: boolean;
  biome: boolean;
}) => {
  logger.info(`Formatting project with ${eslint ? "prettier" : "biome"}...`);
  const spinner = ora("Running format command\n").start();

  try {
    if (eslint) {
      await execa(pkgManager, ["run", "format:write"], {
        cwd: projectDir,
      });
    } else if (biome) {
      // Use bunx/npx to ensure we can find biome
      if (pkgManager === "bun") {
        await execa("bunx", ["--bun", "biome", "check", "--write", "--unsafe", "."], {
          cwd: projectDir,
        });
      } else {
        await execa(pkgManager, ["run", "check:unsafe"], {
          cwd: projectDir,
        });
      }
    }
    spinner.succeed(`${chalk.green("Successfully formatted project")}`);
  } catch (error) {
    spinner.warn(`${chalk.yellow("Skipped formatting - you can run it manually later with:")} ${chalk.cyan(pkgManager === "bun" ? "bunx --bun biome check --write ." : `${pkgManager} run check:unsafe`)}`)
  }
};
