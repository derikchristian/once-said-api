import express from "express";
import cors from "cors";
import path from "path";
import quotesRoutes from "./routes/quotes"
import authorRoutes from "./routes/author"
import categoriesRoutes from "./routes/categories"
import userRoutes from "./routes/user"
import authenticationRoutes from "./routes/authentication"
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/quotes", quotesRoutes)
app.use("/authors", authorRoutes)
app.use("/categories", categoriesRoutes)
app.use("/users", userRoutes)
app.use("/authentication", authenticationRoutes)

app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (_req, res) => {res.sendFile(path.join(__dirname, "../public/index.html"));});

app.use(errorHandler)

// ts seem to not be able to imply if i dont use a block here
app.get("/", (_req, res) => {res.status(200).send("API em funcionamento")})

export default app