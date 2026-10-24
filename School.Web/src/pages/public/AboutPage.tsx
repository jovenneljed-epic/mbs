// ============================================================
// AboutPage.tsx -> Mobile Bible School & Theological Seminary
// Official Institutional Dossier, Statement of Faith, Faculty & Campuses
// Connected to Global Adaptive Theme System
// ============================================================

import React, { useState, useEffect } from "react";
import PublicHeader from "../../components/PublicHeader";
import "./AboutPage.css";
import {
    BookOpen,
    Award,
    ShieldCheck,
    MapPin,
    GraduationCap,
    CheckCircle2,
    ArrowRight,
    Clock,
    Globe,
    Building2,
    Users,
    ChevronDown,
    ChevronUp,
    Landmark,
    ScrollText
} from "lucide-react";

export type AboutTab = "overview" | "faith" | "faculty" | "accreditations" | "campuses";

interface AboutPageProps {
    onNavigate?: (page: string) => void;
    initialTab?: AboutTab;
}

// ------------------------------------------------------------
// DOCTRINAL ARTICLES (Statement of Faith)
// ------------------------------------------------------------
interface DoctrinalArticle {
    num: string;
    title: string;
    shortSummary: string;
    fullText: string;
    scriptures: string[];
}

const ARTICLES_OF_FAITH: DoctrinalArticle[] = [
    {
        num: "Article I",
        title: "The Holy Scriptures (Inerrancy & Sufficiency)",
        shortSummary: "The 66 books of the Old and New Testaments as verbally inspired by God and inerrant in original manuscripts.",
        fullText: "We believe that the Holy Bible, consisting of sixty-six books of the Old and New Testaments, is the verbally inspired Word of God, fully inerrant in the original manuscripts, infallible in its content, and the supreme, final authority in all matters of faith, doctrine, and conduct. Scripture is sufficient for salvation, spiritual growth, and the ordering of the church and Christian life.",
        scriptures: ["2 Timothy 3:16–17", "2 Peter 1:20–21", "Psalm 19:7–11", "Matthew 5:18", "John 10:35"]
    },
    {
        num: "Article II",
        title: "The Sovereign Triune God",
        shortSummary: "One eternally existent God in three co-equal persons: Father, Son, and Holy Spirit.",
        fullText: "We believe in one God, eternally existing in three distinct, co-equal persons: the Father, the Son, and the Holy Spirit. Each person of the Godhead possesses identically the same divine nature, attributes, and perfections, executing distinct but harmonious offices in the eternal work of creation, providence, and redemption.",
        scriptures: ["Deuteronomy 6:4", "Matthew 28:19", "2 Corinthians 13:14", "John 1:1–3", "Genesis 1:26"]
    },
    {
        num: "Article III",
        title: "The Lord Jesus Christ",
        shortSummary: "Fully God and fully man, His virgin birth, sinless life, substitutionary blood atonement, bodily resurrection, and ascension.",
        fullText: "We believe that the Lord Jesus Christ is the eternal Son of God, who became man without ceasing to be God, having been conceived by the Holy Spirit and born of the virgin Mary. He lived a sinless life, died on the Cross as a substitutionary sacrifice for the sins of the world, rose bodily from the grave on the third day, ascended into heaven, and now sits at the right hand of God the Father as our High Priest, Intercessor, and Advocate.",
        scriptures: ["John 1:1, 14", "Philippians 2:5–11", "1 Corinthians 15:3–4", "Hebrews 7:25", "Colossians 1:15–20"]
    },
    {
        num: "Article IV",
        title: "The Holy Spirit & Regeneration",
        shortSummary: "The divine person who convicts, regenerates, indwells, sanctifies, and empowers believers for gospel ministry.",
        fullText: "We believe that the Holy Spirit is a divine person equal with the Father and the Son. He convicts the world of sin, righteousness, and judgment. At the moment of regeneration, He baptizes every believer into the Body of Christ, permanently indwells them, seals them unto the day of redemption, imparts spiritual gifts for the edification of the church, and empowers them to walk in holiness and witness boldly for Christ.",
        scriptures: ["John 14:16–17", "John 16:7–11", "Romans 8:9, 14–16", "1 Corinthians 12:7, 13", "Ephesians 1:13–14"]
    },
    {
        num: "Article V",
        title: "The Fall of Humanity & Depravity",
        shortSummary: "Created in God's image, fallen through Adam's transgression, spiritually dead and unable to save themselves.",
        fullText: "We believe that man was created directly in the image and likeness of God, free from sin, with a rational nature and moral responsibility. Through voluntary disobedience, Adam fell, and as a consequence, all humanity inherited a fallen nature, became spiritually dead in trespasses and sins, subject to physical and eternal death, and utterly unable to remedy their lost condition apart from God's sovereign grace.",
        scriptures: ["Genesis 1:26–27", "Genesis 3:1–19", "Romans 3:10–23", "Romans 5:12–19", "Ephesians 2:1–3"]
    },
    {
        num: "Article VI",
        title: "Salvation Solely by Grace through Faith",
        shortSummary: "Justification by faith alone in Christ's finished work on Calvary, without human works or merit.",
        fullText: "We believe that salvation is the gift of God brought to man by grace and received solely by personal faith in the Lord Jesus Christ, whose precious blood was shed for the forgiveness of sins. No works, rituals, sacraments, or human merit can contribute to justification. True believers are kept eternally secure by the power of God through faith unto final salvation.",
        scriptures: ["Ephesians 2:8–9", "Titus 3:5", "Romans 5:1", "John 10:28–30", "Romans 8:38–39"]
    },
    {
        num: "Article VII",
        title: "The Church & The Ordinances",
        shortSummary: "The Body of Christ manifested in local assemblies observing Believer's Water Baptism and the Lord's Supper.",
        fullText: "We believe that the Church is the spiritual Body and Bride of Christ, composed of all born-again believers of the present age. This universal body is manifested in autonomous local assemblies of baptized believers united for worship, biblical teaching, prayer, fellowship, and the Great Commission. We recognize two scriptural ordinances: Believer's Baptism by immersion as a testimony of faith, and the Lord's Supper as a memorial of His sacrificial death.",
        scriptures: ["Matthew 28:19–20", "Acts 2:41–42", "1 Corinthians 11:23–26", "Ephesians 4:4–6", "Hebrews 10:24–25"]
    },
    {
        num: "Article VIII",
        title: "Expository Preaching & Pastoral Integrity",
        shortSummary: "The sacred mandate to herald the full counsel of God with grammatical-historical precision and unblemished character.",
        fullText: "We believe that the pastoral office is established by Christ for the spiritual shepherding and governance of the local church. Pastors and elders must satisfy the strict biblical qualifications of 1 Timothy 3:1–7 and Titus 1:5–9, living blameless lives of moral purity and marital fidelity. The core task of the pulpit is sequential expository preaching—rightly dividing the Word of truth to equip the saints for the work of ministry.",
        scriptures: ["2 Timothy 4:1–5", "1 Timothy 3:1–7", "Titus 1:5–9", "1 Peter 5:1–4", "Acts 20:26–28"]
    },
    {
        num: "Article IX",
        title: "The Great Commission & Church Multiplication",
        shortSummary: "The solemn imperative to proclaim the Gospel to every creature and plant reproducing New Testament churches.",
        fullText: "We believe that it is the solemn privilege and sacred responsibility of every redeemed person and every biblical church to engage in personal evangelism, world missions, and church planting. The Great Commission commands us to go into all the world, proclaim the gospel to every nation, make disciples, baptize converts, and teach them to observe all things commanded by Christ.",
        scriptures: ["Matthew 28:18–20", "Mark 16:15", "Luke 24:46–48", "Acts 1:8", "Romans 10:14–17"]
    },
    {
        num: "Article X",
        title: "The Second Coming & Eternal Destiny",
        shortSummary: "The bodily, glorious return of Jesus Christ, resurrection of the dead, eternal reward for the saved, and judgment for the lost.",
        fullText: "We believe in the personal, bodily, and glorious return of our Lord Jesus Christ to establish His kingdom and execute judgment. We believe in the bodily resurrection of both the saved and the lost—the redeemed to everlasting life, blessedness, and joy in the presence of God, and the unrepentant to conscious, everlasting punishment in the Lake of Fire separated from the glory of the Lord.",
        scriptures: ["1 Thessalonians 4:13–18", "Revelation 20:11–15", "Revelation 21:1–7", "Matthew 25:31–46", "John 14:1–3"]
    }
];

