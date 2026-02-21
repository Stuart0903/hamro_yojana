import {prisma} from "../../src/config/db.config.js";
import { SchemeCategory, SchemeStatus, RequirementType } from "../../generated/prisma/enums.ts";

const OFFICER_ID = "cmlw9aytm0002l0guz6ymse7w";

export async function seedScheme() {
  console.log("🌱 Seeding 10 schemes with requirements...\n");
  console.log(SchemeCategory.EMPLOYMENT);
  console.log(RequirementType.DOCUMENT);
  

  const schemesData = [
    {
      title: "Youth Self Employment Program",
      description: "Financial support for youth entrepreneurs.",
      objectives: "Encourage self-employment among youth.",
      category: SchemeCategory.EMPLOYMENT,
      budget: 5000000,
      minAge: 18,
      maxAge: 35,
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-12-31"),
      requirements: [
        { title: "Citizenship Certificate", type: RequirementType.DOCUMENT },
        { title: "Business Proposal", type: RequirementType.DOCUMENT },
        { title: "Applicant Age", type: RequirementType.NUMBER },
      ],
    },
    {
      title: "Senior Citizen Allowance",
      description: "Monthly allowance for senior citizens.",
      objectives: "Support elderly citizens.",
      category: SchemeCategory.SOCIAL_SECURITY,
      budget: 2000000,
      minAge: 60,
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-12-31"),
      requirements: [
        { title: "Citizenship Certificate", type: RequirementType.DOCUMENT },
        { title: "Age Verification", type: RequirementType.NUMBER },
      ],
    },
    {
      title: "Women Entrepreneurship Grant",
      description: "Grant for women-led businesses.",
      objectives: "Empower women entrepreneurs.",
      category: SchemeCategory.EMPLOYMENT,
      budget: 3000000,
      startDate: new Date("2025-02-01"),
      endDate: new Date("2025-11-30"),
      requirements: [
        { title: "Business Registration Document", type: RequirementType.DOCUMENT },
        { title: "Citizenship Certificate", type: RequirementType.DOCUMENT },
      ],
    },
    {
      title: "Agriculture Modernization Support",
      description: "Subsidy for modern farming equipment.",
      objectives: "Promote modern farming techniques.",
      category: SchemeCategory.AGRICULTURE,
      budget: 4000000,
      startDate: new Date("2025-03-01"),
      endDate: new Date("2025-10-31"),
      requirements: [
        { title: "Land Ownership Certificate", type: RequirementType.DOCUMENT },
        { title: "Farm Details", type: RequirementType.TEXT },
      ],
    },
    {
      title: "Student Scholarship Program",
      description: "Scholarship for underprivileged students.",
      objectives: "Support education access.",
      category: SchemeCategory.EDUCATION,
      budget: 2500000,
      startDate: new Date("2025-01-15"),
      endDate: new Date("2025-09-30"),
      requirements: [
        { title: "School Enrollment Certificate", type: RequirementType.DOCUMENT },
        { title: "Income Certificate", type: RequirementType.DOCUMENT },
      ],
    },
    {
      title: "Disability Support Allowance",
      description: "Allowance for differently-abled citizens.",
      objectives: "Provide financial support.",
      category: SchemeCategory.SOCIAL_SECURITY,
      budget: 1500000,
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-12-31"),
      requirements: [
        { title: "Disability Certificate", type: RequirementType.DOCUMENT },
      ],
    },
    {
      title: "Small Business Recovery Fund",
      description: "Post-disaster recovery fund.",
      objectives: "Support small businesses.",
      category: SchemeCategory.BUSINESS,
      budget: 3500000,
      startDate: new Date("2025-04-01"),
      endDate: new Date("2025-12-31"),
      requirements: [
        { title: "Business Registration", type: RequirementType.DOCUMENT },
        { title: "Damage Report", type: RequirementType.DOCUMENT },
      ],
    },
    {
      title: "Health Insurance Subsidy",
      description: "Government health insurance subsidy.",
      objectives: "Improve healthcare access.",
      category: SchemeCategory.HEALTH,
      budget: 4500000,
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-12-31"),
      requirements: [
        { title: "Family Income Certificate", type: RequirementType.DOCUMENT },
      ],
    },
    {
      title: "Housing Reconstruction Grant",
      description: "Financial support for house reconstruction.",
      objectives: "Rebuild disaster-affected homes.",
      category: SchemeCategory.HOUSING,
      budget: 6000000,
      startDate: new Date("2025-05-01"),
      endDate: new Date("2025-12-31"),
      requirements: [
        { title: "Damage Assessment Report", type: RequirementType.DOCUMENT },
      ],
    },
    {
      title: "Digital Literacy Program",
      description: "Free digital literacy training.",
      objectives: "Improve digital skills.",
      category: SchemeCategory.EDUCATION,
      budget: 1000000,
      startDate: new Date("2025-02-01"),
      endDate: new Date("2025-08-31"),
      requirements: [
        { title: "Basic Personal Information", type: RequirementType.TEXT },
      ],
    },
  ];

  for (const scheme of schemesData) {
    await prisma.scheme.create({
      data: {
        title: scheme.title,
        description: scheme.description,
        objectives: scheme.objectives,
        category: scheme.category,
        budget: scheme.budget,
        status: SchemeStatus.PUBLISHED,
        isActive: true,
        minAge: scheme.minAge ?? null,
        maxAge: scheme.maxAge ?? null,
        startDate: scheme.startDate,
        endDate: scheme.endDate,
        createdById: OFFICER_ID,

        schemeRequirements: {
          create: scheme.requirements.map((req) => ({
            title: req.title,
            type: req.type,
            isMandatory: true,
            requiresVerification: true,
          })),
        },
      },
    });
  }

  console.log("✅ 10 Schemes seeded successfully!");
}

seedScheme()
  .catch((error) => {
    console.error("❌ Error seeding schemes:", error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

