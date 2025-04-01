export interface UploadResponse {
  success: boolean;
  fileId?: string;
  message?: string;
  fileName?: string;
  pageCount?: number;
}

const API_PUBLIC_URL = import.meta.env.API_PUBLIC_URL;

/**
 * Uploads a PDF file to the backend for processing
 * @param file The PDF file to upload
 * @returns Promise with the upload response
 */
export const uploadFile = async (file: File): Promise<UploadResponse> => {
  try {
    // Validate file type
    if (!file.type.includes("pdf")) {
      throw new Error("Only PDF files are supported");
    }

    // Create form data
    const formData = new FormData();
    formData.append("file", file);

    // Send request to backend
    const response = await fetch(`${API_PUBLIC_URL}/api/files/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "File upload failed");
    }

    const data = await response.json();
    return {
      success: true,
      fileId: data.fileId,
      message: data.message,
      fileName: data.fileName,
      pageCount: data.pageCount,
    };
  } catch (error) {
    console.error("Error in uploadFile service:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};
