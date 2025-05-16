import { cn } from "@/lib/utils";
import { UserGetOneOutput } from "../../types";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Edit2Icon } from "lucide-react";

interface UserBannerProps {
  user: UserGetOneOutput;
}

const UserBanner = ({ user }: UserBannerProps) => {
  const { userId } = useAuth();
  return (
    <div className="relative group">
      <div
        className={cn(
          "w-full h-[200px] md:h-[30vh] bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl",
          user.bannerUrl ? "bg-cover bg-center" : "bg-gray-100/10"
        )}
        style={{
          backgroundImage: user.bannerUrl
            ? `url(${user.bannerUrl})`
            : undefined,
        }}
      >
        {user.clerkId === userId && (
          <Button
            type="button"
            size="icon"
            className="absolute top-4 right-4 rounded-full opacity-100 bg-black/20 hover:bg-black/20 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
            title="Edit banner"
            aria-label="Edit banner"
          >
            <Edit2Icon className="size-4 text-white" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default UserBanner;
