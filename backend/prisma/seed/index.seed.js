import { prisma } from "../../src/config/db.config.js";

import { seedLocations } from "./location.seed.js";
import { seedDepartments } from "./department.seed.js";
import { seedRolesAndPermissions } from "./roles.seed.js";
import { seedProvinceOfficer } from "./province.seed.js";
// import { seedScheme } from "./scheme.seed.js";
import {seedSuperAdmin} from "./admin.seed.js";

async function runStep(stepName, stepFunction) {
  console.log(`\n🚀 Starting: ${stepName}`);

  try {
    await stepFunction(prisma);
    console.log(`✅ Completed: ${stepName}`);
  } catch (error) {
    console.error(`❌ Failed at: ${stepName}`);
    throw error; // stop execution immediately
  }
}

async function main() {
  console.log("🌱 Starting Full Database Seed...\n");

  // Step 1
  await runStep("Seeding Locations", seedLocations);

  // Step 2 (runs ONLY if Step 1 succeeds)
  await runStep("Seeding Departments", seedDepartments);

  //Step 3
  await runStep("Seeding Roles & Permissions", seedRolesAndPermissions);

  // Step 4
  await runStep("Seeding Admin User", seedSuperAdmin);

  // Step 5
  await runStep("Seeding Province Officer", seedProvinceOfficer);

    // Step 6
    // await runStep("Seeding Schemes", seedScheme);

  console.log("\n🎉 All Seeding Completed Successfully!");
}

main()
  .catch((e) => {
    console.error("\n🔥 Seeding Process Stopped.");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });