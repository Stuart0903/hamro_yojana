import { SchemeCategory, SchemeStatus } from "../../../generated/prisma/enums.ts"
import {prisma} from "../../config/db.config.js";
import { paginateItems } from "../../utils/paginator.js";


export const getAllSchemesService = async (queryParams)=> {

    const now = new Date();

    const whereCondition = {
        isActive: true,
        status: SchemeStatus.PUBLISHED,
        startDate: {lte: now},
        endDate: {gte: now},
    };

    if (queryParams.category) {
        whereCondition.category = queryParams.category;
    }

    if (queryParams.provinceId) {
        whereCondition.provinceId = queryParams.provinceId;
    }

    if (queryParams.districtId) {
        whereCondition.districtId = queryParams.districtId;
    }

    const result = await paginateItems(
        "scheme",
        {
            where: whereCondition,
            include: {
                schemeRequirements: true,
            },
            orderBy: {createdAt: "desc"},
        },
        queryParams
    );


    return result;
}