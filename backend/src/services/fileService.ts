import { SearchFilters, SearchResult } from "@src/types/search";
import { ApiError } from "@src/utils/apiError";
import * as fs from "fs";
import PDFParser, { Output, Page, Text as PDFText } from "pdf2json";

interface ProcessedData {
  totalPages: number;
  pages: PageContent[];
}

interface Text {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PageContent {
  pageNumber: number;
  content: string;
  texts: Text[];
}

interface FileStorageData {
  originalName: string;
  parsedData: ProcessedData;
  uploadDate: Date;
}

export type FileStorage = Record<string, FileStorageData>;

export class FileService {
  constructor(protected fileStorage: FileStorage = {}) {}

  async setFileStorage(
    filePath: string,
    originalName: string,
    fileId: string
  ): Promise<ProcessedData> {
    const parsedData = await this.parseFile(filePath);

    this.fileStorage[fileId] = {
      originalName,
      parsedData,
      uploadDate: new Date(),
    };

    return parsedData;
  }

  // This function parses the file using local temp file. - It's a bit slower than memory, but it's better to large files.
  private async parseFile(filePath: string): Promise<ProcessedData> {
    const buffer = await fs.promises.readFile(filePath);

    try {
      const parsed = await this.parseBuffer(buffer);
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting temp file:", err);
      });
      return parsed;
    } catch (err) {
      console.error("Failed to parse file from path:", err);
      throw err;
    }
  }

  // This function parses the file using the memory buffer - It's faster than temp file, but it may not work for large files.
  async parseBuffer(buffer: Buffer): Promise<ProcessedData> {
    const pdfParser = new PDFParser();

    return new Promise((resolve, reject) => {
      pdfParser.on("pdfParser_dataReady", (pdfData: Output) => {
        try {
          const processed = this.processFileData(pdfData);
          resolve(processed);
        } catch (err) {
          console.error("Failed to process PDF data:", err);
          reject(err);
        }
      });

      pdfParser.on(
        "pdfParser_dataError",
        (errData: Record<"parserError", Error>) => {
          console.error("PDF parsing error:", errData.parserError);
          reject(new Error(errData.parserError.message));
        }
      );

      pdfParser.parseBuffer(buffer);
    });
  }

  private processFileData(pdfData: Output): ProcessedData {
    const result: ProcessedData = {
      totalPages: pdfData.Pages.length,
      pages: [],
    };

    pdfData.Pages.forEach((page: Page, index: number) => {
      const pageContent: PageContent = {
        pageNumber: index + 1,
        content: "",
        texts: [],
      };

      page.Texts?.forEach((textItem: PDFText) => {
        const raw = textItem.R?.[0];
        if (raw) {
          const text = decodeURIComponent(raw.T);

          pageContent.texts.push({
            text,
            x: textItem.x,
            y: textItem.y,
            width: textItem.w,
            height: textItem.sw,
          });

          pageContent.content += text + " ";
        }
      });

      pageContent.content = pageContent.content.trim();
      result.pages.push(pageContent);
    });

    return result;
  }

  public async searchInFileContent(
    fileId: string,
    query: string,
    filters: SearchFilters = {}
  ): Promise<{ results: SearchResult[]; originalName: string }> {
    const localFile = this.fileStorage[fileId];
    if (!localFile) {
      throw new ApiError(404, "File not found");
    }

    const results: SearchResult[] = [];
    const pdfData = localFile.parsedData;

    // Default filters
    const { caseSensitive = false, wholeWord = false, regex = false } = filters;

    // Create search pattern based on filters
    let searchPattern: RegExp;

    if (regex) {
      try {
        searchPattern = new RegExp(query, caseSensitive ? "g" : "gi");
      } catch (error) {
        // If regex is invalid, fall back to normal search
        searchPattern = this.createSearchPattern(
          query,
          caseSensitive,
          wholeWord
        );
      }
    } else {
      searchPattern = this.createSearchPattern(query, caseSensitive, wholeWord);
    }

    // Search in each page
    pdfData.pages.forEach((page: any) => {
      const pageContent = page.content;
      const pageNumber = page.pageNumber;

      // Find all matches
      let match;
      const matches = [];

      // Create a new RegExp for each exec to avoid infinite loops with global flag
      const pattern = new RegExp(searchPattern.source, searchPattern.flags);

      while ((match = pattern.exec(pageContent)) !== null) {
        // Get context around the match
        const contextStart = Math.max(0, match.index - 50);
        const contextEnd = Math.min(
          pageContent.length,
          match.index + match[0].length + 50
        );
        const context = pageContent.substring(contextStart, contextEnd);

        // Find the text element that contains this match
        const matchPosition = this.findPositionForMatch(
          page.texts,
          match.index
        );

        results.push({
          page: pageNumber,
          context,
          highlight: match[0],
          position: matchPosition,
        });

        // Move the lastIndex to avoid infinite loop with zero-width matches
        if (match.index === pattern.lastIndex) {
          pattern.lastIndex++;
        }
      }
    });

    return {
      results,
      originalName: localFile.originalName,
    };
  }

  private createSearchPattern(
    query: string,
    caseSensitive: boolean,
    wholeWord: boolean
  ): RegExp {
    let pattern = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // Escape regex special chars

    if (wholeWord) {
      pattern = `\\b${pattern}\\b`;
    }

    return new RegExp(pattern, caseSensitive ? "g" : "gi");
  }

  private findPositionForMatch(
    texts: any[],
    matchIndex: number
  ): { x: number; y: number } | undefined {
    let currentIndex = 0;

    for (const text of texts) {
      const textLength = text.text.length;

      if (
        matchIndex >= currentIndex &&
        matchIndex < currentIndex + textLength
      ) {
        return {
          x: text.x,
          y: text.y,
        };
      }

      currentIndex += textLength + 1;
    }

    return undefined;
  }

  public getFileStorage(): FileStorage {
    return this.fileStorage;
  }

  public getFileStorageData(fileId: string): FileStorageData | undefined {
    return this.fileStorage[fileId];
  }
}

export const fileService = new FileService();
