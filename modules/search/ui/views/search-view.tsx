import CategoriesSection from "../sections/categories-section";
import ResultsSection from "../sections/results-section";

interface SearchViewProps {
  query: string | undefined;
  categoryId: string | undefined;
}

const SearchView = ({ query, categoryId }: SearchViewProps) => {
  return (
    <div className="max-w-[2400px] mx-auto mb-10 px-4 flex flex-col gap-y-6">
      <CategoriesSection categoryId={categoryId} />

      <ResultsSection query={query} categoryId={categoryId} />
    </div>
  );
};

export default SearchView;
