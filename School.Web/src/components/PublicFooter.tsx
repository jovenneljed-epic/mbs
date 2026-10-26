// ============================================================
// PublicFooter.tsx
// Unified Institutional 4-Column Footer for All Public Pages
// Mobile Bible School & Theological Seminary
// ============================================================

import React, { useState, useEffect, useCallback } from "react";
import "./PublicFooter.css";
import { BookOpen, ArrowRight } from "lucide-react";
import { getLandingPageContent, type LandingPageContent } from "../services/landingPageContent";

export interface PublicFooterProps {
    onNavigate?: (page: string) => void;
    onOpenAdmission?: (program?: string) => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({
    onNavigate,
    onOpenAdmission,
}) => {
    const [content, setContent] = useState<LandingPageContent>(() => getLandingPageContent());

    useEffect(() => {
        const updateContent = () => {
            setContent(getLandingPageContent());
        };

        window.addEventListener("storage", updateContent);
        window.addEventListener("landingContentUpdated", updateContent);
        window.addEventListener("sms_landing_content_updated", updateContent);
        window.addEventListener("mbs:theme-changed", updateContent);

        return () => {
            window.removeEventListener("storage", updateContent);
            window.removeEventListener("landingContentUpdated", updateContent);
            window.removeEventListener("sms_landing_content_updated", updateContent);
            window.removeEventListener("mbs:theme-changed", updateContent);
        };
    }, []);

    const navigateTo = useCallback(
        (page: string) => {
            if (onNavigate) {
                onNavigate(page);
            } else {
                window.location.assign(`/${page}`);
            }
            try {
                window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
            } catch {
                window.scrollTo(0, 0);
            }
        },
        [onNavigate]
    );

    const handleOpenAdmission = useCallback(
        (program: string = "Bachelor of Theology (B.Th.)") => {
            if (onOpenAdmission) {
                onOpenAdmission(program);
            } else if (onNavigate) {
                onNavigate("contact");
            } else {
                window.location.assign("/contact");
            }
        },
        [onOpenAdmission, onNavigate]
    );

    const currentYear = new Date().getFullYear();
    const footer = content.footer || {};
    const schoolName = footer.schoolName || content.schoolName || "Mobile Bible School";
    const brandTagline = footer.brandTagline || content.brandTagline || "Theological Seminary & Ministerial Institute";

    return (
        <footer id="campuses" className="ub-footer" aria-label="Institutional Footer">
            <div className="ub-footer-main">
                <div className="ub-portals-container ub-footer-grid">
                    {/* Column 1: Institutional Seal & About */}
                    <div className="ub-footer-col ub-footer-col-brand">
                        <div
                            className="ub-brand ub-footer-brand"
                            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                            role="button"
                            tabIndex={0}
                            title="Scroll to top"
                        >
                            <div className="ub-crest">
                                <BookOpen className="ub-crest-icon" />
                            </div>
                            <div className="ub-title-block">
                                <h3 className="ub-university-name">
                                    {schoolName}
                                </h3>
                                <p className="ub-university-subtitle">
                                    {brandTagline}
                                </p>
                            </div>
                        </div>

                        <p className="ub-footer-motto">
                            {footer.scriptureMotto ||
                                '"Preach the word; be ready in season and out of season; reprove, rebuke, and exhort, with complete patience and teaching." — 2 Timothy 4:2'}
                        </p>

                        <div className="ub-footer-accreditations">
                            <span className="ub-tag-accred">{footer.accreditation1 || "ACTS ACCREDITED"}</span>
                            <span className="ub-tag-accred">{footer.accreditation2 || "CCHE RECOGNIZED"}</span>
                        </div>
                    </div>

                    {/* Column 2: Campus Locations & Satellite Classes */}
                    <div className="ub-footer-col">
                        <h4 className="ub-footer-heading">
                            {footer.column2Heading || "Campuses & Training Centers"}
                        </h4>
                        <ul className="ub-footer-list">
                            <li>
                                <strong>Main Seminary Campus:</strong>{" "}
                                {footer.mainCampus || "Metro Manila, Philippines"}
                            </li>
                            <li>
                                <strong>Regional Modular Centers:</strong>{" "}
                                {footer.regionalCenters || "Luzon • Visayas • Mindanao"}
                            </li>
                            <li>
                                <strong>Satellite Classes:</strong>{" "}
                                {footer.onlineExtension || "Regional Extension Campuses & Cohorts"}
                            </li>
                            <li>
                                <strong>Admissions Inquiries:</strong>{" "}
                                {footer.inquiriesPhone || "+63 (02) 8800-BIBLE"}
                            </li>
                            <li>
                                <strong>Direct Mobile:</strong>{" "}
                                {footer.directMobile || "+63 917 123 4567"}
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Quick Portals & Links */}
                    <div className="ub-footer-col">
                        <h4 className="ub-footer-heading">
                            {footer.column3Heading || "MBS Direct Portals"}
                        </h4>
                        <ul className="ub-footer-list">
                            <li>
                                <button type="button" onClick={() => navigateTo("client-login")}>
                                    {footer.portal1Label || "Student Portal (My MBS)"}
                                </button>
                            </li>
                            <li>
                                <button type="button" onClick={() => navigateTo("login")}>
                                    {footer.portal2Label || "Seminary Admin & Faculty Portal"}
                                </button>
                            </li>
                            <li>
                                <button type="button" onClick={() => navigateTo("learning")}>
                                    {footer.portal3Label || "Theological LMS (Class Modules)"}
                                </button>
                            </li>
                            <li>
                                <button type="button" onClick={() => navigateTo("client-payment")}>
                                    {footer.portal4Label || "Tuition & Assessment Payment"}
                                </button>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    onClick={() => handleOpenAdmission("Bachelor of Theology (B.Th.)")}
                                >
                                    {footer.portal5Label || "Online Admissions Desk"}
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Admissions & Faith Statement */}
                    <div className="ub-footer-col">
                        <h4 className="ub-footer-heading">
                            {footer.column4Heading || "Admissions Desk"}
                        </h4>
                        <p style={{ fontSize: "0.82rem", color: "#CBD5E1", lineHeight: 1.6, marginBottom: 14 }}>
                            {footer.admissionsBlurb ||
                                "Accepting applications for the upcoming academic semester. Open to pastors, church workers, and theological scholars."}
                        </p>
                        <button
                            type="button"
                            className="ub-btn-footer-apply"
                            onClick={() => handleOpenAdmission("Bachelor of Theology (B.Th.)")}
                        >
                            <span>{footer.admissionsCtaText || "Apply for Admission"}</span>
                            <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Bar: Copyright & Legal */}
            <div className="ub-footer-bottom">
                <div className="ub-portals-container ub-footer-bottom-flex">
                    <p>
                        {footer.copyrightText ||
                            `© ${currentYear} ${schoolName} & Theological Seminary. All Rights Reserved.`}
                    </p>
                    <div className="ub-footer-links">
                        <button
                            type="button"
                            onClick={() => navigateTo("contact")}
                        >
                            {footer.legalLink1Text || "Privacy Policy"}
                        </button>
                        <span>•</span>
                        <button
                            type="button"
                            onClick={() => navigateTo("about")}
                        >
                            {footer.legalLink2Text || "Academic Policies"}
                        </button>
                        <span>•</span>
                        <button
                            type="button"
                            onClick={() => handleOpenAdmission("Bachelor of Theology (B.Th.)")}
                        >
                            {footer.legalLink3Text || "Admissions Desk"}
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default PublicFooter;
