import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/user-avatar";

interface SubscriptionItemProps {
  name: string;
  imageUrl: string;
  subscriberCount: number;
  onUnsubscribe: () => void;
  disable: boolean;
}

const SubscriptionItem = ({
  name,
  imageUrl,
  subscriberCount,
  onUnsubscribe,
  disable,
}: SubscriptionItemProps) => {
  return (
    <div className="flex flex-1 items-start gap-4">
      <UserAvatar
        alt={name}
        image={imageUrl}
        className="rounded-full size-10"
      />

      <article className="flex flex-col">
        <span className="font-semibold text-sm">{name}</span>
        <span className="text-xs text-muted-foreground">
          {subscriberCount.toLocaleString()} subscribers
        </span>
      </article>
      <Button
        onClick={(e) => {
          e.preventDefault();
          onUnsubscribe();
        }}
        variant={"secondary"}
        size={"lg"}
        disabled={disable}
        className="rounded-full px-4 py-3 ml-auto cursor-pointer font-medium"
      >
        Unsubscribe
      </Button>
    </div>
  );
};

export default SubscriptionItem;
