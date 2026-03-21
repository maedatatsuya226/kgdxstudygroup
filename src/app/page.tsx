"use client";

import CinematicLoadingScreen from "@/components/loading-screen";

// DISABLED: Login functionality is temporarily disabled.
// To re-enable: remove the CinematicLoadingScreen return and uncomment the login form below.
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { fetchGasApi, setSessionToken, getSessionToken } from "@/lib/api";

export default function LoginPage() {
  // DISABLED: Auth check - bypass login, go directly to library via loading screen
  return <CinematicLoadingScreen />;

  /* DISABLED: LOGIN FORM - preserved for future re-activation
  const router = useRouter();
  const [staffId, setStaffId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    const token = getSessionToken();
    if (token) {
      router.replace("/library");
    } else {
      setLoading(false);
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffId.trim()) {
      setError("職員IDを入力してください");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetchGasApi("login", { staffId: staffId.trim() });
      if (res.ok && res.token) {
        setSessionToken(res.token);
        setShowIntro(true);
        setTimeout(() => {
          router.push("/library");
        }, 3200);
      } else {
        setError(res.message || "ログインに失敗しました");
        setLoading(false);
      }
    } catch (err) {
      setError("通信エラーが発生しました");
      setLoading(false);
    }
  };

  if (showIntro) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-950 flex items-center justify-center overflow-hidden">
        <style>{`
          @keyframes primeIn {
            0% { transform: scale(0.7); opacity: 0; filter: brightness(0); }
            15% { transform: scale(1.02); opacity: 1; filter: brightness(1.3) drop-shadow(0 0 30px rgba(59,130,246,0.7)); }
            80% { transform: scale(1.04); opacity: 1; filter: brightness(1) drop-shadow(0 0 50px rgba(59,130,246,0.9)); }
            100% { transform: scale(22); opacity: 0; filter: blur(8px); }
          }
          @keyframes textSlide {
            0% { opacity: 0; transform: translateY(18px); }
            20% { opacity: 0; transform: translateY(18px); }
            35% { opacity: 1; transform: translateY(0); }
            80% { opacity: 1; }
            95% { opacity: 0; transform: translateY(-6px); }
            100% { opacity: 0; }
          }
          .prime-logo-animate {
            animation: primeIn 3.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .prime-text-animate {
            animation: textSlide 3.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}</style>
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="prime-logo-animate w-32 h-32 md:w-44 md:h-44 flex items-center justify-center z-20 relative">
            <img src="/kgdx-logo.png" alt="KGDX Logo" className="w-full h-full object-contain rounded-2xl" />
          </div>
          <div className="prime-text-animate flex items-center justify-center z-10 absolute bottom-[25%]">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-blue-400 tracking-tighter drop-shadow-[0_0_20px_rgba(59,130,246,0.8)]">
              KGDX STUDY GROUP
            </h1>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950">
        <div className="w-12 h-12 rounded-full border-2 border-transparent border-t-blue-500 border-r-blue-400 animate-spin shadow-[0_0_20px_rgba(59,130,246,0.4)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 sm:px-6 py-12 relative overflow-hidden selection:bg-blue-600 selection:text-white">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black"></div>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-600/8 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-900/10 rounded-full blur-[100px] pointer-events-none"></div>
      </div>

      <div className="w-full max-w-[400px] relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-blue-600/15 border border-blue-500/25 mb-5 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
            <img src="/kgdx-logo.png" alt="Logo" className="w-10 h-10 rounded-lg object-cover" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-1">ログイン</h1>
          <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase">KGDX Study Group</p>
        </div>

        <div className="bg-slate-900/70 p-8 sm:p-10 rounded-xl shadow-2xl border border-slate-800/60 backdrop-blur-md">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="group relative">
              <input
                id="staffId"
                name="staffId"
                type="text"
                autoComplete="username"
                required
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                className="peer block w-full rounded-lg border border-slate-700 bg-slate-800/80 px-4 pt-6 pb-2 text-white placeholder-transparent focus:border-blue-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500/40 sm:text-base transition-all"
                placeholder="職員ID"
              />
              <label htmlFor="staffId" className="absolute left-4 top-2 text-xs font-semibold text-slate-400 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-500 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-400 cursor-text">
                職員ID
              </label>
            </div>

            {error && (
              <div className="rounded-lg bg-red-950/40 p-4 border-l-4 border-red-500 animate-in fade-in duration-300">
                <h3 className="text-sm font-medium text-red-400">{error}</h3>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center items-center gap-2 rounded-lg bg-blue-600 px-4 py-3.5 text-base font-bold text-white hover:bg-blue-500 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.35)]"
              >
                <span>ログイン</span>
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs font-medium text-slate-600 tracking-wider">© KGDXStudy Group</p>
        </div>
      </div>
    </div>
  );
  */
}
