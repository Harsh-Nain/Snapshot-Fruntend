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
  const hideNavbar = location.pathname === "/auth/register" || location.pathname === "/auth/login";

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/user" element={<OtherUser />} />
        <Route path="/post/post" element={<Post />} />
        <Route path="/post/edit" element={<EditPost />} />
        <Route path="/message/mess" element={<Messages />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Signup />} />
      </Routes>
    </>
  );
}

export default App;