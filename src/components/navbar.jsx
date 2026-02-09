import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
    const navigate = useNavigate();
    const [isDesktop, setIsDesktop] = useState(false);
    const API_URL = import.meta.env.VITE_BACKEND_API_URL

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 768);
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const Logout = async () => {
        const res = await fetch(`${API_URL}/api/logout`, {
            method: "GET",
            credentials: "include",
        });

        const result = await res.json();
        console.log("ok");

        navigate(result.redirect);
    };


    const activeClass = "bg-zinc-100 border border-white rounded-lg";

    const navItemClass = (isActive) => `p-2 flex gap-3 items-center rounded-lg ${isActive ? activeClass : "hover:bg-zinc-100"}`;

    return (
        <>
            {isDesktop ? (<aside className="flex w-1/5 h-[100vh] flex-col gap-4 py-4 px-3 border-r border-black bg-white buttonBar">

                <NavLink to="/" className="flex items-center gap-2 pt-5">
                    <img src="https://res.cloudinary.com/ddiyrbync/image/upload/v1767356520/ChatGPT_Image_Jan_2_2026_05_50_04_PM_xpxaqz.jpg" className="size-10 object-cover" alt="App logo" />
                    <span className="text-xl font-serif overflow-hidden">Snapshot </span>
                </NavLink>

                <NavLink to="/" className={({ isActive }) => navItemClass(isActive)}>
                    <svg fill="currentColor" width="24" height="24" viewBox="0 0 24 24">
                        <path d="m21.762 8.786-7-6.68a3.994 3.994 0 0 0-5.524 0l-7 6.681A4.017 4.017 0 0 0 1 11.68V19c0 2.206 1.794 4 4 4h3.005a1 1 0 0 0 1-1v-7.003a2.997 2.997 0 0 1 5.994 0V22a1 1 0 0 0 1 1H19c2.206 0 4-1.794 4-4v-7.32a4.02 4.02 0 0 0-1.238-2.894Z" />
                    </svg>
                    <span>Home</span>
                </NavLink>

                <NavLink to="/api/profile" className={({ isActive }) => navItemClass(isActive)}>
                    <img src="https://res.cloudinary.com/ddiyrbync/image/upload/v1770102978/orttx8y25exmweuqgcju.png" className="size-7 rounded-full" alt="User profile" />
                    <span>Profile</span>
                </NavLink>

                <NavLink to="/api/post/post" className={({ isActive }) => navItemClass(isActive)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                        <rect x="3" y="3" width="18" height="18" rx="3" /><path d="M12 8v8" /><path d="M8 12h8" />
                    </svg>
                    <span>Post</span>
                </NavLink>

                <NavLink to="/api/message/message" className={({ isActive }) => navItemClass(isActive)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span>Messages</span>
                </NavLink>

                <button onClick={() => Logout()} className="p-2 mt-auto hover:bg-zinc-100 flex gap-3 items-center rounded-lg">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" />
                    </svg>
                    <span>Logout</span>
                </button>

            </aside>) : (
                <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-300 flex justify-around items-center py-2 md:hidden buttonBar">

                    <NavLink to="/">
                        <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" className="w-6 h-6">
                            <path d="M3 9.5L12 3l9 6.5" /><path d="M5 10.5V21h4v-6a2 2 0 0 1 4 0v6h4V10.5" />
                        </svg>
                    </NavLink>

                    <NavLink to="/api/post/post">
                        <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" className="w-6 h-6">
                            <rect x="3" y="3" width="18" height="18" rx="3" /><path d="M12 8v8" /><path d="M8 12h8" />
                        </svg>
                    </NavLink>

                    <NavLink to="/api/message/message">
                        <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" className="w-6 h-6">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    </NavLink>

                    <NavLink to="/api/profile">
                        <img src="https://res.cloudinary.com/ddiyrbync/image/upload/v1770102978/orttx8y25exmweuqgcju.png" className="size-9 rounded-full" alt="User profile" />
                    </NavLink>

                </nav>)}
        </>
    );
}
