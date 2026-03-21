"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function CinematicLoadingScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<"counting" | "logo" | "fadeout">("counting");
  const [count, setCount] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Phase 1: Rapid count 0→100 over ~900ms
    const startTime = performance.now();
    const duration = 900;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out curve for more cinematic feel
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easedProgress * 100));

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        setCount(100);
        // Brief pause at 100%, then transition to logo phase
        setTimeout(() => {
          setPhase("logo");
          // Fadeout + navigate after logo animation
          setTimeout(() => {
            setPhase("fadeout");
            setTimeout(() => {
              router.replace("/library");
            }, 600);
          }, 2800);
        }, 200);
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [router]);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden"
      style={{
        opacity: phase === "fadeout" ? 0 : 1,
        transition: phase === "fadeout" ? "opacity 0.6s ease-in-out" : "none",
      }}
    >
      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes logoReveal {
          0% {
            transform: scale(0.6);
            opacity: 0;
            filter: brightness(0) blur(20px);
          }
          20% {
            opacity: 1;
            filter: brightness(2) blur(0px) drop-shadow(0 0 60px rgba(59,130,246,0.9));
          }
          60% {
            transform: scale(1.05);
            filter: brightness(1.2) drop-shadow(0 0 40px rgba(59,130,246,0.7));
          }
          85% {
            transform: scale(1.0);
            filter: brightness(1) drop-shadow(0 0 30px rgba(59,130,246,0.5));
          }
          100% {
            transform: scale(1.0);
            filter: brightness(1) drop-shadow(0 0 20px rgba(59,130,246,0.3));
          }
        }
        @keyframes textReveal {
          0% { opacity: 0; transform: translateY(24px); letter-spacing: 0.3em; }
          30% { opacity: 0; transform: translateY(24px); }
          55% { opacity: 1; transform: translateY(0); letter-spacing: 0.15em; }
          85% { opacity: 1; }
          100% { opacity: 1; }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 60px rgba(59, 130, 246, 0.3), 0 0 120px rgba(59, 130, 246, 0.1); }
          50% { box-shadow: 0 0 80px rgba(59, 130, 246, 0.5), 0 0 160px rgba(59, 130, 246, 0.2); }
        }
        @keyframes countFlicker {
          0%, 95%, 100% { opacity: 1; }
          96% { opacity: 0.7; }
          97% { opacity: 1; }
          98% { opacity: 0.8; }
        }
        .logo-animate {
          animation: logoReveal 2.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .text-animate {
          animation: textReveal 2.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .glow-animate {
          animation: glowPulse 2s ease-in-out infinite;
        }
      `}</style>

      {/* Subtle scanline effect */}
      {phase === "counting" && (
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
          }}
        />
      )}

      {/* Counting Phase */}
      {phase === "counting" && (
        <div className="flex flex-col items-center gap-4 relative z-20">
          {/* Progress bar */}
          <div className="w-64 h-px bg-slate-800 relative overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-blue-500 transition-none"
              style={{ width: `${count}%` }}
            />
          </div>
          {/* Counter */}
          <div
            className="font-mono text-7xl font-black tabular-nums select-none"
            style={{
              color: "#fff",
              textShadow: "0 0 30px rgba(59,130,246,0.6), 0 0 60px rgba(59,130,246,0.3)",
              animation: "countFlicker 0.1s infinite",
            }}
          >
            {String(count).padStart(3, "0")}
            <span className="text-4xl text-blue-400 font-black">%</span>
          </div>
          {/* Loading label */}
          <p className="text-slate-600 text-xs font-bold tracking-[0.4em] uppercase">
            Loading
          </p>
        </div>
      )}

      {/* Logo Phase */}
      {(phase === "logo" || phase === "fadeout") && (
        <div className="flex flex-col items-center justify-center relative z-20">
          {/* Background glow */}
          <div
            className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(30,64,175,0.15) 0%, transparent 70%)",
            }}
          />

          {/* Logo */}
          <div className="logo-animate relative">
            <img
              src="/kgdx-logo.png"
              alt="KGDX Study Group"
              className="w-40 h-40 md:w-56 md:h-56 object-contain rounded-3xl glow-animate"
              style={{ borderRadius: "28px" }}
            />
          </div>

          {/* Text */}
          <div className="text-animate mt-8 flex flex-col items-center gap-1">
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-[0.12em]"
              style={{
                textShadow:
                  "0 0 20px rgba(59,130,246,0.7), 0 0 40px rgba(59,130,246,0.3)",
              }}
            >
              KGDX
            </h1>
            <p
              className="text-sm sm:text-base font-bold text-blue-400 tracking-[0.4em] uppercase"
              style={{
                textShadow: "0 0 15px rgba(59,130,246,0.5)",
              }}
            >
              Study Group
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
