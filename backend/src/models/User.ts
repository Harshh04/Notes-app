import { InferSchemaType, model, Schema } from "mongoose";

const userSchema = new Schema({
	username: { type: String, required: true, unqiue: true },
	email: { type: String, required: true, unqiue: true, select: false },
	password: { type: String, required: true, select: false },
});
//select false means it will not be returned in the json file

type User = InferSchemaType<typeof userSchema>;

export default model<User>("User", userSchema);
