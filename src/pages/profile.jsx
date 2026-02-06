import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { TimeAgo } from "../components/agotime";
import DotSpinner from "../components/dot-spinner-anim";

export default function Profile() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [userPost, setUserPost] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [Post, setPost] = useState();
  const [PostOption, setPostOption] = useState(false);
  const [Postloading, setPostloading] = useState(true);
  const [Comments, setComments] = useState([]);
  const [Likeing, setLikeing] = useState(false);
  const [EditProfile, setEditProfile] = useState(false);
  const [CommentsPostId, setCommentsPostId] = useState();
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [folShow, setfolShow] = useState(false);
  const [folowdata, setfolowdata] = useState([]);
  const [suggession, setsuggession] = useState([]);
  const [isunfollow, setisunfollow] = useState(false);

  const { register: registeComment, handleSubmit: submitComment, reset: resetComment, formState: { errors: errorsComment, isSubmitting: isSubmittingComment } } = useForm({
    defaultValues: { First_name: "", Email: "", bio: "", }
  });

  const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit, setValue, formState: { errors: errorsEdit, isSubmitting: isSubmittingEdit }, } = useForm({
    defaultValues: { First_name: "", Email: "", bio: "", image: null, },
  });

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
      const res = await fetch("https://snapshot-backend0-2.onrender.com/api/profile", {
        credentials: "include",
      });

      if (!res.ok) {
        navigate("/api/auth/login");
        return;
      }

      const result = await res.json();
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
    const res = await fetch("https://snapshot-backend0-2.onrender.com/api/post/onePost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ postId }),
    });

    const com = await fetch("https://snapshot-backend0-2.onrender.com/api/post/postcomment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ postId }),
    });

    const comm = await com.json();
    const data = await res.json();
    if (!comm.success) return;
    setComments(comm.comments);
    setCommentsPostId(postId)
    setPost(data)
  }

  const handleLike = async (Id) => {
    setLikeing(true)
    const res = await fetch("https://snapshot-backend0-2.onrender.com/api/post/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ postid: Id }),
    });

    const data = await res.json();
    console.log("Liked data:", data);

    if (!data.success) return;
    setLikeing(false)
    Post.isLike = !Post.isLike
    Post.totalLikes = data.totalLikes
    setPost(Post);
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

    const res = await fetch("https://snapshot-backend0-2.onrender.com/api/auth/updateUser", {
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

    const res = await fetch("https://snapshot-backend0-2.onrender.com/api/post/CreateComment", {
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

    if (!res.ok) {
      const errorText = await res.json();
      console.error("Server error:", errorText);
      return;
    }

    const data = await res.json();
    console.log("Response:", data);

    if (data.success) {
      setComments((prev) => [data.comment, ...prev]);
      resetComment();
    }
  };

  const EditPost = () => {
    navigate(`/post/edit?username=${data.Username}&id=${CommentsPostId}`)
  };

  const remove = async (requestId, path) => {

    const res = await fetch(`https://snapshot-backend0-2.onrender.com/api/follow/${path}`, {
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

  }

  const DltPost = async () => {
    setPostOption(!PostOption)
    setPost(!Post)
    const res = await fetch("https://snapshot-backend0-2.onrender.com/api/post/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ id: CommentsPostId }),
    });

    if (!res.ok) {
      const errorText = await res.json();
      console.error("Server error:", errorText);
      return;
    }
    console.log('dltted');
    setUserPost(prev =>
      prev.filter(post => post.Id !== CommentsPostId)
    );
    setPost(null);
    setPostloading(false);
    setPostOption(false);
    setComments([]);
    setCommentsPostId(null);
    setPostloading(!Postloading)
  }

  const FollowData = async (Id, which) => {
    setLoading(true)
    if (which == "following") {
      setisunfollow(true)
    } else {
      setisunfollow(false)
    }

    const res = await fetch("https://snapshot-backend0-2.onrender.com/api/follow/getfollowData", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ Id, which }),
    })
    const result = await res.json()
    if (result.Success) {
      setfolShow(!folShow)
      setfolowdata(result.data)
      setsuggession(result.suggession)
    }
  }

  const otherUser = (userId, username) => {
    navigate(`/user?username=${username}&Id=${userId}`);
  };

  const addMessage = async (toMessId) => {

    const res = await fetch(`https://snapshot-backend0-2.onrender.com/api/message/message?toMessId=${toMessId}`, {
      credentials: "include",
    });

    const result = await res.json();
    if (result.success) {
      navigate(result.redirect)
    }
  }

  const follow = async (requestId, path) => {

    const res = await fetch(`https://snapshot-backend0-2.onrender.com/api/follow/request`, {
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
    const res = await fetch("https://snapshot-backend0-2.onrender.com/api/logout", {
      method: "GET",
      credentials: "include",
    });

    const result = await res.json();
    navigate(result.redirect);
  };

  return (
    <main className="flex-1 flex justify-center px-2 overflow-y-auto h-screen">
      <button onClick={() => Logout()} className="fixed right-1 top-2 text-2xl text-black a font-semibold">📤
      </button>
      {loading && <div className="fixed b-0 md:inset-0 h-[100vh] w-[100vw] bg-black/40 flex justify-center items-center z-90"><DotSpinner size="3.5rem" color="#000000" /></div>}
      <div className="w-[100vw] max-w-5xl bg-white rounded-xl md:px-4 py-4 flex flex-col gap-6">

        <div className="flex flex-col sm:flex-row gap-10 items-center sm:items-start">

          <div className="w-32 h-32">
            <img src={data?.image_src} alt="" className="w-full h-full rounded-full object-cover" />
          </div>

          <div className="flex-1 flex flex-col gap-2 items-center sm:items-start">
            <p className="font-semibold text-lg">
              {data?.Username}
            </p>

            <p className="text-xs text-gray-500">
              {data?.First_name}
            </p>

            <div className="flex gap-4 text-sm text-gray-700">
              <span><b>{userPost.length}</b> posts</span>
              <span onClick={() => FollowData(data.Id, "following")}><b>{following.length}</b> followers</span>
              <span onClick={() => FollowData(data.Id, "followers")}><b>{followers.length}</b> following</span>
            </div>

            <p className="text-xs text-gray-500">
              {data?.bio}
            </p>

            <div className="flex gap-3">
              <button onClick={() => setEditProfile(!EditProfile)} className="px-4 py-1 text-sm border rounded-lg bg-zinc-100">Edit Profile</button>
              <button onClick={() => addMessage(data?.Id)} className="px-4 py-1 text-sm border rounded-lg bg-zinc-100">Message</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 border-t pt-4">
          {userPost.map((post) => (
            <div key={post.Id} className="cursor-pointer" onClick={() => showImage(post.Id)} style={{ aspectRatio: "1 / 1" }}>
              <img src={post.image_url} alt="post" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      {EditProfile && <div className="fixed b-0 md:inset-0 bg-black/40 flex justify-center items-center z-90">

        <form onSubmit={handleSubmitEdit(handleEditProfile)} className="bg-white md:rounded-2xl shadow-xl p-5 h-[100vh] md:w-[60%] w-[100vw] md:h-[90vh]" >
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Edit Profile
          </h2>

          <div className="flex items-center gap-4 mb-5">
            <img src={imagePreview || data?.image_src} className="w-16 h-16 rounded-full border object-cover" />

            <div className="flex items-center gap-4 mb-5">
              <div>
                <p className="font-semibold">{data?.Username}</p>

                <label className="text-blue-500 cursor-pointer text-sm">
                  Change Profile Photo
                  <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                </label>

                {errorsEdit.image && (<p className="text-red-500 text-xs ">{errorsEdit.image.message}</p>)}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 mb-1">Full Name</p>
              <input type="text" {...registerEdit("First_name", { required: "Fullname is required", minLength: { value: 3, message: "Minimum 3 characters" }, maxLength: { value: 10, message: "Maximum 10 characters" }, })} className="w-full border rounded-lg px-3 py-2 outline-blue-400" />
              {errorsEdit.First_name && (<p className="text-red-500 text-xs ">{errorsEdit.First_name.message}</p>)}
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Email</p>
              <input type="email" {...registerEdit("Email", { required: "Email is required", pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email address", }, })} className="w-full border rounded-lg px-3 py-2 outline-blue-400" />
              {errorsEdit.Email && (<p className="text-red-500 text-xs ">{errorsEdit.Email.message}</p>)}
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Bio</p>
              <textarea {...registerEdit("bio", { maxLength: { value: 50, message: "Bio must not exceed 50 characters", }, })} rows={3} placeholder="Write about yourself..." className="w-full border rounded-lg px-3 py-2 outline-blue-400" />
              {errorsEdit.bio && (<p className="text-red-500 text-xs ">{errorsEdit.bio.message}</p>)}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-5">
            <button type="button" onClick={() => setEditProfile(false)} className="px-4 py-1 rounded-lg border">Cancel</button>
            <button type="submit" disabled={isSubmittingEdit} className="px-5 py-1 bg-blue-500 text-white font-semibold rounded-lg">{isSubmittingEdit ? "Saving..." : "Save"}</button>
          </div>
        </form>

      </div>}

      {Postloading &&
        <div className="fixed top-0 left-0 bg-[#00000087] flex justify-center items-center w-[100vw] h-[100vh]">
          {Post ? <div className="bg-white shadow-xl flex justify-start items-center sm:w-[100vw] md:w-[70%] h-[100vh] sm:h-[80vh] sm:max-w-5xl flex flex-col md:flex-row overflow-hidden">
            <div className="w-[100vw] h-[50vh] md:w-1/2 bg-black flex items-center justify-center md:max-h-[100vh] bg-black">
              <img src={Post.image_url} alt="Post Not Found..." className="w-[100vw] max-h-[50vh] md:max-h-[100vh] object-contain" />
            </div>

            <p onClick={() => { setPost(), setPostloading() }} className="absolute top-5 right-7 cursor-pointer"><i className="fa-solid fa-xmark fa-2xl text-red-500"></i></p>

            <div className="w-[100vw] md:w-1/2 flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-white z-10">
                <div className="flex items-center gap-3">
                  <img src={Post.image_src} className="w-8 h-8 rounded-full object-cover" />
                  <p className="font-semibold text-sm truncate max-w-[160px]">{Post.username}</p>
                </div>
                <button onClick={() => setPostOption(true)} className="text-2xl leading-none">⋯</button>
              </div>

              <div className="overflow-y-scroll h-[20vh] md:h-[51vh] px-4 py-3 text-sm">
                {Comments.map(comment => {
                  return (<div key={comment.Id || ''} className="w-[90%] flex flex-row gap-2">
                    <p><img src={comment.image_src} alt="" className="size-7 rounded-[50%] object-cover" /></p>
                    <div className="flex flex-col">
                      <span className="flex items-center flex-row gap-5">
                        <p>{comment.username}</p>
                        <p className="text-zinc-600 text-sm">{TimeAgo(comment.created_at)}</p>
                      </span>
                      <p className="w-[fit-content] comm p-2 text-sm text-gray-600 bg-zinc-100 rounded-lg leading-relaxed break-words line-clamp-[3.4]">
                        {comment.content}
                      </p>
                    </div>
                  </div>)
                })}
              </div>

              <div className="px-2 py-2 border-t">
                <div className="flex flex-col gap-2 pl-3 items-center w-[fit-content]">
                  <button className="h-[17px]" onClick={() => handleLike(Post.Id)}>
                    {Likeing ? <DotSpinner size="1rem" color="#ff1d1d" /> :
                      <i className={`fa-heart ${Post.isLike ? "fa-solid" : "fa-regular"} fa-lg cursor-pointer text-red-500`}></i>
                    } </button>
                  <span className="text-xs text-gray-500">{Post.totalLikes} Likes</span>
                </div>
              </div>

              <form onSubmit={submitComment(handleSubmitComment)} className="px-3 border-t py-2 flex items-center justify-between gap-2 sticky bottom-0 bg-white w-full" >
                <div className="flex flex-col">
                  <input type="text" placeholder="Add comment..." className="w-[280px] p-2 text-sm outline-none" {...registeComment("newComment", { required: "Comment is required", minLength: { value: 3, message: "Comment must be at least 3 characters" }, maxLength: { value: 200, message: "Comment must not exceed 200 characters" } })} />
                  {errorsComment.newComment && (<span className="text-red-500 text-xs">{errorsComment.newComment.message}</span>)}
                </div>
                <button type="submit" disabled={isSubmittingComment} className="text-blue-500 font-semibold text-sm hover:underline">{isSubmittingComment ? "Posting..." : "Post"}</button>
              </form>
            </div>
          </div> : <DotSpinner size="3rem" color="#000000" />}
        </div>}

      {PostOption &&
        <div className="fixed flex h-[100vh] w-[100vw] inset-0 bg-black/50 items-center justify-center z-50">
          <div className="bg-white w-[100%] md:h-[80vh] md:w-[40%] rounded-2xl overflow-hidden text-center">

            <button onClick={() => DltPost()} className="cursor-pointer w-full py-3 text-sm cursor-pointer text-red-500 font-semibold border-b border-zinc-300">Delete</button>

            <button onClick={() => EditPost()} className="cursor-pointer w-full py-3 text-sm cursor-pointer border-b border-zinc-300">Edit</button>

            <button className="w-full py-3 cursor-not-allowed text-sm border-b border-zinc-300 hover:bg-gray-50">
              Hide like count to others
            </button>

            <button className="w-full py-3 text-sm cursor-not-allowed border-b border-zinc-300 hover:bg-gray-50">
              Turn off commenting
            </button>

            <button className="w-full py-3 text-sm cursor-not-allowed border-b border-zinc-300 hover:bg-gray-50">
              Go to post
            </button>

            <button className="w-full py-3 text-sm cursor-not-allowed border-b border-zinc-300 hover:bg-gray-50">
              Share to…
            </button>

            <button onClick={() => navigator.clipboard.writeText(Post.image_url)} className="w-full cursor-pointer py-3 text-sm border-b border-zinc-300 hover:bg-gray-50">
              Copy link
            </button>

            <button className="w-full py-3 text-sm cursor-not-allowed border-b border-zinc-300 hover:bg-gray-50">
              Embed
            </button>

            <button className="w-full py-3 text-sm cursor-not-allowed border-b border-zinc-300 hover:bg-gray-50">
              About this account
            </button>

            <button onClick={() => setPostOption(!PostOption)} className="w-full cursor-pointer py-3 text-sm hover:bg-gray-100">
              Cancel
            </button>

          </div>
        </div>}

      {folShow && <div className="fixed b-0 md:inset-0 h-[100vh] w-[100vw] bg-black/40 flex justify-center items-center z-90">
        <p onClick={() => { setfolShow(!folShow), setfolowdata(), setsuggession(), setLoading(false) }} className="absolute top-2 right-2 md:top-5 md:right-7 cursor-pointer"><i className="fa-solid fa-xmark fa-2xl text-red-500"></i></p>
        <div className="w-[100vw] h-[100vh] md:w-[45%] md:h-[67vh] div3 flex flex-col gap-6 overflow-hidden shadow-xl bg-white md:rounded-4xl">
          <p className="w-[100%] py-1 pt-3 text-center border-b-1 border-solid border-gray-400">{!isunfollow ? "Following" : "Followers"}</p>

          <div className="flex flex-col overflow-x-hidden overflow-y-scroll h-[86%]">
            {folowdata.map((user, i) => {
              return (<div key={i} className="flex flex-row px-2 p-2 items-center rounded-lg gap-5 w-[100%]">
                <div className="flex flex-row items-center w-[80%] gap-2">
                  <img src={user.image_src} className="size-11 rounded-[50%] border-1 border-gray-400 object-cover" alt="" />

                  <div className="flex items-center ws flex-col borde sm:items-center">
                    <button onClick={() => otherUser(user.Id, user.Username)} className="cursor-pointer text-left">
                      {user.Username}
                      <p className="text-zinc-600 text-sm text-left">{user.First_name}</p>
                    </button>
                  </div>
                </div>
                <button onClick={() => remove(user.Id, !isunfollow ? "unfollow" : "remove")} className="px-3 py-1 rounded-lg text-xs bg-zinc-200 text-zinc-700 hover:text-zinc-900 cursor-pointer">{!isunfollow ? "following" : "Remove"}</button>
              </div>)
            })}

            <p className="p-1 border-b-1 py-2 border-sky-400 color text-sky-500">Suggestion</p>

            {suggession.map((user, i) => {
              return (<div key={i} className="flex flex-row px-2 p-2 items-center rounded-lg gap-5 w-[100%]">
                <div className=" flex flex-row items-center w-[80%] gap-2">
                  <img src={user.image_src} className="rounded-[50%] border-1 border-gray-400 object-cover size-11" alt="" />
                  <div className="flex items-center ws flex-col borde sm:items-center">
                    <button onClick={() => otherUser(user.Id, user.Username)} className="cursor-pointer userOther">
                      {user.Username}
                      <p className="text-zinc-600 text-sm text-left">{user.First_name}</p>
                    </button>
                  </div>
                </div>
                <button onClick={() => follow(user.Id, !isunfollow ? "unfollow" : "remove")} className="p-1 px-5 bg-sky-500 hover:bg-sky-700 cursor-pointer rounded-lg text-white">Follow</button>
              </div>)
            })}

          </div>
        </div>
      </div>}

    </main>
  );
}
