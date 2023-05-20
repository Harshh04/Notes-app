import * as NotesController from "../controllers/notes";
import express from "express";

// app=express() creates a whole new server thus a router is created
const router = express.Router();

//first part is the endpoint second part is the controller which would be called on that endpoint
router.get("/", NotesController.getNotes);

router.post("/", NotesController.createNote);

router.patch("/:noteId", NotesController.updateNote);

router.delete("/:noteId", NotesController.deleteNote);

// :noteId is a variable
router.get("/:noteId", NotesController.getNote);

export default router;
