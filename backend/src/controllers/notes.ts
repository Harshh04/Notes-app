import { RequestHandler } from "express";
import NoteModel from "../models/note";
import createHttpError from "http-errors";

export const getNotes: RequestHandler = async (req, res, next) => {
	try {
		// throw Error("Bazinga!");
		const notes = await NoteModel.find().exec();
		//sends a status message 200 , with notes as data in json format
		res.status(200).json(notes);
	} catch (error) {
		next(error);
	}
};

export const getNote: RequestHandler = async (req, res, next) => {
	const noteId = req.params.noteId;
	try {
		const note = await NoteModel.findById(noteId).exec();

		res.status(200).json(note);
	} catch (error) {
		next(error);
	}
};

//interfaces are more flexible than types
interface CreateNodeBody {
	//? specifies optional , title has optional because when we send request we dont know if they will send the data
	title?: string;
	text?: string;
}

//<> specifies the types
export const createNote: RequestHandler<
	unknown,
	unknown,
	CreateNodeBody,
	unknown
> = async (req, res, next) => {
	const title = req.body.title;
	const text = req.body.text;

	try {
		//if title is not defined
		if (!title) {
			throw createHttpError(400, "Note must have a title");
		}

		const newNote = await NoteModel.create({
			title: title,
			text: text,
		});

		//code 201 : new resource created
		res.status(201).json(newNote);
	} catch (err) {
		next(err);
	}
};

interface UpdateNoteParams {
	noteId: string;
}

interface UpdateNoteBody {
	text?: string;
	title?: string;
}

//second one is the response body
//4th one is URL query params
export const updateNote: RequestHandler<
	UpdateNoteParams,
	unknown,
	UpdateNoteBody,
	unknown
> = async (req, res, next) => {
	const noteId = req.params.noteId;
	const newTitle = req.body.title;
	const newText = req.body.text;
	try {
		if (!newTitle) {
			throw createHttpError(400, "Note must have a title");
		}

		const note = await NoteModel.findById(noteId).exec();

		if (!note) {
			throw createHttpError(404, "Note not found");
		}

		note.title = newTitle;
		note.text = newText;

		const updatedNote = await note.save();

		res.status(200).json(updatedNote);
	} catch (error) {
		next(error);
	}
};

export const deleteNote: RequestHandler = async (req, res, next) => {
	const noteId = req.params.noteId;

	try {
		const note = await NoteModel.findById(noteId).exec();
		if (!note) {
			throw createHttpError(404, "Note not found");
		}

		await note.deleteOne();

		//send status is used because we dont send a json body
		res.sendStatus(204);
	} catch (error) {
		next(error);
	}
};
