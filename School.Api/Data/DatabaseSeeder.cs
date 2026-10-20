using Microsoft.EntityFrameworkCore;
using School.Api.Models;

namespace School.Api.Data
{
    public static class DatabaseSeeder
    {
        // =============================================================
        // SUBSCRIPTION PLANS
        // =============================================================

        public static async Task SeedSubscriptionPlansAsync(
            ApplicationDbContext context)
        {
            var plans = new[]
            {
                new SubscriptionPlan
                {
                    PlanName = "EPIC Starter",
                    Description = "Essential church management tools for growing churches.",
                    MonthlyPrice = 999m,
                    AnnualPrice = 9990m,
                    TrialDays = 0,
                    MaxUsers = 5,
                    MaxMembers = 500,
                    IncludesChurchManagement = true,
                    IncludesAttendance = true,
                    IncludesGiving = true,
                    IncludesFinance = true,
                    IncludesMinistries = true,
                    IncludesEvents = true,
                    IncludesEPICLearning = false,
                    IncludesReports = true,
                    IsActive = true,
                    SortOrder = 1
                },

                new SubscriptionPlan
                {
                    PlanName = "EPIC Growth",
                    Description = "The complete church management solution for active ministries.",
                    MonthlyPrice = 1999m,
                    AnnualPrice = 19990m,
                    TrialDays = 0,
                    MaxUsers = 10,
                    MaxMembers = 2000,
                    IncludesChurchManagement = true,
                    IncludesAttendance = true,
                    IncludesGiving = true,
                    IncludesFinance = true,
                    IncludesMinistries = true,
                    IncludesEvents = true,
                    IncludesEPICLearning = true,
                    IncludesReports = true,
                    IsActive = true,
                    SortOrder = 2
                },

                new SubscriptionPlan
                {
                    PlanName = "EPIC Complete",
                    Description = "The full digital church ecosystem with discipleship and advanced tools.",
                    MonthlyPrice = 2999m,
                    AnnualPrice = 29990m,
                    TrialDays = 0,
                    MaxUsers = 25,
                    MaxMembers = 5000,
                    IncludesChurchManagement = true,
                    IncludesAttendance = true,
                    IncludesGiving = true,
                    IncludesFinance = true,
                    IncludesMinistries = true,
                    IncludesEvents = true,
                    IncludesEPICLearning = true,
                    IncludesReports = true,
                    IsActive = true,
                    SortOrder = 3
                }
            };

            foreach (var seed in plans)
            {
                var existing = await context.SubscriptionPlans
                    .FirstOrDefaultAsync(p =>
                        p.PlanName.ToLower() ==
                        seed.PlanName.ToLower());

                if (existing == null)
                {
                    seed.CreatedDate = DateTime.UtcNow;

                    context.SubscriptionPlans.Add(seed);

                    Console.WriteLine(
                        $"Created subscription plan: {seed.PlanName}");
                }
                else
                {
                    Console.WriteLine(
                        $"Subscription plan already exists: {existing.PlanName}");
                }
            }

            await context.SaveChangesAsync();
        }


        // =============================================================
        // ADMIN USER
        // =============================================================

        public static async Task SeedAdminUserAsync(
            ApplicationDbContext context)
        {
            var existingUser = await context.Users
                .FirstOrDefaultAsync(u =>
                    u.Username == "admin");

            if (existingUser != null)
            {
                Console.WriteLine(
                    "Admin user already exists.");

                return;
            }

            var adminRole = await context.Roles
      .FirstOrDefaultAsync(r => r.RoleName.ToUpper() == "ADMIN");

            if (adminRole == null)
            {
                adminRole = new Role
                {
                    RoleName = "ADMIN",
                    Description = "System Administrator",
                    IsActive = true,
                    CreatedDate = DateTime.Now
                };

                context.Roles.Add(adminRole);
                await context.SaveChangesAsync();
            }

            var admin = await context.Users
                .FirstOrDefaultAsync(u => u.Username.ToLower() == "admin");

            if (admin == null)
            {
                admin = new User
                {
                    Username = "admin",
                    Email = "admin@school.com",
                    FullName = "System Administrator",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("kezjed201610@@"),
                    RoleId = adminRole.RoleId,
                    IsActive = true,
                    ApprovalStatus = "APPROVED",
                    AccountType = "SYSTEM",
                    CreatedDate = DateTime.Now
                };

                context.Users.Add(admin);
            }
            else
            {
                admin.RoleId = adminRole.RoleId;
                admin.IsActive = true;
                admin.ApprovalStatus = "APPROVED";
                admin.AccountType = "SYSTEM";
            }

            await context.SaveChangesAsync();
        }


