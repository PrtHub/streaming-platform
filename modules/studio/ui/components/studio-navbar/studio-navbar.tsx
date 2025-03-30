import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import { AuthButton } from "@/modules/auth/components/auth-button";
import StudioUploadModal from "../studio-upload-modal";

export const StudioNavbar = () => {
  return (
    <nav className="fixed inset-0 h-16 bg-background flex items-center px-2 pr-5 z-50 border-b-[1px] border-border/40">
      <div className="flex items-center gap-4 w-full">
        <section className="flex items-center flex-shrink-0 ml-1.5">
          <SidebarTrigger className="cursor-pointer" />
          <Link href="/studio">
            <div className="flex items-center gap-1 p-4 ">
              <Image
                src="/youtube.svg"
                width={32}
                height={32}
                alt="YouTube Studio"
              />

              <p className="text-xl tracking-tight font-semibold">Studio</p>
            </div>
          </Link>
        </section>

        <section className="flex ml-auto flex-shrink-0 gap-5 items-center">
          <StudioUploadModal />
          <AuthButton />
        </section>
      </div>
    </nav>
  );
};
