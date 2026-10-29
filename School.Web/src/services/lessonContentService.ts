import axios from "axios";
import { API_BASE_URL } from "../config";
/* =========================================================
   LESSON CONTENT SERVICE
   Manages curriculum lessons, expository reading notes,
   video lectures, quizzes, and student submissions.
   Supports full editing by Administrators and Faculty/Teachers.
========================================================= */

export interface LessonQuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
}

export interface CourseLesson {
    id: string;
    courseCode: string; // e.g. "HERM-101", "OT-101", "NT-101", "THEO-101", "MIN-101"
    lessonNumber: number;
    title: string;
    duration: string;
    isPublished: boolean;
    scriptureReference: string;
    overview: string;
    readingContent: string[];
    keyTakeaways: string[];
    videoUrl?: string;
    audioUrl?: string;
    pdfSyllabusUrl?: string;
    quizQuestions: LessonQuizQuestion[];
    assignmentPrompt?: string;
    updatedAt?: string;
}

export interface StudentSubmission {
    id: string;
    lessonId: string;
    courseCode: string;
    studentName: string;
    studentId: string;
    submissionDate: string;
    reflectionText: string;
    quizScore?: number;
    status: "PENDING_REVIEW" | "GRADED" | "APPROVED";
    grade?: string;
    feedback?: string;
}

const LESSONS_STORAGE_KEY = "sms_curriculum_lessons_store_v2";
const SUBMISSIONS_STORAGE_KEY = "sms_student_submissions_store_v2";

/* =========================================================
   DEFAULT SEED LESSONS
========================================================= */

