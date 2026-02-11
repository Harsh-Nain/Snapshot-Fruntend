import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DotSpinner from "../components/dot-spinner-anim";

export default function CreatePost() {
  const API_URL = import.meta.env.VITE_BACKEND_API_URL
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [song, setSong] = useState(null);

  const [caption, setCaption] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return setErrors({ image: "Only image files allowed" });
    }

    if (file.size > 20 * 1024 * 1024) {
      return setErrors({ image: "Image must be under 20MB" });
    }

    setErrors({});
    setImage(file);

    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSongChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("audio/")) {
      return setErrors({ song: "Only audio files allowed" });
    }

    if (file.size > 10 * 1024 * 1024) {
      return setErrors({ song: "Audio must be under 10MB" });
    }

    setErrors({});
    setSong(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!image) newErrors.image = "Image is required";
    if (caption.trim().length < 3)
      newErrors.caption = "Caption must be at least 3 characters";
    if (description.length > 500)
      newErrors.description = "Description max 500 characters";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const formData = new FormData();
    formData.append("post", image);
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

      if (res.status === 401) {
        navigate("/login");
        return;
      }

      const data = await res.json();

      if (data.success) {
        navigate(data.redirect);
      } else {
        setErrors({ submit: data.message || "Post failed" });
      }
    } catch (err) {
      console.error(err);
      setErrors({ submit: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  return (
    <div className="w-full min-h-screen flex sm:items-start md:items-center justify-center bg-zinc-50 md:px-4">
      {!loading ? <form onSubmit={handleSubmit} className="w-full max-w-5xl bg-white md:border h-[88vh] sm:h-[83.5vh] rounded-2xl shadow-sm flex flex-col md:flex-row overflow-hidden">
        <label className="w-full md:w-1/2 h-[300px] md:h-[460px] flex items-center justify-center cursor-pointer bg-zinc-100 border-b md:border-b-0 md:border-r">
          {!imagePreview ? (
            <span className="text-zinc-400 text-center text-sm">
              Click to upload image
              {errors.image && (<p className="text-red-500 text-xs">{errors.image}</p>)}
            </span>
          ) : (<img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />)}

          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        </label>

        <div className="w-full md:w-1/2 p-6 flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-zinc-800">Create Post</h2>

          <div className="flex flex-col">
            <input type="text" placeholder="Write a caption..." value={caption} onChange={(e) => setCaption(e.target.value)} className={`px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-sky-400
              ${errors.caption ? "bg-red-100 border-red-400" : "bg-zinc-100 border-zinc-300"}`} />
            {errors.caption && (<p className="text-red-500 text-xs">{errors.caption}</p>)}
          </div>

          <div className="flex flex-col">
            <textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} className={`px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-sky-400
              ${errors.description ? "bg-red-100 border-red-400" : "bg-zinc-100 border-zinc-300"}`} />
            {errors.description && (<p className="text-red-500 text-xs">{errors.description}</p>)}
          </div>

          <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-dashed border-sky-300 bg-sky-50">
            <div>
              <p className="text-sm font-medium text-sky-700 overflow-hidden w-30vh truncate">
                {song ? song.name : "Add music (optional)"}
              </p>
              <p className="text-xs text-sky-500">MP3 / WAV</p>
            </div>

            <label className="text-xs text-sky-600 font-semibold cursor-pointer">
              Browse
              <input type="file" accept="audio/*" onChange={handleSongChange} className="hidden" />
            </label>
          </div>

          {errors.song && (
            <p className="text-red-500 text-xs">{errors.song}</p>
          )}

          <label className="flex items-center gap-2 text-sm text-zinc-600">
            <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="accent-sky-500" />
            Private post
          </label>

          {errors.submit && (
            <p className="text-red-500 text-xs">{errors.submit}</p>
          )}

          <button type="submit" disabled={loading} className="mt-2 bg-sky-500 hover:bg-sky-600 text-white py-2.5 rounded-lg font-semibold transition disabled:opacity-50">
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </form> : <DotSpinner size="3rem" color="#000000" />}
    </div>
  );
}