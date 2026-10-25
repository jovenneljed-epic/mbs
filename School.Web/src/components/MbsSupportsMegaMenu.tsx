// ============================================================
// MbsSupportsMegaMenu.tsx
// Dropdown List & Mega-Menu for MBS SUPPORTS
// Downloadable Resources, PDFs, Church Videos, Toolkits & Helpdesk
// Mobile Bible School & Theological Seminary
// ============================================================

import React, { useState, useEffect } from "react";
import { getMbsSupportResources, MBS_SUPPORTS_UPDATED_EVENT } from "../services/mbsSupportService";
import { createPortal } from "react-dom";
import {
    FileText,
    Video,
    Download,
    Play,
    FolderArchive,
    Headphones,
    BookOpen,
    ArrowRight,
    CheckCircle2,
    X,
    Mail,
    Award,
    ShieldCheck
} from "lucide-react";

export interface MbsResourceItem {
    id: string;
    title: string;
    category: "pdf" | "video" | "toolkit" | "support";
    categoryBadge: string;
    fileFormat?: string;
    fileSize?: string;
    duration?: string;
    author: string;
    description: string;
    fullDetails: string[];
    downloadUrl?: string;
    videoUrl?: string;
    fileName?: string;
    fileData?: string;
    isFeatured?: boolean;
}

