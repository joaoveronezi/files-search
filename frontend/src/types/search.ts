export interface SearchResult {
  page: number;
  context: string;
  highlight?: string;
  position?: {
    x: number;
    y: number;
  };
}
