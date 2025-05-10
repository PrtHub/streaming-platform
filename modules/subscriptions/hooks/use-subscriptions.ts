import { trpc } from "@/trpc/client";
import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";

interface useSubscriptionsProps {
  userId: string;
  isSubscribed: boolean;
  fromVideoId?: string;
}

export const useSubscriptions = ({
  userId,
  fromVideoId,
  isSubscribed,
}: useSubscriptionsProps) => {
  const clerk = useClerk();

  const utils = trpc.useUtils();

  const subscribe = trpc.subscriptions.create.useMutation({
    onSuccess: () => {
      toast.success("Subscribed!");
      utils.videos.getManySubscriptions.invalidate();
      if (fromVideoId) {
        utils.videos.getOne.invalidate({ id: fromVideoId });
      }
    },
    onError: (err) => {
      toast.error(err?.message);

      if (err?.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });

  const unsubscribe = trpc.subscriptions.remove.useMutation({
    onSuccess: () => {
      toast.success("Unsubscribed!");
      utils.videos.getManySubscriptions.invalidate();
      if (fromVideoId) {
        utils.videos.getOne.invalidate({ id: fromVideoId });
      }
    },
    onError: (err) => {
      toast.error(err?.message);

      if (err?.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });

  const isPending = subscribe.isPending || unsubscribe.isPending;

  const onClick = () => {
    if (isSubscribed) {
      unsubscribe.mutate({ userId });
    } else {
      subscribe.mutate({ userId });
    }
  };

  return {
    isPending,
    onClick,
  };
};
