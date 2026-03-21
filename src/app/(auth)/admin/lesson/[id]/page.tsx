"use client";
export const runtime = 'edge';

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchGasApi, getSessionToken } from "@/lib/api";

type Viewer = {
    ts: string;
    staffId: string;
    name: string;
    dept: string;
    joinYear: string;
};

export default function AdminLessonPage() {
    const router = useRouter();
    const params = useParams();
    const lessonId = params.id as string;

    const [viewers, setViewers] = useState<Viewer[]>([]);
    const [days, setDays] = useState(30);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchData = async () => {
        setLoading(true);
        setError("");
        const token = getSessionToken();
        if (!token) {
            router.replace("/");
            return;
        }
        try {
            const res = await fetchGasApi("getAdminLesson", { token, lessonId, days });
            if (res.ok) {
                setViewers(res.rows || []);
            } else {
                setError(res.message || "データ取得に失敗しました");
            }
        } catch (err) {
            setError("通信エラーが発生しました");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [lessonId, days]);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto pb-20 px-4 sm:px-6 lg:px-10">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-slate-900/80 p-6 rounded-2xl shadow-xl border border-slate-800/60 relative z-10 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-600/5 to-transparent pointer-events-none"></div>
                <div className="relative z-10">
                    <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
                        <span className="bg-blue-900/40 text-blue-400 border border-blue-700/40 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase">ADMIN</span>
                        視聴者ログ
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 font-mono uppercase tracking-widest">lesson_id: <span className="text-slate-300 font-semibold">{lessonId}</span></p>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                    <select
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                        className="px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-800 text-white focus:bg-slate-800 focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-colors font-medium text-sm outline-none"
                    >
                        <option value={7}>直近7日</option>
                        <option value={30}>直近30日</option>
                        <option value={90}>直近90日</option>
                    </select>
                    <button
                        onClick={() => router.push("/library")}
                        className="bg-slate-800 border border-slate-700 text-slate-300 px-4 py-2.5 font-bold rounded-lg hover:bg-slate-700 hover:text-white transition-colors shadow-sm text-sm whitespace-nowrap"
                    >
                        ← 戻る
                    </button>
                </div>
            </div>

            <div className="bg-slate-900/80 rounded-2xl shadow-2xl border border-slate-800/60 overflow-hidden min-h-[400px] relative">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="w-10 h-10 rounded-full border-2 border-transparent border-t-blue-500 border-r-blue-400 animate-spin shadow-[0_0_15px_rgba(59,130,246,0.4)] mb-4"></div>
                        <p className="text-slate-500 font-medium text-sm uppercase tracking-widest">Loading Logs...</p>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center text-red-400 font-medium">
                        {error}
                    </div>
                ) : viewers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center px-4">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700">
                            <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-300 mb-1">視聴データがありません</h3>
                        <p className="text-slate-500 text-sm">指定された期間の視聴ログは見つかりませんでした。</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-950/50">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">日時</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">職員ID</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">氏名</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">部署</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">入職年</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {viewers.map((r, i) => {
                                    const ts = r.ts ? new Date(r.ts).toLocaleString('ja-JP', {
                                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                    }) : "";
                                    const y = String(r.joinYear || "");

                                    // 新人(2024, 2025)のハイライト
                                    const isNewcomer = y === "2024" || y === "2025";

                                    return (
                                        <tr key={i} className={`transition-colors ${isNewcomer ? "bg-blue-950/20 hover:bg-blue-950/30" : "hover:bg-slate-800/40"}`}>
                                            <td className="px-6 py-4 font-mono text-xs text-slate-400 whitespace-nowrap">{ts}</td>
                                            <td className="px-6 py-4 font-mono text-xs text-slate-500">{r.staffId}</td>
                                            <td className="px-6 py-4 font-bold text-white text-sm">
                                                {r.name}
                                                {isNewcomer && <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_5px_rgba(59,130,246,0.8)]"></span>}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-400 font-semibold">{r.dept}</td>
                                            <td className="px-6 py-4 text-sm">
                                                {isNewcomer ? (
                                                    <span className="px-2 py-1 rounded-md text-xs font-bold bg-blue-950/60 text-blue-400 border border-blue-800/50">
                                                        {y}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-600 font-bold">{y}</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <div className="mt-4 text-right text-xs text-slate-500 tracking-wider">
                全 <span className="font-bold text-slate-300 mx-1">{viewers.length}</span> 件のログ
            </div>
        </div>
    );
}
