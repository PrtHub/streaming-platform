import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { useIntersectionObserver } from "@/hooks/user-intersection-observer";

interface InfiniteScrollProps {
  isManual?: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

export const InfiniteScroll = ({
  isManual = false,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: InfiniteScrollProps) => {
  const [isIntersecting, targetRef] = useIntersectionObserver({
    threshold: 0.5,
    rootMargin: "100px",
  });

  useEffect(() => {
    if (!isManual && hasNextPage && !isFetchingNextPage && isIntersecting) {
      fetchNextPage();
    }
  }, [
    isIntersecting,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isManual,
  ]);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div ref={targetRef as React.RefObject<HTMLDivElement>} className="h-1" />
      {hasNextPage ? (
        <Button
          variant={"secondary"}
          onClick={fetchNextPage}
          disabled={isFetchingNextPage}
          className="cursor-pointer"
        >
          {isFetchingNextPage ? "Loading..." : "Load More"}
        </Button>
      ) : (
        <p className="text-muted-foreground text-xs">
          You have reached the end
        </p>
      )}
    </div>
  );
};
