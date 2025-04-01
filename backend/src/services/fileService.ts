import * as fs from "fs";
import PDFParser from "pdf2json";

/**
 * Parse a PDF file and extract text content
 * @param filePath Path to the PDF file
 * @returns Parsed PDF data
 */
export const parseFile = (filePath: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", (errData: any) => {
      console.error("PDF parsing error:", errData);
      reject(new Error(errData.parserError));
    });

    pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
      try {
        console.log(
          `PDF parsed successfully. Total pages: ${pdfData.Pages.length}`
        );

        // Process the PDF data
        const processedData = processPdfData(pdfData);

        // Clean up the temporary file
        fs.unlink(filePath, (err) => {
          if (err) console.error("Error deleting temporary file:", err);
        });

        resolve(processedData);
      } catch (error) {
        console.error("Error processing PDF data:", error);
        reject(error);
      }
    });

    console.log(`Loading PDF from path: ${filePath}`);
    pdfParser.loadPDF(filePath);
  });
};

/**
 * Process the raw PDF data into a more usable format
 * @param pdfData Raw PDF data from pdf2json
 * @returns Processed PDF data
 */
const processPdfData = (pdfData: any) => {
  const result = {
    totalPages: pdfData.Pages.length,
    pages: [] as any[],
  };

  // Process each page
  pdfData.Pages.forEach((page: any, pageIndex: number) => {
    const pageContent: any = {
      pageNumber: pageIndex + 1,
      content: "",
      texts: [] as any[],
    };

    // Process text elements on the page
    if (page.Texts && page.Texts.length > 0) {
      page.Texts.forEach((textItem: any) => {
        if (textItem.R && textItem.R.length > 0) {
          const text = decodeURIComponent(textItem.R[0].T);

          pageContent.texts.push({
            text,
            x: textItem.x,
            y: textItem.y,
            width: textItem.w,
            height: textItem.h,
          });

          pageContent.content += text + " ";
        }
      });

      // Trim extra spaces
      pageContent.content = pageContent.content.trim();
    }

    result.pages.push(pageContent);
  });

  return result;
};
