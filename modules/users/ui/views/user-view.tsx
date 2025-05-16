import UserSection from "../sections/user-section";

interface UserViewProps {
  userId: string;
}

const UserView = ({ userId }: UserViewProps) => {
  return (
    <div className="max-w-[1400px] mx-auto mb-10 px-4 flex flex-col  gap-y-6">
      <UserSection userId={userId} />
    </div>
  );
};

export default UserView;
