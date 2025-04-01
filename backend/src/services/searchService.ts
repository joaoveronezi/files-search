import type { SearchFilters, SearchResult } from "../types/search";

// Performing the searching locally
// We'll change it to search using SQL Queries
export const searchInPdfContent = async (
  pdfData: any,
  query: string,
  filters: SearchFilters = {}
): Promise<SearchResult[]> => {
  const results: SearchResult[] = [];

  // Default filters
  const { caseSensitive = false, wholeWord = false, regex = false } = filters;

  // Create search pattern based on filters
  let searchPattern: RegExp;

  if (regex) {
    try {
      searchPattern = new RegExp(query, caseSensitive ? "g" : "gi");
    } catch (error) {
      // If regex is invalid, fall back to normal search
      searchPattern = createSearchPattern(query, caseSensitive, wholeWord);
    }
  } else {
    searchPattern = createSearchPattern(query, caseSensitive, wholeWord);
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
      const matchPosition = findPositionForMatch(page.texts, match.index);

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

  return results;
};

/**
 * Create a search pattern based on filters
 */
const createSearchPattern = (
  query: string,
  caseSensitive: boolean,
  wholeWord: boolean
): RegExp => {
  let pattern = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // Escape regex special chars

  if (wholeWord) {
    pattern = `\\b${pattern}\\b`;
  }

  return new RegExp(pattern, caseSensitive ? "g" : "gi");
};

/**
 * Find the position of a match in the text elements
 */
const findPositionForMatch = (
  texts: any[],
  matchIndex: number
): { x: number; y: number } | undefined => {
  let currentIndex = 0;

  for (const text of texts) {
    const textLength = text.text.length;

    if (matchIndex >= currentIndex && matchIndex < currentIndex + textLength) {
      // Found the text element containing the match
      return {
        x: text.x,
        y: text.y,
      };
    }

    currentIndex += textLength + 1; // +1 for the space we added between texts
  }

  return undefined;
};
