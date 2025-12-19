"use client";

import { use, useEffect, useState } from "react";

export const VideoGrid = ({
  streams,
  muted,
}: {
  streams: MediaStream[];
  muted?: boolean;
}) => {
  // This component focuses one video stream (selectable by the user) and shows others as smaller thumbnails
  const [selectedStream, setSelectedStream] = useState<MediaStream | undefined>(
    undefined
  );

  useEffect(() => {
    if (streams && streams.length > 0) {
      setSelectedStream(streams.at(-1));
    }
  }, [streams]);

  return (
    <div className="p-4 flex flex-row gap-4 grow justify-center items-center overflow-hidden relative">
      {selectedStream && (
        <video
          className="rounded-sm max-h-full max-w-full grow"
          autoPlay
          ref={(ref) => {
            if (ref && selectedStream) {
              ref.srcObject = selectedStream;
            }
          }}
          muted={muted}
        ></video>
      )}
      <div className="p-4 flex flex-row gap-4 items-stretch absolute bottom-0 left-0">
        {streams
          .filter((s) => s !== selectedStream)
          .map((stream, index) => (
            <video
              key={index}
              className="rounded-sm shrink inline-block h-32 cursor-pointer overflow-hidden"
              autoPlay
              ref={(ref) => {
                if (ref) {
                  ref.srcObject = stream;
                }
              }}
              muted={muted}
              onClick={() => setSelectedStream(stream)}
            ></video>
          ))}
      </div>
    </div>
  );
};
