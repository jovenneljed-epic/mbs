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
    // --- HERM-101 ---
    {
        id: "herm-101-l1",
        courseCode: "HERM-101",
        lessonNumber: 1,
        title: "Introduction to Biblical Exegesis & Divine Inspiration",
        duration: "45 mins lecture • 12 pages reading",
        isPublished: true,
        scriptureReference: "2 Timothy 3:16-17 • 'All Scripture is God-breathed and profitable for teaching...'",
        overview: "Explores the dual authorship of Scripture, plenary verbal inspiration, and the foundational necessity of sound grammatical-historical interpretation.",
        readingContent: [
            "Biblical Hermeneutics is the science and art of biblical interpretation. It is a science because it is guided by recognized rules and principles; it is an art because application requires spiritual sensitivity and diligence.",
            "The primary objective of exegesis is to uncover the author-intended meaning (sensus literalis) within its original historical, cultural, and literary context before constructing homiletical applications.",
            "The interpreter must bridge the hermeneutical gap: the temporal gap (thousands of years), the geographical gap (Near East / Mediterranean), the linguistic gap (Hebrew, Aramaic, Greek), and the cultural gap."
        ],
        keyTakeaways: [
            "Scripture cannot mean what it never meant to the original recipients.",
            "Context determines meaning: literary context, historical context, and canonical context.",
            "The Holy Spirit illuminates the text but does not replace careful study and grammatical exegesis."
        ],
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        audioUrl: "https://example.com/audio/herm-101-lesson-1.mp3",
        assignmentPrompt: "In 300-500 words, explain why verbal plenary inspiration necessitates the grammatical-historical method rather than allegorical reading.",
        quizQuestions: [
            {
                id: "q-herm-1-1",
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
                id: "q-herm-1-2",
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
        id: "herm-101-l2",
        courseCode: "HERM-101",
        lessonNumber: 2,
        title: "Historical-Cultural & Grammatical Framework",
        duration: "52 mins lecture • 15 pages reading",
        isPublished: true,
        scriptureReference: "Nehemiah 8:8 • 'They read from the Book of the Law of God, making it clear and giving the meaning...'",
        overview: "Detailed analysis of Ancient Near Eastern and Greco-Roman backgrounds, syntactical sentence diagramming, and word-study fallacies.",
        readingContent: [
            "To understand Old Testament covenant stipulations, the student of theology must grasp the Hittite Suzerain-Vassal treaty structure common in the 2nd millennium BC.",
            "Words have a semantic range (semantic field), but in any given sentence, a word carries only one specific meaning determined by its immediate syntactical context.",
            "Beware of the Root Fallacy (assuming a word's etymology determines its current meaning) and Anachronistic Fallacies (reading modern definitions into ancient words)."
        ],
        keyTakeaways: [
            "Never perform word studies in isolation from immediate sentence grammar.",
            "Historical geography illuminates theological narratives in Israel's journey.",
            "The Old Testament covenants find their ultimate fulfillment in Jesus Christ."
        ],
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        audioUrl: "https://example.com/audio/herm-101-lesson-2.mp3",
        assignmentPrompt: "Identify three lexical or grammatical fallacies common in contemporary preaching and describe how rigorous hermeneutics prevents them.",
        quizQuestions: [
            {
                id: "q-herm-2-1",
                question: "What is the 'Root Fallacy' in lexical semantics?",
                options: [
                    "Studying plants in Genesis",
                    "Assuming a word's ancient etymology defines its meaning in every context",
                    "Believing roots of verbs don't matter",
                    "Translating Hebrew directly into Latin"
                ],
                correctIndex: 1,
                explanation: "The root fallacy falsely assumes the origin or etymological root of a word governs its usage centuries later."
            }
        ],
        updatedAt: new Date().toISOString()
    },
    {
        id: "herm-101-l3",
        courseCode: "HERM-101",
        lessonNumber: 3,
        title: "Literary Genres: Epistles, Narratives, Prophecy & Parables",
        duration: "58 mins lecture • 18 pages reading",
        isPublished: true,
        scriptureReference: "Hebrews 1:1-2 • 'In the past God spoke to our ancestors through the prophets at many times and in various ways...'",
        overview: "Methodology for interpreting differing biblical genres with fidelity to their literary structure and theological purpose.",
        readingContent: [
            "Epistles are task-theology written to specific first-century church situations. We must identify the occasion, problem addressed, and timeless theological principle.",
            "Old Testament narratives are theological history, not mere moral fables. The hero of every biblical narrative is Yahweh God, working out His redemptive covenant.",
            "Hebrew poetry relies heavily on parallelism (Synonymous, Antithetic, Synthetic, and Chiastic structures) rather than phonetic rhyme."
        ],
        keyTakeaways: [
            "Narratives describe what happened; they do not necessarily prescribe what we must do.",
            "Parables typically center on one overarching theological focal point.",
            "Apocalyptic literature utilizes vivid symbolic imagery to depict ultimate divine victory."
        ],
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        audioUrl: "https://example.com/audio/herm-101-lesson-3.mp3",
        assignmentPrompt: "Analyze the literary structure of Psalm 1 and outline its antithetical parallelism and tree metaphor.",
        quizQuestions: [
            {
                id: "q-herm-3-1",
                question: "How does Hebrew poetry primarily create rhythm and emphasis?",
                options: [
                    "Through end-rhyming phonetic verses",
                    "Through parallelism of thoughts and concepts",
                    "Through musical notation only",
                    "Through strict iambic pentameter"
                ],
                correctIndex: 1,
                explanation: "Hebrew poetry is characterized by semantic parallelism, where consecutive lines echo, contrast, or build upon each other."
            }
        ],
        updatedAt: new Date().toISOString()
    },
    {
        id: "herm-101-l4",
        courseCode: "HERM-101",
        lessonNumber: 4,
        title: "Theological Synthesis & Modern Pastoral Application",
        duration: "40 mins lecture • 10 pages reading",
        isPublished: true,
        scriptureReference: "James 1:22 • 'Do not merely listen to the word, and so deceive yourselves. Do what it says.'",
        overview: "Bridging the ancient biblical text to modern 21st-century church ministry, personal discipleship, and homiletical delivery.",
        readingContent: [
            "Once original meaning is established through exegesis, the interpreter builds a theological principle that transcends time, geography, and culture.",
            "Application must align with the full counsel of God across the Old and New Testaments without legalism or antinomian license.",
            "Every authentic sermon must point ultimately to the gospel of Jesus Christ and call for faith, repentance, and practical Christian obedience."
        ],
        keyTakeaways: [
            "Exegesis without application is dead orthodoxy.",
            "Application without sound exegesis is humanistic moralism.",
            "Preach Christ from all of Scripture with Holy Spirit empowerment."
        ],
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        audioUrl: "https://example.com/audio/herm-101-lesson-4.mp3",
        assignmentPrompt: "Construct an expository sermon outline on Romans 8:28-30 applying the theological synthesis method.",
        quizQuestions: [
            {
                id: "q-herm-4-1",
                question: "What is the danger of application without sound grammatical-historical exegesis?",
                options: [
                    "It becomes humanistic moralism and misrepresents God's Word",
                    "It causes people to read too much Greek",
                    "It has no danger at all",
                    "It makes sermons too short"
                ],
                correctIndex: 0,
                explanation: "Without sound exegesis, applications stray from God's intended revelation and degenerate into humanistic advice."
            }
        ],
        updatedAt: new Date().toISOString()
    },

    // --- OT-101 ---
    {
        id: "ot-101-l1",
        courseCode: "OT-101",
        lessonNumber: 1,
        title: "The Pentateuch: Creation, Fall, and the Abrahamic Covenant",
        duration: "50 mins lecture • 16 pages reading",
        isPublished: true,
        scriptureReference: "Genesis 12:1-3 • 'I will make of you a great nation, and I will bless you and make your name great...'",
        overview: "Foundational study of Genesis through Deuteronomy, surveying the primeval history and God's unilateral redemptive covenant with Abraham.",
        readingContent: [
            "The Pentateuch (Torah) lays the non-negotiable theological substructure of the entire biblical canon.",
            "In Genesis 15, Yahweh passes through the animal pieces alone, establishing an unconditional covenant guaranteeing land, seed, and blessing.",
            "The Exodus event establishes Yahweh as Redeemer-King who delivers His chosen people from servitude to enter covenant fellowship at Sinai."
        ],
        keyTakeaways: [
            "God initiates covenant redemption by sovereign grace alone.",
            "The Abrahamic Covenant anticipates the salvation of all nations through Jesus Christ.",
            "The Law of Moses was a tutor leading to Christ (Galatians 3:24)."
        ],
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        assignmentPrompt: "Examine the unilateral nature of Genesis 15 and how it differs from ancient parity treaties.",
        quizQuestions: [
            {
                id: "q-ot-1-1",
                question: "Who passed through the animal pieces in Genesis 15 covenant ceremony?",
                options: [
                    "Abraham and Sarah",
                    "Yahweh alone (represented by the smoking pot and flaming torch)",
                    "Melchizedek",
                    "The elders of Canaan"
                ],
                correctIndex: 1,
                explanation: "God alone passed through the pieces, signaling that fulfillment depends solely on divine faithfulness."
            }
        ],
        updatedAt: new Date().toISOString()
    },
    {
        id: "ot-101-l2",
        courseCode: "OT-101",
        lessonNumber: 2,
        title: "The Historical Books: Theocratic Monarchy & Davidic Promise",
        duration: "48 mins lecture • 14 pages reading",
        isPublished: true,
        scriptureReference: "2 Samuel 7:12-13 • 'I will raise up your offspring to succeed you... and I will establish the throne of his kingdom forever.'",
        overview: "Chronicles the conquest of Canaan, the judges period, the rise of the monarchy, and God's eternal covenant with David.",
        readingContent: [
            "Israel's history illustrates repetitive cycles of apostasy, oppression, repentance, and deliverance in the Book of Judges.",
            "The Davidic Covenant in 2 Samuel 7 promises an eternal dynasty, throne, and kingdom, which finds ultimate fulfillment in King Jesus.",
            "The exile to Babylon was not divine weakness, but the covenantal curses of Deuteronomy 28 executed in holy justice."
        ],
        keyTakeaways: [
            "God is sovereign over the rise and fall of nations and empires.",
            "The Davidic King points to the Messiah who reigns in righteousness.",
            "Unfaithfulness brings discipline, but God remembers His covenant mercy."
        ],
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        assignmentPrompt: "Trace the motif of the Messianic Davidic King through Isaiah, Jeremiah, and the Gospels.",
        quizQuestions: [
            {
                id: "q-ot-2-1",
                question: "What does God promise David in 2 Samuel 7?",
                options: [
                    "A massive physical temple made of gold",
                    "An eternal kingdom, house, and throne through his seed",
                    "Victory over Egypt in his lifetime only",
                    "Direct wealth and silver"
                ],
                correctIndex: 1,
                explanation: "2 Samuel 7 is the Davidic Covenant establishing an eternal dynasty fulfilled in Christ."
            }
        ],
        updatedAt: new Date().toISOString()
    },

    // --- NT-101 ---
    {
        id: "nt-101-l1",
        courseCode: "NT-101",
        lessonNumber: 1,
        title: "The Synoptic Gospels: Kingdom of God & Messianic Identity",
        duration: "45 mins lecture • 13 pages reading",
        isPublished: true,
        scriptureReference: "Mark 1:14-15 • 'The time has come. The kingdom of God has come near. Repent and believe the good news!'",
        overview: "Examination of Matthew, Mark, and Luke emphasizing the inaugurated eschatology of the Kingdom and Jesus as the promised Messiah.",
        readingContent: [
            "The Synoptic Gospels provide complementary portraits of the life, death, and resurrection of Jesus Christ.",
            "The Kingdom of God is 'already but not yet': already inaugurated in Christ's first advent, and consummated at His glorious return.",
            "Jesus' miracles are not mere spectacles, but signposts of cosmic restoration breaking into the present fallen age."
        ],
        keyTakeaways: [
            "Matthew highlights Jesus as the fulfillment of Old Testament Messianic prophecy.",
            "Mark presents Jesus as the Suffering Servant who gives His life a ransom for many.",
            "Luke emphasizes Christ's compassion for the marginalized and the power of the Holy Spirit."
        ],
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        assignmentPrompt: "Discuss the theological significance of the 'already and not yet' tension in Christian daily discipleship.",
        quizQuestions: [
            {
                id: "q-nt-1-1",
                question: "What is the primary message of Jesus' preaching in Mark 1:15?",
                options: [
                    "Revolt against the Roman empire",
                    "The Kingdom of God has come near; repent and believe the good news",
                    "Keep the traditions of the Pharisees",
                    "Build synagogues across Galilee"
                ],
                correctIndex: 1,
                explanation: "Jesus declared the inauguration of God's redemptive rule calling for repentance and faith."
            }
        ],
        updatedAt: new Date().toISOString()
    },

    // --- THEO-101 ---
    {
        id: "theo-101-l1",
        courseCode: "THEO-101",
        lessonNumber: 1,
        title: "Bibliology: Revelation, Inerrancy & Canon of Scripture",
        duration: "55 mins lecture • 20 pages reading",
        isPublished: true,
        scriptureReference: "Psalm 19:1-4 & 2 Peter 1:20-21 • 'Men spoke from God as they were carried along by the Holy Spirit.'",
        overview: "Investigation into General and Special Revelation, the doctrine of biblical inerrancy, and the historical formation of the Canon.",
        readingContent: [
            "General revelation discloses God's existence, eternal power, and divine nature through creation and conscience, leaving humanity without excuse.",
            "Special revelation provides the explicit verbal knowledge of God's redemptive will, culminative in the Incarnate Word (Jesus) and the Inscripturated Word (the Bible).",
            "Inerrancy means that Scripture in its original autographs is entirely true and trustworthy in all that it affirms."
        ],
        keyTakeaways: [
            "General revelation reveals God's power; special revelation reveals God's salvation.",
            "The church did not create the Canon; the church recognized God's inspired voice.",
            "The Chicago Statement on Biblical Inerrancy provides a robust defense of Scripture's truthfulness."
        ],
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        assignmentPrompt: "Defend biblical inerrancy against modern postmodern critiques using Scripture and historical orthodox theology.",
        quizQuestions: [
            {
                id: "q-theo-1-1",
                question: "What is the difference between General and Special Revelation?",
                options: [
                    "General is for angels, Special is for humans",
                    "General is through creation/nature, Special is through Scripture and Jesus Christ",
                    "General is written in Hebrew, Special is written in Greek",
                    "There is no difference"
                ],
                correctIndex: 1,
                explanation: "General revelation is given to all mankind through creation, while Special revelation reveals the gospel through God's Word."
            }
        ],
        updatedAt: new Date().toISOString()
    },

    // --- MIN-101 ---
    {
        id: "min-101-l1",
        courseCode: "MIN-101",
        lessonNumber: 1,
        title: "The Biblical Shepherd: Character, Calling & Pastoral Qualifications",
        duration: "45 mins lecture • 15 pages reading",
        isPublished: true,
        scriptureReference: "1 Peter 5:2-3 • 'Be shepherds of God's flock that is under your care, watching over them... as examples to the flock.'",
        overview: "Comprehensive study of the biblical mandates for elders and shepherds in 1 Timothy 3, Titus 1, and 1 Peter 5.",
        readingContent: [
            "Biblical ministry flows from spiritual character rather than corporate managerial charisma.",
            "The pastor must be above reproach: a faithful husband, hospitable, able to teach, gentle, and self-controlled.",
            "Shepherding involves feeding the sheep sound doctrine, guarding them from ravenous wolves, and leading them into spiritual maturity."
        ],
        keyTakeaways: [
            "Character takes precedence over gifting in biblical leadership.",
            "Ministry is servanthood modeled on the Good Shepherd who lays down His life.",
            "Family health and moral integrity are primary qualifications for church oversight."
        ],
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        assignmentPrompt: "Draft a personal pastoral rule of life reflecting the qualifications of 1 Timothy 3:1-7.",
        quizQuestions: [
            {
                id: "q-min-1-1",
                question: "According to 1 Timothy 3, what is the primary prerequisite for pastoral leadership?",
                options: [
                    "Wealth and business influence",
                    "Blameless moral and spiritual character",
                    "High popularity ratings on social media",
                    "Extensive political connections"
                ],
                correctIndex: 1,
                explanation: "Paul specifies that overseers must be 'above reproach' with godly household leadership and spiritual integrity."
            }
        ],
        updatedAt: new Date().toISOString()
    }
];

const INITIAL_SUBMISSIONS: StudentSubmission[] = [
    {
        id: "sub-001",
        lessonId: "herm-101-l1",
        courseCode: "HERM-101",
        studentName: "Joshua Mark Bautista",
        studentId: "MBS-2026-0012",
        submissionDate: "2026-10-18T14:30:00.000Z",
        reflectionText: "Because verbal plenary inspiration affirms that every word of the original text was breathed out by God, we are bound to seek the exact sense intended by the human author whom the Spirit carried along. Allegorizing neglects the historical specificity of God's redemptive revelation in real time and space.",
        quizScore: 100,
        status: "APPROVED",
        grade: "A (98%)",
        feedback: "Exceptional theological grasp of sensus literalis and plenary inspiration. Well-referenced."
    },
    {
        id: "sub-002",
        lessonId: "ot-101-l1",
        courseCode: "OT-101",
        studentName: "Joshua Mark Bautista",
        studentId: "MBS-2026-0012",
        submissionDate: "2026-10-19T09:15:00.000Z",
        reflectionText: "The covenant ceremony of Genesis 15 is fundamentally distinct from ancient Hittite suzerain-vassal treaties where the vassal walked through the halves. Here, Yahweh assumed unilateral responsibility for fulfillment.",
        quizScore: 100,
        status: "PENDING_REVIEW"
    },
    {
        id: "sub-003",
        lessonId: "herm-101-l2",
        courseCode: "HERM-101",
        studentName: "Grace Abigail Perez",
        studentId: "MBS-2026-0034",
        submissionDate: "2026-10-19T11:45:00.000Z",
        reflectionText: "I found the warning against the root fallacy particularly convicting. Often in popular sermons we hear pastors dissect the Greek word dunamis to say the gospel is 'dynamite', when Paul was speaking of God's active, effective power, not an explosive force that destroys.",
        quizScore: 100,
        status: "APPROVED",
        grade: "A (96%)",
        feedback: "Great concrete example regarding dunamis. Excellent application."
    }
];

/* =========================================================
   SERVICE IMPLEMENTATION
========================================================= */

class LessonContentService {
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
