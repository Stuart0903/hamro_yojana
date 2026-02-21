// import { VerificationStatus } from '../../../generated/prisma/enums';
import {prisma} from '../../config/db.config.js';

export const completeUserProfile = async (userId, profileData) => {
    const {
        personalDetails,
        address,
        education, 
        occupation,
        document
    } = profileData;

    console.log(userId)

    const user = await prisma.user.findUnique({
        where: { uid: userId },
    });

    if (!user || !user.isPhoneVerified) {
        throw new Error('User phone not verified');
    }

    const profile = await prisma.citizenProfile.upsert({
        where: { userId },
        update: {}, 
        create: {
            userId,
            profileStatus: "INCOMPLETE",
            verificationStatus: "PENDING",
        }
    })

    await prisma.$transaction([

        prisma.personalDetails.upsert({
            where: { profileId: profile.id },
            update: personalDetails,
            create: {
                ...personalDetails,
                profileId: profile.id,
            }
        }),

        prisma.address.upsert({
            where: { profileId: profile.id },
            update: address,
            create: {
                ...address,
                profileId: profile.id,
            }
        }),

        prisma.education.upsert({
            where: { profileId: profile.id },
            update: education,
            create: {
                ...education,
                profileId: profile.id,
            }
        }),

        prisma.occupation.upsert({
            where: { profileId: profile.id },
            update: occupation,
            create: {
                ...occupation,
                profileId: profile.id,
            }
        }),

        prisma.document.upsert({
            where: { 
                documentType_documentNumber: {
                    documentType: document.documentType,
                    documentNumber: document.documentNumber
                }
            },
            update: {
                ...document,
                profileId: profile.id,
            },
            create: {
                ...document,
                profileId: profile.id,
            }
        }),

        prisma.citizenProfile.update({
            where: { id: profile.id },
            data: {
                profileStatus: "COMPLETE",
                verificationStatus: "PENDING",
            }
        })
    ]);

    return { message: 'Profile completed successfully' };
}