const INITIAL_LESSONS: CourseLesson[] = [
    // --- CBS 104: Biblical Hermeneutics & Inductive Exegesis ---
    {
        id: "cbs-104-l1",
        courseCode: "CBS 104",
        lessonNumber: 1,
        title: "Lesson 1: Divine Inspiration & Verbal Plenary Authority (2 Timothy 3:16-17)",
        duration: "45 mins lecture • Expository study",
        isPublished: true,
        scriptureReference: "2 Timothy 3:16-17 • 'All Scripture is God-breathed (theopneustos) and profitable for doctrine...'",
        overview: "Explores the dual authorship of Scripture, verbal plenary inspiration, and the foundational necessity of sound grammatical-historical interpretation.",
        readingContent: [
            "Biblical Hermeneutics is the science and art of biblical interpretation. It is a science because it is guided by recognized rules and principles; it is an art because application requires spiritual sensitivity and diligence.",
            "The primary objective of exegesis is to uncover the author-intended meaning (sensus literalis) within its original historical, cultural, and literary context before constructing homiletical applications.",
            "The interpreter must bridge the hermeneutical gap: the temporal gap (thousands of years elapsed), the geographical gap (Near East / Mediterranean), the linguistic gap (Hebrew, Aramaic, Greek), and the cultural gap."
        ],
        keyTakeaways: [
            "Scripture cannot mean what it never meant to the original recipients.",
            "Context determines meaning: literary context, historical context, and canonical context.",
            "The Holy Spirit illuminates the text but does not replace careful study and grammatical exegesis."
        ],
        videoUrl: "https://www.youtube.com/embed/fD309vK_jN0",
        pdfSyllabusUrl: "https://mbs-seminary.edu.ph/syllabi/CBS104_Hermeneutics_StudyGuide.pdf",
        assignmentPrompt: "In 300-500 words, explain why verbal plenary inspiration necessitates the grammatical-historical method rather than allegorical reading.",
        quizQuestions: [
            {
                id: "q-cbs104-1-1",
                question: "What is the primary objective of Biblical Exegesis?",
                options: [
                    "To read modern personal feelings into the passage",
                    "To draw out the original author-intended meaning in its historical context",
                    "To allegorize every narrative into hidden spiritual mysteries",
                    "To memorize Greek vocabulary without syntax"
                ],
                correctIndex: 1,
                explanation: "Exegesis literally means 'to draw out' the meaning from the text, as opposed to eisegesis which reads ideas into the text."
            },
            {
                id: "q-cbs104-1-2",
                question: "Which Scripture validates the plenary verbal inspiration of the Bible?",
                options: [
                    "2 Timothy 3:16-17",
                    "Proverbs 3:5-6",
                    "Genesis 1:1",
                    "Revelation 22:20"
                ],
                correctIndex: 0,
                explanation: "Paul declares that all Scripture is theopneustos (God-breathed)."
            }
        ],
        updatedAt: new Date().toISOString()
    },
    {
        id: "cbs-104-l2",
        courseCode: "CBS 104",
        lessonNumber: 2,
        title: "Lesson 2: Bridging the Hermeneutical Gap: Historical, Cultural & Grammatical Context",
        duration: "50 mins lecture • Expository study",
        isPublished: true,
        scriptureReference: "Nehemiah 8:8 • 'They read from the Book of the Law of God, clearly, and gave the sense...'",
        overview: "Methodology for analyzing original socio-cultural settings, ancient customs, idiom meanings, and syntax.",
        readingContent: [
            "The historical-cultural context involves investigating the writer's identity, date of writing, the historical situation of the recipients, and the social mores of biblical antiquity.",
            "Failure to understand cultural idioms often produces misinterpretation. When Jesus spoke of a 'camel going through the eye of a needle,' He employed hyperbole to emphasize human impossibility without divine grace."
        ],
        keyTakeaways: [
            "Always reconstruct the historical setting of the author and audience.",
            "Words have semantic ranges; their precise meaning is fixed by their sentence and paragraph context."
        ],
        videoUrl: "https://www.youtube.com/embed/bXv40182RzI",
        pdfSyllabusUrl: "https://mbs-seminary.edu.ph/syllabi/CBS104_Lesson2_Exegesis_Worksheet.pdf",
        assignmentPrompt: "Select a biblical narrative and outline its historical, geographical, and cultural setting in 300 words.",
        quizQuestions: [
            {
                id: "q-cbs104-2-1",
                question: "What is meant by the 'hermeneutical gap'?",
                options: [
                    "A gap between the Old and New Testaments only",
                    "The temporal, cultural, geographical, and linguistic differences between ancient texts and modern readers",
                    "A typo in modern Bible translations",
                    "The difference between King James and modern English"
                ],
                correctIndex: 1,
                explanation: "The interpreter must bridge the distance across time, culture, geography, and language to hear the text accurately."
            }
        ],
        updatedAt: new Date().toISOString()
    },
    {
        id: "cbs-104-l3",
        courseCode: "CBS 104",
        lessonNumber: 3,
        title: "Lesson 3: Literary Genre Analysis: Narrative, Law, Poetry, Prophecy & Epistles",
        duration: "60 mins lecture • Expository study",
        isPublished: true,
        scriptureReference: "Luke 24:27 • 'And beginning with Moses and all the Prophets, He interpreted to them in all the Scriptures the things concerning Himself.'",
        overview: "Techniques for interpreting different biblical genres with integrity and canonical consistency.",
        readingContent: [
            "Each genre in Scripture has its own 'rules of engagement.' Old Testament narrative records what took place historically, not necessarily what ought to take place morally.",
            "Hebrew poetry uses parallelism—synonymous, antithetical, and synthetic—to emphasize theological realities rather than phonetic rhyming.",
            "New Testament epistles are occasion-specific theological letters requiring careful tracking of logical connectors (therefore, because, in order that)."
        ],
        keyTakeaways: [
            "Do not interpret poetry as strict prose, or descriptive narrative as prescriptive doctrine.",
            "Identify the genre before applying hermeneutical principles."
        ],
        videoUrl: "https://www.youtube.com/embed/2YpX2bB9z5M",
        pdfSyllabusUrl: "https://mbs-seminary.edu.ph/syllabi/CBS104_Lesson3_Genre_Matrix.pdf",
        assignmentPrompt: "Compare how Psalm 23 (poetry) and Romans 8 (epistle) communicate God's unfailing protection.",
        quizQuestions: [
            {
                id: "q-cbs104-3-1",
                question: "What is the primary feature of Hebrew poetry?",
                options: [
                    "End rhyme and iambic pentameter",
                    "Parallelism of thought",
                    "Alphabetical acrostics only",
                    "Allegorical storytelling"
                ],
                correctIndex: 1,
                explanation: "Hebrew poetry is structured around thought parallelism rather than phonetic meter."
            }
        ],
        updatedAt: new Date().toISOString()
    },

    // --- CBS 102: Old Testament Survey & Pentateuch ---
    {
        id: "cbs-102-l1",
        courseCode: "CBS 102",
        lessonNumber: 1,
        title: "Lesson 1: Creation, The Fall & The Protoevangelium in Genesis",
        duration: "45 mins lecture • Pentateuch Exegesis",
        isPublished: true,
        scriptureReference: "Genesis 3:15 • 'I will put enmity between you and the woman, and between your offspring and her offspring...'",
        overview: "Genesis serves as the foundational seedbed for all biblical theology, tracing the creation ex nihilo, the fall, and the first promise of the Redeemer.",
        readingContent: [
            "Genesis 1-2 presents creation ex nihilo and the imago Dei endowed upon humanity.",
            "Genesis 3 records the tragedy of the fall and God's first announcement of redemption (the Protoevangelium in Genesis 3:15), promising that the Seed of the woman would crush the serpent's head."
        ],
        keyTakeaways: [
            "Genesis establishes God as Sovereign Creator and Lawgiver.",
            "The redemptive covenant begins in Genesis 3:15 and culminates at Calvary."
        ],
        videoUrl: "https://www.youtube.com/embed/g93U6q8_w1g",
        pdfSyllabusUrl: "https://mbs-seminary.edu.ph/syllabi/CBS102_Pentateuch_Notes.pdf",
        assignmentPrompt: "Trace the theme of the 'Seed' from Genesis 3:15 through Genesis 12:1-3.",
        quizQuestions: [
            {
                id: "q-cbs102-1-1",
                question: "What theological term describes the first gospel promise in Genesis 3:15?",
                options: [
                    "Protoevangelium",
                    "Theophany",
                    "Hypostatic union",
                    "Eschaton"
                ],
                correctIndex: 0,
                explanation: "Protoevangelium literally means 'the first gospel announcement.'"
            }
        ],
        updatedAt: new Date().toISOString()
    },
    {
        id: "cbs-102-l2",
        courseCode: "CBS 102",
        lessonNumber: 2,
        title: "Lesson 2: The Abrahamic & Mosaic Covenants: Promise and Law",
        duration: "50 mins lecture • Pentateuch Exegesis",
        isPublished: true,
        scriptureReference: "Genesis 12:1-3; Exodus 19:5-6 • Covenant faithfulness and priestly calling.",
        overview: "Examines God's unconditional covenant with Abraham and the pedagogical role of the Sinai law.",
        readingContent: [
            "God's covenant with Abraham guaranteed land, seed, and blessing, foreshadowing justification by faith (Romans 4).",
            "The Mosaic covenant provided the moral, civil, and ceremonial law, revealing holiness and driving sinners to Christ."
        ],
        keyTakeaways: [
            "The Abrahamic covenant is grounded in sovereign promise.",
            "The Mosaic law acts as a paidagogos (tutor) pointing to the Messiah."
        ],
        videoUrl: "https://www.youtube.com/embed/7V2VvP2XfHQ",
        pdfSyllabusUrl: "https://mbs-seminary.edu.ph/syllabi/CBS102_Covenants_Overview.pdf",
        assignmentPrompt: "Explain how Galatians 3 harmonizes the Abrahamic promise and the Mosaic law.",
        quizQuestions: [
            {
                id: "q-cbs102-2-1",
                question: "What was the purpose of the Mosaic law according to Galatians 3:24?",
                options: [
                    "To replace the Abrahamic promise",
                    "To serve as a guardian/tutor to lead us to Christ",
                    "To prove human moral perfection",
                    "To eliminate the sacrificial system"
                ],
                correctIndex: 1,
                explanation: "Paul teaches that the law reveals sin to lead believers to justification by faith in Christ."
            }
        ],
        updatedAt: new Date().toISOString()
    },

    // --- CBS 103: New Testament Survey & Apostolic Epistles ---
    {
        id: "cbs-103-l1",
        courseCode: "CBS 103",
        lessonNumber: 1,
        title: "Lesson 1: The Fourfold Gospel Witness to the Messianic King",
        duration: "55 mins lecture • Canonical Gospels",
        isPublished: true,
        scriptureReference: "John 20:31 • 'These are written that you may believe that Jesus is the Christ, the Son of God...'",
        overview: "Distinct portraits of Christ presented by Matthew, Mark, Luke, and John.",
        readingContent: [
            "Matthew portrays the King fulfilling prophecy; Mark reveals the Servant acting with divine urgency; Luke displays the Son of Man seeking the lost; John unveils the Eternal Word made flesh."
        ],
        keyTakeaways: [
            "The four Gospels offer an infallible, multidimensional portrait of the Lord Jesus Christ.",
            "The synoptics emphasize chronological narrative while John provides theological reflection."
        ],
        videoUrl: "https://www.youtube.com/embed/3vO9Yd1Z2wQ",
        pdfSyllabusUrl: "https://mbs-seminary.edu.ph/syllabi/CBS103_Gospels_Synoptic_Chart.pdf",
        assignmentPrompt: "Write a comparative analysis of the introductions of Matthew 1 and John 1.",
        quizQuestions: [
            {
                id: "q-cbs103-1-1",
                question: "Which Gospel writer emphasizes Jesus as the promised Davidic Messianic King to Jewish readers?",
                options: ["Mark", "Matthew", "Luke", "John"],
                correctIndex: 1,
                explanation: "Matthew frequently quotes OT prophecies fulfilling Christ's kingship."
            }
        ],
        updatedAt: new Date().toISOString()
    },

    // --- CBS 101: Life of Christ & Synoptic Gospels ---
    {
        id: "cbs-101-l1",
        courseCode: "CBS 101",
        lessonNumber: 1,
        title: "Lesson 1: The Incarnation & Virgin Conception of Christ",
        duration: "45 mins lecture • Christology",
        isPublished: true,
        scriptureReference: "Luke 1:35; John 1:14 • The Word became flesh and dwelt among us.",
        overview: "Examines the hypostatic union, virgin birth, and deity of Christ.",
        readingContent: [
            "Jesus Christ is truly God and truly man in one undivided person.",
            "The virgin conception ensured His sinless human nature to redeem humanity."
        ],
        keyTakeaways: [
            "The hypostatic union: two natures without mixture, change, division, or separation.",
            "Christ is the spotless Lamb who alone could pay our sin debt."
        ],
        videoUrl: "https://www.youtube.com/embed/5kLw3V2n6uM",
        pdfSyllabusUrl: "https://mbs-seminary.edu.ph/syllabi/CBS101_Incarnation_Doctrine.pdf",
        assignmentPrompt: "Summarize the Council of Chalcedon (451 AD) definition of Christ's two natures.",
        quizQuestions: [
            {
                id: "q-cbs101-1-1",
                question: "What does the theological term 'hypostatic union' mean?",
                options: [
                    "The combination of faith and good works",
                    "The union of Christ's divine and human natures in one divine Person",
                    "The fellowship between believers and the local church",
                    "The harmony of the Old and New Testaments"
                ],
                correctIndex: 1,
                explanation: "The hypostatic union defines the coexistence of Christ's full humanity and full divinity."
            }
        ],
        updatedAt: new Date().toISOString()
    },

    // --- DPS 201: Systematic Theology I ---
    {
        id: "dps-201-l1",
        courseCode: "DPS 201",
        lessonNumber: 1,
        title: "Lesson 1: Bibliology: The Canon, Sufficiency & Infallibility of the Word",
        duration: "50 mins lecture • Systematic Doctrine",
        isPublished: true,
        scriptureReference: "Psalm 19:7-11 • The law of the Lord is perfect, reviving the soul.",
        overview: "Canonical boundaries, self-authenticating authority, and Sola Scriptura.",
        readingContent: [
            "Scripture alone is the ultimate infallible rule of faith and life (Sola Scriptura).",
            "The internal testimony of the Holy Spirit confirms the canonical validity of the sixty-six books."
        ],
        keyTakeaways: [
            "God's Word is sufficient for life, godliness, and ministry.",
            "The canon was recognized by the church, not created by church decree."
        ],
        videoUrl: "https://www.youtube.com/embed/6eZ4m9Q3m0A",
        pdfSyllabusUrl: "https://mbs-seminary.edu.ph/syllabi/DPS201_Bibliology_Syllabus.pdf",
        assignmentPrompt: "Defend the doctrine of Sola Scriptura against modern cultural relativism.",
        quizQuestions: [
            {
                id: "q-dps201-1-1",
                question: "What does Sola Scriptura affirm?",
                options: [
                    "No books other than the Bible may ever be read",
                    "Scripture is the only infallible rule for Christian faith and practice",
                    "Church tradition holds equal authority with Scripture",
                    "Every Christian must learn ancient languages"
                ],
                correctIndex: 1,
                explanation: "Sola Scriptura establishes Scripture as the sole infallible norma normans."
            }
        ],
        updatedAt: new Date().toISOString()
    }
];

