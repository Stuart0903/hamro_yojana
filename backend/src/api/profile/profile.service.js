// import { VerificationStatus } from '../../../generated/prisma/enums';
import { text } from 'node:stream/consumers';
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

export const getLoggedInUserDetailsService = async (uid) => {
    const user = await prisma.user.findUnique({
        where: {uid},
        include: {
            userRoles: {
                include: {
                    role: true,
                }
            },
            citizenProfile: {
                include: {
                    personalDetails: true,
                    address: true,
                    education: true,
                    occupation: true,
                    documents: true, 
                }
            }
        }
    });

    if (!user) {
        throw new Error('User not found');
    }

    return user;

}

export const updateUserDetailsService = async (uid, payload) => {

    const {phoneNumber, citizenProfile} = payload;

    return await prisma.$transaction(async (tx) => {
        if (phoneNumber) {
            await tx.user.update({
                where: {uid},
                data: {phoneNumber},
            });
        }

        //Get citizen profile id
        const profile = await tx.citizenProfile.findUnique({
            where: {userId: uid},
        });

        if (!profile) {
            throw new Error('Citizen profile not found');
        }

        if (citizenProfile) {
            const {
                personalDetails,
                address,
                education, 
                occupation,
                documents,
                ...profileData
            } = citizenProfile;

            if (Object.keys(profileData).length>0){
                await tx.citizenProfile.update({
                    where: {id: profile.id},
                    data: profileData,
                })
            }

            if (address){
                await tx.address.upsert({
                    where: {profileId: profile.id},
                    update: address,
                    create: {
                        ...address,
                        profileId: profile.id,
                    }
                });
            }

            if (personalDetails){
                await tx.personalDetails.upsert({
                    where: {profileId: profile.id},
                    update: personalDetails,
                    create: {
                        ...personalDetails,
                        profileId: profile.id,
                    }
                });
            }

            if (education){
                await tx.education.upsert({
                    where: {profileId: profile.id},
                    update: education,
                    create: {
                        ...education,
                        profileId: profile.id,
                    }
                });
            }

            if (occupation){
                await tx.occupation.upsert({
                    where: {profileId: profile.id},
                    update: occupation,
                    create: {
                        ...occupation,
                        profileId: profile.id,
                    }
                });
            }

            if (documents && Array.isArray(documents)){
                await tx.document.deleteMany({
                    where: {profileId: profile.id},
                });

                await tx.document.createMany({
                    data: documents.map(doc => ({
                        ...doc,
                        profileId: profile.id,
                    }))
                });
            }

            return await tx.user.findUnique({
                where: {uid},
                include: {
                    userRoles: {
                        include: {role: true}
                    },
                    citizenProfile: {
                        include: {
                            personalDetails: true,
                            address: true,
                            education: true,
                            occupation: true,
                            documents: true,
                        }
                    }
                }
            })



        }
    });
}

// export const updatePartialUserDetailsService = async (uid, payload) => {
//     const {phoneNumber, citizenProfile} = payload;

//         return await prisma.$transaction(async (tx) => {
//             if (phoneNumber) {
//                 await tx.user.update({
//                     where: {uid},
//                     data: {phoneNumber},
//                 });
//             }
//         });

//         //Get citizen profile 
//         const profile = await tx.citizenProfile.findUnique({
//             where: {userId: uid},
            
//         });

//         if (!profile) {
//             throw new Error('Citizen profile not found');
//         }

//         if (personalDetails && Object.keys(personalDetails).length > 0){
//             await tx.personalDetails.update({
//                 where: {profileId: profile.id},
//                 data: personalDetails,
//             })
//         }

//         if (address && Object.keys(address).length > 0){
//             await tx.address.update({
//                 where: {profileId: profile.id},
//                 data: address,
//             })
//         }
// }