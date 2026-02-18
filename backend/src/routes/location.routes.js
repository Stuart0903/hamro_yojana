import {Router} from "express";
import {
    getProvincesController,
    fetchDistricts,
    fetchMunicipalities,
    fetchWards
    
} from "../api/locations/locations.controllers.js";

const router = Router();

router.get('/provinces', getProvincesController);
router.get('/districts/:provinceId', fetchDistricts);
router.get('/municipalities/:districtId', fetchMunicipalities);
router.get('/wards/:municipalityId', fetchWards);

export default router;

