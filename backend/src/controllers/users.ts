import { RequestHandler } from "express";
import createHttpError from "http-errors";
import UserModel from "../models/User";
import bcrypt from "bcrypt";

interface SignUpBody {
	username?: string;
	email?: string;
	password?: string;
}

export const signUp: RequestHandler<
	unknown,
	unknown,
	SignUpBody,
	unknown
> = async (req, res, next) => {
	const username = req.body.username;
	const email = req.body.email;
	const passwordRaw = req.body.password;

	try {
		if (!username || !email || !passwordRaw) {
			throw createHttpError(400, "Parameters missing");
		}

		const existingUsername = await UserModel.findOne({
			username: username,
		}).exec();

		if (existingUsername) {
			throw createHttpError(
				409,
				"Username already Taken ! , choose a different one or Log in"
			);
		}

		const existingEmail = await UserModel.findOne({
			email: email,
		}).exec();

		if (existingEmail) {
			throw createHttpError(
				409,
				"A user with this email exists . Please Log in"
			);
		}

		const passwordHashed = await bcrypt.hash(passwordRaw, 5);

		const newUser = await UserModel.create({
			username: username,
			email: email,
			password: passwordHashed,
		});

		req.session.userId = newUser._id;

		res.status(201).json(newUser);
	} catch (error) {
		next(error);
	}
};

interface LoginBody {
	username?: string;
	password?: string;
}

export const login: RequestHandler<
	unknown,
	unknown,
	LoginBody,
	unknown
> = async (req, res, next) => {
	const username = req.body.username;
	const password = req.body.password;

	try {
		if (!username || !password) {
			throw createHttpError(400, "Parameters Missing");
		}

		const user = await UserModel.findOne({ username: username })
			.select("+password +email")
			.exec();

		if (!user) {
			throw createHttpError(401, "Invalid credentials");
		}

		const passwordMatch = await bcrypt.compare(password, user.password);

		if (!passwordMatch) {
			throw createHttpError(401, "Invalid credentials");
		}

		req.session.userId = user._id;
		res.status(201).json(user);
	} catch (error) {
		next(error);
	}
};
