import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiImage, FiMusic, FiLock, FiUpload, FiX } from "react-icons/fi";
import DotSpinner from "../components/dot-spinner-anim";

export default function CreatePost() {
  const API_URL = import.meta.env.VITE_BACKEND_API_URL;
  const navigate = useNavigate();
  const audioRef = useRef(null);

  const [dragActive, setDragActive] = useState(false);
  const [dragMusic, setDragMusic] = useState(false);

  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);

  const [song, setSong] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [openMusic, setOpenMusic] = useState(false);

  const [caption, setCaption] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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

        setMedia(file);
        setMediaPreview(URL.createObjectURL(file));
        setErrors({});
      };

      video.src = URL.createObjectURL(file);
    } else {
      setMedia(file);
      setMediaPreview(URL.createObjectURL(file));
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

  const handleSongFile = (file) => {
    if (!file.type.startsWith("audio/")) {
      setErrors({ music: "Only audio files allowed" });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors({ music: "Music must be under 10MB" });
      return;
    }

    const url = URL.createObjectURL(file);
    setSong(file);
    setAudioUrl(url);
    setOpenMusic(false);
    setErrors({});
  };

  const handleSongChange = (e) => {
    handleSongFile(e.target.files[0]);
  };

  const handleDropMusic = (e) => {
    e.preventDefault();
    setDragMusic(false);
    handleSongFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!media)
      return setErrors({ media: "Image or video is required" });

    if (caption.length < 3)
      return setErrors({ caption: "Caption must be at least 3 characters" });

    const formData = new FormData();
    formData.append("post", media);
    formData.append("postname", caption);
    formData.append("discription", description);
    formData.append("isPrivate", isPrivate);

    if (song) formData.append("song", song);

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/post/post`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (data.success) navigate(data.redirect);
      else setErrors({ submit: data.message });
    } catch {
      setErrors({ submit: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (mediaPreview) URL.revokeObjectURL(mediaPreview);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [mediaPreview, audioUrl]);

  return (
    <div className="w-full min-h-screen bg-[#fafafa] flex justify-center sm:px-4 sm:py-10">

      {loading && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <DotSpinner size="3rem" color="white" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full max-w-6xl bg-white rounded-3xl shadow-xl border flex flex-col lg:flex-row overflow-hidden">
        <div onDragOver={(e) => { e.preventDefault(); setDragActive(true); }} onDragLeave={() => setDragActive(false)} onDrop={handleDropMedia} className={`w-full lg:w-1/2 aspect-square bg-gray-100 flex items-center justify-center relative transition ${dragActive ? "border-4 border-pink-500 bg-pink-50" : ""}`} >
          {!mediaPreview ? (
            <div className="text-center text-gray-400">
              <FiImage size={40} className="mx-auto mb-3" />
              <p>Drag & Drop Image or Video</p>
              <p className="text-xs mt-2">or click to upload</p>
              {errors.media && (
                <p className="text-red-500 text-xs mt-2">{errors.media}</p>
              )}
            </div>
          ) : media?.type.startsWith("video/") ? (
            <video src={mediaPreview} controls className="w-full h-full object-cover" />
          ) : (
            <img src={mediaPreview} alt="preview" className="w-full h-full object-cover" />
          )}

          <input type="file" accept="image/*,video/*" onChange={handleMediaChange} className="absolute inset-0 opacity-0 cursor-pointer" />
        </div>

        <div className="w-full lg:w-1/2 p-6 flex flex-col gap-5">

          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 bg-clip-text text-transparent">
            Create Post
          </h2>

          <input type="text" placeholder="Write a caption..." value={caption} onChange={(e) => setCaption(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-100 border focus:ring-2 focus:ring-pink-400 outline-none" />

          <textarea rows={3} placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-100 border focus:ring-2 focus:ring-pink-400 outline-none" />

          <button type="button" onClick={() => setOpenMusic(true)} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-yellow-500 text-white font-semibold">
            <FiMusic /> Add Music
          </button>

          {audioUrl && (
            <div className="bg-gray-100 p-4 rounded-xl">
              <audio ref={audioRef} src={audioUrl} controls className="w-full" />
              <button type="button" onClick={() => setAudioUrl(null)} className="text-red-500 text-xs mt-2">
                Remove Music
              </button>
            </div>
          )}

          <label className="flex items-center gap-3 text-sm text-gray-700">
            <FiLock />
            <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="accent-pink-500" />
            Make this post private
          </label>

          <button type="submit" className="py-3 rounded-full font-semibold text-white bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
            Share Post
          </button>
        </div>
      </form>

      {openMusic && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div onDragOver={(e) => { e.preventDefault(); setDragMusic(true); }} onDragLeave={() => setDragMusic(false)} onDrop={handleDropMusic} className={`bg-white w-full max-w-md rounded-3xl p-6 text-center transition ${dragMusic ? "border-4 border-pink-500 bg-pink-50" : ""}`}>
            <FiUpload size={30} className="mx-auto mb-3 text-pink-500" />
            <p className="font-semibold">Drag & Drop Music Here</p>
            <p className="text-sm text-gray-400 mb-4">
              or click below to upload
            </p>

            <label className="px-6 py-2 rounded-full bg-gradient-to-r from-pink-500 to-yellow-500 text-white cursor-pointer">
              Browse
              <input type="file" accept="audio/*" onChange={handleSongChange} className="hidden" />
            </label>

            {errors.music && (<p className="text-red-500 text-xs mt-3">{errors.music}</p>)}

            <button onClick={() => setOpenMusic(false)} className="block mt-4 text-gray-400">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}