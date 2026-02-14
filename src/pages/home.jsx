import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { TimeAgo, formatCount } from "../components/agotime";
import "../App.css";
import DotSpinner from "../components/dot-spinner-anim";
import { NavLink, useNavigate } from "react-router-dom";
import { IoVolumeMute, IoVolumeHigh } from "react-icons/io5";
import { FiMessageCircle } from "react-icons/fi";

export default function Home() {
    const API_URL = import.meta.env.VITE_BACKEND_API_URL

    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [user, setUser] = useState();
    const [Likeing, setLikeing] = useState(false);
    const [isPlay, setisPlay] = useState(false);
    const [suggession, setsuggession] = useState([]);
    const [IsMessaged, setIsMessaged] = useState([]);
    const [page, setpage] = useState(2);
    const loadingRef = useRef(false);
    const noMoreRef = useRef(false);
    const postContainer = useRef()

    const [Commenting, setCommenting] = useState(false);
    const [Comments, setComments] = useState([]);
    const [showComments, setShowComments] = useState(false);

    const [loading, setloading] = useState(false);
    const [Loading, setLoading] = useState(false);
    const [CommentsPostId, setCommentsPostId] = useState();
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

    useEffect(() => {
        const loadDashboard = async () => {
            setLoading(true)
            const res = await fetch(`${API_URL}/`, {
                method: "GET",
                credentials: "include",
            });

            if (res.status === 401) {
                navigate("/api/auth/login");
                return;
            }

            const data = await res.json();
            console.log("Dashboard data:", data);

            setLoading(false)
            setsuggession(data.suggsionId)
            setPosts(data.post || []);
            setUser(data.data || '');
        };

        loadDashboard();
    }, [navigate]);

    const otherUser = (userId, username) => {
        if (userId === user.Id) return navigate('/api/profile')
        navigate(`/user?username=${username}&Id=${userId}`);
    };

    const closeComment = () => {
        setComments([]);
        setShowComments(false);
        setCommenting(false);
        setCommentsPostId()
    };

    const handleLike = async (Id) => {
        setLikeing(true)
        const res = await fetch(`${API_URL}/api/post/like`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ postid: Id }),
        });

        const data = await res.json();
        console.log("Liked data:", data);

        if (!data.success) return;
        setLikeing(false)
        setPosts(prevPosts => prevPosts.map(post => post.Id === Id ? { ...post, totalLikes: data.totalLikes, isLike: data.isLike, } : post));
    };

    const playSong = async (e, postId) => {
        const audio = e.currentTarget.querySelector('audio');
        if (!audio) return;

        document.querySelectorAll('audio').forEach(a => {
            if (a !== audio) a.pause();
        });

        if (audio.paused) {
            await audio.play();
            setisPlay(postId);
        } else {
            audio.pause();
            setisPlay(null);
        }
    };

    const handleComment = async (postId, all) => {
        if (!all) {
            setCommenting(true);
        }
        setCommentsPostId(postId)

        const res = await fetch(`${API_URL}/api/post/postcomment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ postId }),
        });

        const data = await res.json();
        console.log("Comment data:", data);

        if (!data.success) return;

        setComments(data.comments);
        setCommenting(false);
        setShowComments(true);
    };

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
            setIsMessaged((prev) => [...prev, requestId]);
        }
    }

    const handleSubmitComment = async (d) => {

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

        if (!res.ok) {
            const errorText = await res.json();
            console.error("Server error:", errorText);
            return;
        }

        const data = await res.json();
        console.log("Response:", data);

        if (data.success) {
            setComments((prev) => [data.comment, ...prev]);
            reset();
        }
    };

    useEffect(() => {
        const container = postContainer.current;
        if (!container) return;

        const handleScroll = () => {
            if (loadingRef.current || noMoreRef.current) return;

            if (
                container.scrollTop + container.clientHeight >=
                container.scrollHeight - 50
            ) {
                loadPosts();
            }
        };

        container.addEventListener("scroll", handleScroll);

        return () => container.removeEventListener("scroll", handleScroll);
    }, [page]);

    async function loadPosts() {
        if (loadingRef.current || noMoreRef.current) return;

        loadingRef.current = true;
        setloading(true);

        const res = await fetch(`${API_URL}/api/post/posts?page=${page}`, { method: "GET", credentials: "include" });

        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
            noMoreRef.current = true;
            setloading(false);
            loadingRef.current = false;
            return;
        }

        setPosts(prev => [...prev, ...data]);
        setpage(prev => prev + 1);

        setloading(false);
        loadingRef.current = false;
    }

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

    return (
        <div className="flex flex-col sm:flex-row justify-center w-full h-[92vh] md:h-[100vh] bg-[#fafafa]">

            {Loading && (
                <div className="fixed inset-0 bg-black/40 z-9999999 flex items-center justify-center">
                    <DotSpinner size="3rem" color="white" />
                </div>
            )}

            <span className="text-3xl sm:hidden font-black pl-3 pb-3 font-normal tracking-tight bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300">
                Snapshot
            </span>

            <div className="w-full sm:w-[600px] flex justify-center">

                <div ref={postContainer} className="w-full max-w-[630px] h-[82vh] md:h-[100vh] overflow-y-auto sm:py-6 space-y-3 sm:space-y-6 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]" >

                    {posts.map((post, i) => (
                        <div key={i} className="bg-white border border-gray-200 rounded-md">

                            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
                                <button onClick={() => otherUser(post.userId, post.username)} className="flex items-center gap-3">
                                    <img src={post.image_src} alt="user" className="w-8 h-8 rounded-full object-cover border border-gray-300" />
                                    <div className="text-left">
                                        <p className="font-semibold text-sm text-black">
                                            {post.username}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                            {post.desc}
                                        </p>
                                    </div>
                                </button>
                            </div>

                            <div className="relative w-full bg-black flex justify-center">
                                <img src={post.image_url} alt="post" className="w-full h-auto max-h-[75vh] object-contain" />

                                {post.songUrl && (
                                    <button onClick={(e) => playSong(e, post.Id)} className="absolute bottom-3 right-3 bg-black/70 text-white w-9 h-9 rounded-full flex items-center justify-center">
                                        {isPlay ? <IoVolumeHigh size={18} /> : <IoVolumeMute size={18} />}
                                        <audio src={post.songUrl}></audio>
                                    </button>
                                )}
                            </div>

                            <div className="px-4 pt-3 flex items-center gap-5">

                                <button onClick={() => handleLike(post.Id)} className="transition hover:scale-110 active:scale-95" >
                                    {Likeing ? (<DotSpinner size="1rem" color="#ef4444" />) : (
                                        <i className={`fa-heart ${post.isLike ? "fa-solid text-red-500" : "fa-regular text-black"} text-[1.6rem]`}></i>
                                    )}
                                </button>

                                <button onClick={() => handleComment(post.Id)} className="text-black transition hover:scale-110 active:scale-95">
                                    {Commenting ? (<DotSpinner size="1rem" color="black" />) : (
                                        <svg fill="currentColor" height="24" viewBox="0 0 24 24" width="24"> <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" /></svg>
                                    )}
                                </button>
                            </div>

                            <div className="px-4 pt-2">
                                <p className="text-sm font-semibold text-black">
                                    {formatCount(post.totalLikes)} likes
                                </p>
                            </div>

                            <div className="px-4 pt-1 pb-4 text-sm">
                                <span className="font-semibold text-black mr-2">
                                    {post.username}
                                </span>
                                <span className="text-gray-700">
                                    {post.postName}
                                </span>

                                <p onClick={() => handleComment(post.Id, "all")} className="text-gray-500 mt-1 cursor-pointer hover:text-gray-700">
                                    View all {formatCount(post.commentCount)} comments
                                </p>
                            </div>

                        </div>
                    ))}

                    {loading && (<div className="flex justify-center py-6"><DotSpinner size="1.5rem" color="gray" /></div>)}
                </div>
            </div>

            <div className="hidden md:block w-[320px] ml-10">

                <div className="sticky top-20 space-y-6">

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src={user?.image_src} className="w-12 h-12 rounded-full object-cover" alt="" />

                            <div>
                                <NavLink to="/api/profile" className="font-semibold text-sm text-black">
                                    {user?.Username}
                                </NavLink>

                                <p className="text-sm text-gray-500">
                                    {user?.First_name}
                                </p>
                            </div>
                        </div>

                        <button onClick={() => navigate('/api/post/post')} className="text-sm font-semibold text-blue-500 hover:text-blue-600">
                            Create
                        </button>
                    </div>

                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500 font-medium">
                            Suggested for you
                        </p>

                        <button className="text-xs font-semibold text-black">
                            See All
                        </button>
                    </div>

                    <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-1">

                        {suggession?.map((sugUser, i) => (
                            <div key={i} className="flex items-center justify-between">

                                <div className="flex items-center gap-3">
                                    <img src={sugUser.image_src} className="w-8 h-8 rounded-full object-cover" alt="" />

                                    <div>
                                        <button onClick={() => otherUser(sugUser.Id, sugUser.Username)} className="text-sm font-semibold text-black text-left">
                                            {sugUser.Username}
                                        </button>

                                        <p className="text-xs text-gray-500">
                                            {sugUser.First_name}
                                        </p>
                                    </div>
                                </div>

                                <button onClick={() => IsMessaged.includes(sugUser.Id) ? addMessage(sugUser.Id) : follow(sugUser.Id)} className="text-xs font-semibold text-blue-500 hover:text-blue-600">
                                    {IsMessaged.includes(sugUser.Id) ? "Message" : "Follow"}
                                </button>
                            </div>
                        ))}

                    </div>

                    <p className="text-xs text-gray-400 pt-6">
                        © 2026 SNAPSHOT FROM NAIN
                    </p>

                </div>
            </div>

            {showComments && (
                <div className="fixed inset-0 z-999999 z-50 flex items-end md:items-center justify-center bg-black/50">

                    <div className="absolute inset-0" onClick={() => closeComment()} />

                    <div className="relative w-full md:w-[600px] pb-7 sm:p-0 h-[75vh] md:h-[80vh] bg-white rounded-t-2xl md:rounded-md border border-gray-200 flex flex-col">

                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                            <h2 className="font-semibold text-black text-base">Comments</h2>
                            <button onClick={() => closeComment()} className="text-black text-lg hover:text-gray-600"> ✕</button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

                            {Comments.map((comment, i) => (
                                <div key={i} className="flex gap-3">

                                    <img src={comment.image_src} alt="" className="w-8 h-8 rounded-full object-cover" />

                                    <div className="flex flex-col text-sm">

                                        <span className="font-semibold text-black">
                                            {comment.username}
                                        </span>

                                        <span className="text-gray-800 break-words">
                                            {comment.content}
                                        </span>

                                        <span className="text-xs text-gray-400 mt-1">
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

                        <form onSubmit={handleSubmit(handleSubmitComment)} className="border-t border-gray-200 px-4 py-3 flex items-center gap-3">

                            <input type="text" placeholder="Add a comment..." className="flex-1 text-sm outline-none border-none bg-transparent" {...register("newComment", { required: "Comment is required", minLength: { value: 3, message: "Min 3 characters" }, maxLength: { value: 200, message: "Max 200 characters" }, })} />

                            <button type="submit" disabled={isSubmitting} className="text-blue-500 font-semibold text-sm disabled:opacity-50">
                                {isSubmitting ? (<DotSpinner size="1rem" color="black" />) : ("Post")}
                            </button>

                        </form>

                        {errors.newComment && (<p className="text-red-500 text-xs px-5 pb-3">    {errors.newComment.message}</p>)}

                    </div>
                </div>
            )}

        </div>

    )
}