export const DEFAULT_MBS_RESOURCES: MbsResourceItem[] = [
    // ------------------------------------------------------------
    // 1. THEOLOGICAL PDFS & HANDBOOKS
    // ------------------------------------------------------------
    {
        id: "pdf-pastoral-handbook",
        title: "Pastoral Ministry & Liturgy Handbook (2025 Edition)",
        category: "pdf",
        categoryBadge: "FEATURED THEOLOGICAL PDF",
        fileFormat: "PDF Document",
        fileSize: "4.8 MB",
        author: "MBS Faculty & Board of Presbyters",
        description: "Comprehensive ministerial practical handbook covering church administration, pastoral care, biblically sound funeral & wedding liturgy, and ordination standards.",
        fullDetails: [
            "Part 1: The Minister's Personal Walk, Family Devotion, and Pastoral Integrity.",
            "Part 2: Biblical Church Polity, Elder Selection, and Congregational Care.",
            "Part 3: Complete Liturgical Scripts for Christian Weddings, Funerals, and Infant Dedications.",
            "Part 4: Hospital Visitation, Anointing the Sick, and Crisis Pastoral Counseling."
        ],
        downloadUrl: "#download-pastoral-handbook",
        isFeatured: true
    },
    {
        id: "pdf-systematic-theology",
        title: "Systematic Theology Comprehensive Primer",
        category: "pdf",
        categoryBadge: "ACADEMIC TEXTBOOK",
        fileFormat: "PDF Document",
        fileSize: "7.4 MB",
        author: "Rev. Dr. Emmanuel Santos",
        description: "Essential theological summary of orthodoxy: Bibliology, Theology Proper, Christology, Pneumatology, Soteriology, and Eschatology.",
        fullDetails: [
            "Exposition of the 16 Fundamental Truths with scripture references.",
            "Comparative biblical theology answering modern theological controversies.",
            "Summary charts of Christological titles and covenants in scripture."
        ],
        downloadUrl: "#download-systematic-theology"
    },
    {
        id: "pdf-hermeneutics-guide",
        title: "Biblical Hermeneutics: Interpreting Scripture with Integrity",
        category: "pdf",
        categoryBadge: "STUDY GUIDE",
        fileFormat: "PDF Guide",
        fileSize: "3.2 MB",
        author: "Academic Dean Dr. Joel Villamor",
        description: "Step-by-step principles for historical-grammatical exegesis, genre analysis, and avoiding eisegesis in the pulpit.",
        fullDetails: [
            "Literal-Grammatical-Historical hermeneutical method explained simply.",
            "Interpreting Old Testament Narrative, Psalms, Prophecy, and Apocalyptic literature.",
            "Bridging the ancient cultural gap to modern application without compromising truth."
        ],
        downloadUrl: "#download-hermeneutics-guide"
    },
    {
        id: "pdf-church-planting-manual",
        title: "Apostolic Church Planter's Field Manual",
        category: "pdf",
        categoryBadge: "MISSION FIELD GUIDE",
        fileFormat: "PDF Manual",
        fileSize: "5.1 MB",
        author: "MBS Missions & Evangelism Department",
        description: "Strategic blueprint for pioneering self-multiplying, autonomous churches in rural, provincial, and urban areas across the Philippines.",
        fullDetails: [
            "Community demographic profiling and prayer warfare strategies.",
            "Discovery Bible Study (DBS) cell groups to Sunday public gathering roadmap.",
            "Training local indigenous elders within the first 18 months."
        ],
        downloadUrl: "#download-church-planting-manual"
    },
    {
        id: "pdf-greek-hebrew-syntax",
        title: "Biblical Greek & Hebrew Quick Syntax Reference",
        category: "pdf",
        categoryBadge: "ORIGINAL LANGUAGES",
        fileFormat: "PDF Reference",
        fileSize: "2.1 MB",
        author: "Seminary Language Department",
        description: "Handy 12-page color reference sheet containing Koine Greek declensions, verb tenses, and biblical Hebrew root conjugations.",
        fullDetails: [
            "Noun paradigms for 1st, 2nd, and 3rd declensions in Koine Greek.",
            "Verbal aspect, tense, voice, and mood indicators for New Testament exegesis.",
            "Basic Hebrew stem charts (Qal, Niphal, Piel, Hiphil, Hithpael)."
        ],
        downloadUrl: "#download-greek-hebrew-syntax"
    },

    // ------------------------------------------------------------
    // 2. CHURCH-RELATED VIDEOS & MASTERCLASSES
    // ------------------------------------------------------------
    {
        id: "vid-expository-preaching",
        title: "Expository Preaching Masterclass: From Text to Sermon",
        category: "video",
        categoryBadge: "FEATURED VIDEO LECTURE",
        duration: "48 mins",
        author: "Rev. Dr. Emmanuel Santos",
        description: "Video lecture series demonstrating the transformation of an ancient Bible passage into an inspiring, Christ-centered, expository Sunday sermon.",
        fullDetails: [
            "Understanding the Main Idea of the Text (MIT) versus Sermon Proposition.",
            "How to craft engaging pastoral introductions and memorable illustrations.",
            "Delivering sermons that demand life transformation rather than mere information."
        ],
        videoUrl: "https://www.youtube.com/watch?v=dvnPYsaePIA",
        isFeatured: true
    },
    {
        id: "vid-church-revitalization",
        title: "Church Revitalization & Leadership Seminar",
        category: "video",
        categoryBadge: "PASTORAL SEMINAR",
        duration: "54 mins",
        author: "Rev. Benjamin Alcantara",
        description: "Transformational leadership strategies for renewing stagnant congregations, cultivating prayer culture, and activating inactive church members.",
        fullDetails: [
            "Diagnosing the 5 stages of congregational plateau and decline.",
            "Re-aligning church committees towards discipleship and outreach.",
            "Establishing a culture of pastoral mentorship and youth volunteerism."
        ],
        videoUrl: "https://www.youtube.com/watch?v=dvnPYsaePIA"
    },
    {
        id: "vid-bivocational-resilience",
        title: "Bi-Vocational Ministry Resilience & Time Mastery",
        category: "video",
        categoryBadge: "MINISTRY LIFESTYLE",
        duration: "38 mins",
        author: "Pastor Josue De Guzman",
        description: "Practical masterclass for pastors who work full-time secular careers while faithfully pastoring and expanding their local churches.",
        fullDetails: [
            "Weekly calendar architecture: Balancing job, pastoral emergencies, and sermon prep.",
            "Guarding family sabbath and avoiding physical or emotional pastoral burnout.",
            "Multiplying lay leaders so the pastor does not shepherd alone."
        ],
        videoUrl: "https://www.youtube.com/watch?v=dvnPYsaePIA"
    },
    {
        id: "vid-biblical-counseling",
        title: "Biblical Pastoral Counseling in Crisis & Grief",
        category: "video",
        categoryBadge: "PASTORAL CARE",
        duration: "45 mins",
        author: "Dr. Joel Villamor",
        description: "Scripture-anchored counseling methods for guiding members through marital struggles, mental health distress, and sudden bereavement.",
        fullDetails: [
            "Distinguishing between physical, emotional, and spiritual root causes.",
            "Applying the promises of Scripture without offering cliches or superficial comfort.",
            "Confidentiality protocols and when to recommend medical professional care."
        ],
        videoUrl: "https://www.youtube.com/watch?v=dvnPYsaePIA"
    },

    // ------------------------------------------------------------
    // 3. CHURCH TOOLKITS & DOWNLOADABLE PACKS
    // ------------------------------------------------------------
    {
        id: "tool-church-media-kit",
        title: "Complete Church Sunday Media & Slide Toolkit (2025)",
        category: "toolkit",
        categoryBadge: "CHURCH MEDIA KIT",
        fileFormat: "ZIP Archive",
        fileSize: "18.4 MB",
        author: "MBS Digital Media Ministry",
        description: "High-resolution widescreen sermon slide templates, announcement overlays, countdown videos, and tithes & offerings graphics ready for ProPresenter or PowerPoint.",
        fullDetails: [
            "50+ Modern 16:9 Sermon Title and Scripture Graphic Slides.",
            "Motion background video loops for worship and prayer times.",
            "Customizable social media bulletin templates for Facebook and Instagram."
        ],
        downloadUrl: "#download-church-media-kit"
    },
    {
        id: "tool-certificates-pack",
        title: "Printable Church Certificates & Membership Ledger Kit",
        category: "toolkit",
        categoryBadge: "ADMINISTRATIVE TEMPLATES",
        fileFormat: "Word & PDF",
        fileSize: "6.2 MB",
        author: "Registrar's Office",
        description: "Official, professionally designed certificates for Water Baptism, Child Dedication, Ordination, and Membership Registry with editable Word files.",
        fullDetails: [
            "Gold-bordered Water Baptism certificate templates (Print ready).",
            "Infant & Child Dedication certificate templates with biblical covenant blessing.",
            "Standard local church membership transfer and recommendation letters."
        ],
        downloadUrl: "#download-certificates-pack"
    },
    {
        id: "tool-finance-spreadsheet",
        title: "Local Church Financial Accountability & Ledger Tool",
        category: "toolkit",
        categoryBadge: "FINANCIAL GOVERNANCE",
        fileFormat: "Excel & Sheets",
        fileSize: "1.9 MB",
        author: "Seminary Bursar & Audit Committee",
        description: "Turnkey accounting ledger spreadsheet designed specifically for local churches to transparently record tithes, building funds, and missionary stipends.",
        fullDetails: [
            "Automated weekly tithe and offering balance sheet with receipt generation.",
            "Missionary support tracker and pastoral discretionary allowance log.",
            "Annual congregation financial reporting summary template."
        ],
        downloadUrl: "#download-finance-spreadsheet"
    },
    {
        id: "tool-sunday-school-curriculum",
        title: "52-Week Children's Sunday School Curriculum Guide",
        category: "toolkit",
        categoryBadge: "SUNDAY SCHOOL CURRICULUM",
        fileFormat: "Complete PDF Pack",
        fileSize: "14.5 MB",
        author: "Department of Christian Education",
        description: "Full one-year systematic Bible curriculum for kids with teacher lesson plans, memory verse coloring sheets, and biblical puppet play scripts.",
        fullDetails: [
            "Genesis to Revelation chronological storytelling designed for ages 5 to 12.",
            "Weekly printable memory verse activity sheets and review quizzes.",
            "Teacher training guide for volunteers and Sunday school coordinators."
        ],
        downloadUrl: "#download-sunday-school-curriculum"
    },

    // ------------------------------------------------------------
    // 4. MINISTERIAL HELP DESK & SYSTEM SUPPORTS
    // ------------------------------------------------------------
    {
        id: "sup-lms-help",
        title: "Student LMS Portal Technical Desk & Course Help",
        category: "support",
        categoryBadge: "LMS SUPPORT",
        author: "MBS Digital Systems & Registrar",
        description: "Instant assistance for students logging into the online learning portal, accessing curriculum videos, resetting passwords, or submitting modular assignments.",
        fullDetails: [
            "Portal Login Help: student IDs, password resets, and credential verification.",
            "Curriculum assistance: accessing prescribed modular lectures and reading syllabi.",
            "Community chat access: connecting with professors and fellow ministerial classmates."
        ],
        downloadUrl: "#contact-lms-help"
    },
    {
        id: "sup-satellite-host",
        title: "Church Satellite Partnership & Extension Class Desk",
        category: "support",
        categoryBadge: "EXTENSION SUPPORT",
        author: "Director of Satellite Campuses",
        description: "Direct consultation for senior pastors and church councils wanting to sponsor an MBS extension modular cohort inside their provincial or regional church venue.",
        fullDetails: [
            "Full accreditation requirements for church facility hosting.",
            "Scheduling traveling seminary professors for weekend modular classes.",
            "Tuition subsidization programs and pastoral scholarship sponsorships."
        ],
        downloadUrl: "#contact-satellite-host"
    }
];

