import { getAuthors, getAuthorById, getQuotesFromAuthorId, createAuthor, updateAuthor, deleteAuthor } from "../controllers/authorController" 
import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticate } from "../middlewares/authentication";
import { optionalAuthenticate } from "../middlewares/optionalAuthentication";
import { roleCheck } from "../middlewares/roleCheck";

const router = Router()

router.get("/", optionalAuthenticate, asyncHandler(getAuthors))
router.get("/:id", optionalAuthenticate, asyncHandler(getAuthorById))
router.get("/:id/quotes", optionalAuthenticate, asyncHandler(getQuotesFromAuthorId))
router.post("/", authenticate, asyncHandler(createAuthor))
router.patch("/:id", authenticate, roleCheck(["ADMIN"]), asyncHandler(updateAuthor))
router.delete("/:id", authenticate, roleCheck(["ADMIN"]), asyncHandler(deleteAuthor))

export default router