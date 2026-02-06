import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { io } from "socket.io-client";
import { OnTime } from "../components/agotime";
import "../App.css";
import DotSpinner from "../components/dot-spinner-anim";
import { API_URL } from "../config/api";

export default function Messages() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [Messages, setMessages] = useState([]);
  const [MessagesUser, setMessagesUser] = useState([]);
  const [sending, setSending] = useState(true);
  const [user, setUser] = useState(null);
  const [openChatId, setopenChatId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [Url, setUrl] = useState();
  const [showChat, setshowChat] = useState(false);
  const [ConfirmDlt, setConfirmDlt] = useState(false);
  const [currentId, setCurrentId] = useState();
  const [messageUplode, setmessageUplode] = useState(false);
  const [MsgDltid, setMsgDltid] = useState();
  const socketRef = useRef(null);
  const isMobile = useIsMobile(500);
  const usersContainer = useRef(null);
  const messageContainer = useRef(null);

  useEffect(() => {
    if (!user) return;

    socketRef.current = io(API_URL, {
      auth: { userId: String(currentId) },
      withCredentials: true,
      transports: ["websocket"],
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected:", socketRef.current.id);
    });

    socketRef.current.on("recieveMessage", (data) => {
      console.log("recived from", data.FromId, openChatId);

      if (Number(data.FromId) === Number(openChatId)) {
        setMessages((prev) => [
          ...prev,
          {
            Id: data.Id || Date.now(),
            message: data.message,
            url: data.files || [],
            fromMe: false,
            created_at: data.created_at,
          },
        ]);
      }

      userlist();
    });

    socketRef.current.on("online:list", ({ onlineUsers }) => {
      setMessagesUser((prev) =>
        prev.map((u) => ({
          ...u,
          isActive: onlineUsers.includes(String(u.Id)),
        }))
      );
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (!socketRef.current) return;

    socketRef.current.on("online:list", ({ onlineUsers }) => {
      setMessagesUser((prev) =>
        prev.map((u) => ({
          ...u,
          isActive: onlineUsers.includes(String(u.Id)),
        }))
      );
    });

    return () => {
      socketRef.current.off("online:list");
    };
  }, []);

  useLayoutEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "auto",
    });
  }, [Messages]);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/message/message`, {
        credentials: "include",
      });

      if (res.status === 401) return;

      const result = await res.json();

      setCurrentId(result.Id)
      setUser(result.user);
      setLoading(false);
    };

    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    fetchUser();
    userlist();
  }, []);

  useEffect(() => {
    if (!usersContainer.current || !messageContainer.current) return;

    if (isMobile && showChat) {
      usersContainer.current.classList.add("hidden");
      messageContainer.current.classList.remove("hidden");
    } else {
      usersContainer.current.classList.remove("hidden");
      messageContainer.current.classList.add("hidden");
    }
  }, [isMobile, showChat]);


  const userlist = async () => {
    const res = await fetch(`${API_URL}/api/message/userlist`, {
      credentials: "include",
    });

    if (res.status === 401) return;

    const result = await res.json();
    setMessagesUser(result.message);
  };

  const handleFileChange = (e) => {
    setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    setSending(!message.trim() && files.length === 0);
  }, [message, files]);

  console.log("🚀 EMIT sendMessage", {
    to: openChatId,
    myId: currentId,
  });

  const sendMessage = async () => {
    if (!message.trim() && files.length === 0) return;
    setmessageUplode(true)

    setSending(true);

    const formData = new FormData();
    formData.append("message", message);
    formData.append("reciverId", openChatId);

    files.forEach((file) => {
      formData.append("files", file);
    });

    const res = await fetch(
      `${API_URL}/api/message/saveMessage`,
      {
        method: "POST",
        credentials: "include",
        body: formData,
      }
    );

    const result = await res.json();

    if (result.success) {
      userlist()
      setMessages((prev) => [
        ...prev,
        {
          Id: result.data.Id,
          message: result.data.message,
          url: result.data.url,
          fromMe: true,
        },
      ]);

      socketRef.current.emit("sendMessage", {
        to: openChatId,
        message: result.data.message,
        files: result.data.files,
        created_at: result.data.created_at,
        FromId: result.data.senderId
      });

      setmessageUplode(false)

      setTimeout(() => {
        setMessage("");
        setFiles([]);
        setSending(true);
      }, 300);
    }
  };

  const openChat = async (name, username, image, Id) => {
    setSelectedUser({ name, username, image });
    if (isMobile) {
      setLoading(true);
    }
    setMessages([]);
    setopenChatId(Id);

    const res = await fetch(
      `${API_URL}/api/message/showMessage?Id=${Id}`,
      { method: "POST", credentials: "include" }
    );

    if (res.status === 401) return;

    const result = await res.json();
    if (result.success) {
      setMessages(result.data);

      if (isMobile) {
        setLoading(false);
        setshowChat(true);
      }
    }
  };

  const back = () => {
    setshowChat(false);
  }

  function useIsMobile(breakpoint = 500) {
    const [isMobile, setIsMobile] = useState(
      typeof window !== "undefined" && window.innerWidth < breakpoint
    );

    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth < breakpoint);
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, [breakpoint]);

    return isMobile;
  }

  async function handleDeleteMessage(Id) {
    const res = await fetch(`${API_URL}/api/message/unSend?messid=${Id}`, {
      method: "delete",
      credentials: "include"
    });

    if (!res.ok) {
      const errorText = await res.json();
      console.error("Server error:", errorText);
      return;
    }
    setConfirmDlt(false)
    setMsgDltid()
    setMessages(prev => prev.filter(post => post.Id !== Id))
  }

  const confirmDelete = (Id) => {
    setConfirmDlt(true)
    setMsgDltid(Id)
  }

  return (
    <div className="flex w-full h-screen bg-white">

      {loading && <div className="fixed b-0 md:inset-0 bg-black/40 w-full h-[100vh] flex justify-center items-center z-90"><DotSpinner size="3.5rem" color="#000000" /></div>}
      {Url && <div className="fixed b-0 md:inset-0 bg-black/40 w-full h-[100vh] flex justify-center items-center z-90">
        <div className="p-3 bg-white rounded-xl flex justify-center items-center flex-col">
          <p onClick={() => setUrl(false)} className="absolute top-2 md:top-5 right-1 md:right-7 cursor-pointer"><i className="fa-solid fa-xmark fa-2xl text-red-500 hover:text-red-600"></i></p>
          <div className="flex justify-centet items-center gap-3 h-[90vh] w-[100vw]] md:w-[100%]">
            <img src={Url} alt="" className="w-[100%] h-[100%] object-contain shadow-lg" />
          </div>
        </div>
      </div>}

      {ConfirmDlt && <div className="fixed b-0 md:inset-0 bg-black/40 w-full h-[100vh] flex justify-center items-center z-90">
        <div className="w-[300px] bg-white p-5 rounded-xl flex justify-center items-center flex-col">
          <p>Confirm to delete message</p>
          <div className="flex justify-centet items-center gap-3">
            <button className="text-white px-2 py-1 rounded-xl bg-blue-300 cursor-pointer border-black border-1 hover:bg-blue-400 hover:text-black" onClick={() => setConfirmDlt(false)}>Cancel</button>
            <button className="text-white px-2 py-1 rounded-lg bg-red-300 cursor-pointer border-black border-1 hover:bg-red-400 hover:text-black" onClick={() => handleDeleteMessage(MsgDltid)}>Delete</button>
          </div>
        </div>
      </div>}

      {(!showChat && isMobile) &&
        <div className="w-full md:w-[30%] border-r border-gray-200 flex flex-col">
          <div className="px-5 py-4 text-lg font-bold">{user?.Username}</div>
          <div className="px-4"><input className="w-full px-4 py-2 rounded-full bg-gray-100 outline-none" placeholder="Search" /></div>

          <div useRef={usersContainer} className="overflow-y-auto mt-4 px-4">
            {MessagesUser.map((u, i) => (
              <button key={i} onClick={() => openChat(u.First_name, u.Username, u.image_src, u.Id)} className={`w-full flex gap-3 items-center p-2 rounded-lg hover:bg-gray-100 transition${u.isActive ? "bg-green-50" : ""}`}>
                <div className="relative">
                  <img src={u.image_src} className="w-10 h-10 rounded-full object-cover" />
                  {u.isActive && (<span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-md"></span>)}
                </div>

                <div className="text-left flex-1">
                  <p className="font-medium flex items-center gap-2">
                    {u.Username}
                    {u.isActive && (<span className="text-[10px] text-green-600 font-semibold">• online</span>)}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{u.lastMessage || "Media"}</p>
                </div>
              </button>
            ))}
          </div>
        </div>}

      {(showChat && isMobile) &&
        <div useRef={messageContainer} className="flex-1 md:flex flex-col">
          {!selectedUser ? (
            <div className="flex flex-col justify-center items-center h-full">
              <img src={user?.image_src} className="w-20 h-20 rounded-full mb-4" />
              <h1 className="text-2xl font-bold">Snapshot</h1>
              <p className="text-gray-500">
                Select a conversation to start chatting
              </p>
            </div>
          ) : (
            <>
              <div className="p-4 border-b flex items-center gap-3">
                {isMobile && <p onClick={() => back()} className="text-xl">🔙</p>}
                <img src={selectedUser.image} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="font-semibold">{selectedUser.username}</p>
                  <p className="text-xs text-gray-500">
                    {selectedUser.name}
                  </p>
                </div>
              </div>

              <div className={`flex-1 overflow-y-auto ${isMobile ? "h-[77vh]" : "h-[calc(100vh-140px)]"} p-4 space-y-3`}>
                {Messages.map((msg, i) => {
                  const isMe = msg.fromMe;
                  return (
                    <div key={msg.Id || i} className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className="relative group max-w-[75%] text-sm">

                        {msg.message && (
                          <div className={`px-3 py-2 break-words shadow-sm ${isMe ? "bg-sky-500 text-white rounded-2xl rounded-br-sm" : "bg-gray-200 text-black rounded-2xl rounded-bl-sm"}`}>
                            {msg.message}
                          </div>
                        )}

                        {Array.isArray(msg.url) &&

                          msg.url.map((file, idx) => (
                            <div key={idx} className={`mt-2 overflow-hidden rounded-xl bg-gray-100 ${isMe ? "ml-auto" : "mr-auto"}`}>
                              {file?.type?.startsWith("image") && (
                                <img onClick={() => setUrl(file.url)} src={file.url || file} className="w-[10rem] object-cover" />
                              )}

                              {file?.type?.startsWith("audio") && (
                                <audio controls src={file.url} className="w-[15rem]" />
                              )}

                              {file?.type?.startsWith("application") && (
                                <p className="px-3 py-2 text-sm text-gray-700">📄 {file.name} </p>
                              )}

                              {file?.type?.startsWith("video") && (
                                <video width={"200px"} controls src={file.url}></video>
                              )}
                            </div>
                          ))}

                        <p className={`mt-1 text-[10px] text-gray-400 ${isMe ? "text-right" : "text-left"}`}>{OnTime(msg.created_at)}</p>

                        <div className={`absolute top-1/2 -translate-y-1/2 ${isMe ? "-left-16" : "-right-16"} flex gap-1 opacity-0 group-hover:opacity-100 transition`}>
                          {msg.message && <button onClick={() => navigator.clipboard.writeText(msg.message)} className="bg-white hover:border border-blue-200 shadow px-2 py-1 rounded-md text-xs hover:bg-gray-100">📋</button>}
                          {isMe && (<button onClick={() => confirmDelete(msg.Id)} className="bg-white hover:border border-red-200 shadow px-2 py-1 rounded-md text-xs text-red-600 hover:bg-red-50 border" >Dlt</button>)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 flex flex-col gap-2">
                <div className={`flex flex-col gap-2 border border-blue-900 px-3 py-2 rounded-xl bg-white ${isMobile ? "fixed bottom-13 left-1/2 -translate-x-1/2 w-[95%] z-50" : "w-full"}`}>
                  {files.length > 0 && (
                    <div className="flex flex-wrap gap-2 max-w-full overflow-x-auto">
                      {files.map((file, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg text-xs" >
                          <span className="truncate max-w-[120px]">{file.name}</span>
                          <button onClick={() => removeFile(i)} className="text-red-500 hover:text-red-600" >
                            ❌
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 w-full">
                    <input type="file" multiple hidden id="file" onChange={handleFileChange} />
                    <label htmlFor="file" className="cursor-pointer text-lg">➕</label>
                    <input className="flex-1 outline-none bg-transparent" placeholder="Message..." value={message} onChange={(e) => setMessage(e.target.value)} />

                    {!sending && (
                      <button id="sendButton" onClick={sendMessage}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 664 663">
                          <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="33.67" stroke="#6c6c6c" d="M646.293 331.888L17.7538 17.6187L155.245 331.888 M646.293 331.888L17.753 646.157L155.245 331.888 M646.293 331.888L318.735 330.228L155.245 331.888" />
                        </svg>
                      </button>)}
                    {messageUplode && <DotSpinner size="1rem" color="#1d99ff" />}
                  </div>
                </div>
              </div>

            </>
          )}
        </div>}

      {!isMobile && <div className="w-full md:w-[30%] border-r border-gray-200 flex flex-col">
        <div className="px-5 py-4 text-lg font-bold">{user?.Username}</div>
        <div className="px-4"><input className="w-full px-4 py-2 rounded-full bg-gray-100 outline-none" placeholder="Search" /></div>

        <div useRef={usersContainer} className="overflow-y-auto mt-4 px-4">
          {MessagesUser.map((u, i) => (
            <button key={i} onClick={() => openChat(u.First_name, u.Username, u.image_src, u.Id)} className={`w-full flex gap-3 items-center p-2 rounded-lg hover:bg-gray-100 transition${u.isActive ? "bg-green-50" : ""}`}>
              <div className="relative">
                <img src={u.image_src} className="w-10 h-10 rounded-full object-cover" />
                {u.isActive && (<span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-md"></span>)}
              </div>

              <div className="text-left flex-1">
                <p className="font-medium flex items-center gap-2">
                  {u.Username}
                  {u.isActive && (<span className="text-[10px] text-green-600 font-semibold">• online</span>)}
                </p>
                <p className="text-xs text-gray-500 truncate">{u.lastMessage || "Media"}</p>
              </div>
            </button>
          ))}
        </div>
      </div>}

      {!isMobile && <div useRef={messageContainer} className="flex-1 md:flex flex-col">
        {!selectedUser ? (
          <div className="flex flex-col justify-center items-center h-full">
            <img src={user?.image_src} className="w-20 h-20 rounded-full mb-4" />
            <h1 className="text-2xl font-bold">Snapshot</h1>
            <p className="text-gray-500">
              Select a conversation to start chatting
            </p>
          </div>
        ) : (
          <>
            <div className="p-4 border-b flex items-center gap-3">
              {isMobile && <p onClick={() => back()} className="text-xl">🔙</p>}
              <img src={selectedUser.image} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <p className="font-semibold">{selectedUser.username}</p>
                <p className="text-xs text-gray-500">
                  {selectedUser.name}
                </p>
              </div>
            </div>

            <div className={`flex-1 overflow-y-auto ${isMobile ? "h-[77vh]" : "h-[calc(100vh-140px)]"} p-4 space-y-3`}>
              {Messages.map((msg, i) => {
                const isMe = msg.fromMe;
                return (
                  <div key={msg.Id || i} className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className="relative group max-w-[75%] text-sm">

                      {msg.message && (
                        <div
                          className={`px-3 py-2 break-words shadow-sm ${isMe ? "bg-sky-500 text-white rounded-2xl rounded-br-sm" : "bg-gray-200 text-black rounded-2xl rounded-bl-sm"}`}>
                          {msg.message}
                        </div>
                      )}

                      {Array.isArray(msg.url) &&

                        msg.url.map((file, idx) => (
                          <div key={idx} className={`mt-2 overflow-hidden rounded-xl bg-gray-100 ${isMe ? "ml-auto" : "mr-auto"}`}>
                            {file?.type?.startsWith("image") && (
                              <img onClick={() => setUrl(file.url)} src={file.url || file} className="w-[10rem] object-cover" />
                            )}

                            {file?.type?.startsWith("audio") && (
                              <audio controls src={file.url} className="w-[15rem]" />
                            )}

                            {file?.type?.startsWith("application") && (
                              <p className="px-3 py-2 text-sm text-gray-700">📄 {file.name} </p>
                            )}

                            {file?.type?.startsWith("video") && (
                              <video width={"200px"} controls src={file.url}></video>
                            )}
                          </div>
                        ))}

                      <p className={`mt-1 text-[10px] text-gray-400 ${isMe ? "text-right" : "text-left"}`}>{OnTime(msg.created_at)}</p>

                      <div className={`absolute top-1/2 -translate-y-1/2 ${isMe ? "-left-16" : "-right-16"} flex gap-1 opacity-0 group-hover:opacity-100 transition`}>
                        {msg.message && <button onClick={() => navigator.clipboard.writeText(msg.message)} className="bg-white border border-blue-50 hover:border-blue-200 shadow px-2 py-1 rounded-md text-xs hover:bg-gray-100">📋</button>}
                        {isMe && (<button onClick={() => confirmDelete(msg.Id)} className="bg-white hover:border border-red-200 shadow px-2 py-1 rounded-md text-xs text-red-600 hover:bg-red-50 border" >Dlt</button>)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 flex flex-col gap-2">
              <div className={`flex flex-col gap-2 border border-blue-900 px-3 py-2 rounded-xl bg-white ${isMobile ? "fixed bottom-13 left-1/2 -translate-x-1/2 w-[95%] z-50" : "w-full"}`}>
                {files.length > 0 && (
                  <div className="flex flex-wrap gap-2 max-w-full overflow-x-auto">
                    {files.map((file, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg text-xs" >
                        <span className="truncate max-w-[120px]">{file.name}</span>
                        <button onClick={() => removeFile(i)} className="text-red-500 hover:text-red-600" >
                          ❌
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 w-full">
                  <input type="file" multiple hidden id="file" onChange={handleFileChange} />
                  <label htmlFor="file" className="cursor-pointer text-lg">➕</label>
                  <input className="flex-1 outline-none bg-transparent" placeholder="Message..." value={message} onChange={(e) => setMessage(e.target.value)} />

                  {!sending && (
                    <button id="sendButton" onClick={sendMessage}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 664 663">
                        <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="33.67" stroke="#6c6c6c" d="M646.293 331.888L17.7538 17.6187L155.245 331.888 M646.293 331.888L17.753 646.157L155.245 331.888 M646.293 331.888L318.735 330.228L155.245 331.888" />
                      </svg>
                    </button>)}
                  {messageUplode && <DotSpinner size="1rem" color="#1d99ff" />}
                </div>
              </div>
            </div>

          </>
        )}
      </div>}
    </div >
  );
}