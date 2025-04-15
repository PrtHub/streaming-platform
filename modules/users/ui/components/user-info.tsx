import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const userInfoVarients = cva("flex items-center gap-1", {
  variants: {
    size: {
      default: "[&_p]:text-sm [&_svg]:size-4",
      lg: "[&_p]:text-base [&_svg]:size-5 [&_p]:font-medium [&_svg]:text-black",
      sm: "[&_p]:text-xs [&_svg]:size-3.5",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface UserInfoProps extends VariantProps<typeof userInfoVarients> {
  name: string;
  className?: string;
}

const UserInfo = ({ name, className, size }: UserInfoProps) => {
  return (
    <div className={cn(userInfoVarients({ className, size }))}>
      <Tooltip>
        <TooltipTrigger asChild>
          <p className="">{name}</p>
        </TooltipTrigger>
        <TooltipContent>{name}</TooltipContent>
      </Tooltip>
    </div>
  );
};

export default UserInfo;
