// import { prisma } from "../../src/config/db.config.js";

// ─────────────────────────────────────────────
// ALL PERMISSIONS
// ─────────────────────────────────────────────
const permissions = [
  // ── User Management ──
  { name: "user:read", description: "View user details" },
  { name: "user:create", description: "Create new users" },
  { name: "user:update", description: "Update user details" },
  { name: "user:delete", description: "Delete users" },

  // ── Citizen Profile ──
  { name: "citizen:read:own", description: "View own citizen profile" },
  { name: "citizen:update:own", description: "Update own citizen profile" },
  { name: "citizen:read:ward", description: "View citizens in own ward" },
  { name: "citizen:read:municipality", description: "View citizens in own municipality" },
  { name: "citizen:read:district", description: "View citizens in own district" },
  { name: "citizen:read:province", description: "View citizens in own province" },
  { name: "citizen:read:all", description: "View all citizens nationwide" },

  // ── Documents ──
  { name: "document:upload:own", description: "Upload own documents" },
  { name: "document:read:own", description: "View own documents" },
  { name: "document:read:ward", description: "View documents in own ward" },
  { name: "document:read:all", description: "View all documents" },
  { name: "document:verify", description: "Verify citizen documents" },

  // ── Applications ──
  { name: "application:create", description: "Apply to a scheme" },
  { name: "application:read:own", description: "View own applications" },
  { name: "application:track:own", description: "Track own application status" },
  { name: "application:read:ward", description: "View applications from own ward" },
  { name: "application:read:municipality", description: "View applications from own municipality" },
  { name: "application:read:district", description: "View applications from own district" },
  { name: "application:read:province", description: "View applications from own province" },
  { name: "application:read:all", description: "View all applications nationwide" },
  { name: "application:remark", description: "Add remarks to an application" },
  { name: "application:recommend", description: "Recommend application to next level" },
  { name: "application:reject", description: "Reject an application with reason" },
  { name: "application:approve:district", description: "Approve application for district escalation" },
  { name: "application:approve:province", description: "Approve application for province escalation" },
  { name: "application:approve:federal", description: "Final federal approval of application" },

  // ── Schemes ──
  { name: "scheme:read", description: "View government schemes" },
  { name: "scheme:create", description: "Create government schemes" },
  { name: "scheme:update", description: "Update government schemes" },
  { name: "scheme:delete", description: "Delete government schemes" },
  { name: "scheme:publish", description: "Publish government schemes" },
  { name: "scheme:freeze", description: "Freeze or close a scheme" },

  // ── Analytics ──
  { name: "analytics:province", description: "View province-level analytics" },
  { name: "analytics:national", description: "View nationwide analytics" },

  // ── Roles & Permissions ──
  { name: "role:read", description: "View roles" },
  { name: "role:assign", description: "Assign roles to users" },
  { name: "permission:read", description: "View permissions" },
  { name: "permission:assign", description: "Assign permissions to roles" },

  // ── Departments ──
  { name: "department:read", description: "View departments" },
  { name: "department:create", description: "Create departments" },
  { name: "department:update", description: "Update departments" },
  { name: "department:delete", description: "Delete departments" },

  // ── Office Profiles ──
  { name: "office:read", description: "View office profiles" },
  { name: "office:create", description: "Create office profiles" },
  { name: "office:update", description: "Update office profiles" },
  { name: "office:delete", description: "Delete office profiles" },

  // ── Jurisdiction ──
  { name: "jurisdiction:read", description: "View jurisdiction data" },
  { name: "jurisdiction:manage", description: "Manage jurisdiction data" },

  // ── Logs ──
  { name: "log:read", description: "View system logs" },

  // ── Emergency ──
  { name: "override:emergency", description: "Emergency system override" },
];

