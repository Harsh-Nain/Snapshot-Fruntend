import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { TimeAgo } from "../components/agotime";
import DotSpinner from "../components/dot-spinner-anim";
import { FiEdit, FiMessageCircle, FiMoreHorizontal, FiTrash2, FiX, FiLogOut, FiHeart, FiImage } from "react-icons/fi";
import { MdErrorOutline, MdOutlineDoneOutline } from "react-icons/md";

export default function Profile() {
  const API_URL = import.meta.env.VITE_BACKEND_API_URL

  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [userPost, setUserPost] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [Post, setPost] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [postOption, setPostOption] = useState(false);
  const [Postloading, setPostloading] = useState(true);
  const [Comments, setComments] = useState([]);
  const [EditProfile, setEditProfile] = useState(false);
  const [CommentsPostId, setCommentsPostId] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [folowdata, setfolowdata] = useState([]);
  const [suggession, setsuggession] = useState([]);
  const [likeLoading, setLikeLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [followModalOpen, setFollowModalOpen] = useState(false);
  const [followType, setFollowType] = useState("followers");
  const [followLoadingId, setFollowLoadingId] = useState(null);
  const [alert, setAlert] = useState(null);

  const { register: registeComment, handleSubmit: submitComment, reset: resetComment, formState: { errors: errorsComment, isSubmitting: isSubmittingComment } } = useForm({
    defaultValues: { First_name: "", Email: "", bio: "", }
  });

  const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit, setValue, formState: { errors: errorsEdit, isSubmitting: isSubmittingEdit }, } = useForm({
    defaultValues: { First_name: "", Email: "", bio: "", image: null, },
  });

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  useEffect(() => {
    if (EditProfile && data) {
      resetEdit({
        First_name: data.First_name || "",
        Email: data.Email || "",
        bio: data.bio || "",
      });
    }
  }, [EditProfile, data, resetEdit]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed");
      return;
    }

    setValue("image", file);
    setImagePreview(URL.createObjectURL(file));
  };

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true)
      setTimeout(() => {
        setAlert({ message: "Your profile data will loaded...", success: "Profile data loaded" })
      }, 200);

      const res = await fetch(`${API_URL}/api/profile`, {
        method: "GET",
        credentials: "include",
      });

      const result = await res.json();
      console.log(result);
      setAlert(null)
      setLoading(false)
      setData(result.data);
      setUserPost(result.userPost || []);
      setFollowers(result.follower || []);
      setFollowing(result.following || []);
      setPostloading(false)
    };

    loadProfile();
  }, [navigate]);

  const showImage = async (postId) => {
    setPostloading(true)
    const res = await fetch(`${API_URL}/api/post/onePost`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ postId }),
    });

    const com = await fetch(`${API_URL}/api/post/postcomment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ postId }),
    });

    const comm = await com.json();
    const data = await res.json();
    setPostloading(false)
    if (!comm.success) return;
    setComments(comm.comments);
    setCommentsPostId(postId)
    setPost(data)
  }

  const handleLike = async (Id) => {
    if (likeLoading) return;

    setLikeLoading(true);

    const res = await fetch(`${API_URL}/api/post/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ postid: Id }),
    });

    const data = await res.json();

    if (data.success) {
      setPost(prev => ({
        ...prev,
        isLike: !prev.isLike,
        totalLikes: data.totalLikes
      }));
    }

    setLikeLoading(false);
  };

  const handleEditProfile = async (formData) => {
    const fd = new FormData();
    setLoading(true)

    fd.append("First_name", formData.First_name);
    fd.append("Email", formData.Email);
    fd.append("bio", formData.bio);

    if (formData.image) {
      fd.append("image", formData.image);
    }

    const res = await fetch(`${API_URL}/api/auth/updateUser`, {
      method: "POST",
      credentials: "include",
      body: fd,
    });

    const result = await res.json();

    if (result.success) {
      setData(result.data[0])
      setEditProfile(false);
      setLoading(false)
      return
    }
    resetEdit()
  };

  const handleSubmitComment = async (d) => {
    setCommentLoading(true)

    const res = await fetch(`${API_URL}/api/post/CreateComment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        postId: CommentsPostId,
        Comment: d.newComment,
      }),
    });

    const data = await res.json();
    console.log("Response:", data);

    if (data.success) {
      setCommentLoading(false)
      setComments((prev) => [data.comment, ...prev]);
      resetComment();
    }
  };

  const EditPost = () => {
    navigate(`/post/edit?username=${data.Username}&id=${CommentsPostId}`)
  };

  const remove = async (requestId, path) => {
    setFollowLoadingId(requestId)
    const res = await fetch(`${API_URL}/api/follow/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ requestId }),
    });

    const result = await res.json();
    if (result.success) {
      setfolowdata(prev => {
        const movedUser = prev.find(u => u.Id === requestId);
        if (!movedUser) return prev;
        setFollowers(f => f.filter(f => f.Id !== movedUser.Id))

        setsuggession(sPrev =>
          [movedUser, ...sPrev.filter(u => u.Id !== requestId)]
        );
        return (prev.filter(u => u.Id !== requestId));
      });
    }
    setFollowLoadingId(null)

  }

  const handleDelet = async () => {
    setDeleteLoading(true);

    const res = await fetch(`${API_URL}/api/post/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id: deleteConfirmOpen }),
    });

    await res.json();

    setUserPost(prev => prev.filter(post => post.Id !== Post.Id));
    setPost(null);
    setDeleteConfirmOpen(false);
    setDeleteLoading(false);
  };

  const FollowData = async (Id, which) => {
    setFollowType(which);
    setFollowModalOpen(true);
    setLoading(true);

    const res = await fetch(`${API_URL}/api/follow/getfollowData`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ Id, which }),
    });

    const result = await res.json();

    if (result.Success) {
      setfolowdata(result.data);
      setsuggession(result.suggession);
    }

    setLoading(false);
  };

  const otherUser = (userId, username) => {
    if (userId == user.Id) return navigate('/api/profile')
    navigate(`/user?username=${username}&Id=${userId}`);
  };

  const addMessage = async (toMessId) => {

    const res = await fetch(`${API_URL}/api/message/message?toMessId=${toMessId}`, {
      method: "GET",
      credentials: "include",
    });

    const result = await res.json();
    if (result.success) {
      navigate(result.redirect)
    }
  }

  const follow = async (requestId, path) => {

    const res = await fetch(`${API_URL}/api/follow/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ requestId }),
    });

    const result = await res.json();
    if (result.success) {

      setsuggession(prev => {
        const movedUser = prev.find(u => u.Id === requestId);
        if (!movedUser) return prev;
        setfolowdata(sPrev => [movedUser, ...sPrev.filter(u => u.Id !== requestId)]);
        setFollowers(sPrev =>
          [movedUser, ...sPrev.filter(u => u.Id !== requestId)]
        );

        return (prev.filter(u => u.Id !== requestId));
      });
      if (path == "following") {
        setfolowdata((prev) => [result.data, ...prev]);
      }
    }
  }

  const Logout = async () => {
    const res = await fetch(`${API_URL}/api/logout`, {
      method: "GET",
      credentials: "include",
    });

    const result = await res.json();
    navigate(result.redirect);
  };

  return (
    <main className="flex-1 flex justify-center sm:px-6 bg-[#fafafa] min-h-screen w-full">

      <div class={`fixed z-9999999999 flex w-3/4 h-17 overflow-hidden top-7 ${!alert && "translate-x-120"}  transition duration-300 ease-in-out right-9 bg-white shadow-lg max-w-96 rounded-xl`}>
        {alert && <> <svg xmlns="http://www.w3.org/2000/svg" height="96" width="16"><path stroke-linecap="round" stroke-width="2" stroke={alert.err ? "indianred" : "lightgreen"} fill={alert.err ? "indianred" : "lightgreen"} d="M 8 0 Q 4 4.8, 8 9.6 T 8 19.2 Q 4 24, 8 28.8 T 8 38.4 Q 4 43.2, 8 48 T 8 57.6 Q 4 62.4, 8 67.2 T 8 76.8 Q 4 81.6, 8 86.4 T 8 96 L 0 96 L 0 0 Z"    ></path> </svg>

          <div class="mx-2.5 overflow-hidden w-full">
            {alert.err && <p class="mt-1.5 text-xl flex items-center gap-2 font-bold text-[indianred] leading-8 mr-3 overflow-hidden text-ellipsis whitespace-nowrap">{alert.err} <MdErrorOutline color="red" /></p>}
            {alert.success && <p class="flex items-center gap-2 mt-1.5 text-xl font-bold text-green-400 leading-8 mr-3 overflow-hidden text-ellipsis whitespace-nowrap">{alert.success}<MdOutlineDoneOutline color="lightgreen" /></p>}
            <p class="overflow-hidden leading-5 break-all text-zinc-400 max-h-10">{alert.message} </p>
          </div>

          <button onClick={() => setAlert(null)} class="w-16 cursor-pointer focus:outline-none">
            <svg class="w-7 h-7" fill="none" stroke="indianred" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button></>}
      </div>

      {Postloading && (
        <div className="flex justify-center items-center fixed top-0 left-0 h-[100vh] w-[100vw] bg-black/70 z-9999">
          <DotSpinner size="3rem" color="white" />
        </div>
      )}

      <div className="w-full max-w-5xl bg-white rounded-xl px-2 sm:px-4 py-6 flex flex-col gap-8">

        <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 items-center sm:items-start">

          <div className="relative w-28 h-28 sm:w-36 sm:h-36 group">
            <div className="absolute inset-0 rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
              <div className="w-full h-full bg-white rounded-full p-[3px]">
                <img src={data?.image_src} className="w-full h-full rounded-full object-cover transition-transform duration-300 group-hover:scale-105" />
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-4 items-center sm:items-start text-center sm:text-left">

            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <h2 className="text-lg sm:text-xl font-semibold">
                {data?.Username}
              </h2>

              <div className="flex gap-2">
                <button onClick={() => setEditProfile(true)} className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md">
                  <FiEdit size={14} />
                  Edit
                </button>

                <button onClick={() => addMessage(data?.Id)} className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md">
                  <FiMessageCircle size={14} />
                  Message
                </button>
                <button onClick={Logout} className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-600 hover:bg-red-200 rounded-md">
                  <FiLogOut size={14} />
                  Logout
                </button>
              </div>
            </div>

            <div className="flex gap-6 text-sm">
              <span><b>{userPost.length}</b> posts</span>

              <span onClick={() => FollowData(data.Id, "following")} className="cursor-pointer hover:underline">

                <b>{following.length}</b> followers
              </span>

              <span onClick={() => FollowData(data.Id, "followers")} className="cursor-pointer hover:underline">
                <b>{followers.length}</b> following
              </span>
            </div>

            <div>
              <p className="font-medium">{data?.First_name}</p>
              <p className="text-sm text-gray-600 break-words">
                {data?.bio}
              </p>
            </div>

          </div>
        </div>

        <div className="grid grid-cols-3 gap-[2px] sm:gap-1 border-t pt-4">

          {userPost.map((post) => (
            <div key={post.Id} className="relative group cursor-pointer" onClick={() => showImage(post.Id)} style={{ aspectRatio: "1 / 1" }}>
              <img src={post.image_url} alt="post" className="w-full bg-sky-100 h-full object-cover" />

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm font-semibold transition">
                <FiHeart className="mr-2" />
                {post.totalLikes}
              </div>
            </div>
          ))}
        </div>

        {userPost.length === 0 && (
          <div className="flex flex-col items-center w-full justify-center py-20 text-center">

            <div className="w-20 h-20 flex items-center justify-center rounded-full border-2 border-gray-300 mb-4">
              <FiImage size={36} className="text-gray-400" />
            </div>

            <h3 className="text-lg font-semibold text-gray-800">
              No Posts Yet
            </h3>

            <p className="text-sm text-gray-500 mt-2 max-w-xs">
              When {data?.Username || "this user"} shares photos or videos,
              they’ll appear here.
            </p>

          </div>
        )}
      </div>

      {Post && (
        <div className="fixed z-9999999 inset-0 bg-black/70 flex justify-center items-baseline sm:items-center z-50 sm:p-2 sm:p-6">

          <div className="bg-white flex flex-col md:flex-row w-full max-w-5xl h-[100vh] md:h-[85vh] sm:rounded-lg overflow-hidden relative">

            <div className="w-full md:w-1/2 bg-black flex justify-center items-center h-[45vh] sm:h-full sm:max-h-[30vh] md:max-h-full">
              <img src={Post.image_url} alt="" className="w-full h-full object-contain" />
            </div>

            <div className="w-full md:w-1/2 flex flex-col relative h-[50vh] sm:h-full">

              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div className="flex items-center gap-3">
                  <img src={Post.image_src} className="w-8 h-8 bg-sky-100 rounded-full object-cover" />
                  <p className="font-semibold text-sm">{Post.username}</p>
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={() => setPostOption(!postOption)}>
                    <FiMoreHorizontal size={20} />
                  </button>
                  <button onClick={() => {
                    setPost(null)
                    setPostOption(false)
                  }}>
                    <FiX size={22} />
                  </button>
                </div>
              </div>

              {postOption && (
                <div className="absolute top-14 right-4 bg-white border shadow-md rounded-lg w-44 text-sm z-50">
                  <button onClick={EditPost} className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 w-full">
                    <FiEdit size={15} /> Edit
                  </button>

                  <button onClick={() => { setPostOption(null); setDeleteConfirmOpen(Post.Id); }} className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 text-red-500 w-full">
                    <FiTrash2 size={15} /> {deleteLoading ? <DotSpinner size="1rem" color="white" /> : "Delete"}
                  </button>

                  <button onClick={() => {
                    navigator.clipboard.writeText(Post.image_url);
                    setPostOption(false);
                  }} className="px-4 py-3 hover:bg-gray-100 w-full text-left">
                    Copy link
                  </button>
                </div>
              )}

              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 text-sm">
                {Comments.map((comment) => (
                  <div key={comment.Id} className="flex gap-3">
                    <img src={comment.image_src} className="w-7 h-7 bg-sky-100 rounded-full object-cover" />
                    <div>
                      <span className="font-semibold text-sm">
                        {comment.username}
                      </span>
                      <p className="text-gray-700 text-sm">
                        {comment.content}
                      </p>
                      <span className="text-xs text-gray-400">
                        {TimeAgo(comment.created_at)}
                      </span>
                    </div>
                  </div>
                ))}

                {Comments.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">

                    <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 mb-4">
                      <FiMessageCircle size={28} className="text-gray-400" />
                    </div>

                    <h3 className="text-base font-semibold text-gray-800">
                      Start the conversation
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      Share your thoughts about this post.
                    </p>

                  </div>
                )}
              </div>

              <div className="border-t px-4 py-3 flex flex-col gap-2 h-[4rem]">

                <div className="flex items-center gap-4">
                  <button onClick={() => handleLike(Post.Id)} disabled={likeLoading}>
                    {likeLoading ? (
                      <DotSpinner size="1rem" color="red" />
                    ) : (
                      <FiHeart
                        size={22}
                        className={`${Post.isLike ? "text-red-500 fill-red-500" : "text-black"}`}
                      />
                    )}
                  </button>
                </div>

                <span className="text-sm font-semibold">
                  {Post.totalLikes} likes
                </span>
              </div>

              <form onSubmit={submitComment(handleSubmitComment)} className="border-t px-4 py-3 flex items-center gap-3">

                <input type="text" placeholder="Add a comment..." className="flex-1 outline-none text-sm"  {...registeComment("newComment", { required: "Comment required", minLength: { value: 2, message: "Too short" } })} />

                <button type="submit" disabled={commentLoading} className="text-blue-500 font-semibold text-sm">
                  {commentLoading ? (<div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>) : ("Post")}
                </button>

              </form>

            </div>
          </div>
        </div>
      )}

      {EditProfile && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 px-3">

          <form onSubmit={handleSubmitEdit(handleEditProfile)} className="bg-white w-full max-w-md rounded-2xl p-6 relative shadow-xl">

            <button type="button" onClick={() => setEditProfile(false)} className="absolute top-4 right-4">
              <FiX size={20} />
            </button>

            <h2 className="text-lg font-semibold mb-6 text-center">
              Edit Profile
            </h2>

            <div className="flex flex-row items-center gap-3 mb-6">

              <div className="relative w-25 h-25">
                <div className="absolute inset-0 rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
                  <img src={imagePreview || data?.image_src} alt="profile" className="w-full h-full rounded-full object-cover transition-transform duration-300" />
                </div>
              </div>

              <div className="flex flex-col">
                <p className="font-semibold">{data?.Username}</p>

                <label className="text-blue-500 text-sm cursor-pointer flex items-center gap-2">
                  <FiImage size={16} />
                  Change Photo
                  <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                </label>
              </div>
            </div>

            <div className="space-y-4">

              <div>
                <label className="text-sm text-gray-600">Full Name</label>
                <input type="text"  {...registerEdit("First_name")} className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300" />
              </div>

              <div>
                <label className="text-sm text-gray-600">Email</label>
                <input type="email"  {...registerEdit("Email")} className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300" />
              </div>

              <div>
                <label className="text-sm text-gray-600">Bio</label>
                <textarea rows={3}  {...registerEdit("bio")} className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300" />
                <p className="text-xs text-gray-400 text-right">
                  Max 100 characters
                </p>
              </div>

            </div>

            <div className="flex justify-end gap-3 mt-6">

              <button type="button" onClick={() => setEditProfile(false)} className="px-4 py-1 border rounded-md text-sm">
                Cancel
              </button>

              <button type="submit" disabled={loading} className="px-5 py-1 bg-blue-500 text-white rounded-md text-sm font-semibold flex items-center gap-2">
                {loading ? (<div className="w-4 h-4 border-2 border-blue-300 border-t-white rounded-full animate-spin"></div>) : ("Save")}
              </button>

            </div>

          </form>
        </div>
      )}

      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 z-99999999999999">
          <div className="bg-white w-full max-w-sm rounded-xl p-6 text-center shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Delete Post?</h2>
            <p className="text-sm text-gray-500 mb-6">
              You are conferm to delete post.
            </p>

            <div className="flex justify-center gap-4">
              <button onClick={() => setDeleteConfirmOpen(false)} className="px-4 py-1 border rounded-md text-sm">
                Cancel
              </button>

              <button onClick={handleDelet} className="px-5 py-1 bg-red-500 text-white rounded-md text-sm font-semibold">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {followModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 sm:px-3">

          <div className="bg-white w-full max-w-md h-[90vh] sm:h-[80vh] rounded-xl overflow-hidden flex flex-col shadow-lg">

            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="font-semibold text-base">
                {followType !== "followers" ? "Followers" : "Following"}
              </h2>

              <button onClick={() => { setFollowModalOpen(false); setfolowdata([]); setsuggession([]); }}>
                <FiX size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">

              {folowdata.length === 0 ? (<p className="text-center text-gray-400 py-8 text-sm">No users found </p>) : (

                folowdata.map((user) => (
                  <div key={user.Id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"  >

                    <div onClick={() => otherUser(user.Id, user.Username)} className="flex items-center gap-3 cursor-pointer"    >
                      <img src={user.image_src} className="w-10 h-10 bg-sky-100  rounded-full object-cover" />
                      <div>
                        <p className="text-sm font-semibold">
                          {user.Username}
                        </p>
                        <p className="text-xs text-gray-500">
                          {user.First_name}
                        </p>
                      </div>
                    </div>

                    <button onClick={() => remove(user.Id, followType !== "followers" ? "remove" : "unfollow")} disabled={followLoadingId === user.Id} className={`px-3 py-1 text-xs rounded-md font-medium ${followType === "followers" ? "bg-gray-200 hover:bg-gray-300" : "bg-gray-200 hover:bg-gray-300"}`}>
                      {followLoadingId === user.Id ? (<div className="w-4 h-4 border-2 border-gray-400 border-t-black rounded-full animate-spin"></div>) : followType !== "followers" ? ("Remove") : ("Following")}
                    </button>

                  </div>
                ))
              )}

              {suggession && suggession.length > 0 && (
                <>
                  <div className="px-4 pt-6 pb-2 text-sm font-semibold text-gray-500">
                    Suggestions for you
                  </div>

                  {suggession.map((user) => (
                    <div key={user.Id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">

                      <div onClick={() => otherUser(user.Id, user.Username)} className="flex items-center gap-3 cursor-pointer">
                        <img src={user.image_src} className="w-10 h-10 bg-sky-100 rounded-full object-cover" />
                        <div>
                          <p className="text-sm font-semibold">
                            {user.Username}
                          </p>
                          <p className="text-xs text-gray-500">
                            {user.First_name}
                          </p>
                        </div>
                      </div>

                      <button onClick={() => follow(user.Id)} disabled={followLoadingId === user.Id} className="px-3 py-1 text-xs rounded-md bg-blue-500 text-white hover:bg-blue-600">
                        {followLoadingId === user.Id ? (<div className="w-4 h-4 border-2 border-blue-300 border-t-white rounded-full animate-spin"></div>) : ("Follow")}
                      </button>

                    </div>
                  ))}
                </>
              )}

            </div>

          </div>
        </div>
      )}
    </main>
  );


}