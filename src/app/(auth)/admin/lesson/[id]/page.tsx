"use client";

import { useEffect, useState } from "react";
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
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-surface p-6 rounded-2xl shadow-sm border border-slate-200">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded-md text-sm font-semibold tracking-wide">ADMIN</span>
                        視聴者ログ
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 font-mono">lesson_id: <span className="text-slate-700">{lessonId}</span></p>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                        className="px-4 py-2.5 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors font-medium text-sm"
                    >
                        <option value={7}>直近7日</option>
                        <option value={30}>直近30日</option>
                        <option value={90}>直近90日</option>
                    </select>
                    <button
                        onClick={() => router.push("/library")}
                        className="bg-white border border-slate-200 text-slate-600 px-4 py-2.5 font-medium rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-sm whitespace-nowrap"
                    >
                        ← 戻る
                    </button>
                </div>
            </div>

            <div className="bg-surface rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mb-4"></div>
                        <p className="text-slate-500 font-medium text-sm">読み込み中...</p>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center text-red-500 font-medium">
                        {error}
                    </div>
                ) : viewers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center px-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 mb-1">視聴データがありません</h3>
                        <p className="text-slate-500 text-sm">指定された期間の視聴ログは見つかりませんでした。</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">日時</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">職員ID</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">氏名</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">部署</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">入職年</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {viewers.map((r, i) => {
                                    const ts = r.ts ? new Date(r.ts).toLocaleString('ja-JP', {
                                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                    }) : "";
                                    const y = String(r.joinYear || "");

                                    // 新人(2024, 2025)のハイライト
                                    const isNewcomer = y === "2024" || y === "2025";

                                    return (
                                        <tr key={i} className={`transition-colors ${isNewcomer ? "bg-blue-50/50 hover:bg-blue-50" : "hover:bg-slate-50"}`}>
                                            <td className="px-6 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">{ts}</td>
                                            <td className="px-6 py-3 font-mono text-xs text-slate-400">{r.staffId}</td>
                                            <td className="px-6 py-3 font-bold text-slate-800 text-sm">
                                                {r.name}
                                                {isNewcomer && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-blue-500"></span>}
                                            </td>
                                            <td className="px-6 py-3 text-sm text-slate-600">{r.dept}</td>
                                            <td className="px-6 py-3 text-sm">
                                                {isNewcomer ? (
                                                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                                                        {y}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-600 font-medium">{y}</span>
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
            <div className="mt-4 text-right text-sm text-slate-500">
                全 <span className="font-bold text-slate-700">{viewers.length}</span> 件のログを表示
            </div>
        </div>
    );
}
