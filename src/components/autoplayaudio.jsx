import { useEffect, useRef, useState } from "react";
import { IoVolumeHigh, IoVolumeMute } from "react-icons/io5";

export function AutoPlayAudio({ src, postId, currentAudio }) {
    const audioRef = useRef(null);
    const containerRef = useRef(null);
    const [muted, setMuted] = useState(true);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!audioRef.current) return;

                if (entry.isIntersecting) {
                    if (
                        currentAudio.current &&
                        currentAudio.current !== audioRef.current
                    ) {
                        currentAudio.current.pause();
                    }

                    audioRef.current.play().catch(() => { });
                    currentAudio.current = audioRef.current;
                } else {
                    audioRef.current.pause();
                }
            },
            { threshold: 0.6 }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={containerRef} className="absolute bottom-3 right-3">

            <button onClick={() => { audioRef.current.muted = !muted; setMuted(!muted); }} className="bg-black/70 text-white w-9 h-9 rounded-full flex items-center justify-center">
                {muted ? <IoVolumeMute size={18} /> : <IoVolumeHigh size={18} />}
            </button>

            <audio ref={audioRef} src={src} loop muted playsInline />
        </div>
    );
}
