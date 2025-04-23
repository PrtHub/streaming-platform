const CommentSectionSkeleton = () => {
  return (
    <div className="mt-6">
      <section className="flex flex-col gap-y-6">
        {/* Heading Skeleton */}
        <div className="h-6 w-32 bg-muted/40 rounded animate-pulse mb-2" />
        {/* Comment Form Skeleton */}
        <div className="flex gap-4 items-start mb-4">
          <div className="w-10 h-10 bg-muted/40 rounded-full animate-pulse" />
          <div className="flex-1">
            <div className="h-10 bg-muted/40 rounded mb-2 animate-pulse" />
            <div className="flex gap-2">
              <div className="h-8 w-20 bg-muted/40 rounded animate-pulse" />
              <div className="h-8 w-20 bg-muted/40 rounded animate-pulse" />
            </div>
          </div>
        </div>
        {/* Comment Item Skeletons */}
        <div className="flex flex-col gap-6 mt-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-10 h-10 bg-muted/40 rounded-full animate-pulse" />
              <div className="flex-1">
                <div className="h-4 w-24 bg-muted/40 rounded mb-2 animate-pulse" />
                <div className="h-4 w-3/4 bg-muted/40 rounded mb-1 animate-pulse" />
                <div className="h-4 w-1/2 bg-muted/40 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CommentSectionSkeleton;
