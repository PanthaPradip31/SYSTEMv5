"use client"

export function LoginBackground() {
  return (
    <>
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 pointer-events-none animate-bg-zoom"
        style={{ backgroundImage: "url('/pubg-background.png')" }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/40 to-black/85 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(218,175,55,0.1)_0%,transparent_70%)] pointer-events-none" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute w-1 h-1 bg-gold rounded-full bottom-[-10px] left-[15%] animate-spark-1" />
        <div className="absolute w-1.5 h-1.5 bg-gold rounded-full bottom-[-10px] left-[45%] animate-spark-2" />
        <div className="absolute w-1 h-1 bg-gold rounded-full bottom-[-10px] left-[75%] animate-spark-3" />
        <div className="absolute w-2 h-2 bg-gold/50 rounded-full bottom-[-10px] left-[85%] animate-spark-1" />
      </div>

      <style>{`
        @keyframes spark-float-1 {
          0% { transform: translateY(100vh) translateX(0) scale(0.6); opacity: 0; }
          30% { opacity: 0.8; }
          100% { transform: translateY(-20vh) translateX(50px) scale(0.2); opacity: 0; }
        }
        @keyframes spark-float-2 {
          0% { transform: translateY(100vh) translateX(0) scale(0.4); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-20vh) translateX(-80px) scale(0.2); opacity: 0; }
        }
        @keyframes spark-float-3 {
          0% { transform: translateY(100vh) translateX(0) scale(0.5); opacity: 0; }
          40% { opacity: 0.9; }
          100% { transform: translateY(-20vh) translateX(30px) scale(0.1); opacity: 0; }
        }
        .animate-spark-1 {
          animation: spark-float-1 14s linear infinite;
        }
        .animate-spark-2 {
          animation: spark-float-2 18s linear infinite;
          animation-delay: 4s;
        }
        .animate-spark-3 {
          animation: spark-float-3 22s linear infinite;
          animation-delay: 8s;
        }
        @keyframes bg-zoom {
          0%, 100% { transform: scale(1.0); }
          50% { transform: scale(1.06); }
        }
        .animate-bg-zoom {
          animation: bg-zoom 40s ease-in-out infinite;
        }
      `}</style>
    </>
  )
}
