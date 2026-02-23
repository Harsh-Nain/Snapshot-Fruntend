import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FiImage, FiMusic, FiLock, FiX } from "react-icons/fi";
import DotSpinner from "../components/dot-spinner-anim";
import { IoVolumeHigh, IoVolumeMute } from "react-icons/io5";

export default function EditPost() {
  const API_URL = import.meta.env.VITE_BACKEND_API_URL;

  const [song, setSong] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  const [caption, setCaption] = useState("");
  const [description, setDescription] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [media, setMedia] = useState(null);
  const [Id, setId] = useState(null);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const abortRef = useRef(null);
  const audioRef = useRef(null);

  const [params] = useSearchParams();
  const id = params.get("id");
  const username = params.get("username");

  const videoRef = useRef(null);

  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => { });
    }
  }, [mediaPreview]);

  useEffect(() => {
    if (!id) return;

    abortRef.current = new AbortController();

    const loadPost = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${API_URL}/api/post/edit`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, username }),
          signal: abortRef.current.signal,
        });

        const result = await res.json();
        if (!result?.post) return navigate('/profile');

        setMediaPreview(result.post.image_url || "");
        setId(result.post.Id)
        setMedia(result.post.image_url || "");
        setCaption(result.post.postName || "");
        setDescription(result.post.desc || "");
        setIsPrivate(!result.post.isPublic);
        if (result.post.songUrl) {
          setAudioUrl(result.post.songUrl);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
    return () => abortRef.current?.abort();
  }, [id, username, API_URL]);

  const handleMediaFile = (file) => {
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      return setErrors({ media: "Only image or video allowed" });
    }

    if (isVideo) {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);

        if (video.duration > 60) {
          setErrors({ media: "Video must be 1 minute or less" });
          return;
        }

        const previewUrl = URL.createObjectURL(file);
        setMedia(file);
        setMediaPreview(previewUrl);
        setErrors({});
      };

      video.src = URL.createObjectURL(file);
    } else {
      const previewUrl = URL.createObjectURL(file);
      setMedia(file);
      setMediaPreview(previewUrl);
      setErrors({});
    }
  };

  const handleMediaChange = (e) => {
    handleMediaFile(e.target.files[0]);
  };

  const handleDropMedia = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleMediaFile(e.dataTransfer.files[0]);
  };

  const handleSongChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("audio/"))
      return setErrors({ song: "Only audio files allowed" });

    setSong(file);
    setAudioUrl(URL.createObjectURL(file));
    setErrors({});
  };

  const removeMusic = () => {
    setSong(null);
    setAudioUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!media)
      return setErrors({ media: "Image or video is required" });

    if (caption.trim().length < 3)
      return setErrors({ caption: "Caption must be at least 3 characters" });

    const formData = new FormData();

    if (media instanceof File) {
      formData.append("post", media);
    }

    formData.append("id", Id);
    formData.append("postname", caption);
    formData.append("discription", description);
    formData.append("isPrivate", isPrivate);

    if (song) {
      formData.append("song", song);
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/post/editPost`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        console.log(data);

        navigate("/profile");
      } else {
        setErrors({ submit: data.message });
      }
    } catch {
      setErrors({ submit: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#fafafa] flex items-center justify-center sm:px-4 sm:py-10 z-9999">
      <div className="fixed inset-0 w-[fit-content] h-[fit-content] right-0 sm:hidden z-9999999"><FiX onClick={() => navigate("/profile")} size="2rem" color="red" /></div>

      {loading && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <DotSpinner size="3rem" color="white" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full max-w-6xl bg-white sm:rounded-3xl shadow-xl border flex flex-col lg:flex-row overflow-hidden">

        <div onDragOver={(e) => { e.preventDefault(); setDragActive(true); }} onDragLeave={() => setDragActive(false)} onDrop={handleDropMedia} className={`w-full lg:w-1/2 h-[40vh] sm:h-[100%] sm:aspect-square bg-zinc-900 flex items-center justify-center relative transition ${dragActive ? "border-4 border-pink-500 bg-pink-50" : ""}`}>
          {!mediaPreview ? (
            <div className="text-center text-gray-400 related">
              <FiImage size={40} className="mx-auto mb-3" />
              <p>Drag & Drop Image or Video</p>
              <p className="text-xs mt-2">or click to upload</p>
              {errors.media && (<p className="text-red-500 text-xs mt-2">{errors.media}</p>)}
            </div>
          ) : mediaPreview.match(/\.(mp4|webm|ogg)$/i) ? (
            <>
              <video ref={videoRef} src={mediaPreview} muted={isMuted} loop playsInline className="w-full h-full object-contain" />
              <button onClick={() => { videoRef.current.muted = !isMuted; setIsMuted(!isMuted); }} className="p-3 bg-black/90 z-99 right-2 bottom-2 rounded-full absolute">
                {isMuted ? (<IoVolumeMute size={18} color="white" />) : (<IoVolumeHigh size={18} color="white" />)}
              </button>
            </>
          ) : (
            <img src={mediaPreview} alt="preview" className="w-full h-full object-contain" />
          )}

          <input type="file" accept="image/*,video/*" onChange={handleMediaChange} className="absolute inset-0 opacity-0 cursor-pointer" />
        </div>

        <div className="w-full lg:w-1/2 p-8 flex flex-col gap-6">

          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent">
            Edit Post
          </h2>

          <input type="text" placeholder="Write a caption..." value={caption} onChange={(e) => setCaption(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-100 border focus:ring-2 focus:ring-pink-400 outline-none" />
          {errors.caption && (
            <p className="text-red-500 text-xs">{errors.caption}</p>
          )}

          <textarea rows={3} placeholder="Description..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-100 border outline-none" />

          <label className="flex items-center justify-between px-4 py-3 rounded-xl border bg-gradient-to-r from-pink-500 to-yellow-500 text-white font-semibold cursor-pointer">
            <div className="flex items-center gap-3">
              <FiMusic />
              {audioUrl ? "Change Music" : "Add Music"}
            </div>
            <input type="file" accept="audio/*" onChange={handleSongChange} className="hidden" />
          </label>

          {audioUrl && (
            <div className="bg-gray-100 p-4 rounded-xl">
              <audio ref={audioRef} src={audioUrl} controls className="w-full" />
              <button type="button" onClick={removeMusic} className="text-red-500 text-xs mt-2">
                Remove Music
              </button>
            </div>
          )}

          <label className="flex items-center gap-3 text-sm text-gray-700">
            <FiLock />
            <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="accent-pink-500" />
            Make this post private
          </label>

          {errors.submit && (<p className="text-red-500 text-sm">{errors.submit}</p>)}

          <button type="submit" className="py-3 rounded-full font-semibold text-white bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:opacity-90 transition">
            Update Post
          </button>
        </div>
      </form>
    </div>
  );
}