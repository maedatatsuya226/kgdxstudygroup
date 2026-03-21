"use client";
export const runtime = 'edge';

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchGasApi, getSessionToken } from "@/lib/api";
import YouTube from "react-youtube";

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

    // DISABLED: 感想フォームは現在非実装
    // const [answer, setAnswer] = useState("");
    // const [submitting, setSubmitting] = useState(false);
    // const [submitMsg, setSubmitMsg] = useState("");

    // DISABLED: 90%視聴チェックは現在非実装
    // const [isPlaying, setIsPlaying] = useState(false);
    // const accumulatedTimeRef = useRef(0);
    // const intervalRef = useRef<NodeJS.Timeout | null>(null);
    // const durationRef = useRef(0);
    // const [watchWarning, setWatchWarning] = useState("");
    // const [isWatched, setIsWatched] = useState(false);

    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // DISABLED: 視聴完了ロジック (再有効化時はコメントを解除)
    // const onReady = (event: any) => { durationRef.current = event.target.getDuration(); };
    // const onStateChange = (event: any) => { ... };
    // const checkCompletion = () => { ... };

    useEffect(() => {
        const fetchData = async () => {
            // DISABLED: Token check bypassed while login is disabled
            // const token = getSessionToken();
            // if (!token) { router.replace("/"); return; }
            const token = getSessionToken() || "";
            try {
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

    // DISABLED: 感想送信フォームは現在非実装
    // const handleSubmit = async (e: React.FormEvent) => { ... };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div className="w-12 h-12 rounded-full border-2 border-transparent border-t-blue-500 border-r-blue-400 animate-spin shadow-[0_0_20px_rgba(59,130,246,0.4)]"></div>
            </div>
        );
    }

    if (error || !lesson) {
        return (
            <div className="bg-red-950/40 text-red-400 p-8 rounded-xl text-center font-medium border border-red-900/50 max-w-xl mx-auto mt-20">
                {error || "データが見つかりません"}
                <div className="mt-6">
                    <button onClick={() => router.push("/library")} className="bg-white text-black px-6 py-2.5 rounded-lg font-bold hover:bg-white/85 transition-colors">
                        ライブラリに戻る
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in zoom-in-95 duration-700 pb-20 px-4 sm:px-6 lg:px-10">

            {/* Back button */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => router.push("/library")}
                    className="group flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-semibold text-sm"
                >
                    <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    一覧に戻る
                </button>
            </div>

            {/* 動画エリアのみ表示（感想パネルは現在非実装） */}
                <div className="flex flex-col gap-5">
                    <div className="bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800/50 relative w-full aspect-video ring-1 ring-white/5">
                        {lesson.video_url ? (
                            <YouTube
                                videoId={getYouTubeId(lesson.video_url) || ""}
                                opts={{
                                    width: "100%",
                                    height: "100%",
                                    playerVars: {
                                        autoplay: 0,
                                        rel: 0,
                                        modestbranding: 1,
                                    },
                                }}
                                className="absolute inset-0 w-full h-full"
                                iframeClassName="w-full h-full"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-500 font-semibold">動画URLが未設定です</div>
                        )}
                    </div>

                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">{lesson.title}</h1>
                        <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">
                            ID: {lesson.lesson_id} •
                            <a href={lesson.video_url} target="_blank" rel="noopener noreferrer" className="ml-2 bg-slate-800 text-slate-300 px-2 py-0.5 rounded hover:bg-slate-700 transition-colors">別タブで開く</a>
                        </p>
                    </div>
                </div>

                {/* DISABLED: 感想・課題パネル（再有効化時はコメントを解除）
                <div className="xl:w-[440px] flex-shrink-0"> ... </div>
                */}
        </div>
    );
}
