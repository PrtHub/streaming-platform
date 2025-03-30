import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { SearchInput } from "./search-input";
import { AuthButton } from "@/modules/auth/components/auth-button";

export const HomeNavbar = () => {
  return (
    <nav className="fixed inset-0 h-16 bg-background flex items-center px-2 pr-5 z-50 border-b-[1px] border-border/10">
      <div className="flex items-center gap-4 w-full">
        <section className="flex items-center flex-shrink-0 ml-1.5">
          <SidebarTrigger className="cursor-pointer" />
          <Link href="/">
            <div className="flex items-center gap-1 p-4 ">
              <Image src="/youtube.svg" width={32} height={32} alt="YouTube" />

              <p className="text-xl tracking-tight font-semibold">YouTube</p>
            </div>
          </Link>
        </section>
        <section className="flex-1 flex justify-center mx-auto max-w-[720px]">
          <SearchInput />
        </section>

        <section className="flex flex-shrink-0 items-center">
          <AuthButton />
        </section>
      </div>
    </nav>
  );
};
