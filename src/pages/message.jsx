import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { FiCopy, FiTrash2 } from "react-icons/fi";
import { io } from "socket.io-client";
import { FiSend, FiPaperclip, FiArrowLeft, FiSearch, FiMoreVertical, FiMessageCircle } from "react-icons/fi";

import { OnTime } from "../components/agotime";
import DotSpinner from "../components/dot-spinner-anim";
import "../App.css";
import { useNavigate } from "react-router-dom";
import { GiTireIronCross } from "react-icons/gi";

export default function Messages() {
  const API_URL = import.meta.env.VITE_BACKEND_API_URL;

  const navigate = useNavigate()
  const [activeMsgId, setActiveMsgId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [activeUserOption, setActiveUserOption] = useState(null);
  const [confirmChatDelete, setConfirmChatDelete] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loadDlt, setloadDlt] = useState(false);
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");

  const [user, setUser] = useState(null);
  const [currentId, setCurrentId] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);
  const [openChatId, setOpenChatId] = useState(null);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);

  const [sending, setSending] = useState(true);
  const [loading, setLoading] = useState(false);
  const [LoadMess, setLoadMess] = useState(false);
  const [typing, setTyping] = useState(false);
  const [senddd, setSenddd] = useState(true);
  const pageRef = useRef(2);
  const loadingRef = useRef(false);
  const noMoreRef = useRef(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [showChat, setShowChat] = useState(false);
  const [messloaging, setMessLoading] = useState(false);
  const [Dltloaging, setDltLoading] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const MessContainer = useRef()

  const deleteMessage = async (msgId) => {
    setDltLoading(true)
    await fetch(`${API_URL}/api/message/unSend?messid=${msgId}`, { method: "DELETE", credentials: "include", });

    setMessages((prev) => prev.filter((m) => m.Id !== msgId));
    setConfirmDeleteId(null);
    setDltLoading(false)

    socketRef.current.emit("deleteMess", { to: openChatId, Id: msgId, message: "Message has been deleted", FromId: currentId });
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!currentId) return;

    socketRef.current = io(API_URL, { auth: { userId: String(currentId) }, transports: ["websocket"], withCredentials: true, });

    socketRef.current.on("recieveMessage", (data) => {
      if (Number(data.FromId) === Number(openChatId)) {
        setMessages((prev) => [...prev, data,]);
      }
      setUsers((prev) => {
        const updated = prev.map((u) => u.Id === data.FromId ? { ...u, lastMessage: data.message } : u);
        const sender = updated.find((u) => u.Id === data.FromId);
        const rest = updated.filter((u) => u.Id !== data.FromId);

        return sender ? [sender, ...rest] : updated;
      });

      fetchUsers();
    });

    socketRef.current.on("deletedrecive", (data) => {
      if (Number(data.FromId) === Number(openChatId)) {
        setMessages(prevMessages => prevMessages.map(msg => msg.Id === data.Id ? { ...msg, message: data.message } : msg));
      }
    });

    socketRef.current.on("online:list", ({ onlineUsers }) => {
      setUsers((prevUsers) => {
        const updated = prevUsers.map((u) => ({ ...u, isOnline: onlineUsers.includes(String(u.Id)), }));

        return updated.sort((a, b) => {
          if (a.isOnline === b.isOnline) return 0;
          return a.isOnline ? -1 : 1;
        });
      });
    });

    let typingTimeout;

    socketRef.current.on("typing", (data) => {
      if (Number(data.FromId) === Number(openChatId)) {
        setTyping(true);

        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => setTyping(false), 2000);
      }
    });

    return () => socketRef.current.disconnect();
  }, [currentId, openChatId]);

  useLayoutEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/message/message`, { credentials: "include", });
      const data = await res.json();

      setUser(data.user);
      setCurrentId(data.Id);
      setLoading(false);
      fetchUsers();
    })();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch(`${API_URL}/api/message/userlist`, { credentials: "include", });
    const data = await res.json();
    const list = data.message || [];

    setAllUsers(list);
    setUsers(list);
  };

  const openChat = async (u) => {
    setSelectedUser(u);
    setOpenChatId(u.Id);
    setMessages([]);

    pageRef.current = 1;
    noMoreRef.current = false;
    loadingRef.current = false;

    if (isMobile) setShowChat(true);
    setLoading(true)

    const res = await fetch(`${API_URL}/api/message/showMessage?Id=${u.Id}`, { method: "POST", credentials: "include" });
    const data = await res.json();
    setMessages(data.data || []);
    setLoading(false)

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView();
    }, 0);
  };

  const goBack = () => { setShowChat(false); setSelectedUser(null); };

  useEffect(() => {
    setSending(!message.trim() && files.length === 0);
  }, [message, files]);

  const sendMessage = async () => {
    if (!message.trim() && files.length === 0) return;
    setLoadMess(true)
    setSenddd(false)

    const formData = new FormData();
    formData.append("message", message);
    formData.append("reciverId", openChatId);

    files.forEach((file) => formData.append("files", file));

    const res = await fetch(`${API_URL}/api/message/saveMessage`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const result = await res.json();

    if (result.success) {
      const lastMessageId = messages.length > 0 && messages[messages.length - 1].Id + 1;

      setSenddd(true)
      setMessages((prev) => [...prev, { Id: lastMessageId, message: result.data.message, url: result.data.files, fromMe: true, created_at: result.data.created_at, },]);
      socketRef.current.emit("sendMessage", { to: openChatId, message: result.data.message, url: result.data.files, FromId: currentId, created_at: result.data.created_at, });

      setMessage("");
      setLoadMess(false)
      setFiles([]);
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    socketRef.current.emit("typing", { to: openChatId });
  };

  async function loadMessages() {
    if (loadingRef.current || noMoreRef.current || !openChatId) return;

    const container = MessContainer.current;
    if (!container) return;

    loadingRef.current = true;
    setMessLoading(true);

    const prevScrollHeight = container.scrollHeight;

    const res = await fetch(`${API_URL}/api/message/loadmess?page=${pageRef.current}&Id=${openChatId}`, { credentials: "include" });

    const result = await res.json();
    const oldMessages = result.data || [];

    if (oldMessages.length === 0) {
      noMoreRef.current = true;
      setMessLoading(false);
      loadingRef.current = false;
      return;
    }

    setMessages(prev => [...oldMessages, ...prev]);

    pageRef.current += 1;

    requestAnimationFrame(() => { const newScrollHeight = container.scrollHeight; container.scrollTop = newScrollHeight - prevScrollHeight; });

    setMessLoading(false);
    loadingRef.current = false;
  }

  const toggleActions = (id) => { setActiveMsgId(prev => (prev === id ? null : id)); };

  const formatLastTime = (time) => {
    if (!time) return "";

    const diff = Date.now() - new Date(time).getTime();
    const min = Math.floor(diff / 60000);

    if (min < 1) return "now";
    if (min < 60) return `${min}m`;

    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h`;

    return new Date(time).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  const otherUser = (userId, username) => {

    if (userId == currentId) return navigate('/api/profile')
    navigate(`/user?username=${username}&Id=${userId}`);
  };

  useEffect(() => {

    const searchValue = query.trim().toLowerCase();

    if (searchValue === "") {
      setUsers(allUsers);
      return;
    }

    const timer = setTimeout(() => {
      const filtered = allUsers.filter((u) => u.Username?.toLowerCase().includes(searchValue) || u.First_name?.toLowerCase().includes(searchValue));
      setUsers(filtered);
    }, 300);

    return () => clearTimeout(timer);

  }, [query, allUsers]);

  const ClearChat = async (id) => {
    setloadDlt(true)
    const res = await fetch(`${API_URL}/api/message/clearchat?id=${id}`, { credentials: "include", });
    const result = await res.json();

    if (result.success) {
      setConfirmChatDelete(null)
      setOpenChatId(false)
      setSelectedUser(null)
      setUsers(pre => pre.filter(user => user.Id !== id))
    }
    setloadDlt(false)
  }

  return (
    <div className="flex w-full h-[84vh] sm:h-screen bg-white overflow-hidden">

      {loading && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <DotSpinner size="3rem" color="white" />
        </div>
      )}

      {(!isMobile || !showChat) && (
        <div className="w-full sm:w-[50%] lg:w-[30%] border-r flex flex-col">
          <div className="p-4 font-bold text-lg">{user?.Username}</div>

          <div className="px-4">
            <div className="flex items-center bg-gray-100 rounded-full px-3">
              <FiSearch />
              <input placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} className="bg-transparent px-2 py-2 outline-none w-full" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto mt-4 px-2">

            {users && users.map((u) => (
              <div key={u.Id} className="relative group">

                <button onClick={() => openChat(u)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition">
                  <div className="relative shrink-0">
                    <img src={u.image_src} alt={u.Username} className="w-11 h-11 rounded-full object-cover" />

                    {u.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold truncate">{u.Username}</p>
                      <span className="text-[11px] text-gray-400">
                        {formatLastTime(u.created_at)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 truncate">
                        {u.lastMessage || "Sent a media"}
                      </p>

                      {u.isOnline ? (
                        <span className="text-[10px] font-semibold text-green-600">
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400">
                          Offline
                        </span>
                      )}
                    </div>
                  </div>
                </button>

              </div>
            ))}

            {users.length === 0 && query.trim() !== "" && (
              <div className="flex flex-col items-center justify-center mt-10 text-center px-6">

                <div className="w-14 h-14 rounded-full bg-gray-100 
                    flex items-center justify-center mb-4">
                  <FiSearch size={20} className="text-gray-400" />
                </div>

                <h3 className="text-sm font-semibold text-gray-700">
                  No users found
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  Try searching with a different name.
                </p>

              </div>
            )}

            {users.length === 0 && (
              <div className="flex flex-col items-center -translate-y-11 justify-center h-full px-6 text-center">

                <div className="w-20 h-20 rounded-full  bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-white shadow-lg mb-5">           <FiMessageCircle size={30} />
                </div>

                <h2 className="text-lg font-semibold text-gray-800">
                  Your Messages
                </h2>

                <p className="text-sm text-gray-500 mt-2 max-w-xs">  Send private photos and messages to a friend.  Start a new conversation today.</p>

              </div>
            )}

          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-xl w-[280px] text-center">
            <p className="font-medium mb-4"> Delete this message?</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setConfirmDeleteId(null)} className="px-4 py-1 rounded-lg bg-gray-200 hover:bg-gray-300"> Cancel  </button>
              <button onClick={() => deleteMessage(confirmDeleteId)} className="px-4 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600" >{Dltloaging ? <DotSpinner size="1rem" color="white" /> : "Delete"} </button>
            </div>
          </div>
        </div>
      )}

      {previewImage && (
        <div className="fixed inset-0 bg-black/90 z-[9999999999999999999999999999999999] flex items-center justify-center">
          <button onClick={() => setPreviewImage(null)} className="absolute top-4 right-4 text-white text-3xl hover:opacity-80">✕</button>
          <img src={previewImage} alt="preview" className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl" />
        </div>
      )}

      {(!isMobile || showChat) && (
        <div className="flex-1 flex flex-col">
          {!selectedUser ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">

              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <FiMessageCircle size={26} className="text-gray-400" />
              </div>

              <h3 className="text-lg font-semibold text-gray-800">
                No conversation selected
              </h3>

              <p className="text-sm text-gray-500 mt-2">
                Choose a chat to start messaging.
              </p>

            </div>
          ) : (
            <>
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isMobile && (
                    <button onClick={goBack} className="text-xl">
                      <FiArrowLeft />
                    </button>
                  )}
                  <img src={selectedUser.image_src} className="w-10 h-10 rounded-full object-cover" />
                  <div onClick={() => otherUser(selectedUser.Id, selectedUser.Username)} className="flex flex-col">
                    <p className="font-semibold">{selectedUser.Username}</p>
                    <p className="text-xs">{selectedUser.First_name}</p>
                  </div>
                </div>
                <button onClick={() => setActiveUserOption(prev => prev === selectedUser.Id ? null : selectedUser.Id)}>
                  <FiMoreVertical />
                </button>

                {activeUserOption === selectedUser.Id && (
                  <div className="absolute right-4 top-12 bg-white border shadow-lg rounded-lg w-40 text-sm z-50">
                    <button onClick={() => setConfirmChatDelete(selectedUser.Id)} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-500">
                      Delete Chat
                    </button>
                  </div>
                )}
              </div>

              <div ref={MessContainer} className="flex-1 overflow-y-auto p-4 space-y-3">
                {(!noMoreRef.current && message.length > 1) && (
                  <div className="w-full flex justify-center mb-3">
                    <button onClick={loadMessages} disabled={messloaging} className="px-4 cursor-pointer py-1 text-xs rounded-full border bg-white shadow hover:bg-gray-100 transition disabled:opacity-60">
                      {messloaging ? (
                        <DotSpinner size="1rem" />
                      ) : (
                        "Load more messages"
                      )}
                    </button>
                  </div>
                )}

                {confirmChatDelete && (
                  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-[300px] text-center">
                      <h3 className="font-semibold mb-2">Delete Chat?</h3>
                      <p className="text-sm text-gray-500 mb-5">
                        This will remove this conversation.
                      </p>

                      <div className="flex justify-center gap-3">
                        <button onClick={() => setConfirmChatDelete(null)} className="px-4 py-1 rounded-lg bg-gray-200 hover:bg-gray-300">Cancel</button>

                        <button onClick={() => ClearChat(confirmChatDelete)} className="px-4 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600">
                          {loadDlt ? <DotSpinner size="1rem" color="white" /> : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.fromMe ? "justify-end" : "justify-start"} mb-2`} >
                    <div className="relative max-w-[75%]" onClick={() => toggleActions(m.Id)}>
                      {m.message && (
                        <div className={`px-4 py-2 text-sm break-words shadow ${m.fromMe ? "bg-gradient-to-br from-sky-500 to-violet-300 text-white rounded-2xl rounded-br-md" : "bg-gray-100 text-black rounded-2xl rounded-bl-md"}`}>
                          {m.message}
                        </div>
                      )}

                      {Array.isArray(m.url) &&
                        m.url.map((file, idx) => (
                          <div key={idx} className={`mt-2 p-1 shadow ${m.fromMe ? "bg-gradient-to-br overflow-hidden from-sky-500 to-violet-300 rounded-2xl rounded-br-md" : "bg-gray-100 rounded-2xl rounded-bl-md"}`}>
                            {file.type?.startsWith("image") && (
                              <img src={file.url} onClick={() => setPreviewImage(file.url)} className="rounded-xl max-w-[220px] cursor-pointer" />
                            )}
                            {file.type?.startsWith("video") && (
                              <video controls src={file.url} className="rounded-xl max-w-[240px]" />
                            )}
                            {file.type?.startsWith("audio") && (
                              <audio controls src={file.url} className="w-[220px]" />
                            )}
                            {file.type?.startsWith("application") && (
                              <a href={file.url} download className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow text-sm">
                                📄 <span className="truncate max-w-[160px]">{file.name}</span>
                              </a>
                            )}
                          </div>
                        ))}

                      {(m.message || m.url) && (
                        <p className={`text-[10px] mt-1 opacity-60 ${m.fromMe ? "text-right" : "text-left"}`} >
                          {OnTime(m.created_at)}
                        </p>
                      )}

                      {activeMsgId === m.Id && (
                        <div className={`flex gap-2 mt-1 transition-all duration-200 ${m.fromMe ? "justify-end" : "justify-start"}`}>
                          {m.message && (
                            <button onClick={() => navigator.clipboard.writeText(m.message)} className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-white shadow hover:bg-gray-100">
                              <FiCopy size={12} /> Copy
                            </button>
                          )}

                          {m.fromMe && (
                            <button onClick={() => {
                              setConfirmDeleteId(m.Id); console.log('okokko', m.Id);
                            }} className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-red-50 text-red-600 shadow hover:bg-red-100">
                              <FiTrash2 size={12} /> Delete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {messages.length === 1 && (
                  <div className="flex flex-col items-center justify-center h-full text-center px-6 bg-gradient-to-b from-white to-gray-50">

                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-sky-500 to-voilate-400 
                      flex items-center justify-center shadow-inner mb-5">
                      <FiMessageCircle size={32} className="text-white" />
                    </div>

                    <h2 className="text-xl font-semibold text-gray-800">
                      Your Messages
                    </h2>

                    <p className="text-sm text-gray-500 mt-2 max-w-xs">
                      Send private photos and messages to a friend or group.
                    </p>
                  </div>)}

                {typing && (<p className="text-xs text-gray-400 italic px-2">typing... </p>)}
                <div ref={messagesEndRef} />
              </div>

              <div className="w-full border-t bg-white px-3 py-2">

                {files.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto mb-2">
                    {files.map((file, index) => (

                      <div key={index} className="flex items-center gap-2 bg-gray-100 rounded-lg relative text-xs">
                        {file.type?.startsWith("image") && (
                          <img src={URL.createObjectURL(file)} onClick={() => setPreviewImage(URL.createObjectURL(file))} className="rounded-sm w-13 h-13 cursor-pointer" />
                        )}
                        {file.type?.startsWith("video") && (
                          <video controls src={URL.createObjectURL(file)} className="rounded-sm w-13 h-13" />
                        )}
                        {file.type?.startsWith("audio") && (
                          <audio controls src={URL.createObjectURL(file)} className="w-13 h-13" alt="Audio" />
                        )}
                        {file.type?.startsWith("application") && (
                          <a href={URL.createObjectURL(file)} download className="flex items-center gap-2 px-3 py-2 bg-white rounded-sm shadow text-sm">
                            📄 <span className="truncate max-w-[120px]">{file.name}</span>
                          </a>
                        )}
                        {senddd && <button onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))} className="absolute rounded-full bg-zinc-50/50 p-1 text-red-400 hover:text-red-500 cursor-pointer top-1 right-1"><GiTireIronCross strokeWidth={40} /></button>}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 w-full">
                  <label htmlFor="file" className="cursor-pointer text-xl">
                    <FiPaperclip />
                  </label>

                  <input id="file" type="file" hidden multiple accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt" onChange={(e) => setFiles([...e.target.files])} />
                  <input value={message} autoFocus onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault(); sendMessage();
                    }
                  }} onChange={handleTyping} placeholder={LoadMess ? "Sending..." : "Message..."} className="flex-1 bg-gray-100 px-4 py-2 rounded-full outline-none" />

                  <button onClick={sendMessage} disabled={sending} className={`p-2 rounded-full ${sending ? "text-gray-400" : "bg-gradient-to-r from-sky-500 to-voilate-400 text-white"}`}>{LoadMess ? <DotSpinner size="1rem" color="white" /> : <FiSend />}
                  </button>
                </div>
              </div>

            </>
          )}
        </div>
      )}

    </div>
  );
}