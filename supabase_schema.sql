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

