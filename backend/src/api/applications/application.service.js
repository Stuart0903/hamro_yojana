

export const applyToSchemeService = async (user, schemeId, payload) => {

    if (user.role !== "CITIZEN") {
        throw new Error("Only applicants can apply to schemes");
    }

    return await prisma.$transaction(async (tx) => {
        
        const scheme = await tx.scheme.findUnique({
            where: { id: schemeId },
            include: { schemeRequirements: true },
        })

        if (!scheme) {
            throw new Error("Scheme not found");
        }

        const now = new Date();

        if (scheme.status !== "PUBLISHED" || !scheme.isActive || scheme.startDate > now || scheme.endDate < now) {
            throw new Error("Scheme is not open for applications");
        }

        // Prevent duplicate applications
        const existingApplication = await tx.application.findFirst({
            where: {
                userId: user.id,
                schemeId: schemeId,
            },
        });

        if (existingApplication) {
            throw new Error("You have already applied to this scheme");
        }

        // Validate mandatory requirement
        const mandatoryRequirement = scheme.schemeRequirements.filter(r => r.isMandatory);

        const providedRequirementsIds = payload.answers.map(a => a.requirementId);

        for (const req of mandatoryRequirement) {
            if(!providedRequirementsIds.includes(req.id)) {
                throw new Error(`Missing mandatory requirement: ${req.name}`);
            }
        }

        const application = await tx.application.create({
            data: {
                schemeId: schemeId,
                applicantId: user.uid,
                status: "SUBMITTED",
                submittedAt: new Date(),
                provinceId: user.citizenProfile.address.provinceId,
                districtId: user.citizenProfile.address.districtId,
                answers: {
                    create: payload.answers.map(answer => ({
                        requirementId: answer.requirementId,
                        textValue: answer.textValue,
                        numberValue: answer.numberValue,
                        dateValue: answer.dateValue,
                        booleanValue: answer.booleanValue,
                        documentUrl: answer.documentUrl,

                    }))
                }
            },
            include: {
                answers: true,
            }
        })

        

    });
}