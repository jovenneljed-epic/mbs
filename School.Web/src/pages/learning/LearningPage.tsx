// ============================================================
// LearningPage.tsx
// Renders FacultyLessonEditor for Administrators & Teachers to author
// and edit lessons, and StudentLearningArea for student learning.
// ============================================================

import React, { useMemo } from "react";
import FacultyLessonEditor from "./FacultyLessonEditor";
import StudentLearningArea from "./StudentLearningArea";
import PermissionService from "../../PermissionService";

interface LearningPageProps {
    onViewCourse?: (courseId: number) => void;
}

const LearningPage: React.FC<LearningPageProps> = () => {
    // Check if the current user is an Administrator or Faculty/Teacher
    const isFacultyOrAdmin = useMemo(() => {
        const role = (
            localStorage.getItem("currentRole") ||
            localStorage.getItem("role") ||
            PermissionService.getCurrentRole() ||
            ""
        ).toLowerCase();

        // If explicitly logged in as a student in the student portal
        if (role === "student" || role === "client" || role === "learner") {
            return false;
        }

        // Administrators and Teachers in CMS have curriculum & lesson editing access
        return true;
    }, []);

    if (isFacultyOrAdmin) {
        return <FacultyLessonEditor />;
    }

    return <StudentLearningArea />;
};

export default LearningPage;