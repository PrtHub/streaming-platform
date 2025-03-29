"use client";

import Link from "next/link";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";

interface FilterCarouselProps {
  value?: string | null;
  data: {
    value: string;
    label: string;
  }[];
  isLoading?: boolean;
  baseUrl?: string;
}

const FilterCarousel = ({
  value,
  data,
  isLoading,
  baseUrl = "",
}: FilterCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };

    // Initialize
    onSelect();

    // Listen for changes
    api.on("select", onSelect);
    api.on("resize", onSelect);

    return () => {
      api.off("select", onSelect);
      api.off("resize", onSelect);
    };
  }, [api]);

  const isSelected = (itemValue: string | null) => {
    if (!itemValue) return !value;
    return value === itemValue;
  };

  const skeletonWidths = [
    "w-12",
    "w-16",
    "w-20",
    "w-24",
    "w-28",
    "w-32",
    "w-16",
    "w-20",
    "w-24",
    "w-28",
    "w-32",
    "w-16",
    "w-20",
    "w-24",
    "w-28",
    "w-32",
  ];

  return (
    <div className="w-full relative">
      {canScrollPrev && (
        <div className="absolute left-10 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      )}

      <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
        className="px-10"
        setApi={setApi}
      >
        <CarouselContent className="-ml-3">
          {!isLoading && (
            <CarouselItem className="pl-3 basis-auto">
              <Link href={baseUrl} scroll={false} replace>
                <Badge
                  className={`cursor-pointer font-medium transition ${
                    isSelected(null)
                      ? "bg-white text-black shadow-md"
                      : "bg-secondary text-secondary-foreground hover:opacity-85"
                  }`}
                >
                  All
                </Badge>
              </Link>
            </CarouselItem>
          )}
          {isLoading && (
            <>
              <CarouselItem className="pl-3 basis-auto">
                <Skeleton className="w-12 h-6 rounded-full animate-pulse" />
              </CarouselItem>
              {skeletonWidths.map((width, i) => (
                <CarouselItem key={i} className="pl-3 basis-auto">
                  <Skeleton
                    className={`${width} h-6 rounded-full animate-pulse`}
                  />
                </CarouselItem>
              ))}
            </>
          )}
          {!isLoading &&
            data.map((item) => (
              <CarouselItem key={item.value} className="pl-3 basis-auto">
                <Link
                  href={`${baseUrl}${
                    baseUrl.includes("?") ? "&" : "?"
                  }categoryId=${item.value}`}
                  scroll={false}
                  replace
                >
                  <Badge
                    className={`cursor-pointer font-medium transition ${
                      isSelected(item.value)
                        ? "bg-white text-black shadow-md"
                        : "bg-secondary text-secondary-foreground hover:opacity-85"
                    }`}
                  >
                    {item.label}
                  </Badge>
                </Link>
              </CarouselItem>
            ))}
        </CarouselContent>
        <CarouselPrevious className="left-0 z-20 size-7" />
        <CarouselNext className="right-0 z-20 size-7" />
      </Carousel>

      {/* Right fade effect - only show when can scroll next */}
      {canScrollNext && (
        <div className="absolute right-10 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      )}
    </div>
  );
};

export default FilterCarousel;
