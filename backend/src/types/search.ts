export interface SearchResult {
  page: number;
  context: string;
  highlight?: string;
  position?: {
    x: number;
    y: number;
  };
}

export interface SearchFilters {
  caseSensitive?: boolean;
  wholeWord?: boolean;
  regex?: boolean;
}
