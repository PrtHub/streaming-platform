"use client";

import { trpc } from "@/trpc/client";

export const PageClient = () => {
  const [data] = trpc.hello.useSuspenseQuery({ text: "pritam2" });

  return (
    <div className="ml-5">
      <h1>{data.greeting}</h1>
    </div>
  );
};
