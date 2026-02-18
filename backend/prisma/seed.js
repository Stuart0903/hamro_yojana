import { prisma } from "../src/config/db.config.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  console.log("🌱 Starting Nepal location seeding...");

  const filePath = join(__dirname, "data", "nepal-formatted.json");
  const rawData = readFileSync(filePath, "utf-8");
  const provinces = JSON.parse(rawData);

  // Transaction has a default timeout of 5s — too short for large datasets.
  // Using interactive transactions with increased timeout instead.
  await prisma.$transaction(
    async (tx) => {
      for (const provinceData of provinces) {
        console.log(`  Creating province: ${provinceData.name}`);

        const province = await tx.province.upsert({
          where: { name: provinceData.name },
          update: {},
          create: { name: provinceData.name },
        });

        for (const districtData of provinceData.districts) {
          console.log(`    Creating district: ${districtData.name}`);

          const district = await tx.district.upsert({
            where: {
              name_provinceId: {
                name: districtData.name,
                provinceId: province.id,
              },
            },
            update: {},
            create: {
              name: districtData.name,
              provinceId: province.id,
            },
          });

          for (const municipalityData of districtData.municipalities) {
            const municipality = await tx.municipality.upsert({
              where: {
                name_districtId: {
                  name: municipalityData.name,
                  districtId: district.id,
                },
              },
              update: {},
              create: {
                name: municipalityData.name,
                type: municipalityData.type,
                districtId: district.id,
              },
            });

            for (const wardData of municipalityData.wards) {
              await tx.ward.upsert({
                where: {
                  wardNumber_municipalityId: {
                    wardNumber: wardData.wardNumber,
                    municipalityId: municipality.id,
                  },
                },
                update: {},
                create: {
                  wardNumber: wardData.wardNumber,
                  municipalityId: municipality.id,
                },
              });
            }
          }
        }
      }
    },
    {
      maxWait: 300000, // 5 minutes
      timeout: 300000, // 5 minutes
    }
  );

  console.log("✅ Nepal location data seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });