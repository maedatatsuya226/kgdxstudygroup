"use client";
export const runtime = 'edge';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchGasApi } from "@/lib/api";

export default function NewCasePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const [form, setForm] = useState({
        title: "",
        content: "",
        name: "",
        hospital: "",
        department: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.content || !form.name || !form.hospital || !form.department) {
            setError("全ての項目を入力してください");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetchGasApi("submitCase", form);
            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    router.push("/cases");
                }, 2000);
            } else {
                setError(res.message || "投稿に失敗しました");
                setLoading(false);
            }
        } catch (err) {
            setError("通信エラーが発生しました");
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
                <div className="text-center space-y-6 max-w-md p-10 bg-slate-900/50 border border-slate-800 rounded-3xl animate-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                        <svg className="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black text-white">投稿を完了しました</h2>
                    <p className="text-slate-400 font-medium">
                        ご投稿ありがとうございます！<br />
                        事例ギャラリーへ戻ります...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-10 pb-20 animate-in fade-in duration-700">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 font-bold group"
                >
                    <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    戻る
                </button>

                <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
                    
                    <div className="mb-10 text-center">
                        <h1 className="text-3xl font-black text-white mb-2">
                            事例を投稿する
                        </h1>
                        <p className="text-slate-500 font-medium tracking-tight">あなたの「試してみた」が力になります</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-6">
                            {/* Title */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-400 ml-1">事例のタイトル</label>
                                <input
                                    type="text"
                                    placeholder="例：生成AIを活用した紹介状作成の自動化"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-white placeholder-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 focus:outline-none transition-all"
                                    required
                                />
                            </div>

                            {/* Content */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-400 ml-1">試した内容・結果</label>
                                <textarea
                                    placeholder="どのようなツール（GAS、生成AI、Excel等）を使い、どのような効果（時短、ミス削減、スタッフの負担軽減等）が得られたかを記入してください。"
                                    value={form.content}
                                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                                    rows={6}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-white placeholder-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 focus:outline-none transition-all resize-none"
                                    required
                                />
                            </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Hospital */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-400 ml-1">病院名</label>
                            <input
                                type="text"
                                placeholder="例：〇〇総合病院"
                                value={form.hospital}
                                onChange={(e) => setForm({ ...form, hospital: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-white placeholder-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 focus:outline-none transition-all"
                                required
                            />
                        </div>

                        {/* Department */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-400 ml-1">部署名</label>
                            <input
                                type="text"
                                placeholder="例：リハビリテーション科"
                                value={form.department}
                                onChange={(e) => setForm({ ...form, department: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-white placeholder-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 focus:outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-400 ml-1">お名前</label>
                        <input
                            type="text"
                            placeholder="例：カマチ 太郎"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-white placeholder-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 focus:outline-none transition-all"
                            required
                        />
                    </div>
                        </div>

                        {error && (
                            <div className="bg-red-950/30 border border-red-500/40 p-4 rounded-xl text-red-400 text-sm font-bold text-center animate-in fade-in duration-300">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-xl font-black text-lg transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    送信中...
                                </div>
                            ) : (
                                "この内容で投稿する"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
