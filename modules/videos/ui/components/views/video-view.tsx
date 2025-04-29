import CommentsSection from "../sections/comments-section";
import VideoSection from "../sections/video-section";
import VideoSuggestions from "../sections/video-suggestions";

interface VideoViewProps {
  videoId: string;
}

const VideoView = ({ videoId }: VideoViewProps) => {
  return (
    <div className="flex flex-col max-w-[1600px] mx-auto">
      <div className="flex flex-col xl:flex-row gap-6">
        <section className="flex-1 min-w-0">
          <VideoSection videoId={videoId} />
          <CommentsSection videoId={videoId} />
          <div className="xl:hidden block  mt-4">
            <VideoSuggestions videoId={videoId} isManual />
          </div>
        </section>
        <section className="xl:block hidden w-full xl:w-[380px] 2xl:w-[460px] shrink ">
          <VideoSuggestions videoId={videoId} />
        </section>
      </div>
    </div>
  );
};

export default VideoView;
