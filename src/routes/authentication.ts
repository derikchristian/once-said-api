import { register, login } from "../controllers/authenticationController";
import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router()

router.post("/register", asyncHandler(register))
router.post("/login", asyncHandler(login))

export default router