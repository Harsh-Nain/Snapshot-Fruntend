import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { FiHeart, FiMessageCircle, FiX, FiUserPlus, FiUserCheck, FiImage } from "react-icons/fi";
import { TimeAgo } from "../components/agotime";
import DotSpinner from "../components/dot-spinner-anim";
import { MdErrorOutline, MdOutlineDoneOutline } from "react-icons/md";

export default function OtherUser() {
    const API_URL = import.meta.env.VITE_BACKEND_API_URL;
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const userId = searchParams.get("Id");
    const username = searchParams.get("username");

    const [data, setData] = useState(null);
    const [userPost, setUserPost] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [suggession, setsuggession] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [Postloading, setPostloading] = useState(false);

    const [followModalOpen, setFollowModalOpen] = useState(false);
    const [followType, setFollowType] = useState("followers");

    const [Post, setPost] = useState(null);
    const [Comments, setComments] = useState([]);
    const [likeLoading, setLikeLoading] = useState(false);
    const [commentLoading, setCommentLoading] = useState(false);

    const { register, handleSubmit, reset } = useForm();
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        if (alert) {
            const timer = setTimeout(() => {
                setAlert(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [alert]);

    useEffect(() => {
        if (!userId) return;

        const loadProfile = async () => {
            console.log(userId, username);

            setPostloading(true)
            setTimeout(() => {
                setAlert({ message: "Please wait User data loaded...", success: "User data loaded" })
            }, 200);
            const res = await fetch(`${API_URL}/api/auth/userProfile`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, username }),
            });

            const re = await fetch(`${API_URL}/api/follow/getfollowData`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ userId }),
            });

            const resut = await re.json();

            if (resut.Success) {
                setsuggession(resut.suggession);
            }

            const result = await res.json();
            setAlert(null)
            console.log('isFollowing', result.isfollowing);
            setPostloading(false)

            setData(result.data);
            setUserPost(result.userPost || []);
            setFollowers(result.follower || []);
            setFollowing(result.following || []);
            setIsFollowing(result.isfollowing);
        };

        loadProfile();
    }, [userId, navigate]);

    const toggleFollow = async () => {
        const path = isFollowing ? "unfollow" : "request";

        await fetch(`${API_URL}/api/follow/${path}`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ requestId: data.Id }),
        });

        setIsFollowing(!isFollowing);
    };

    const showImage = async (postId) => {
        setPostloading(true)
        const res = await fetch(`${API_URL}/api/post/onePost`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ postId }),
        });

        const post = await res.json();
        setPost(post);
        setPostloading(false)

        const com = await fetch(`${API_URL}/api/post/postcomment`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ postId }),
        });

        const comments = await com.json();
        setComments(comments.comments || []);
    };

    const handleLike = async () => {
        if (!Post) return;

        setLikeLoading(true);

        const res = await fetch(`${API_URL}/api/post/like`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ postid: Post.Id }),
        });

        const data = await res.json();

        setPost(prev => ({
            ...prev,
            isLike: !prev.isLike,
            totalLikes: data.totalLikes
        }));

        setLikeLoading(false);
    };

    const onSubmitComment = async (form) => {
        if (!Post) return;

        setCommentLoading(true);

        const res = await fetch(`${API_URL}/api/post/CreateComment`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                postId: Post.Id,
                Comment: form.comment,
            }),
        });

        const result = await res.json();

        if (result.success) {
            setComments(prev => [result.comment, ...prev]);
            reset();
        }

        setCommentLoading(false);
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

    const follow = async (requestId) => {

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
            setsuggession(prev => prev.filter(u => u.Id !== requestId))
        }
    }

    const otherUser = (Id, username) => {
        if (Id == userId) return navigate('/api/profile')
        navigate(`/user?username=${username}&Id=${userId}`);
    };

    return (
        <main className="flex justify-center bg-[#fafafa] w-full min-h-screen sm:p-4">

            <div class={`fixed z-9999999999 flex w-3/4 h-17 overflow-hidden top-7 ${!alert && "translate-x-120"}  transition duration-300 ease-in-out right-9 bg-white shadow-lg max-w-96 rounded-xl`}>
                {alert && <> <svg xmlns="http://www.w3.org/2000/svg" height="96" width="16">    <path stroke-linecap="round" stroke-width="2" stroke={alert.err ? "indianred" : "lightgreen"} fill={alert.err ? "indianred" : "lightgreen"} d="M 8 0 Q 4 4.8, 8 9.6 T 8 19.2 Q 4 24, 8 28.8 T 8 38.4 Q 4 43.2, 8 48 T 8 57.6 Q 4 62.4, 8 67.2 T 8 76.8 Q 4 81.6, 8 86.4 T 8 96 L 0 96 L 0 0 Z"    ></path> </svg>

                    <div class="mx-2.5 overflow-hidden w-full">
                        {alert.err && <p class="mt-1.5 text-xl flex items-center gap-2 font-bold text-[indianred] leading-8 mr-3 overflow-hidden text-ellipsis whitespace-nowrap">    {alert.err} <MdErrorOutline color="red" /></p>}
                        {alert.success && <p class="flex items-center gap-2 mt-1.5 text-xl font-bold text-green-400 leading-8 mr-3 overflow-hidden text-ellipsis whitespace-nowrap">    {alert.success}<MdOutlineDoneOutline color="lightgreen" /></p>}
                        <p class="overflow-hidden leading-5 break-all text-zinc-400 max-h-10">    {alert.message} </p>
                    </div>

                    <button onClick={() => setAlert(null)} class="w-16 cursor-pointer focus:outline-none">
                        <svg class="w-7 h-7" fill="none" stroke="indianred" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button></>}
            </div>

            <div className="w-full max-w-5xl bg-white rounded-xl p-6">

                {Postloading && (
                    <div className="flex justify-center items-center fixed top-0 left-0 h-[100vh] w-[100vw] bg-black/70 z-9999">
                        <DotSpinner size="3rem" color="white" />
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-10">

                    <div className="relative w-32 h-32">
                        <div className="absolute inset-0 rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
                            <img src={data?.image_src} className="w-full h-full rounded-full object-cover transition-transform duration-300" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">

                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-semibold">{data?.Username}</h2>

                            <div className="flex items-center gap-3">
                                <button onClick={toggleFollow} className={`px-4 py-1 rounded-md text-sm flex items-center gap-2 transition   ${isFollowing ? "bg-gray-200 hover:bg-gray-300" : "bg-blue-500 hover:bg-blue-600 text-white"}`}                            >
                                    {isFollowing ? <FiUserCheck size={16} /> : <FiUserPlus size={16} />}
                                    {isFollowing ? "Following" : "Follow"}
                                </button>

                                {isFollowing && (
                                    <button onClick={() => addMessage(data?.Id)} className="px-4 py-1 rounded-md text-sm border border-gray-300 bg-white hover:bg-gray-100 transition">
                                        Message
                                    </button>
                                )}

                            </div>

                        </div>

                        <div className="flex gap-6 text-sm">
                            <span><b>{userPost.length}</b> posts</span>

                            <span className="cursor-pointer" onClick={() => { setFollowType("followers"); setFollowModalOpen(true); }}>
                                <b>{followers.length}</b> followers
                            </span>

                            <span className="cursor-pointer" onClick={() => { setFollowType("following"); setFollowModalOpen(true); }}>
                                <b>{following.length}</b> following
                            </span>
                        </div>

                        <p className="text-sm">{data?.bio}</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-1 mt-8">
                    {userPost.map(post => (
                        <div key={post.Id} onClick={() => showImage(post.Id)} className="cursor-pointer" style={{ aspectRatio: "1/1" }}>
                            <img src={post.image_url} className="w-full bg-sky-100 h-full object-cover" />
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
                <div className="fixed inset-0 bg-black/70 flex justify-center items:baseline sm:items-center z-50 sm:p-4 z-9999">

                    <div className="bg-white w-full max-w-4xl flex flex-col md:flex-row h-[100vh] md:h-[85vh] rounded-lg overflow-hidden">

                        <div className="md:w-1/2 bg-black flex items-center h-[40vh] sm:h-full justify-center">
                            <img src={Post.image_url} className="bg-sky-100 object-contain max-h-full" />
                        </div>

                        <div className="md:w-1/2 flex flex-col h-[54vh] sm:h-full">

                            <div className="flex justify-between items-center p-2 border-b">
                                <div className="flex gap-3 justify-center items-center">
                                    <img src={Post.image_src} className="w-9 h-9 rounded-full object-cover" />
                                    <p className="font-semibold">{Post.username}</p>
                                </div>
                                <FiX size={22} onClick={() => setPost(null)} className="cursor-pointer" />
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {Comments.map(comment => (
                                    <div key={comment.Id} className="flex gap-3">
                                        <img src={comment.image_src} className="w-7 h-7 rounded-full object-cover" />
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

                            <div className="border-t p-4">

                                <div className="flex items-center gap-4 mb-2">
                                    <button onClick={handleLike}>
                                        {likeLoading ? <DotSpinner size="1rem" color="red" /> : <FiHeart size={22} className={Post.isLike ? "text-red-500 fill-red-500" : ""} />}
                                    </button>
                                    <FiMessageCircle size={22} />
                                </div>

                                <p className="text-sm font-semibold">
                                    {Post.totalLikes} likes
                                </p>

                                <form onSubmit={handleSubmit(onSubmitComment)} className="flex gap-2 mt-3">
                                    <input        {...register("comment", { required: true })} className="flex-1 border px-3 py-1 rounded-md text-sm" placeholder="Add a comment..." />
                                    <button disabled={commentLoading} className="text-blue-500 font-semibold text-sm"    >
                                        {commentLoading ? <DotSpinner size="1rem" color="skyblue" /> : "Post"}
                                    </button>
                                </form>

                            </div>
                        </div>

                    </div>
                </div>
            )}

            {followModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 sm:p-4">

                    <div className="bg-white w-full max-w-md h-[85vh] rounded-xl flex flex-col">

                        <div className="flex justify-between items-center p-4 border-b">
                            <h2 className="font-semibold">
                                {followType === "followers" ? "Followers" : "Following"}
                            </h2>
                            <FiX size={20} onClick={() => setFollowModalOpen(false)} className="cursor-pointer" />
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {(followType === "followers" ? followers : following).map(user => (
                                <div key={user.Id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer">
                                    <img src={user.image_src} className="w-9 h-9 bg-sky-100 rounded-full object-cover" />
                                    <div>
                                        <p className="text-sm font-semibold">{user.Username}</p>
                                        <p className="text-xs text-gray-500">{user.First_name}</p>
                                    </div>
                                </div>
                            ))}
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

                                            <button onClick={() => follow(user.Id)} className="px-3 py-1 text-xs rounded-md bg-blue-500 text-white hover:bg-blue-600">
                                                Follow
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