        // =============================================================
        // COURSE 1 SEEDING
        // =============================================================

        public static async Task SeedCourse1Async(
            ApplicationDbContext context)
        {
            var course = await context.Courses
                .FirstOrDefaultAsync(c =>
                    c.CourseId == 1);

            if (course == null)
            {
                Console.WriteLine(
                    "CourseId 1 was not found. Course seed skipped.");

                return;
            }

            Console.WriteLine(
                $"Seeding lessons for Course 1: {course.Title}");


            // =========================================================
            // MODULE DATA
            // =========================================================

            var modules = new[]
            {
                new ModuleSeed
                {
                    SortOrder = 1,
                    Title = "Foundations of Faith",
                    Description =
                        "Understanding the essential foundations of Christian faith and discipleship."
                },

                new ModuleSeed
                {
                    SortOrder = 2,
                    Title = "Knowing God",
                    Description =
                        "Discovering who God is, His character, and how believers can know Him personally."
                },

                new ModuleSeed
                {
                    SortOrder = 3,
                    Title = "Knowing Jesus Christ",
                    Description =
                        "Exploring the person, work, identity, death, resurrection, and lordship of Jesus Christ."
                },

                new ModuleSeed
                {
                    SortOrder = 4,
                    Title = "The Holy Spirit",
                    Description =
                        "Understanding the person and work of the Holy Spirit in the life of a believer."
                },

                new ModuleSeed
                {
                    SortOrder = 5,
                    Title = "The Word of God",
                    Description =
                        "Learning how to understand, study, apply, and live according to God's Word."
                },

                new ModuleSeed
                {
                    SortOrder = 6,
                    Title = "Prayer and Spiritual Growth",
                    Description =
                        "Developing a consistent prayer life and growing deeper in relationship with God."
                },

                new ModuleSeed
                {
                    SortOrder = 7,
                    Title = "Christian Character",
                    Description =
                        "Developing Christlike character, integrity, obedience, love, humility, and holiness."
                },

                new ModuleSeed
                {
                    SortOrder = 8,
                    Title = "Life in the Church",
                    Description =
                        "Understanding Christian fellowship, worship, service, community, and accountability."
                },

                new ModuleSeed
                {
                    SortOrder = 9,
                    Title = "Sharing the Gospel",
                    Description =
                        "Learning how to communicate the Gospel and become an effective witness for Christ."
                },

                new ModuleSeed
                {
                    SortOrder = 10,
                    Title = "Living as a Disciple",
                    Description =
                        "Putting discipleship into practice through mission, service, leadership, and lifelong growth."
                }
            };


            // =========================================================
            // CREATE / FIND MODULES
            // =========================================================

            var moduleEntities =
                new Dictionary<int, CourseModule>();

            foreach (var moduleSeed in modules)
            {
                var module = await context.CourseModules
                    .FirstOrDefaultAsync(m =>
                        m.CourseId == course.CourseId &&
                        m.SortOrder == moduleSeed.SortOrder);

                if (module == null)
                {
                    module = new CourseModule
                    {
                        CourseId = course.CourseId,

                        Title = moduleSeed.Title,

                        Description = moduleSeed.Description,

                        SortOrder = moduleSeed.SortOrder,

                        IsPublished = true
                    };

                    context.CourseModules.Add(module);

                    await context.SaveChangesAsync();

                    Console.WriteLine(
                        $"Created Module {module.SortOrder}: {module.Title}");
                }
                else
                {
                    Console.WriteLine(
                        $"Existing Module {module.SortOrder}: {module.Title}");
                }

                moduleEntities[moduleSeed.SortOrder] = module;
            }


            // =========================================================
            // LESSON DATA
            // =========================================================

            var lessonGroups =
                new Dictionary<int, LessonSeed[]>
                {
                    // =====================================================
                    // MODULE 1
                    // =====================================================

                    [1] = new[]
                    {
                        new LessonSeed
                        {
                            SortOrder = 1,
                            Title = "What Is Christian Discipleship?",
                            Content = @"
<h2>What Is Christian Discipleship?</h2>

<p>
Christian discipleship is the lifelong process of following Jesus Christ,
learning His teachings, becoming more like Him, and helping others follow Him.
</p>

<p>
A disciple does not simply know about Jesus. A disciple chooses to follow Jesus
and allow His Word to transform every area of life.
</p>

<h3>Key Scriptures</h3>

<ul>
<li>Matthew 28:19-20</li>
<li>Luke 9:23</li>
<li>John 8:31-32</li>
</ul>

<h3>Application</h3>

<p>
Ask yourself: Am I simply attending church, or am I actively following Jesus?
</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 2,
                            Title = "Salvation Through Jesus Christ",
                            Content = @"
<h2>Salvation Through Jesus Christ</h2>

<p>
Salvation is God's gift made possible through the death and resurrection of
Jesus Christ. We are saved by grace through faith.
</p>

<h3>Key Scriptures</h3>

<ul>
<li>John 3:16</li>
<li>Ephesians 2:8-9</li>
<li>Romans 10:9-10</li>
</ul>

<p>
True faith produces a transformed life and a desire to follow Christ.
</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 3,
                            Title = "Repentance and Faith",
                            Content = @"
<h2>Repentance and Faith</h2>

<p>
Repentance means turning away from sin and turning toward God. Faith means
trusting completely in Jesus Christ and His finished work.
</p>

<h3>Key Scriptures</h3>

<ul>
<li>Acts 3:19</li>
<li>Mark 1:15</li>
<li>2 Corinthians 5:17</li>
</ul>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 4,
                            Title = "The New Life in Christ",
                            Content = @"
<h2>The New Life in Christ</h2>

<p>
When a person comes to Christ, God begins a new work in that person's life.
The believer is called to leave the old life and walk in the new life.
</p>

<h3>Key Scriptures</h3>

<ul>
<li>2 Corinthians 5:17</li>
<li>Galatians 2:20</li>
<li>Romans 6:4</li>
</ul>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 5,
                            Title = "Faith That Produces Action",
                            Content = @"
<h2>Faith That Produces Action</h2>

<p>
Biblical faith is demonstrated through obedience. A growing disciple does not
only hear God's Word but puts it into practice.
</p>

<h3>Key Scriptures</h3>

<ul>
<li>James 2:17</li>
<li>Matthew 7:24</li>
<li>John 14:15</li>
</ul>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 6,
                            Title = "Counting the Cost of Following Jesus",
                            Content = @"
<h2>Counting the Cost of Following Jesus</h2>

<p>
Following Jesus requires surrender, obedience, perseverance, and commitment.
Jesus calls His disciples to deny themselves, take up their cross, and follow Him.
</p>

<h3>Key Scripture</h3>

<p>Luke 9:23</p>",
                            EstimatedMinutes = 20
                        }
                    },


                    // =====================================================
                    // MODULE 2
                    // =====================================================

                    [2] = new[]
                    {
                        new LessonSeed
                        {
                            SortOrder = 1,
                            Title = "Who Is God?",
                            Content = @"
<h2>Who Is God?</h2>
<p>
God is the eternal Creator, holy, righteous, loving, and sovereign over all creation.
</p>
<p><strong>Key Scriptures:</strong> Genesis 1:1; Psalm 90:2; Isaiah 40:28.</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 2,
                            Title = "The Character of God",
                            Content = @"
<h2>The Character of God</h2>
<p>
God is loving, faithful, merciful, righteous, just, holy, and trustworthy.
Understanding His character helps believers trust Him.
</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 3,
                            Title = "God as Creator",
                            Content = @"
<h2>God as Creator</h2>
<p>
Everything exists because God created it. Creation demonstrates His power and wisdom.
</p>
<p><strong>Key Scripture:</strong> Genesis 1:1.</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 4,
                            Title = "God's Love",
                            Content = @"
<h2>God's Love</h2>
<p>
God's love is demonstrated most clearly through Jesus Christ.
</p>
<p><strong>Key Scripture:</strong> John 3:16.</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 5,
                            Title = "Trusting God",
                            Content = @"
<h2>Trusting God</h2>
<p>
Believers are called to trust God even when circumstances are difficult or unclear.
</p>
<p><strong>Key Scripture:</strong> Proverbs 3:5-6.</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 6,
                            Title = "Knowing God Personally",
                            Content = @"
<h2>Knowing God Personally</h2>
<p>
God desires a personal relationship with His people through Jesus Christ,
prayer, Scripture, worship, and obedience.
</p>",
                            EstimatedMinutes = 20
                        }
                    },


                    // =====================================================
                    // MODULE 3
                    // =====================================================

                    [3] = new[]
                    {
                        new LessonSeed
                        {
                            SortOrder = 1,
                            Title = "Who Is Jesus Christ?",
                            Content = @"
<h2>Who Is Jesus Christ?</h2>
<p>
Jesus Christ is the Son of God, Savior, Lord, and the center of the Christian faith.
</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 2,
                            Title = "The Divinity of Jesus",
                            Content = @"
<h2>The Divinity of Jesus</h2>
<p>
Jesus is fully divine and fully human. His identity is central to the Gospel.
</p>
<p><strong>Key Scriptures:</strong> John 1:1; John 1:14.</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 3,
                            Title = "The Humanity of Jesus",
                            Content = @"
<h2>The Humanity of Jesus</h2>
<p>
Jesus became truly human and experienced hunger, tiredness, suffering, and temptation,
yet remained without sin.
</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 4,
                            Title = "The Death of Jesus",
                            Content = @"
<h2>The Death of Jesus</h2>
<p>
Jesus willingly died on the cross to provide forgiveness and reconciliation with God.
</p>
<p><strong>Key Scripture:</strong> 1 Peter 2:24.</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 5,
                            Title = "The Resurrection of Jesus",
                            Content = @"
<h2>The Resurrection of Jesus</h2>
<p>
Jesus physically rose from the dead. His resurrection is the foundation of Christian hope.
</p>
<p><strong>Key Scripture:</strong> 1 Corinthians 15:3-4.</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 6,
                            Title = "Jesus as Lord",
                            Content = @"
<h2>Jesus as Lord</h2>
<p>
Jesus is Lord over every area of life. Following Him means submitting to His authority.
</p>
<p><strong>Key Scripture:</strong> Philippians 2:9-11.</p>",
                            EstimatedMinutes = 20
                        }
                    },


                    // =====================================================
                    // MODULE 4
                    // =====================================================

                    [4] = new[]
                    {
                        new LessonSeed
                        {
                            SortOrder = 1,
                            Title = "Who Is the Holy Spirit?",
                            Content = @"
<h2>Who Is the Holy Spirit?</h2>
<p>
The Holy Spirit is the third Person of the Trinity and is actively involved
in the life of every believer.
</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 2,
                            Title = "The Work of the Holy Spirit",
                            Content = @"
<h2>The Work of the Holy Spirit</h2>
<p>
The Holy Spirit convicts, teaches, guides, empowers, comforts, and transforms believers.
</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 3,
                            Title = "Walking in the Spirit",
                            Content = @"
<h2>Walking in the Spirit</h2>
<p>
Believers are called to allow the Holy Spirit to guide their daily decisions and conduct.
</p>
<p><strong>Key Scripture:</strong> Galatians 5:16.</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 4,
                            Title = "The Fruit of the Spirit",
                            Content = @"
<h2>The Fruit of the Spirit</h2>
<p>
The Holy Spirit produces Christlike character in believers.
</p>
<p>
Love, joy, peace, patience, kindness, goodness, faithfulness,
gentleness, and self-control are described in Galatians 5:22-23.
</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 5,
                            Title = "Spiritual Gifts",
                            Content = @"
<h2>Spiritual Gifts</h2>
<p>
God gives spiritual gifts to believers so that they can serve others
and strengthen the church.
</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 6,
                            Title = "Being Filled With the Spirit",
                            Content = @"
<h2>Being Filled With the Spirit</h2>
<p>
Believers should continually surrender themselves to the Holy Spirit
and allow Him to influence their lives.
</p>",
                            EstimatedMinutes = 20
                        }
                    },


                    // =====================================================
                    // MODULE 5
                    // =====================================================

                    [5] = new[]
                    {
                        new LessonSeed
                        {
                            SortOrder = 1,
                            Title = "What Is the Bible?",
                            Content = @"
<h2>What Is the Bible?</h2>
<p>
The Bible is God's written Word and the primary authority for Christian faith and life.
</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 2,
                            Title = "The Authority of Scripture",
                            Content = @"
<h2>The Authority of Scripture</h2>
<p>
Scripture provides God's truth and guidance for believers.
</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 3,
                            Title = "How to Read the Bible",
                            Content = @"
<h2>How to Read the Bible</h2>
<p>
Read Scripture prayerfully, carefully, in context, and with a desire to obey what God teaches.
</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 4,
                            Title = "How to Study the Bible",
                            Content = @"
<h2>How to Study the Bible</h2>
<p>
Bible study involves observation, interpretation, application, prayer, and reflection.
</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 5,
                            Title = "Applying God's Word",
                            Content = @"
<h2>Applying God's Word</h2>
<p>
Knowing Scripture is not enough. Believers must put God's Word into practice.
</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 6,
                            Title = "Living by God's Word",
                            Content = @"
<h2>Living by God's Word</h2>
<p>
A disciple allows Scripture to shape beliefs, attitudes, decisions, relationships,
and everyday behavior.
</p>",
                            EstimatedMinutes = 20
                        }
                    },


                    // =====================================================
                    // MODULE 6
                    // =====================================================

                    [6] = new[]
                    {
                        new LessonSeed
                        {
                            SortOrder = 1,
                            Title = "What Is Prayer?",
                            Content = @"
<h2>What Is Prayer?</h2>
<p>
Prayer is communication with God. It includes worship, thanksgiving,
confession, requests, and listening.
</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 2,
                            Title = "The Lord's Prayer",
                            Content = @"
<h2>The Lord's Prayer</h2>
<p>
Jesus gave His disciples a model for prayer in Matthew 6:9-13.
</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 3,
                            Title = "Praying With Faith",
                            Content = @"
<h2>Praying With Faith</h2>
<p>
Believers should approach God with confidence while submitting their desires to His will.
</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 4,
                            Title = "Prayer and God's Will",
                            Content = @"
<h2>Prayer and God's Will</h2>
<p>
Prayer is not about forcing God to do what we want. It is about aligning our hearts with His will.
</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 5,
                            Title = "Developing a Prayer Life",
                            Content = @"
<h2>Developing a Prayer Life</h2>
<p>
Consistent prayer requires discipline, time, sincerity, and persistence.
</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 6,
                            Title = "Growing Spiritually",
                            Content = @"
<h2>Growing Spiritually</h2>
<p>
Spiritual growth happens through Scripture, prayer, worship, fellowship,
service, obedience, and dependence on God.
</p>",
                            EstimatedMinutes = 20
                        }
                    },


                    // =====================================================
                    // MODULE 7
                    // =====================================================

                    [7] = new[]
                    {
                        new LessonSeed
                        {
                            SortOrder = 1,
                            Title = "Christlike Character",
                            Content = @"
<h2>Christlike Character</h2>
<p>
Disciples are called to become increasingly like Jesus in character and conduct.
</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 2,
                            Title = "Integrity",
                            Content = @"
<h2>Integrity</h2>
<p>
Integrity means living consistently with God's truth even when nobody is watching.
</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 3,
                            Title = "Humility",
                            Content = @"
<h2>Humility</h2>
<p>
Jesus demonstrated humility by serving others and placing God's will above His own.
</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 4,
                            Title = "Love and Forgiveness",
                            Content = @"
<h2>Love and Forgiveness</h2>
<p>
Christians are commanded to love others and forgive as they have been forgiven by God.
</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 5,
                            Title = "Holiness",
                            Content = @"
<h2>Holiness</h2>
<p>
God calls His people to live holy lives that reflect His character.
</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 6,
                            Title = "Obedience",
                            Content = @"
<h2>Obedience</h2>
<p>
Obedience demonstrates love for God and trust in His Word.
</p>",
                            EstimatedMinutes = 20
                        }
                    },


                    // =====================================================
                    // MODULE 8
                    // =====================================================

                    [8] = new[]
                    {
                        new LessonSeed
                        {
                            SortOrder = 1,
                            Title = "What Is the Church?",
                            Content = @"
<h2>What Is the Church?</h2>
<p>
The church is the community of believers who belong to Jesus Christ.
</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 2,
                            Title = "Christian Fellowship",
                            Content = @"
<h2>Christian Fellowship</h2>
<p>
Believers need one another for encouragement, accountability, prayer, and spiritual growth.
</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 3,
                            Title = "Worship",
                            Content = @"
<h2>Worship</h2>
<p>
Worship is responding to God's worth through our words, actions, attitudes, and lives.
</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 4,
                            Title = "Serving in the Church",
                            Content = @"
<h2>Serving in the Church</h2>
<p>
Every believer can contribute to the body of Christ through service.
</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 5,
                            Title = "Unity in the Church",
                            Content = @"
<h2>Unity in the Church</h2>
<p>
Christians are called to preserve unity, love one another, and work together for God's mission.
</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 6,
                            Title = "Accountability and Community",
                            Content = @"
<h2>Accountability and Community</h2>
<p>
Healthy Christian community helps believers remain faithful and continue growing.
</p>",
                            EstimatedMinutes = 20
                        }
                    },


                    // =====================================================
                    // MODULE 9
                    // =====================================================

                    [9] = new[]
                    {
                        new LessonSeed
                        {
                            SortOrder = 1,
                            Title = "What Is the Gospel?",
                            Content = @"
<h2>What Is the Gospel?</h2>
<p>
The Gospel is the good news that Jesus Christ died for our sins,
was buried, and rose again.
</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 2,
                            Title = "Why We Need the Gospel",
                            Content = @"
<h2>Why We Need the Gospel</h2>
<p>
Sin separates humanity from God, but Jesus provides forgiveness and reconciliation.
</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 3,
                            Title = "Sharing Your Testimony",
                            Content = @"
<h2>Sharing Your Testimony</h2>
<p>
Every believer can share how God has worked in his or her life.
</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 4,
                            Title = "Being a Witness",
                            Content = @"
<h2>Being a Witness</h2>
<p>
Jesus calls His followers to be witnesses through both their words and their lives.
</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 5,
                            Title = "Evangelism With Love",
                            Content = @"
<h2>Evangelism With Love</h2>
<p>
The Gospel should be communicated truthfully, respectfully, compassionately,
and with genuine love for people.
</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 6,
                            Title = "Making Disciples",
                            Content = @"
<h2>Making Disciples</h2>
<p>
Jesus commanded His followers to make disciples of all nations and teach them to obey His commands.
</p>",
                            EstimatedMinutes = 20
                        }
                    },


                    // =====================================================
                    // MODULE 10
                    // =====================================================

                    [10] = new[]
                    {
                        new LessonSeed
                        {
                            SortOrder = 1,
                            Title = "The Mission of a Disciple",
                            Content = @"
<h2>The Mission of a Disciple</h2>
<p>
Every disciple has a mission to know Christ, follow Christ, serve others,
and make disciples.
</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 2,
                            Title = "Serving Others",
                            Content = @"
<h2>Serving Others</h2>
<p>
Christian leadership begins with serving others with humility and love.
</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 3,
                            Title = "Christian Leadership",
                            Content = @"
<h2>Christian Leadership</h2>
<p>
Christian leaders influence others by example, character, service,
wisdom, and faithfulness.
</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 4,
                            Title = "Discipleship in Everyday Life",
                            Content = @"
<h2>Discipleship in Everyday Life</h2>
<p>
Following Jesus is not limited to church activities. Discipleship affects
family, work, relationships, finances, decisions, and priorities.
</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 5,
                            Title = "Persevering in Faith",
                            Content = @"
<h2>Persevering in Faith</h2>
<p>
Faithfulness requires continuing to follow Jesus even during difficulties,
trials, disappointments, and opposition.
</p>",
                            EstimatedMinutes = 20
                        },

                        new LessonSeed
                        {
                            SortOrder = 6,
                            Title = "A Lifelong Disciple",
                            Content = @"
<h2>A Lifelong Disciple</h2>
<p>
Christian discipleship is a lifelong journey of knowing Christ,
becoming like Christ, serving Christ, and helping others follow Christ.
</p>

<h3>Final Challenge</h3>

<p>
Continue growing. Continue serving. Continue learning.
Continue following Jesus faithfully.
</p>",
                            EstimatedMinutes = 20
                        }
                    }
                };


            // =========================================================
            // CREATE LESSONS
            // =========================================================

            foreach (var moduleSeed in modules)
            {
                var module =
                    moduleEntities[moduleSeed.SortOrder];

                if (!lessonGroups.TryGetValue(
                    moduleSeed.SortOrder,
                    out var lessons))
                {
                    Console.WriteLine(
                        $"No lessons found for Module {moduleSeed.SortOrder}.");

                    continue;
                }

                foreach (var lessonSeed in lessons)
                {
                    var existingLesson =
                        await context.Lessons
                            .FirstOrDefaultAsync(l =>
                                l.CourseModuleId ==
                                    module.CourseModuleId &&
                                l.SortOrder ==
                                    lessonSeed.SortOrder);

                    if (existingLesson != null)
                    {
                        Console.WriteLine(
                            $"Existing Lesson: Module {module.SortOrder}, " +
                            $"Lesson {lessonSeed.SortOrder}: " +
                            $"{existingLesson.Title}");

                        continue;
                    }

                    var lesson = new Lesson
                    {
                        CourseModuleId =
                            module.CourseModuleId,

                        Title =
                            lessonSeed.Title,

                        Content =
                            lessonSeed.Content,

                        VideoUrl = null,

                        ResourceUrl = null,

                        SortOrder =
                            lessonSeed.SortOrder,

                        EstimatedMinutes =
                            lessonSeed.EstimatedMinutes,

                        IsPublished = true,

                        IsFreePreview =
                            module.SortOrder == 1 &&
                            lessonSeed.SortOrder == 1,

                        CreatedDate =
                            DateTime.UtcNow
                    };

                    context.Lessons.Add(lesson);

                    Console.WriteLine(
                        $"Created Lesson: Module {module.SortOrder}, " +
                        $"Lesson {lessonSeed.SortOrder}: " +
                        $"{lesson.Title}");
                }
            }


            // =========================================================
            // SAVE LESSONS
            // =========================================================

            await context.SaveChangesAsync();


            // =========================================================
            // VERIFY
            // =========================================================

            var moduleCount =
                await context.CourseModules
                    .CountAsync(m =>
                        m.CourseId == course.CourseId);

            var lessonCount =
                await context.Lessons
                    .Where(l =>
                        l.CourseModule != null &&
                        l.CourseModule.CourseId ==
                            course.CourseId)
                    .CountAsync();


            Console.WriteLine(
                "============================================");

            Console.WriteLine(
                $"Course 1 Module Count: {moduleCount}");

            Console.WriteLine(
                $"Course 1 Lesson Count: {lessonCount}");

            Console.WriteLine(
                "============================================");


            if (moduleCount == 10 && lessonCount == 60)
            {
                Console.WriteLine(
                    "SUCCESS: Course 1 now has 10 modules and 60 lessons.");
            }
            else
            {
                Console.WriteLine(
                    "WARNING: Course 1 does not yet contain 10 modules and 60 lessons.");
            }
        }


        // =============================================================
        // SEED HELPER CLASSES
        // =============================================================

        private sealed class ModuleSeed
        {
            public int SortOrder { get; set; }

            public string Title { get; set; } = string.Empty;

            public string Description { get; set; } = string.Empty;
        }


        private sealed class LessonSeed
        {
            public int SortOrder { get; set; }

            public string Title { get; set; } = string.Empty;

            public string Content { get; set; } = string.Empty;

            public int EstimatedMinutes { get; set; }
        }
    }
}