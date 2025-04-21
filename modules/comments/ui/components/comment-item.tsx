import Link from "next/link";
import { CommentManyOutput } from "../../types";
import UserAvatar from "@/components/user-avatar";
import { formatRelativeTime } from "@/lib/utils";

interface CommentItemProps {
  comment: CommentManyOutput[number];
}

const CommentItem = ({ comment }: CommentItemProps) => {
  return (
    <div>
      <div className="flex gap-4">
        <Link href={`/users/${comment.userId}`}>
          <UserAvatar
            image={comment.user.imageUrl}
            alt={comment.user.name}
            className="size-10"
          />
        </Link>
        <article className="flex-1">
          <Link href={`/users/${comment.userId}`}>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-semibold text-sm pb-0.5">
                {comment.user.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(comment.createdAt)}
              </span>
            </div>
          </Link>
          <p className="text-[13px] font-medium">{comment.content}</p>
        </article>
      </div>
    </div>
  );
};

export default CommentItem;
