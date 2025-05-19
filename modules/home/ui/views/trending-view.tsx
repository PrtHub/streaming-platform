import TrendingVideosSection from "../sections/trending-videos-section";

const TrendingView = () => {
  return (
    <div className="max-w-[2400px] mx-auto mb-10 px-4 flex flex-col  gap-y-6">
      <header className="flex flex-col gap-y-2">
        <h1 className="text-2xl font-semibold">Trending videos</h1>
        <p className="text-muted-foreground text-xs">
          Most popular videos at the moment
        </p>
      </header>
      <TrendingVideosSection />
    </div>
  );
};

export default TrendingView;
