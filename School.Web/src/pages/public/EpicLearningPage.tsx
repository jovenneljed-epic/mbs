// ============================================================
// EpicLearningPage.tsx
// Free Theological Learning Management System (LMS)
// With Community Discussion Chats & School Number Authentication Gate
// ============================================================

import React, { useState, useEffect } from "react";
import PublicHeader from "../../components/PublicHeader";
import PublicFooter from "../../components/PublicFooter";
import SchoolNumberAuthModal from "../../components/SchoolNumberAuthModal";
import {
    getLmsDiscussions,
    postLmsDiscussion,
    postLmsComment,
    likeLmsDiscussion,
    getCurrentLmsSession,
    clearLmsSession,
    COMMUNITY_CHANNELS,
    LMS_DISCUSSIONS_UPDATED_EVENT,
    LMS_SESSION_CHANGED_EVENT,
    type LmsDiscussion,
    type LmsStudentSession
} from "../../services/lmsCommunityService";
import {
    PRESCRIBED_THEOLOGICAL_SUBJECTS,
    type PrescribedSubject
} from "../../services/courseCurriculumService";
import {
    lessonContentService,
    type CourseLesson
} from "../../services/lessonContentService";
import "./EpicLearningPage.css";
import "./PublicUnisonTheme.css";
import {
    BookOpen,
    MessageSquare,
    Send,
    ThumbsUp,
    CheckCircle2,
    Lock,
    Unlock,
    UserCheck,
    GraduationCap,
    Search,
    Heart,
    Landmark,
    ScrollText,
    Sparkles,
    Plus,
    CornerDownRight,
    LogOut,
    RefreshCw,
    Layers,
    FileText,
    ChevronRight,
    Award
} from "lucide-react";

interface EpicLearningPageProps {
    onNavigate?: (page: string) => void;
}

type LmsTab = "courses" | "community" | "lesson-reader";

