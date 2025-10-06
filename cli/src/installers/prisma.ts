import path from "path";
import fs from "fs-extra";

import { PKG_ROOT } from "~/consts.js";
import { type Installer } from "~/installers/index.js";
import { addPackageDependency } from "~/utils/addPackageDependency.js";
import { addPackageScript } from "~/utils/addPackageScript.js";

export const prismaInstaller: Installer = ({
  projectDir,
  packages,
  databaseProvider,
  mode,
}) => {
  // Determine the target directory for DB package
  const dbDir = mode === "monorepo" ? path.join(projectDir, "packages/db") : projectDir;

  addPackageDependency({
    projectDir: dbDir,
    dependencies: ["prisma"],
    devMode: true,
  });
  addPackageDependency({
    projectDir: dbDir,
    dependencies: ["@prisma/client"],
    devMode: false,
  });
  if (databaseProvider === "planetscale")
    addPackageDependency({
      projectDir: dbDir,
      dependencies: ["@prisma/adapter-planetscale", "@planetscale/database"],
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

  const schemaSrc = path.join(
    extrasDir,
    "prisma/schema",
    `${usingAuth ? "with-auth" : "base"}${
      databaseProvider === "planetscale" ? "-planetscale" : ""
    }.prisma`
  );
  let schemaText = fs.readFileSync(schemaSrc, "utf-8");
  if (databaseProvider !== "sqlite") {
    schemaText = schemaText.replace(
      'provider = "sqlite"',
      `provider = "${
        {
          mysql: "mysql",
          postgres: "postgresql",
          planetscale: "mysql",
        }[databaseProvider]
      }"`
    );
    if (["mysql", "planetscale"].includes(databaseProvider)) {
      schemaText = schemaText.replace("// @db.Text", "@db.Text");
    }
  }
  const schemaDest = path.join(dbDir, "prisma/schema.prisma");
  fs.mkdirSync(path.dirname(schemaDest), { recursive: true });
  fs.writeFileSync(schemaDest, schemaText);

  const clientSrc = path.join(
    extrasDir,
    databaseProvider === "planetscale"
      ? "src/server/db/db-prisma-planetscale.ts"
      : "src/server/db/db-prisma.ts"
  );
  const clientDest = mode === "monorepo"
    ? path.join(dbDir, "src/client.ts")
    : path.join(projectDir, "src/server/db.ts");

  // In monorepo mode, use dotenv-cli to load .env from root
  const envPrefix = mode === "monorepo" ? "dotenv -e ../../.env -- " : "";

  addPackageScript({
    projectDir: dbDir,
    scripts: {
      postinstall: "prisma generate",
      "db:push": `${envPrefix}prisma db push`,
      "db:studio": `${envPrefix}prisma studio`,
      "db:generate": `${envPrefix}prisma migrate dev`,
      "db:migrate": `${envPrefix}prisma migrate deploy`,
    },
  });

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
    fs.writeFileSync(clientDest, clientContent);
  }
};
