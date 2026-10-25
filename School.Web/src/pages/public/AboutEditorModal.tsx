// ============================================================
// AboutEditorModal.tsx
// Comprehensive Institutional Dossier Editor Modal for Administrator
// Supports real-time editing of Hero, Faith, Faculty, Campuses & Accreditations
// ============================================================

import React, { useState, useEffect } from "react";
import "./AboutEditorModal.css";
import type {
    AboutContentData,
    DoctrinalArticle,
    FacultyMember
} from "../../services/aboutContentService";
import {
    X,
    Save,
    RotateCcw,
    Plus,
    Trash2,
    Edit2,
    Check,
    AlertCircle,
    Award,
    ShieldCheck,
    MapPin,
    ScrollText,
    Landmark,
    CheckCircle2
} from "lucide-react";

interface AboutEditorModalProps {
    isOpen: boolean;
    initialTab?: "hero" | "faith" | "faculty" | "campuses" | "accreditations";
    content: AboutContentData;
    onSave: (updated: AboutContentData) => Promise<boolean>;
    onReset: () => Promise<void>;
    onClose: () => void;
}

export const AboutEditorModal: React.FC<AboutEditorModalProps> = ({
    isOpen,
    initialTab = "hero",
    content,
    onSave,
    onReset,
    onClose
}) => {
    const [activeTab, setActiveTab] = useState<"hero" | "faith" | "faculty" | "campuses" | "accreditations">(initialTab);
    const [draft, setDraft] = useState<AboutContentData>(JSON.parse(JSON.stringify(content)));
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    // Sub-modal state for Article
    const [editingArticleIdx, setEditingArticleIdx] = useState<number | null>(null);
    const [articleForm, setArticleForm] = useState<DoctrinalArticle>({
        num: "",
        title: "",
        shortSummary: "",
        fullText: "",
        scriptures: []
    });
    const [articleScriptureInput, setArticleScriptureInput] = useState("");

    // Sub-modal state for Faculty
    const [editingFacultyIdx, setEditingFacultyIdx] = useState<number | null>(null);
    const [facultyForm, setFacultyForm] = useState<FacultyMember>({
        id: "",
        name: "",
        title: "",
        department: "theology",
        departmentLabel: "Systematic Theology",
        degrees: [],
        courses: [],
        bio: "",
        tenureYears: 10
    });
    const [facultyDegreesInput, setFacultyDegreesInput] = useState("");
    const [facultyCoursesInput, setFacultyCoursesInput] = useState("");

    // Sync draft when content or initialTab updates
    useEffect(() => {
        if (isOpen) {
            setDraft(JSON.parse(JSON.stringify(content)));
            setActiveTab(initialTab);
            setSaveSuccess(false);
            setSaveError(null);
            setEditingArticleIdx(null);
            setEditingFacultyIdx(null);
        }
    }, [isOpen, initialTab, content]);

    if (!isOpen) return null;

    // ------------------------------------------------------------
    // SAVE HANDLER
    // ------------------------------------------------------------
    const handleSave = async () => {
        setSaving(true);
        setSaveError(null);
        try {
            const ok = await onSave(draft);
            if (ok) {
                setSaveSuccess(true);
                setTimeout(() => {
                    setSaveSuccess(false);
                    onClose();
                }, 1200);
            } else {
                setSaveError("Failed to save to server. Changes are cached locally.");
            }
        } catch (e: any) {
            setSaveError(e?.message || "An unexpected error occurred while saving.");
        } finally {
            setSaving(false);
        }
    };

    // ------------------------------------------------------------
    // RESET HANDLER
    // ------------------------------------------------------------
    const handleReset = async () => {
        if (window.confirm("Are you sure you want to restore the official seminary default content? All custom edits will be reset.")) {
            setSaving(true);
            try {
                await onReset();
                setSaveSuccess(true);
                setTimeout(() => {
                    setSaveSuccess(false);
                    onClose();
                }, 1000);
            } finally {
                setSaving(false);
            }
        }
    };

    // ------------------------------------------------------------
    // ARTICLE ACTIONS
    // ------------------------------------------------------------
    const handleOpenArticleEdit = (idx: number) => {
        const item = draft.faith.articles[idx];
        setEditingArticleIdx(idx);
        setArticleForm({ ...item });
        setArticleScriptureInput(item.scriptures.join(", "));
    };

    const handleOpenNewArticle = () => {
        const nextNum = `Article ${draft.faith.articles.length + 1}`;
        setEditingArticleIdx(-1); // -1 signifies new
        setArticleForm({
            num: nextNum,
            title: "",
            shortSummary: "",
            fullText: "",
            scriptures: []
        });
        setArticleScriptureInput("");
    };

    const handleSaveArticle = () => {
        if (!articleForm.title.trim()) {
            alert("Please enter an article title.");
            return;
        }

        const scriptures = articleScriptureInput
            .split(",")
            .map(s => s.trim())
            .filter(Boolean);

        const updated = { ...articleForm, scriptures };
        const newArticles = [...draft.faith.articles];

        if (editingArticleIdx === -1) {
            newArticles.push(updated);
        } else if (editingArticleIdx !== null && editingArticleIdx >= 0) {
            newArticles[editingArticleIdx] = updated;
        }

        setDraft({
            ...draft,
            faith: {
                ...draft.faith,
                articles: newArticles
            }
        });

        setEditingArticleIdx(null);
    };

    const handleDeleteArticle = (idx: number) => {
        if (window.confirm(`Delete "${draft.faith.articles[idx].title}"?`)) {
            const newArticles = draft.faith.articles.filter((_, i) => i !== idx);
            setDraft({
                ...draft,
                faith: {
                    ...draft.faith,
                    articles: newArticles
                }
            });
        }
    };

    // ------------------------------------------------------------
    // FACULTY ACTIONS
    // ------------------------------------------------------------
    const handleOpenFacultyEdit = (idx: number) => {
        const fac = draft.faculty.members[idx];
        setEditingFacultyIdx(idx);
        setFacultyForm({ ...fac });
        setFacultyDegreesInput(fac.degrees.join(", "));
        setFacultyCoursesInput(fac.courses.join(", "));
    };

    const handleOpenNewFaculty = () => {
        setEditingFacultyIdx(-1);
        setFacultyForm({
            id: `fac-${Date.now()}`,
            name: "",
            title: "",
            department: "theology",
            departmentLabel: "Systematic & Educational Theology",
            degrees: [],
            courses: [],
            bio: "",
            tenureYears: 5
        });
        setFacultyDegreesInput("");
        setFacultyCoursesInput("");
    };

    const handleSaveFaculty = () => {
        if (!facultyForm.name.trim()) {
            alert("Please enter the professor's name.");
            return;
        }

        const deptLabels: Record<string, string> = {
            leadership: "Executive Leadership & Deans",
            languages: "Biblical Languages & Exegesis",
            theology: "Systematic & Educational Theology",
            ministry: "Pastoral Studies & Missions"
        };

        const degrees = facultyDegreesInput.split(",").map(d => d.trim()).filter(Boolean);
        const courses = facultyCoursesInput.split(",").map(c => c.trim()).filter(Boolean);

        const updated: FacultyMember = {
            ...facultyForm,
            departmentLabel: deptLabels[facultyForm.department] || "Theology & Ministry",
            degrees,
            courses
        };

        const newMembers = [...draft.faculty.members];
        if (editingFacultyIdx === -1) {
            newMembers.push(updated);
        } else if (editingFacultyIdx !== null && editingFacultyIdx >= 0) {
            newMembers[editingFacultyIdx] = updated;
        }

        setDraft({
            ...draft,
            faculty: {
                ...draft.faculty,
                members: newMembers
            }
        });

        setEditingFacultyIdx(null);
    };

    const handleDeleteFaculty = (idx: number) => {
        if (window.confirm(`Remove faculty member "${draft.faculty.members[idx].name}"?`)) {
            const newMembers = draft.faculty.members.filter((_, i) => i !== idx);
            setDraft({
                ...draft,
                faculty: {
                    ...draft.faculty,
                    members: newMembers
                }
            });
        }
    };

    return (
        <div className="mbs-editor-overlay">
            <div className="mbs-editor-modal">
                {/* MODAL HEADER */}
                <div className="mbs-editor-header">
                    <div className="mbs-editor-title-group">
                        <div className="mbs-editor-icon-badge">
                            <ShieldCheck size={20} color="#10B981" />
                        </div>
                        <div>
                            <h2>Institutional Dossier CMS Editor</h2>
                            <p>Administrator Portal • Live customization for About &amp; Campuses</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="mbs-editor-close-btn"
                        onClick={onClose}
                        title="Close Editor"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* TABS NAVIGATION */}
                <div className="mbs-editor-tabs">
                    <button
                        type="button"
                        className={`mbs-editor-tab ${activeTab === "hero" ? "active" : ""}`}
                        onClick={() => setActiveTab("hero")}
                    >
                        <Landmark size={15} />
                        <span>Hero &amp; Overview</span>
                    </button>
                    <button
                        type="button"
                        className={`mbs-editor-tab ${activeTab === "faith" ? "active" : ""}`}
                        onClick={() => setActiveTab("faith")}
                    >
                        <ScrollText size={15} />
                        <span>Statement of Faith ({draft.faith.articles.length})</span>
                    </button>
                    <button
                        type="button"
                        className={`mbs-editor-tab ${activeTab === "faculty" ? "active" : ""}`}
                        onClick={() => setActiveTab("faculty")}
                    >
                        <Award size={15} />
                        <span>Faculty &amp; Deans ({draft.faculty.members.length})</span>
                    </button>
                    <button
                        type="button"
                        className={`mbs-editor-tab ${activeTab === "campuses" ? "active" : ""}`}
                        onClick={() => setActiveTab("campuses")}
                    >
                        <MapPin size={15} />
                        <span>Campuses &amp; Centers</span>
                    </button>
                    <button
                        type="button"
                        className={`mbs-editor-tab ${activeTab === "accreditations" ? "active" : ""}`}
                        onClick={() => setActiveTab("accreditations")}
                    >
                        <ShieldCheck size={15} />
                        <span>Accreditations &amp; CTA</span>
                    </button>
                </div>

                {/* MODAL BODY */}
                <div className="mbs-editor-body">
                    {saveSuccess && (
                        <div className="mbs-editor-alert success">
                            <CheckCircle2 size={18} />
                            <span>Changes saved successfully! Page content has updated.</span>
                        </div>
                    )}

                    {saveError && (
                        <div className="mbs-editor-alert error">
                            <AlertCircle size={18} />
                            <span>{saveError}</span>
                        </div>
                    )}

                    {/* TAB 1: HERO & OVERVIEW */}
                    {activeTab === "hero" && (
                        <div className="mbs-editor-section">
                            <div className="mbs-editor-group-title">
                                <h3>Hero Banner Branding</h3>
                                <p>Configure top banner heading, subtitle, and trust badges</p>
                            </div>

                            <div className="mbs-form-row">
                                <label className="mbs-form-label">
                                    <span>Top Gold Badge Text</span>
                                    <input
                                        type="text"
                                        className="mbs-form-input"
                                        value={draft.hero.badge}
                                        onChange={e => setDraft({
                                            ...draft,
                                            hero: { ...draft.hero, badge: e.target.value }
                                        })}
                                    />
                                </label>
                            </div>

                            <div className="mbs-form-grid-2">
                                <label className="mbs-form-label">
                                    <span>Primary Title</span>
                                    <input
                                        type="text"
                                        className="mbs-form-input"
                                        value={draft.hero.title}
                                        onChange={e => setDraft({
                                            ...draft,
                                            hero: { ...draft.hero, title: e.target.value }
                                        })}
                                    />
                                </label>

                                <label className="mbs-form-label">
                                    <span>Gold Accent Title</span>
                                    <input
                                        type="text"
                                        className="mbs-form-input"
                                        value={draft.hero.titleHighlight}
                                        onChange={e => setDraft({
                                            ...draft,
                                            hero: { ...draft.hero, titleHighlight: e.target.value }
                                        })}
                                    />
                                </label>
                            </div>

                            <div className="mbs-form-row">
                                <label className="mbs-form-label">
                                    <span>Hero Subtitle Narrative</span>
                                    <textarea
                                        className="mbs-form-textarea"
                                        rows={3}
                                        value={draft.hero.subtitle}
                                        onChange={e => setDraft({
                                            ...draft,
                                            hero: { ...draft.hero, subtitle: e.target.value }
                                        })}
                                    />
                                </label>
                            </div>

                            <div className="mbs-form-row">
                                <label className="mbs-form-label">
                                    <span>Trust Chips (Comma-separated)</span>
                                    <input
                                        type="text"
                                        className="mbs-form-input"
                                        value={draft.hero.trustChips.join(", ")}
                                        onChange={e => setDraft({
                                            ...draft,
                                            hero: {
                                                ...draft.hero,
                                                trustChips: e.target.value.split(",").map(t => t.trim()).filter(Boolean)
                                            }
                                        })}
                                    />
                                </label>
                            </div>

                            <div className="mbs-editor-group-title" style={{ marginTop: 32 }}>
                                <h3>Chancellor&apos;s Pastoral Message</h3>
                                <p>Message from Seminary President &amp; Professor</p>
                            </div>

                            <div className="mbs-form-grid-2">
                                <label className="mbs-form-label">
                                    <span>Chancellor Name</span>
                                    <input
                                        type="text"
                                        className="mbs-form-input"
                                        value={draft.overview.chancellor.name}
                                        onChange={e => setDraft({
                                            ...draft,
                                            overview: {
                                                ...draft.overview,
                                                chancellor: { ...draft.overview.chancellor, name: e.target.value }
                                            }
                                        })}
                                    />
                                </label>

                                <label className="mbs-form-label">
                                    <span>Chancellor Title</span>
                                    <input
                                        type="text"
                                        className="mbs-form-input"
                                        value={draft.overview.chancellor.title}
                                        onChange={e => setDraft({
                                            ...draft,
                                            overview: {
                                                ...draft.overview,
                                                chancellor: { ...draft.overview.chancellor, title: e.target.value }
                                            }
                                        })}
                                    />
                                </label>
                            </div>

                            <div className="mbs-form-row">
                                <label className="mbs-form-label">
                                    <span>Chancellor Message Quote</span>
                                    <textarea
                                        className="mbs-form-textarea"
                                        rows={4}
                                        value={draft.overview.chancellor.quote}
                                        onChange={e => setDraft({
                                            ...draft,
                                            overview: {
                                                ...draft.overview,
                                                chancellor: { ...draft.overview.chancellor, quote: e.target.value }
                                            }
                                        })}
                                    />
                                </label>
                            </div>

                            <div className="mbs-form-grid-2">
                                <label className="mbs-form-label">
                                    <span>Scripture Verse</span>
                                    <input
                                        type="text"
                                        className="mbs-form-input"
                                        value={draft.overview.chancellor.scripture}
                                        onChange={e => setDraft({
                                            ...draft,
                                            overview: {
                                                ...draft.overview,
                                                chancellor: { ...draft.overview.chancellor, scripture: e.target.value }
                                            }
                                        })}
                                    />
                                </label>

                                <label className="mbs-form-label">
                                    <span>Scripture Reference</span>
                                    <input
                                        type="text"
                                        className="mbs-form-input"
                                        value={draft.overview.chancellor.reference}
                                        onChange={e => setDraft({
                                            ...draft,
                                            overview: {
                                                ...draft.overview,
                                                chancellor: { ...draft.overview.chancellor, reference: e.target.value }
                                            }
                                        })}
                                    />
                                </label>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: STATEMENT OF FAITH */}
                    {activeTab === "faith" && (
                        <div className="mbs-editor-section">
                            {editingArticleIdx !== null ? (
                                <div className="mbs-subform-box">
                                    <div className="mbs-subform-header">
                                        <h4>{editingArticleIdx === -1 ? "Add New Article of Faith" : `Edit ${articleForm.num}`}</h4>
                                        <button
                                            type="button"
                                            className="mbs-btn-secondary"
                                            onClick={() => setEditingArticleIdx(null)}
                                        >
                                            Cancel
                                        </button>
                                    </div>

                                    <div className="mbs-form-grid-2">
                                        <label className="mbs-form-label">
                                            <span>Article Number (e.g. Article XI)</span>
                                            <input
                                                type="text"
                                                className="mbs-form-input"
                                                value={articleForm.num}
                                                onChange={e => setArticleForm({ ...articleForm, num: e.target.value })}
                                            />
                                        </label>
                                        <label className="mbs-form-label">
                                            <span>Article Title</span>
                                            <input
                                                type="text"
                                                className="mbs-form-input"
                                                value={articleForm.title}
                                                onChange={e => setArticleForm({ ...articleForm, title: e.target.value })}
                                            />
                                        </label>
                                    </div>

                                    <div className="mbs-form-row">
                                        <label className="mbs-form-label">
                                            <span>Summary (Brief synopsis)</span>
                                            <input
                                                type="text"
                                                className="mbs-form-input"
                                                value={articleForm.shortSummary}
                                                onChange={e => setArticleForm({ ...articleForm, shortSummary: e.target.value })}
                                            />
                                        </label>
                                    </div>

                                    <div className="mbs-form-row">
                                        <label className="mbs-form-label">
                                            <span>Full Confessional Text</span>
                                            <textarea
                                                className="mbs-form-textarea"
                                                rows={5}
                                                value={articleForm.fullText}
                                                onChange={e => setArticleForm({ ...articleForm, fullText: e.target.value })}
                                            />
                                        </label>
                                    </div>

                                    <div className="mbs-form-row">
                                        <label className="mbs-form-label">
                                            <span>Scripture Proofs (Comma-separated)</span>
                                            <input
                                                type="text"
                                                className="mbs-form-input"
                                                placeholder="e.g. 2 Timothy 3:16-17, Psalm 19:7-11"
                                                value={articleScriptureInput}
                                                onChange={e => setArticleScriptureInput(e.target.value)}
                                            />
                                        </label>
                                    </div>

                                    <div className="mbs-subform-actions">
                                        <button
                                            type="button"
                                            className="mbs-btn-primary"
                                            onClick={handleSaveArticle}
                                        >
                                            <Check size={16} />
                                            <span>{editingArticleIdx === -1 ? "Add Article" : "Apply Changes"}</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="mbs-editor-list-header">
                                        <div>
                                            <h3>Doctrinal Articles ({draft.faith.articles.length})</h3>
                                            <p>Manage theological articles, definitions, and scripture proofs</p>
                                        </div>
                                        <button
                                            type="button"
                                            className="mbs-btn-primary"
                                            onClick={handleOpenNewArticle}
                                        >
                                            <Plus size={16} />
                                            <span>Add Article of Faith</span>
                                        </button>
                                    </div>

                                    <div className="mbs-items-list">
                                        {draft.faith.articles.map((art, idx) => (
                                            <div key={art.num + idx} className="mbs-item-row">
                                                <div className="mbs-item-info">
                                                    <span className="mbs-item-badge">{art.num}</span>
                                                    <div>
                                                        <strong>{art.title}</strong>
                                                        <p>{art.shortSummary}</p>
                                                        <div className="mbs-item-meta-tags">
                                                            {art.scriptures.slice(0, 3).map((s, i) => (
                                                                <span key={i} className="mbs-meta-chip">{s}</span>
                                                            ))}
                                                            {art.scriptures.length > 3 && (
                                                                <span className="mbs-meta-chip">+{art.scriptures.length - 3} more</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mbs-item-actions">
                                                    <button
                                                        type="button"
                                                        className="mbs-action-btn edit"
                                                        onClick={() => handleOpenArticleEdit(idx)}
                                                        title="Edit Article"
                                                    >
                                                        <Edit2 size={15} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="mbs-action-btn delete"
                                                        onClick={() => handleDeleteArticle(idx)}
                                                        title="Delete Article"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* TAB 3: FACULTY & DEANS */}
                    {activeTab === "faculty" && (
                        <div className="mbs-editor-section">
                            {editingFacultyIdx !== null ? (
                                <div className="mbs-subform-box">
                                    <div className="mbs-subform-header">
                                        <h4>{editingFacultyIdx === -1 ? "Add Faculty Member" : `Edit ${facultyForm.name}`}</h4>
                                        <button
                                            type="button"
                                            className="mbs-btn-secondary"
                                            onClick={() => setEditingFacultyIdx(null)}
                                        >
                                            Cancel
                                        </button>
                                    </div>

                                    <div className="mbs-form-grid-2">
                                        <label className="mbs-form-label">
                                            <span>Professor Full Name &amp; Title</span>
                                            <input
                                                type="text"
                                                className="mbs-form-input"
                                                placeholder="e.g. Dr. Emmanuel G. Ramos, Th.D."
                                                value={facultyForm.name}
                                                onChange={e => setFacultyForm({ ...facultyForm, name: e.target.value })}
                                            />
                                        </label>
                                        <label className="mbs-form-label">
                                            <span>Academic / Administrative Title</span>
                                            <input
                                                type="text"
                                                className="mbs-form-input"
                                                placeholder="e.g. Dean of the Seminary & Chair of Greek"
                                                value={facultyForm.title}
                                                onChange={e => setFacultyForm({ ...facultyForm, title: e.target.value })}
                                            />
                                        </label>
                                    </div>

                                    <div className="mbs-form-grid-2">
                                        <label className="mbs-form-label">
                                            <span>Department</span>
                                            <select
                                                className="mbs-form-select"
                                                value={facultyForm.department}
                                                onChange={e => setFacultyForm({
                                                    ...facultyForm,
                                                    department: e.target.value as any
                                                })}
                                            >
                                                <option value="leadership">Executive Leadership &amp; Deans</option>
                                                <option value="languages">Biblical Languages &amp; Exegesis</option>
                                                <option value="theology">Systematic &amp; Educational Theology</option>
                                                <option value="ministry">Pastoral Studies &amp; Missions</option>
                                            </select>
                                        </label>
                                        <label className="mbs-form-label">
                                            <span>Ministry Tenure (Years)</span>
                                            <input
                                                type="number"
                                                className="mbs-form-input"
                                                value={facultyForm.tenureYears}
                                                onChange={e => setFacultyForm({ ...facultyForm, tenureYears: Number(e.target.value) || 0 })}
                                            />
                                        </label>
                                    </div>

                                    <div className="mbs-form-row">
                                        <label className="mbs-form-label">
                                            <span>Degrees &amp; Alma Mater (Comma-separated)</span>
                                            <input
                                                type="text"
                                                className="mbs-form-input"
                                                placeholder="e.g. Th.D. in Systematic Theology (ATS), M.Div., B.Th."
                                                value={facultyDegreesInput}
                                                onChange={e => setFacultyDegreesInput(e.target.value)}
                                            />
                                        </label>
                                    </div>

                                    <div className="mbs-form-row">
                                        <label className="mbs-form-label">
                                            <span>Courses Taught (Comma-separated)</span>
                                            <input
                                                type="text"
                                                className="mbs-form-input"
                                                placeholder="e.g. Biblical Greek Grammar I, Expository Preaching Practicum"
                                                value={facultyCoursesInput}
                                                onChange={e => setFacultyCoursesInput(e.target.value)}
                                            />
                                        </label>
                                    </div>

                                    <div className="mbs-form-row">
                                        <label className="mbs-form-label">
                                            <span>Biography &amp; Ministry Experience</span>
                                            <textarea
                                                className="mbs-form-textarea"
                                                rows={4}
                                                value={facultyForm.bio}
                                                onChange={e => setFacultyForm({ ...facultyForm, bio: e.target.value })}
                                            />
                                        </label>
                                    </div>

                                    <div className="mbs-subform-actions">
                                        <button
                                            type="button"
                                            className="mbs-btn-primary"
                                            onClick={handleSaveFaculty}
                                        >
                                            <Check size={16} />
                                            <span>{editingFacultyIdx === -1 ? "Add Professor" : "Apply Changes"}</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="mbs-editor-list-header">
                                        <div>
                                            <h3>Seminary Faculty Roster ({draft.faculty.members.length})</h3>
                                            <p>Manage professors, academic deans, and modular extension leaders</p>
                                        </div>
                                        <button
                                            type="button"
                                            className="mbs-btn-primary"
                                            onClick={handleOpenNewFaculty}
                                        >
                                            <Plus size={16} />
                                            <span>Add Faculty Member</span>
                                        </button>
                                    </div>

                                    <div className="mbs-items-list">
                                        {draft.faculty.members.map((fac, idx) => (
                                            <div key={fac.id + idx} className="mbs-item-row">
                                                <div className="mbs-item-info">
                                                    <span className="mbs-faculty-initials-badge">
                                                        {fac.name.split(" ").filter(p => !p.includes(".")).map(n => n[0]).slice(0, 2).join("")}
                                                    </span>
                                                    <div>
                                                        <strong>{fac.name}</strong>
                                                        <span className="mbs-dept-sub-badge">{fac.departmentLabel}</span>
                                                        <p>{fac.title}</p>
                                                        <small>{fac.tenureYears}+ Years Ministry Tenure • {fac.degrees.join(" • ")}</small>
                                                    </div>
                                                </div>

                                                <div className="mbs-item-actions">
                                                    <button
                                                        type="button"
                                                        className="mbs-action-btn edit"
                                                        onClick={() => handleOpenFacultyEdit(idx)}
                                                        title="Edit Faculty Member"
                                                    >
                                                        <Edit2 size={15} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="mbs-action-btn delete"
                                                        onClick={() => handleDeleteFaculty(idx)}
                                                        title="Delete Faculty Member"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* TAB 4: CAMPUSES & REGIONAL CENTERS */}
                    {activeTab === "campuses" && (
                        <div className="mbs-editor-section">
                            <div className="mbs-editor-group-title">
                                <h3>Main Headquarters &amp; Campus Facility</h3>
                                <p>Manage Metro Manila Main Campus, Library, and Auditoriums</p>
                            </div>

                            <div className="mbs-form-grid-2">
                                <label className="mbs-form-label">
                                    <span>Main Campus Title</span>
                                    <input
                                        type="text"
                                        className="mbs-form-input"
                                        value={draft.campuses.mainCampus.title}
                                        onChange={e => setDraft({
                                            ...draft,
                                            campuses: {
                                                ...draft.campuses,
                                                mainCampus: { ...draft.campuses.mainCampus, title: e.target.value }
                                            }
                                        })}
                                    />
                                </label>

                                <label className="mbs-form-label">
                                    <span>Location Address</span>
                                    <input
                                        type="text"
                                        className="mbs-form-input"
                                        value={draft.campuses.mainCampus.location}
                                        onChange={e => setDraft({
                                            ...draft,
                                            campuses: {
                                                ...draft.campuses,
                                                mainCampus: { ...draft.campuses.mainCampus, location: e.target.value }
                                            }
                                        })}
                                    />
                                </label>
                            </div>

                            <div className="mbs-form-row">
                                <label className="mbs-form-label">
                                    <span>Narrative &amp; Campus Overview</span>
                                    <textarea
                                        className="mbs-form-textarea"
                                        rows={3}
                                        value={draft.campuses.mainCampus.narrative}
                                        onChange={e => setDraft({
                                            ...draft,
                                            campuses: {
                                                ...draft.campuses,
                                                mainCampus: { ...draft.campuses.mainCampus, narrative: e.target.value }
                                            }
                                        })}
                                    />
                                </label>
                            </div>

                            <div className="mbs-editor-group-title" style={{ marginTop: 24 }}>
                                <h4>Main Campus Facilities ({draft.campuses.mainCampus.facilities.length})</h4>
                            </div>

                            <div className="mbs-items-grid">
                                {draft.campuses.mainCampus.facilities.map((fac, idx) => (
                                    <div key={fac.id + idx} className="mbs-facility-edit-box">
                                        <input
                                            type="text"
                                            className="mbs-form-input bold"
                                            value={fac.title}
                                            onChange={e => {
                                                const newFacs = [...draft.campuses.mainCampus.facilities];
                                                newFacs[idx].title = e.target.value;
                                                setDraft({
                                                    ...draft,
                                                    campuses: {
                                                        ...draft.campuses,
                                                        mainCampus: { ...draft.campuses.mainCampus, facilities: newFacs }
                                                    }
                                                });
                                            }}
                                        />
                                        <textarea
                                            className="mbs-form-textarea small"
                                            rows={2}
                                            value={fac.subtitle}
                                            onChange={e => {
                                                const newFacs = [...draft.campuses.mainCampus.facilities];
                                                newFacs[idx].subtitle = e.target.value;
                                                setDraft({
                                                    ...draft,
                                                    campuses: {
                                                        ...draft.campuses,
                                                        mainCampus: { ...draft.campuses.mainCampus, facilities: newFacs }
                                                    }
                                                });
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="mbs-editor-group-title" style={{ marginTop: 32 }}>
                                <h3>Regional Extension Centers &amp; Provincial Hubs</h3>
                                <p>Luzon, Visayas, and Mindanao Modular Centers</p>
                            </div>

                            {draft.campuses.regionalHubs.map((reg, regIdx) => (
                                <div key={reg.id} className="mbs-regional-edit-card">
                                    <div className="mbs-form-grid-2">
                                        <input
                                            type="text"
                                            className="mbs-form-input bold"
                                            value={reg.title}
                                            onChange={e => {
                                                const newRegs = [...draft.campuses.regionalHubs];
                                                newRegs[regIdx].title = e.target.value;
                                                setDraft({
                                                    ...draft,
                                                    campuses: { ...draft.campuses, regionalHubs: newRegs }
                                                });
                                            }}
                                        />
                                        <input
                                            type="text"
                                            className="mbs-form-input"
                                            value={reg.subtitle}
                                            onChange={e => {
                                                const newRegs = [...draft.campuses.regionalHubs];
                                                newRegs[regIdx].subtitle = e.target.value;
                                                setDraft({
                                                    ...draft,
                                                    campuses: { ...draft.campuses, regionalHubs: newRegs }
                                                });
                                            }}
                                        />
                                    </div>

                                    <div className="mbs-hub-items-stack">
                                        {reg.hubs.map((h, hIdx) => (
                                            <div key={hIdx} className="mbs-hub-edit-row">
                                                <input
                                                    type="text"
                                                    className="mbs-form-input flex-1"
                                                    placeholder="City / Hub Name"
                                                    value={h.name}
                                                    onChange={e => {
                                                        const newRegs = [...draft.campuses.regionalHubs];
                                                        newRegs[regIdx].hubs[hIdx].name = e.target.value;
                                                        setDraft({
                                                            ...draft,
                                                            campuses: { ...draft.campuses, regionalHubs: newRegs }
                                                        });
                                                    }}
                                                />
                                                <input
                                                    type="text"
                                                    className="mbs-form-input flex-2"
                                                    placeholder="Description / Coverage"
                                                    value={h.description}
                                                    onChange={e => {
                                                        const newRegs = [...draft.campuses.regionalHubs];
                                                        newRegs[regIdx].hubs[hIdx].description = e.target.value;
                                                        setDraft({
                                                            ...draft,
                                                            campuses: { ...draft.campuses, regionalHubs: newRegs }
                                                        });
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* TAB 5: ACCREDITATIONS & CTA */}
                    {activeTab === "accreditations" && (
                        <div className="mbs-editor-section">
                            <div className="mbs-editor-group-title">
                                <h3>Institutional Accreditations</h3>
                                <p>ACTS &amp; CCHE Institutional credentials &amp; charters</p>
                            </div>

                            {draft.accreditations.accreditations.map((acc, idx) => (
                                <div key={acc.id} className="mbs-accred-edit-card">
                                    <div className="mbs-form-grid-2">
                                        <input
                                            type="text"
                                            className="mbs-form-input bold"
                                            value={acc.title}
                                            onChange={e => {
                                                const newAcc = [...draft.accreditations.accreditations];
                                                newAcc[idx].title = e.target.value;
                                                setDraft({
                                                    ...draft,
                                                    accreditations: { ...draft.accreditations, accreditations: newAcc }
                                                });
                                            }}
                                        />
                                        <input
                                            type="text"
                                            className="mbs-form-input"
                                            value={acc.badge}
                                            onChange={e => {
                                                const newAcc = [...draft.accreditations.accreditations];
                                                newAcc[idx].badge = e.target.value;
                                                setDraft({
                                                    ...draft,
                                                    accreditations: { ...draft.accreditations, accreditations: newAcc }
                                                });
                                            }}
                                        />
                                    </div>

                                    <textarea
                                        className="mbs-form-textarea"
                                        rows={3}
                                        value={acc.description}
                                        onChange={e => {
                                            const newAcc = [...draft.accreditations.accreditations];
                                            newAcc[idx].description = e.target.value;
                                            setDraft({
                                                ...draft,
                                                accreditations: { ...draft.accreditations, accreditations: newAcc }
                                            });
                                        }}
                                    />
                                </div>
                            ))}

                            <div className="mbs-editor-group-title" style={{ marginTop: 32 }}>
                                <h3>Call to Action (CTA Banner)</h3>
                                <p>Bottom conversion banner text and buttons</p>
                            </div>

                            <div className="mbs-form-grid-2">
                                <label className="mbs-form-label">
                                    <span>CTA Title</span>
                                    <input
                                        type="text"
                                        className="mbs-form-input"
                                        value={draft.cta.title}
                                        onChange={e => setDraft({
                                            ...draft,
                                            cta: { ...draft.cta, title: e.target.value }
                                        })}
                                    />
                                </label>
                                <label className="mbs-form-label">
                                    <span>CTA Badge Pill</span>
                                    <input
                                        type="text"
                                        className="mbs-form-input"
                                        value={draft.cta.pill}
                                        onChange={e => setDraft({
                                            ...draft,
                                            cta: { ...draft.cta, pill: e.target.value }
                                        })}
                                    />
                                </label>
                            </div>

                            <div className="mbs-form-row">
                                <label className="mbs-form-label">
                                    <span>CTA Description</span>
                                    <textarea
                                        className="mbs-form-textarea"
                                        rows={2}
                                        value={draft.cta.desc}
                                        onChange={e => setDraft({
                                            ...draft,
                                            cta: { ...draft.cta, desc: e.target.value }
                                        })}
                                    />
                                </label>
                            </div>

                            <div className="mbs-form-grid-2">
                                <label className="mbs-form-label">
                                    <span>Primary Button Text</span>
                                    <input
                                        type="text"
                                        className="mbs-form-input"
                                        value={draft.cta.primaryBtn}
                                        onChange={e => setDraft({
                                            ...draft,
                                            cta: { ...draft.cta, primaryBtn: e.target.value }
                                        })}
                                    />
                                </label>
                                <label className="mbs-form-label">
                                    <span>Secondary Button Text</span>
                                    <input
                                        type="text"
                                        className="mbs-form-input"
                                        value={draft.cta.secondaryBtn}
                                        onChange={e => setDraft({
                                            ...draft,
                                            cta: { ...draft.cta, secondaryBtn: e.target.value }
                                        })}
                                    />
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                {/* MODAL FOOTER */}
                <div className="mbs-editor-footer">
                    <button
                        type="button"
                        className="mbs-btn-reset"
                        onClick={handleReset}
                        disabled={saving}
                        title="Reset to official seminary defaults"
                    >
                        <RotateCcw size={15} />
                        <span>Reset to Defaults</span>
                    </button>

                    <div className="mbs-footer-right-actions">
                        <button
                            type="button"
                            className="mbs-btn-secondary"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="mbs-btn-save-primary"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            <Save size={16} />
                            <span>{saving ? "Saving Changes..." : "Publish & Save Changes"}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutEditorModal;
