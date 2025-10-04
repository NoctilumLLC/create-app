import path from "path";
import fs from "fs-extra";

import { PKG_ROOT } from "~/consts.js";
import { type Installer } from "~/installers/index.js";
import { addPackageDependency } from "~/utils/addPackageDependency.js";

export const expoInstaller: Installer = ({ projectDir, projectName }) => {
  const expoAppDir = path.join(projectDir, "apps/expo");
  const extrasDir = path.join(PKG_ROOT, "template/monorepo-expo");

  // Copy Expo app template FIRST
  fs.copySync(extrasDir, expoAppDir);

  // Add Expo dependencies
  const deps = [
    "expo",
    "expo-router",
    "expo-status-bar",
    "expo-linking",
    "expo-constants",
    "expo-font",
    "expo-splash-screen",
    "react-native",
    "react-native-safe-area-context",
    "react-native-screens",
    "react-native-reanimated",
    "react-native-gesture-handler",
    "react-native-web",
    "nativewind",
  ] as const;

  addPackageDependency({
    projectDir: expoAppDir,
    dependencies: [...deps],
    devMode: false,
  });

  // Add Tailwind v3 for NativeWind (aliased as tailwindcss-v3)
  addPackageDependency({
    projectDir: expoAppDir,
    dependencies: ["tailwindcss-v3"],
    devMode: true,
  });

  // Update app.json with project name
  const appJsonPath = path.join(expoAppDir, "app.json");
  let appJsonContent = fs.readFileSync(appJsonPath, "utf-8");
  const appJson = JSON.parse(appJsonContent) as {
    expo: {
      name: string;
      slug: string;
      scheme: string;
    };
  };

  appJson.expo.name = projectName;
  appJson.expo.slug = projectName;
  appJson.expo.scheme = projectName;

  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));

  // Update package.json with project name
  const packageJsonPath = path.join(expoAppDir, "package.json");
  let packageJsonContent = fs.readFileSync(packageJsonPath, "utf-8");
  packageJsonContent = packageJsonContent.replace(
    '"name": "@repo/expo"',
    `"name": "@${projectName}/expo"`
  );

  fs.writeFileSync(packageJsonPath, packageJsonContent);
};
