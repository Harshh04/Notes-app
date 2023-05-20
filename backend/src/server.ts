//used such that env vars are not undefined
import app from "./app";
import env from "./util/validateEnv";
import mongoose from "mongoose";

const port = env.PORT;

mongoose
	.connect(env.MONGO_CONNECTION_STRING)
	.then(() => {
		console.log("MongoDB Connected");
		app.listen(port, () => {
			console.log("Server running on Port : " + port);
		});
	})
	.catch(console.error);

//Not restful APi because states is used
