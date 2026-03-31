"use client";
export const runtime = 'edge';

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { fetchGasApi, getSessionToken } from "@/lib/api";

const CircularProgress = ({ percent, colorClass, label }: { percent: number; colorClass: string; label: string }) => {
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => setOffset(percent), 150);
        return () => clearTimeout(timer);
    }, [percent]);

    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (offset / 100) * circumference;

    return (
        <div className="flex flex-col items-center justify-center group">
            <div className="relative w-28 h-28 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-md" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r={radius} fill="none" className="stroke-slate-800" strokeWidth="6" />
                    <circle
                        cx="50" cy="50" r={radius} fill="none"
                        className={`transition-all duration-1000 ease-out ${colorClass}`}
                        strokeWidth="6"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-white">{percent}%</span>
                </div>
            </div>
            <span className="mt-3 text-sm font-semibold text-slate-400">{label}</span>
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
            // DISABLED: Token check bypassed while login is disabled
            // const token = getSessionToken();
            // if (!token) { router.replace("/"); return; }
            const token = getSessionToken() || "";
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

    const heroLesson = useMemo(() => {
        if (!filteredLessons || filteredLessons.length === 0) return null;
        const unwatchedRequired = filteredLessons.filter(l => l.required && !l.hasViewed);
        if (unwatchedRequired.length > 0) return unwatchedRequired[0];
        const randomIndex = Math.floor(Math.random() * filteredLessons.length);
        return filteredLessons[randomIndex];
    }, [filteredLessons]);

    // DISABLED: Progress dashboard hidden until feature is re-enabled
    // const showDashboard = isTarget || userRole === "admin";
    const showDashboard = false;

    const renderDashboard = () => {
        if (!stats || stats.total === 0) return null;

        let msg = "マイリストをチェックしましょう。";
        if (stats.answerRate === 100) msg = "全ての課題を完了しました！素晴らしい！";
        else if (stats.viewRate === 100) msg = "全動画の視聴完了！あとは感想の提出です。";
        else if (stats.viewRate >= 50) msg = "折り返し地点です。その調子！";

        return (
            <div className="w-full bg-slate-900/80 border border-slate-800/60 rounded-xl p-6 sm:p-8 mb-10 shadow-2xl relative overflow-hidden">
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-600/5 to-transparent pointer-events-none"></div>
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
                <h2 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
                    <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
                    学習の進捗状況
                </h2>
                <div className="flex flex-col md:flex-row gap-8 items-center lg:items-stretch">
                    <div className="flex gap-8 justify-center items-center">
                        <CircularProgress percent={stats.viewRate} colorClass="stroke-blue-400" label="視聴完了" />
                        <CircularProgress percent={stats.answerRate} colorClass="stroke-cyan-400" label="課題完了" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center gap-4 w-full">
                        <div className="bg-slate-950/60 rounded-lg p-4 border border-slate-800/60">
                            <span className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Status message</span>
                            <span className="text-lg font-bold text-slate-100">{msg}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm font-semibold">
                            <div className="bg-slate-800/80 px-3 py-1.5 rounded-md text-slate-300 border border-slate-700/50">
                                必須: <span className="text-white ml-1">{stats.total}</span>
                            </div>
                            <div className="bg-slate-800/80 px-3 py-1.5 rounded-md text-slate-300 border border-slate-700/50">
                                未視聴: <span className="text-blue-400 ml-1">{stats.total - stats.viewed}</span>
                            </div>
                            <div className="bg-slate-800/80 px-3 py-1.5 rounded-md text-slate-300 border border-slate-700/50">
                                未回答: <span className="text-cyan-400 ml-1">{stats.total - stats.answered}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="animate-in fade-in duration-700 pb-20 w-full overflow-hidden pointer-events-none px-4 sm:px-6 lg:px-10">
                {/* Skeleton Hero */}
                <div className="w-full h-[50vh] min-h-[380px] mb-8 rounded-2xl bg-slate-900 border border-slate-800/50 relative overflow-hidden flex items-end">
                    <div className="absolute inset-0 bg-slate-800/30 animate-pulse"></div>
                    <div className="relative z-10 w-full px-6 md:px-12 pb-10 space-y-4">
                        <div className="w-16 h-4 bg-slate-800 rounded animate-pulse"></div>
                        <div className="w-3/4 h-12 md:h-16 bg-slate-800 rounded-lg animate-pulse"></div>
                        <div className="flex gap-3 pt-4">
                            <div className="w-32 h-12 bg-slate-800 rounded-lg animate-pulse"></div>
                        </div>
                    </div>
                </div>
                <div className="space-y-10">
                    {[1, 2].map((row) => (
                        <div key={row} className="space-y-3">
                            <div className="w-48 h-7 bg-slate-900 rounded animate-pulse mb-4"></div>
                            <div className="flex gap-4 overflow-hidden">
                                {[1, 2, 3, 4].map((item) => (
                                    <div key={item} className="w-[280px] sm:w-[320px] shrink-0">
                                        <div className="aspect-video bg-slate-900 rounded-xl animate-pulse"></div>
                                        <div className="pt-3 space-y-2">
                                            <div className="w-1/3 h-3 bg-slate-900 rounded animate-pulse"></div>
                                            <div className="w-5/6 h-4 bg-slate-900 rounded animate-pulse"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-950/40 text-red-400 p-4 rounded-xl text-center font-medium border border-red-900/50 mx-4">
                {error}
                <button onClick={fetchData} className="ml-4 underline hover:text-red-300">再試行</button>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* ===== Prime Video Hero Section ===== */}
            <div className="relative w-full h-[52vh] min-h-[400px] mb-10 flex items-end overflow-hidden">
                <div className="absolute inset-0 z-0 bg-slate-900">
                    {heroLesson?.thumbnail && (
                        <img src={heroLesson.thumbnail} className="w-full h-full object-cover opacity-35 mix-blend-luminosity" alt="Featured" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/50 to-transparent"></div>
                </div>

                <div className="relative z-10 w-full px-4 sm:px-6 lg:px-10 pb-10">
                    {heroLesson ? (
                        <div className="max-w-3xl space-y-4">
                            <span className="text-[10px] font-black tracking-widest text-blue-400 uppercase flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 bg-blue-600/20 border border-blue-500/40 px-2 py-1 rounded text-blue-400">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                    {!heroLesson.hasViewed && heroLesson.required ? "NEXT RECOMMENDED" : "PICK UP"}
                                </span>
                            </span>
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight drop-shadow-2xl">
                                {heroLesson.title}
                            </h1>
                            <div className="flex items-center gap-3 text-sm font-semibold text-slate-300 drop-shadow-md">
                                {heroLesson.tags?.[0] && (
                                    <span className="text-slate-200">{heroLesson.tags[0]}</span>
                                )}
                                <span className="text-slate-600">•</span>
                                <span className={heroLesson.required ? "text-blue-400" : "text-slate-400"}>
                                    {heroLesson.required ? "必須コンテンツ" : "任意コンテンツ"}
                                </span>
                            </div>
                            <div className="pt-4 flex items-center gap-3">
                                <button
                                    onClick={() => router.push(`/lesson/${heroLesson.lesson_id}`)}
                                    className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-lg font-bold hover:bg-white/85 transition-all shadow-lg active:scale-95"
                                >
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                    {heroLesson.hasViewed ? "もう一度見る" : "再生"}
                                </button>
                                {userRole === "admin" && (
                                    <button
                                        onClick={() => router.push(`/admin/lesson/${heroLesson.lesson_id}`)}
                                        className="flex items-center gap-2 bg-slate-700/70 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-700 transition-colors backdrop-blur-md shadow-lg active:scale-95"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        詳細情報
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-slate-400">現在表示できる動画がありません。</div>
                    )}
                </div>
            </div>

            {/* Padding for below-hero content */}
            <div className="px-4 sm:px-6 lg:px-10">
                {showDashboard && renderDashboard()}

                {/* ===== Search & Filter ===== */}
                <div className="flex flex-col md:flex-row gap-3 items-center justify-between mb-10 relative z-20">
                    <div className="flex flex-1 w-full gap-3 items-center">
                        <div className="relative max-w-md w-full">
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="タイトルで検索..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:bg-slate-800/80 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 focus:outline-none transition-all"
                            />
                        </div>
                        {/* Tag filter as pill buttons */}
                        <div className="hidden md:flex items-center gap-2 overflow-x-auto hide-scrollbar flex-shrink-0">
                            <button
                                onClick={() => setTagFilter("")}
                                className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${tagFilter === "" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700"}`}
                            >
                                すべて
                            </button>
                            {uniqueTags.map(t => (
                                <button
                                    key={t}
                                    onClick={() => setTagFilter(tagFilter === t ? "" : t)}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${tagFilter === t ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700"}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                        <button onClick={fetchData} className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 text-slate-400 hover:text-white rounded-lg transition-colors hidden sm:block flex-shrink-0" title="再読込">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        </button>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={() => router.push("/cases")}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600/10 text-blue-400 px-5 py-2.5 rounded-lg text-sm font-bold border border-blue-500/30 hover:bg-blue-600/20 hover:border-blue-500/50 transition-all shadow-[0_0_15px_rgba(59,130,246,0.1)] active:scale-95"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            事例投稿コーナー
                        </button>

                        {userRole === "admin" && (
                            <button
                                onClick={() => router.push("/admin/users")}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold border border-slate-800 hover:bg-slate-800 hover:border-slate-600 transition-colors flex-shrink-0"
                            >
                                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                受講状況一覧
                            </button>
                        )}
                    </div>
                </div>

                {/* ===== Prime Video Carousel Rows ===== */}
                <div className="space-y-10">
                    {(tagFilter ? [tagFilter] : uniqueTags.length > 0 ? uniqueTags : ['全ての動画']).map((tag) => {
                        const rowLessons = tagFilter ? filteredLessons : filteredLessons.filter(l => tag === '全ての動画' ? true : l.tags?.includes(tag));
                        if (rowLessons.length === 0) return null;

                        return (
                            <div key={tag} className="space-y-3 relative group/row">
                                <h2 className="text-lg md:text-xl font-bold text-slate-100 flex items-center gap-2 pl-1">
                                    <span className="w-0.5 h-5 bg-blue-500 rounded-full"></span>
                                    {tag}
                                    <svg className="w-4 h-4 text-slate-600 opacity-0 group-hover/row:opacity-100 transition-all translate-x-[-8px] group-hover/row:translate-x-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                                </h2>

                                {/* Horizontal scroll carousel */}
                                <div className="flex overflow-x-auto gap-4 pb-6 pt-2 snap-x snap-mandatory hide-scrollbar scroll-smooth -mx-4 sm:-mx-6 lg:-mx-10 px-4 sm:px-6 lg:px-10">
                                    {rowLessons.map(lesson => (
                                        <div
                                            key={lesson.lesson_id}
                                            onClick={() => router.push(`/lesson/${lesson.lesson_id}`)}
                                            className="group relative flex-none w-[260px] sm:w-[300px] md:w-[320px] rounded-xl overflow-visible cursor-pointer snap-start"
                                        >
                                            {/* Thumbnail */}
                                            <div className="relative aspect-video bg-slate-800 rounded-xl overflow-hidden card-glow group-hover:z-30">
                                                {/* Badge */}
                                                {lesson.required ? (
                                                    <span className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-blue-600/90 backdrop-blur text-white text-[9px] font-black px-2 py-0.5 rounded-md tracking-wider shadow-lg">
                                                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                                        必須
                                                    </span>
                                                ) : (
                                                    <span className="absolute top-2 left-2 z-10 bg-slate-900/70 backdrop-blur text-slate-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-700">
                                                        任意
                                                    </span>
                                                )}

                                                {/* Progress bar */}
                                                {lesson.required && (
                                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-800/80">
                                                        {lesson.hasAnswered ? (
                                                            <div className="h-full bg-cyan-500 w-full"></div>
                                                        ) : lesson.hasViewed ? (
                                                            <div className="h-full bg-blue-500 w-1/2"></div>
                                                        ) : null}
                                                    </div>
                                                )}

                                                {lesson.thumbnail ? (
                                                    <img src={lesson.thumbnail} alt={lesson.title} className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-50" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-600 text-sm font-semibold">No Image</div>
                                                )}

                                                {/* Play overlay */}
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                    <div className="w-14 h-14 rounded-full border-2 border-white flex items-center justify-center bg-black/50 backdrop-blur-sm shadow-xl">
                                                        <svg className="w-7 h-7 text-white translate-x-[2px]" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Card Info */}
                                            <div className="pt-3 px-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                                <div className="flex items-center gap-2 text-[10px] font-bold mb-1.5">
                                                    {lesson.hasAnswered
                                                        ? <span className="text-cyan-400">✓ 回答済</span>
                                                        : lesson.hasViewed
                                                            ? <span className="text-blue-400">✓ 視聴済</span>
                                                            : <span className="text-slate-500">未視聴</span>
                                                    }
                                                    <span className="text-slate-700">•</span>
                                                    <span className="text-slate-400 flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                        {lesson.views_30d || 0}
                                                    </span>
                                                </div>
                                                <h3 className="text-sm font-semibold text-slate-100 line-clamp-2 leading-snug">{lesson.title}</h3>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredLessons.length === 0 && !loading && (
                    <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-slate-800 mt-6">
                        <p className="text-slate-500 font-medium">該当する動画が見つかりませんでした</p>
                    </div>
                )}
            </div>
        </div>
    );
}
