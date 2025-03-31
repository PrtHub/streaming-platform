import VideoSection from "../sections/video-section";

const StudioView = () => {
  return (
    <div className="flex flex-col items-start gap-y-6">
      <div className="flex flex-col items-start gap-y-1">
        <h1 className="text-2xl font-semibold">Channel Content</h1>
        <p className="text-muted-foreground text-sm">
          Manage your channel content here
        </p>
      </div>
      <VideoSection />
    </div>
  );
};

export default StudioView;
