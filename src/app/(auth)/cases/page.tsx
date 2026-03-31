"use client";
export const runtime = 'edge';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchGasApi } from "@/lib/api";

type Case = {
    ts: string;
    title: string;
    content: string;
    hospital: string;
    department: string;
    facility?: string; // For compatibility
    name: string;
    status: string;
    likes: number;
};

export default function CaseGalleryPage() {
    const router = useRouter();
    const [cases, setCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [likedCases, setLikedCases] = useState<string[]>([]);
    const [displayCount, setDisplayCount] = useState(0);

    const fetchCases = async () => {
        setLoading(true);
        try {
            const res = await fetchGasApi("getCases");
            if (res.ok) {
                setCases(res.cases || []);
                // Count up animation logic
                let start = 0;
                const end = res.cases?.length || 0;
                if (end > 0) {
                    const timer = setInterval(() => {
                        start += Math.ceil((end - start) / 5);
                        if (start >= end) {
                            setDisplayCount(end);
                            clearInterval(timer);
                        } else {
                            setDisplayCount(start);
                        }
                    }, 50);
                }
            } else {
                setError(res.message || "事例の取得に失敗しました");
            }
        } catch (err) {
            setError("通信エラーが発生しました");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCases();
        const savedLikes = localStorage.getItem("kgdx_liked_cases");
        if (savedLikes) setLikedCases(JSON.parse(savedLikes));
    }, []);

    const handleLike = async (ts: string) => {
        if (likedCases.includes(ts)) return;

        // Optimistic UI update
        const newLikes = [...likedCases, ts];
        setLikedCases(newLikes);
        localStorage.setItem("kgdx_liked_cases", JSON.stringify(newLikes));
        
        setCases(prev => prev.map(c => c.ts === ts ? { ...c, likes: (c.likes || 0) + 1 } : c));

        try {
            await fetchGasApi("likeCase", { id: ts });
        } catch (err) {
            console.error("Like failed", err);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 animate-in fade-in duration-700">
            {/* Hero Header Area */}
            <div className="relative w-full pt-20 pb-16 min-h-[40vh] flex items-center px-4 sm:px-6 lg:px-10 border-b border-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-950 to-slate-950"></div>
                <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
                
                <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center text-center space-y-8 md:space-y-10">
                    <div className="space-y-3 sm:space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            <span className="text-[10px] font-black tracking-[0.2em] uppercase">LIVE STREAMING IDEAS</span>
                        </div>
                        
                        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter text-white">
                            事例投稿<span className="text-blue-500">コーナー</span>
                        </h1>
                    </div>

                    {/* Hero Counter */}
                    {!loading && (
                        <div className="relative flex flex-col items-center">
                            <div className="text-8xl md:text-9xl font-black tabular-nums tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-100 to-blue-300 drop-shadow-[0_0_30px_rgba(59,130,246,0.3)] leading-none">
                                {displayCount}
                            </div>
                            <div className="mt-4 flex items-center gap-3">
                                <div className="h-px w-12 bg-gradient-to-r from-transparent to-blue-500/50"></div>
                                <span className="text-xl md:text-2xl font-black text-blue-400 tracking-[0.3em] uppercase">IDEAS SHARED</span>
                                <div className="h-px w-12 bg-gradient-to-l from-transparent to-blue-500/50"></div>
                            </div>
                        </div>
                    )}

                    <p className="text-slate-400 max-w-2xl font-bold text-lg leading-relaxed">
                        現場の「試してみた」がグループの未来を創る。<br />
                        現在、{displayCount}件の知見が共有されています。
                    </p>

                    <button
                        onClick={() => router.push("/cases/new")}
                        className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-black text-xl transition-all shadow-[0_20px_50px_rgba(59,130,246,0.4)] hover:scale-105 active:scale-95 group"
                    >
                        <svg className="w-6 h-6 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                        </svg>
                        知見を共有する
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-20">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-3xl h-80 animate-pulse"></div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-red-950/20 border border-red-500/30 p-12 rounded-3xl text-center">
                        <p className="text-red-400 font-bold mb-6 text-xl">{error}</p>
                        <button onClick={fetchCases} className="bg-slate-900 px-8 py-3 rounded-xl text-blue-400 font-bold border border-slate-800">再読み込み</button>
                    </div>
                ) : cases.length === 0 ? (
                    <div className="text-center py-32 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800 max-w-4xl mx-auto">
                        <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-8">
                            <svg className="w-12 h-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <p className="text-white text-2xl font-black mb-4">まだ投稿がありません</p>
                        <p className="text-slate-500 font-bold mb-10">あなたの「試してみた」が最初の火を灯します。</p>
                        <button
                            onClick={() => router.push("/cases/new")}
                            className="bg-blue-600 text-white px-10 py-4 rounded-xl font-black text-lg shadow-xl hover:bg-blue-500 transition-colors"
                        >
                            今すぐ最初の事例を投稿する
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {cases.map((c, idx) => (
                            <div
                                key={idx}
                                className="group relative bg-slate-900/40 border border-white/5 rounded-[2rem] p-8 hover:bg-slate-900/80 hover:border-blue-500/30 transition-all duration-500 backdrop-blur-md flex flex-col shadow-2xl hover:shadow-blue-900/20"
                            >
                                {/* Category Badge / Date */}
                                <div className="flex items-center justify-between mb-8">
                                    <span className="px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest leading-none">
                                        IDEA STUDY
                                    </span>
                                    <span className="text-slate-600 text-[10px] font-black">
                                        {new Date(c.ts).toLocaleDateString('ja-JP')}
                                    </span>
                                </div>
                                
                                <h3 className="text-2xl font-black text-white mb-4 line-clamp-2 leading-tight group-hover:text-blue-200 transition-colors">
                                    {c.title}
                                </h3>
                                
                                <p className="text-slate-400 font-bold text-sm leading-relaxed mb-8 line-clamp-5 flex-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                    {c.content}
                                </p>

                                <div className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-slate-300 font-black text-sm">
                                            {c.name.charAt(0)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-white">{c.name}</span>
                                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">
                                                {c.hospital || c.facility} <span className="opacity-30">/</span> {c.department}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Like Button */}
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleLike(c.ts);
                                        }}
                                        className={`group/like flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 ${
                                            likedCases.includes(c.ts) 
                                                ? "bg-rose-500/10 border-rose-500/30 text-rose-500" 
                                                : "bg-slate-800/50 border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300"
                                        }`}
                                    >
                                        <svg className={`w-5 h-5 transition-all duration-300 ${likedCases.includes(c.ts) ? "fill-rose-500 scale-110" : "group-hover/like:scale-110"}`} viewBox="0 0 24 24" fill={likedCases.includes(c.ts) ? "currentColor" : "none"} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                        <span className="text-sm font-black tabular-nums">{c.likes || 0}</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
