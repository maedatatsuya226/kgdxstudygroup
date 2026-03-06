"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchGasApi, getSessionToken } from "@/lib/api";

type UserProgress = {
    staffId: string;
    name: string;
    dept: string;
    joinYear: number;
    progress: string;
    rate: number;
    progressAnswer: string;
    rateAnswer: number;
    unwatched: string[];
};

export default function AdminUsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<UserProgress[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            const token = getSessionToken();
            if (!token) {
                router.replace("/");
                return;
            }
            try {
                const res = await fetchGasApi("getAdminUsers", { token });
                if (res.ok) {
                    setUsers(res.list || []);
                } else {
                    setError(res.message || "データ取得に失敗しました");
                }
            } catch (err) {
                setError("通信エラーが発生しました");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [router]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mb-4"></div>
                <p className="text-slate-500 font-medium">集計中...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center font-medium border border-red-100">
                {error}
                <div className="mt-4">
                    <button onClick={() => router.push("/library")} className="underline hover:text-red-800">ライブラリに戻る</button>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-md text-sm font-semibold tracking-wide">ADMIN</span>
                        新人進捗一覧
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">対象者: <span className="font-bold">{users.length}</span> 名</p>
                </div>
                <button
                    onClick={() => router.push("/library")}
                    className="bg-white border border-slate-200 text-slate-600 px-4 py-2 font-medium rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-sm whitespace-nowrap"
                >
                    ← ライブラリに戻る
                </button>
            </div>

            <div className="bg-surface rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[20%]">氏名</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[25%]">視聴状況</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[25%]">回答状況</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">残タスク（未視聴）</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">
                                        対象の新人データがありません
                                    </td>
                                </tr>
                            ) : (
                                users.map((u, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 align-top">
                                            <div className="font-bold text-slate-900">{u.name}</div>
                                            <div className="text-xs text-slate-500 mt-1">
                                                {u.dept} ({u.joinYear})
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{u.staffId}</div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <div className="text-xs text-slate-600 font-medium mb-1.5 flex justify-between">
                                                <span>見た動画: <strong className="text-slate-900">{u.progress}</strong></span>
                                                <span>{u.rate}%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className={`h-2 rounded-full transition-all duration-1000 ${u.rate >= 100 ? "bg-emerald-500" :
                                                            u.rate >= 50 ? "bg-amber-400" : "bg-red-400"
                                                        }`}
                                                    style={{ width: `${u.rate}%` }}
                                                ></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <div className="text-xs text-slate-600 font-medium mb-1.5 flex justify-between">
                                                <span>出した感想: <strong className="text-slate-900">{u.progressAnswer}</strong></span>
                                                <span>{u.rateAnswer}%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className={`h-2 rounded-full transition-all duration-1000 ${u.rateAnswer >= 100 ? "bg-emerald-500" :
                                                            u.rateAnswer >= 50 ? "bg-amber-400" : "bg-red-500"
                                                        }`}
                                                    style={{ width: `${u.rateAnswer}%` }}
                                                ></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            {u.unwatched.length === 0 ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                                                    全視聴完了
                                                </span>
                                            ) : (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {u.unwatched.map((title, idx) => (
                                                        <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-md text-[11px] font-medium max-w-[150px] truncate" title={title}>
                                                            {title}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
