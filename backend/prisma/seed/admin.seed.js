// import {prisma} from "../../src/config/db.config.js"
import bcrypt from "bcryptjs";
import {RoleType} from "../../generated/prisma/enums.ts";



export async function seedSuperAdmin(prisma) {
  try {
    const email = "superadmin@gov.np";
    const plainPassword = "Admin@123"; // change in production

    // 1️⃣ Check if Super Admin already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log("✅ Super Admin already exists.");
      return;
    }

    // 2️⃣ Hash password
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // 3️⃣ Ensure SUPER_ADMIN role exists
    let superAdminRole = await prisma.role.findFirst({
      where: { name: "SUPER_ADMIN" },
    });

    if (!superAdminRole) {
      superAdminRole = await prisma.role.create({
        data: {
          name: "SUPER_ADMIN",
        },
      });

      console.log("✅ SUPER_ADMIN role created.");
    }

    // 4️⃣ Create Super Admin user
    const user = await prisma.user.create({
      data: {
        username: "SuperAdmin",
        email,
        passwordHash: hashedPassword,
        status: "ACTIVE",
        mustChangePassword: false,
      },
    });

    // 5️⃣ Attach role to user
    await prisma.userRole.create({
      data: {
        userId: user.uid,
        roleId: superAdminRole.id,
      },
    });

    console.log("🚀 Super Admin seeded successfully!");
    console.log("📧 Email:", email);
    console.log("🔐 Password:", plainPassword);
  } catch (error) {
    console.error("❌ Error seeding Super Admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}


