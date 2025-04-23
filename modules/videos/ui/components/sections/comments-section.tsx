"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import CommentForm from "@/modules/comments/ui/components/comment-form";
import CommentItem from "@/modules/comments/ui/components/comment-item";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface CommentsSectionProps {
  videoId: string;
}

const CommentsSection = ({ videoId }: CommentsSectionProps) => {
  const [comments, query] = trpc.comments.getMany.useSuspenseInfiniteQuery(
    { videoId, limit: DEFAULT_LIMIT },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <Suspense fallback={<>Loading...</>}>
      <ErrorBoundary fallback={<>Something Went Wrong</>}>
        <div className="mt-6">
          <section className="flex flex-col gap-y-6">
            <h1 className="font-semibold">
              {comments.pages[0]?.totalCount ?? 0} Comments
            </h1>
            <CommentForm videoId={videoId} />
            <div className="mt-2 flex flex-col gap-6">
              {comments.pages.flatMap((page) => page.items).length > 0 &&
                comments.pages
                  .flatMap((page) => page.items)
                  .map((comment) => (
                    <CommentItem key={comment.id} comment={comment} />
                  ))}
              <InfiniteScroll
                hasNextPage={query.hasNextPage}
                isFetchingNextPage={query.isFetchingNextPage}
                fetchNextPage={query.fetchNextPage}
              />
            </div>
          </section>
        </div>
      </ErrorBoundary>
    </Suspense>
  );
};

export default CommentsSection;
