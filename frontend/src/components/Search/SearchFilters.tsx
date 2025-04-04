import type { SearchFilters as SearchFiltersType } from "../../services";

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFilterChange: (filterName: keyof SearchFiltersType, value: boolean) => void;
}

const SearchFilters = ({ filters, onFilterChange }: SearchFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex items-center">
        <input
          id="case-sensitive"
          name="case-sensitive"
          type="checkbox"
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          checked={filters.caseSensitive}
          onChange={(e) => onFilterChange("caseSensitive", e.target.checked)}
        />
        <label
          htmlFor="case-sensitive"
          className="ml-2 block text-sm text-gray-700"
        >
          Case sensitive
        </label>
      </div>

      <div className="flex items-center">
        <input
          id="whole-word"
          name="whole-word"
          type="checkbox"
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          checked={filters.wholeWord}
          onChange={(e) => onFilterChange("wholeWord", e.target.checked)}
        />
        <label
          htmlFor="whole-word"
          className="ml-2 block text-sm text-gray-700"
        >
          Match whole word
        </label>
      </div>

      <div className="flex items-center">
        <input
          id="regex"
          name="regex"
          type="checkbox"
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          checked={filters.regex}
          onChange={(e) => onFilterChange("regex", e.target.checked)}
        />
        <label htmlFor="regex" className="ml-2 block text-sm text-gray-700">
          Use regex
        </label>
      </div>
    </div>
  );
};

export default SearchFilters;
