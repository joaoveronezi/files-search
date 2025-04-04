import { Controller, Post } from "@overnightjs/core";
import { fileService } from "@src/services/fileService";
import { ApiError } from "@src/utils/apiError";
import type { NextFunction, Request, Response } from "express";

@Controller("api/search")
export class SearchController {
  @Post("")
  public async searchInFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { query, filters, fileId } = req.body;

      // Validate request
      if (!query) {
        throw new ApiError(400, "Search query is required");
      }

      if (!fileId) {
        throw new ApiError(400, "File ID is required");
      }

      const { results, originalName } = await fileService.searchInFileContent(
        fileId,
        query,
        filters
      );

      res.status(200).json({
        success: true,
        results: results,
        totalResults: results.length,
        fileName: originalName,
      });
    } catch (error) {
      console.error("Error in search:", error);
      next(error);
    }
  }
}
