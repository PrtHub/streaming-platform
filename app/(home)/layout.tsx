import HomeLayout from "@/modules/home/ui/layout/home-layout";

export const dynamic = "force-dynamic";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <HomeLayout>{children}</HomeLayout>;
};

export default Layout;
