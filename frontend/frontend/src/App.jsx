import { useState, useEffect } from "react";
import Video from "./Video";
const BASE_URL = "https://mentor-connect-backend-cuz3.onrender.com";


export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [ws, setWs] = useState(null);
  const [code, setCode] = useState("");
  const [inputSessionId, setInputSessionId] = useState("");
  const [connected, setConnected] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
  if (!sessionId) return;
  console.log("🟢 Session started:", sessionId);


  setMessages([]);   
  setCode("");

  const socket = new WebSocket(`wss://mentor-connect-backend-cuz3.onrender.com/ws/${sessionId}`);

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "chat") {
      setMessages((prev) => [...prev, data.content]);
    }

    if (data.type === "code") {
      setCode(data.content);
    }
  };

  socket.onopen = () => {
  setConnected(true);
};

socket.onclose = () => {
  setConnected(false);
};

  setWs(socket);

  return () => socket.close();
}, [sessionId]);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="text-center mt-20">
            <h2 className="text-4xl font-bold mb-4">
              Welcome to MentorConnect 🚀
            </h2>
            <p className="text-gray-400 text-lg">
              Learn, collaborate and grow with mentors in real-time
            </p>
          </div>
        );

      case "sessions":
        const createSession = async () => {
  try {
    const res = await fetch(`${BASE_URL}/sessions/create`, {
      method: "POST",
    });

    const text = await res.text();

    if (!text) {
      alert("❌ Empty response");
      return;
    }

    const data = JSON.parse(text);

    setSessionId(data.session_id);
    setIsJoined(true);
    setInputSessionId(data.session_id);
    setActiveTab("chat");

  } catch (err) {
    console.error(err);
    alert("❌ Failed to create session");
  }
};

         const joinSession = async () => {
  if (!inputSessionId) {
    alert("Enter session ID");
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/sessions/join/${inputSessionId}`);

    const text = await res.text();

    if (!text) {
      alert("❌ Empty response from server");
      return;
    }

    const data = JSON.parse(text);

    if (!data.success) {
      alert("❌ Session does not exist");
      return;
    }

    setSessionId(inputSessionId);
    setIsJoined(true);
    setActiveTab("chat");

  } catch (err) {
    console.error(err);
    alert("❌ Something went wrong");
  }
};
        return (
          <div className="max-w-4xl mx-auto mt-10">
            <h2 className="text-3xl font-semibold mb-6">Sessions</h2>

            <div className="flex gap-4">
              <input
                placeholder="Enter Session ID"
                className="flex-1 p-4 rounded-xl bg-gray-800 text-white border border-gray-600"
                value={inputSessionId}
onChange={(e) => setInputSessionId(e.target.value)}
              />

              <button onClick={joinSession} className="bg-blue-600 px-6 py-3 rounded-xl hover:bg-blue-700">
                Join
              </button>

              <button onClick={createSession} className="bg-green-600 px-6 py-3 rounded-xl hover:bg-green-700">
                Create
              </button>
            </div>
          </div>
        );

      case "editor":
        if (!isJoined) {
  return (
    <div className="text-center mt-20 text-xl text-red-400">
      ⚠️ Join a session first to use editor
    </div>
  );
}

const handleCodeChange = (e) => {
  const newCode = e.target.value;
  setCode(newCode);

  if (ws) {
    ws.send(JSON.stringify({
      type: "code",
      content: newCode
    }));
  }
};
        return (
          <div className="h-[70vh] mt-10">
            <h2 className="text-3xl font-semibold mb-4">Live Code Editor</h2>

            <textarea
              value={code}
  onChange={handleCodeChange}
              className="w-full h-full p-5 bg-black text-green-400 rounded-xl text-lg"
              placeholder="Start coding..."
            />
          </div>
        );

      case "chat":

const sendMessage = () => {
  if (!isJoined) {
  alert("Join session first");
  return;
}
if (!input.trim()) return;
  if (ws) {
    ws.send(JSON.stringify({
  type: "chat",
  content: input
}));
    setInput("");
  }
};
        return (
          <div className="max-w-3xl mx-auto mt-10 flex flex-col h-[70vh]">
            <h2 className="text-3xl font-semibold mb-4">Chat</h2>

            <div className="flex-1 bg-gray-800 rounded-xl p-4 overflow-y-auto mb-4">

              <div>
               {messages.map((msg, i) => (
    <div key={i} className="bg-gray-700 px-3 py-2 rounded-lg mb-2">
  {msg}
</div>
  ))}
</div>
            </div>

            <div className="flex gap-3">
             <input
    value={input}
    onChange={(e) => setInput(e.target.value)}
    className="flex-1 p-4 rounded-xl bg-gray-800 border border-gray-600"
/>
              <button onClick={sendMessage} className="bg-blue-600 px-6 rounded-xl">
                Send
              </button>
            </div>
          </div>
        );

      case "video":
          return <Video sessionId={sessionId} />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white">
      
      {/* 🔥 NAVBAR */}
      <nav className="flex justify-between items-center px-10 py-5 bg-black/30 backdrop-blur-lg border-b border-gray-700">
        <h1 className="text-3xl font-bold">🚀 MentorConnect</h1>

        <div className="flex gap-6 text-lg">
          {["dashboard", "sessions", "editor", "chat", "video"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`capitalize hover:text-blue-400 ${
                activeTab === tab ? "text-blue-400 font-semibold" : ""
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>
      {isJoined && (
  <div className="text-center bg-green-600 py-2 text-white font-semibold">
    🟢 You are LIVE in session: {sessionId} | {connected ? "Connected" : "Connecting..."}
  </div>
)}

      {/* 🔥 MAIN CONTENT */}
      <div className="px-10 py-6">{renderContent()}</div>
    </div>
  );
}