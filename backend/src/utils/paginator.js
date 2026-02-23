import { skip } from "node:test";
import {prisma} from "../config/db.config.js";

const DEFAULT_PAGE_SIZE = 10;

export const paginateItems = async (model, args= {}, params = {}) => {
    const page = parseInt(params.page) || 1;

    const pageSize = parseInt(params.pageSize) || DEFAULT_PAGE_SIZE;

    //Total count
    const total = await prisma[model].count({
        where: args.where || {},
    });

    //Fetch data
    const data = await prisma[model].findMany({
        ...args,
        take: pageSize,
        skip: (page - 1) * pageSize,
    });

    const lastPage = Math.ceil(total / pageSize);

    return {
        data, 
        info: {
            total,
            lastPage,
            prev: page>1 ? page -1 : null,
            next: page < lastPage ? page + 1 : null,
        }
    }








}