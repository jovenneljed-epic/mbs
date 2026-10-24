import React, { useCallback, useState } from "react";
import "./PublicHeader.css";
import { BookOpen, User, ShieldCheck, Calendar, Bell, Image as ImageIcon, GraduationCap } from "lucide-react";

interface PublicHeaderProps {
    onNavigate?: (page: string) => void;
    hideAbout?: boolean;
    hideThemeSwitcher?: boolean;
}

const PublicHeader: React.FC<PublicHeaderProps> = ({
    onNavigate,
    hideAbout = false,
    hideThemeSwitcher: _hideThemeSwitcher = false,
}) => {
    const [menuOpen, setMenuOpen] = useState(false);

    const isAboutPath = typeof window !== "undefined" && (window.location.pathname === "/about" || window.location.pathname.startsWith("/about/"));
    const shouldHideAbout = hideAbout || isAboutPath;

    const navigateTo = useCallback(
        (page: string) => {
            setMenuOpen(false);
            if (onNavigate) {
                onNavigate(page);
            } else {
                window.location.href = `/${page}`;
            }
        },
        [onNavigate]
    );

    return (
        <header className="epic-public-navbar mbs-unified-header">
            <div className="epic-public-nav-inner">

                {/* BRAND LOGO */}
                <button
                    type="button"
                    className="epic-public-logo mbs-brand-btn"
                    onClick={() => navigateTo("home")}
                    aria-label="Mobile Bible School Home"
                >
                    <div className="mbs-header-crest">
                        <BookOpen size={20} color="var(--theme-bg-end, #580D1B)" />
                    </div>

                    <div className="epic-public-logo-text">
                        <strong style={{ fontSize: "1.1rem", letterSpacing: "0.02em" }}>
                            Mobile Bible School
                        </strong>
                        <small style={{ color: "var(--theme-secondary, #FDE68A)", fontSize: "0.75rem", letterSpacing: "0.04em" }}>
                            Theological Seminary &amp; Institute
                        </small>
                    </div>
                </button>

                {/* DESKTOP / MOBILE NAVIGATION */}
                <nav
                    className={`epic-public-nav-links ${
                        menuOpen ? "open" : ""
                    }`}
                    aria-label="Main navigation"
                >
                    <button
                        type="button"
                        onClick={() => navigateTo("home")}
                    >
                        Home
                    </button>

                    {!shouldHideAbout && (
                        <button
                            type="button"
                            onClick={() => navigateTo("about")}
                        >
                            About
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => navigateTo("events")}
                        className="mbs-nav-highlight-btn"
                    >
                        <Calendar size={13} style={{ display: "inline", marginRight: 4, verticalAlign: -1 }} />
                        Events
                    </button>

                    <button
                        type="button"
                        onClick={() => navigateTo("announcements")}
                    >
                        <Bell size={13} style={{ display: "inline", marginRight: 4, verticalAlign: -1 }} />
                        Announcements
                    </button>

                    <button
                        type="button"
                        onClick={() => navigateTo("gallery")}
                    >
                        <ImageIcon size={13} style={{ display: "inline", marginRight: 4, verticalAlign: -1 }} />
                        Gallery
                    </button>

                    <button
                        type="button"
                        onClick={() => navigateTo("learning")}
                    >
                        Theological LMS
                    </button>

                    <button
                        type="button"
                        onClick={() => navigateTo("contact")}
                    >
                        Contact
                    </button>

                    {/* MOBILE PORTAL BUTTONS */}
                    <button
                        type="button"
                        className="epic-mobile-login"
                        onClick={() => navigateTo("client-login")}
                    >
                        <User size={14} style={{ display: "inline", marginRight: 5 }} />
                        Student Portal
                    </button>

                    <button
                        type="button"
                        className="epic-mobile-connect"
                        onClick={() => navigateTo("login")}
                    >
                        <ShieldCheck size={14} style={{ display: "inline", marginRight: 5 }} />
                        Admin Portal
                    </button>
                </nav>

                {/* DESKTOP ACTIONS */}
                <div className="epic-public-nav-actions">
                    

                    <button
                        type="button"
                        className="epic-client-login-button"
                        onClick={() => navigateTo("client-login")}
                        title="Student / Member Portal Login"
                    >
                        <User size={13} style={{ display: "inline", marginRight: 4, verticalAlign: -1 }} />
                        Student Portal
                    </button>

                    <button
                        type="button"
                        className="epic-client-login-button"
                        onClick={() => navigateTo("login")}
                        title="Faculty / Administrator Login"
                        style={{ borderColor: "rgba(245, 158, 11, 0.4)" }}
                    >
                        <ShieldCheck size={13} style={{ display: "inline", marginRight: 4, verticalAlign: -1 }} />
                        Admin Portal
                    </button>

                    <button
                        type="button"
                        className="epic-nav-cta"
                        onClick={() => navigateTo("contact")}
                    >
                        <GraduationCap size={14} style={{ display: "inline", marginRight: 5, verticalAlign: -2 }} />
                        Apply Now
                    </button>
                </div>

                {/* MOBILE MENU TOGGLE */}
                <button
                    type="button"
                    className="epic-mobile-menu"
                    onClick={() => setMenuOpen((open) => !open)}
                    aria-label={menuOpen ? "Close navigation" : "Open navigation"}
                    aria-expanded={menuOpen}
                >
                    {menuOpen ? "✕" : "☰"}
                </button>

            </div>
        </header>
    );
};

export default PublicHeader;
