import { useEffect, useRef, useState } from "react";
import { IoVolumeHigh, IoVolumeMute } from "react-icons/io5";
import { SiSourcetree } from "react-icons/si";

export function InstagramMedia({ type, src, currentPlaying, page }) {
  const mediaRef = useRef(null);
  const containerRef = useRef(null);
  const [muted, setMuted] = useState(true);
  console.log(type);

  useEffect(() => {
    const media = mediaRef.current;
    const container = containerRef.current;

    if (!media || !container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {

          if (
            currentPlaying.current &&
            currentPlaying.current !== media
          ) {
            currentPlaying.current.pause();
            currentPlaying.current.currentTime = 0;
          }

          media.play().catch(() => { });
          currentPlaying.current = media;

        } else {
          media.pause();
        }
      },
      { threshold: 0.75 }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, [currentPlaying]);

  const toggleMute = () => {
    if (!mediaRef.current) return;

    const newMuted = !muted;
    mediaRef.current.muted = newMuted;
    setMuted(newMuted);
    mediaRef.current.play()

    if (!mediaRef.current.paused) {
      mediaRef.current.play().catch(() => { });
    }
  };

  return (
    <>
      {page == "profile" && <>
        <video ref={mediaRef} src={src} loop playsInline muted={muted} className="w-full h-full object-contain" />
        <button onClick={toggleMute} className="absolute bottom-4 left-4 bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center">
          {muted ? (<IoVolumeMute size={18} />) : (<IoVolumeHigh size={18} />)}
        </button> </>
      }

      {page != "profile" && <div ref={containerRef} className="relative w-full bg-black overflow-hidden">

        {(type === "video") ? (
          <>
            <video ref={mediaRef} src={src} loop playsInline muted={muted} className="w-full h-auto max-h-[75vh] object-contain" />
            <button onClick={toggleMute} className="absolute bottom-4 right-4 bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center">
              {muted ? (<IoVolumeMute size={18} />) : (<IoVolumeHigh size={18} />)}
            </button>
          </>
        ) : (
          <>
            <audio ref={mediaRef} loop muted={muted} src={src}></audio>
            <button onClick={toggleMute} className=" bottom-4 right-4 text-white w-10 h-10 w-full rounded-full ">
              {muted ? (<IoVolumeMute size={18} color="white" />) : (<IoVolumeHigh size={18} color="white" />)}
            </button>
          </>
        )}

      </div>}
    </>
  );
}