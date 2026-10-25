// ============================================================
// MbsSupportManager.tsx
// Admin Support & Media Repository Management Page
// Upload and manage PDFs, Videos, Toolkits & Support Resources
// ============================================================

import React, { useState, useEffect, useMemo, useRef } from "react";
import "./MbsSupportManager.css";
import {
    getMbsSupportResources,
    addMbsSupportResource,
    updateMbsSupportResource,
    deleteMbsSupportResource,
    resetMbsSupportResources,
    MBS_SUPPORTS_UPDATED_EVENT
} from "../../services/mbsSupportService";
import type { MbsResourceItem } from "../../components/MbsSupportsMegaMenu";
import {
    FileText,
    Video,
    FolderArchive,
    Download,
    Plus,
    Search,
    Trash2,
    Edit3,
    ExternalLink,
    CheckCircle2,
    RotateCcw,
    Upload,
    X,
    LifeBuoy,
    FileCheck
} from "lucide-react";

interface MbsSupportManagerProps {
    onNavigateToSite?: () => void;
}

export const MbsSupportManager: React.FC<MbsSupportManagerProps> = ({ onNavigateToSite }) => {
    const [resources, setResources] = useState<MbsResourceItem[]>(getMbsSupportResources);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState<string>("");

    // Modal state for Add / Edit
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MbsResourceItem | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        category: "pdf" as "pdf" | "video" | "toolkit" | "support",
        categoryBadge: "THEOLOGICAL PDF",
        author: "",
        fileFormat: "PDF Document",
        fileSize: "3.5 MB",
        duration: "45 mins",
        description: "",
        fullDetails: ["Comprehensive ministerial guide and lecture notes."],
        videoUrl: "",
        fileName: "",
        fileData: "",
        isFeatured: false
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleUpdate = () => {
            setResources(getMbsSupportResources());
        };
        window.addEventListener(MBS_SUPPORTS_UPDATED_EVENT, handleUpdate);
        return () => window.removeEventListener(MBS_SUPPORTS_UPDATED_EVENT, handleUpdate);
    }, []);

    // Filtered resources
    const filteredResources = useMemo(() => {
        return resources.filter(res => {
            const matchesCat = selectedCategory === "all" || res.category === selectedCategory;
            const q = searchQuery.toLowerCase().trim();
            const matchesSearch =
                !q ||
                res.title.toLowerCase().includes(q) ||
                res.author.toLowerCase().includes(q) ||
                res.description.toLowerCase().includes(q);
            return matchesCat && matchesSearch;
        });
    }, [resources, selectedCategory, searchQuery]);

    // Counts
    const counts = useMemo(() => {
        return {
            all: resources.length,
            pdf: resources.filter(r => r.category === "pdf").length,
            video: resources.filter(r => r.category === "video").length,
            toolkit: resources.filter(r => r.category === "toolkit").length,
            support: resources.filter(r => r.category === "support").length
        };
    }, [resources]);

    const handleOpenCreateModal = () => {
        setEditingItem(null);
        setFormData({
            title: "",
            category: "pdf",
            categoryBadge: "THEOLOGICAL PDF",
            author: "MBS Seminary Faculty",
            fileFormat: "PDF Document",
            fileSize: "4.5 MB",
            duration: "45 mins",
            description: "",
            fullDetails: ["High-resolution printable document", "Includes lesson outlines & biblical scriptures"],
            videoUrl: "",
            fileName: "",
            fileData: "",
            isFeatured: false
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (item: MbsResourceItem) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            category: item.category,
            categoryBadge: item.categoryBadge,
            author: item.author,
            fileFormat: item.fileFormat || "PDF Document",
            fileSize: item.fileSize || "4.5 MB",
            duration: item.duration || "45 mins",
            description: item.description,
            fullDetails: item.fullDetails && item.fullDetails.length > 0 ? item.fullDetails : ["Resource details"],
            videoUrl: item.videoUrl || "",
            fileName: "",
            fileData: "",
            isFeatured: !!item.isFeatured
        });
        setIsModalOpen(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const sizeInMb = (file.size / (1024 * 1024)).toFixed(1) + " MB";
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            setFormData(prev => ({
                ...prev,
                fileName: file.name,
                fileSize: sizeInMb,
                fileFormat: file.type || file.name.split(".").pop()?.toUpperCase() || "Document",
                fileData: result
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            alert("Please enter a title for the support resource.");
            return;
        }

        if (editingItem) {
            updateMbsSupportResource(editingItem.id, {
                title: formData.title,
                category: formData.category,
                categoryBadge: formData.categoryBadge || (formData.category === "pdf" ? "THEOLOGICAL PDF" : formData.category === "video" ? "SEMINARY VIDEO" : "MINISTRY TOOLKIT"),
                author: formData.author || "MBS Faculty",
                fileFormat: formData.fileFormat,
                fileSize: formData.fileSize,
                duration: formData.duration,
                description: formData.description,
                fullDetails: formData.fullDetails.filter(d => d.trim().length > 0),
                videoUrl: formData.videoUrl || editingItem.videoUrl,
                isFeatured: formData.isFeatured
            });
        } else {
            addMbsSupportResource({
                title: formData.title,
                category: formData.category,
                categoryBadge: formData.categoryBadge || (formData.category === "pdf" ? "THEOLOGICAL PDF" : formData.category === "video" ? "SEMINARY VIDEO" : "MINISTRY TOOLKIT"),
                author: formData.author || "MBS Faculty",
                fileFormat: formData.fileFormat,
                fileSize: formData.fileSize,
                duration: formData.duration,
                description: formData.description || "Theological document and resource from Mobile Bible School.",
                fullDetails: formData.fullDetails.filter(d => d.trim().length > 0),
                videoUrl: formData.videoUrl,
                isFeatured: formData.isFeatured
            });
        }

        setIsModalOpen(false);
    };

    const handleDelete = (id: string, title: string) => {
        if (window.confirm(`Are you sure you want to delete "${title}"? It will no longer appear on the website.`)) {
            deleteMbsSupportResource(id);
        }
    };

    const handleReset = () => {
        if (window.confirm("Reset all MBS support resources to factory defaults? Any custom uploaded items will be replaced.")) {
            resetMbsSupportResources();
        }
    };

    const handleTriggerDownload = (item: MbsResourceItem) => {
        const filename = `${item.title.replace(/[^a-zA-Z0-9]/g, "_")}.${item.category === "toolkit" ? "zip" : "pdf"}`;
        const blob = new Blob([
            `MOBILE BIBLE SCHOOL & THEOLOGICAL SEMINARY - RESOURCE DOWNLOAD\n\nTitle: ${item.title}\nCategory: ${item.categoryBadge}\nAuthor: ${item.author}\nFile Size: ${item.fileSize || "Free"}\n\nDESCRIPTION:\n${item.description}\n\nDETAILS:\n${item.fullDetails.join("\n")}`
        ], { type: "text/plain;charset=utf-8" });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="mbs-supp-root">
            {/* Header */}
            <div className="mbs-supp-header">
                <div className="mbs-supp-title-block">
                    <h1>
                        <LifeBuoy size={28} color="#38BDF8" />
                        <span>MBS Support Center &amp; Media Repository</span>
                        <span className="mbs-supp-badge-live">Live Sync</span>
                    </h1>
                    <p>
                        Upload and manage downloadable theological PDFs, church-related videos, administrative ministry toolkits, and pastoral helpdesk guides. All changes instantly appear on the public landing page <strong>MBS SUPPORTS</strong> dropdown.
                    </p>
                </div>

                <div className="mbs-supp-header-actions">
                    <button
                        type="button"
                        className="mbs-supp-btn-primary"
                        onClick={handleOpenCreateModal}
                    >
                        <Plus size={16} />
                        <span>Upload Support Resource</span>
                    </button>

                    {onNavigateToSite && (
                        <button
                            type="button"
                            className="mbs-supp-btn-secondary"
                            onClick={onNavigateToSite}
                            title="Preview on Public Landing Page"
                        >
                            <ExternalLink size={15} />
                            <span>Preview Public Portal</span>
                        </button>
                    )}

                    <button
                        type="button"
                        className="mbs-supp-btn-secondary"
                        onClick={handleReset}
                        title="Reset to default seminary resources"
                    >
                        <RotateCcw size={15} />
                        <span>Reset Defaults</span>
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="mbs-supp-stats-grid">
                <div className="mbs-supp-stat-card">
                    <div className="mbs-supp-stat-icon all">
                        <LifeBuoy size={24} />
                    </div>
                    <div>
                        <p className="mbs-supp-stat-label">Total Resources</p>
                        <h4 className="mbs-supp-stat-value">{counts.all}</h4>
                    </div>
                </div>

                <div className="mbs-supp-stat-card">
                    <div className="mbs-supp-stat-icon pdf">
                        <FileText size={24} />
                    </div>
                    <div>
                        <p className="mbs-supp-stat-label">Theological PDFs</p>
                        <h4 className="mbs-supp-stat-value">{counts.pdf}</h4>
                    </div>
                </div>

                <div className="mbs-supp-stat-card">
                    <div className="mbs-supp-stat-icon video">
                        <Video size={24} />
                    </div>
                    <div>
                        <p className="mbs-supp-stat-label">Church Videos</p>
                        <h4 className="mbs-supp-stat-value">{counts.video}</h4>
                    </div>
                </div>

                <div className="mbs-supp-stat-card">
                    <div className="mbs-supp-stat-icon toolkit">
                        <FolderArchive size={24} />
                    </div>
                    <div>
                        <p className="mbs-supp-stat-label">Toolkits &amp; Kits</p>
                        <h4 className="mbs-supp-stat-value">{counts.toolkit}</h4>
                    </div>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="mbs-supp-controls">
                <div className="mbs-supp-search-box">
                    <Search size={16} color="#94A3B8" />
                    <input
                        type="text"
                        placeholder="Search support docs, videos, authors..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="mbs-supp-filter-pills">
                    <button
                        type="button"
                        className={`mbs-supp-filter-pill ${selectedCategory === "all" ? "active" : ""}`}
                        onClick={() => setSelectedCategory("all")}
                    >
                        All ({counts.all})
                    </button>
                    <button
                        type="button"
                        className={`mbs-supp-filter-pill ${selectedCategory === "pdf" ? "active" : ""}`}
                        onClick={() => setSelectedCategory("pdf")}
                    >
                        Theological PDFs ({counts.pdf})
                    </button>
                    <button
                        type="button"
                        className={`mbs-supp-filter-pill ${selectedCategory === "video" ? "active" : ""}`}
                        onClick={() => setSelectedCategory("video")}
                    >
                        Church Videos ({counts.video})
                    </button>
                    <button
                        type="button"
                        className={`mbs-supp-filter-pill ${selectedCategory === "toolkit" ? "active" : ""}`}
                        onClick={() => setSelectedCategory("toolkit")}
                    >
                        Toolkits &amp; Media ({counts.toolkit})
                    </button>
                    <button
                        type="button"
                        className={`mbs-supp-filter-pill ${selectedCategory === "support" ? "active" : ""}`}
                        onClick={() => setSelectedCategory("support")}
                    >
                        Help Desk ({counts.support})
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="mbs-supp-grid">
                {filteredResources.map(item => (
                    <div key={item.id} className="mbs-supp-card">
                        <div className="mbs-supp-card-top">
                            <div className="mbs-supp-card-badge-row">
                                <span className={`mbs-supp-cat-badge ${item.category}`}>
                                    {item.categoryBadge}
                                </span>
                                <span className="mbs-supp-format-pill">
                                    {item.category === "video" ? item.duration || "Video" : `${item.fileFormat || "PDF"} • ${item.fileSize || "Free"}`}
                                </span>
                            </div>

                            <h3 className="mbs-supp-card-title">{item.title}</h3>
                            <p className="mbs-supp-card-author">By {item.author}</p>
                            <p className="mbs-supp-card-desc">{item.description}</p>

                            {item.fullDetails && item.fullDetails.length > 0 && (
                                <div className="mbs-supp-details-preview">
                                    <strong>Contents &amp; Syllabus:</strong>
                                    <ul>
                                        {item.fullDetails.slice(0, 3).map((det, dIdx) => (
                                            <li key={dIdx}>{det}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="mbs-supp-card-bottom">
                            <button
                                type="button"
                                className="mbs-supp-btn-download"
                                onClick={() => handleTriggerDownload(item)}
                            >
                                <Download size={14} />
                                <span>Download File</span>
                            </button>

                            <div className="mbs-supp-btn-row">
                                <button
                                    type="button"
                                    className="mbs-supp-btn-icon"
                                    onClick={() => handleOpenEditModal(item)}
                                    title="Edit Resource"
                                >
                                    <Edit3 size={15} />
                                </button>
                                <button
                                    type="button"
                                    className="mbs-supp-btn-icon delete"
                                    onClick={() => handleDelete(item.id, item.title)}
                                    title="Delete Resource"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* UPLOAD / EDIT MODAL */}
            {isModalOpen && (
                <div className="mbs-supp-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="mbs-supp-modal-card" onClick={e => e.stopPropagation()}>
                        <div className="mbs-supp-modal-header">
                            <h3>
                                <Upload size={20} color="#38BDF8" />
                                <span>{editingItem ? "Edit Support Resource" : "Upload Support Resource"}</span>
                            </h3>
                            <button
                                type="button"
                                className="mbs-supp-btn-icon"
                                onClick={() => setIsModalOpen(false)}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSave}>
                            <div className="mbs-supp-form-grid">
                                <div className="mbs-supp-form-group full">
                                    <label>Resource Title *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Expository Preaching Field Guide (2025)"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <div className="mbs-supp-form-group">
                                    <label>Category *</label>
                                    <select
                                        value={formData.category}
                                        onChange={e => {
                                            const cat = e.target.value as any;
                                            const badge = cat === "pdf" ? "THEOLOGICAL PDF" : cat === "video" ? "SEMINARY VIDEO" : cat === "toolkit" ? "CHURCH TOOLKIT" : "MINISTERIAL SUPPORT";
                                            setFormData({ ...formData, category: cat, categoryBadge: badge });
                                        }}
                                    >
                                        <option value="pdf">Theological PDF &amp; Books</option>
                                        <option value="video">Church Videos &amp; Sermons</option>
                                        <option value="toolkit">Church Toolkits &amp; Media</option>
                                        <option value="support">Help Desk &amp; Consultation</option>
                                    </select>
                                </div>

                                <div className="mbs-supp-form-group">
                                    <label>Category Badge Label</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. FEATURED PDF, MASTERCLASS"
                                        value={formData.categoryBadge}
                                        onChange={e => setFormData({ ...formData, categoryBadge: e.target.value })}
                                    />
                                </div>

                                <div className="mbs-supp-form-group">
                                    <label>Author / Faculty Speaker</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Rev. Dr. Emmanuel Santos"
                                        value={formData.author}
                                        onChange={e => setFormData({ ...formData, author: e.target.value })}
                                    />
                                </div>

                                {formData.category === "video" ? (
                                    <div className="mbs-supp-form-group">
                                        <label>Video Duration</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 45 mins"
                                            value={formData.duration}
                                            onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                        />
                                    </div>
                                ) : (
                                    <div className="mbs-supp-form-group">
                                        <label>File Format &amp; Size</label>
                                        <div style={{ display: "flex", gap: "8px" }}>
                                            <input
                                                type="text"
                                                placeholder="PDF / ZIP"
                                                value={formData.fileFormat}
                                                onChange={e => setFormData({ ...formData, fileFormat: e.target.value })}
                                                style={{ width: "50%" }}
                                            />
                                            <input
                                                type="text"
                                                placeholder="e.g. 4.8 MB"
                                                value={formData.fileSize}
                                                onChange={e => setFormData({ ...formData, fileSize: e.target.value })}
                                                style={{ width: "50%" }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {formData.category === "video" && (
                                    <div className="mbs-supp-form-group full">
                                        <label>Video URL (YouTube, Vimeo, or Direct MP4) *</label>
                                        <input
                                            type="url"
                                            placeholder="https://www.youtube.com/watch?v=..."
                                            value={formData.videoUrl}
                                            onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                                        />
                                    </div>
                                )}

                                {formData.category !== "video" && (
                                    <div className="mbs-supp-form-group full">
                                        <label>Upload Document / PDF File</label>
                                        <div
                                            className="mbs-supp-file-dropzone"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Upload size={24} color="#38BDF8" style={{ margin: "0 auto 8px" }} />
                                            <p style={{ margin: 0, fontSize: "0.88rem", color: "#E2E8F0" }}>
                                                Click to select PDF, Word (.docx), or ZIP file from your computer
                                            </p>
                                            <small style={{ color: "#94A3B8" }}>Max recommended file size: 25 MB</small>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".pdf,.doc,.docx,.zip,.xlsx,.ppt,.pptx"
                                                style={{ display: "none" }}
                                                onChange={handleFileChange}
                                            />
                                        </div>

                                        {formData.fileName && (
                                            <div className="mbs-supp-file-info">
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                    <FileCheck size={18} color="#34D399" />
                                                    <span>{formData.fileName} ({formData.fileSize})</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, fileName: "", fileData: "" })}
                                                    style={{ background: "none", border: "none", color: "#F87171", cursor: "pointer" }}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="mbs-supp-form-group full">
                                    <label>Short Description *</label>
                                    <textarea
                                        rows={3}
                                        required
                                        placeholder="Summary of this support resource..."
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="mbs-supp-form-group full">
                                    <label>Contents / Syllabus Bullets</label>
                                    <div className="mbs-supp-bullets-wrapper">
                                        {formData.fullDetails.map((detail, idx) => (
                                            <div key={idx} className="mbs-supp-bullet-row">
                                                <input
                                                    type="text"
                                                    placeholder={`Bullet ${idx + 1}`}
                                                    value={detail}
                                                    onChange={e => {
                                                        const copy = [...formData.fullDetails];
                                                        copy[idx] = e.target.value;
                                                        setFormData({ ...formData, fullDetails: copy });
                                                    }}
                                                />
                                                {formData.fullDetails.length > 1 && (
                                                    <button
                                                        type="button"
                                                        className="mbs-supp-btn-icon delete"
                                                        onClick={() => {
                                                            const copy = formData.fullDetails.filter((_, i) => i !== idx);
                                                            setFormData({ ...formData, fullDetails: copy });
                                                        }}
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            className="mbs-supp-btn-add-bullet"
                                            onClick={() => setFormData({ ...formData, fullDetails: [...formData.fullDetails, ""] })}
                                        >
                                            <Plus size={13} />
                                            <span>Add Content Bullet</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="mbs-supp-modal-footer">
                                <button
                                    type="button"
                                    className="mbs-supp-btn-secondary"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="mbs-supp-btn-primary"
                                >
                                    <CheckCircle2 size={16} />
                                    <span>{editingItem ? "Save Changes" : "Publish to Support Page"}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MbsSupportManager;
