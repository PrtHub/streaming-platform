import CategoriesSection from "../sections/categories-section";
import HomeVideoSection from "../sections/home-video-section";

interface HomeViewProps {
  categoryId?: string;
}

const HomeView = ({ categoryId }: HomeViewProps) => {
  return (
    <div className="max-w-[2400px] mx-auto mb-10 px-4 flex flex-col  gap-y-6">
      <CategoriesSection categoryId={categoryId} />
      <HomeVideoSection categoryId={categoryId} />
    </div>
  );
};

export default HomeView;
