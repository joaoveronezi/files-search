import type { NextFunction, Request, Response } from "express";
import { searchInPdfContent } from "../services/searchService";
import { ApiError } from "../utils/apiError";
import { fileStorage } from "./fileController";

/**
 * Search in a file
 */
export const searchInFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { query, filters, fileId } = req.body;

    // Validate request
    if (!query) {
      throw new ApiError(400, "Search query is required");
    }

    if (!fileId) {
      throw new ApiError(400, "File ID is required");
    }

    console.log(
      `Searching for "${query}" in file ${fileId} with filters:`,
      filters
    );

    // Check if file exists
    if (!fileStorage[fileId]) {
      throw new ApiError(404, "File not found");
    }

    // Perform search
    const searchResults = await searchInPdfContent(
      fileStorage[fileId].parsedData,
      query,
      filters
    );

    console.log(`Search completed. Found ${searchResults.length} results.`);

    // Return search results
    res.status(200).json({
      success: true,
      results: searchResults,
      totalResults: searchResults.length,
      fileName: fileStorage[fileId].originalName,
    });
  } catch (error) {
    console.error("Error in search:", error);
    next(error);
  }
};
