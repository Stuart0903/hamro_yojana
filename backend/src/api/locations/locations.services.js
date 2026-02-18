import {prisma} from "../../config/db.config.js";

// Get all provinces
export const getProvinces = async()=> {
    return await prisma.province.findMany({
        orderBy: {
            name: 'asc'
        }
    })
}

// Get districts by province ID
export const getDistrictsByProvinceId = async(provinceId) => {
    return await prisma.district.findMany({
        where: {provinceId},
        orderBy: {
            name: 'asc'
        }
    })
}

// Get municipalities by district
export const getMunicipalitiesByDistrict = async (districtId) => {
  return prisma.municipality.findMany({
    where: { districtId },
    orderBy: { name: "asc" }
  });
};

// Get wards by municipality
export const getWardsByMunicipality = async (municipalityId) => {
  return prisma.ward.findMany({
    where: { municipalityId },
    orderBy: { wardNumber: "asc" }
  });
};