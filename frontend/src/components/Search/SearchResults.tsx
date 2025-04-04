import type { SearchResult } from "../../types/search";

interface SearchResultsProps {
  results: SearchResult[];
  fileName?: string;
}

const SearchResults = ({ results, fileName }: SearchResultsProps) => {
  if (results.length === 0) {
    return null;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-1">
        Search Results ({results.length})
      </h2>

      {fileName && (
        <p className="text-sm text-gray-500 mb-4">File: {fileName}</p>
      )}

      <div className="space-y-4">
        {results.map((result, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-md p-4 hover:bg-gray-50"
          >
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">
                Page {result.page}
              </span>
              <span className="text-sm text-gray-500">
                Match {index + 1} of {results.length}
              </span>
            </div>

            <div className="mt-2">
              <p className="text-sm text-black">...{result.context}...</p>
            </div>

            {result.highlight && (
              <div className="mt-2 bg-yellow-100 p-2 rounded">
                <p className="text-sm font-medium text-black">
                  {result.highlight}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
