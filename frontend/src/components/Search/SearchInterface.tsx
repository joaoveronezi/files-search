import { useState } from "react";
import type { SearchFilters as SearchFiltersType } from "../../services";
import SearchBar from "./SearchBar";
import SearchFilters from "./SearchFilters";

interface SearchInterfaceProps {
  onSearch: (query: string, filters: SearchFiltersType) => void;
}

const SearchInterface = ({ onSearch }: SearchInterfaceProps) => {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFiltersType>({
    caseSensitive: false,
    wholeWord: false,
    regex: false,
  });

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query, filters);
    }
  };

  const handleFilterChange = (
    filterName: keyof SearchFiltersType,
    value: boolean
  ) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Search Document
      </h2>
      <div className="space-y-4">
        <SearchBar query={query} setQuery={setQuery} onSearch={handleSearch} />
        <SearchFilters filters={filters} onFilterChange={handleFilterChange} />
      </div>
    </div>
  );
};

export default SearchInterface;
