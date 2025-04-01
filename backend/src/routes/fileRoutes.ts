import express from "express";
import { getFileById, uploadFile } from "../controllers/fileController";
import { upload } from "../middleware/fileUpload";
const router = express.Router();

// Upload a PDF file
router.post("/upload", upload.single("file"), uploadFile);

// Get file by ID (for future use)
router.get("/:id", getFileById);

export default router;
