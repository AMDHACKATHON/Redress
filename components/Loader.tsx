export default function Loader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-[#0a0f1e] w-full h-full absolute inset-0 z-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 flex items-center justify-center animate-pulse">
          <img src="/assets/logo.png" alt="Loading..." className="w-full h-full object-contain" />
        </div>
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-indigo-500/60"
              style={{
                animation: 'pulse-glow 1.4s ease-in-out infinite',
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
