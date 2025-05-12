import React from "react";
import HistoryVideosSection from "../sections/history-videos-section";

const HistoryView = () => {
  return (
    <div className="max-w-[2400px] mx-auto mb-10 px-4 flex flex-col  gap-y-6">
      <header className="flex flex-col gap-y-2">
        <h1 className="text-2xl font-semibold">History</h1>
        <p className="text-muted-foreground text-xs">
          Videos you have watched so far
        </p>
      </header>
      <HistoryVideosSection />
    </div>
  );
};

export default HistoryView;
