// import { prisma } from "../../src/config/db.config.js";

const departments = [
  { name: "Ministry of Home Affairs", code: "MHA" },
  { name: "Ministry of Health", code: "MOH" },
  { name: "Ministry of Education", code: "MOE" },
  { name: "Ministry of Finance", code: "MOF" },
  { name: "Ministry of Agriculture", code: "MOA" },
];

export async function seedDepartments(prisma) {
  try {
    console.log("🌱 Seeding Departments...");

    for (const dept of departments) {
      await prisma.department.upsert({
        where: { name: dept.name },
        update: {},
        create: dept,
      });
    }

    console.log("✅ Departments seeded successfully.");
  } catch (error) {
    console.error("❌ Department seeding failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

