import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FiImage, FiMusic, FiLock, FiX } from "react-icons/fi";
import DotSpinner from "../components/dot-spinner-anim";

export default function EditPost() {
  const API_URL = import.meta.env.VITE_BACKEND_API_URL;

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [song, setSong] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  const [caption, setCaption] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const abortRef = useRef(null);
  const audioRef = useRef(null);

  const [params] = useSearchParams();
  const id = params.get("id");
  const username = params.get("username");

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
        if (!result?.post) return;

        setImagePreview(result.post.image_url);
        setCaption(result.post.postName || "");
        setDescription(result.post.desc || "");
        setIsPrivate(result.post.isPublic);

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
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/"))
      return setErrors({ image: "Only image files allowed" });

    if (file.size > 20 * 1024 * 1024)
      return setErrors({ image: "Image must be under 20MB" });

    setErrors({});
    setImage(file);

    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSongChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("audio/"))
      return setErrors({ song: "Only audio files allowed" });

    setErrors({});
    setSong(file);
    setAudioUrl(URL.createObjectURL(file));
  };

  const removeMusic = () => {
    setSong(null);
    setAudioUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (caption.trim().length < 3)
      return setErrors({ caption: "Caption must be at least 3 characters" });

    const formData = new FormData();
    formData.append("id", id);
    formData.append("postname", caption);
    formData.append("discription", description);
    formData.append("isPrivate", isPrivate);

    if (image) formData.append("post", image);
    if (song) formData.append("song", song);

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/post/editPost`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        navigate("/api/profile");
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
    <div className="w-full min-h-screen bg-[#fafafa] flex items-center justify-center px-4 py-10 z-9999">

      <div className="absolute inset-0 w-[fit-content] h-[fit-content] right-0 sm:hidden z-9999999"><FiX onClick={() => navigate("/api/profile")} size="2rem" /></div>

      {loading && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <DotSpinner size="3rem" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full max-w-6xl bg-white rounded-3xl shadow-xl border flex flex-col lg:flex-row overflow-hidden">
        <label className="w-full lg:w-1/2 aspect-square bg-gray-100 flex items-center justify-center cursor-pointer relative group">
          {!imagePreview ? (
            <div className="text-center text-gray-400 group-hover:text-gray-600 transition">
              <FiImage size={40} className="mx-auto mb-4" />
              <p className="text-sm">Upload New Image</p>
              {errors.image && (<p className="text-red-500 text-xs mt-2">{errors.image}</p>)}
            </div>
          ) : (
            <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
          )}

          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        </label>

        <div className="w-full lg:w-1/2 p-8 flex flex-col gap-6">

          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent">
            Edit Post
          </h2>

          <input type="text" placeholder="Write a caption..." value={caption} onChange={(e) => setCaption(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-red-400 focus:border-yellow-400 outline-none" />

          <textarea rows={3} placeholder="Description..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-red-400 focus:border-yellow-400 outline-none" />

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
