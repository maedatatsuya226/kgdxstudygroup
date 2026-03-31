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
};

export default function CaseGalleryPage() {
    const router = useRouter();
    const [cases, setCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchCases = async () => {
        setLoading(true);
        try {
            const res = await fetchGasApi("getCases");
            if (res.ok) {
                setCases(res.cases || []);
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
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="relative w-full py-16 px-4 sm:px-6 lg:px-10 border-b border-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
                
                <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-slate-400">
                            事例投稿コーナー
                        </h1>
                        <p className="text-slate-400 max-w-2xl font-medium leading-relaxed">
                            現場で「試してみた」小さな工夫や成功事例をシェアしましょう。
                            面白い事例は研究会で取り上げられ、次回の研修ネタになるかもしれません。
                        </p>
                    </div>
                    
                    <button
                        onClick={() => router.push("/cases/new")}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-95 group"
                    >
                        <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        事例を投稿する
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-2xl h-64 animate-pulse"></div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-red-950/20 border border-red-500/30 p-8 rounded-2xl text-center">
                        <p className="text-red-400 font-bold mb-4">{error}</p>
                        <button onClick={fetchCases} className="text-blue-400 underline font-semibold">再読み込み</button>
                    </div>
                ) : cases.length === 0 ? (
                    <div className="text-center py-24 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
                        <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <p className="text-slate-500 text-lg font-bold mb-2">まだ投稿がありません</p>
                        <p className="text-slate-600 mb-8">あなたの「試してみた」が最初の投稿になります！</p>
                        <button
                            onClick={() => router.push("/cases/new")}
                            className="text-blue-500 font-black hover:text-blue-400 transition-colors"
                        >
                            今すぐ投稿する →
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {cases.map((c, idx) => (
                            <div
                                key={idx}
                                className="group relative bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 hover:bg-slate-800/80 hover:border-blue-500/30 transition-all duration-300 backdrop-blur-sm flex flex-col shadow-xl"
                            >
                                {/* Category Badge / Date */}
                                <div className="flex items-center justify-between mb-4">
                                    <span className="px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                                        CASE STUDY
                                    </span>
                                    <span className="text-slate-600 text-[10px] font-bold">
                                        {new Date(c.ts).toLocaleDateString('ja-JP')}
                                    </span>
                                </div>

                                <h3 className="text-xl font-black text-white mb-3 line-clamp-2 leading-tight group-hover:text-blue-200 transition-colors">
                                    {c.title}
                                </h3>
                                
                                <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-4 flex-1">
                                    {c.content}
                                </p>

                                <div className="mt-auto pt-6 border-t border-slate-800/50 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-slate-300 font-bold text-xs">
                                        {c.name.charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-200">{c.name}</span>
                                        <span className="text-[10px] text-slate-500 font-semibold">
                                            {c.hospital || c.facility} / {c.department}
                                        </span>
                                    </div>
                                    {c.status === "Selected" && (
                                        <div className="ml-auto">
                                            <span className="bg-amber-500/10 text-amber-500 text-[9px] font-black px-2 py-1 rounded border border-amber-500/20">研究会候補</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
