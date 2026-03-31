"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

// DISABLED: Auth check is temporarily bypassed.
// To re-enable: uncomment the auth imports and logic below.
// import { fetchGasApi, getSessionToken, removeSessionToken } from "@/lib/api";

// type UserResponse = {
//     ok: boolean;
//     name?: string;
//     role?: string;
//     message?: string;
// };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    // DISABLED: Auth state - auth check bypassed, no user info needed
    // const [user, setUser] = useState<UserResponse | null>(null);
    // const [loading, setLoading] = useState(true);

    // DISABLED: Auth check
    // useEffect(() => {
    //     const token = getSessionToken();
    //     if (!token) {
    //         router.replace("/");
    //         return;
    //     }
    //     const checkAuth = async () => {
    //         try {
    //             const res = await fetchGasApi("me", { token });
    //             if (res.ok) {
    //                 setUser(res);
    //             } else {
    //                 removeSessionToken();
    //                 router.replace("/");
    //             }
    //         } catch (err) {
    //             removeSessionToken();
    //             router.replace("/");
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    //     checkAuth();
    // }, [router]);

    // DISABLED: Logout handler
    // const handleLogout = () => {
    //     if (confirm("ログアウトしますか？")) {
    //         removeSessionToken();
    //         router.replace("/");
    //     }
    // };

    // DISABLED: Loading state (auth check not running)
    // if (loading) {
    //     return (
    //         <div className="min-h-screen flex items-center justify-center bg-slate-950">
    //             <div className="flex flex-col items-center gap-4">
    //                 <div className="w-12 h-12 rounded-full border-2 border-transparent border-t-blue-500 border-r-blue-400 animate-spin shadow-[0_0_20px_rgba(59,130,246,0.4)]"></div>
    //                 <span className="text-blue-400 text-sm font-semibold tracking-widest uppercase animate-pulse">Loading...</span>
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <div className="min-h-screen bg-slate-950 text-white relative selection:bg-blue-600 selection:text-white">
            {/* Prime Video background gradient */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black"></div>
                <div className="absolute top-[-15%] left-[-5%] w-[45vw] h-[45vw] rounded-full bg-blue-600/6 blur-[130px]"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-cyan-900/8 blur-[120px]"></div>
            </div>

            {/* Prime Video-style navigation */}
            <nav className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/60 transition-all">
                <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-10">
                    <div className="flex justify-between h-16 items-center">
                        {/* Logo */}
                        <div
                            className="flex-shrink-0 flex items-center gap-3 cursor-pointer group"
                            onClick={() => router.push('/library')}
                        >
                            <img
                                src="/kgdx-logo.png"
                                alt="KGDX Logo"
                                className="w-8 h-8 rounded object-cover transition-all duration-300 group-hover:shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                            />
                            <div className="flex flex-col leading-none">
                                <span className="font-black text-base text-white tracking-tight hidden sm:block">KGDX</span>
                                <span className="text-[10px] font-bold text-blue-400 tracking-widest uppercase hidden sm:block">STUDY GROUP</span>
                            </div>
                        </div>

                        {/* Nav tabs */}
                        <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
                            <button
                                onClick={() => router.push('/library')}
                                className={`px-5 py-2 rounded text-sm font-semibold transition-all ${pathname?.startsWith('/library') ? 'text-white bg-blue-600/20 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                            >
                                ライブラリ
                            </button>
                            <button
                                onClick={() => router.push('/cases')}
                                className={`px-5 py-2 rounded text-sm font-semibold transition-all ${pathname?.startsWith('/cases') ? 'text-white bg-blue-600/20 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                            >
                                事例投稿
                            </button>
                        </div>

                        {/* Floating Action Button (FAB) - Ensure fixed at BOTTOM right to avoid clipping at the top */}
                        <div className="fixed bottom-10 right-10 z-[9999] pointer-events-auto">
                            <button
                                onClick={() => router.push('/cases/new')}
                                className="group flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 h-14 rounded-2xl shadow-[0_10px_40px_rgba(59,130,246,0.6)] transition-all duration-300 hover:scale-105 active:scale-95 border border-blue-400/30"
                            >
                                <svg className="w-6 h-6 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                </svg>
                                <span className="font-black tracking-tight">事例を投稿する</span>
                            </button>
                        </div>

                        {/* DISABLED: User area - hidden until auth is re-enabled
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-700/60 bg-slate-900/60 text-sm">
                                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-black">
                                    {user?.name?.charAt(0) || '?'}
                                </div>
                                <span className="font-semibold text-slate-200">{user?.name}</span>
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase ${user?.role === 'admin' ? 'bg-blue-900/50 text-blue-400 border border-blue-700/40' : 'bg-slate-800 text-slate-500'}`}>
                                    {user?.role === 'admin' ? 'Admin' : 'Staff'}
                                </span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="text-sm font-semibold text-slate-400 hover:text-white transition-colors px-3 py-2 rounded hover:bg-slate-800"
                            >
                                ログアウト
                            </button>
                        </div>
                        */}
                    </div>
                </div>
            </nav>

            <main className="max-w-[1700px] mx-auto py-6 animate-in fade-in duration-700 relative z-10 w-full">
                {children}
            </main>
        </div>
    );
}
