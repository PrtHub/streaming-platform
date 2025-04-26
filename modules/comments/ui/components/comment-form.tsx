"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import UserAvatar from "@/components/user-avatar";
import { insertCommentSchema } from "@/db/schema";
import { trpc } from "@/trpc/client";
import { useClerk, useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface CommentFormProps {
  parentId?: string;
  videoId: string;
  variant?: "comment" | "reply";
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CommentForm = ({
  videoId,
  onSuccess,
  onCancel,
  variant,
  parentId,
}: CommentFormProps) => {
  const clerk = useClerk();
  const { user } = useUser();

  const utils = trpc.useUtils();

  const createComment = trpc.comments.create.useMutation({
    onSuccess: () => {
      if (variant === "reply") {
        toast.success("Reply added!");
      } else {
        toast.success("Comment added!");
      }
      form.reset();
      utils.comments.getMany.invalidate({ videoId });
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(err.message);
      if (err.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });

  const commentFormSchema = insertCommentSchema.omit({ userId: true });

  const form = useForm<z.infer<typeof commentFormSchema>>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      parentId,
      videoId,
      content: "",
    },
  });

  const handleSubmit = (values: z.infer<typeof commentFormSchema>) => {
    createComment.mutate(values);
  };

  const handleCancle = () => {
    form.reset();
    onCancel?.();
  };

  return (
    <Form {...form}>
      <form
        className="flex gap-4 group"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <UserAvatar
          image={user?.imageUrl}
          alt={user?.firstName}
          className="size-10"
        />
        <div className="flex-1 flex flex-col ">
          <FormField
            name="content"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder={
                      variant === "reply"
                        ? "Reply to this comment..."
                        : "Write a comment..."
                    }
                    className="resize-none bg-transparent active:ring-0 active:outline-0"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          ></FormField>
          <div className="flex items-center justify-end  ml-auto gap-x-2">
            {onCancel && (
              <Button
                type="button"
                onClick={handleCancle}
                disabled={createComment.isPending}
                className="mt-2 w-fit cursor-pointer font-medium"
                variant="ghost"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={form.formState.isSubmitting || createComment.isPending}
              className="mt-2 w-fit cursor-pointer font-medium"
              variant="secondary"
            >
              {variant === "reply" ? "Reply" : "Comment"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default CommentForm;
