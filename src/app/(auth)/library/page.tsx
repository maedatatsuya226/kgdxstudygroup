"use client";
export const runtime = 'edge';

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { fetchGasApi, getSessionToken } from "@/lib/api";

const CircularProgress = ({ percent, colorClass, label }: { percent: number; colorClass: string; label: string }) => {
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        // 数値が変化した後、少し遅らせてアニメーションを開始する
        const timer = setTimeout(() => setOffset(percent), 150);
        return () => clearTimeout(timer);
    }, [percent]);

    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (offset / 100) * circumference;

    return (
        <div className="flex flex-col items-center justify-center group">
            <div className="relative w-28 h-28 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-sm" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r={radius} fill="none" className="stroke-slate-100" strokeWidth="8" />
                    <circle
                        cx="50" cy="50" r={radius} fill="none"
                        className={`transition-all duration-1000 ease-out ${colorClass}`}
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-slate-800">{percent}%</span>
                </div>
            </div>
            <span className="mt-3 text-sm font-semibold text-slate-500">{label}</span>
        </div>
    );
};

type Lesson = {
    lesson_id: string;
    title: string;
    order: number;
    video_url: string;
    thumbnail: string;
    tags: string[];
    required: boolean;
    views_30d: number;
    hasViewed: boolean;
    hasAnswered: boolean;
};

type Stats = {
    total: number;
    viewed: number;
    answered: number;
    viewRate: number;
    answerRate: number;
};

