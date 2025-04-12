import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SubscriptionButtonProps {
  onClick: () => void;
  disable: boolean;
  isSubscribed: boolean;
  className?: string;
}

const SubscriptionButton = ({
  isSubscribed,
  disable,
  onClick,
  className,
}: SubscriptionButtonProps) => {
  return (
    <Button
      disabled={disable}
      onClick={onClick}
      className={cn(
        "rounded-full text-lg py-6 font-semibold cursor-pointer",
        className
      )}
      variant={isSubscribed ? "secondary" : "default"}
    >
      {isSubscribed ? "Unsubscribe" : "Subscribe"}
    </Button>
  );
};

export default SubscriptionButton;