// ------------------------------------------------------------
// FACULTY MEMBERS
// ------------------------------------------------------------
interface FacultyMember {
    id: string;
    name: string;
    title: string;
    department: "leadership" | "languages" | "theology" | "ministry";
    departmentLabel: string;
    degrees: string[];
    courses: string[];
    bio: string;
    tenureYears: number;
}

const SEMINARY_FACULTY: FacultyMember[] = [
    {
        id: "fac-1",
        name: "Dr. Emmanuel G. Ramos",
        title: "Seminary President & Professor of Systematic Theology",
        department: "leadership",
        departmentLabel: "Executive Leadership & Deans",
        degrees: ["Th.D. in Systematic Theology (ATS)", "D.Min. in Pastoral Leadership (DTS)", "M.Div. in Biblical Studies"],
        courses: ["Systematic Theology I & II", "Trinitarian Dogmatics", "Theological Prolegomena", "Ecclesiology & Eschatology"],
        bio: "Dr. Ramos has served in pastoral ministry and seminary leadership for over 35 years. He is the author of four theological monographs and has trained over 250 pastors across Luzon, Visayas, and Mindanao.",
        tenureYears: 32
    },
    {
        id: "fac-2",
        name: "Dr. Benjamin V. De Jesus",
        title: "Dean of the Seminary & Chair of Biblical Languages",
        department: "languages",
        departmentLabel: "Biblical Languages & Exegesis",
        degrees: ["Ph.D. in New Testament Exegesis (AGST)", "Th.M. in Greek Grammar (Magna Cum Laude)", "M.Div."],
        courses: ["Biblical Greek Grammar I & II", "Greek Exegesis of Romans", "Advanced Hermeneutics", "Pauline Epistles"],
        bio: "Renowned Greek syntactician with 28 years of academic instruction. Passionate about empowering church planters and pastors to read the New Testament in its inspired original tongue.",
        tenureYears: 28
    },
    {
        id: "fac-3",
        name: "Rev. Dr. Joseph M. Santos",
        title: "Dean of Pastoral Studies & Church Multiplication",
        department: "ministry",
        departmentLabel: "Pastoral Studies & Missions",
        degrees: ["D.Min. in Expository Preaching", "M.Div. in Pastoral Ministry", "B.Th."],
        courses: ["Expository Preaching Practicum", "Pastoral Theology & Shepherding", "Principles of Church Planting", "Evangelism & Disciple Making"],
        bio: "Veteran pastor and church planter responsible for 14 daughter church plants. Oversees the Mobile Bible School grassroots modular cohorts across provincial hubs.",
        tenureYears: 24
    },
    {
        id: "fac-4",
        name: "Rev. Josue C. Bautista",
        title: "Seminary Registrar & Professor of Old Testament",
        department: "languages",
        departmentLabel: "Biblical Languages & Exegesis",
        degrees: ["Th.M. in Old Testament Literature", "M.Div. in Hebrew Exegesis", "B.S. Education"],
        courses: ["Biblical Hebrew Grammar", "The Pentateuch & Covenant Theology", "Old Testament Historical Books", "Hebrew Poetry & Wisdom"],
        bio: "Old Testament specialist committed to the historical-grammatical interpretation of the Hebrew Scriptures. Guides students through textual criticism and canonical exegesis.",
        tenureYears: 19
    },
    {
        id: "fac-5",
        name: "Prof. Mary Grace L. Villanueva",
        title: "Dean of Christian Education & Counseling",
        department: "theology",
        departmentLabel: "Systematic & Educational Theology",
        degrees: ["M.Th. in Christian Education", "M.A. in Christian Counseling", "B.Th."],
        courses: ["Christian Education in the Church", "Biblical Counseling & Care", "Family Discipleship", "Curriculum Design"],
        bio: "Over 20 years developing curriculum for theological extensions and Sunday school leadership throughout the Philippines. Advisor for women's ministries and child catechesis.",
        tenureYears: 21
    },
    {
        id: "fac-6",
        name: "Rev. Samuel P. Cruz",
        title: "Director of Field Education & Modular Extensions",
        department: "ministry",
        departmentLabel: "Pastoral Studies & Missions",
        degrees: ["M.Div. in Evangelism & Missions", "D.Min. (cand.) in Urban Ministry", "B.A. Theology"],
        courses: ["Field Ministry Practicum", "Christian Apologetics", "Missions History & Strategy", "Spiritual Formation"],
        bio: "Field director coordinating Mobile Bible School modular weekend sessions across 35 provincial centers. Serves as active church revitalizer and mentor to rural pastors.",
        tenureYears: 16
    }
];

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate, initialTab = "overview" }) => {
    const [activeTab, setActiveTab] = useState<AboutTab>(initialTab);
    const [facultyFilter, setFacultyFilter] = useState<"all" | "leadership" | "languages" | "theology" | "ministry">("all");
    const [expandedArticle, setExpandedArticle] = useState<number | null>(null);

    // Sync activeTab when initialTab prop updates
    useEffect(() => {
        if (initialTab) {
            setActiveTab(initialTab);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [initialTab]);

    // Set page title
    useEffect(() => {
        const titles: Record<AboutTab, string> = {
            overview: "About MBS & Institutional Dossier | Mobile Bible School",
            faith: "Statement of Faith & Doctrinal Articles | Mobile Bible School",
            faculty: "Seminary Faculty & Deans | Mobile Bible School",
            accreditations: "ACTS & CCHE Accreditations & Credentials | Mobile Bible School",
            campuses: "Campus Locations & Regional Facilities | Mobile Bible School"
        };
        document.title = titles[activeTab] || "Mobile Bible School & Theological Seminary";
    }, [activeTab]);

    const navigateTo = (route: string) => {
        if (onNavigate) {
            onNavigate(route);
        } else {
            window.location.href = `/${route}`;
        }
    };

    const handleTabChange = (tab: AboutTab) => {
        setActiveTab(tab);
        window.scrollTo({ top: 380, behavior: "smooth" });
    };

    const filteredFaculty = facultyFilter === "all"
        ? SEMINARY_FACULTY
        : SEMINARY_FACULTY.filter(f => f.department === facultyFilter);

    return (
        <div className="mbs-about-root">
            <PublicHeader onNavigate={onNavigate} />

            {/* ============================================================ */}
            {/* HERO BANNER SECTION                                          */}
            {/* ============================================================ */}
            <section className="mbs-about-hero">
                <div className="mbs-about-hero-bg" />
                <div className="mbs-about-hero-pattern" />

                <div className="mbs-about-hero-container">
                    <div className="mbs-hero-badge-pill">
                        <GraduationCap size={15} className="mbs-badge-icon" />
                        <span>CHRIST-CENTERED THEOLOGICAL EDUCATION • EST. 1986</span>
                    </div>

                    <h1 className="mbs-about-hero-title">
                        Mobile Bible School
                        <span className="mbs-gold-text"> &amp; Theological Seminary</span>
                    </h1>

                    <p className="mbs-about-hero-subtitle">
                        Rooted in verbal plenary biblical inerrancy, sound theological scholarship, expository preaching, and pastoral ministry. Equipping pastors, church planters, and ministers across 40 years of faithful gospel witness.
                    </p>

                    <div className="mbs-hero-trust-chips">
                        <span className="mbs-trust-chip">
                            <CheckCircle2 size={13} color="#F59E0B" />
                            <span>100% Inerrantist Stance</span>
                        </span>
                        <span className="mbs-trust-chip">
                            <ShieldCheck size={13} color="#F59E0B" />
                            <span>ACTS &amp; CCHE Accredited</span>
                        </span>
                        <span className="mbs-trust-chip">
                            <BookOpen size={13} color="#F59E0B" />
                            <span>Original Languages Exegesis</span>
                        </span>
                        <span className="mbs-trust-chip">
                            <MapPin size={13} color="#F59E0B" />
                            <span>35+ Provincial Hubs</span>
                        </span>
                    </div>
                </div>
            </section>

            {/* ============================================================ */}
            {/* LUXURY ACADEMIC DOSSIER NAVIGATION TABS                     */}
            {/* ============================================================ */}
            <div className="mbs-about-nav-strip">
                <div className="mbs-about-nav-container">
                    <button
                        type="button"
                        className={`mbs-dossier-tab ${activeTab === "overview" ? "active" : ""}`}
                        onClick={() => handleTabChange("overview")}
                    >
                        <Landmark size={16} />
                        <span>Institutional Overview</span>
                    </button>

                    <button
                        type="button"
                        className={`mbs-dossier-tab ${activeTab === "faith" ? "active" : ""}`}
                        onClick={() => handleTabChange("faith")}
                    >
                        <ScrollText size={16} />
                        <span>Statement of Faith</span>
                    </button>

                    <button
                        type="button"
                        className={`mbs-dossier-tab ${activeTab === "faculty" ? "active" : ""}`}
                        onClick={() => handleTabChange("faculty")}
                    >
                        <Award size={16} />
                        <span>Faculty &amp; Deans</span>
                    </button>

                    <button
                        type="button"
                        className={`mbs-dossier-tab ${activeTab === "accreditations" ? "active" : ""}`}
                        onClick={() => handleTabChange("accreditations")}
                    >
                        <ShieldCheck size={16} />
                        <span>Accreditations</span>
                    </button>

                    <button
                        type="button"
                        className={`mbs-dossier-tab ${activeTab === "campuses" ? "active" : ""}`}
                        onClick={() => handleTabChange("campuses")}
                    >
                        <MapPin size={16} />
                        <span>Campuses &amp; Centers</span>
                    </button>
                </div>
            </div>

            {/* ============================================================ */}
            {/* TAB CONTENT 1: INSTITUTIONAL OVERVIEW                        */}
            {/* ============================================================ */}
            {activeTab === "overview" && (
                <div className="mbs-tab-pane animate-fade-in">
                    <div className="mbs-content-container">
                        {/* President's Message Card */}
                        <div className="mbs-chancellor-card">
                            <div className="mbs-chancellor-meta">
                                <div className="mbs-crest-box">
                                    <BookOpen size={28} color="#F59E0B" />
                                </div>
                                <div>
                                    <span className="mbs-label-eyebrow">A MESSAGE FROM THE CHANCELLOR</span>
                                    <h3 className="mbs-chancellor-name">Dr. Emmanuel G. Ramos, Th.D.</h3>
                                    <small className="mbs-chancellor-sub">President &amp; Professor of Systematic Theology</small>
                                </div>
                            </div>
                            <blockquote className="mbs-chancellor-quote">
                                &ldquo;The church does not need more programs; it needs preachers of the Word who tremble at God&rsquo;s truth. At Mobile Bible School, we believe theological education should not be confined to elite metropolitan halls—it belongs wherever God calls men and women to shepherd His flock. For four decades, our faculty has brought unyielding biblical fidelity directly to the grassroots, training leaders who preach Christ with exegetical clarity and holy courage.&rdquo;
                            </blockquote>
                            <div className="mbs-scripture-signature">
                                <span>&ldquo;Preach the word; be ready in season and out of season; reprove, rebuke, and exhort, with complete patience and teaching.&rdquo;</span>
                                <strong>— 2 Timothy 4:2</strong>
                            </div>
                        </div>

                        {/* Four Core Pillars */}
                        <div className="mbs-pillars-grid">
                            <div className="mbs-pillar-card">
                                <div className="mbs-pillar-icon-box">
                                    <BookOpen size={22} color="#F59E0B" />
                                </div>
                                <h4>Biblical Inerrancy</h4>
                                <p>We affirm without reservation the verbal plenary inspiration and total inerrancy of Holy Scripture as the sole rule of faith and conduct.</p>
                            </div>

                            <div className="mbs-pillar-card">
                                <div className="mbs-pillar-icon-box">
                                    <ScrollText size={22} color="#F59E0B" />
                                </div>
                                <h4>Expository Rigor</h4>
                                <p>Pastors are trained in Greek and Hebrew grammatical-historical exegesis to preach the full counsel of God with accuracy and authority.</p>
                            </div>

                            <div className="mbs-pillar-card">
                                <div className="mbs-pillar-icon-box">
                                    <GraduationCap size={22} color="#F59E0B" />
                                </div>
                                <h4>Modular Accessibility</h4>
                                <p>Our mobile modular schedule allows bi-vocational pastors and rural church workers to earn accredited degrees without leaving their pulpits.</p>
                            </div>

                            <div className="mbs-pillar-card">
                                <div className="mbs-pillar-icon-box">
                                    <Users size={22} color="#F59E0B" />
                                </div>
                                <h4>Pastoral Mentorship</h4>
                                <p>Every student is paired with experienced senior shepherd-scholars for spiritual accountability, moral formation, and pulpit evaluation.</p>
                            </div>
                        </div>

                        {/* Seminary History & Timeline */}
                        <div className="mbs-history-card">
                            <span className="mbs-label-eyebrow">OUR HERITAGE</span>
                            <h3>Four Decades of Faithful Ministerial Instruction</h3>
                            <p className="mbs-history-desc">
                                Founded in 1986 amidst a profound shortage of formally trained pastors in provincial and rural communities, Mobile Bible School began as a traveling cohort of seasoned pastors and biblical scholars. Carrying commentary libraries and syllabus binders from province to province, the faculty conducted intensive weekend theological modules for local ministers. Today, Mobile Bible School &amp; Theological Seminary has grown into a fully accredited institution with 35 regional centers, a vibrant digital LMS, and thousands of alumni faithfully shepherding congregations worldwide.
                            </p>

                            <div className="mbs-timeline-row">
                                <div className="mbs-timeline-point">
                                    <strong className="mbs-timeline-year">1986</strong>
                                    <span>First mobile pastoral cohort established in Luzon with 28 pioneer pastors.</span>
                                </div>
                                <div className="mbs-timeline-point">
                                    <strong className="mbs-timeline-year">1998</strong>
                                    <span>Main Seminary Campus opened in Metro Manila with a 15,000-volume theological research library.</span>
                                </div>
                                <div className="mbs-timeline-point">
                                    <strong className="mbs-timeline-year">2012</strong>
                                    <span>Full accreditation granted by the Asian Association of Christian Theological Studies (ACTS).</span>
                                </div>
                                <div className="mbs-timeline-point">
                                    <strong className="mbs-timeline-year">2026</strong>
                                    <span>Launch of MBS Theological LMS 3.0, expanding global extension cohorts to international pastors.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* TAB CONTENT 2: STATEMENT OF FAITH & DOCTRINE                 */}
            {/* ============================================================ */}
            {activeTab === "faith" && (
                <div className="mbs-tab-pane animate-fade-in">
                    <div className="mbs-content-container">
                        <div className="mbs-section-intro-card">
                            <div className="mbs-intro-header">
                                <div className="mbs-crest-box">
                                    <ScrollText size={26} color="#F59E0B" />
                                </div>
                                <div>
                                    <span className="mbs-label-eyebrow">CONFESSIONAL STANDARDS</span>
                                    <h2>The Ten Articles of Faith &amp; Doctrine</h2>
                                    <p>
                                        Mobile Bible School &amp; Theological Seminary stands unequivocally within the historic, orthodox evangelical tradition, affirming the full authority of the inerrant Scriptures, the solas of the Protestant Reformation, and the urgent mandate of the Great Commission.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Articles Accordion / Cards List */}
                        <div className="mbs-articles-stack">
                            {ARTICLES_OF_FAITH.map((article, idx) => {
                                const isExpanded = expandedArticle === idx;
                                return (
                                    <div key={article.num} className={`mbs-article-card ${isExpanded ? "expanded" : ""}`}>
                                        <div
                                            className="mbs-article-header"
                                            onClick={() => setExpandedArticle(isExpanded ? null : idx)}
                                        >
                                            <div className="mbs-article-title-col">
                                                <span className="mbs-article-badge">{article.num}</span>
                                                <h3 className="mbs-article-title">{article.title}</h3>
                                                <p className="mbs-article-short">{article.shortSummary}</p>
                                            </div>

                                            <button type="button" className="mbs-article-toggle-btn" aria-label="Toggle article text">
                                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </button>
                                        </div>

                                        {isExpanded && (
                                            <div className="mbs-article-body animate-fade-in">
                                                <div className="mbs-article-divider" />
                                                <p className="mbs-article-full">{article.fullText}</p>

                                                <div className="mbs-scripture-proofs">
                                                    <span className="mbs-proofs-label">Scripture Proofs:</span>
                                                    <div className="mbs-proof-tags">
                                                        {article.scriptures.map(s => (
                                                            <span key={s} className="mbs-proof-pill">
                                                                <BookOpen size={11} />
                                                                <span>{s}</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* TAB CONTENT 3: SEMINARY FACULTY & DEANS                      */}
            {/* ============================================================ */}
            {activeTab === "faculty" && (
                <div className="mbs-tab-pane animate-fade-in">
                    <div className="mbs-content-container">
                        <div className="mbs-section-intro-card">
                            <div className="mbs-intro-header">
                                <div className="mbs-crest-box">
                                    <Award size={26} color="#F59E0B" />
                                </div>
                                <div>
                                    <span className="mbs-label-eyebrow">ACADEMIC ROSTER &amp; CHAIRS</span>
                                    <h2>Seminary Faculty, Deans &amp; Leadership</h2>
                                    <p>
                                        Our distinguished faculty combines high-tier theological scholarship with decades of active pastoral and church-planting experience. Every professor signs the MBS Inerrancy Statement annually and actively shepherds local congregations.
                                    </p>
                                </div>
                            </div>

                            {/* Department Filter Pills */}
                            <div className="mbs-filter-strip">
                                <button
                                    type="button"
                                    className={`mbs-filter-pill ${facultyFilter === "all" ? "active" : ""}`}
                                    onClick={() => setFacultyFilter("all")}
                                >
                                    All Faculty ({SEMINARY_FACULTY.length})
                                </button>
                                <button
                                    type="button"
                                    className={`mbs-filter-pill ${facultyFilter === "leadership" ? "active" : ""}`}
                                    onClick={() => setFacultyFilter("leadership")}
                                >
                                    Executive &amp; Deans
                                </button>
                                <button
                                    type="button"
                                    className={`mbs-filter-pill ${facultyFilter === "languages" ? "active" : ""}`}
                                    onClick={() => setFacultyFilter("languages")}
                                >
                                    Biblical Languages
                                </button>
                                <button
                                    type="button"
                                    className={`mbs-filter-pill ${facultyFilter === "theology" ? "active" : ""}`}
                                    onClick={() => setFacultyFilter("theology")}
                                >
                                    Systematic Theology
                                </button>
                                <button
                                    type="button"
                                    className={`mbs-filter-pill ${facultyFilter === "ministry" ? "active" : ""}`}
                                    onClick={() => setFacultyFilter("ministry")}
                                >
                                    Pastoral Practice
                                </button>
                            </div>
                        </div>

                        {/* Faculty Grid */}
                        <div className="mbs-faculty-grid">
                            {filteredFaculty.map(fac => (
                                <div key={fac.id} className="mbs-faculty-card">
                                    <div className="mbs-faculty-header">
                                        <div className="mbs-faculty-avatar-box">
                                            <span className="mbs-faculty-initials">
                                                {fac.name.split(" ").filter(p => !p.includes(".")).map(n => n[0]).slice(0, 2).join("")}
                                            </span>
                                        </div>
                                        <div className="mbs-faculty-identity">
                                            <span className="mbs-dept-badge">{fac.departmentLabel}</span>
                                            <h3 className="mbs-faculty-name">{fac.name}</h3>
                                            <p className="mbs-faculty-title">{fac.title}</p>
                                        </div>
                                    </div>

                                    <p className="mbs-faculty-bio">{fac.bio}</p>

                                    <div className="mbs-faculty-section">
                                        <span className="mbs-section-subhead">DEGREES &amp; ALMA MATER</span>
                                        <ul className="mbs-degrees-list">
                                            {fac.degrees.map((deg, i) => (
                                                <li key={i}>{deg}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="mbs-faculty-section">
                                        <span className="mbs-section-subhead">COURSES TAUGHT</span>
                                        <div className="mbs-courses-tags">
                                            {fac.courses.map((c, i) => (
                                                <span key={i} className="mbs-course-tag">{c}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mbs-faculty-footer">
                                        <span className="mbs-tenure-tag">
                                            <Clock size={12} />
                                            <span>{fac.tenureYears}+ Years Ministry Tenure</span>
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* TAB CONTENT 4: ACCREDITATIONS & RECOGNITION                  */}
            {/* ============================================================ */}
            {activeTab === "accreditations" && (
                <div className="mbs-tab-pane animate-fade-in">
                    <div className="mbs-content-container">
                        <div className="mbs-section-intro-card">
                            <div className="mbs-intro-header">
                                <div className="mbs-crest-box">
                                    <ShieldCheck size={26} color="#F59E0B" />
                                </div>
                                <div>
                                    <span className="mbs-label-eyebrow">INSTITUTIONAL VALIDATION</span>
                                    <h2>Academic Accreditations, Recognition &amp; Charters</h2>
                                    <p>
                                        Mobile Bible School &amp; Theological Seminary adheres to high institutional standards of academic excellence and ministerial accountability. Our curriculum and degree programs are fully vetted and recognized for ministerial ordination and graduate transferability.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Accreditation Cards */}
                        <div className="mbs-accredit-grid">
                            <div className="mbs-accredit-card">
                                <div className="mbs-accredit-badge">FULL ACCREDITATION</div>
                                <h3>Asian Association of Christian Theological Studies (ACTS)</h3>
                                <p className="mbs-accredit-desc">
                                    Mobile Bible School holds full accredited institutional member status under the Asian Association of Christian Theological Studies (ACTS). Accreditation certifies that our academic degrees (DPS, B.Th., M.Min., M.Th.) fulfill comprehensive faculty qualifications, library holdings, curricular depth, and spiritual formation benchmarks.
                                </p>
                                <div className="mbs-accredit-meta">
                                    <span className="mbs-meta-item"><strong>Accreditation No:</strong> #ACTS-SEM-2024-8891</span>
                                    <span className="mbs-meta-item"><strong>Status:</strong> Accredited with Highest Distinction</span>
                                    <span className="mbs-meta-item"><strong>Next Review:</strong> Academic Year 2030</span>
                                </div>
                            </div>

                            <div className="mbs-accredit-card">
                                <div className="mbs-accredit-badge">RECOGNIZED INSTITUTION</div>
                                <h3>Commission on Christian Higher Education (CCHE)</h3>
                                <p className="mbs-accredit-desc">
                                    Recognized by the Commission on Christian Higher Education (CCHE), ensuring that our diploma, undergraduate, and graduate programs comply with pedagogical standards recognized by tertiary evangelical colleges and pastoral fellowships across the country.
                                </p>
                                <div className="mbs-accredit-meta">
                                    <span className="mbs-meta-item"><strong>Institutional Seal:</strong> CCHE Validated</span>
                                    <span className="mbs-meta-item"><strong>Level:</strong> Graduate Seminary Charter</span>
                                    <span className="mbs-meta-item"><strong>Curriculum:</strong> Classical Biblical Exegesis</span>
                                </div>
                            </div>
                        </div>

                        {/* Ordination & Transferability Card */}
                        <div className="mbs-transfer-card">
                            <div className="mbs-transfer-header">
                                <GraduationCap size={24} color="#F59E0B" />
                                <div>
                                    <h4>Ordination &amp; Graduate Credit Transferability</h4>
                                    <p>Degrees awarded by Mobile Bible School &amp; Theological Seminary qualify graduates for formal ordination examinations and pastoral credentialing.</p>
                                </div>
                            </div>

                            <div className="mbs-transfer-points">
                                <div className="mbs-transfer-col">
                                    <h5>Denominational Acceptance</h5>
                                    <p>Recognized by major evangelical denominations, Baptist associations, Reformed councils, and independent missionary boards throughout Asia and North America.</p>
                                </div>
                                <div className="mbs-transfer-col">
                                    <h5>Official Transcripts</h5>
                                    <p>The Registrar Office issues official sealed transcripts, English translations, and credential certificates for advanced seminary applications and chaplaincy verification.</p>
                                </div>
                                <div className="mbs-transfer-col">
                                    <h5>Academic Integrity</h5>
                                    <p>All credit hours require rigorous classroom lecture attendance, exegetical research papers, Greek/Hebrew translation drills, and supervised field ministry practicums.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* TAB CONTENT 5: CAMPUSES & REGIONAL FACILITIES                */}
            {/* ============================================================ */}
            {activeTab === "campuses" && (
                <div className="mbs-tab-pane animate-fade-in">
                    <div className="mbs-content-container">
                        <div className="mbs-section-intro-card">
                            <div className="mbs-intro-header">
                                <div className="mbs-crest-box">
                                    <MapPin size={26} color="#F59E0B" />
                                </div>
                                <div>
                                    <span className="mbs-label-eyebrow">CENTERS &amp; TRAINING FACILITIES</span>
                                    <h2>Main Campus &amp; Provincial Extension Hubs</h2>
                                    <p>
                                        Mobile Bible School operates an integrated network of learning environments: our Metro Manila Headquarters, 35 regional modular hubs across Luzon, Visayas, and Mindanao, and the MBS Global Online Extension.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Main Campus Feature Card */}
                        <div className="mbs-main-campus-card">
                            <div className="mbs-campus-head">
                                <div className="mbs-campus-badge">MAIN INSTITUTIONAL HEADQUARTERS</div>
                                <h3>Metro Manila Seminary Campus &amp; Library Commons</h3>
                                <p className="mbs-campus-location">
                                    <MapPin size={14} color="#F59E0B" />
                                    <span>Main Seminary Campus • Metro Manila, Philippines</span>
                                </p>
                            </div>

                            <p className="mbs-campus-narrative">
                                The main seminary complex houses the Central Academic Administration, the Dean&rsquo;s Office, the Registrar, the 500-seat Grand Chapel Auditorium, multimedia recording lecture halls, and the John Bunyan Theological Library containing more than 15,000 cataloged commentaries, concordances, journals, and microfiche archives.
                            </p>

                            <div className="mbs-facilities-grid">
                                <div className="mbs-facility-item">
                                    <Landmark size={18} color="#F59E0B" />
                                    <div>
                                        <strong>500-Seat Chapel Auditorium</strong>
                                        <small>Weekly chapel worship, ordination convocations, and annual pastor colloquiums.</small>
                                    </div>
                                </div>
                                <div className="mbs-facility-item">
                                    <BookOpen size={18} color="#F59E0B" />
                                    <div>
                                        <strong>Theological Research Library</strong>
                                        <small>15,000+ print volumes, ATLA Religion Database access, and Greek/Hebrew study desks.</small>
                                    </div>
                                </div>
                                <div className="mbs-facility-item">
                                    <Building2 size={18} color="#F59E0B" />
                                    <div>
                                        <strong>Multimedia Lecture Halls</strong>
                                        <small>Four smart lecture halls equipped with HD streaming cameras for modular broadcasts.</small>
                                    </div>
                                </div>
                                <div className="mbs-facility-item">
                                    <Users size={18} color="#F59E0B" />
                                    <div>
                                        <strong>Admissions &amp; Registrar Center</strong>
                                        <small>Full student services, student records, enrollment counseling, and bookshop.</small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Regional Hubs Cards */}
                        <div className="mbs-regional-grid">
                            <div className="mbs-regional-card">
                                <span className="mbs-region-badge">LUZON PROVINCIAL CENTERS</span>
                                <h4>Luzon Modular Extension Centers</h4>
                                <p>Monthly pastoral intensives conducted by traveling resident professors.</p>
                                <ul className="mbs-hub-list">
                                    <li><strong>Baguio City &amp; Cordillera Hub:</strong> Serving Northern Luzon pastors</li>
                                    <li><strong>Dagupan City (Pangasinan):</strong> Central Plains Regional Training Hub</li>
                                    <li><strong>San Fernando (Pampanga):</strong> Central Luzon Ministerial Center</li>
                                    <li><strong>Lipa City (Batangas):</strong> Southern Tagalog &amp; Bicol Extension</li>
                                </ul>
                            </div>

                            <div className="mbs-regional-card">
                                <span className="mbs-region-badge">VISAYAS &amp; MINDANAO CENTERS</span>
                                <h4>Visayas &amp; Mindanao Extension Hubs</h4>
                                <p>Equipping pastors across the central and southern islands with sound doctrine.</p>
                                <ul className="mbs-hub-list">
                                    <li><strong>Cebu City Central Hub:</strong> Regional Headquarters for Central Visayas</li>
                                    <li><strong>Iloilo &amp; Bacolod Hubs:</strong> Panay &amp; Negros Island Pastoral Cohorts</li>
                                    <li><strong>Davao City Seminary Center:</strong> Serving Southern Mindanao</li>
                                    <li><strong>Cagayan de Oro Center:</strong> Northern Mindanao &amp; Caraga pastoral students</li>
                                </ul>
                            </div>
                        </div>

                        {/* Online Extension */}
                        <div className="mbs-online-ext-card">
                            <div className="mbs-online-icon-box">
                                <Globe size={26} color="#F59E0B" />
                            </div>
                            <div className="mbs-online-text">
                                <h4>MBS Global Online Extension (Theological LMS 3.0)</h4>
                                <p>
                                    For international pastors and overseas church workers unable to attend physical modular sessions, our full curriculum is accessible via our secure, high-definition online classroom platform.
                                </p>
                            </div>
                            <button
                                type="button"
                                className="mbs-btn-online-portal"
                                onClick={() => navigateTo("learning")}
                            >
                                <span>Access LMS Platform</span>
                                <ArrowRight size={15} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* CALL TO ACTION BANNER                                        */}
            {/* ============================================================ */}
            <section className="mbs-about-cta-section">
                <div className="mbs-cta-inner">
                    <span className="mbs-cta-pill">ACCREDITED THEOLOGICAL FORMATION</span>
                    <h2>Called to Preach the Uncompromising Word?</h2>
                    <p>
                        Whether you are an aspiring minister seeking formal ordination, a bi-vocational church planter, or an active pastor desiring deeper exegetical precision, Mobile Bible School welcomes your application.
                    </p>
                    <div className="mbs-cta-buttons">
                        <button
                            type="button"
                            className="mbs-btn-cta-primary"
                            onClick={() => navigateTo("home")}
                        >
                            <span>Apply for Admission</span>
                            <ArrowRight size={16} />
                        </button>
                        <button
                            type="button"
                            className="mbs-btn-cta-secondary"
                            onClick={() => navigateTo("contact")}
                        >
                            <span>Speak with Admissions Registrar</span>
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
