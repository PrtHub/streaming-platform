import LikedVideosSection from "../sections/liked-videos-sections";

const LikedView = () => {
  return (
    <div className="max-w-[2400px] mx-auto mb-10 px-4 flex flex-col  gap-y-6">
      <header className="flex flex-col gap-y-2">
        <h1 className="text-2xl font-semibold">Liked Videos</h1>
        <p className="text-muted-foreground text-xs">Videos you have liked</p>
      </header>
      <LikedVideosSection />
    </div>
  );
};

export default LikedView;
