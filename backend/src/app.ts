import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import notesRoutes from "./routes/notes";
import morgan from "morgan";
import createHttpError, { isHttpError } from "http-errors";
import userRoutes from "./routes/users";
import session from "express-session";
import env from "./util/validateEnv";
import MongoStore = require("connect-mongo");

dotenv.config();

const app = express();

//defines type and amount of info we print at the terminalls
app.use(morgan("dev"));
//sets express so that it can include json bodies
app.use(express.json());

app.use(
	session({
		secret: env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: {
			maxAge: 60 * 60 * 1000,
		},
		rolling: true,
		store: MongoStore.create({ mongoUrl: env.MONGO_CONNECTION_STRING }),
	})
);

app.use("/api/users", userRoutes);

//middleware that catches request that goes to this end point
app.use("/api/notes", notesRoutes);

//if we access an end point we did not set up
app.use((req, res, next) => {
	//forwarding to error handler
	next(createHttpError(404, "Endpoint not Found"));
});

//arrow function () is an anonymous function
//error : unknown => we are defining types , we dont do it above because TS infers it automatically , but here we can pass anyting

//ignore lint warning for next because if we do not use next the ejs will not recognize this as an error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars

//ERROR HANDLER : SHOULD BE AT THE END
//eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
	console.error(error);
	let errorMessage = "An unknown error occoured";
	let statusCode = 500;

	//checking if error really occours
	if (error instanceof Error) {
		errorMessage = error.message;
		// 500 : internal server error ; curly braces used because json is manually used and earlier notes is already in that form

		//checks if error is an instance of the http error package
		if (isHttpError(error)) {
			statusCode = error.status;
			errorMessage = error.message;
		}

		if (error.name === "CastError") {
			statusCode = 404;
			errorMessage = "Note Not found";
		}
	}
	res.status(statusCode).json({ error: errorMessage });
});

export default app;
