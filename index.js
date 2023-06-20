import express from "express";
import path from "path";
import User from "./models/userModel.js";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });
import userRouter from "./routes/userRoutes.js";
import authRouter from "./routes/authRoutes.js";
import { generateApiUrlV1 } from "./utils/urlGenerators.js";
import globalErrorHandler from "./utils/globalErrorHandler.js";

const app = express();
var corsOptions = {
	origin: "http://localhost:3000",
	credentials: true,
};

app.use(cors(corsOptions));
app.set("view engine", "ejs");
app.use(express.static(path.join(path.resolve(), "public")));

// middleware for form data
app.use(
	express.urlencoded({
		extended: true,
		limit: "10kb",
	})
);
app.use(express.json());
app.use(cookieParser());

app.use(generateApiUrlV1(""), authRouter);
app.use(generateApiUrlV1("users"), userRouter);

app.get("/about", (req, res) => {
	res.status(200).json({ nirav: "swami" });
	res.render("index", { name: "Nirav" });
});

app.post(generateApiUrlV1("inter"), (req, res) => {
	console.log(req.cookies, req.headers);
	res.status(200).json({
		...req.body,
		c: JSON.stringify(req.cookies),
		h: JSON.stringify(req.headers),
	});
});

app.post("/about", async (req, res) => {
	console.log("req", req.body);
	const user = await User.create({
		name: req?.body?.name,
		email: req?.body?.email,
	});

	res.status(200).json({
		status: "success",
		data: {
			user,
		},
	});
});

app.use(globalErrorHandler);

export default app;
