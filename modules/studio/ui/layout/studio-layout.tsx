import { SidebarProvider } from "@/components/ui/sidebar";
import { StudioSidebar } from "../components/studio-sidebar/studio-sidebar";
import { StudioNavbar } from "../components/studio-navbar/studio-navbar";

const StudioLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="w-full">
        <StudioNavbar />
        <div className="min-h-screen flex pt-[4rem]">
          <StudioSidebar />
          <main className="flex-1 overflow-y-auto pt-4 px-5">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default StudioLayout;
