import { getUsers, getUserById, getUserQuotesByUserId, updateUser, deleteUser } from "../controllers/userController" 
import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticate } from "../middlewares/authentication";
import { optionalAuthenticate } from "../middlewares/optionalAuthentication";

const router = Router()

router.get("/", optionalAuthenticate, asyncHandler(getUsers))
router.get("/:id", optionalAuthenticate, asyncHandler(getUserById))
router.get("/:id/quotes", optionalAuthenticate, asyncHandler(getUserQuotesByUserId))
router.patch("/:id", authenticate, asyncHandler(updateUser))
router.delete("/:id", authenticate, asyncHandler(deleteUser))

export default router