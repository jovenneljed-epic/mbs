-- =========================================================================
-- SCHOOL & CAMPUS MANAGEMENT SYSTEM - COMPLETE SUPABASE POSTGRESQL SCHEMA
-- Compatible with Supabase PostgreSQL 15 / 16 & PostgREST / Supabase JS
-- =========================================================================

-- 1. Enable Required Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =========================================================================
-- 2. DROP EXISTING OBJECTS (CLEAN SLATE IF RE-RUNNING)
-- =========================================================================
drop view if exists public.financial_summary_view cascade;
drop view if exists public.attendance_summary_view cascade;
drop view if exists public.members_directory_view cascade;

-- =========================================================================
-- 3. CORE SECURITY: ROLES & PERMISSIONS
-- =========================================================================

create table if not exists public.roles (
    id serial primary key,
    role_name text unique not null,
    description text default '',
    is_active boolean default true,
    created_at timestamptz default now()
);

create table if not exists public.permissions (
    id serial primary key,
    role_id integer not null references public.roles(id) on delete cascade,
    module text not null,
    can_view boolean default false,
    can_create boolean default false,
    can_edit boolean default false,
    can_delete boolean default false,
    can_export boolean default false,
    created_at timestamptz default now(),
    unique(role_id, module)
);

-- =========================================================================
-- 4. MULTI-TENANCY / INSTITUTION SETTINGS
-- =========================================================================