// ─────────────────────────────────────────────
// ROLE → PERMISSION MAPPING
// ─────────────────────────────────────────────
const rolePermissions = {
  CITIZEN: [
    "citizen:read:own",
    "citizen:update:own",
    "document:upload:own",
    "document:read:own",
    "application:create",
    "application:read:own",
    "application:track:own",
    "scheme:read",
    "jurisdiction:read",
  ],

  WARD_OFFICER: [
    "citizen:read:ward",
    "document:read:ward",
    "document:verify",
    "application:read:ward",
    "application:remark",
    "application:recommend",
    "application:reject",
    "scheme:read",
    "jurisdiction:read",
    "office:read",
  ],

  MUNICIPALITY_OFFICER: [
    "citizen:read:municipality",
    "document:read:all",
    "document:verify",
    "application:read:municipality",
    "application:remark",
    "application:recommend",
    "application:reject",
    "application:approve:district",
    "scheme:read",
    "jurisdiction:read",
    "office:read",
  ],

  DISTRICT_OFFICER: [
    "citizen:read:district",
    "document:read:all",
    "document:verify",
    "application:read:district",
    "application:remark",
    "application:recommend",
    "application:reject",
    "application:approve:province",
    "scheme:read",
    "jurisdiction:read",
    "office:read",
    "department:read",
  ],

  PROVINCE_OFFICER: [
    "citizen:read:province",
    "document:read:all",
    "application:read:province",
    "application:remark",
    "application:recommend",
    "application:reject",
    "application:approve:federal",
    "analytics:province",
    "scheme:read",
    "scheme:create",
    "scheme:update",
    "jurisdiction:read",
    "office:read",
    "department:read",
  ],

  MINISTRY_OFFICER: [
    "citizen:read:all",
    "application:read:all",
    "application:approve:federal",
    "scheme:read",
    "scheme:create",
    "scheme:update",
    "scheme:delete",
    "scheme:publish",
    "scheme:freeze",
    "analytics:province",
    "analytics:national",
    "jurisdiction:read",
    "department:read",
    "department:create",
    "department:update",
    "office:read",
    "office:create",
    "office:update",
    "role:read",
    "role:assign",
  ],

  SUPER_ADMIN: [
    "user:read",
    "user:create",
    "user:update",
    "user:delete",
    "role:read",
    "role:assign",
    "permission:read",
    "permission:assign",
    "department:read",
    "department:create",
    "department:update",
    "department:delete",
    "office:read",
    "office:create",
    "office:update",
    "office:delete",
    "jurisdiction:read",
    "jurisdiction:manage",
    "log:read",
    "override:emergency",
    "analytics:national",
  ],
};

// ─────────────────────────────────────────────
// SEED FUNCTION (TRANSACTION SAFE)
// ─────────────────────────────────────────────
export async function seedRolesAndPermissions(prisma) {
  console.log("🌱 Seeding roles and permissions...\n");

  await prisma.$transaction(async (tx) => {
    console.log("  📋 Seeding permissions...");
    for (const permission of permissions) {
      await tx.permission.upsert({
        where: { name: permission.name },
        update: { description: permission.description },
        create: { name: permission.name, description: permission.description },
      });
    }

    console.log("  👥 Seeding roles...");
    for (const roleName of Object.keys(rolePermissions)) {
      await tx.role.upsert({
        where: { name: roleName },
        update: {},
        create: { name: roleName },
      });
    }

    console.log("  🔗 Mapping permissions to roles...");
    for (const [roleName, permissionNames] of Object.entries(rolePermissions)) {
      const role = await tx.role.findUnique({
        where: { name: roleName },
      });

      if (!role) throw new Error(`Role not found: ${roleName}`);

      for (const permissionName of permissionNames) {
        const permission = await tx.permission.findUnique({
          where: { name: permissionName },
        });

        if (!permission)
          throw new Error(`Permission not found: ${permissionName}`);

        await tx.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: permission.id,
          },
        });
      }
    }
  });

  console.log("\n✅ Roles and permissions seeded successfully!");
}

// ─────────────────────────────────────────────
// EXECUTE
// ─────────────────────────────────────────────

