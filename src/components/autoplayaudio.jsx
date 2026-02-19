import { useEffect, useRef, useState } from "react";
import { IoVolumeHigh, IoVolumeMute } from "react-icons/io5";

export function AutoPlayAudio({ src, currentAudio }) {
    const audioRef = useRef(null);
    const containerRef = useRef(null);
    const [muted, setMuted] = useState(true);

    useEffect(() => {
        const audio = audioRef.current;
        const container = containerRef.current;
        if (!audio || !container) return;

        audio.muted = true;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    
                    if (currentAudio.current && currentAudio.current !== audio) {
                        currentAudio.current.pause();
                        currentAudio.current.currentTime = 0;
                    }

                    audio
                        .play()
                        .then(() => {
                            currentAudio.current = audio;
                        })
                        .catch((err) => {
                            console.log("Autoplay blocked:", err);
                        });
                } else {
                    audio.pause();
                }
            },
            { threshold: 0.8 } 
        );

        observer.observe(container);

        return () => observer.disconnect();
    }, [currentAudio]);

    const toggleMute = () => {
        if (!audioRef.current) return;

        const newMuted = !muted;
        audioRef.current.muted = newMuted;
        setMuted(newMuted);

        if (!newMuted) {
            audioRef.current.play().catch(() => { });
        }
    };

    return (
        <div ref={containerRef} className="absolute bottom-3 right-3 z-10">
            <button    onClick={toggleMute}    className="bg-black/70 text-white w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm">
                {muted ? <IoVolumeMute size={18} /> : <IoVolumeHigh size={18} />}
            </button>

            <audio    ref={audioRef}    src={src}    loop    muted    preload="auto"    playsInline/>
        </div>
    );
}
