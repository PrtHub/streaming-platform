import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface UserAvatarProps {
  image: string | undefined;
  alt: string | undefined | null;
  className?: string;
}

const UserAvatar = ({ image, alt, className }: UserAvatarProps) => {
  return (
    <Avatar className={className}>
      {image && <AvatarImage src={image} alt={alt || ""} />}
      <AvatarFallback className="bg-primary/10 text-primary">
        <User />
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