interface MbsSupportsMegaMenuProps {
    isOpen: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onClose: () => void;
    onNavigate: (page: string) => void;
    onOpenAdmission: (program: string) => void;
}

export const MbsSupportsMegaMenu: React.FC<MbsSupportsMegaMenuProps> = ({
    isOpen,
    onMouseEnter,
    onMouseLeave,
    onClose,
    onNavigate,
    onOpenAdmission
}) => {
    const [resources, setResources] = useState<MbsResourceItem[]>(getMbsSupportResources);
    const [selectedResource, setSelectedResource] = useState<MbsResourceItem | null>(null);
    const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

    useEffect(() => {
        const handleUpdate = () => {
            setResources(getMbsSupportResources());
        };
        window.addEventListener(MBS_SUPPORTS_UPDATED_EVENT, handleUpdate);
        return () => window.removeEventListener(MBS_SUPPORTS_UPDATED_EVENT, handleUpdate);
    }, []);

    const handleSelectResource = (resource: MbsResourceItem) => {
        onClose();
        setSelectedResource(resource);
        setDownloadSuccess(null);
    };

    const handleSimulatedDownload = (resource: MbsResourceItem) => {
        const filename = resource.fileName || `${resource.title.replace(/[^a-zA-Z0-9]/g, "_")}.${resource.category === "toolkit" ? "zip" : "pdf"}`;
        setDownloadSuccess(`Initiating direct download for: ${filename} (${resource.fileSize || "Free Resource"})`);
        
        setTimeout(() => {
            if (resource.fileData) {
                const a = document.createElement("a");
                a.href = resource.fileData;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } else {
                const blob = new Blob([
                    `MOBILE BIBLE SCHOOL & THEOLOGICAL SEMINARY - RESOURCE DOWNLOAD\n\nTitle: ${resource.title}\nCategory: ${resource.categoryBadge}\nAuthor: ${resource.author}\nFile Size: ${resource.fileSize || "N/A"}\nFormat: ${resource.fileFormat || "N/A"}\n\nDESCRIPTION:\n${resource.description}\n\nDETAILS:\n${resource.fullDetails.join("\n")}\n\nFor more accredited theological resources and modular degree programs, visit https://mbs-portal.onrender.com or contact admissions at registrar@mobilebibleschool.edu.ph`
                ], { type: "text/plain;charset=utf-8" });
                
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
            
            setDownloadSuccess(`Downloaded "${resource.title}" successfully! Check your downloads folder.`);
        }, 500);
    };

    return (
        <>
            {/* ============================================================ */}
            {/* MBS SUPPORTS MEGA-MENU DROPDOWN                              */}
            {/* ============================================================ */}
            <div
                className={`apple-mega-menu supports-mega-menu ${isOpen ? "open" : ""}`}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            >
                <div className="apple-mega-container">
                    <div className="apple-mega-grid">
                        {/* COLUMN 1: Downloadable Theological PDFs & Handbooks */}
                        <div className="apple-mega-col">
                            <div className="apple-mega-label">
                                <FileText size={13} color="#38BDF8" />
                                <span>Theological PDFs &amp; Books</span>
                            </div>

                            <div
                                className="apple-hero-card supports-hero-card"
                                onClick={() => {
                                    const pastoral = resources.find(r => r.id === "pdf-pastoral-handbook") || resources[0];
                                    if (pastoral) handleSelectResource(pastoral);
                                }}
                                title="Click to view and download Pastoral Ministry Handbook"
                            >
                                <span className="apple-hero-badge supports-badge">FREE THEOLOGICAL PDF</span>
                                <h4 className="apple-hero-title">
                                    <span>Pastoral Handbook (2025)</span>
                                    <ArrowRight size={14} color="#38BDF8" />
                                </h4>
                                <p className="apple-hero-subtitle">
                                    Comprehensive guide for wedding liturgy, funerals, church discipline, and pastoral visitation protocols.
                                </p>
                            </div>

                            <div className="apple-link-list">
                                {resources.filter(r => r.category === "pdf" && r.id !== "pdf-pastoral-handbook").map(item => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        className="apple-link-item"
                                        onClick={() => handleSelectResource(item)}
                                        title={`Download ${item.title}`}
                                    >
                                        <FileText size={13} className="apple-link-item-icon supports-icon" />
                                        <span>{item.title}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* COLUMN 2: Church-Related Videos & Sermons */}
                        <div className="apple-mega-col">
                            <div className="apple-mega-label">
                                <Video size={13} color="#38BDF8" />
                                <span>Church Videos &amp; Sermons</span>
                            </div>

                            <div
                                className="apple-hero-card supports-hero-card"
                                onClick={() => {
                                    const expository = resources.find(r => r.id === "vid-expository-preaching") || resources.find(r => r.category === "video");
                                    if (expository) handleSelectResource(expository);
                                }}
                                title="Click to watch Expository Preaching Masterclass video"
                            >
                                <span className="apple-hero-badge supports-badge">FEATURED VIDEO LECTURE</span>
                                <h4 className="apple-hero-title">
                                    <span>Expository Preaching Masterclass</span>
                                    <Play size={14} color="#38BDF8" />
                                </h4>
                                <p className="apple-hero-subtitle">
                                    48-minute seminary lecture by Dr. Santos on converting biblical text into transformative sermons.
                                </p>
                            </div>

                            <div className="apple-link-list">
                                {resources.filter(r => r.category === "video" && r.id !== "vid-expository-preaching").map(item => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        className="apple-link-item"
                                        onClick={() => handleSelectResource(item)}
                                        title={`Watch ${item.title}`}
                                    >
                                        <Video size={13} className="apple-link-item-icon supports-icon" />
                                        <span>{item.title} ({item.duration})</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* COLUMN 3: Church Media Toolkits & Admin Packs */}
                        <div className="apple-mega-col">
                            <div className="apple-mega-label">
                                <FolderArchive size={13} color="#38BDF8" />
                                <span>Church Toolkits &amp; Media</span>
                            </div>

                            <div className="satellite-formats-stack">
                                {resources.filter(r => r.category === "toolkit").map(tool => (
                                    <div
                                        key={tool.id}
                                        className="satellite-format-card supports-format-card"
                                        onClick={() => handleSelectResource(tool)}
                                        style={{ cursor: "pointer" }}
                                        title={`Click to view ${tool.title}`}
                                    >
                                        <span className="sat-format-tag supports-format-tag">{tool.categoryBadge}</span>
                                        <h5>{tool.title}</h5>
                                        <p>{tool.description.substring(0, 90)}...</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* COLUMN 4: Help Desk, Admissions & Academic Programs */}
                        <div className="apple-mega-col">
                            <div className="apple-mega-label">
                                <Headphones size={13} color="#38BDF8" />
                                <span>MBS Ministerial Help Desk</span>
                            </div>

                            <div
                                className="apple-gallery-card supports-help-card"
                                onClick={() => {
                                    onClose();
                                    onNavigate("contact");
                                }}
                                title="Contact MBS Student & Church Support Desk"
                            >
                                <h5 className="apple-gallery-title">
                                    <Headphones size={15} color="#38BDF8" />
                                    <span>24/7 Support Hotline</span>
                                </h5>
                                <p className="apple-gallery-desc">
                                    Have questions about church resources, satellite accreditation, or online LMS login? Contact our ministerial support team.
                                </p>
                            </div>

                            <div className="apple-link-list">
                                <button
                                    type="button"
                                    className="apple-link-item"
                                    onClick={() => {
                                        onClose();
                                        onNavigate("learning");
                                    }}
                                >
                                    <BookOpen size={13} className="apple-link-item-icon" />
                                    <span>Theological LMS &amp; Course Lessons</span>
                                </button>

                                <button
                                    type="button"
                                    className="apple-link-item"
                                    onClick={() => {
                                        onClose();
                                        document.getElementById("academic-programs")?.scrollIntoView({ behavior: "smooth" });
                                    }}
                                >
                                    <Award size={13} className="apple-link-item-icon" />
                                    <span>Curriculum &amp; Degree Programs</span>
                                </button>

                                <button
                                    type="button"
                                    className="apple-link-item"
                                    onClick={() => {
                                        onClose();
                                        onOpenAdmission("Bachelor of Theology (B.Th.)");
                                    }}
                                >
                                    <ShieldCheck size={13} className="apple-link-item-icon" />
                                    <span>Online Admissions Application</span>
                                </button>

                                <button
                                    type="button"
                                    className="apple-link-item"
                                    onClick={() => {
                                        onClose();
                                        onNavigate("contact");
                                    }}
                                >
                                    <Mail size={13} className="apple-link-item-icon" />
                                    <span>Contact Helpdesk Registrar</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Utility Bar */}
                    <div className="apple-mega-bottom-bar">
                        <div className="apple-mega-quick-info">
                            <span className="apple-mega-quick-item">
                                <Download size={13} color="#38BDF8" />
                                <span><strong>100% Free Resources:</strong> PDFs • Syllabi • Ministry Templates</span>
                            </span>
                            <span className="apple-mega-quick-item">
                                <Video size={13} color="#38BDF8" />
                                <span><strong>Video Lectures:</strong> Expository Sermons &amp; Masterclasses</span>
                            </span>
                            <span className="apple-mega-quick-item">
                                <Headphones size={13} color="#38BDF8" />
                                <span><strong>Support Hotline:</strong> +63 (02) 8800-BIBLE</span>
                            </span>
                        </div>

                        <button
                            type="button"
                            className="apple-mega-cta-btn supports-cta-btn"
                            onClick={() => {
                                const firstPdf = resources.find(r => r.category === "pdf");
                                if (firstPdf) handleSelectResource(firstPdf);
                            }}
                        >
                            <Download size={14} />
                            <span>Download Resource Pack →</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ============================================================ */}
            {/* RESOURCE DETAILS, VIEWER & DOWNLOAD MODAL                    */}
            {/* ============================================================ */}
            {selectedResource && typeof document !== "undefined" && createPortal(
                <div
                    className="ub-modal-overlay supports-modal-overlay"
                    onClick={() => setSelectedResource(null)}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="supports-modal-title"
                >
                    <div className="ub-event-modal supports-modal-card" onClick={e => e.stopPropagation()}>
                        <button
                            type="button"
                            className="ub-modal-close"
                            onClick={() => setSelectedResource(null)}
                            aria-label="Close Resource Modal"
                        >
                            <X size={18} />
                        </button>

                        <span className="ub-event-modal-badge supports-badge-category">
                            {selectedResource.categoryBadge}
                        </span>
                        <h2 id="supports-modal-title" className="ub-event-modal-title">{selectedResource.title}</h2>

                        {/* Meta Grid */}
                        <div className="ub-event-modal-meta-grid supports-meta-grid">
                            <div className="ub-event-meta-cell">
                                {selectedResource.category === "video" ? (
                                    <Video size={16} className="ub-event-meta-icon supports-icon" />
                                ) : selectedResource.category === "toolkit" ? (
                                    <FolderArchive size={16} className="ub-event-meta-icon supports-icon" />
                                ) : (
                                    <FileText size={16} className="ub-event-meta-icon supports-icon" />
                                )}
                                <div>
                                    <p className="ub-event-meta-label">
                                        {selectedResource.category === "video" ? "Video Duration" : "Format & Size"}
                                    </p>
                                    <p className="ub-event-meta-val">
                                        {selectedResource.duration || `${selectedResource.fileFormat || "Document"} (${selectedResource.fileSize || "Free"})`}
                                    </p>
                                </div>
                            </div>

                            <div className="ub-event-meta-cell">
                                <Award size={16} className="ub-event-meta-icon supports-icon" />
                                <div>
                                    <p className="ub-event-meta-label">Author / Faculty</p>
                                    <p className="ub-event-meta-val">{selectedResource.author}</p>
                                </div>
                            </div>
                        </div>

                        {/* Video Player Preview if Category is Video */}
                        {selectedResource.category === "video" && (
                            <div className="supports-video-frame">
                                <iframe
                                    src="https://www.youtube.com/embed/dvnPYsaePIA?rel=0&modestbranding=1"
                                    title={selectedResource.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="supports-video-iframe"
                                />
                            </div>
                        )}

                        <p className="ub-event-modal-desc">{selectedResource.description}</p>

                        {/* Full Details List */}
                        <div className="supports-contents-box">
                            <strong>What This Resource Includes:</strong>
                            <ul className="supports-contents-list">
                                {selectedResource.fullDetails.map((detail, dIdx) => (
                                    <li key={dIdx}>
                                        <CheckCircle2 size={14} className="supports-check-icon" />
                                        <span>{detail}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Success / Status Message */}
                        {downloadSuccess && (
                            <div className="supports-success-alert">
                                <CheckCircle2 size={16} />
                                <span>{downloadSuccess}</span>
                            </div>
                        )}

                        {/* Modal Action Buttons */}
                        <div className="ub-event-modal-actions supports-modal-actions">
                            {selectedResource.category === "video" ? (
                                <button
                                    type="button"
                                    className="ub-btn-primary supports-btn-primary"
                                    onClick={() => handleSimulatedDownload(selectedResource)}
                                >
                                    <Download size={16} />
                                    <span>Download Video Notes &amp; Slides</span>
                                </button>
                            ) : selectedResource.category === "toolkit" ? (
                                <button
                                    type="button"
                                    className="ub-btn-primary supports-btn-primary"
                                    onClick={() => handleSimulatedDownload(selectedResource)}
                                >
                                    <Download size={16} />
                                    <span>Download Complete Toolkit (.ZIP)</span>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="ub-btn-primary supports-btn-primary"
                                    onClick={() => handleSimulatedDownload(selectedResource)}
                                >
                                    <Download size={16} />
                                    <span>Download PDF Resource</span>
                                </button>
                            )}

                            <button
                                type="button"
                                className="ub-btn-secondary supports-btn-secondary"
                                onClick={() => {
                                    setSelectedResource(null);
                                    onNavigate("learning");
                                }}
                            >
                                <BookOpen size={16} />
                                <span>Open LMS Digital Library</span>
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default MbsSupportsMegaMenu;
