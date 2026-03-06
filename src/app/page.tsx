"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchGasApi, setSessionToken, getSessionToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [staffId, setStaffId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // 既にトークンがあればライブラリへ遷移
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
        router.push("/library");
      } else {
        setError(res.message || "ログインに失敗しました");
        setLoading(false);
      }
    } catch (err) {
      setError("通信エラーが発生しました");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffdfa]">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/80 via-[#fffdfa] to-rose-50/50 pointer-events-none"></div>
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-orange-100 border-t-orange-500 relative z-10 shadow-sm"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fffdfa] px-6 sm:px-12 py-16 relative overflow-hidden selection:bg-orange-200 selection:text-orange-900">

      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-transparent to-rose-50/30"></div>
        <div className="absolute -top-[10%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-b from-orange-100/80 to-transparent blur-3xl opacity-80"></div>
        <div className="absolute top-[40%] -left-[20%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-amber-50 to-transparent blur-3xl opacity-90"></div>
        <div className="absolute bottom-[-10%] right-[20%] w-[50%] h-[50%] rounded-full bg-gradient-to-tl from-cyan-50/30 to-transparent blur-3xl opacity-60"></div>
      </div>

      <div className="w-full max-w-lg bg-white/80 p-10 sm:p-14 rounded-3xl shadow-[0_20px_60px_-15px_rgba(249,115,22,0.1)] border border-white relative z-10 backdrop-blur-2xl transition-all duration-500 hover:shadow-[0_25px_65px_-15px_rgba(249,115,22,0.15)] hover:bg-white/90">

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-orange-50 text-orange-500 mb-6 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] ring-1 ring-orange-100/50 transition-transform duration-500 hover:scale-105 hover:-rotate-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Welcome Back</h1>
          <p className="text-base text-slate-500 mt-3 font-medium tracking-wide">新入職員向け E-Learning</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-8">
          <div className="group">
            <label htmlFor="staffId" className="block text-sm font-semibold text-slate-600 mb-2 transition-colors group-focus-within:text-orange-600">
              職員ID
            </label>
            <div className="relative">
              <input
                id="staffId"
                name="staffId"
                type="text"
                autoComplete="username"
                required
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                className="block w-full rounded-2xl border-0 py-4 px-5 text-slate-800 bg-slate-50/50 shadow-sm ring-1 ring-inset ring-slate-200/80 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-base transition-all duration-300 hover:ring-slate-300"
                placeholder="職員IDを入力"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-2xl bg-orange-50/80 p-5 border border-orange-100/80 animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <svg className="h-5 w-5 text-orange-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-orange-800 leading-snug">{error}</h3>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="group flex w-full justify-center items-center gap-2 rounded-2xl bg-orange-500 px-4 py-4 text-base font-bold text-white shadow-md shadow-orange-500/20 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none disabled:transform-none"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white/90" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>認証中...</span>
                </>
              ) : (
                <>
                  <span>ログインして学ぶ</span>
                  <svg className="w-5 h-5 text-orange-100 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Footer text */}
      <div className="absolute bottom-8 w-full text-center pointer-events-none">
        <p className="text-xs font-medium text-slate-400">© Shinkomonji Hospital</p>
      </div>
    </div>
  );
}

