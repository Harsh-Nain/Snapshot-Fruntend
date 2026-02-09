import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { FiCopy, FiTrash2, FiMoreHorizontal } from "react-icons/fi";
import { io } from "socket.io-client";
import {
  FiSend,
  FiPaperclip,
  FiArrowLeft,
  FiSearch,
  FiMoreVertical,
  FiSmile,
} from "react-icons/fi";
import { OnTime } from "../components/agotime";
import DotSpinner from "../components/dot-spinner-anim";
import "../App.css";

export default function Messages() {
  const API_URL = import.meta.env.VITE_BACKEND_API_URL;

  const [activeMsgId, setActiveMsgId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);



  const [user, setUser] = useState(null);
  const [currentId, setCurrentId] = useState(null);

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openChatId, setOpenChatId] = useState(null);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);

  const [sending, setSending] = useState(true);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [showChat, setShowChat] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const deleteMessage = async (msgId) => {
    try {
      await fetch(`${API_URL}/api/message/unSend?messid=${msgId}`, {
        method: "DELETE",
        credentials: "include",
      });

      setMessages((prev) => prev.filter((m) => m.Id !== msgId));
      setConfirmDeleteId(null);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };


  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!currentId) return;

    socketRef.current = io(API_URL, {
      auth: { userId: String(currentId) },
      transports: ["websocket"],
      withCredentials: true,
    });

    socketRef.current.on("recieveMessage", (data) => {
      if (Number(data.FromId) === Number(openChatId)) {
        setMessages((prev) => [
          ...prev,
          {
            Id: Date.now(),
            message: data.message,
            fromMe: false,
            created_at: data.created_at,
          },
        ]);
      }
      fetchUsers();
    });

    socketRef.current.on("typing", ({ from }) => {
      if (from === openChatId) {
        setTyping(true);
        setTimeout(() => setTyping(false), 1500);
      }
    });

    return () => socketRef.current.disconnect();
  }, [currentId, openChatId]);

  useLayoutEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/message/message`, {
        credentials: "include",
      });
      const data = await res.json();
      setUser(data.user);
      setCurrentId(data.Id);
      setLoading(false);
      fetchUsers();
    })();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch(`${API_URL}/api/message/userlist`, {
      credentials: "include",
    });
    const data = await res.json();
    setUsers(data.message || []);
  };

  const openChat = async (u) => {
    setSelectedUser(u);
    setOpenChatId(u.Id);
    setMessages([]);
    if (isMobile) setShowChat(true);

    const res = await fetch(
      `${API_URL}/api/message/showMessage?Id=${u.Id}`,
      { method: "POST", credentials: "include" }
    );
    const data = await res.json();
    setMessages(data.data || []);
  };

  const goBack = () => {
    setShowChat(false);
    setSelectedUser(null);
  };

  useEffect(() => {
    setSending(!message.trim() && files.length === 0);
  }, [message, files]);

  const sendMessage = async () => {
    if (!message.trim() && files.length === 0) return;

    const formData = new FormData();
    formData.append("message", message);
    formData.append("reciverId", openChatId);

    files.forEach((file) => {
      formData.append("files", file);
    });

    const res = await fetch(`${API_URL}/api/message/saveMessage`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const result = await res.json();

    if (result.success) {
      setMessages((prev) => [
        ...prev,
        {
          Id: result.data.Id,
          message: result.data.message,
          url: result.data.url,
          fromMe: true,
          created_at: result.data.created_at,
        },
      ]);

      socketRef.current.emit("sendMessage", {
        to: openChatId,
        message: result.data.message,
        files: result.data.url,
        FromId: currentId,
        created_at: result.data.created_at,
      });

      setMessage("");
      setFiles([]);
    }
  };


  const handleTyping = (e) => {
    setMessage(e.target.value);
    socketRef.current.emit("typing", { to: openChatId });
  };

  return (
    <div className="flex w-full h-[91vh] sm:h-screen bg-white overflow-hidden">

      {loading && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <DotSpinner size="3rem" color="#000" />
        </div>
      )}

      {(!isMobile || !showChat) && (
        <div className="w-full sm:w-[30%] border-r flex flex-col">
          <div className="p-4 font-bold text-lg">{user?.Username}</div>

          <div className="px-4">
            <div className="flex items-center bg-gray-100 rounded-full px-3">
              <FiSearch />
              <input
                placeholder="Search"
                className="bg-transparent px-2 py-2 outline-none w-full"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto mt-4 px-2">
            {users.map((u) => (
              <button
                key={u.Id}
                onClick={() => openChat(u)}
                className="w-full flex gap-3 p-3 rounded-xl hover:bg-gray-100"
              >
                <img
                  src={u.image_src}
                  className="w-11 h-11 rounded-full object-cover"
                />
                <div className="text-left flex-1">
                  <p className="font-medium">{u.Username}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {u.lastMessage || "Sent a media"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-xl w-[280px] text-center">
            <p className="font-medium mb-4">
              Delete this message?
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-1 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={() => deleteMessage(confirmDeleteId)}
                className="px-4 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {previewImage && (
        <div className="fixed inset-0 bg-black/90 z-[999] flex items-center justify-center">

          {/* CLOSE BUTTON */}
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 text-white text-3xl hover:opacity-80"
          >
            ✕
          </button>

          {/* IMAGE */}
          <img
            src={previewImage}
            alt="preview"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}


      {(!isMobile || showChat) && (
        <div className="flex-1 flex flex-col">
          {!selectedUser ? (
            <div className="flex items-center justify-center h-full">
              <h2 className="text-xl font-bold">Select a chat</h2>
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
                  <img
                    src={selectedUser.image_src}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex flex-col">
                    <p className="font-semibold">{selectedUser.Username}</p>
                    <p className="text-xs">{selectedUser.First_name}</p>
                  </div>
                </div>
                <FiMoreVertical />
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m, i) => (
                  <div
                    key={i} onMouseEnter={() => setActiveMsgId(m.Id)}
                    onMouseLeave={() => setActiveMsgId(null)}
                    className={`flex ${m.fromMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className="relative max-w-[75%] group"
                      onMouseEnter={() => setActiveMsgId(m.Id)}
                      onMouseLeave={() => setActiveMsgId(null)}
                    >
                      {m.message && (
                        <div
                          className={`px-4 py-2 text-sm shadow break-words
          ${m.fromMe
                              ? "bg-gradient-to-br from-pink-500 to-orange-400 text-white rounded-2xl rounded-br-md"
                              : "bg-gray-100 text-black rounded-2xl rounded-bl-md"
                            }`}
                        >
                          {m.message}
                        </div>
                      )}

                      {/* FILES */}
                      {Array.isArray(m.url) &&
                        m.url.map((file, idx) => (
                          <div key={idx} className="mt-2">
                            {file.type?.startsWith("image") && (
                              <img
                                src={file.url}
                                alt="img"
                                onClick={() => setPreviewImage(file.url)}
                                className="rounded-xl max-w-[220px] cursor-pointer hover:opacity-90 transition"
                              />
                            )}


                            {file.type?.startsWith("video") && (
                              <video
                                controls
                                src={file.url}
                                className="rounded-xl max-w-[240px]"
                              />
                            )}

                            {file.type?.startsWith("audio") && (
                              <audio controls src={file.url} className="w-[220px]" />
                            )}

                            {file.type?.startsWith("application") && (
                              <a
                                href={file.url}
                                download
                                className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow text-sm"
                              >
                                📄 <span className="truncate max-w-[160px]">{file.name}</span>
                              </a>
                            )}
                          </div>
                        ))}

                      {/* TIME */}
                      <p
                        className={`text-[10px] mt-1 opacity-70 ${m.fromMe ? "text-right" : "text-left"
                          }`}
                      >
                        {OnTime(m.created_at)}
                      </p>

                      {/* ACTION MENU (HOVER) */}
                      {activeMsgId === m.Id && (
                        <div
                          className={`absolute top-1/2 -translate-y-1/2 flex gap-1
          ${m.fromMe ? "-left-16" : "-right-16"}`}
                        >
                          {/* COPY */}
                          {m.message && (
                            <button
                              onClick={() => navigator.clipboard.writeText(m.message)}
                              className="bg-white shadow p-2 rounded-full hover:bg-gray-100"
                              title="Copy"
                            >
                              <FiCopy size={14} />
                            </button>
                          )}

                          {/* DELETE (ONLY OWN MESSAGE) */}
                          {m.fromMe && (
                            <button
                              onClick={() => setConfirmDeleteId(m.Id)}
                              className="bg-white shadow p-2 rounded-full text-red-500 hover:bg-red-50"
                              title="Delete"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                ))}

                {/* TYPING INDICATOR */}
                {typing && (
                  <p className="text-xs text-gray-400 italic px-2">
                    typing...
                  </p>
                )}

                {/* AUTO SCROLL */}
                <div ref={messagesEndRef} />
              </div>

              {/* INPUT */}
              <div className="w-full border-t bg-white px-3 py-2">

                {/* FILE PREVIEW */}
                {files.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto mb-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg text-xs"
                      >
                        <span className="truncate max-w-[120px]">
                          {file.name}
                        </span>
                        <button
                          onClick={() =>
                            setFiles((prev) => prev.filter((_, i) => i !== index))
                          }
                          className="text-red-500"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* INPUT ROW */}
                <div className="flex items-center gap-2 w-full">
                  <label htmlFor="file" className="cursor-pointer text-xl">
                    <FiPaperclip />
                  </label>

                  <input
                    id="file"
                    type="file"
                    hidden
                    multiple
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                    onChange={(e) => setFiles([...e.target.files])}
                  />

                  <input
                    value={message}
                    onChange={handleTyping}
                    placeholder="Message..."
                    className="flex-1 bg-gray-100 px-4 py-2 rounded-full outline-none"
                  />

                  {/* <FiSmile className="text-xl text-gray-500" /> */}

                  <button
                    onClick={sendMessage}
                    disabled={sending}
                    className={`p-2 rounded-full ${sending
                      ? "text-gray-400"
                      : "bg-gradient-to-r from-pink-500 to-orange-400 text-white"
                      }`}
                  ><FiSend />
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
