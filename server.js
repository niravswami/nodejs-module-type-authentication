import mongoose from "mongoose";
import app from "./index.js";

const DB = process.env.MONGODB_LOCAL;

mongoose
	.connect(DB, {
		dbName: process.env.MONGODB_DATABASE_NAME,
	})
	.then(() => console.log("DB connected"))
	.catch((err) => console.log("DB err", err));

const port = process.env.PORT || 5001;

console.log("process.env.PORT", process.env.PORT);

app.listen(port, () => {
	console.log(`listing on ${port}`);
});
