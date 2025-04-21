"use client";

import CommentForm from "@/modules/comments/ui/components/comment-form";
import CommentItem from "@/modules/comments/ui/components/comment-item";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface CommentsSectionProps {
  videoId: string;
}

const CommentsSection = ({ videoId }: CommentsSectionProps) => {
  const [comments] = trpc.comments.getMany.useSuspenseQuery({ videoId });

  return (
    <Suspense fallback={<>Loading...</>}>
      <ErrorBoundary fallback={<>Something Went Wrong</>}>
        <div className="mt-6">
          <section className="flex flex-col gap-y-6">
            <h1 className="font-semibold">{comments.length} Comments</h1>
            <CommentForm videoId={videoId} />
            <div className="mt-2 flex flex-col gap-6">
              {comments.length > 0 &&
                comments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))}
            </div>
          </section>
        </div>
      </ErrorBoundary>
    </Suspense>
  );
};

export default CommentsSection;
