import { SidebarProvider } from "@/components/ui/sidebar";
import { HomeNavbar } from "../components/home-navbar/home-navbar";
import { HomeSidebar } from "../components/home-sidebar/home-sidebar";

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="w-full">
        <HomeNavbar />
        <div className="min-h-screen flex pt-[4rem]">
          <HomeSidebar />
          <main className="flex-1 overflow-y-auto pt-4 px-5">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default HomeLayout;
