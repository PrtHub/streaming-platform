"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useSearchParams, usePathname } from "next/navigation";

import { trpc } from "@/trpc/client";
import FilterCarousel from "@/components/filter-carousel";

interface CategoriesSectionProps {
  categoryId?: string;
}

const CategoriesSection = ({ categoryId }: CategoriesSectionProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [categories] = trpc.categories.getMany.useSuspenseQuery();

  const createBaseUrl = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId) {
      params.delete("categoryId");
    }
    const queryString = params.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  };

  return (
    <Suspense fallback={<FilterCarousel isLoading data={[]} />}>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <FilterCarousel
          value={categoryId}
          data={categories.map((category) => ({
            value: category.id,
            label: category.name,
          }))}
          baseUrl={createBaseUrl()}
        />
      </ErrorBoundary>
    </Suspense>
  );
};

export default CategoriesSection;