create table if not exists public.customers (
    id serial primary key,
    church_or_school_name text not null,
    contact_person text default '',
    email text default '',
    phone text default '',
    status text default 'Active' check (status in ('Active', 'Inactive', 'Suspended')),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table if not exists public.school_settings (
    id serial primary key,
    customer_id integer references public.customers(id) on delete cascade,
    school_name text not null default 'Epic School Management System',
    school_code text not null default 'EPIC-01',
    address text default 'San Vicente, Pangasinan, Philippines',
    contact_number text default '09913114163',
    email text default 'admin@epicschool.edu',
    head_or_pastor_name text default 'Rev. Ronnel M. Aviguetero',
    academic_year text default '2025-2026',
    semester text default '1st Semester',
    logo_url text default '',
    updated_at timestamptz default now()
);

-- =========================================================================
-- 5. USER PROFILES (INTEGRATED WITH SUPABASE AUTH)
-- =========================================================================

create table if not exists public.profiles (
    id uuid primary key default gen_random_uuid(),
    auth_user_id uuid unique references auth.users(id) on delete set null,
    username text unique not null,
    full_name text not null,
    email text default '',
    role_id integer references public.roles(id) on delete set null,
    role_name text default 'STAFF',
    customer_id integer references public.customers(id) on delete set null,
    member_id integer,
    is_active boolean default true,
    approval_status text default 'APPROVED' check (approval_status in ('PENDING', 'APPROVED', 'REJECTED')),
    account_type text default 'CLIENT' check (account_type in ('SYSTEM', 'CLIENT', 'MEMBER', 'STAFF')),
    avatar_url text default '',
    last_login timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- =========================================================================
-- 6. DEPARTMENTS / MINISTRIES
-- =========================================================================

create table if not exists public.departments_and_ministries (
    id serial primary key,
    customer_id integer references public.customers(id) on delete cascade,
    name text not null,
    code text default '',
    leader_name text default '',
    contact_number text default '',
    description text default '',
    meeting_day text default 'Sunday',
    meeting_time text default '08:00 AM',
    meeting_location text default 'Main Campus',
    status text default 'ACTIVE' check (status in ('ACTIVE', 'INACTIVE')),
    created_at timestamptz default now(),
    updated_at timestamptz
);

-- =========================================================================
-- 7. MEMBERS / STUDENTS & FACULTY
-- =========================================================================

create table if not exists public.members (
    id serial primary key,
    customer_id integer references public.customers(id) on delete set null,
    member_code text unique not null,
    first_name text not null,
    middle_name text default '',
    last_name text not null,
    suffix text default '',
    gender text not null default 'MALE',
    birth_date date,
    contact_number text default '',
    email text default '',
    address text default '',
    civil_status text default 'SINGLE',
    department_or_ministry text default '',
    date_joined date default CURRENT_DATE,
    status text not null default 'ACTIVE' check (status in ('ACTIVE', 'INACTIVE', 'ARCHIVED', 'SUSPENDED')),
    photo_url text default '',
    occupation text default '',
    notes text default '',
    created_at timestamptz default now(),
    updated_at timestamptz
);

-- =========================================================================
-- 8. CLASSES / SERVICES & SCHEDULES
-- =========================================================================

create table if not exists public.classes_and_services (
    id serial primary key,
    customer_id integer references public.customers(id) on delete set null,
    service_name text not null,
    service_type text default 'REGULAR',
    service_date date not null default CURRENT_DATE,
    start_time text default '07:30',
    end_time text default '11:30',
    location text default 'Main Campus',
    leader_name text default '',
    speaker_name text default '',
    description text default '',
    status text default 'SCHEDULED' check (status in ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    created_at timestamptz default now(),
    updated_at timestamptz
);

-- =========================================================================
-- 9. ATTENDANCE TRACKING (SUPPORTS QR SCANNING & TIME-IN)
-- =========================================================================

create table if not exists public.attendances (
    id serial primary key,
    customer_id integer references public.customers(id) on delete set null,
    member_id integer not null references public.members(id) on delete cascade,
    service_id integer references public.classes_and_services(id) on delete set null,
    event_id integer,
    attendance_date date not null default CURRENT_DATE,
    service_label text default '',
    status text not null default 'PRESENT' check (status in ('PRESENT', 'LATE', 'EARLY', 'ABSENT', 'EXCUSED')),
    recorded_by text default 'admin',
    recorded_at timestamptz default now()
);

-- =========================================================================
-- 10. CR / BREAK HALL PASS SYSTEM (WITH QR CODE VERIFICATION)
-- =========================================================================

create table if not exists public.cr_break_passes (
    id serial primary key,
    customer_id integer references public.customers(id) on delete set null,
    member_id integer not null references public.members(id) on delete cascade,
    pass_code text unique not null,
    qr_token text not null,
    status text not null default 'ACTIVE' check (status in ('ACTIVE', 'USED', 'EXPIRED', 'CANCELLED')),
    issued_at timestamptz not null default now(),
    time_out timestamptz,
    time_in timestamptz,
    expires_at timestamptz,
    created_by text default 'admin'
);

-- =========================================================================
-- 11. VISITORS & GUESTS
-- =========================================================================

create table if not exists public.visitors (
    id serial primary key,
    customer_id integer references public.customers(id) on delete set null,
    visitor_code text unique default ('VIS-' || substr(md5(random()::text), 1, 8)),
    first_name text not null,
    middle_name text default '',
    last_name text not null,
    gender text default 'MALE',
    birth_date date,
    contact_number text default '',
    address text default '',
    invited_by text default '',
    ministry text default '',
    first_visit_date date default CURRENT_DATE,
    visit_count integer default 1,
    follow_up_status text default 'FOLLOW-UP',
    status text default 'ACTIVE',
    notes text default '',
    is_converted_to_member boolean default false,
    converted_member_id integer references public.members(id) on delete set null,
    created_at timestamptz default now(),
    updated_at timestamptz
);

create table if not exists public.visitor_attendances (
    id serial primary key,
    visitor_id integer not null references public.visitors(id) on delete cascade,
    service_id integer references public.classes_and_services(id) on delete set null,
    attendance_date date not null default CURRENT_DATE,
    status text default 'PRESENT',
    recorded_by text default 'admin',
    recorded_at timestamptz default now()
);

-- =========================================================================
-- 12. EVENTS & LOGISTICS MANAGEMENT
-- =========================================================================

create table if not exists public.events (
    id serial primary key,
    customer_id integer references public.customers(id) on delete set null,
    title text not null,
    event_type text not null default 'SPECIAL_EVENT',
    event_date date not null,
    start_time text default '08:00',
    end_time text default '17:00',
    venue text default 'Auditorium',
    speaker text default '',
    ministry_or_dept text default '',
    status text default 'SCHEDULED' check (status in ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'POSTPONED', 'CANCELLED')),
    description text default '',
    notes text default '',
    created_at timestamptz default now(),
    updated_at timestamptz
);

create table if not exists public.event_departments (
    id serial primary key,
    event_id integer not null references public.events(id) on delete cascade,
    department_head_member_id integer references public.members(id) on delete set null,
    department_name text not null,
    department_description text default '',
    priority text default 'NORMAL',
    status text default 'PLANNING',
    created_at timestamptz default now(),
    updated_at timestamptz
);

create table if not exists public.event_roles (
    id serial primary key,
    event_department_id integer not null references public.event_departments(id) on delete cascade,
    role_name text not null,
    role_description text default '',
    priority text default 'NORMAL',
    status text default 'ACTIVE',
    created_at timestamptz default now(),
    updated_at timestamptz
);

create table if not exists public.event_assignments (
    id serial primary key,
    event_id integer not null references public.events(id) on delete cascade,
    event_department_id integer references public.event_departments(id) on delete set null,
    event_role_id integer references public.event_roles(id) on delete set null,
    member_id integer references public.members(id) on delete set null,
    assigned_person text default '',
    assignment_status text default 'PENDING',
    priority text default 'NORMAL',
    notes text default '',
    created_at timestamptz default now(),
    updated_at timestamptz
);

create table if not exists public.event_needs (
    id serial primary key,
    event_id integer not null references public.events(id) on delete cascade,
    responsible_member_id integer references public.members(id) on delete set null,
    need_name text not null,
    description text default '',
    category text default 'SUPPLIES',
    quantity numeric(10,2) default 1.0,
    unit text default 'PCS',
    responsible_person text default '',
    status text default 'PENDING',
    priority text default 'NORMAL',
    notes text default '',
    needed_by date,
    created_at timestamptz default now(),
    updated_at timestamptz
);

create table if not exists public.event_checklists (
    id serial primary key,
    event_id integer not null references public.events(id) on delete cascade,
    assigned_member_id integer references public.members(id) on delete set null,
    completed_by_member_id integer references public.members(id) on delete set null,
    task_name text not null,
    description text default '',
    category text default 'SETUP',
    assigned_person text default '',
    status text default 'PENDING',
    priority text default 'NORMAL',
    sort_order integer default 0,
    due_date date,
    completed_at timestamptz
);

-- =========================================================================
-- 13. FINANCIAL LEDGER: GIVINGS, INCOMES & EXPENSES
-- =========================================================================

create table if not exists public.givings (
    id serial primary key,
    customer_id integer references public.customers(id) on delete set null,
    member_id integer references public.members(id) on delete set null,
    church_service_id integer references public.classes_and_services(id) on delete set null,
    giving_type text not null default 'OFFERING',
    amount numeric(12,2) not null check (amount >= 0),
    giving_date date not null default CURRENT_DATE,
    payment_method text not null default 'CASH',
    reference_number text default '',
    notes text default '',
    recorded_by text default 'admin',
    created_at timestamptz default now()
);

create table if not exists public.incomes (
    id serial primary key,
    customer_id integer references public.customers(id) on delete set null,
    category text not null,
    description text default '',
    amount numeric(12,2) not null check (amount >= 0),
    income_date date not null default CURRENT_DATE,
    payment_method text not null default 'CASH',
    reference_number text default '',
    recorded_by text default 'admin',
    created_at timestamptz default now()
);

create table if not exists public.expenses (
    id serial primary key,
    customer_id integer references public.customers(id) on delete set null,
    category text not null,
    description text default '',
    amount numeric(12,2) not null check (amount >= 0),
    expense_date date not null default CURRENT_DATE,
    payment_method text not null default 'CASH',
    reference_number text default '',
    paid_to text default '',
    approved_by text default 'SYSTEM',
    recorded_by text default 'admin',
    created_at timestamptz default now()
);

-- =========================================================================
-- 14. EPIC LEARNING MODULES (COURSES, MODULES, CERTIFICATES)
-- =========================================================================

create table if not exists public.courses (
    id serial primary key,
    title text not null,
    short_description text default '',
    description text default '',
    thumbnail_url text default '',
    category text default 'General',
    level text default 'Beginner',
    estimated_minutes integer default 60,
    is_published boolean default true,
    is_featured boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table if not exists public.course_modules (
    id serial primary key,
    course_id integer not null references public.courses(id) on delete cascade,
    title text not null,
    description text default '',
    sort_order integer default 1,
    created_at timestamptz default now()
);

create table if not exists public.lessons (
    id serial primary key,
    module_id integer not null references public.course_modules(id) on delete cascade,
    title text not null,
    content text default '',
    video_url text default '',
    duration_minutes integer default 15,
    sort_order integer default 1,
    created_at timestamptz default now()
);

create table if not exists public.course_enrollments (
    id serial primary key,
    course_id integer not null references public.courses(id) on delete cascade,
    profile_id uuid references public.profiles(id) on delete cascade,
    enrolled_date date default CURRENT_DATE,
    completed_date date,
    progress_percentage integer default 0,
    status text default 'IN_PROGRESS' check (status in ('IN_PROGRESS', 'COMPLETED', 'DROPPED'))
);

create table if not exists public.certificates (
    id serial primary key,
    course_id integer not null references public.courses(id) on delete cascade,
    profile_id uuid references public.profiles(id) on delete cascade,
    certificate_number text unique not null,
    issued_date date default CURRENT_DATE,
    verification_code text unique not null
);

-- =========================================================================
-- 15. ANNOUNCEMENTS & CMS POSTS
-- =========================================================================

create table if not exists public.announcements (
    id serial primary key,
    title text not null,
    content text not null,
    priority text default 'NORMAL',
    is_active boolean default true,
    created_at timestamptz default now()
);

create table if not exists public.blog_posts (
    id serial primary key,
    title text not null,
    slug text unique not null,
    content text not null,
    author text default 'Administrator',
    published_date date default CURRENT_DATE,
    is_published boolean default true,
    created_at timestamptz default now()
);

-- =========================================================================
-- 16. PERFORMANCE INDEXES
-- =========================================================================

create index if not exists idx_members_code on public.members(member_code);
create index if not exists idx_members_name on public.members(last_name, first_name);
create index if not exists idx_members_status on public.members(status);
create index if not exists idx_attendances_date on public.attendances(attendance_date);
create index if not exists idx_attendances_member on public.attendances(member_id);
create index if not exists idx_attendances_service on public.attendances(service_id);
create index if not exists idx_classes_date on public.classes_and_services(service_date);
create index if not exists idx_cr_break_token on public.cr_break_passes(qr_token);
create index if not exists idx_cr_break_code on public.cr_break_passes(pass_code);
create index if not exists idx_givings_date on public.givings(giving_date);
create index if not exists idx_incomes_date on public.incomes(income_date);
create index if not exists idx_expenses_date on public.expenses(expense_date);

-- =========================================================================
-- 17. DATABASE VIEWS FOR QUICK REPORTING
-- =========================================================================

create or replace view public.members_directory_view as
select 
    m.id,
    m.member_code,
    m.first_name,
    m.middle_name,
    m.last_name,
    trim(concat(m.first_name, ' ', case when m.middle_name <> 'N/A' and m.middle_name is not null then concat(m.middle_name, ' ') else '' end, m.last_name, ' ', coalesce(m.suffix, ''))) as full_name,
    m.gender,
    m.birth_date,
    case when m.birth_date is not null then date_part('year', age(m.birth_date)) else null end as age,
    m.contact_number,
    m.address,
    m.civil_status,
    m.department_or_ministry,
    m.date_joined,
    m.status,
    m.photo_url,
    coalesce(att.total_attendance, 0) as total_attendances
from public.members m
left join (
    select member_id, count(*) as total_attendance
    from public.attendances
    where status in ('PRESENT', 'LATE')
    group by member_id
) att on m.id = att.member_id;

create or replace view public.attendance_summary_view as
select 
    a.attendance_date,
    coalesce(cs.service_name, a.service_label, 'General Session') as session_title,
    count(a.id) as total_recorded,
    count(case when a.status = 'PRESENT' then 1 end) as present_count,
    count(case when a.status = 'LATE' then 1 end) as late_count,
    count(case when a.status = 'ABSENT' then 1 end) as absent_count,
    count(case when a.status = 'EXCUSED' then 1 end) as excused_count
from public.attendances a
left join public.classes_and_services cs on a.service_id = cs.id
group by a.attendance_date, cs.service_name, a.service_label;

create or replace view public.financial_summary_view as
select
    coalesce(inc.total_income, 0) + coalesce(giv.total_giving, 0) as total_inflows,
    coalesce(exp.total_expense, 0) as total_expenses,
    (coalesce(inc.total_income, 0) + coalesce(giv.total_giving, 0)) - coalesce(exp.total_expense, 0) as net_balance
from
    (select sum(amount) as total_income from public.incomes) inc
cross join
    (select sum(amount) as total_giving from public.givings) giv
cross join
    (select sum(amount) as total_expense from public.expenses) exp;

-- =========================================================================
-- 18. AUTOMATIC UPDATED_AT TRIGGER FUNCTION
-- =========================================================================

create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create or replace trigger trigger_members_updated_at
    before update on public.members
    for each row execute function public.handle_updated_at();

create or replace trigger trigger_customers_updated_at
    before update on public.customers
    for each row execute function public.handle_updated_at();

-- =========================================================================
-- 19. AUTH TRIGGER: AUTO-CREATE PUBLIC PROFILE ON SIGNUP
-- =========================================================================

create or replace function public.handle_new_auth_user()
returns trigger as $$
begin
    insert into public.profiles (
        auth_user_id,
        username,
        full_name,
        email,
        role_id,
        role_name,
        approval_status
    )
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
        coalesce(new.raw_user_meta_data->>'full_name', 'System User'),
        coalesce(new.email, ''),
        1,
        'ADMIN',
        'APPROVED'
    )
    on conflict (username) do nothing;
    return new;
end;
$$ language plpgsql security definer;

-- Enable auth trigger (safe in Supabase)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_auth_user();

-- =========================================================================
-- 20. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.customers enable row level security;
alter table public.school_settings enable row level security;
alter table public.profiles enable row level security;
alter table public.departments_and_ministries enable row level security;
alter table public.members enable row level security;
alter table public.classes_and_services enable row level security;
alter table public.attendances enable row level security;
alter table public.cr_break_passes enable row level security;
alter table public.visitors enable row level security;
alter table public.visitor_attendances enable row level security;
alter table public.events enable row level security;
alter table public.event_departments enable row level security;
alter table public.event_roles enable row level security;
alter table public.event_assignments enable row level security;
alter table public.event_needs enable row level security;
alter table public.event_checklists enable row level security;
alter table public.givings enable row level security;
alter table public.incomes enable row level security;
alter table public.expenses enable row level security;
alter table public.courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.lessons enable row level security;
alter table public.course_enrollments enable row level security;
alter table public.certificates enable row level security;
alter table public.announcements enable row level security;
alter table public.blog_posts enable row level security;

-- Open policies for public and authenticated access (customizable per role in production)
do $$
declare
    t text;
    tables text[] := array[
        'roles', 'permissions', 'customers', 'school_settings', 'profiles', 
        'departments_and_ministries', 'members', 'classes_and_services', 'attendances', 
        'cr_break_passes', 'visitors', 'visitor_attendances', 'events', 
        'event_departments', 'event_roles', 'event_assignments', 'event_needs', 
        'event_checklists', 'givings', 'incomes', 'expenses', 'courses', 
        'course_modules', 'lessons', 'course_enrollments', 'certificates', 
        'announcements', 'blog_posts'
    ];
begin
    foreach t in array tables loop
        execute format('drop policy if exists "Enable all operations for all users" on public.%I', t);
        execute format('create policy "Enable all operations for all users" on public.%I for all using (true) with check (true)', t);
    end loop;
end;
$$;

-- =========================================================================
-- 21. SEED DEFAULT ROLES & PERMISSIONS
-- =========================================================================

INSERT INTO public.roles (id, role_name, description, is_active) VALUES
(1, 'ADMIN', 'Full system administrator access with permissions to all modules', true),
(2, 'PASTOR', 'Leadership and pastoral oversight access', true),
(3, 'STAFF', 'School staff / teachers operational access', true),
(4, 'MEMBERS', 'Standard member / student portal view only access', true)
ON CONFLICT (role_name) DO UPDATE SET description = EXCLUDED.description;

SELECT setval('public.roles_id_seq', (SELECT MAX(id) FROM public.roles));

-- Insert All 15 Core Modules for ADMIN role
INSERT INTO public.permissions (role_id, module, can_view, can_create, can_edit, can_delete, can_export) VALUES
(1, 'Dashboard', true, true, true, true, true),
(1, 'Members', true, true, true, true, true),
(1, 'Attendance', true, true, true, true, true),
(1, 'Visitors', true, true, true, true, true),
(1, 'Ministries', true, true, true, true, true),
(1, 'Church Services', true, true, true, true, true),
(1, 'Giving', true, true, true, true, true),
(1, 'Income', true, true, true, true, true),
(1, 'Expenses', true, true, true, true, true),
(1, 'Events', true, true, true, true, true),
(1, 'Reports', true, true, true, true, true),
(1, 'Users', true, true, true, true, true),
(1, 'Roles', true, true, true, true, true),
(1, 'Permissions', true, true, true, true, true),
(1, 'Church Settings', true, true, true, true, true)
ON CONFLICT (role_id, module) DO NOTHING;

-- Insert Staff permissions
INSERT INTO public.permissions (role_id, module, can_view, can_create, can_edit, can_delete, can_export) VALUES
(3, 'Dashboard', true, false, false, false, false),
(3, 'Members', true, true, true, false, true),
(3, 'Attendance', true, true, true, false, true),
(3, 'Visitors', true, true, true, false, false),
(3, 'Church Services', true, false, false, false, false),
(3, 'Events', true, false, false, false, false)
ON CONFLICT (role_id, module) DO NOTHING;

-- Insert Default Profiles
INSERT INTO public.profiles (username, full_name, email, role_id, role_name, approval_status, account_type) VALUES
('admin', 'EPIC System Administrator', 'admin@epicschool.edu', 1, 'ADMIN', 'APPROVED', 'SYSTEM'),
('staff', 'EPIC Staff Member', 'staff@epicschool.edu', 3, 'STAFF', 'APPROVED', 'STAFF'),
('memberonly', 'EPIC Member Portal', 'member@epicschool.edu', 4, 'MEMBERS', 'APPROVED', 'MEMBER')
ON CONFLICT (username) DO NOTHING;

-- Insert Default School Settings
INSERT INTO public.school_settings (id, school_name, school_code, address, contact_number, email, head_or_pastor_name, academic_year, semester) VALUES
(1, 'Luke 4:18 Ministries San Vicente EPIC School / Church', 'EPIC-SV', 'San Vicente, Pangasinan, Philippines', '09913114163', 'jovenneljed@gmail.com', 'Pastor Ronnel M. Aviguetero', '2025-2026', '1st Semester')
ON CONFLICT (id) DO UPDATE SET school_name = EXCLUDED.school_name, address = EXCLUDED.address, head_or_pastor_name = EXCLUDED.head_or_pastor_name;

SELECT setval('public.school_settings_id_seq', (SELECT MAX(id) FROM public.school_settings));


-- =========================================================================
-- 22. REAL DATA MIGRATION FROM LOCAL DATABASE
-- =========================================================================

-- ========================================================
-- MIGRATED DEPARTMENTS / MINISTRIES (6 Records)
-- ========================================================
INSERT INTO public.departments_and_ministries (id, name, code, leader_name, contact_number, description, meeting_day, meeting_time, meeting_location, status, created_at, updated_at)
VALUES
  (1, 'Epic Worship Team Department', 'MIN-0001', 'Ptr. Julius C. Ocariza', '', 'Responsible for all Worship Ministry department Job roles In and Out.', '', '', '', 'ACTIVE', '2026-08-04 18:23:03', NULL),
  (2, 'EPIC CHILDREN DEPARTMENT', 'MIN-0002', 'APRIL D. MATEO', '', 'Responsible in all children ministry job role', '', '', '', 'ACTIVE', '2026-08-04 19:48:50', NULL),
  (3, 'Tech Department', 'MIN-0003', 'Julius Ocariza', '', 'Responsible in all sound tech department', '', '', '', 'ACTIVE', '2026-08-04 19:49:26', NULL),
  (4, 'MEDIA TEAM AND YOUTH DEPARTMENT', 'MIN-0004', 'MARCELA S. SERQUIÑA', '', 'Responsible in all Media Team roles', '', '', '', 'ACTIVE', '2026-08-04 19:49:28', NULL),
  (5, 'DRIVING MINISTRY', 'MIN-0005', 'JOHN KARLO J. SILAPAN', '', 'RESPONSIBLE IN ALL DRIVING MINISTRY ROLES.', '', '', '', 'ACTIVE', '2026-08-04 19:49:45', NULL),
  (6, 'USHERING DEPARTMENT', 'MIN-0006', 'JASMIN LAURETA TOBIAS', '', 'RESPONSIBLE IN ALL USHERING DEPARTMENT ROLES', '', '', '', 'ACTIVE', '2026-08-04 19:55:47', '2026-08-04 19:56:08') ON CONFLICT (id) DO NOTHING;
SELECT setval('public.departments_and_ministries_id_seq', (SELECT MAX(id) FROM public.departments_and_ministries));


-- ========================================================
-- MIGRATED CLASSES / SERVICES (3 Records)
-- ========================================================
INSERT INTO public.classes_and_services (id, service_name, service_type, service_date, start_time, end_time, location, leader_name, speaker_name, description, status, created_at, updated_at)
VALUES
  (1, 'Epic Cell Celebration', 'SUNDAY WORSHIP', '2026-08-09', '07:30', '11:30', 'Luke 4:18 Ministries – San Vicente Church', 'Ptra. April Mateo', 'Rev. Ronnel M. Aviguetero', 'Theme: Grow', 'COMPLETED', '2026-08-04 18:11:05', '2026-08-04 18:13:55'),
  (2, 'TGIF Youth Night', 'YOUTH FELLOWSHIP', '2026-08-07', '17:30', '20:00', 'Luke 4:18 Ministries – San Vicente Church', 'Ptra. April Mateo', 'Rev. Ronnel M. Aviguetero', 'Theme:Engage  Program:', 'SCHEDULED', '2026-08-04 19:35:19', '2026-08-06 18:01:09'),
  (3, 'EPIC CELL CELEBRATION WEEK 3', 'SUNDAY WORSHIP', '2026-08-16', '07:30', '11:30', 'Luke 4:18 Ministries – San Vicente Church', 'Ptra. Marcela Serquinia', 'Rev. Ronnel M. Aviguetero', '', 'SCHEDULED', '2026-08-05 07:04:02', '2026-08-05 07:04:13') ON CONFLICT (id) DO NOTHING;
SELECT setval('public.classes_and_services_id_seq', (SELECT MAX(id) FROM public.classes_and_services));


-- ========================================================
-- MIGRATED MEMBERS (90 Records from Local Database)
-- ========================================================
INSERT INTO public.members (id, member_code, first_name, middle_name, last_name, gender, birth_date, contact_number, address, civil_status, department_or_ministry, date_joined, status, photo_url, created_at, updated_at)
VALUES
  (1, 'EPIC-2885', 'ERLYN', 'TOLENTINO', 'MATEO', 'FEMALE', '1978-06-26', '09936471122', 'SAN VICENTE UMINGAN PANGASINAN', 'MARRIED', 'ADULT LEADER', '2016-08-04', 'INACTIVE', '', '2026-08-04 16:44:09', '2026-08-04 16:44:18'),
  (2, 'EPIC-3469', 'JOSEPH', 'N/A', 'ANDRADA', 'MALE', '2002-04-06', '09948636499', 'SAN VICENTE, UMINGAN, PANGASINAN', 'SINGLE', 'DRIVING/REPAIR DEPARTMENT', '2016-08-04', 'ACTIVE', '', '2026-08-04 16:47:28', NULL),
  (3, 'EPIC-5732', 'JHON KARLO', 'N/A', 'SILAPAN', 'MALE', '1998-01-07', '09913229381', 'SAN VICENTE, UMINGAN, PANGASINAN', 'SINGLE', 'ASSISTANT PASTOR', '2016-08-04', 'ACTIVE', '', '2026-08-04 16:49:10', NULL),
  (4, 'EPIC-8583', 'JASMIN', 'LAURETA', 'TOBIAS', 'FEMALE', '2002-01-09', '09971085727', '', 'SINGLE', '', '2026-08-04', 'ACTIVE', '', '2026-08-04 16:50:21', NULL),
  (5, 'EPIC-7918', 'VIRGINIA', 'DOPALE', 'NICOLAS', 'FEMALE', '1956-09-11', '000000000', 'SAN VICENTE, UMINGAN, PANGASINAN', 'WIDOWED', 'TREASURER', '2016-08-04', 'ACTIVE', '', '2026-08-04 16:57:48', NULL),
  (6, 'EPIC-8269', 'VERONICA', 'GANDO', 'NICOLAS', 'FEMALE', '1986-09-06', '0000000', 'SAN VICENTE, UMINGAN, PANGASINAN', 'MARRIED', 'YOUNG ADULT FINANCIAL SUPPORTER', '2016-08-04', 'ACTIVE', '', '2026-08-04 17:00:10', NULL),
  (7, 'EPIC-7680', 'DRICH EMMAN', 'VALDEZ', 'TOBIAS', 'MALE', '2017-06-09', '111111', '', 'SINGLE', '', '2026-08-04', 'ACTIVE', '', '2026-08-04 17:01:45', NULL),
  (8, 'EPIC-5046', 'MARK GIAN', 'C.', 'VIRAY', 'MALE', '2008-10-05', '11111', 'SAN PABLO UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-04', 'ACTIVE', '', '2026-08-04 17:03:55', NULL),
  (9, 'EPIC-1406', 'JANICE', 'E.', 'BANIQUED', 'FEMALE', '2009-05-10', '09654739113', 'SAN VICENTE, UMINGAN, PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2020-08-04', 'ACTIVE', '', '2026-08-04 17:06:07', NULL),
  (10, 'EPIC-6347', 'JOHN LEE', 'R.', 'DAÑO', 'MALE', '2006-10-01', '09455921554', 'SAN PABLO UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-04', 'ACTIVE', '', '2026-08-04 17:08:17', NULL),
  (11, 'EPIC-8723', 'JAYSON', 'Q.', 'ENCOMIENDA', 'MALE', '2004-04-26', '09274693001', 'SAN PABLO UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-04', 'ACTIVE', '', '2026-08-04 17:12:13', NULL),
  (12, 'EPIC-6951', 'RENZ', 'R.', 'DAÑO', 'MALE', '2015-01-18', '000000', 'SAN PABLO UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-04', 'ACTIVE', '', '2026-08-04 17:14:19', NULL),
  (13, 'EPIC-7347', 'JOELAILA LYN', 'M.', 'IMPON', 'FEMALE', '2012-10-02', '09971085703', 'SAN VICENTE, UMINGAN, PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-04', 'ACTIVE', '', '2026-08-04 17:16:11', NULL),
  (14, 'EPIC-9620', 'TRACY', 'A.', 'ULEP', 'FEMALE', '2013-06-18', '00000', 'LAPAZ UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-04', 'ACTIVE', '', '2026-08-04 17:18:52', NULL),
  (15, 'EPIC-9486', 'JADE', 'N/A', 'CREDO', 'FEMALE', '2009-04-29', '09915672150', 'CADIZ UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-04', 'ACTIVE', '', '2026-08-04 17:20:10', NULL),
  (16, 'EPIC-1193', 'JOHN GLENN', 'N/A', 'CREDO', 'MALE', '2007-07-10', '09273959385', 'SAN PABLO UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2020-08-04', 'ACTIVE', '', '2026-08-04 17:24:08', NULL),
  (17, 'EPIC-7252', 'RYAN JAY', 'N/A', 'SUMALBAG', 'MALE', '2009-08-30', 'NONE', 'SAN PABLO UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-04', 'ACTIVE', '', '2026-08-04 17:25:49', NULL),
  (18, 'EPIC-6055', 'JENNIFER', 'BERCASIO', 'VELASCO', 'FEMALE', '1991-09-05', '1111', 'RESURECCION UMINGAN PANGASINAN', 'MARRIED', 'YOUNG ADULT DEPARTMENT', '2026-08-04', 'ACTIVE', '', '2026-08-04 17:31:05', NULL),
  (19, 'EPIC-3228', 'JAYRALD', 'D.', 'VELASCO', 'MALE', '1992-11-20', '1111', 'RESURECCION UMINGAN PANGASINAN', 'MARRIED', 'YOUNG ADULT DEPARTMENT', '2026-08-04', 'ACTIVE', '', '2026-08-04 17:32:29', NULL),
  (20, 'EPIC-2523', 'JOEY', 'P.', 'MINDAROS', 'MALE', '2013-10-20', '11111', 'SAN VICENTE, UMINGAN, PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-04', 'ACTIVE', '', '2026-08-04 17:36:34', NULL),
  (21, 'EPIC-1807', 'KATHLEEN', 'R.', 'OLIVAR', 'FEMALE', '2014-10-22', '12123', 'SAN VICENTE, UMINGAN, PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-04', 'ACTIVE', '', '2026-08-04 17:37:51', NULL),
  (22, 'string', 'string', 'string', 'string', 'STRING', '2026-08-04', 'string', 'string', 'STRING', 'STRING', '2026-08-04', 'INACTIVE', 'string', '2026-08-04 23:01:48', '2026-08-05 16:52:06'),
  (23, 'EPIC-1813', 'JONNEL', 'N/A', 'ANGEL', 'MALE', '2014-07-01', '0102', 'SAN VICENTE UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 16:55:26', NULL),
  (24, 'EPIC-2352', 'RESTON', 'BARLITA', 'GAÑALONGO', 'MALE', '2013-09-02', 'N/A', 'SAN VICENTE UMINGAN PANGASINAN', 'SINGLE', 'YOUTH MINISTRY', '2026-08-05', 'ACTIVE', '', '2026-08-05 16:56:51', NULL),
  (25, 'EPIC-6382', 'REYMART', 'BARLITA', 'GAÑALONGO', 'MALE', '2010-09-20', '09245580573', 'SAN VICENTE UMINGAN PANGASINAN', 'SINGLE', 'YOUTH MINISTRY', '2026-08-05', 'ACTIVE', '', '2026-08-05 16:58:18', NULL),
  (26, 'EPIC-4655', 'JULIUS', 'COLLADO', 'OCARIZA', 'MALE', '2002-07-02', '09671085772', 'SAN VICENTE UMINGAN PANGASINAN', 'SINGLE', 'ASSISTANT PASTOR', '2026-08-05', 'ACTIVE', '', '2026-08-05 17:00:26', NULL),
  (27, 'EPIC-4967', 'MARCELA', 'STA. MARINA', 'SERQUIÑIA', 'FEMALE', '2003-03-03', '0123', 'RESURECCION UMINGAN PANGASINAN', 'SINGLE', 'ASSISTANT PASTOR', '2026-08-05', 'ACTIVE', '', '2026-08-05 17:01:56', NULL),
  (28, 'EPIC-5658', 'GERONIE', 'MARANIA', 'TOBIAS', 'MALE', '1965-11-23', '09065517635', 'SAN JUAN UMINGAN PANGASINAN', 'MARRIED', 'ADULT DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 17:05:27', NULL),
  (29, 'EPIC-3480', 'MARGIELYN', 'DELA CRUZ', 'VENOZA', 'FEMALE', '2010-02-08', '09162931570', 'GONZALES UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 17:06:52', NULL),
  (30, 'EPIC-9941', 'ALTHEA', 'VENOZA', 'GALLARDO', 'FEMALE', '2010-07-15', '09071617217', 'GONZALES UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 17:10:55', NULL),
  (31, 'EPIC-8944', 'MARIBEL', 'VALDEZ', 'TOBIAS', 'FEMALE', '1984-03-30', '09959851847', 'SAN JUAN UMINGAN PANGASINAN', 'MARRIED', 'ADULT DEPARTMENT LEADER', '2026-08-05', 'ACTIVE', '', '2026-08-05 17:12:56', NULL),
  (32, 'EPIC-4265', 'VON ADRIAN', 'NICOLAS', 'DOPALE', 'MALE', '2011-10-18', '09061926487', 'SAN VICENTE UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 17:15:38', NULL),
  (33, 'EPIC-3049', 'ROSE MARIE', 'N/A', 'ABOC', 'FEMALE', '1970-09-03', '0312', 'SAN PABLO UMINGAN PANGASINAN', 'MARRIED', 'ADULT DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 17:16:51', NULL),
  (34, 'EPIC-3673', 'CRISOLOGO', 'P.', 'ABOC', 'MALE', '1963-07-01', '0321', 'SAN PABLO UMINGAN PANGASINAN', 'MARRIED', 'ADULT DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 17:18:41', NULL),
  (35, 'EPIC-5831', 'JELLI JHEN', 'ABOC', 'CARIÑO', 'FEMALE', '2014-03-23', '132', 'SAN PABLO UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 17:19:54', NULL),
  (36, 'EPIC-4963', 'JEROSE ANN MARIE', 'B.', 'ABOC', 'FEMALE', '2014-02-07', '1654', 'SAN PABLO UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 17:23:58', NULL),
  (37, 'EPIC-7659', 'IGNACIO', 'N/A', 'DOPALE', 'MALE', '1962-12-04', '09910884336', 'SAN VICENTE UMINGAN PANGASINAN', 'MARRIED', 'ADULT MINISTRY', '2026-08-05', 'ACTIVE', '', '2026-08-05 17:25:23', NULL),
  (38, 'EPIC-4110', 'WILMA', 'NICOLAS', 'DOPALE', 'FEMALE', '1970-03-01', '1654', 'SAN VICENTE UMINGAN PANGASINAN', 'MARRIED', 'ADULT DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 17:26:36', NULL),
  (39, 'EPIC-5663', 'NENITA', 'RINGOR', 'SILAPAN', 'FEMALE', '1970-03-19', '1654', 'SAN VICENTE UMINGAN PANGASINAN', 'MARRIED', 'ADULT DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 17:27:47', NULL),
  (40, 'EPIC-3116', 'MANDINO', 'RINGOR', 'SILAPAN', 'MALE', '1965-04-04', '1645', 'SAN VICENTE UMINGAN PANGASINAN', 'MARRIED', 'ADULT DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 17:28:58', NULL),
  (41, 'EPIC-2233', 'REGINE', 'RAFAEL', 'OLIVAR', 'FEMALE', '2011-04-16', '09949492053', 'SAN VICENTE UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 17:30:08', NULL),
  (42, 'EPIC-4143', 'TRISH ROAN', 'DOPALE', 'FAUSTINO', 'FEMALE', '2019-03-27', '3215', 'SAN VICENTE UMINGAN PANGASINAN', 'SINGLE', 'CHILDREN DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 17:36:57', NULL),
  (43, 'EPIC-2012', 'VIOLETA', 'DIMAS', 'DAPLINAN', 'FEMALE', '1965-07-23', '1654', 'SANTA ROSA UMINGAN PANGASINAN', 'WIDOWED', 'ADULT DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 17:38:12', NULL),
  (44, 'EPIC-2077', 'JANINE AIRA', 'TOLEDO', 'PALDENG', 'FEMALE', '2006-01-20', '1651', 'SAN VICENTE UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT LEADER', '2026-08-05', 'ACTIVE', '', '2026-08-05 17:40:34', NULL),
  (45, 'EPIC-2306', 'KRISTINE JOY', 'R.', 'DOPALE', 'FEMALE', '2012-01-01', '09677583708', 'SAN VICENTE UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 17:41:48', NULL),
  (46, 'EPIC-9945', 'JHAY LORD', 'BERCASIO', 'LARGONITA', 'MALE', '2011-12-16', '1654', 'RESURECCION UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 17:43:13', NULL),
  (47, 'EPIC-4175', 'JEDIDIAH', 'DAPLINAN', 'AVIGUETERO', 'MALE', '2016-09-27', '09913114163', 'SANTA ROSA UMINGAN PANGASINAN', 'SINGLE', 'WORSHIP TEAM DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 17:44:58', NULL),
  (48, 'EPIC-6924', 'KEZIAH', 'DAPLINAN', 'AVIGUETERO', 'FEMALE', '2020-10-16', '09956326245', 'SANTA ROSA UMINGAN PANGASINAN', 'SINGLE', 'CHILDREN DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 17:47:09', NULL),
  (49, 'EPIC-5013', 'JARED', 'GANDO', 'NICOLAS', 'MALE', '2019-10-18', '6465', 'ROSALES PANGASINAN', 'SINGLE', 'CHILDREN DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 17:56:15', NULL),
  (50, 'EPIC-2563', 'APRIL', 'DATUIN', 'MATEO', 'FEMALE', '2005-04-03', '09931354862', 'SAN VICENTE UMINGAN PANGASINAN', 'SINGLE', 'ASSISTANT PASTOR', '2026-08-05', 'ACTIVE', '', '2026-08-05 18:00:00', NULL),
  (51, 'EPIC-2057', 'JANELLA', 'TOLEDO', 'PALDENG', 'FEMALE', '2012-01-01', '3215', 'SAN VICENTE UMINGAN PANGASINAN', 'SINGLE', 'WORSHIP TEAM DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 18:01:38', NULL),
  (52, 'EPIC-2416', 'ANGELIKA', 'MINDAROS', 'CALIBUSO', 'FEMALE', '2014-07-31', '09938069882', 'SAN VICENTE UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 18:02:53', NULL),
  (53, 'EPIC-4038', 'JENNY', 'MADRID', 'SILAPAN', 'FEMALE', '2015-09-09', '09916894088', 'SAN VICENTE UMINGAN PANGASINAN', 'SINGLE', 'CHILDREN DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 18:16:16', NULL),
  (54, 'EPIC-9170', 'SWEET ALLYSA', 'VALDEZ', 'TOBIAS', 'FEMALE', '2013-01-09', '2135', 'SAN JUAN UMINGAN PANGASINAN', 'SINGLE', 'WORSHIP TEAM DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 18:18:21', NULL),
  (55, 'EPIC-1484', 'RENZ', 'FREGILLINA', 'OLIVAR', 'MALE', '1997-12-28', '09916202024', 'SAN VICENTE UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT LEADER', '2026-08-05', 'ACTIVE', '', '2026-08-05 18:19:46', NULL),
  (56, 'EPIC-1865', 'JERALD', 'PASCUA', 'MINDAROS', 'MALE', '2011-08-13', '09928599517', 'SAN VICENTE UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 18:21:15', NULL),
  (57, 'EPIC-7901', 'ARIANA MAE', 'ASTODILLO', 'MITRADO', 'FEMALE', '2011-09-28', '09912863618', 'SANTA ROSA UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 18:22:52', NULL),
  (58, 'EPIC-7858', 'RENZ', 'ALPARO', 'MATEO', 'MALE', '2010-11-01', '09929492415', 'SAN VICENTE UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 18:24:08', NULL),
  (59, 'EPIC-2186', 'JONALYN', 'NARDO', 'ABRACIA', 'FEMALE', '2012-07-11', '09552472015', 'LUNA WESTE UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 18:25:17', NULL),
  (60, 'EPIC-9701', 'ERICA NICOLE', 'SISON', 'FERRER', 'FEMALE', '2012-08-11', '09368880217', 'LUNA WESTE UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 18:26:49', NULL),
  (61, 'EPIC-4193', 'AKIRA SHIEN', 'MARTINEZ', 'ABRACIA', 'FEMALE', '2014-05-09', '09979933696', 'LUNA WESTE UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 20:25:11', NULL),
  (62, 'EPIC-4926', 'JELYN JOY', 'DASALLA', 'RASCA', 'FEMALE', '2010-12-22', '09948132716', 'SAN PABLO UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 20:26:51', NULL),
  (63, 'EPIC-9445', 'FERDINAND', 'BANIQUED', 'DOPALE', 'MALE', '2008-09-13', '09943874594', 'SAN VICENTE UMINGAN PANGASINAN', 'SINGLE', 'WORSHIP TEAM DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 20:28:16', NULL),
  (64, 'EPIC-9905', 'JULIE ANN', 'ILAN', 'BERCASIO', 'FEMALE', '1999-07-19', '09069685448', 'RESURECCION UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 20:30:00', NULL),
  (65, 'EPIC-4454', 'MILEY KATE', 'DELA ROSA', 'LABAUSA', 'FEMALE', '2013-12-15', '09913567117', 'SAN VICENTE UMINGAN PANGASINAN', 'SINGLE', '09913567117', '2026-08-05', 'ACTIVE', '', '2026-08-05 20:31:37', NULL),
  (66, 'EPIC-5811', 'JOHANN ANDREI', 'DELA ROSA', 'LABAUSA', 'MALE', '2010-09-12', '09913567117', 'SAN VICENTE UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 20:33:08', NULL),
  (67, 'EPIC-1084', 'GENESIS', 'DESCALSOTA', 'MATEO', 'MALE', '2017-01-20', '', '', 'SINGLE', '', '2026-08-05', 'ACTIVE', '', '2026-08-05 20:40:57', NULL),
  (68, 'EPIC-3001', 'RHEVEN', 'MARCELO', 'MATEO', 'MALE', '2017-01-20', '0321', 'SAN VICENTE UMINGAN PANGASINAN', 'SINGLE', 'CHILDREN DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 20:42:20', NULL),
  (69, 'EPIC-8694', 'HONELYN', 'ORNOS', 'GAÑALONGO', 'FEMALE', '1988-04-04', '09759313767', 'SAN VICENTE UMINGAN PANGASINAN', 'MARRIED', 'ADULT DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 20:55:40', NULL),
  (70, 'EPIC-4513', 'RENZ', 'ORNOS', 'GAÑALONGO', 'MALE', '2016-04-29', '134', 'SAN VICENTE UMINGAN PANGASINAN', 'SINGLE', 'CHIDREN MINISTRY', '2026-08-05', 'ACTIVE', '', '2026-08-05 20:57:01', NULL),
  (71, 'EPIC-9732', 'REYMON', 'ORNOS', 'GAÑALONGO', 'MALE', '2009-05-31', '09976274002', 'SAN VICENTE UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 20:58:22', NULL),
  (72, 'EPIC-7039', 'VENUS', 'NARCISO', 'DOPALE', 'FEMALE', '1998-09-11', '09919227521', 'SAN VICENTE UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 21:00:10', NULL),
  (73, 'EPIC-2348', 'JOSHUA', 'MATEO', 'SILAPAN', 'MALE', '2000-05-12', '09938299041', 'SAN VICENTE UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 21:02:12', NULL),
  (74, 'EPIC-2034', 'VIEN EZEKIEL', 'DOPALE', 'SILAPAN', 'MALE', '2019-05-17', '123', 'SAN VICENTE UMINGAN PANGASINAN', 'SINGLE', 'CHILDREN DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 21:04:14', NULL),
  (75, 'EPIC-1893', 'CHESKA MAE', 'DELA PEÑA', 'NICOLAS', 'FEMALE', '2005-05-10', '1354', 'SAN VICENTE UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 21:05:39', NULL),
  (76, 'EPIC-4778', 'CRISTEL', 'BARLITA', 'GAÑALONGO', 'FEMALE', '2016-01-29', '4562', '', 'SINGLE', 'CHILDREN MINISTRY', '2026-08-05', 'ACTIVE', '', '2026-08-05 21:06:42', NULL),
  (77, 'EPIC-8607', 'MARK JAY', 'EUGENIO', 'OLIVAR', 'MALE', '2010-01-12', '12346', 'SAN VICENTE UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 21:09:48', NULL),
  (78, 'EPIC-2946', 'ETHYLYN', 'FERNANDEZ', 'TOLENTINO', 'FEMALE', '2009-03-07', '49872', 'SAN VICENTE UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 21:11:20', NULL),
  (79, 'EPIC-2479', 'KATRINA', 'CEZAR', 'VIRAY', 'FEMALE', '2010-05-21', '1234', 'SAN PABLO UMINGAN PANGASINAN', 'SINGLE', '', '2026-08-05', 'ACTIVE', '', '2026-08-05 21:12:25', NULL),
  (80, 'EPIC-2351', 'LENILYN', 'MARRON', 'MANANTAN', 'FEMALE', '2012-11-09', '', 'CASILAN UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 21:13:38', NULL),
  (81, 'EPIC-4993', 'BERNADITH', 'GARCIA', 'ABUAN', 'FEMALE', '2012-11-14', '', 'CASILAN UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 21:14:33', NULL),
  (82, 'EPIC-6922', 'JUVY', 'LIZARDO', 'VENEZUELA', 'FEMALE', '2013-11-17', '', 'CASILAN UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 21:15:35', NULL),
  (83, 'EPIC-9729', 'HAZEL ANN', 'TOBIAS', 'RINGOR', 'FEMALE', '2010-02-05', '', 'SAN JUAN UMINGAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 21:16:53', NULL),
  (84, 'EPIC-8394', 'ALTHEA LUISSE', 'AGUSTIN', 'CABANATUAN', 'FEMALE', '2014-09-07', '', 'SAN JUAN UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 21:18:00', NULL),
  (85, 'EPIC-7741', 'RENCE MARCELO', 'CAYME', 'DECRETO', 'MALE', '2013-05-01', '', 'DECRETO UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 21:19:08', NULL),
  (86, 'EPIC-4893', 'PAUL JAKE', 'ISAIG', 'PASCUAL', 'MALE', '2013-07-13', '', 'CAPAS UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-05', 'ACTIVE', '', '2026-08-05 21:20:17', NULL),
  (1023, 'EPIC-2406', 'RUBY MAE', 'N/A', 'EUGENIO', 'FEMALE', '2011-04-14', '', 'SAN VICENTE UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-06', 'ACTIVE', '', '2026-08-06 17:55:30', NULL),
  (1024, 'EPIC-5293', 'JHON LESTER', '', 'SION', 'MALE', '2010-01-12', '', 'CADIZ UMINGAN PANGASINAN', 'SINGLE', 'YOUTH DEPARTMENT', '2026-08-06', 'ACTIVE', '', '2026-08-06 17:57:00', NULL),
  (1025, 'EPIC-8255', 'ZACH BENISON', 'BERCASIO', 'VELASCO', 'MALE', '2015-09-19', '', 'RESURECCION UMINGAN PANGASINAN', 'SINGLE', 'CHILDREN DEPARTMENT', '2026-08-06', 'ACTIVE', '', '2026-08-06 17:58:35', NULL),
  (1026, 'EPIC-7523', 'ZEPH MATTHEW', 'BERCASIO', 'VELASCO', 'MALE', '2021-08-19', '', 'RESURECCION UMINGAN PANGASINAN', 'SINGLE', 'CHILDREN DEPARTMENT', '2026-08-06', 'ACTIVE', '', '2026-08-06 18:00:41', NULL) ON CONFLICT (id) DO NOTHING;
SELECT setval('public.members_id_seq', (SELECT MAX(id) FROM public.members));


-- ========================================================
-- MIGRATED ATTENDANCES (40 Records)
-- ========================================================
INSERT INTO public.attendances (id, member_id, attendance_date, service_label, status, recorded_by, recorded_at, service_id)
VALUES
  (1, 2, '2026-08-09', 'Epic Cell Celebration', 'PRESENT', 'admin', '2026-08-04 18:16:07', 1),
  (2, 9, '2026-08-09', 'Epic Cell Celebration', 'LATE', 'admin', '2026-08-04 18:16:07', 1),
  (3, 15, '2026-08-09', 'Epic Cell Celebration', 'ABSENT', 'admin', '2026-08-04 18:16:07', 1),
  (4, 16, '2026-08-09', 'Epic Cell Celebration', 'PRESENT', 'admin', '2026-08-04 18:16:07', 1),
  (5, 10, '2026-08-09', 'Epic Cell Celebration', 'PRESENT', 'admin', '2026-08-04 18:16:07', 1),
  (6, 12, '2026-08-09', 'Epic Cell Celebration', 'LATE', 'admin', '2026-08-04 18:16:07', 1),
  (7, 11, '2026-08-09', 'Epic Cell Celebration', 'EARLY', 'admin', '2026-08-04 18:16:07', 1),
  (8, 13, '2026-08-09', 'Epic Cell Celebration', 'PRESENT', 'admin', '2026-08-04 18:16:07', 1),
  (9, 20, '2026-08-09', 'Epic Cell Celebration', 'PRESENT', 'admin', '2026-08-04 18:16:07', 1),
  (10, 6, '2026-08-09', 'Epic Cell Celebration', 'PRESENT', 'admin', '2026-08-04 18:16:07', 1),
  (11, 5, '2026-08-09', 'Epic Cell Celebration', 'EXCUSED', 'admin', '2026-08-04 18:16:07', 1),
  (12, 21, '2026-08-09', 'Epic Cell Celebration', 'PRESENT', 'admin', '2026-08-04 18:16:07', 1),
  (13, 3, '2026-08-09', 'Epic Cell Celebration', 'PRESENT', 'admin', '2026-08-04 18:16:07', 1),
  (14, 17, '2026-08-09', 'Epic Cell Celebration', 'PRESENT', 'admin', '2026-08-04 18:16:07', 1),
  (15, 7, '2026-08-09', 'Epic Cell Celebration', 'PRESENT', 'admin', '2026-08-04 18:16:07', 1),
  (16, 4, '2026-08-09', 'Epic Cell Celebration', 'PRESENT', 'admin', '2026-08-04 18:16:07', 1),
  (17, 14, '2026-08-09', 'Epic Cell Celebration', 'PRESENT', 'admin', '2026-08-04 18:16:07', 1),
  (18, 19, '2026-08-09', 'Epic Cell Celebration', 'PRESENT', 'admin', '2026-08-04 18:16:07', 1),
  (19, 18, '2026-08-09', 'Epic Cell Celebration', 'PRESENT', 'admin', '2026-08-04 18:16:07', 1),
  (20, 8, '2026-08-09', 'Epic Cell Celebration', 'PRESENT', 'admin', '2026-08-04 18:16:07', 1),
  (21, 2, '2026-08-07', 'TGIF Youth Night', 'LATE', 'admin', '2026-08-04 19:38:12', 2),
  (22, 9, '2026-08-07', 'TGIF Youth Night', 'ABSENT', 'admin', '2026-08-04 19:38:12', 2),
  (23, 15, '2026-08-07', 'TGIF Youth Night', 'EXCUSED', 'admin', '2026-08-04 19:38:12', 2),
  (24, 16, '2026-08-07', 'TGIF Youth Night', 'PRESENT', 'admin', '2026-08-04 19:38:12', 2),
  (25, 10, '2026-08-07', 'TGIF Youth Night', 'PRESENT', 'admin', '2026-08-04 19:38:12', 2),
  (26, 12, '2026-08-07', 'TGIF Youth Night', 'PRESENT', 'admin', '2026-08-04 19:38:12', 2),
  (27, 11, '2026-08-07', 'TGIF Youth Night', 'PRESENT', 'admin', '2026-08-04 19:38:12', 2),
  (28, 13, '2026-08-07', 'TGIF Youth Night', 'PRESENT', 'admin', '2026-08-04 19:38:12', 2),
  (29, 20, '2026-08-07', 'TGIF Youth Night', 'PRESENT', 'admin', '2026-08-04 19:38:12', 2),
  (30, 6, '2026-08-07', 'TGIF Youth Night', 'PRESENT', 'admin', '2026-08-04 19:38:12', 2),
  (31, 5, '2026-08-07', 'TGIF Youth Night', 'PRESENT', 'admin', '2026-08-04 19:38:12', 2),
  (32, 21, '2026-08-07', 'TGIF Youth Night', 'PRESENT', 'admin', '2026-08-04 19:38:12', 2),
  (33, 3, '2026-08-07', 'TGIF Youth Night', 'EARLY', 'admin', '2026-08-04 19:38:12', 2),
  (34, 17, '2026-08-07', 'TGIF Youth Night', 'PRESENT', 'admin', '2026-08-04 19:38:12', 2),
  (35, 7, '2026-08-07', 'TGIF Youth Night', 'PRESENT', 'admin', '2026-08-04 19:38:12', 2),
  (36, 4, '2026-08-07', 'TGIF Youth Night', 'LATE', 'admin', '2026-08-04 19:38:12', 2),
  (37, 14, '2026-08-07', 'TGIF Youth Night', 'PRESENT', 'admin', '2026-08-04 19:38:12', 2),
  (38, 19, '2026-08-07', 'TGIF Youth Night', 'PRESENT', 'admin', '2026-08-04 19:38:12', 2),
  (39, 18, '2026-08-07', 'TGIF Youth Night', 'PRESENT', 'admin', '2026-08-04 19:38:12', 2),
  (40, 8, '2026-08-07', 'TGIF Youth Night', 'PRESENT', 'admin', '2026-08-04 19:38:12', 2) ON CONFLICT (id) DO NOTHING;
SELECT setval('public.attendances_id_seq', (SELECT MAX(id) FROM public.attendances));


-- ========================================================
-- MIGRATED VISITORS (1 Record)
-- ========================================================
INSERT INTO public.visitors (id, visitor_code, first_name, middle_name, last_name, gender, birth_date, contact_number, address, invited_by, ministry, first_visit_date, visit_count, follow_up_status, status, notes, created_at, updated_at)
VALUES
  (1, 'VIS-2026-0001', 'John lester', 'Caguin', 'Sion', 'MALE', '2003-06-01', '09955642270', 'Brgy. Cadiz Umingan Pangasinan', 'Marcela Serquiña', 'Youth department head', '2026-08-09', 1, 'FOLLOW-UP', 'ACTIVE', 'Prayer Request: Healing', '2026-08-04 18:43:14', '2026-08-04 18:46:24') ON CONFLICT (id) DO NOTHING;
SELECT setval('public.visitors_id_seq', (SELECT MAX(id) FROM public.visitors));


-- ========================================================
-- MIGRATED GIVINGS / OFFERINGS (3 Records)
-- ========================================================
INSERT INTO public.givings (id, member_id, church_service_id, giving_type, amount, giving_date, payment_method, reference_number, notes, recorded_by, created_at)
VALUES
  (1, 3, 1, 'OFFERING', 10.00, '2026-08-04', 'CASH', '', '', 'admin', '2026-08-04 18:51:11'),
  (2, 3, NULL, 'PLEDGE', 50.00, '2026-08-04', 'GCASH', '12345-12', 'send to mam maribel', 'admin', '2026-08-04 18:53:02'),
  (3, 4, NULL, 'OFFERING', 1000.00, '2026-08-04', 'BANK TRANSFER', '', '', 'admin', '2026-08-04 19:11:07') ON CONFLICT (id) DO NOTHING;
SELECT setval('public.givings_id_seq', (SELECT MAX(id) FROM public.givings));


-- ========================================================
-- MIGRATED INCOMES (1 Record)
-- ========================================================
INSERT INTO public.incomes (id, category, description, amount, income_date, payment_method, reference_number, recorded_by, created_at)
VALUES
  (1, 'SUNDAY WORSHIP TOTAL INCOME', 'total income', 1060.00, '2026-08-04', 'CASH', '', 'admin', '2026-08-04 19:17:59') ON CONFLICT (id) DO NOTHING;
SELECT setval('public.incomes_id_seq', (SELECT MAX(id) FROM public.incomes));


-- ========================================================
-- MIGRATED EXPENSES (1 Record)
-- ========================================================
INSERT INTO public.expenses (id, category, description, amount, expense_date, payment_method, reference_number, recorded_by, created_at)
VALUES
  (1, 'TRANSPORTATION', 'motorcycle gasoline', 500.00, '2026-08-04', 'CASH', 'O.R 12', 'SYSTEM', '2026-08-04 19:19:22') ON CONFLICT (id) DO NOTHING;
SELECT setval('public.expenses_id_seq', (SELECT MAX(id) FROM public.expenses));