export const EpicLearningPage: React.FC<EpicLearningPageProps> = ({ onNavigate }) => {
    // ------------------------------------------------------------
    // STATE MANAGEMENT
    // ------------------------------------------------------------
    const [activeTab, setActiveTab] = useState<LmsTab>("community");
    const [currentSession, setCurrentSession] = useState<LmsStudentSession | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    // Discussions state
    const [discussions, setDiscussions] = useState<LmsDiscussion[]>([]);
    const [selectedChannel, setSelectedChannel] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [loadingDiscussions, setLoadingDiscussions] = useState(false);

    // New discussion state
    const [showNewThreadModal, setShowNewThreadModal] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newChannel, setNewChannel] = useState("theology-inquiries");
    const [newContent, setNewContent] = useState("");
    const [submittingThread, setSubmittingThread] = useState(false);

    // Comment inputs state map: threadId -> text
    const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
    const [submittingCommentFor, setSubmittingCommentFor] = useState<string | null>(null);
    const [activeThreadComments, setActiveThreadComments] = useState<Record<string, boolean>>({});

    // Courses state
    const [selectedCourseCategory, setSelectedCourseCategory] = useState<string>("ALL");
    const [courseSearch, setCourseSearch] = useState("");

    // Lesson reader state
    const [lessons, setLessons] = useState<CourseLesson[]>([]);
    const [selectedLesson, setSelectedLesson] = useState<CourseLesson | null>(null);
    const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<number, number>>({});
    const [quizChecked, setQuizChecked] = useState(false);

    // ------------------------------------------------------------
    // INITIALIZATION & LIFECYCLE
    // ------------------------------------------------------------
    useEffect(() => {
        window.scrollTo(0, 0);

        // Check for existing session (LMS or Portal)
        const session = getCurrentLmsSession();
        setCurrentSession(session);

        // Load discussions
        fetchDiscussions();

        // Load lessons
        const allLessons = lessonContentService.getLessons();
        setLessons(allLessons);
        if (allLessons.length > 0) {
            setSelectedLesson(allLessons[0]);
        }

        // Listen for session and discussion events
        const handleSessionChange = (e: any) => {
            setCurrentSession(e.detail || null);
        };
        const handleDiscussionsUpdate = (e: any) => {
            if (e.detail) {
                setDiscussions(e.detail);
            }
        };

        window.addEventListener(LMS_SESSION_CHANGED_EVENT, handleSessionChange);
        window.addEventListener(LMS_DISCUSSIONS_UPDATED_EVENT, handleDiscussionsUpdate);

        return () => {
            window.removeEventListener(LMS_SESSION_CHANGED_EVENT, handleSessionChange);
            window.removeEventListener(LMS_DISCUSSIONS_UPDATED_EVENT, handleDiscussionsUpdate);
        };
    }, []);

    const fetchDiscussions = async () => {
        setLoadingDiscussions(true);
        try {
            const list = await getLmsDiscussions();
            setDiscussions(list);
            // Default open first thread comments
            if (list.length > 0) {
                setActiveThreadComments({ [list[0].id]: true });
            }
        } finally {
            setLoadingDiscussions(false);
        }
    };

    // ------------------------------------------------------------
    // AUTH HANDLERS
    // ------------------------------------------------------------
    const handleSignOut = () => {
        clearLmsSession();
        setCurrentSession(null);
    };

    const requireAuth = (callback: () => void) => {
        if (currentSession && currentSession.schoolNumber) {
            callback();
        } else {
            setIsAuthModalOpen(true);
        }
    };

    // ------------------------------------------------------------
    // DISCUSSION & COMMENT ACTIONS
    // ------------------------------------------------------------
    const handleOpenNewThread = () => {
        requireAuth(() => {
            setShowNewThreadModal(true);
        });
    };

    const handleCreateThread = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentSession) {
            setIsAuthModalOpen(true);
            return;
        }

        if (!newTitle.trim() || !newContent.trim()) {
            alert("Please provide both a discussion topic title and your thoughts or question.");
            return;
        }

        setSubmittingThread(true);
        try {
            const created = await postLmsDiscussion(newTitle, newChannel, newContent, currentSession);
            if (created) {
                setNewTitle("");
                setNewContent("");
                setShowNewThreadModal(false);
                await fetchDiscussions();
            }
        } catch (err: any) {
            alert(err?.message || "Failed to post discussion. Please check your credentials.");
        } finally {
            setSubmittingThread(false);
        }
    };

    const handleLike = async (threadId: string) => {
        await likeLmsDiscussion(threadId);
        // Optimistic UI update
        setDiscussions(prev =>
            prev.map(d => (d.id === threadId ? { ...d, likesCount: d.likesCount + 1 } : d))
        );
    };

    const handleToggleComments = (threadId: string) => {
        setActiveThreadComments(prev => ({
            ...prev,
            [threadId]: !prev[threadId]
        }));
    };

    const handleCommentChange = (threadId: string, val: string) => {
        setCommentInputs(prev => ({ ...prev, [threadId]: val }));
    };

    const handleSubmitComment = async (threadId: string) => {
        requireAuth(async () => {
            const text = commentInputs[threadId]?.trim();
            if (!text || !currentSession) return;

            setSubmittingCommentFor(threadId);
            try {
                const comment = await postLmsComment(threadId, text, currentSession);
                if (comment) {
                    setCommentInputs(prev => ({ ...prev, [threadId]: "" }));
                    // Ensure comments are expanded for this thread
                    setActiveThreadComments(prev => ({ ...prev, [threadId]: true }));
                    await fetchDiscussions();
                }
            } catch (err: any) {
                alert(err?.message || "Failed to post comment.");
            } finally {
                setSubmittingCommentFor(null);
            }
        });
    };

    // ------------------------------------------------------------
    // FILTERED DATA
    // ------------------------------------------------------------
    const filteredDiscussions = discussions.filter(disc => {
        const matchesChannel = selectedChannel === "all" || disc.channel === selectedChannel;
        const matchesSearch =
            searchQuery === "" ||
            disc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            disc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            disc.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            disc.schoolNumber.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesChannel && matchesSearch;
    });

    const filteredCourses = PRESCRIBED_THEOLOGICAL_SUBJECTS.filter(course => {
        const matchesCat =
            selectedCourseCategory === "ALL" ||
            course.category.toUpperCase().includes(selectedCourseCategory.toUpperCase()) ||
            course.code.startsWith(selectedCourseCategory);
        const matchesSearch =
            courseSearch === "" ||
            course.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
            course.code.toLowerCase().includes(courseSearch.toLowerCase());
        return matchesCat && matchesSearch;
    });

    const handleSelectCourseForReader = (course: PrescribedSubject) => {
        // Find existing lesson for this course or load matching
        const courseLessons = lessonContentService.getLessons(course.code);
        if (courseLessons.length > 0) {
            setSelectedLesson(courseLessons[0]);
        } else {
            // Generate dynamic interactive lesson card
            const dynamicLesson: CourseLesson = {
                id: `dyn-${course.code.toLowerCase().replace(/\s+/g, "-")}`,
                courseCode: course.code,
                lessonNumber: 1,
                title: `${course.title}: Fundamental Introduction & Expository Survey`,
                duration: "45 mins",
                isPublished: true,
                scriptureReference: "2 Timothy 2:15, 2 Timothy 3:16-17",
                overview: `An introductory survey into ${course.title}. This course is prescribed under the curriculum for ${course.category} (${course.yearLevel}, ${course.units} units).`,
                readingContent: [
                    `Welcome to ${course.code} - ${course.title}. In the curriculum of Mobile Bible School & Seminary, this subject establishes biblical grounding and ministry readiness.`,
                    `Study 2 Timothy 2:15: 'Study to shew thyself approved unto God, a workman that needeth not to be ashamed, rightly dividing the word of truth.'`,
                    `All Scripture is breathed out by God and profitable for teaching, for reproof, for correction, and for training in righteousness, that the man of God may be complete, equipped for every good work (2 Tim. 3:16-17).`
                ],
                keyTakeaways: [
                    `Mastery of biblical text context and authorial intent.`,
                    `Practical application for preaching, counseling, and church leadership.`,
                    `Accountability to historical orthopraxy and Reformed confessional truth.`
                ],
                quizQuestions: [
                    {
                        id: "q1",
                        question: "What is the primary biblical foundation for theological training cited in 2 Timothy 2:15?",
                        options: [
                            "Showing self approved unto God, rightly dividing the word of truth",
                            "Secular popularity and human eloquence",
                            "Philosophical speculation without Scripture",
                            "Commercial gain in ministry"
                        ],
                        correctIndex: 0,
                        explanation: "2 Timothy 2:15 commands us to study to show ourselves approved unto God, rightly dividing the word of truth."
                    }
                ]
            };
            setSelectedLesson(dynamicLesson);
        }
        setSelectedQuizAnswers({});
        setQuizChecked(false);
        setActiveTab("lesson-reader");
        window.scrollTo({ top: 400, behavior: "smooth" });
    };

    // ------------------------------------------------------------
    // RENDER HELPERS
    // ------------------------------------------------------------
    const getChannelIcon = (channelId: string) => {
        switch (channelId) {
            case "expository-insights":
                return <BookOpen size={16} />;
            case "pastoral-ministry":
                return <Landmark size={16} />;
            case "theology-inquiries":
                return <ScrollText size={16} />;
            case "prayer-fellowship":
                return <Heart size={16} />;
            default:
                return <MessageSquare size={16} />;
        }
    };

    return (
        <div className="epic-lms-page">
            <PublicHeader onNavigate={onNavigate} />

            {/* HERO SECTION */}
            <header className="lms-hero">
                <div className="lms-hero-container">
                    <div className="lms-hero-badge">
                        <Sparkles size={14} className="lms-sparkle-icon" />
                        <span>MBS THEOLOGICAL LMS 3.0 • FREE ACCREDITED EDUCATION</span>
                    </div>

                    <h1 className="lms-hero-title">
                        Free Theological Learning &amp; <span className="lms-hero-highlight">Community Discussions</span>
                    </h1>

                    <p className="lms-hero-subtitle">
                        Complete open access to the curriculum of <strong>Mobile Bible School &amp; Theological Seminary</strong>.
                        Browse courses and read expository lessons freely. To maintain scholarly fellowship,
                        <strong> posting discussion thoughts and comments is authenticated by verified School Number</strong>.
                    </p>

                    {/* SESSION BAR */}
                    <div className="lms-session-banner">
                        {currentSession ? (
                            <div className="lms-session-verified">
                                <div className="lms-session-info">
                                    <span className="lms-verified-pill">
                                        <CheckCircle2 size={15} />
                                        Verified {currentSession.isFaculty ? "Faculty" : "Student"}
                                    </span>
                                    <strong className="lms-session-name">{currentSession.fullName}</strong>
                                    <span className="lms-session-code">ID: {currentSession.schoolNumber}</span>
                                    <span className="lms-session-role">({currentSession.role})</span>
                                </div>
                                <div className="lms-session-actions">
                                    <button
                                        type="button"
                                        className="lms-btn-action-primary"
                                        onClick={handleOpenNewThread}
                                    >
                                        <Plus size={15} />
                                        <span>New Discussion</span>
                                    </button>
                                    <button
                                        type="button"
                                        className="lms-btn-signout"
                                        onClick={handleSignOut}
                                        title="Switch School Number"
                                    >
                                        <LogOut size={14} />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="lms-session-guest">
                                <div className="lms-guest-info">
                                    <Lock size={18} className="lms-guest-icon" />
                                    <div>
                                        <strong>Guest Preview Mode</strong>
                                        <p>You can freely read all courses, syllabi, and discussions. Authenticate your School Number to post and comment.</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="lms-btn-authenticate"
                                    onClick={() => setIsAuthModalOpen(true)}
                                >
                                    <UserCheck size={16} />
                                    <span>Authenticate School Number</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* LMS STATS STRIP */}
                    <div className="lms-stats-strip">
                        <div className="lms-stat-item">
                            <strong>35</strong>
                            <span>Theological Subjects</span>
                        </div>
                        <div className="lms-stat-divider" />
                        <div className="lms-stat-item">
                            <strong>4</strong>
                            <span>Prescribed Programs</span>
                        </div>
                        <div className="lms-stat-divider" />
                        <div className="lms-stat-item">
                            <strong>100%</strong>
                            <span>Free Open Curriculum</span>
                        </div>
                        <div className="lms-stat-divider" />
                        <div className="lms-stat-item">
                            <strong>{discussions.length}</strong>
                            <span>Community Discussions</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* LMS PRIMARY NAVIGATION TABS */}
            <div className="lms-nav-tabs-wrapper">
                <div className="lms-nav-tabs">
                    <button
                        type="button"
                        className={`lms-tab-btn ${activeTab === "community" ? "active" : ""}`}
                        onClick={() => setActiveTab("community")}
                    >
                        <MessageSquare size={18} />
                        <span>Student &amp; Faculty Community Chats</span>
                        {discussions.length > 0 && (
                            <span className="lms-tab-count">{discussions.length}</span>
                        )}
                    </button>

                    <button
                        type="button"
                        className={`lms-tab-btn ${activeTab === "courses" ? "active" : ""}`}
                        onClick={() => setActiveTab("courses")}
                    >
                        <Layers size={18} />
                        <span>Theological Course Catalog (35)</span>
                    </button>

                    <button
                        type="button"
                        className={`lms-tab-btn ${activeTab === "lesson-reader" ? "active" : ""}`}
                        onClick={() => setActiveTab("lesson-reader")}
                    >
                        <BookOpen size={18} />
                        <span>Interactive Lesson Reader</span>
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT BODY */}
            <main className="lms-main-content">
                {/* ======================================================== */}
                {/* TAB 1: COMMUNITY DISCUSSIONS & CHAT HUB                 */}
                {/* ======================================================== */}
                {activeTab === "community" && (
                    <div className="lms-community-layout">
                        {/* SIDEBAR: COMMUNITY CHANNELS */}
                        <aside className="lms-channels-sidebar">
                            <div className="lms-sidebar-header">
                                <h3>Community Streams</h3>
                                <button
                                    type="button"
                                    className="lms-refresh-btn"
                                    onClick={fetchDiscussions}
                                    title="Refresh Discussions"
                                >
                                    <RefreshCw size={14} className={loadingDiscussions ? "spin" : ""} />
                                </button>
                            </div>

                            <div className="lms-channel-list">
                                {COMMUNITY_CHANNELS.map(ch => (
                                    <button
                                        key={ch.id}
                                        type="button"
                                        className={`lms-channel-item ${selectedChannel === ch.id ? "active" : ""}`}
                                        onClick={() => setSelectedChannel(ch.id)}
                                    >
                                        <span className="lms-channel-name">{ch.name}</span>
                                        <small className="lms-channel-desc">{ch.description}</small>
                                    </button>
                                ))}
                            </div>

                            {/* PERMISSION NOTICE IN SIDEBAR */}
                            <div className="lms-sidebar-notice">
                                <div className="lms-notice-header">
                                    <Lock size={14} />
                                    <strong>Posting Permissions</strong>
                                </div>
                                <p>
                                    Only enrolled students and faculty members with valid School Numbers (e.g. <code>MBS-xxxx</code>, <code>EPIC-xxxx</code>) can post discussion threads or leave comments.
                                </p>
                                {!currentSession && (
                                    <button
                                        type="button"
                                        className="lms-sidebar-auth-btn"
                                        onClick={() => setIsAuthModalOpen(true)}
                                    >
                                        <UserCheck size={14} />
                                        <span>Verify School Number</span>
                                    </button>
                                )}
                            </div>
                        </aside>

                        {/* MAIN DISCUSSION FEED */}
                        <section className="lms-feed-container">
                            {/* SEARCH & NEW THREAD BAR */}
                            <div className="lms-feed-toolbar">
                                <div className="lms-feed-search">
                                    <Search size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search discussions by topic, Scripture, or author..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            className="lms-clear-btn"
                                            onClick={() => setSearchQuery("")}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    className="lms-btn-action-primary"
                                    onClick={handleOpenNewThread}
                                >
                                    <Plus size={16} />
                                    <span>Share Thought / Question</span>
                                </button>
                            </div>

                            {/* NEW THREAD COMPOSER MODAL / DRAWER */}
                            {showNewThreadModal && (
                                <div className="lms-composer-card">
                                    <div className="lms-composer-header">
                                        <div className="lms-composer-title-group">
                                            <Sparkles size={16} color="#10b981" />
                                            <h4>Start a Scholarly Discussion</h4>
                                        </div>
                                        <span className="lms-author-pill">
                                            Posting as <strong>{currentSession?.fullName}</strong> ({currentSession?.schoolNumber})
                                        </span>
                                    </div>

                                    <form onSubmit={handleCreateThread} className="lms-composer-form">
                                        <div className="lms-composer-row">
                                            <div className="lms-composer-field flex-2">
                                                <label>Discussion Topic / Scripture / Question *</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Exegesis of Romans 8:28-30 or Practical Counseling Models"
                                                    value={newTitle}
                                                    onChange={e => setNewTitle(e.target.value)}
                                                    required
                                                    autoFocus
                                                />
                                            </div>

                                            <div className="lms-composer-field flex-1">
                                                <label>Channel Stream</label>
                                                <select
                                                    value={newChannel}
                                                    onChange={e => setNewChannel(e.target.value)}
                                                >
                                                    <option value="theology-inquiries">❓ Theological Inquiries</option>
                                                    <option value="expository-insights">📖 Expository Insights</option>
                                                    <option value="pastoral-ministry">⛪ Pastoral Ministry</option>
                                                    <option value="prayer-fellowship">🙏 Prayer &amp; Fellowship</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="lms-composer-field">
                                            <label>Your Insight, Reflection, or Question *</label>
                                            <textarea
                                                rows={4}
                                                placeholder="Share your theological perspective, contextual insights, or questions for seminary cohorts..."
                                                value={newContent}
                                                onChange={e => setNewContent(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="lms-composer-actions">
                                            <button
                                                type="button"
                                                className="lms-btn-ghost"
                                                onClick={() => setShowNewThreadModal(false)}
                                                disabled={submittingThread}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="lms-btn-action-primary"
                                                disabled={submittingThread}
                                            >
                                                <Send size={15} />
                                                <span>{submittingThread ? "Publishing to Feed..." : "Publish Discussion"}</span>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* DISCUSSIONS LIST */}
                            {loadingDiscussions ? (
                                <div className="lms-loading-state">
                                    <RefreshCw size={28} className="spin" />
                                    <p>Loading real-time discussions from seminary cohorts...</p>
                                </div>
                            ) : filteredDiscussions.length === 0 ? (
                                <div className="lms-empty-state">
                                    <MessageSquare size={44} />
                                    <h3>No discussions found in this channel</h3>
                                    <p>Be the first scholar or student to initiate a dialogue or share an expository insight!</p>
                                    <button
                                        type="button"
                                        className="lms-btn-action-primary"
                                        onClick={handleOpenNewThread}
                                    >
                                        <Plus size={16} />
                                        <span>Start First Discussion</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="lms-thread-list">
                                    {filteredDiscussions.map(thread => {
                                        const isCommentsExpanded = !!activeThreadComments[thread.id];
                                        const currentCommentVal = commentInputs[thread.id] || "";

                                        return (
                                            <article key={thread.id} className="lms-thread-card">
                                                {/* THREAD HEADER */}
                                                <div className="lms-thread-header">
                                                    <div className="lms-thread-author-meta">
                                                        <div className="lms-author-avatar">
                                                            {thread.isFaculty ? (
                                                                <GraduationCap size={18} />
                                                            ) : (
                                                                <UserCheck size={18} />
                                                            )}
                                                        </div>
                                                        <div className="lms-author-col">
                                                            <div className="lms-author-top">
                                                                <strong className="lms-author-name">{thread.authorName}</strong>
                                                                <span className="lms-author-tag">
                                                                    ID: {thread.schoolNumber}
                                                                </span>
                                                                {thread.isFaculty ? (
                                                                    <span className="lms-badge-faculty">Faculty</span>
                                                                ) : (
                                                                    <span className="lms-badge-student">{thread.authorRole}</span>
                                                                )}
                                                            </div>
                                                            <time className="lms-thread-time">
                                                                {new Date(thread.createdAt).toLocaleDateString(undefined, {
                                                                    month: "short",
                                                                    day: "numeric",
                                                                    year: "numeric",
                                                                    hour: "2-digit",
                                                                    minute: "2-digit"
                                                                })}
                                                            </time>
                                                        </div>
                                                    </div>

                                                    <span className="lms-channel-tag">
                                                        {getChannelIcon(thread.channel)}
                                                        <span>{thread.channel.replace(/-/g, " ")}</span>
                                                    </span>
                                                </div>

                                                {/* THREAD TITLE & CONTENT */}
                                                <h3 className="lms-thread-title">{thread.title}</h3>
                                                <p className="lms-thread-body">{thread.content}</p>

                                                {/* THREAD FOOTER ACTIONS */}
                                                <div className="lms-thread-footer">
                                                    <div className="lms-footer-left">
                                                        <button
                                                            type="button"
                                                            className="lms-like-btn"
                                                            onClick={() => handleLike(thread.id)}
                                                            title="Encourage / Amen"
                                                        >
                                                            <ThumbsUp size={15} />
                                                            <span>{thread.likesCount} Amen</span>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className={`lms-comments-toggle-btn ${isCommentsExpanded ? "active" : ""}`}
                                                            onClick={() => handleToggleComments(thread.id)}
                                                        >
                                                            <MessageSquare size={15} />
                                                            <span>
                                                                {thread.comments?.length || 0} {thread.comments?.length === 1 ? "Comment" : "Comments"}
                                                            </span>
                                                        </button>
                                                    </div>

                                                    <span className="lms-verified-indicator">
                                                        <Unlock size={13} />
                                                        <span>Official School Number Verified</span>
                                                    </span>
                                                </div>

                                                {/* EXPANDED COMMENTS SECTION */}
                                                {isCommentsExpanded && (
                                                    <div className="lms-comments-tray">
                                                        {thread.comments && thread.comments.length > 0 && (
                                                            <div className="lms-comments-list">
                                                                {thread.comments.map(c => (
                                                                    <div key={c.id} className="lms-comment-item">
                                                                        <CornerDownRight size={14} className="lms-reply-arrow" />
                                                                        <div className="lms-comment-bubble">
                                                                            <div className="lms-comment-author-row">
                                                                                <strong className="lms-comment-author">{c.authorName}</strong>
                                                                                <span className="lms-comment-school-id">{c.schoolNumber}</span>
                                                                                {c.isFaculty ? (
                                                                                    <span className="lms-badge-faculty-sm">Faculty</span>
                                                                                ) : (
                                                                                    <span className="lms-badge-student-sm">Scholar</span>
                                                                                )}
                                                                                <span className="lms-comment-time">
                                                                                    {new Date(c.createdAt).toLocaleDateString(undefined, {
                                                                                        month: "short",
                                                                                        day: "numeric",
                                                                                        hour: "2-digit",
                                                                                        minute: "2-digit"
                                                                                    })}
                                                                                </span>
                                                                            </div>
                                                                            <p className="lms-comment-text">{c.text}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* COMMENT COMPOSER */}
                                                        <div className="lms-comment-composer">
                                                            {currentSession ? (
                                                                <div className="lms-comment-form">
                                                                    <input
                                                                        type="text"
                                                                        placeholder={`Reply as ${currentSession.fullName} (${currentSession.schoolNumber})...`}
                                                                        value={currentCommentVal}
                                                                        onChange={e => handleCommentChange(thread.id, e.target.value)}
                                                                        onKeyDown={e => {
                                                                            if (e.key === "Enter" && !e.shiftKey) {
                                                                                e.preventDefault();
                                                                                handleSubmitComment(thread.id);
                                                                            }
                                                                        }}
                                                                        disabled={submittingCommentFor === thread.id}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        className="lms-btn-send-comment"
                                                                        onClick={() => handleSubmitComment(thread.id)}
                                                                        disabled={!currentCommentVal.trim() || submittingCommentFor === thread.id}
                                                                    >
                                                                        <Send size={14} />
                                                                        <span>{submittingCommentFor === thread.id ? "Posting..." : "Reply"}</span>
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="lms-comment-locked">
                                                                    <Lock size={15} />
                                                                    <span>School Number authentication required to reply to this thread.</span>
                                                                    <button
                                                                        type="button"
                                                                        className="lms-btn-comment-auth"
                                                                        onClick={() => setIsAuthModalOpen(true)}
                                                                    >
                                                                        Authenticate ID
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    </div>
                )}

                {/* ======================================================== */}
                {/* TAB 2: FREE THEOLOGICAL COURSE CATALOG & SYLLABUS        */}
                {/* ======================================================== */}
                {activeTab === "courses" && (
                    <div className="lms-courses-catalog">
                        <div className="lms-catalog-header">
                            <div>
                                <span className="lms-cat-pill">ACCREDITED CURRICULUM</span>
                                <h2>Prescribed Theological Catalog</h2>
                                <p>
                                    All 35 official subjects across Biblical Studies, Pastoral Ministry, Christian Education, and Dogmatics.
                                    Freely browse course syllabi, unit requirements, and open lessons.
                                </p>
                            </div>

                            {/* FILTER PILLS */}
                            <div className="lms-catalog-filters">
                                {[
                                    { label: "All Subjects (35)", code: "ALL" },
                                    { label: "CBS (Biblical Studies)", code: "CBS" },
                                    { label: "DPS (Pastoral Studies)", code: "DPS" },
                                    { label: "AML (Ministry Leadership)", code: "AML" },
                                    { label: "BTH (Bachelor of Theology)", code: "BTH" }
                                ].map(f => (
                                    <button
                                        key={f.code}
                                        type="button"
                                        className={`lms-filter-btn ${selectedCourseCategory === f.code ? "active" : ""}`}
                                        onClick={() => setSelectedCourseCategory(f.code)}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* SEARCH INPUT */}
                        <div className="lms-catalog-search-bar">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="Search courses by code or title (e.g. CBS 101, Life of Christ, Hermeneutics)..."
                                value={courseSearch}
                                onChange={e => setCourseSearch(e.target.value)}
                            />
                        </div>

                        {/* COURSE GRID */}
                        <div className="lms-courses-grid">
                            {filteredCourses.map((course, idx) => (
                                <div key={course.code || idx} className="lms-course-card">
                                    <div className="lms-course-card-top">
                                        <span className="lms-course-code-badge">{course.code}</span>
                                        <span className="lms-course-units">{course.units} Academic Units</span>
                                    </div>

                                    <h3 className="lms-course-title">{course.title}</h3>
                                    <p className="lms-course-category-tag">{course.category}</p>
                                    <span className="lms-course-year">{course.yearLevel}</span>

                                    <div className="lms-course-card-footer">
                                        <button
                                            type="button"
                                            className="lms-btn-open-lesson"
                                            onClick={() => handleSelectCourseForReader(course)}
                                        >
                                            <BookOpen size={14} />
                                            <span>Read Course Lessons</span>
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ======================================================== */}
                {/* TAB 3: INTERACTIVE LESSON READER                         */}
                {/* ======================================================== */}
                {activeTab === "lesson-reader" && (
                    <div className="lms-reader-layout">
                        {/* LESSON PICKER SIDEBAR */}
                        <aside className="lms-reader-sidebar">
                            <div className="lms-sidebar-header">
                                <h3>Expository Lessons</h3>
                                <span className="lms-badge-green">Free Reader</span>
                            </div>

                            <div className="lms-reader-lesson-list">
                                {lessons.map(l => (
                                    <button
                                        key={l.id}
                                        type="button"
                                        className={`lms-reader-lesson-btn ${selectedLesson?.id === l.id ? "active" : ""}`}
                                        onClick={() => {
                                            setSelectedLesson(l);
                                            setSelectedQuizAnswers({});
                                            setQuizChecked(false);
                                        }}
                                    >
                                        <span className="lms-lesson-btn-code">{l.courseCode}</span>
                                        <strong className="lms-lesson-btn-title">{l.title}</strong>
                                        <small className="lms-lesson-btn-duration">{l.duration}</small>
                                    </button>
                                ))}
                            </div>
                        </aside>

                        {/* LESSON READING VIEW */}
                        <section className="lms-reader-content">
                            {selectedLesson ? (
                                <div className="lms-lesson-article">
                                    <div className="lms-lesson-header">
                                        <div className="lms-lesson-meta-row">
                                            <span className="lms-lesson-code-pill">{selectedLesson.courseCode}</span>
                                            <span className="lms-lesson-duration-pill">{selectedLesson.duration}</span>
                                            <span className="lms-lesson-scripture-pill">
                                                📜 {selectedLesson.scriptureReference}
                                            </span>
                                        </div>

                                        <h2 className="lms-lesson-heading">{selectedLesson.title}</h2>
                                        <p className="lms-lesson-overview">{selectedLesson.overview}</p>
                                    </div>

                                    {/* READING PARAGRAPHS */}
                                    <div className="lms-lesson-body">
                                        <h3>Expository Lecture &amp; Biblical Notes</h3>
                                        {selectedLesson.readingContent.map((paragraph, pIdx) => (
                                            <p key={pIdx} className="lms-lesson-paragraph">
                                                {paragraph}
                                            </p>
                                        ))}
                                    </div>

                                    {/* KEY TAKEAWAYS */}
                                    {selectedLesson.keyTakeaways && selectedLesson.keyTakeaways.length > 0 && (
                                        <div className="lms-takeaways-card">
                                            <div className="lms-takeaways-header">
                                                <Award size={18} color="#10b981" />
                                                <h4>Key Theological Takeaways</h4>
                                            </div>
                                            <ul>
                                                {selectedLesson.keyTakeaways.map((takeaway, tIdx) => (
                                                    <li key={tIdx}>
                                                        <CheckCircle2 size={16} color="#10b981" />
                                                        <span>{takeaway}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* COMPREHENSION QUIZ */}
                                    {selectedLesson.quizQuestions && selectedLesson.quizQuestions.length > 0 && (
                                        <div className="lms-quiz-container">
                                            <div className="lms-quiz-header">
                                                <FileText size={18} color="#10b981" />
                                                <h4>Expository Check &amp; Comprehension Quiz</h4>
                                            </div>

                                            <div className="lms-quiz-questions">
                                                {selectedLesson.quizQuestions.map((q, qIndex) => (
                                                    <div key={q.id || qIndex} className="lms-quiz-item">
                                                        <p className="lms-quiz-q-title">
                                                            <strong>Question {qIndex + 1}:</strong> {q.question}
                                                        </p>

                                                        <div className="lms-quiz-options">
                                                            {q.options.map((opt, oIndex) => {
                                                                const isSelected = selectedQuizAnswers[qIndex] === oIndex;
                                                                const isCorrect = q.correctIndex === oIndex;
                                                                let optClass = "";
                                                                if (quizChecked) {
                                                                    if (isCorrect) optClass = "correct";
                                                                    else if (isSelected && !isCorrect) optClass = "incorrect";
                                                                } else if (isSelected) {
                                                                    optClass = "selected";
                                                                }

                                                                return (
                                                                    <button
                                                                        key={oIndex}
                                                                        type="button"
                                                                        className={`lms-quiz-opt-btn ${optClass}`}
                                                                        onClick={() => {
                                                                            if (!quizChecked) {
                                                                                setSelectedQuizAnswers(prev => ({
                                                                                    ...prev,
                                                                                    [qIndex]: oIndex
                                                                                }));
                                                                            }
                                                                        }}
                                                                    >
                                                                        <span className="lms-opt-letter">
                                                                            {String.fromCharCode(65 + oIndex)}
                                                                        </span>
                                                                        <span>{opt}</span>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>

                                                        {quizChecked && q.explanation && (
                                                            <div className="lms-quiz-explanation">
                                                                <strong>Expository Explanation:</strong> {q.explanation}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="lms-quiz-actions">
                                                {!quizChecked ? (
                                                    <button
                                                        type="button"
                                                        className="lms-btn-action-primary"
                                                        onClick={() => setQuizChecked(true)}
                                                        disabled={Object.keys(selectedQuizAnswers).length === 0}
                                                    >
                                                        Check Answers
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="lms-btn-ghost"
                                                        onClick={() => {
                                                            setQuizChecked(false);
                                                            setSelectedQuizAnswers({});
                                                        }}
                                                    >
                                                        Reset Quiz
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* COMMUNITY CTA */}
                                    <div className="lms-lesson-community-cta">
                                        <MessageSquare size={22} color="#10b981" />
                                        <div className="lms-cta-text">
                                            <h4>Have questions or insights about this lesson?</h4>
                                            <p>Discuss Scripture insights and share your thoughts in the Community Chat hub.</p>
                                        </div>
                                        <button
                                            type="button"
                                            className="lms-btn-action-primary"
                                            onClick={() => {
                                                setNewTitle(`Discussion on: ${selectedLesson.title} (${selectedLesson.courseCode})`);
                                                setNewChannel("expository-insights");
                                                setActiveTab("community");
                                                handleOpenNewThread();
                                            }}
                                        >
                                            <Send size={15} />
                                            <span>Discuss in Community Chat</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="lms-empty-state">
                                    <BookOpen size={40} />
                                    <h3>Select a lesson from the sidebar to begin reading</h3>
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </main>

            {/* SCHOOL NUMBER AUTH MODAL */}
            <SchoolNumberAuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onSuccess={session => {
                    setCurrentSession(session);
                    setIsAuthModalOpen(false);
                }}
                onNavigatePortal={portal => {
                    setIsAuthModalOpen(false);
                    if (portal === "student") {
                        onNavigate?.("client-login");
                    } else {
                        onNavigate?.("login");
                    }
                }}
            />

            {/* UNIFIED INSTITUTIONAL FOOTER */}
            <PublicFooter
                onNavigate={onNavigate}
                onOpenAdmission={() => onNavigate?.("contact")}
            />
        </div>
    );
};

export default EpicLearningPage;
