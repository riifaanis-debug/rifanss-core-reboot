import React, { useRef } from 'react';
import introVideoAsset from '@/assets/intro.mp4.asset.json';

const IntroVideo: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="w-full bg-black">
      <div className="max-w-[520px] mx-auto">
        <video
          ref={videoRef}
          src={introVideoAsset.url}

          autoPlay
          muted
          loop
          playsInline
          className="w-full object-contain"
        />
      </div>
    </div>
  );
};

export default IntroVideo;