const INITIAL_SUBMISSIONS: StudentSubmission[] = [
    {
        id: "sub-seed-1",
        lessonId: "cbs-104-l1",
        courseCode: "CBS 104",
        studentName: "Kezjed Solutions",
        studentId: "STD-2026-KEZJED",
        submissionDate: "2026-10-18T10:30:00.000Z",
        reflectionText: "The grammatical-historical method safeguards the church from allegorical subjectivity by grounding meaning in the author-intended sense of Scripture.",
        quizScore: 100,
        status: "APPROVED",
        grade: "A (98%)",
        feedback: "Outstanding exegesis and defense of verbal plenary inspiration. Accurate hermeneutical synthesis."
    },
    {
        id: "sub-seed-2",
        lessonId: "cbs-104-l2",
        courseCode: "CBS 104",
        studentName: "Kezjed Solutions",
        studentId: "STD-2026-KEZJED",
        submissionDate: "2026-10-22T14:15:00.000Z",
        reflectionText: "Bridging the hermeneutical gap requires thorough historical context and grammatical analysis before personal application.",
        quizScore: 95,
        status: "APPROVED",
        grade: "A (95%)",
        feedback: "Excellent historical background context provided."
    }
];

class LessonContentService {
    public async fetchLessonsFromApi(): Promise<CourseLesson[]> {
        try {
            const response = await axios.get(`${API_BASE_URL}/Courses?published=true`);
            const dbCourses: any[] = response.data;
            if (Array.isArray(dbCourses)) {
                const allLessons: CourseLesson[] = [];
                for (const course of dbCourses) {
                    for (const module of (course.modules || [])) {
                        const colonIdx = module.title ? module.title.indexOf(":") : -1;
                        const subjCode = colonIdx > 0 ? module.title.substring(0, colonIdx).trim() : (module.title || "MOD");
                        for (const l of (module.lessons || [])) {
                            allLessons.push({
                                id: `lesson-${l.lessonId}`,
                                courseCode: subjCode,
                                lessonNumber: l.sortOrder || 1,
                                title: l.title,
                                duration: `${l.estimatedMinutes || 45} mins lecture • Expository study`,
                                isPublished: l.isPublished ?? true,
                                scriptureReference: "2 Timothy 3:16-17 • Sola Scriptura",
                                overview: l.content ? (l.content.length > 180 ? l.content.substring(0, 180) + "..." : l.content) : "Authentic Mobile Bible School curriculum module.",
                                readingContent: l.content ? [l.content] : ["Official seminary reading guide."],
                                keyTakeaways: [
                                    "Scripture is God-breathed and fully authoritative.",
                                    "Exegesis demands sound grammatical-historical interpretation.",
                                    "Application flows directly from biblical context."
                                ],
                                videoUrl: l.videoUrl || "https://www.youtube.com/embed/fD309vK_jN0",
                                pdfSyllabusUrl: l.resourceUrl || "https://mbs-seminary.edu.ph/syllabi/CBS104_StudyGuide.pdf",
                                quizQuestions: [
                                    {
                                        id: `q-${l.lessonId}-1`,
                                        question: `What is the core doctrinal principle taught in ${l.title}?`,
                                        options: [
                                            "Human philosophy supersedes divine revelation",
                                            "Verbal plenary inspiration and grammatical-historical exegesis",
                                            "Allegorical eisegesis of sacred texts",
                                            "Arbitrary subjective personal interpretation"
                                        ],
                                        correctIndex: 1,
                                        explanation: "Sound biblical doctrine upholds the infallible authority of God's Word."
                                    }
                                ],
                                assignmentPrompt: `Write a 300-word theological reflection on ${l.title} applying the principles learned to local church ministry.`,
                                updatedAt: l.updatedDate || l.createdDate || new Date().toISOString()
                            });
                        }
                    }
                }

                if (allLessons.length > 0) {
                    this.saveAllLessons(allLessons);
                    return allLessons;
                }
            }
        } catch (e) {
            console.error("fetchLessonsFromApi failed, falling back to database defaults:", e);
        }
        return this.getLessons();
    }

