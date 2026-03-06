"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { fetchGasApi, getSessionToken, removeSessionToken } from "@/lib/api";

type UserResponse = {
    ok: boolean;
    name?: string;
    role?: string;
    message?: string;
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<UserResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = getSessionToken();
        if (!token) {
            router.replace("/");
            return;
        }

        const checkAuth = async () => {
            try {
                const res = await fetchGasApi("me", { token });
                if (res.ok) {
                    setUser(res);
                } else {
                    removeSessionToken();
                    router.replace("/");
                }
            } catch (err) {
                removeSessionToken();
                router.replace("/");
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    const handleLogout = () => {
        if (confirm("ログアウトしますか？")) {
            removeSessionToken();
            router.replace("/");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fffdfa] relative selection:bg-orange-200 selection:text-orange-900">
            {/* 共通の装飾的背景（固定） */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-b from-orange-100/80 to-transparent blur-3xl opacity-80"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-tr from-amber-50 to-transparent blur-3xl opacity-80"></div>
                <div className="absolute top-[30%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-rose-50/50 to-transparent blur-3xl opacity-60"></div>
                <div className="absolute bottom-[20%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-tl from-cyan-50/40 to-transparent blur-3xl opacity-50"></div>
            </div>

            <nav className="sticky top-0 z-50 bg-white/60 backdrop-blur-xl border-b border-white/80 shadow-sm transition-all">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer group" onClick={() => router.push('/library')}>
                            <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-orange-500/20 transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
                                E
                            </div>
                            <span className="font-extrabold text-xl text-slate-800 tracking-tight transition-colors duration-300 group-hover:text-orange-600">E-Learning</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center text-sm bg-slate-100/50 px-3 py-1.5 rounded-full border border-slate-200/50">
                                <span className="font-medium text-slate-700">{user?.name}</span>
                                <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold leading-none ${user?.role === 'admin' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200/80 text-slate-600'}`}>
                                    {user?.role === 'admin' ? '管理者' : 'スタッフ'}
                                </span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="text-sm font-bold text-slate-500 hover:text-orange-600 transition-colors px-3 py-2 rounded-xl hover:bg-orange-50"
                            >
                                ログアウト
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500 relative z-10 w-full">
                {children}
            </main>
        </div>
    );
}
