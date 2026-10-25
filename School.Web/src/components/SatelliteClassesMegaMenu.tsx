// ============================================================
// SatelliteClassesMegaMenu.tsx
// Dropdown List & Mega-Menu for Satellite Campuses & Regional Classes
// Mobile Bible School & Theological Seminary
// ============================================================

import React, { useState } from "react";
import {
    MapPin,
    Globe,
    Layers,
    Sparkles,
    ArrowRight,
    School,
    Building2,
    BookOpen,
    GraduationCap,
    Mail,
    Award,
    Clock,
    X
} from "lucide-react";

export interface SatelliteCampusItem {
    id: string;
    name: string;
    region: "Luzon" | "Visayas" | "Mindanao";
    regionBadge: string;
    location: string;
    schedule: string;
    description: string;
    programs: string[];
    director: string;
    contactPhone: string;
}

export const DEFAULT_SATELLITE_CAMPUSES: SatelliteCampusItem[] = [
    // Luzon Satellite Campuses
    {
        id: "sat-baguio",
        name: "Baguio City & Cordillera Satellite",
        region: "Luzon",
        regionBadge: "NORTHERN LUZON EXTENSION",
        location: "Session Road Extension, Baguio City, Benguet",
        schedule: "2nd Weekend Monthly (Fri 6PM - 9PM, Sat 8AM - 5PM)",
        description: "Serving Northern Luzon pastors, bi-vocational ministers, and indigenous church planters with accredited modular biblical theology.",
        programs: ["Certificate in Biblical Studies (CBS)", "Diploma in Pastoral Studies (DPS)", "Bachelor of Theology (B.Th.)"],
        director: "Rev. Dr. Emmanuel Santos",
        contactPhone: "+63 917 555 0192"
    },
    {
        id: "sat-dagupan",
        name: "Dagupan City Satellite (Pangasinan)",
        region: "Luzon",
        regionBadge: "CENTRAL PLAINS TRAINING HUB",
        location: "Perez Blvd, Dagupan City, Pangasinan",
        schedule: "3rd Weekend Monthly Intensives",
        description: "Central Plains Regional Training Center for ministers and theological students across Pangasinan, La Union, and Tarlac.",
        programs: ["CBS (Biblical Studies)", "DPS (Pastoral Studies)", "AML (Applied Ministry)"],
        director: "Pastor Josue De Guzman",
        contactPhone: "+63 920 888 4321"
    },
    {
        id: "sat-pampanga",
        name: "San Fernando Satellite (Pampanga)",
        region: "Luzon",
        regionBadge: "CENTRAL LUZON MINISTERIAL CENTER",
        location: "MacArthur Highway, City of San Fernando, Pampanga",
        schedule: "1st & 3rd Saturday Modular Sessions",
        description: "Central Luzon Ministerial Center specializing in expository preaching, pastoral hermeneutics, and church revitalization.",
        programs: ["Diploma in Pastoral Studies", "Bachelor of Theology"],
        director: "Bishop Roberto Manalo",
        contactPhone: "+63 918 222 3344"
    },
    {
        id: "sat-batangas",
        name: "Lipa City Satellite (Batangas)",
        region: "Luzon",
        regionBadge: "SOUTHERN TAGALOG & BICOL EXTENSION",
        location: "Ayala Highway, Lipa City, Batangas",
        schedule: "4th Weekend Monthly Intensives",
        description: "Southern Tagalog Regional Extension serving Batangas, Laguna, Quezon, and Bicol frontier ministerial cohorts.",
        programs: ["CBS (Biblical Studies)", "DPS (Pastoral Studies)", "AML (Applied Ministry)"],
        director: "Rev. Timothy Garcia",
        contactPhone: "+63 927 333 7788"
    },

    // Visayas Satellite Campuses
    {
        id: "sat-cebu",
        name: "Cebu City Satellite Campus",
        region: "Visayas",
        regionBadge: "CENTRAL VISAYAS HEADQUARTERS",
        location: "Osmeña Blvd, Capitol Site, Cebu City",
        schedule: "Monthly Extended Weekend Intensives",
        description: "Central Visayas Regional Headquarters equipping pastors, evangelists, and church leaders across Cebu, Bohol, and Leyte.",
        programs: ["Certificate in Biblical Studies", "Diploma in Pastoral Studies", "Bachelor of Theology (B.Th.)"],
        director: "Dr. Joel Villamor",
        contactPhone: "+63 932 444 8899"
    },
    {
        id: "sat-iloilo",
        name: "Iloilo City Satellite Class",
        region: "Visayas",
        regionBadge: "WESTERN VISAYAS REGIONAL COHORT",
        location: "General Luna St, Iloilo City, Iloilo",
        schedule: "Bi-Monthly Intensive Seminars",
        programs: ["CBS", "DPS (Pastoral Studies)", "AML (Christian Education)"],
        description: "Panay and Western Visayas Pastoral Cohort with specialized modules in Hermeneutics, Expository Preaching, and Christian Education.",
        director: "Rev. Daniel Soriano",
        contactPhone: "+63 919 777 6655"
    },

    // Mindanao Satellite Campuses
    {
        id: "sat-davao",
        name: "Davao City Satellite Campus",
        region: "Mindanao",
        regionBadge: "SOUTHERN MINDANAO EXTENSION",
        location: "J.P. Laurel Ave, Bajada, Davao City",
        schedule: "Every 2nd & 4th Saturday Cohorts",
        description: "Southern Mindanao Seminary Center providing rigorous pastoral training for church planters and ministers across Region XI and XII.",
        programs: ["CBS", "DPS", "Bachelor of Theology (B.Th.)"],
        director: "Rev. Benjamin Alcantara",
        contactPhone: "+63 928 999 1122"
    },
    {
        id: "sat-cdo",
        name: "Cagayan de Oro Satellite Class",
        region: "Mindanao",
        regionBadge: "NORTHERN MINDANAO TRAINING HUB",
        location: "Velez St, Cagayan de Oro City, Misamis Oriental",
        schedule: "Monthly 3-Day Intensive Modules",
        description: "Northern Mindanao & Caraga Regional Extension Hub equipping indigenous community leaders and rural pastoral teams.",
        programs: ["CBS (Biblical Studies)", "DPS (Pastoral Studies)"],
        director: "Pastor Gideon Macaraeg",
        contactPhone: "+63 915 666 4433"
    },
    {
        id: "sat-zamboanga",
        name: "Zamboanga Peninsula Satellite Outreach",
        region: "Mindanao",
        regionBadge: "WESTERN MINDANAO MISSION CENTER",
        location: "Mayor Jaldon St, Zamboanga City",
        schedule: "Quarterly Modular Summits & Intensives",
        description: "Western Mindanao Mission Center training cross-cultural church planters, frontier missionaries, and pastoral leaders.",
        programs: ["Certificate in Biblical Studies", "Pastoral Diploma"],
        director: "Pastor Joshua Tan",
        contactPhone: "+63 926 111 2244"
    }
];

