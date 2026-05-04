// App.jsx

import ParticlesBackground from "./components/ParticlesBackground";
import { useEffect, useState, useRef } from "react";
import axios from "axios";

import {
  Menu,
  Plus,
  MessageSquare,
  Settings,
  User,
  Mic,
  Send,
  X,
} from "lucide-react";

import AnimatedGeminiBot from "./components/AnimatedGeminiBot";

// IMPORT YOUR VIREXA LOGO
import virexaLogo from "./assets/virexa-logo.png";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://virexa-backend.onrender.com/api";

const getApiErrorMessage = (error, fallback) => {
  if (error.response?.status === 503) {
    return "Backend database is not connected. Please check Render environment variables.";
  }

  return error.response?.data?.error || fallback;
};

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);

  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [historyError, setHistoryError] = useState("");

  const [isListening, setIsListening] = useState(false);
  const [isTalking, setIsTalking] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [isTyping, setIsTyping] = useState(false);

  const userBatch = "AS1";

  const recognition = useRef(null);
  const messagesEndRef = useRef(null);

  // AUTO SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  // LOAD CONVERSATIONS
  const fetchConversations = async () => {
    setIsLoadingChats(true);
    setHistoryError("");

    try {
      const response = await axios.get(
        `${API_BASE_URL}/chat/conversations`
      );

      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error(error);
      setHistoryError(
        getApiErrorMessage(error, "Could not load chats")
      );
    } finally {
      setIsLoadingChats(false);
    }
  };

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/chat/conversations`
        );

        setConversations(response.data.conversations || []);
      } catch (error) {
        console.error(error);
        setHistoryError(
          getApiErrorMessage(error, "Could not load chats")
        );
      } finally {
        setIsLoadingChats(false);
      }
    };

    loadConversations();
  }, []);

  // SPEECH RECOGNITION
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    recognition.current = new SpeechRecognition();

    recognition.current.continuous = false;
    recognition.current.lang = "en-IN";
  }, []);

  // SPEAK TEXT
  const speakText = async (textToSay) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/speak`,
        {
          text: textToSay,
        },
        {
          responseType: "blob",
        }
      );

      const audioUrl = URL.createObjectURL(response.data);

      const audio = new Audio(audioUrl);

      audio.onplay = () => {
        setIsTalking(true);
      };

      audio.onended = () => {
        setIsTalking(false);
      };

      audio.play();
    } catch (error) {
      console.error(error);
      setIsTalking(false);
    }
  };

  // MIC
  const handleMicClick = () => {
    if (!recognition.current) {
      return alert("Use Chrome Browser");
    }

    if (isListening) {
      recognition.current.stop();
      setIsListening(false);
    } else {
      recognition.current.start();

      setIsListening(true);

      recognition.current.onresult = (event) => {
        setInput(event.results[0][0].transcript);
        setIsListening(false);
      };

      recognition.current.onerror = () => {
        setIsListening(false);
      };
    }
  };

  // SEND MESSAGE
  const sendMessage = async (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    const currentInput = input;

    const newMessages = [
      ...messages,
      {
        role: "user",
        text: currentInput,
      },
    ];

    setMessages(newMessages);
    setInput("");

    setIsTyping(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/chat`,
        {
          userMessage: currentInput,
          userBatch,
          conversationId: activeConversationId,
        }
      );

      const botReply = response.data.reply;

      setActiveConversationId(response.data.conversationId);

      setIsTyping(false);

      setMessages([
        ...newMessages,
        {
          role: "bot",
          text: botReply,
        },
      ]);

      speakText(botReply);

      fetchConversations();
    } catch (error) {
      console.error(error);

      setIsTyping(false);

      setMessages([
        ...newMessages,
        {
          role: "bot",
          text: getApiErrorMessage(
            error,
            "Server connection failed."
          ),
        },
      ]);
    }
  };

  // SELECT CHAT
  const selectConversation = async (conversationId) => {
    setActiveConversationId(conversationId);

    setHistoryError("");

    setSidebarOpen(false);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/chat/conversations/${conversationId}`
      );

      setMessages(response.data.messages || []);
    } catch (error) {
      console.error(error);
      setHistoryError(
        getApiErrorMessage(error, "Could not open chat")
      );
    }
  };

  // NEW CHAT
  const startNewChat = async () => {
    setMessages([]);
    setInput("");
    setHistoryError("");

    setSidebarOpen(false);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/chat/new`
      );

      setActiveConversationId(response.data.conversationId);
    } catch (error) {
      console.error(error);

      setActiveConversationId(null);

      setHistoryError(
        getApiErrorMessage(error, "Could not start chat")
      );
    }
  };

  return (
    <div className="relative h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-black flex">

      {/* PARTICLES */}
      <ParticlesBackground />

      {/* GLOW EFFECTS */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />

      <div className="absolute bottom-20 right-20 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`
          fixed lg:relative z-40 h-full
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
          w-72 transition-all duration-300
          border-r border-white/10
          bg-black/40 backdrop-blur-2xl
          flex flex-col
        `}
      >

        {/* TOP */}
        <div className="p-4 flex items-center justify-between border-b border-white/10">

          <div className="flex items-center gap-3">
            <img
              src={virexaLogo}
              alt="Virexa Logo"
              className="w-11 h-11 rounded-xl object-cover shadow-lg"
            />

            <div>
              <h1 className="text-white text-xl font-bold">
                Virexa
              </h1>

              <p className="text-slate-400 text-xs">
                Emotionally Smart AI
              </p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-xl hover:bg-white/10 transition lg:hidden"
          >
            <X className="text-white" size={22} />
          </button>
        </div>

        {/* NEW CHAT */}
        <div className="p-4">
          <button
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:scale-[1.02] active:scale-95 transition-all text-white px-4 py-3 rounded-2xl font-medium shadow-lg"
          >
            <Plus size={20} />

            <span>New Chat</span>
          </button>
        </div>

        {/* HISTORY */}
        <div className="flex-1 overflow-y-auto px-3">

          <p className="text-slate-400 text-xs uppercase px-3 mb-3">
            Recent Chats
          </p>

          {historyError && (
            <p className="text-rose-300 text-sm px-3 mb-3">
              {historyError}
            </p>
          )}

          {isLoadingChats && (
            <p className="text-slate-400 text-sm px-3">
              Loading chats...
            </p>
          )}

          {!isLoadingChats &&
            conversations.length === 0 && (
              <p className="text-slate-500 text-sm px-3">
                No chats yet
              </p>
            )}

          {conversations.map((chat) => (
            <button
              key={chat.id}
              onClick={() =>
                selectConversation(chat.id)
              }
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition mb-2 ${
                activeConversationId === chat.id
                  ? "bg-white/15 text-white border border-white/10"
                  : "text-slate-300 hover:bg-white/10"
              }`}
            >
              <MessageSquare
                size={18}
                className="shrink-0"
              />

              <div className="min-w-0 text-left">
                <span className="block truncate font-medium">
                  {chat.title}
                </span>

                <span className="block truncate text-xs text-slate-500">
                  {chat.lastMessage}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* BOTTOM */}
        <div className="p-3 border-t border-white/10 space-y-2">

          <button className="w-full flex items-center gap-3 hover:bg-white/10 text-slate-300 px-3 py-3 rounded-2xl transition">
            <Settings size={20} />

            <span>Settings</span>
          </button>

          <button className="w-full flex items-center gap-3 hover:bg-white/10 text-slate-300 px-3 py-3 rounded-2xl transition">
            <User size={20} />

            <span>Profile</span>
          </button>

        </div>
      </div>

      {/* MAIN */}
      <div className="relative z-10 flex-1 flex flex-col w-full">

        {/* HEADER */}
        <div className="h-20 border-b border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-between px-4 md:px-8">

          <div className="flex items-center gap-4">

            {/* MOBILE MENU */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-white/10"
            >
              <Menu className="text-white" size={24} />
            </button>

            <div className="flex items-center gap-3">

              <img
                src={virexaLogo}
                alt="Virexa"
                className="w-12 h-12 rounded-2xl object-cover shadow-lg border border-white/10"
              />

              <div>
                <h2 className="text-white text-2xl font-bold">
                  Virexa
                </h2>

                <p className="text-pink-300 text-sm">
                  Your Intelligent Companion
                </p>
              </div>

            </div>
          </div>

          {/* ONLINE */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-lg">

            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />

            <span className="text-slate-300 text-sm hidden sm:block">
              Online
            </span>

          </div>
        </div>

        {/* BOT */}
        <div className="pt-4 md:pt-5">
          <AnimatedGeminiBot isTalking={isTalking} />
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-5">

          {messages.length === 0 && (
            <div className="text-center mt-16 md:mt-20">

              <img
                src={virexaLogo}
                alt="Virexa"
                className="w-24 h-24 mx-auto rounded-3xl shadow-2xl border border-white/10 mb-6"
              />

              <h1 className="text-4xl md:text-6xl font-bold text-white">
                Welcome to Virexa
              </h1>

              <p className="text-slate-400 mt-5 text-sm md:text-lg max-w-xl mx-auto">
                Your futuristic AI companion built to
                chat, assist, and interact naturally
                with emotion and intelligence.
              </p>

            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`
                  max-w-[90%] md:max-w-[75%]
                  px-4 md:px-5 py-3 md:py-4
                  rounded-3xl shadow-lg
                  text-sm md:text-base
                  ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-br-md"
                      : "bg-white/10 border border-white/10 backdrop-blur-xl text-slate-100 rounded-bl-md"
                  }
                `}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* TYPING */}
          {isTyping && (
            <div className="flex justify-start">

              <div className="bg-white/10 border border-white/10 backdrop-blur-xl px-5 py-4 rounded-3xl rounded-bl-md">

                <div className="flex gap-2">

                  <span className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" />

                  <span className="w-2 h-2 rounded-full bg-pink-400 animate-bounce delay-100" />

                  <span className="w-2 h-2 rounded-full bg-pink-400 animate-bounce delay-200" />

                </div>

              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        <form
          onSubmit={sendMessage}
          className="p-3 md:p-5 border-t border-white/10 bg-black/20 backdrop-blur-xl"
        >
          <div className="flex items-center gap-2 md:gap-3">

            {/* MIC */}
            <button
              type="button"
              onClick={handleMicClick}
              className={`
                w-12 h-12 md:w-14 md:h-14
                rounded-full
                flex items-center justify-center
                transition-all
                ${
                  isListening
                    ? "bg-red-500 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.8)]"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }
              `}
            >
              <Mic size={20} />
            </button>

            {/* INPUT */}
            <input
              type="text"
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
              placeholder={
                isListening
                  ? "Listening..."
                  : "Message Virexa..."
              }
              className="flex-1 h-12 md:h-14 rounded-2xl bg-white/10 border border-white/10 px-4 md:px-5 text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-pink-500 text-sm md:text-base"
            />

            {/* SEND */}
            <button
              type="submit"
              className="h-12 md:h-14 px-4 md:px-6 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2"
            >
              <Send size={18} />

              <span className="hidden sm:block">
                Send
              </span>
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
