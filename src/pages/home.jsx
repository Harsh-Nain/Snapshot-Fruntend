import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { TimeAgo, formatCount } from "../components/agotime";
import "../App.css";
import DotSpinner from "../components/dot-spinner-anim";
import { NavLink, useNavigate } from "react-router-dom";
import { IoVolumeMute } from "react-icons/io5";
import { IoVolumeHigh } from "react-icons/io5";

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
    const [CommentsPostId, setCommentsPostId] = useState();
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

    useEffect(() => {
        const loadDashboard = async () => {
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
            console.log(data);
            setsuggession(data.suggsionId)

            setPosts(data.post || []);
            setUser(data.data || '');
        };

        loadDashboard();
    }, [navigate]);

    const otherUser = (userId, username) => {
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
            setIsMessaged(pre => [...pre, requestId])
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
        <div className="flex flex-col sm:flex-row justify-around w-full h-[88vh] md:h-[100vh]">
            <span className="sm:hidden text-2xl font-[cursive] tracking-tight text-sky-400 px-2 pt-3 pb-1">Snapshot</span>

            <div ref={postContainer} className="sm:p-0 sm:w-[100%] md:w-1/2  flex flex-col overflow-y-scroll overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] gap-5 h-[88vh] md:h-[100vh]">
                {posts.map((post, i) => {
                    return (
                        <div key={i} className="flex flex-col gap-2 w-full mt-5 sm:px-3">

                            <div className="flex items-center gap-3 px-3 sm:p-0">
                                <button className="cursor-pointer flex items-center gap-2" onClick={() => otherUser(post.userId, post.username)}>
                                    <img src={post.image_src} alt="user" className="size-9 rounded-full object-cover bg-gradient-to-r from-sky-500 to-violate-400 border-1 border-zinc-100" />

                                    <p className="flex flex-col text-left">
                                        <span>{post.username}</span>
                                        <span className="text-xs px-1">{post.desc}</span>
                                    </p>
                                </button>
                            </div>

                            <div className="relative w-full overflow-hidden sm:border border-zinc-200 dark:border-zinc-800 sm:rounded md:h-[87vh] bg-black">
                                {post.songUrl &&
                                    <button onClick={(e) => playSong(e, post.Id)} className="cursor-pointer absolute bottom-3 right-3 z-20 bg-black/50 text-white w-6 h-6 rounded-full flex items-center justify-center">
                                        {isPlay ? <IoVolumeHigh /> : < IoVolumeMute />}
                                        {post.songUrl && <audio src={post.songUrl}></audio>}
                                    </button>}
                                <img src={post.image_url} alt="post" className="w-full h-full object-contain" />
                            </div>
                            <div className="flex flex-row px-3 gap-2 sm:p-0">
                                <div className="flex flex-col gap-2 items-center w-[fit-content]">
                                    <button className="h-[17px]" onClick={() => handleLike(post.Id)}>
                                        {Likeing ? <DotSpinner size="1rem" color="#ff1d1d" /> :
                                            <i className={`fa-heart ${post.isLike ? "fa-solid" : "fa-regular"} fa-lg cursor-pointer text-red-500`}></i>
                                        } </button>
                                    <span className="text-xs text-gray-500">{formatCount(post.totalLikes)} Likes</span>
                                </div>

                                <div className="cursor-pointer pt-[4px]">
                                    <button className="h-[17px]" onClick={() => handleComment(post.Id)}>
                                        {Commenting ? <DotSpinner size="1rem" color="#777777" /> :
                                            <span className="flex gap-2"><svg aria-label="Comment" fill="currentColor" height="20" viewBox="0 0 24 24" width="20">
                                                <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
                                            </svg> <span className="text-sm text-gray-800">{post.commentCount > 1 && formatCount(post.commentCount)}</span></span>
                                        } </button>
                                </div>
                            </div>

                            <div className="px-3 sm:p-0">
                                <p className="text-sm cursor-pointer" onClick={() => handleComment(post.Id, "all")}>View all comments </p>
                                <p className="text-sm text-zinc-600">{post.postName}</p>
                            </div>

                        </div>)
                })}
                {loading && <div className="h-10 w-full flex flex-col justify-center items-center"><DotSpinner size="1.5rem" color="#000000" /></div>}
            </div>

            <div className="hidden md:block now text-sm mt-10 xl:pr-10  text-gray-700 nowuser flex justify-center xl:w-1/3 w-2/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={user && user.image_src} className="w-12 h-12 rounded-full border object-cover" />
                        <div>
                            <NavLink to="/api/profile" className="text-black a font-semibold">
                                <p className="overflow-hidden">{user && user.Username}</p>
                            </NavLink>
                            <p className="text-gray-500">{user && user.First_name}</p>
                        </div>
                    </div>
                    <button className="text-blue-500">Switch</button>
                </div>

                <div className="flex justify-between mt-6 mb-3">
                    <p className="text-gray-500">Suggested for you</p>
                </div>

                {suggession && <div className="flex flex-col overflow-x-hidden overflow-y-scroll h-[44vh]">
                    {suggession.map((user, i) => {
                        return (<div key={i} className="flex flex-row px-2 p-2 items-center rounded-lg gap-5 w-[100%]">
                            <div className="flex flex-row items-center w-[80%] gap-2">
                                <img src={user.image_src} className="rounded-[50%] border-1 border-gray-400 object-cover size-11" alt="" />
                                <div className="flex items-center ws flex-col borde sm:items-center">
                                    <button onClick={() => otherUser(user.Id, user.Username)} className="text-left cursor-pointer userOther">
                                        {user.Username}
                                        <p className="text-zinc-600 text-sm text-left">{user.First_name}</p>
                                    </button>
                                </div>
                            </div>
                            <button onClick={() => IsMessaged.includes(user.Id) ? addMessage(user.Id) : follow(user.Id)} className="p-1 px-5 bg-sky-500 hover:bg-sky-700 cursor-pointer rounded-lg text-white">{IsMessaged.includes(user.Id) ? "Message" : "Follow"}</button>
                        </div>)
                    })}
                </div>}

                <div className="text-gray-500 text-xs mt-6 space-x-2 leading-6">
                    <span>About</span> ·
                    <span>Help</span> ·
                    <span>Press</span> ·
                    <span>API</span> ·
                    <span>Jobs</span> ·
                    <span>Privacy</span> ·
                    <span>Terms</span> ·
                    <span>Locations</span> ·
                    <span>Language</span> ·
                    <span>Nain Verified</span>
                </div>

                <p className="text-gray-500 text-xs mt-4">
                    © 2026 SNAPSHOT FROM NAIN
                </p>

            </div>

            {showComments && (
                <div className="fixed w-[100vw] bottom-[15vh] md:bottom-0 left-0 h-[40vh] md:h-[100vh] z-1000 bg-[#00000082] flex justify-center items-center">
                    <p onClick={() => closeComment()} className="absolute -top-17 md:top-5 right-1 md:right-7 cursor-pointer"><i className="fa-solid fa-xmark fa-2xl text-red-500"></i></p>

                    <div className="w-[100vw] md:w-[60vw] md:h-[81vh] overflow-hidden rounded-sm flex flex-col items-center bg-white">
                        <form onSubmit={handleSubmit(handleSubmitComment)} className="w-[92%] p-2 flex flex-col rounded-xl mt-3 bg-zinc-100" >

                            <div className="flex flex-col h-[47px]">
                                <input type="text" placeholder="Add comment..." className="w-full p-2 text-sm outline-none rounded" {...register("newComment", { required: "Comment is required", minLength: { value: 3, message: "Comment must be at least 3 characters" }, maxLength: { value: 200, message: "Comment must not exceed 200 characters" } })} />
                                {errors.newComment && (<span className="text-red-500 text-xs">{errors.newComment.message}</span>)}
                            </div>
                            <button type="submit" disabled={isSubmitting} className="mt-2 px-3 py-1 rounded-xl bg-orange-600 text-sm w-fit text-white hover:bg-orange-700 disabled:opacity-50">{isSubmitting ? "Submitting..." : "Submit"}</button>
                        </form>

                        <div className="w-[100%] gap-3 mt-2">
                            <p className="px-7">Comments -</p>
                            <div className="w-[100%] overflow-y-scroll h-75 scrl overflow-x-hidden gap-3 px-1 py-2 flex flex-col items-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" id="commentsDiv">

                                {Comments.map(comment => {
                                    return (<div key={comment.Id || ''} className="w-[90%] flex flex-row gap-2">
                                        <p><img src={comment.image_src} alt="" class="size-7 rounded-[50%] object-cover" /></p>
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
                        </div>
                    </div>

                </div>
            )}
        </div>
    )
}