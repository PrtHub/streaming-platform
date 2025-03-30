import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { PersonalStudio } from "./personal-studio";
import StudioSidebarHeader from "./studio-sidebar-header";

export const StudioSidebar = () => {
  return (
    <Sidebar
      className="pt-16 z-40 w-56 border-r border-[1px] border-border/30 transition-all duration-300"
      collapsible="icon"
    >
      <SidebarContent className="bg-background">
        <StudioSidebarHeader />
        <PersonalStudio />
      </SidebarContent>
    </Sidebar>
  );
};
