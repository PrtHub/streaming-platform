"use client";

import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import UserBanner from "../components/user-banner";
import UserPageInfo from "../components/user-page-info";

interface UserSectionProps {
  userId: string;
}

const UserSection = ({ userId }: UserSectionProps) => {
  const [user] = trpc.users.getOne.useSuspenseQuery({ id: userId });

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <div className="flex flex-col ">
          <UserBanner user={user} />
          <UserPageInfo user={user} />
        </div>
      </ErrorBoundary>
    </Suspense>
  );
};

export default UserSection;
