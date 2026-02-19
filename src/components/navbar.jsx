import { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { FiSearch } from "react-icons/fi";

export default function Navbar() {
    const API_URL = import.meta.env.VITE_BACKEND_API_URL;
    const navigate = useNavigate();
    const location = useLocation();

    const [isDesktop, setIsDesktop] = useState(false);
    const [query, setQuery] = useState("");
    const [users, setUsers] = useState([]);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    useEffect(() => {
        const resize = () => setIsDesktop(window.innerWidth >= 768);
        resize();
        window.addEventListener("resize", resize);
        return () => window.removeEventListener("resize", resize);
    }, []);

    useEffect(() => {
        if (query.trim().length < 2) {
            setUsers([]);
            return;
        }

        const controller = new AbortController();
        const timer = setTimeout(async () => {
            const res = await fetch(`${API_URL}/search?q=${query}`, { credentials: "include", signal: controller.signal });
            setUsers(await res.json());

        }, 350);

        return () => { controller.abort(); clearTimeout(timer); };
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
                <aside className="w-[250px] sticky top-0 h-[100vh] flex flex-col justify-between px-6 py-8 bg-white border-r border-gray-200">

                    <div className="flex flex-col gap-2">
                        <NavLink onClick={() => setIsSearchOpen(false)} to="/" className="px-3 pb-8">
                            <span className="text-3xl font-black font-normal tracking-tight bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300">
                                Snapshot
                            </span>
                        </NavLink>

                        <NavLink onClick={() => setIsSearchOpen(false)} to="/" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition  ${isActive ? "font-semibold text-black" : "text-gray-700 hover:bg-gray-100"}`}             >
                            {location.pathname === "/" ? <HomeFilled /> : <HomeOutline />}
                            <span>Home</span>
                        </NavLink>

                        <button onClick={() => setIsSearchOpen(!isSearchOpen)} className={`flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition${isSearchOpen ? "font-semibold text-black" : "text-gray-700 hover:bg-gray-100"}`} >
                            <SearchOutline />
                            <span>Search</span>
                        </button>

                        <NavLink onClick={() => setIsSearchOpen(false)} to="/post/post" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition ${isActive ? "font-semibold text-black" : "text-gray-700 hover:bg-gray-100"}`}>
                            <CreateOutline />
                            <span>Create</span>
                        </NavLink>

                        <NavLink onClick={() => setIsSearchOpen(false)} to="/message/mess" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition   ${isActive ? "font-semibold text-black" : "text-gray-700 hover:bg-gray-100"}`}                 >
                            <MessageOutline />
                            <span>Messages</span>
                        </NavLink>

                        <NavLink onClick={() => setIsSearchOpen(false)} to="/profile" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition${isActive ? "font-semibold text-black" : "text-gray-700 hover:bg-gray-100"}`}              >
                            <img src="https://res.cloudinary.com/ddiyrbync/image/upload/v1770102978/orttx8y25exmweuqgcju.png" className="w-6 h-6 rounded-full object-cover" alt="" />
                            <span>Profile</span>
                        </NavLink>

                    </div>

                    <button onClick={Logout} className="flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-red-500 transition">
                        <LogoutOutline />
                        <span>Logout</span>
                    </button>

                </aside>
            )}

            {isSearchOpen && (
                <div className="fixed md:left-[220px] z-50 w-full md:w-[400px] h-screen bg-white border-l border-gray-200 flex flex-col">

                    <div className="p-5 border-b border-gray-200">
                        <h2 className="font-semibold text-lg mb-4 text-black">Search</h2>

                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                            <SearchOutline className="text-gray-500" />

                            <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users..." className="w-full bg-transparent outline-none text-sm text-black" />

                            {query && (<button onClick={() => setQuery("")}><ClearIcon /></button>)}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">

                        {users.map((user) => (
                            <div key={user.Id} onClick={() => { setIsSearchOpen(false); navigate(`/user?username=${user.Username}&Id=${user.Id}`); }} className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-gray-100 transition">
                                <img src={user.image_src} className="w-10 h-10 rounded-full object-cover" alt="" />

                                <div>
                                    <p className="text-sm font-semibold text-black">{user.Username}</p>
                                    <p className="text-xs text-gray-500">{user.First_name}</p>
                                </div>
                            </div>
                        ))}

                        {query.length < 0 || users.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-center">

                                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 mb-4">
                                    <FiSearch size={28} className="text-gray-400" />
                                </div>

                                <h3 className="text-base font-semibold text-gray-800">
                                    No results found
                                </h3>

                                <p className="text-sm text-gray-500 mt-2 max-w-xs">
                                    We couldn’t find anyone matching <span className="font-medium">"{query}"</span>.
                                </p>

                            </div>
                        )}

                    </div>
                </div>
            )}

            {!isDesktop && (
                <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 flex justify-around py-3 z-9999">

                    {[
                        { to: "/", icon: location.pathname === "/" ? <HomeFilled /> : <HomeOutline /> },
                        { to: "/message/mess", icon: <MessageOutline /> },
                        { to: "/post/post", icon: <CreateOutline /> },
                        { to: "/profile", icon: (<img src="https://res.cloudinary.com/ddiyrbync/image/upload/v1770102978/orttx8y25exmweuqgcju.png" className="w-6 h-6 rounded-full object-cover" alt="" />) }
                    ].map((item, index) => (
                        <NavLink key={index} onClick={() => setIsSearchOpen(false)} to={item.to} className={({ isActive }) => `flex items-center justify-center p-3 transition ${isActive ? "text-black" : "text-gray-500"}`}>
                            {item.icon}
                        </NavLink>
                    ))}

                    <button onClick={() => setIsSearchOpen(!isSearchOpen)} className={`flex items-center justify-center p-3 transition ${isSearchOpen ? "text-black" : "text-gray-500"}`}><SearchOutline /></button>

                </nav>)}

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