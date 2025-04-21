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
  videoId: string;
  onSuccess?: () => void;
}

const CommentForm = ({ videoId, onSuccess }: CommentFormProps) => {
  const clerk = useClerk();
  const { user } = useUser();

  const utils = trpc.useUtils();

  const createComment = trpc.comments.create.useMutation({
    onSuccess: () => {
      toast.success("Comment added!");
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
      videoId,
      content: "",
    },
  });

  const handleSubmit = (values: z.infer<typeof commentFormSchema>) => {
    createComment.mutate(values);
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
                    placeholder="Write a comment..."
                    className="resize-none bg-transparent active:ring-0 active:outline-0"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          ></FormField>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting || createComment.isPending}
            className="mt-2 w-fit ml-auto cursor-pointer font-medium"
            variant="secondary"
          >
            Comment
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CommentForm;
