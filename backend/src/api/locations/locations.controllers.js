import * as locationService from "./locations.services.js";

//Provinces
export const getProvincesController = async (req, res) => {
    try {
        const data = await locationService.getProvinces();
        res.status(200).json(data);
    }catch (error) {
        console.error("Error fetching provinces:", error);
        res.status(500).json({ error: "Failed to fetch provinces" });
    }
}


// Districts
export const fetchDistricts = async (req, res) => {
  try {
    const { provinceId } = req.params;

    if (!provinceId)
      return res.status(400).json({ message: "provinceId required" });

    const data = await locationService.getDistrictsByProvinceId(provinceId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch districts" });
    console.error("Error fetching districts:", err);
  }
};

// Municipalities
export const fetchMunicipalities = async (req, res) => {
  try {
    const { districtId } = req.params;

    if (!districtId)
      return res.status(400).json({ message: "districtId required" });

    const data =
      await locationService.getMunicipalitiesByDistrict(districtId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch municipalities" });
  }
};

// Wards
export const fetchWards = async (req, res) => {
  try {
    const { municipalityId } = req.params;

    if (!municipalityId)
      return res.status(400).json({ message: "municipalityId required" });

    const data =
      await locationService.getWardsByMunicipality(municipalityId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch wards" });
  }
};