    private getStoredLessons(): CourseLesson[] {
        try {
            const raw = localStorage.getItem(LESSONS_STORAGE_KEY);
            if (!raw) {
                this.saveAllLessons(INITIAL_LESSONS);
                return INITIAL_LESSONS;
            }
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed) || parsed.length === 0) {
                this.saveAllLessons(INITIAL_LESSONS);
                return INITIAL_LESSONS;
            }

            // Invalidate stale mock lessons containing fake codes or test URLs
            const hasFakeLessons = parsed.some(
                (l: any) => l.courseCode === "HERM-101" || l.videoUrl?.includes("dQw4w9WgXcQ")
            );

            if (hasFakeLessons) {
                console.log("Purged stale mock lessons cache, resetting to authentic MBS lessons.");
                this.saveAllLessons(INITIAL_LESSONS);
                return INITIAL_LESSONS;
            }

            return parsed;
        } catch {
            return INITIAL_LESSONS;
        }
    }

    private saveAllLessons(lessons: CourseLesson[]): void {
        try {
            localStorage.setItem(LESSONS_STORAGE_KEY, JSON.stringify(lessons));
            window.dispatchEvent(new CustomEvent("sms_lessons_updated", { detail: lessons }));
        } catch (e) {
            console.error("Failed to save lessons to localStorage", e);
        }
    }

    public getLessons(courseCode?: string): CourseLesson[] {
        const all = this.getStoredLessons();
        if (!courseCode) return all;
        const normalized = courseCode.trim().toUpperCase();
        return all
            .filter((l) => l.courseCode.toUpperCase() === normalized)
            .sort((a, b) => a.lessonNumber - b.lessonNumber);
    }

    public getLessonById(id: string): CourseLesson | undefined {
        const all = this.getStoredLessons();
        return all.find((l) => l.id === id);
    }

    public saveLesson(lesson: CourseLesson): void {
        const all = this.getStoredLessons();
        const index = all.findIndex((l) => l.id === lesson.id);

        const updated: CourseLesson = {
            ...lesson,
            updatedAt: new Date().toISOString()
        };

        if (index >= 0) {
            all[index] = updated;
        } else {
            all.push(updated);
        }

        this.saveAllLessons(all);
    }

    public deleteLesson(id: string): void {
        const all = this.getStoredLessons();
        const filtered = all.filter((l) => l.id !== id);
        this.saveAllLessons(filtered);
    }

    public reorderLessons(courseCode: string, orderedIds: string[]): void {
        const all = this.getStoredLessons();
        const remaining = all.filter((l) => l.courseCode.toUpperCase() !== courseCode.toUpperCase());
        const matching = all.filter((l) => l.courseCode.toUpperCase() === courseCode.toUpperCase());

        const ordered: CourseLesson[] = [];
        orderedIds.forEach((id, idx) => {
            const found = matching.find((m) => m.id === id);
            if (found) {
                ordered.push({ ...found, lessonNumber: idx + 1 });
            }
        });

        // Add any missing
        matching.forEach((m) => {
            if (!ordered.some((o) => o.id === m.id)) {
                ordered.push({ ...m, lessonNumber: ordered.length + 1 });
            }
        });

        this.saveAllLessons([...remaining, ...ordered]);
    }

    // Submissions
    public getSubmissions(courseCode?: string): StudentSubmission[] {
        try {
            const raw = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
            let list: StudentSubmission[] = raw ? JSON.parse(raw) : INITIAL_SUBMISSIONS;
            if (!Array.isArray(list) || list.length === 0) {
                list = INITIAL_SUBMISSIONS;
                localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(list));
            }
            if (courseCode) {
                const norm = courseCode.trim().toUpperCase();
                return list.filter((s) => s.courseCode.toUpperCase() === norm);
            }
            return list;
        } catch {
            return INITIAL_SUBMISSIONS;
        }
    }

    public submitStudentWork(
        submission: Omit<StudentSubmission, "id" | "submissionDate" | "status">
    ): StudentSubmission {
        const current = this.getSubmissions();
        const newSub: StudentSubmission = {
            ...submission,
            id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            submissionDate: new Date().toISOString(),
            status: "PENDING_REVIEW"
        };
        current.unshift(newSub);
        try {
            localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(current));
        } catch (e) {
            console.error("Failed to save submission", e);
        }
        return newSub;
    }

    public gradeSubmission(submissionId: string, grade: string, feedback: string): void {
        const current = this.getSubmissions();
        const index = current.findIndex((s) => s.id === submissionId);
        if (index >= 0) {
            current[index] = {
                ...current[index],
                status: "APPROVED",
                grade,
                feedback
            };
            try {
                localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(current));
            } catch (e) {
                console.error("Failed to update submission grade", e);
            }
        }
    }

    public resetToDefaults(): void {
        this.saveAllLessons(INITIAL_LESSONS);
        try {
            localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(INITIAL_SUBMISSIONS));
        } catch (e) {
            console.error("Failed to reset storage", e);
        }
    }
}

export const lessonContentService = new LessonContentService();
