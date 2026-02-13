import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiImage, FiMusic, FiLock, FiUpload, FiX, FiSearch } from "react-icons/fi";
import DotSpinner from "../components/dot-spinner-anim";

export default function CreatePost() {
  const API_URL = import.meta.env.VITE_BACKEND_API_URL;
  const navigate = useNavigate();
  const audioRef = useRef(null);

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [song, setSong] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [musicTab, setMusicTab] = useState("upload");
  const [openMusic, setOpenMusic] = useState(false);
  const [musicUrlInput, setMusicUrlInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlineResults, setOnlineResults] = useState([]);

  const [caption, setCaption] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/"))
      return setErrors({ image: "Only image files allowed" });

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors({});
  };

  const handleSongChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setSong(file);
    setAudioUrl(url);
    setOpenMusic(false);
  };

  const handleUrlMusic = () => {
    if (!musicUrlInput.trim()) return;
    setAudioUrl(musicUrlInput);
    setSong(null);
    setOpenMusic(false);
  };

  const searchMusicOnline = () => {
    const demoResults = [
      {
        id: 1,
        title: "Chill Beat",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      },
      {
        id: 2,
        title: "Pop Vibes",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      },
    ];

    setOnlineResults(demoResults);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) return setErrors({ image: "Image is required" });
    if (caption.length < 3)
      return setErrors({ caption: "Caption must be at least 3 characters" });

    const formData = new FormData();
    formData.append("post", image);
    formData.append("postname", caption);
    formData.append("discription", description);
    formData.append("isPrivate", isPrivate);

    if (song) formData.append("song", song);

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/post/post`, { method: "POST", credentials: "include", body: formData, });

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
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [imagePreview, audioUrl]);

  return (
    <div className="w-full min-h-screen bg-[#fafafa] flex items-baseline ms:items-center justify-center ms:px-4 ms:py-10 z-9999">


      <div className="absolute inset-0 w-[fit-content] h-[fit-content] right-0 sm:hidden z-9999999"><FiX onClick={() => navigate("/")} size="2rem" /></div>

      {loading && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <DotSpinner size="3rem" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full max-w-6xl bg-white sm:rounded-3xl shadow-xl border flex flex-col lg:flex-row overflow-hidden">
        <label className="w-full lg:w-1/2 h-[40vh] sm:h-full aspect-square bg-gray-100 flex items-center justify-center cursor-pointer relative group">

          {!imagePreview ? (
            <div className="text-center text-gray-400 group-hover:text-gray-600 transition">
              <FiImage size={40} className="mx-auto mb-4" />
              <p className="text-sm">Upload Image</p>
              {errors.image && (
                <p className="text-red-500 text-xs mt-2">{errors.image}</p>
              )}
            </div>
          ) : (
            <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
          )}

          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        </label>

        <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col gap-4 sm:gap-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-sky-500 to-yellow-500 bg-clip-text text-transparent">Create Post</h2>

          <input type="text" placeholder="Write a caption..." value={caption} onChange={(e) => setCaption(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-red-400 focus:border-yellow-400 outline-none" />
          <textarea rows={3} placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-red-400 border focus:border-yellow-400 outline-none" />
          <button type="button" onClick={() => setOpenMusic(true)} className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-gradient-to-r from-pink-500 to-yellow-500 text-white font-semibold">
            <FiMusic /> Add Music
          </button>

          {audioUrl && (<div className="bg-gray-100 p-4 rounded-xl">  <audio ref={audioRef} src={audioUrl} controls className="w-full" />  <button type="button" onClick={() => setAudioUrl(null)} className="text-red-500 text-xs mt-2"  >    Remove Music   </button></div>)}

          <label className="flex items-center gap-3 text-sm text-gray-700">
            <FiLock />
            <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="accent-pink-500" />
            Make this post private
          </label>

          {errors.submit && (<p className="text-red-500 text-sm">{errors.submit}</p>)}

          <button type="submit" className="py-3 rounded-full font-semibold text-white bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:opacity-90 transition">
            Share Post
          </button>

        </div>
      </form>

      {openMusic && (
        <div className="fixed inset-0 bg-black/60 w-full h-[100vh] flex items-center justify-center z-50 px-4 z-9999999999">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 space-y-6 relative">

            <button onClick={() => setOpenMusic(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black">
              <FiX />
            </button>

            <h3 className="text-xl font-bold text-center">Add Music</h3>

            <div className="flex justify-center gap-3 text-sm">
              {["upload", "url", "search"].map((tab) => (
                <button key={tab} onClick={() => setMusicTab(tab)} className={`px-4 py-1 rounded-full ${musicTab === tab ? "bg-gradient-to-r from-pink-500 to-yellow-500 text-white" : "bg-gray-100"}`}>
                  {tab}
                </button>
              ))}
            </div>

            {musicTab === "upload" && (
              <label className="block text-center cursor-pointer border border-dashed p-4 rounded-xl bg-gray-50">
                <FiUpload size={24} className="mx-auto mb-2 text-pink-500" />
                Upload from device
                <input type="file" accept="audio/*" onChange={handleSongChange} className="hidden" />
              </label>
            )}

            {musicTab === "url" && (
              <div className="space-y-3">
                <input type="text" placeholder="Paste music URL..." value={musicUrlInput} onChange={(e) => setMusicUrlInput(e.target.value)} className="w-full px-4 py-2 rounded-xl bg-gray-100 border" />
                <button onClick={handleUrlMusic} className="w-full py-2 rounded-full bg-gradient-to-r from-pink-500 to-yellow-500 text-white">
                  Add Music
                </button>
              </div>
            )}

            {musicTab === "search" && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input type="text" placeholder="Search music..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 px-4 py-2 rounded-xl bg-gray-100 border" />
                  <button onClick={searchMusicOnline} className="px-4 py-2 bg-pink-500 text-white rounded-xl">
                    <FiSearch />
                  </button>
                </div>

                <div className="max-h-40 overflow-y-auto">
                  {onlineResults.map((track) => (
                    <div key={track.id} className="flex justify-between items-center p-2 hover:bg-gray-100 rounded-xl">
                      <span>{track.title}</span>
                      <button onClick={() => { setAudioUrl(track.url); setOpenMusic(false); }} className="text-pink-500 text-sm">
                        Use
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}