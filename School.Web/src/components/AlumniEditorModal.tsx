// ============================================================
// AlumniEditorModal.tsx
// Administrator CMS Modal for Ordained Alumni & Ministry Achievers
// Editable by Admin • Viewing-Only for Others
// ============================================================

import React, { useState, useEffect } from "react";
import "./AlumniEditorModal.css";
import type {
    AlumniAchiever,
    AlumniSectionConfig
} from "../services/alumniService";
import {
    X,
    Save,
    RotateCcw,
    Plus,
    Trash2,
    Edit2,
    Check,
    AlertCircle,
    ShieldCheck,
    CheckCircle2,
    Award
} from "lucide-react";

interface AlumniEditorModalProps {
    isOpen: boolean;
    config: AlumniSectionConfig;
    editingItemId?: string | null;
    onSave: (updated: AlumniSectionConfig) => Promise<boolean>;
    onReset: () => Promise<void>;
    onClose: () => void;
}

export const AlumniEditorModal: React.FC<AlumniEditorModalProps> = ({
    isOpen,
    config,
    editingItemId = null,
    onSave,
    onReset,
    onClose
}) => {
    const [draft, setDraft] = useState<AlumniSectionConfig>(JSON.parse(JSON.stringify(config)));
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    // Sub-modal state for alumnus item
    const [editingIdx, setEditingIdx] = useState<number | null>(null);
    const [itemForm, setItemForm] = useState<AlumniAchiever>({
        id: "",
        category: "BACHELOR OF THEOLOGY (B.TH.)",
        rate: "100% ORDAINED",
        title: "",
        role: "",
        honors: "Batch 2024 Academic Excellence",
        achievement: "",
        initials: "AB"
    });

    useEffect(() => {
        if (isOpen) {
            const fresh = JSON.parse(JSON.stringify(config));
            setDraft(fresh);
            setSaveSuccess(false);
            setSaveError(null);

            if (editingItemId) {
                const foundIdx = fresh.items.findIndex((it: AlumniAchiever) => it.id === editingItemId);
                if (foundIdx >= 0) {
                    setEditingIdx(foundIdx);
                    setItemForm({ ...fresh.items[foundIdx] });
                } else {
                    setEditingIdx(null);
                }
            } else {
                setEditingIdx(null);
            }
        }
    }, [isOpen, config, editingItemId]);

    if (!isOpen) return null;

    // ------------------------------------------------------------
    // SAVE
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
    // RESET
    // ------------------------------------------------------------
    const handleReset = async () => {
        if (window.confirm("Are you sure you want to restore official seminary defaults for the alumni showcase?")) {
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
    // ITEM ACTIONS
    // ------------------------------------------------------------
    const handleOpenEdit = (idx: number) => {
        setEditingIdx(idx);
        setItemForm({ ...draft.items[idx] });
    };

    const handleOpenNew = () => {
        setEditingIdx(-1);
        setItemForm({
            id: `alumni-${Date.now()}`,
            category: "BACHELOR OF THEOLOGY (B.TH.)",
            rate: "100% ORDAINED",
            title: "",
            role: "Pastor & Church Planter",
            honors: `Batch ${new Date().getFullYear()} Ministry Distinction`,
            achievement: "",
            initials: ""
        });
    };

    const calculateInitials = (name: string): string => {
        const parts = name.replace(/^(Rev\.|Dr\.|Pastor|Sister|Brother|Missionary|Prof\.)\s*/i, "")
            .split(" ")
            .filter(p => !p.includes("."));
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase() || "MB";
    };

    const handleSaveItem = () => {
        if (!itemForm.title.trim()) {
            alert("Please enter the alumnus name and title.");
            return;
        }

        const initials = itemForm.initials.trim() || calculateInitials(itemForm.title);
        const updated = { ...itemForm, initials };

        const newItems = [...draft.items];
        if (editingIdx === -1) {
            newItems.push(updated);
        } else if (editingIdx !== null && editingIdx >= 0) {
            newItems[editingIdx] = updated;
        }

        setDraft({ ...draft, items: newItems });
        setEditingIdx(null);
    };

    const handleDeleteItem = (idx: number) => {
        if (window.confirm(`Delete "${draft.items[idx].title}" from alumni showcase?`)) {
            const newItems = draft.items.filter((_, i) => i !== idx);
            setDraft({ ...draft, items: newItems });
        }
    };

    return (
        <div className="alumni-editor-overlay">
            <div className="alumni-editor-modal">
                {/* HEADER */}
                <div className="alumni-editor-header">
                    <div className="alumni-editor-title-group">
                        <div className="alumni-editor-icon-badge">
                            <ShieldCheck size={20} color="#10B981" />
                        </div>
                        <div>
                            <h2>Alumni &amp; Ministry Achievers CMS</h2>
                            <p>Administrator Control • Ordained Alumni Showcase Editor</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="alumni-editor-close-btn"
                        onClick={onClose}
                        title="Close Editor"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* BODY */}
                <div className="alumni-editor-body">
                    {saveSuccess && (
                        <div className="alumni-editor-alert success">
                            <CheckCircle2 size={18} />
                            <span>Changes saved successfully! Public alumni showcase updated.</span>
                        </div>
                    )}

                    {saveError && (
                        <div className="alumni-editor-alert error">
                            <AlertCircle size={18} />
                            <span>{saveError}</span>
                        </div>
                    )}

                    {/* SECTION HEADER CONFIG */}
                    <div className="alumni-editor-group-title">
                        <h3>Section Headers &amp; Narrative</h3>
                        <p>Configure the title and introductory text displayed on the public landing page</p>
                    </div>

                    <div className="alumni-form-grid-2">
                        <label className="alumni-form-label">
                            <span>Section Tag / Eyebrow</span>
                            <input
                                type="text"
                                className="alumni-form-input"
                                value={draft.tag}
                                onChange={e => setDraft({ ...draft, tag: e.target.value })}
                            />
                        </label>

                        <label className="alumni-form-label">
                            <span>Main Headline Title</span>
                            <input
                                type="text"
                                className="alumni-form-input bold"
                                value={draft.title}
                                onChange={e => setDraft({ ...draft, title: e.target.value })}
                            />
                        </label>
                    </div>

                    <div className="alumni-form-row">
                        <label className="alumni-form-label">
                            <span>Section Lead Description</span>
                            <textarea
                                className="alumni-form-textarea"
                                rows={2}
                                value={draft.lead}
                                onChange={e => setDraft({ ...draft, lead: e.target.value })}
                            />
                        </label>
                    </div>

                    <div className="alumni-divider" />

                    {/* SUBFORM (WHEN EDITING OR CREATING AN ALUMNUS) */}
                    {editingIdx !== null ? (
                        <div className="alumni-subform-box">
                            <div className="alumni-subform-header">
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <Award size={18} color="#10B981" />
                                    <h4>{editingIdx === -1 ? "Add New Alumnus Achiever" : `Edit: ${itemForm.title || "Alumnus"}`}</h4>
                                </div>
                                <button
                                    type="button"
                                    className="alumni-btn-secondary"
                                    onClick={() => setEditingIdx(null)}
                                >
                                    Cancel
                                </button>
                            </div>

                            <div className="alumni-form-grid-2">
                                <label className="alumni-form-label">
                                    <span>Full Name &amp; Title</span>
                                    <input
                                        type="text"
                                        className="alumni-form-input"
                                        placeholder="e.g. Sister Mary Grace Torres, CBS"
                                        value={itemForm.title}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setItemForm({
                                                ...itemForm,
                                                title: val,
                                                initials: itemForm.initials || calculateInitials(val)
                                            });
                                        }}
                                    />
                                </label>

                                <label className="alumni-form-label">
                                    <span>Degree / Program Category</span>
                                    <input
                                        type="text"
                                        className="alumni-form-input"
                                        placeholder="e.g. CERTIFICATE IN BIBLICAL STUDIES (CBS)"
                                        value={itemForm.category}
                                        onChange={e => setItemForm({ ...itemForm, category: e.target.value })}
                                    />
                                </label>
                            </div>

                            <div className="alumni-form-grid-2">
                                <label className="alumni-form-label">
                                    <span>Badge / Distinction Tag</span>
                                    <input
                                        type="text"
                                        className="alumni-form-input"
                                        placeholder="e.g. LAY MINISTRY LEADER or 100% ORDAINED"
                                        value={itemForm.rate}
                                        onChange={e => setItemForm({ ...itemForm, rate: e.target.value })}
                                    />
                                </label>

                                <label className="alumni-form-label">
                                    <span>Avatar Initials (2 letters)</span>
                                    <input
                                        type="text"
                                        maxLength={3}
                                        className="alumni-form-input"
                                        placeholder="e.g. MT"
                                        value={itemForm.initials}
                                        onChange={e => setItemForm({ ...itemForm, initials: e.target.value.toUpperCase() })}
                                    />
                                </label>
                            </div>

                            <div className="alumni-form-grid-2">
                                <label className="alumni-form-label">
                                    <span>Ministry Role &amp; Assignment</span>
                                    <input
                                        type="text"
                                        className="alumni-form-input"
                                        placeholder="e.g. Director of Children's Ministry & VBS"
                                        value={itemForm.role}
                                        onChange={e => setItemForm({ ...itemForm, role: e.target.value })}
                                    />
                                </label>

                                <label className="alumni-form-label">
                                    <span>Batch &amp; Honors Citation</span>
                                    <input
                                        type="text"
                                        className="alumni-form-input"
                                        placeholder="e.g. Batch 2023 Exemplary Service"
                                        value={itemForm.honors}
                                        onChange={e => setItemForm({ ...itemForm, honors: e.target.value })}
                                    />
                                </label>
                            </div>

                            <div className="alumni-form-row">
                                <label className="alumni-form-label">
                                    <span>Achievement Quote / Testimonial</span>
                                    <textarea
                                        className="alumni-form-textarea"
                                        rows={3}
                                        placeholder="Describe the ministry impact, churches planted, or outreach fruit..."
                                        value={itemForm.achievement}
                                        onChange={e => setItemForm({ ...itemForm, achievement: e.target.value })}
                                    />
                                </label>
                            </div>

                            <div className="alumni-subform-actions">
                                <button
                                    type="button"
                                    className="alumni-btn-primary"
                                    onClick={handleSaveItem}
                                >
                                    <Check size={16} />
                                    <span>{editingIdx === -1 ? "Add Alumnus" : "Apply Changes"}</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* ALUMNI ITEMS LIST */}
                            <div className="alumni-editor-list-header">
                                <div>
                                    <h3>Alumni Roster ({draft.items.length} Graduates)</h3>
                                    <p>Organize and manage the profiles displayed in the 3-card paginated carousel</p>
                                </div>
                                <button
                                    type="button"
                                    className="alumni-btn-primary"
                                    onClick={handleOpenNew}
                                >
                                    <Plus size={16} />
                                    <span>Add New Alumnus</span>
                                </button>
                            </div>

                            <div className="alumni-items-list">
                                {draft.items.map((item, idx) => (
                                    <div key={item.id || idx} className="alumni-item-row">
                                        <div className="alumni-item-info">
                                            <div className="alumni-circle-badge">
                                                <span>{item.initials}</span>
                                            </div>
                                            <div className="alumni-meta-block">
                                                <div className="alumni-top-tags">
                                                    <span className="alumni-rate-badge">{item.rate}</span>
                                                    <span className="alumni-category-tag">{item.category}</span>
                                                </div>
                                                <strong className="alumni-name-text">{item.title}</strong>
                                                <p className="alumni-role-text">{item.role} • <span className="alumni-honors-text">{item.honors}</span></p>
                                                <small className="alumni-quote-preview">&ldquo;{item.achievement}&rdquo;</small>
                                            </div>
                                        </div>

                                        <div className="alumni-item-actions">
                                            <button
                                                type="button"
                                                className="alumni-action-btn edit"
                                                onClick={() => handleOpenEdit(idx)}
                                                title="Edit Alumnus"
                                            >
                                                <Edit2 size={15} />
                                            </button>
                                            <button
                                                type="button"
                                                className="alumni-action-btn delete"
                                                onClick={() => handleDeleteItem(idx)}
                                                title="Delete Alumnus"
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

                {/* FOOTER */}
                <div className="alumni-editor-footer">
                    <button
                        type="button"
                        className="alumni-btn-reset"
                        onClick={handleReset}
                        disabled={saving}
                        title="Reset to official seminary defaults"
                    >
                        <RotateCcw size={15} />
                        <span>Reset to Defaults</span>
                    </button>

                    <div className="alumni-footer-right-actions">
                        <button
                            type="button"
                            className="alumni-btn-secondary"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="alumni-btn-save-primary"
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

export default AlumniEditorModal;
