// ============================================================
// LandingPage.tsx -> Mobile Bible School Sales & Admissions Portal
// Mobile Bible School & Theological Seminary
// Official Institutional Portal & Academic Web System
// ============================================================

import React from "react";
import SalesLandingPage from "./SalesLandingPage";

interface LandingPageProps {
    onLogin?: () => void;
    onNavigate?: (page: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onNavigate }) => {
    return <SalesLandingPage onLogin={onLogin} onNavigate={onNavigate} />;
};

export default LandingPage;
