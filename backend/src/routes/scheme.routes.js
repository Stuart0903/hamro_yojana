import {Router} from "express";
import { getAllSchemesController } from "../api/scheme/scheme.controller.js";

const router = Router();

router.get('/', getAllSchemesController);

export default router;