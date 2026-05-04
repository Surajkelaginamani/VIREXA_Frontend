import idleCharacter from "./assets/character-idle.png";
import talkingCharacter from "./assets/character-talking.gif";

const AnimatedGeminiBot = ({ isTalking }) => {
  return (
    <div className="relative flex justify-center items-center mb-6">
      
      {/* Glow Effect */}
      <div
        className={`absolute w-52 h-52 rounded-full blur-3xl opacity-40 transition-all duration-500 ${
          isTalking
            ? "bg-pink-500 scale-110"
            : "bg-cyan-500 scale-100"
        }`}
      />

      {/* Bot Image */}
      <img
        src={isTalking ? talkingCharacter : idleCharacter}
        alt="AI Assistant"
        className={`relative z-10 w-44 h-44 object-cover rounded-full border-4 transition-all duration-300 ${
          isTalking
            ? "border-pink-400 shadow-[0_0_40px_rgba(236,72,153,0.8)] scale-105"
            : "border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.6)]"
        }`}
      />

      {/* Online Badge */}
      <div className="absolute bottom-3 right-[34%] z-20 w-5 h-5 bg-green-400 border-2 border-white rounded-full animate-pulse" />
    </div>
  );
};

export default AnimatedGeminiBot;
