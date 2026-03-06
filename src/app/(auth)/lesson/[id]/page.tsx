"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchGasApi, getSessionToken } from "@/lib/api";

type LessonData = {
    lesson_id: string;
    title: string;
    video_url: string;
    question: string;
};

export default function LessonPage() {
    const router = useRouter();
    const params = useParams();
    const lessonId = params.id as string;

    const [lesson, setLesson] = useState<LessonData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [answer, setAnswer] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitMsg, setSubmitMsg] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            const token = getSessionToken();
            if (!token) {
                router.replace("/");
                return;
            }
            try {
                // 並行して視聴ログと動画取得を行う
                fetchGasApi("recordView", { token, lessonId }).catch(e => console.error(e));

                const res = await fetchGasApi("getLesson", { token, lessonId });
                if (res.ok) {
                    setLesson(res.lesson);
                } else {
                    setError(res.message || "レッスン情報の取得に失敗しました");
                }
            } catch (err) {
                setError("通信エラーが発生しました");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [lessonId, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!answer.trim()) return;

        if (!confirm("送信しますか？（送信後の修正はできません）")) return;

        setSubmitting(true);
        setSubmitMsg("");

        const token = getSessionToken();
        try {
            const res = await fetchGasApi("submitFeedback", { token, lessonId, answer });
            if (res.ok) {
                setAnswer("");
                setSubmitMsg("✅ 送信しました！お疲れ様でした。");
                setTimeout(() => router.push("/library"), 2000);
            } else {
                alert("送信失敗: " + (res.message || "不明なエラー"));
            }
        } catch (err) {
            alert("通信エラーが発生しました");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mb-4"></div>
                <p className="text-slate-500 font-medium">読み込み中...</p>
            </div>
        );
    }

    if (error || !lesson) {
        return (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center font-medium border border-red-100">
                {error || "データが見つかりません"}
                <div className="mt-4">
                    <button onClick={() => router.push("/library")} className="underline hover:text-red-800">ライブラリに戻る</button>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">{lesson.title}</h1>
                    <p className="text-slate-500 text-sm mt-1 font-mono text-xs">ID: {lesson.lesson_id}</p>
                </div>
                <button
                    onClick={() => router.push("/library")}
                    className="bg-white border border-slate-200 text-slate-600 px-4 py-2 font-medium rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-sm whitespace-nowrap"
                >
                    ← 一覧に戻る
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Video Player */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-black rounded-2xl overflow-hidden shadow-lg border border-slate-800 relative w-full aspect-video">
                        {lesson.video_url ? (
                            <iframe
                                src={lesson.video_url}
                                title={lesson.title}
                                className="absolute inset-0 w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-white">動画URLが未設定です</div>
                        )}
                    </div>
                    <div className="text-sm text-slate-500 pl-2">
                        埋め込みで再生できない場合：
                        <a href={lesson.video_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 underline font-medium ml-1">
                            別タブで開く
                        </a>
                    </div>
                </div>

                {/* Feedback Form */}
                <div className="lg:col-span-1">
                    <div className="bg-surface rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col overflow-hidden">
                        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                            <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                📝 課題・感想
                            </h2>
                        </div>

                        <div className="p-6 flex-1 flex flex-col">
                            <div className="mb-6">
                                <label className="block text-xs font-semibold text-primary-600 uppercase tracking-wider mb-2">
                                    質問内容
                                </label>
                                <div className="bg-primary-50 rounded-xl p-4 text-sm font-medium text-primary-900 border border-primary-100">
                                    {lesson.question || "この動画を見て学んだことや、感想を入力してください。"}
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                                <div className="flex-1 min-h-[150px] mb-6">
                                    <label htmlFor="answer" className="block text-sm font-semibold text-slate-700 mb-2">
                                        あなたの回答
                                    </label>
                                    <textarea
                                        id="answer"
                                        required
                                        rows={6}
                                        value={answer}
                                        onChange={(e) => setAnswer(e.target.value)}
                                        className="w-full h-full p-4 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
                                        placeholder="ここに入力してください..."
                                    />
                                </div>

                                <div className="mt-auto">
                                    <button
                                        type="submit"
                                        disabled={submitting || !answer.trim()}
                                        className="w-full py-3.5 px-4 bg-primary-500 text-white font-bold rounded-xl shadow-sm hover:bg-primary-600 hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? "送信中..." : "送信する"}
                                    </button>

                                    {submitMsg && (
                                        <div className="mt-4 text-center font-bold text-emerald-600 text-sm animate-in zoom-in-95">
                                            {submitMsg}
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
