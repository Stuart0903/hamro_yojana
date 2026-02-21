import { prisma } from "../../src/config/db.config.js";
import bcrypt from "bcryptjs";

export async function seedProvinceOfficer() {
  try {
    console.log("🌱 Seeding Province Officer...");

    // 1️⃣ Get Role
    const role = await prisma.role.findUnique({
      where: { name: "PROVINCE_OFFICER" },
    });

    if (!role) {
      throw new Error("PROVINCE_OFFICER role not found. Seed roles first.");
    }

    // 2️⃣ Get a Department (required)
    const department = await prisma.department.findFirst();

    if (!department) {
      throw new Error("No department found. Seed department first.");
    }

    // 3️⃣ Get a Province (required for province officer)
    const province = await prisma.province.findFirst();

    if (!province) {
      throw new Error("No province found. Seed province first.");
    }

    // 4️⃣ Check if already exists
    const existing = await prisma.user.findUnique({
      where: { email: "province@test.com" },
    });

    if (existing) {
      console.log("⚠ Province officer already exists.");
      return;
    }

    // 5️⃣ Hash password
    const passwordHash = await bcrypt.hash("Province123", 10);

    // 6️⃣ Transaction
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username: "provinceOfficer",
          email: "province@test.com",
          passwordHash,
          status: "ACTIVE",
        },
      });

      await tx.userRole.create({
        data: {
          userId: user.uid,
          roleId: role.id,
        },
      });

      await tx.officeProfile.create({
        data: {
          userId: user.uid,
          departmentId: department.id,
          jurisdictionLevel: "PROVINCE",
          provinceId: province.id,
        },
      });
    });

    console.log("✅ Province Officer seeded successfully.");

  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

