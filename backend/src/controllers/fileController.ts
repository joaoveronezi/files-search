import { Controller, Get, Middleware, Post } from "@overnightjs/core";
import { upload } from "@src/middleware/upload";
import { fileService } from "@src/services/fileService";
import { ApiError } from "@src/utils/apiError";
import type { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

@Controller("api/files")
export class FileController {
  @Post("upload")
  @Middleware(upload.single("file"))
  public async uploadfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        throw new ApiError(400, "No file uploaded");
      }

      if (req.file.mimetype !== "application/pdf") {
        throw new ApiError(400, "Only PDF files are allowed");
      }

      const fileId = uuidv4();
      const parsedData = await fileService.setFileStorage(
        req.file.path,
        req.file.originalname,
        fileId
      );

      res.status(200).json({
        success: true,
        fileId,
        message: "File uploaded and parsed successfully",
        fileName: req.file.originalname,
        pageCount: parsedData.totalPages,
      });
    } catch (error) {
      console.error("Error in file upload:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  }

  @Get(":id")
  public async getFileById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const fileStorageData = fileService.getFileStorageData(id);

      if (!fileStorageData) {
        throw new ApiError(404, "File not found");
      }

      res.status(200).json({
        success: true,
        file: {
          id,
          name: fileStorageData.originalName,
          uploadDate: fileStorageData.uploadDate,
          pageCount: fileStorageData.parsedData.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
