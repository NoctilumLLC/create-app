import path from "path";
import fs from "fs-extra";

import { PKG_ROOT } from "~/consts.js";
import { type Installer } from "~/installers/index.js";
import { addPackageDependency } from "~/utils/addPackageDependency.js";
import { addPackageScript } from "~/utils/addPackageScript.js";

export const drizzleInstaller: Installer = ({
  projectDir,
  packages,
  scopedAppName,
  databaseProvider,
  mode,
}) => {
  // Determine the target directory for DB package
  const dbDir = mode === "monorepo" ? path.join(projectDir, "packages/db") : projectDir;

  addPackageDependency({
    projectDir: dbDir,
    dependencies: ["drizzle-kit"],
    devMode: true,
  });
  addPackageDependency({
    projectDir: dbDir,
    dependencies: [
      "drizzle-orm",
      (
        {
          planetscale: "@planetscale/database",
          mysql: "mysql2",
          postgres: "postgres",
          sqlite: "@libsql/client",
        } as const
      )[databaseProvider],
    ],
    devMode: false,
  });

  // In monorepo mode, add dotenv-cli to load .env from root
  if (mode === "monorepo") {
    addPackageDependency({
      projectDir: dbDir,
      dependencies: ["dotenv-cli"],
      devMode: true,
    });
  }

  const extrasDir = path.join(PKG_ROOT, "template/extras");

  const usingAuth = packages?.nextAuth.inUse || packages?.workos.inUse;

  const configFile = path.join(
    extrasDir,
    `config/drizzle-config-${
      databaseProvider === "planetscale" ? "mysql" : databaseProvider
    }.ts`
  );
  const configDest = path.join(dbDir, "drizzle.config.ts");

  const schemaSrc = path.join(
    extrasDir,
    "src/server/db/schema-drizzle",
    usingAuth
      ? `with-auth-${databaseProvider}.ts`
      : `base-${databaseProvider}.ts`
  );
  const schemaDest = mode === "monorepo"
    ? path.join(dbDir, "src/schema.ts")
    : path.join(projectDir, "src/server/db/schema.ts");

  // Replace placeholder table prefix with project name
  let schemaContent = fs.readFileSync(schemaSrc, "utf-8");
  schemaContent = schemaContent.replace(
    "project1_${name}",
    `${scopedAppName}_\${name}`
  );

  let configContent = fs.readFileSync(configFile, "utf-8");

  configContent = configContent.replace("project1_*", `${scopedAppName}_*`);

  const clientSrc = path.join(
    extrasDir,
    `src/server/db/index-drizzle/with-${databaseProvider}.ts`
  );
  const clientDest = mode === "monorepo"
    ? path.join(dbDir, "src/client.ts")
    : path.join(projectDir, "src/server/db/index.ts");

  // In monorepo mode, use dotenv-cli to load .env from root
  const envPrefix = mode === "monorepo" ? "dotenv -e ../../.env -- " : "";

  addPackageScript({
    projectDir: dbDir,
    scripts: {
      "db:push": `${envPrefix}drizzle-kit push`,
      "db:studio": `${envPrefix}drizzle-kit studio`,
      "db:generate": `${envPrefix}drizzle-kit generate`,
      "db:migrate": `${envPrefix}drizzle-kit migrate`,
    },
  });

  fs.copySync(configFile, configDest);
  fs.mkdirSync(path.dirname(schemaDest), { recursive: true });
  fs.writeFileSync(schemaDest, schemaContent);
  fs.writeFileSync(configDest, configContent);
  fs.copySync(clientSrc, clientDest);

  // In monorepo mode, replace ~/env imports with process.env since env validation
  // happens in the consuming apps, not in the shared db package
  if (mode === "monorepo") {
    let clientContent = fs.readFileSync(clientDest, "utf-8");
    clientContent = clientContent.replace(
      /import { env } from "~\/env";?\n/g,
      ""
    );
    clientContent = clientContent.replace(
      /env\.NODE_ENV/g,
      'process.env.NODE_ENV'
    );
    clientContent = clientContent.replace(
      /env\.DATABASE_URL/g,
      'process.env.DATABASE_URL!'
    );
    // For Drizzle, also update the schema import path in monorepo mode
    clientContent = clientContent.replace(
      /from "\.\/schema"/g,
      'from "./schema"'
    );
    fs.writeFileSync(clientDest, clientContent);

    // Also update index.ts to export schema in monorepo mode
    const indexPath = path.join(dbDir, "src/index.ts");
    const indexContent = `// Database exports
export { db } from "./client";
export * as schema from "./schema";
`;
    fs.writeFileSync(indexPath, indexContent);
  }
};
