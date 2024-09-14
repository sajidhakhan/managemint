import { Router } from "express";
import { getProjects } from "../controllers/projectControllers";

const router = Router();

router.get("/", getProjects);

export default router;