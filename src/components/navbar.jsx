import { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
    const API_URL = import.meta.env.VITE_BACKEND_API_URL;
    const navigate = useNavigate();
    const location = useLocation();

    const [isDesktop, setIsDesktop] = useState(false);
    const [query, setQuery] = useState("");
    const [users, setUsers] = useState([]);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const resize = () => setIsDesktop(window.innerWidth >= 768);
        resize();
        window.addEventListener("resize", resize);
        return () => window.removeEventListener("resize", resize);
    }, []);

    useEffect(() => {
        if (query.trim().length < 2) {
            setUsers([]);
            setLoading(false);
            return;
        }

        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                setLoading(true);
                const res = await fetch(
                    `${API_URL}/search?q=${query}`,
                    { credentials: "include", signal: controller.signal }
                );
                setUsers(await res.json());
            } catch { }
            finally {
                setLoading(false);
            }
        }, 350);

        return () => {
            controller.abort();
            clearTimeout(timer);
        };
    }, [query]);

    useEffect(() => {
        if (!isSearchOpen) return;
        const esc = (e) => e.key === "Escape" && setIsSearchOpen(false);
        window.addEventListener("keydown", esc);
        return () => window.removeEventListener("keydown", esc);
    }, [isSearchOpen]);

    const Logout = async () => {
        setIsSearchOpen(false)
        const res = await fetch(`${API_URL}/api/logout`, {
            method: "GET",
            credentials: "include",
        });
        const result = await res.json();
        navigate(result.redirect);
    };

    return (
        <>
            {isDesktop && (
                <aside className="w-[250px] h-screen sticky top-0 flex flex-col  justify-between px-3 py-4 border-r bg-white">
                    <div className="flex flex-col gap-1">
                        <NavLink onClick={() => setIsSearchOpen(false)} to="/" className="px-3 pb-6">
                            <span className="text-2xl font-[cursive] tracking-tight text-sky-400">Snapshot</span>
                        </NavLink>

                        <NavLink onClick={() => setIsSearchOpen(false)} to="/" className={({ isActive }) => `flex items-center gap-4 px-3 py-3 rounded-lg transition ${isActive ? "bg-sky-100 font-semibold" : "hover:bg-zinc-100"}`}>
                            {location.pathname === "/" ? <HomeFilled /> : <HomeOutline />}
                            <span className="text-sm">Home</span>
                        </NavLink>

                        <button onClick={() => setIsSearchOpen(!isSearchOpen)} className={`flex cursor-pointer items-center gap-4 px-3 py-3 rounded-lg transition ${isSearchOpen ? "bg-green-100 font-semibold" : "hover:bg-zinc-100"}`}>
                            <SearchOutline />
                            <span className="text-sm">Search</span>
                        </button>

                        <NavLink onClick={() => setIsSearchOpen(false)} to="/api/post/post" className={({ isActive }) => `flex items-center gap-4 px-3 py-3 rounded-lg transition ${isActive ? "bg-sky-100 font-semibold" : "hover:bg-zinc-100"}`}>
                            <CreateOutline />
                            <span className="text-sm">Create</span>
                        </NavLink>

                        <NavLink onClick={() => setIsSearchOpen(false)} to="/api/message/message" className={({ isActive }) => `flex items-center gap-4 px-3 py-3 rounded-lg transition ${isActive ? "bg-sky-100 font-semibold" : "hover:bg-zinc-100"}`}>
                            <MessageOutline />
                            <span className="text-sm">Messages</span>
                        </NavLink>

                        <NavLink onClick={() => setIsSearchOpen(false)} to="/api/profile" className={({ isActive }) => `flex items-center gap-4 px-3 py-3 rounded-lg transition ${isActive ? "bg-sky-100 font-semibold" : "hover:bg-zinc-100"}`}>
                            <img src="https://res.cloudinary.com/ddiyrbync/image/upload/v1770102978/orttx8y25exmweuqgcju.png" className="w-6 h-6 rounded-full" alt="" />
                            <span className="text-sm">Profile</span>
                        </NavLink>
                    </div>

                    <button onClick={Logout} className="flex items-center gap-4 px-3 py-3 rounded-lg transition hover:bg-zinc-100" >
                        <LogoutOutline />
                        <span className="text-sm">Logout</span>
                    </button>
                </aside>
            )}

            {isSearchOpen && (
                <>
                    <div className="fixed h-[90vh] md:h-[100vh] top-0 md:left-[213px] z-50 w-full md:w-[420px] h-screen bg-white md:rounded-3xl shadow-xl flex flex-col">

                        <div className="p-4 border-b">
                            <h2 className="font-semibold text-lg mb-3">Search</h2>
                            <div className="flex items-center gap-2 bg-zinc-100 rounded-lg px-3 py-2">
                                <SearchOutline className="text-zinc-400" />
                                <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className="w-full bg-transparent outline-none text-sm" />
                                {query && (
                                    <button onClick={() => setQuery("")}>
                                        <ClearIcon />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {loading && (
                                <p className="text-center text-sm text-zinc-500 mt-6">
                                    Searching…
                                </p>
                            )}

                            {!loading && users.length === 0 && query.length >= 2 && (
                                <p className="text-center text-sm text-zinc-500 mt-6">
                                    No results found
                                </p>
                            )}

                            {users.map((user) => (
                                <div key={user.Id} onClick={() => navigate(`/user?username=${user.Username}&Id=${user.Id}`)} className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-zinc-100">
                                    <img src={user.image_src} onClick={() => setIsSearchOpen(false)} className="w-10 h-10 rounded-full object-cover" alt="" />

                                    <div className="leading-tight" onClick={() => setIsSearchOpen(false)}>
                                        <p className="text-sm font-semibold">
                                            {user.Username}
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                            {user.First_name}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {(users.length < 1 && !query) && (
                                <p className="flex justify-center items-center text-center text-sm text-zinc-500 mt-6 h-[60vh]">
                                    Start typing a username to <br /> search for users...
                                </p>
                            )}

                        </div>
                    </div>
                </>
            )}

            {!isDesktop && (
                <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t flex justify-around py-2 z-999999999">

                    <NavLink onClick={() => setIsSearchOpen(false)} to="/" className={({ isActive }) => `flex items-center gap-4 px-3 py-3 rounded-lg transition ${isActive ? "bg-sky-100 font-semibold" : "hover:bg-zinc-100"}`}>
                        {location.pathname === "/" ? <HomeFilled /> : <HomeOutline />}
                    </NavLink>

                    <NavLink onClick={() => setIsSearchOpen(!isSearchOpen)} className={`flex items-center gap-4 px-3 py-3 rounded-lg transition ${isSearchOpen ? "bg-sky-100 font-semibold" : "hover:bg-zinc-100"}`}>
                        <SearchOutline />
                    </NavLink>

                    <NavLink onClick={() => setIsSearchOpen(false)} to="/api/post/post" className={({ isActive }) => `flex items-center gap-4 px-3 py-3 rounded-lg transition ${isActive ? "bg-sky-100 font-semibold" : "hover:bg-zinc-100"}`}>
                        <CreateOutline />
                    </NavLink>

                    <NavLink onClick={() => setIsSearchOpen(false)} to="/api/message/message" className={({ isActive }) => `flex items-center gap-4 px-3 py-3 rounded-lg transition ${isActive ? "bg-sky-100 font-semibold" : "hover:bg-zinc-100"}`}>
                        <MessageOutline />
                    </NavLink>

                    <NavLink onClick={() => setIsSearchOpen(false)} to="/api/profile" className={({ isActive }) => `flex items-center gap-4 px-3 py-3 rounded-lg transition ${isActive ? "bg-sky-100 font-semibold" : "hover:bg-zinc-100"}`}>
                        <img src="https://res.cloudinary.com/ddiyrbync/image/upload/v1770102978/orttx8y25exmweuqgcju.png" className="w-6 h-6 rounded-full" alt="" />
                    </NavLink>
                </nav>
            )}
        </>
    );
}

const Icon = ({ children, className = "" }) => (
    <span className={`w-6 h-6 ${className}`}>{children}</span>
);

const HomeOutline = () => (
    <Icon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 9.5L12 3l9 6.5" />
            <path d="M5 10.5V21h4v-6a2 2 0 0 1 4 0v6h4V10.5" />
        </svg>
    </Icon>
);

const HomeFilled = () => (
    <Icon>
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3l9 6.5V21h-6v-6a3 3 0 0 0-6 0v6H3V9.5L12 3z" />
        </svg>
    </Icon>
);

const SearchOutline = ({ className = "" }) => (
    <Icon className={className}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    </Icon>
);

const CreateOutline = () => (
    <Icon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="3" width="18" height="18" rx="4" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
    </Icon>
);

const MessageOutline = () => (
    <Icon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    </Icon>
);

const LogoutOutline = () => (
    <Icon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
        </svg>
    </Icon>
);

const ClearIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);