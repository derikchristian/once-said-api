import { getQuotes, getQuoteById, getRandomQuote, createQuote, updateQuote, deleteQuote } from "../controllers/quotesController" 
import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticate } from "../middlewares/authentication";
import { optionalAuthenticate } from "../middlewares/optionalAuthentication";

const router = Router()

router.get("/", optionalAuthenticate, asyncHandler(getQuotes))
router.get("/random", optionalAuthenticate, asyncHandler(getRandomQuote))
router.get("/:id", optionalAuthenticate, asyncHandler(getQuoteById))
router.post("/", authenticate, asyncHandler(createQuote))
router.patch("/:id", authenticate, asyncHandler(updateQuote))
router.delete("/:id", authenticate, asyncHandler(deleteQuote))

export default router