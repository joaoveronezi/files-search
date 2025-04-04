import type { SearchResult } from "../types/search";

export interface SearchFilters {
  caseSensitive: boolean;
  wholeWord: boolean;
  regex: boolean;
}

export interface SearchResponse {
  success: boolean;
  results: SearchResult[];
  message?: string;
  totalResults?: number;
  fileName?: string;
}

const API_PUBLIC_URL =
  import.meta.env.API_PUBLIC_URL || "http://localhost:3000";

/**
 * Searches for content in the uploaded document
 * @param query The search query
 * @param filters Search filters (case sensitive, whole word, regex)
 * @param fileId Optional file ID if multiple files are supported
 * @returns Promise with search results
 */
export const searchDocument = async (
  query: string,
  filters: SearchFilters,
  fileId?: string
): Promise<SearchResponse> => {
  try {
    if (!query.trim()) {
      throw new Error("Search query cannot be empty");
    }

    // Prepare request body
    const requestBody = {
      query,
      filters,
      fileId,
    };

    // Send request to backend
    const response = await fetch(`${API_PUBLIC_URL}/api/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Search operation failed");
    }

    const data = await response.json();
    return {
      success: true,
      results: data.results || [],
      totalResults: data.totalResults || data.results?.length || 0,
      message: data.message,
      fileName: data.fileName,
    };
  } catch (error) {
    console.error("Error in searchDocument service:", error);
    return {
      success: false,
      results: [],
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};
