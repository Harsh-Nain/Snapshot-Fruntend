import React from "react";

export default function Notification({
    requestUser = [],
    suggestionId = [],
}) {
    return (
        <div className="hoP flex flex-col gap-3 rounded-r-xl mainq sm:items-center hidden items-center border-l border-zinc-400 w-0 text-xl h-[97.5vh] p-4">

            <p className="w-full text-2xl font-bold">Notifications</p>

            <div className="overflow-y-scroll addnot w-full h-full overflow-x-hidden scrollbar-hide-inline">

                {requestUser.length > 0 ? (
                    <div className="flex flex-col gap-5 mb-4">
                        {requestUser.map((request) => (
                            <div
                                key={request.Id}
                                className="w-full flex items-center justify-between gap-5"
                            >
                                <img
                                    src={request.image_src}
                                    className="w-10 h-10 rounded-full border object-cover"
                                    alt=""
                                />

                                <div className="flex flex-col text-sm w-1/2">
                                    <p>{request.Username}</p>
                                    <p className="text-zinc-600">{request.First_name}</p>
                                </div>

                                <div className="flex gap-2">
                                    <button className="px-2 py-1 border rounded-2xl text-xs text-sky-500 hover:text-sky-700">
                                        Confirm
                                    </button>
                                    <button className="px-2 py-1 border rounded-2xl text-xs text-sky-500 hover:text-sky-700">
                                        Decline
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* ================= EMPTY STATE ================= */
                    <div className="flex flex-col items-center text-center py-6">
                        <svg
                            aria-label="Activity On Your Posts"
                            fill="currentColor"
                            height="62"
                            viewBox="0 0 96 96"
                            width="62"
                        >
                            <circle cx="48" cy="48" fill="none" r="47" stroke="currentColor" strokeWidth="2" />
                            <path
                                d="M48 34.4A13.185 13.185 0 0 0 37.473 29a12.717 12.717 0 0 0-6.72 1.939c-6.46 3.995-8.669 12.844-4.942 19.766"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                        </svg>

                        <h2 className="font-semibold mt-2">Activity On Your Posts</h2>
                        <p className="text-sm text-zinc-600 mt-1">
                            When someone likes or comments on your posts, you’ll see it here.
                        </p>
                    </div>
                )}

                {/* ================= SUGGESTIONS ================= */}
                <p className="py-2 w-full font-medium">Suggestion for you</p>

                <div className="flex flex-col gap-5">
                    {suggestionId.map((user) => (
                        <div
                            key={user.Id}
                            className="w-full flex items-center justify-between gap-5"
                        >
                            <div className="flex gap-3 w-4/5">
                                <img
                                    src={user.image_src}
                                    className="w-10 h-10 rounded-full border object-cover"
                                    alt=""
                                />

                                <div className="flex flex-col">
                                    <p className="text-sm">{user.Username}</p>
                                    <p className="text-xs text-zinc-600">{user.First_name}</p>
                                </div>
                            </div>

                            <button className="px-6 py-1 bg-sky-500 hover:bg-sky-700 rounded-lg text-white text-sm">
                                Follow
                            </button>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
