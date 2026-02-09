import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import DotSpinner from "../components/dot-spinner-anim";
import { useForm } from "react-hook-form";
import { TimeAgo } from "../components/agotime";

export default function OtherUser() {
    const API_URL = import.meta.env.VITE_BACKEND_API_URL
    const [searchParams] = useSearchParams();
    const userId = searchParams.get("Id");
    const username = searchParams.get("username");

    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [userPost, setUserPost] = useState([]);
    const [follower, setFollower] = useState([]);
    const [following, setFollowing] = useState([]);
    const [isFollowing, setIsFollowing] = useState();
    const [loading, setLoading] = useState(false);

    const [Post, setPost] = useState();
    const [Postloading, setPostloading] = useState(false);
    const [Comments, setComments] = useState([]);
    const [Likeing, setLikeing] = useState(false);
    const [CommentsPostId, setCommentsPostId] = useState();
    const [folShow, setfolShow] = useState(false);
    const [folowdata, setfolowdata] = useState([]);
    const [suggession, setsuggession] = useState([]);
    const [isunfollow, setisunfollow] = useState(false);
    const [followLoading, setfollowLoading] = useState(false);

    const { register: registeComment, handleSubmit: submitComment, reset: resetComment, formState: { errors: errorsComment, isSubmitting: isSubmittingComment } } = useForm({
        defaultValues: { First_name: "", Email: "", bio: "", }
    });

    useEffect(() => {
        if (!userId || !username) return;

        const controller = new AbortController();
        setLoading(true)

        const fetchProfile = async () => {

            const res = await fetch(`${API_URL}/api/auth/userProfile`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, userId }),
                signal: controller.signal,
            });

            if (res.status === 401) {
                navigate("/api/auth/login")
                return;
            }

            const result = await res.json();

            if (result.redirect) {
                navigate(result.redirect);
                return;
            }

            setData(result.data);
            setLoading(false)            
            setUserPost(result.userPost || []);
            setFollower(result.follower || []);
            setFollowing(result.following || []);
            setIsFollowing(result.isfollowing);
        };

        fetchProfile();

        return () => controller.abort();
    }, [userId, username, navigate]);

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
            resetComment();
        }
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
        Post.isLike = !Post.isLike
        Post.totalLikes = data.totalLikes
        setPost(Post);
    };

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
        if (!comm.success) return;
        setComments(comm.comments);
        setCommentsPostId(postId)
        setPost(data)
    }

    const follow = async (requestId) => {
        console.log(requestId);

        setfollowLoading(true)

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
            setIsFollowing(true)
            setfollowLoading(false)
        }
    }

    const unfollow = async (requestId) => {
        setfollowLoading(true)

        const res = await fetch(`${API_URL}/api/follow/unfollow`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ requestId }),
        });

        const result = await res.json();
        if (result.success) {
            setIsFollowing(false)
            setfollowLoading(false)
        }
    }

    const FollowData = async (Id, which) => {
        setLoading(true)
        if (which == "following") {
            setisunfollow(true)
        } else {
            setisunfollow(false)
        }

        const res = await fetch(`${API_URL}/api/follow/getfollowData`, {
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
        setfolShow(!folShow)
        setLoading(!loading)
        navigate(`/user?username=${username}&Id=${userId}`);
    };

    const addMessage = async (toMessId) => {

        const res = await fetch(`${API_URL}/api/message/message?toMessId=${toMessId}`, {
            credentials: "include",
        });

        const result = await res.json();
        if (result.success) {
            navigate(result.redirect)
        }
    }

    return (
        <main className="flex-1 flex justify-center px-2 overflow-y-auto h-screen">

            {loading && <div className="fixed b-0 md:inset-0 bg-black/40 w-full h-[100vh] flex justify-center items-center z-90"><DotSpinner size="3.5rem" color="#000000" /></div>}

            <div className="w-full max-w-5xl bg-white rounded-xl p-4 flex flex-col gap-6">

                <div className="flex flex-col sm:flex-row gap-10 items-center sm:items-start">
                    <div className="w-32 h-32">
                        <img src={data?.image_src} alt="Profile" className="w-full h-full rounded-full object-cover" />
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
                            <span onClick={() => FollowData(data.Id, "followers")}><b>{follower.length}</b> following</span>
                        </div>

                        <p className="text-xs text-gray-500">
                            {data?.bio}
                        </p>

                        <div className="flex gap-3">
                            <button onClick={() => isFollowing ? unfollow(data?.Id) : follow(data?.Id)} className={`px-4 py-1 cursor-pointer text-sm border rounded-lg 
                            ${!isFollowing ? "bg-blue-400 hover:bg-blue-500 border-white text-white" : "bg-zinc-100 hover:bg-zinc-200"}`}>
                                {followLoading ? <DotSpinner size="1rem" color="#0084ff" /> : `${isFollowing ? "Unfollow" : "follow"}`}</button>

                            {isFollowing && <button onClick={() => addMessage(data?.Id)} className="px-4 py-1 text-sm border rounded-lg bg-zinc-100 hover:bg-zinc-200">Message</button>}
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

            {Postloading && <div className="fixed top-0 left-0 bg-[#00000087] flex justify-center items-center  w-[100vw] h-[100vh]">
                {Post ? <div className="bg-white shadow-xl flex justify-start items-center w-[100vw] md:w-[70%] h-[100vh] sm:h-[80vh] sm:max-w-5xl flex flex-col md:flex-row overflow-hidden">
                    <div className="h-[50vh] w-[100vw] md:w-1/2 bg-black flex items-center justify-center md:max-h-[100vh] bg-black">
                        <img src={Post.image_url} alt="Post Not Found..." className="w-full max-h-[50vh] md:max-h-[100vh] object-contain" />
                    </div>

                    <p onClick={() => { setPost(), setPostloading() }} className="absolute top-5 right-7 cursor-pointer"><i className="fa-solid fa-xmark fa-2xl text-red-500"></i></p>

                    <div className="w-full md:w-1/2 flex flex-col">
                        <div className="flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-white z-10">
                            <div className="flex items-center gap-3">
                                <img src={Post.image_src} className="w-8 h-8 rounded-full object-cover" />
                                <p className="font-semibold text-sm truncate max-w-[160px]">{Post.username}</p>
                            </div>
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

            {folShow && <div className="fixed b-0 md:inset-0 h-[100vh] w-[100vw] bg-black/40 flex justify-center items-center z-90">
                <p onClick={() => { setfolShow(!folShow), setfolowdata(), setsuggession(), setLoading(false) }} className="absolute top-2 right-2 md:top-5 md:right-7 cursor-pointer"><i className="fa-solid fa-xmark fa-2xl text-red-500"></i></p>
                <div className="w-[100vw] h-[100vh] md:w-[45%] md:h-[67vh] flex flex-col gap-6 overflow-hidden shadow-xl bg-white md:rounded-4xl">
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

        </main >
    );
}
