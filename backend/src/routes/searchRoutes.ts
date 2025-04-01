import express from "express";
import { searchInFile } from "../controllers/searchController";

const router = express.Router();

// Search in a file
router.post("/", searchInFile);

export default router;