export default function LibraryPage() {
    const router = useRouter();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [isTarget, setIsTarget] = useState(false);
    const [userRole, setUserRole] = useState("staff");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchQuery, setSearchQuery] = useState("");
    const [tagFilter, setTagFilter] = useState("");

    const fetchData = async () => {
        setLoading(true);
        setError("");
        try {
            const token = getSessionToken();
            if (!token) {
                router.replace("/");
                return;
            }
            const res = await fetchGasApi("getLibrary", { token, q: "" });
            if (res.ok) {
                setLessons(res.lessons || []);
                setStats(res.stats || null);
                setIsTarget(res.isTarget || false);
                setUserRole(res.userRole || "staff");
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
    }, []);

    const uniqueTags = useMemo(() => {
        const tags = new Set<string>();
        lessons.forEach(l => l.tags?.forEach(t => tags.add(t)));
        return Array.from(tags);
    }, [lessons]);

    const filteredLessons = useMemo(() => {
        return lessons.filter((l) => {
            if (searchQuery && !l.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            if (tagFilter && (!l.tags || !l.tags.includes(tagFilter))) return false;
            return true;
        });
    }, [lessons, searchQuery, tagFilter]);

    const showDashboard = isTarget || userRole === "admin";

    const renderDashboard = () => {
        if (!stats || stats.total === 0) return null;

        let msg = "コツコツ進めていきましょう！";
        if (stats.answerRate === 100) msg = "🎉 全ての課題を完了しました！素晴らしい！";
        else if (stats.viewRate === 100) msg = "👍 全動画の視聴完了！あとは感想の提出です。";
        else if (stats.viewRate >= 50) msg = "🔥 折り返し地点です。その調子！";

        return (
            <div className="bg-surface rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 mb-8">
                <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                    <span>👋 進捗ダッシュボード（必須動画のみ）</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-center">

                    <CircularProgress
                        percent={stats.viewRate}
                        colorClass="stroke-cyan-400"
                        label="動画視聴率"
                    />

                    <CircularProgress
                        percent={stats.answerRate}
                        colorClass="stroke-orange-500"
                        label="課題提出率"
                    />

                    <div className="col-span-1 lg:col-span-2 space-y-4">
                        <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
                            <span className="block text-xs font-semibold text-primary-600 mb-1 uppercase tracking-wider">Total Progress</span>
                            <span className="text-base font-bold text-primary-900">{msg}</span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm font-medium">
                            <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                                <span className="text-slate-500">必須動画:</span> <span className="text-slate-900 ml-1">{stats.total}</span>
                            </div>
                            <div className="bg-red-50 px-4 py-2 rounded-lg border border-red-100">
                                <span className="text-red-500">未視聴:</span> <span className="text-red-700 ml-1">{stats.total - stats.viewed}</span>
                            </div>
                            <div className="bg-orange-50 px-4 py-2 rounded-lg border border-orange-100">
                                <span className="text-orange-500">未回答:</span> <span className="text-orange-700 ml-1">{stats.total - stats.answered}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mb-4"></div>
                <p className="text-slate-500 font-medium">ライブラリを読み込み中...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center font-medium border border-red-100">
                {error}
                <button onClick={fetchData} className="ml-4 underline hover:text-red-800">再試行</button>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {showDashboard && renderDashboard()}

            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">研修ライブラリ</h1>

                {userRole === "admin" && (
                    <button
                        onClick={() => router.push("/admin/users")}
                        className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
                    >
                        📊 新人の進捗一覧
                    </button>
                )}
            </div>

            <div className="bg-surface p-4 rounded-2xl shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="タイトルで検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    />
                </div>
                <div className="md:w-64">
                    <select
                        value={tagFilter}
                        onChange={(e) => setTagFilter(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors appearance-none cursor-pointer"
                    >
                        <option value="">全てのタグ</option>
                        {uniqueTags.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <button onClick={fetchData} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors">
                    再読込
                </button>
            </div>

            {/* Video Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLessons.map((lesson) => (
                    <div
                        key={lesson.lesson_id}
                        className="group bg-surface rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                    >
                        {/* Thumbnail Box */}
                        <div className="relative aspect-video bg-slate-100 overflow-hidden">
                            {!lesson.required && (
                                <span className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm text-yellow-600 text-xs font-bold px-2 py-1 rounded-md shadow-sm border border-yellow-200">
                                    任意
                                </span>
                            )}

                            {lesson.hasAnswered ? (
                                <span className="absolute top-3 right-3 z-10 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                                    回答済 ✅
                                </span>
                            ) : lesson.hasViewed ? (
                                <span className="absolute top-3 right-3 z-10 bg-cyan-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                                    視聴のみ 👀
                                </span>
                            ) : (
                                <span className="absolute top-3 right-3 z-10 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                                    未視聴 🆕
                                </span>
                            )}

                            {lesson.thumbnail ? (
                                <img
                                    src={lesson.thumbnail}
                                    alt={lesson.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">
                                    No Image
                                </div>
                            )}

                            {/* Play Overlay */}
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm">
                                    <svg className="w-6 h-6 text-primary-500 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                </div>
                            </div>
                        </div>

                        {/* Content Box */}
                        <div className="p-5 flex flex-col flex-1">
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                {lesson.tags?.map(t => (
                                    <span key={t} className="text-[10px] font-semibold tracking-wider uppercase bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                                        {t}
                                    </span>
                                ))}
                            </div>

                            <h3 className="font-bold text-foreground text-lg leading-snug mb-2 line-clamp-2" title={lesson.title}>
                                {lesson.title}
                            </h3>

                            <div className="mt-auto pt-4 flex items-center justify-between">
                                <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    {lesson.views_30d || 0}
                                </span>

                                <div className="flex gap-2">
                                    {userRole === "admin" && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); router.push(`/admin/lesson/${lesson.lesson_id}`); }}
                                            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                                        >
                                            ログ
                                        </button>
                                    )}
                                    <button
                                        onClick={() => router.push(`/lesson/${lesson.lesson_id}`)}
                                        className="px-4 py-1.5 text-sm font-semibold rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-500 hover:text-white transition-colors"
                                    >
                                        開く
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredLessons.length === 0 && !loading && (
                <div className="text-center py-20 bg-surface rounded-2xl border border-dashed border-slate-200 mt-6">
                    <p className="text-slate-500 font-medium">該当する動画が見つかりませんでした</p>
                </div>
            )}
        </div>
    );
}