interface SatelliteClassesMegaMenuProps {
    isOpen: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onClose: () => void;
    onNavigate: (page: string) => void;
    onOpenAdmission: (program: string) => void;
}

export const SatelliteClassesMegaMenu: React.FC<SatelliteClassesMegaMenuProps> = ({
    isOpen,
    onMouseEnter,
    onMouseLeave,
    onClose,
    onNavigate,
    onOpenAdmission
}) => {
    const [selectedCampus, setSelectedCampus] = useState<SatelliteCampusItem | null>(null);

    const handleSelectCampus = (campus: SatelliteCampusItem) => {
        onClose();
        setSelectedCampus(campus);
    };

    return (
        <>
            {/* SATELLITE CLASSES MEGA-MENU DROPDOWN */}
            <div
                className={`apple-mega-menu satellite-mega-menu ${isOpen ? "open" : ""}`}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            >
                <div className="apple-mega-container">
                    <div className="apple-mega-grid">
                        {/* COLUMN 1: Luzon Satellite Hubs */}
                        <div className="apple-mega-col">
                            <div className="apple-mega-label">
                                <MapPin size={13} color="#10B981" />
                                <span>Luzon Satellite Hubs</span>
                            </div>

                            <div
                                className="apple-hero-card satellite-hero-card"
                                onClick={() => {
                                    const baguio = DEFAULT_SATELLITE_CAMPUSES.find(s => s.id === "sat-baguio");
                                    if (baguio) handleSelectCampus(baguio);
                                }}
                                title="Click to view Baguio City & Cordillera Satellite details"
                            >
                                <span className="apple-hero-badge sat-badge">FEATURED LUZON HUB</span>
                                <h4 className="apple-hero-title">
                                    <span>Baguio &amp; Cordillera</span>
                                    <ArrowRight size={14} color="#10B981" />
                                </h4>
                                <p className="apple-hero-subtitle">
                                    Monthly theological intensives serving Northern Luzon pastors, bi-vocational workers, and church planters.
                                </p>
                            </div>

                            <div className="apple-link-list">
                                {DEFAULT_SATELLITE_CAMPUSES.filter(s => s.region === "Luzon" && s.id !== "sat-baguio").map(sat => (
                                    <button
                                        key={sat.id}
                                        type="button"
                                        className="apple-link-item"
                                        onClick={() => handleSelectCampus(sat)}
                                        title={`View details for ${sat.name}`}
                                    >
                                        <MapPin size={13} className="apple-link-item-icon sat-icon" />
                                        <span>{sat.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* COLUMN 2: Visayas & Mindanao Satellites */}
                        <div className="apple-mega-col">
                            <div className="apple-mega-label">
                                <Globe size={13} color="#10B981" />
                                <span>Visayas &amp; Mindanao Satellites</span>
                            </div>

                            <div
                                className="apple-hero-card satellite-hero-card"
                                onClick={() => {
                                    const cebu = DEFAULT_SATELLITE_CAMPUSES.find(s => s.id === "sat-cebu");
                                    if (cebu) handleSelectCampus(cebu);
                                }}
                                title="Click to view Cebu City Satellite details"
                            >
                                <span className="apple-hero-badge sat-badge">CENTRAL VISAYAS HUB</span>
                                <h4 className="apple-hero-title">
                                    <span>Cebu City Satellite Campus</span>
                                    <ArrowRight size={14} color="#10B981" />
                                </h4>
                                <p className="apple-hero-subtitle">
                                    Equipping ministers and evangelists across Cebu, Bohol, and Leyte with sound biblical theology.
                                </p>
                            </div>

                            <div className="apple-link-list">
                                {DEFAULT_SATELLITE_CAMPUSES.filter(s => (s.region === "Visayas" && s.id !== "sat-cebu") || s.region === "Mindanao").map(sat => (
                                    <button
                                        key={sat.id}
                                        type="button"
                                        className="apple-link-item"
                                        onClick={() => handleSelectCampus(sat)}
                                        title={`View details for ${sat.name}`}
                                    >
                                        <MapPin size={13} className="apple-link-item-icon sat-icon" />
                                        <span>{sat.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* COLUMN 3: Modes of Satellite Learning */}
                        <div className="apple-mega-col">
                            <div className="apple-mega-label">
                                <Layers size={13} color="#10B981" />
                                <span>Modes of Satellite Learning</span>
                            </div>

                            <div className="satellite-formats-stack">
                                <div className="satellite-format-card">
                                    <span className="sat-format-tag">MODULAR INTENSIVE</span>
                                    <h5>Weekend Pastoral Classes</h5>
                                    <p>Friday evenings &amp; Saturdays scheduled for bi-vocational ministers who work full-time.</p>
                                </div>

                                <div className="satellite-format-card">
                                    <span className="sat-format-tag">TRAVELING FACULTY</span>
                                    <h5>Resident Professor Cohorts</h5>
                                    <p>Main campus professors travel to each satellite center for rigorous in-person lectures.</p>
                                </div>

                                <div className="satellite-format-card">
                                    <span className="sat-format-tag">THEOLOGICAL LMS</span>
                                    <h5>Digital Extension Sync</h5>
                                    <p>Free 24/7 access to all 35 prescribed curriculum courses, lesson notes, and community chats.</p>
                                </div>
                            </div>
                        </div>

                        {/* COLUMN 4: Host a Satellite Class & Admissions */}
                        <div className="apple-mega-col">
                            <div className="apple-mega-label">
                                <Sparkles size={13} color="#10B981" />
                                <span>Host a Satellite Class</span>
                            </div>

                            <div
                                className="apple-gallery-card satellite-host-card"
                                onClick={() => {
                                    onClose();
                                    onNavigate("contact");
                                }}
                                title="Bring MBS Satellite Cohort to your church"
                            >
                                <h5 className="apple-gallery-title">
                                    <School size={15} color="#10B981" />
                                    <span>Bring MBS to Your Church</span>
                                </h5>
                                <p className="apple-gallery-desc">
                                    Partner with Mobile Bible School to establish an accredited modular class center in your local church or province.
                                </p>
                            </div>

                            <div className="apple-link-list">
                                <button
                                    type="button"
                                    className="apple-link-item"
                                    onClick={() => {
                                        onClose();
                                        onNavigate("campuses");
                                    }}
                                >
                                    <Building2 size={13} className="apple-link-item-icon" />
                                    <span>All Campuses &amp; Facilities</span>
                                </button>

                                <button
                                    type="button"
                                    className="apple-link-item"
                                    onClick={() => {
                                        onClose();
                                        onNavigate("learning");
                                    }}
                                >
                                    <BookOpen size={13} className="apple-link-item-icon" />
                                    <span>Theological LMS &amp; Lessons</span>
                                </button>

                                <button
                                    type="button"
                                    className="apple-link-item"
                                    onClick={() => {
                                        onClose();
                                        onOpenAdmission("Bachelor of Theology (Satellite Campus)");
                                    }}
                                >
                                    <GraduationCap size={13} className="apple-link-item-icon" />
                                    <span>Satellite Class Admission</span>
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
                                    <span>Request a Satellite Cohort</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Utility Bar */}
                    <div className="apple-mega-bottom-bar">
                        <div className="apple-mega-quick-info">
                            <span className="apple-mega-quick-item">
                                <MapPin size={13} color="#10B981" />
                                <span><strong>9 Active Satellites:</strong> Luzon • Visayas • Mindanao</span>
                            </span>
                            <span className="apple-mega-quick-item">
                                <BookOpen size={13} color="#10B981" />
                                <span><strong>35 Theological Subjects:</strong> CBS • DPS • AML • BTH</span>
                            </span>
                            <span className="apple-mega-quick-item">
                                <Award size={13} color="#10B981" />
                                <span><strong>Zero Relocation:</strong> Study Where You Serve</span>
                            </span>
                        </div>

                        <button
                            type="button"
                            className="apple-mega-cta-btn satellite-cta-btn"
                            onClick={() => {
                                onClose();
                                onOpenAdmission("Bachelor of Theology (Satellite Campus)");
                            }}
                        >
                            <GraduationCap size={14} />
                            <span>Enroll in Satellite Classes →</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* SATELLITE CAMPUS DETAILS MODAL */}
            {selectedCampus && (
                <div className="ub-modal-overlay" onClick={() => setSelectedCampus(null)}>
                    <div className="ub-event-modal satellite-modal-card" onClick={e => e.stopPropagation()}>
                        <button
                            type="button"
                            className="ub-modal-close"
                            onClick={() => setSelectedCampus(null)}
                            aria-label="Close Satellite Modal"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <span className="ub-event-modal-badge satellite-badge-region">
                            {selectedCampus.regionBadge}
                        </span>
                        <h2 className="ub-event-modal-title">{selectedCampus.name}</h2>

                        <div className="ub-event-modal-meta-grid">
                            <div className="ub-event-meta-cell">
                                <MapPin size={16} className="ub-event-meta-icon" />
                                <div>
                                    <p className="ub-event-meta-label">Campus Location</p>
                                    <p className="ub-event-meta-val">{selectedCampus.location}</p>
                                </div>
                            </div>
                            <div className="ub-event-meta-cell">
                                <Clock size={16} className="ub-event-meta-icon" />
                                <div>
                                    <p className="ub-event-meta-label">Class Schedule</p>
                                    <p className="ub-event-meta-val">{selectedCampus.schedule}</p>
                                </div>
                            </div>
                        </div>

                        <p className="ub-event-modal-desc">{selectedCampus.description}</p>

                        <div className="satellite-programs-box">
                            <strong>Accredited Programs Offered at this Satellite:</strong>
                            <div className="satellite-programs-tags">
                                {selectedCampus.programs.map((prog, pIdx) => (
                                    <span key={pIdx} className="satellite-program-tag">{prog}</span>
                                ))}
                            </div>
                        </div>

                        <div className="satellite-director-box">
                            <div>
                                <small>Regional Resident Director</small>
                                <strong>{selectedCampus.director}</strong>
                            </div>
                            <div>
                                <small>Satellite Contact</small>
                                <strong>{selectedCampus.contactPhone}</strong>
                            </div>
                        </div>

                        <div className="ub-event-modal-actions">
                            <button
                                type="button"
                                className="ub-btn-primary"
                                onClick={() => {
                                    const campusName = selectedCampus.name;
                                    setSelectedCampus(null);
                                    onOpenAdmission(`Bachelor of Theology (${campusName})`);
                                }}
                            >
                                <GraduationCap size={16} />
                                <span>Apply to this Satellite Class</span>
                            </button>
                            <button
                                type="button"
                                className="ub-btn-secondary"
                                onClick={() => {
                                    setSelectedCampus(null);
                                    onNavigate("learning");
                                }}
                            >
                                <BookOpen size={16} />
                                <span>View Course Lessons &amp; LMS</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SatelliteClassesMegaMenu;
