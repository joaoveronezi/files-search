import type { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { parseFile } from "../services/fileService";
import { ApiError } from "../utils/apiError";

// In-memory storage for POC purposes
const fileStorage: Record<string, any> = {};

/**
 * Upload and parse a PDF file
 */
export const uploadFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      throw new ApiError(400, "No file uploaded");
    }

    // Check if file is PDF
    if (req.file.mimetype !== "application/pdf") {
      throw new ApiError(400, "Only PDF files are allowed");
    }

    console.log(`Processing file: ${req.file.originalname}`);

    // Generate a unique ID for the file
    const fileId = uuidv4();

    // Parse the PDF file
    const parsedData = await parseFile(req.file.path);

    // Store the parsed data (in memory for now, will be replaced with database)
    fileStorage[fileId] = {
      originalName: req.file.originalname,
      parsedData,
      uploadDate: new Date(),
    };

    console.log(`File processed successfully. File ID: ${fileId}`);

    // Return success response
    res.status(200).json({
      success: true,
      fileId,
      message: "File uploaded and parsed successfully",
      fileName: req.file.originalname,
      pageCount: parsedData.totalPages,
    });
  } catch (error) {
    console.error("Error in file upload:", error);
    next(error);
  }
};

/**
 * Get file by ID
 */
export const getFileById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!fileStorage[id]) {
      throw new ApiError(404, "File not found");
    }

    res.status(200).json({
      success: true,
      file: {
        id,
        name: fileStorage[id].originalName,
        uploadDate: fileStorage[id].uploadDate,
        pageCount: fileStorage[id].parsedData.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Export fileStorage for use in other controllers
export { fileStorage };
