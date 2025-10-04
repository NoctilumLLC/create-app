import { type Installer } from "~/installers/index.js";
import { addPackageDependency } from "~/utils/addPackageDependency.js";

export const moonrepoInstaller: Installer = ({ projectDir }) => {
  // Add @moonrepo/cli as a dev dependency
  addPackageDependency({
    projectDir,
    dependencies: ["@moonrepo/cli"],
    devMode: true,
  });

  // The .moon/workspace.yml is already copied by the monorepoInstaller
  // This installer is mainly for adding moonrepo as a dependency
  // and potentially adding project-specific moon.yml files later
};
