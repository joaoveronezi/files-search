import { useState } from "react";
import FileUpload from "../components/FileUpload";
import LoadingSpinner from "../components/LoadingSpinner";
import { SearchInterface, SearchResults } from "../components/Search";
import { searchDocument, uploadFile, type SearchFilters } from "../services";
import { ApiStatus, ApiStatusType } from "../types/apiStatus";
import type { SearchResult } from "../types/search";

const Home = () => {
  const [apiStatus, setApiStatus] = useState<ApiStatusType>(ApiStatus.IDLE);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [fileId, setFileId] = useState<string | undefined>(undefined);
  const [fileName, setFileName] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setApiStatus(ApiStatus.UPLOADING);
    setError(null);

    try {
      const response = await uploadFile(file);

      if (response.success) {
        setFileId(response.fileId);
        setFileName(response.fileName);
        setApiStatus(ApiStatus.UPLOADED);
      } else {
        setError(response.message || "Failed to upload file");
        setApiStatus(ApiStatus.IDLE);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Error handling file upload:", err);
      setApiStatus(ApiStatus.IDLE);
    }
  };

  const handleSearch = async (query: string, filters: SearchFilters) => {
    if (!fileId) return;

    setApiStatus(ApiStatus.SEARCHING);
    setError(null);

    try {
      const response = await searchDocument(query, filters, fileId);

      if (response.success) {
        setSearchResults(response.results);
        if (response.results.length === 0) {
          setError(
            "No results found. Try adjusting your search query or filters."
          );
        }
      } else {
        setError(response.message || "Search failed");
      }
    } catch (err) {
      setError("An unexpected error occurred during search. Please try again.");
      console.error("Error handling search:", err);
    } finally {
      setApiStatus(ApiStatus.UPLOADED);
    }
  };

  const resetApplication = () => {
    setFileId(undefined);
    setFileName(undefined);
    setSearchResults([]);
    setError(null);
    setApiStatus(ApiStatus.IDLE);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            File Search
          </h1>
          <p className="mt-3 text-xl text-gray-500 sm:mt-4">
            Upload PDFs and search for content inside them
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {apiStatus === ApiStatus.UPLOADING ? (
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner message="Processing your file..." />
          </div>
        ) : apiStatus === ApiStatus.UPLOADED ||
          apiStatus === ApiStatus.SEARCHING ? (
          <>
            <div className="mb-6">
              <div className="flex justify-between items-center">
                {fileName && (
                  <p className="text-sm text-gray-600">
                    Current file:{" "}
                    <span className="font-medium">{fileName}</span>
                  </p>
                )}
                <button
                  onClick={resetApplication}
                  className="text-sm text-indigo-600 hover:text-indigo-900"
                >
                  Upload a different file
                </button>
              </div>
            </div>

            {apiStatus === ApiStatus.SEARCHING ? (
              <div className="flex flex-col items-center justify-center py-12">
                <LoadingSpinner message="Searching..." />
              </div>
            ) : (
              <div className="space-y-8">
                <SearchInterface onSearch={handleSearch} />
                <SearchResults results={searchResults} fileName={fileName} />
              </div>
            )}
          </>
        ) : (
          <FileUpload onFileUpload={handleFileUpload} />
        )}
      </div>
    </div>
  );
};

export default Home;
