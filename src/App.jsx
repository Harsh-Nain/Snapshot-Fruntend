import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/navbar.jsx";

import Home from "./pages/home.jsx";
import Profile from "./pages/profile.jsx";
import Post from "./pages/post.jsx";
import Messages from "./pages/message.jsx";
import Login from "./pages/login.jsx";
import Signup from "./pages/signup.jsx";
import OtherUser from "./pages/otherUser.jsx";
import EditPost from "./pages/editpost.jsx";

function App() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/api/auth/register" || location.pathname === "/api/auth/login";

  return (
    <>
      {!hideNavbar && <Navbar />}
      <div className="flex flex-row w-full justify-around w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/api/profile" element={<Profile />} />
          <Route path="/user" element={<OtherUser />} />
          <Route path="/api/post/post" element={<Post />} />
          <Route path="/post/edit" element={<EditPost />} />
          <Route path="/api/message/message" element={<Messages />} />
          <Route path="/api/auth/login" element={<Login />} />
          <Route path="/api/auth/register" element={<Signup />} />
        </Routes>
      </div>
    </>
  );
}

export default App;