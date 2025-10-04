import path from "path";
import fs from "fs-extra";

import { type Installer } from "~/installers/index.js";
import { addPackageDependency } from "~/utils/addPackageDependency.js";

export const shadcnInstaller: Installer = ({ projectDir }) => {
  // Add shadcn-ui dependencies to the UI package
  const uiPackageDir = path.join(projectDir, "packages/ui");

  const deps = [
    "class-variance-authority",
    "clsx",
    "tailwind-merge",
    "lucide-react",
  ] as const;

  addPackageDependency({
    projectDir: uiPackageDir,
    dependencies: [...deps],
    devMode: false,
  });

  // Create lib directory for cn utility
  const libDir = path.join(uiPackageDir, "src/lib");
  fs.mkdirSync(libDir, { recursive: true });

  // Create cn utility function
  const cnUtilContent = `import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`;

  fs.writeFileSync(path.join(libDir, "utils.ts"), cnUtilContent);

  // Update ui package index to export the utility
  const indexPath = path.join(uiPackageDir, "src/index.ts");
  fs.writeFileSync(
    indexPath,
    `// Shared UI components and utilities\nexport { cn } from "./lib/utils.js";\n`
  );
};
