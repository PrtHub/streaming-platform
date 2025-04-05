import FormSection from "../sections/form-section";

interface VideoViewProps {
  videoId: string;
}

const VideoView = ({ videoId }: VideoViewProps) => {
  return (
    <div className="max-w-[1600px] w-full flex flex-col  gap-y-6 py-5">
      <FormSection videoId={videoId} />
    </div>
  );
};

export default VideoView;
