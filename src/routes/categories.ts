import { getCategories, getCategoryById, getQuotesFromCategoryId, createCategory, updateCategory, deleteCategory } from "../controllers/categoriesController" 
import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticate } from "../middlewares/authentication";
import { optionalAuthenticate } from "../middlewares/optionalAuthentication";
import { roleCheck } from "../middlewares/roleCheck";

const router = Router()

router.get("/", optionalAuthenticate, asyncHandler(getCategories))
router.get("/:id", optionalAuthenticate, asyncHandler(getCategoryById))
router.get("/:id/quotes", optionalAuthenticate, asyncHandler(getQuotesFromCategoryId))
router.post("/", authenticate, asyncHandler(createCategory))
router.patch("/:id", authenticate, roleCheck(["ADMIN"]), asyncHandler(updateCategory))
router.delete("/:id", authenticate, roleCheck(["ADMIN"]), asyncHandler(deleteCategory))

export default router