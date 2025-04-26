import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import CommentItem from "./comment-item";
import { CornerDownRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommentRepliesProps {
  parentId: string;
  videoId: string;
}

const CommentReplies = ({ parentId, videoId }: CommentRepliesProps) => {
  const {
    data: replies,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = trpc.comments.getMany.useInfiniteQuery(
    {
      parentId,
      videoId,
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor;
      },
    }
  );

  return (
    <section className="ml-14 flex-1 mt-4">
      {isLoading && (
        <div className="py-6 bg-muted/50 rounded-md min-h-[80px] w-full animate-pulse">
          <Loader2
            className="w-6 h-6 mx-auto text-muted-foreground animate-spin mb-2"
            aria-label="Loading replies"
          />
        </div>
      )}
      <div className="space-y-4">
        {replies?.pages
          .flatMap((page) => page.items)
          .map((reply) => (
            <CommentItem key={reply.id} comment={reply} variant="reply" />
          ))}
      </div>
      {hasNextPage && (
        <Button
          type="button"
          variant="tertiary"
          size="sm"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="cursor-pointer font-semibold"
        >
          <CornerDownRight /> Show more replies
        </Button>
      )}
    </section>
  );
};

export default CommentReplies;
