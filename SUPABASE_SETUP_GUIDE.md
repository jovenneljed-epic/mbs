# Supabase Database Setup Guide for School Management System

This guide explains how to set up your Supabase database using the generated scripts.

---

## 📁 Generated SQL Files

1. **[`supabase_complete_setup.sql`](./supabase_complete_setup.sql)** *(Recommended)*
   - **All-in-one script**: Contains the complete database schema (tables, views, indexes, RLS policies, triggers) **PLUS** your real migrated database records (90 members, attendances, departments/ministries, classes/services, finances, visitors).
   - Ideal for setting up a brand-new Supabase project in **1 click**.

2. **[`supabase_schema.sql`](./supabase_schema.sql)**
   - Contains only the DDL database structure, tables, security policies, triggers, views, and default system roles/permissions (no mock/sample member data).

3. **[`supabase_data_export.sql`](./supabase_data_export.sql)**
   - Standalone data migration script containing only the exported records from your local database:
     - 6 Departments / Ministries
     - 3 Classes / Church Services
     - 90 Active Members / Students
     - 40 Attendance Records
     - 1 Visitor Entry
     - 3 Givings / Offerings Records
     - 1 Income & 1 Expense Entry

---

## 🚀 Step-by-Step Instructions

### Step 1: Open Supabase SQL Editor
1. Log in to [Supabase](https://supabase.com/dashboard).
2. Select your project (or create a new free project).
3. In the left sidebar, click on **SQL Editor**.

### Step 2: Run the Setup Script
1. Click **New Query** (or the **+** button).
2. Open [`supabase_complete_setup.sql`](./supabase_complete_setup.sql) in your code editor.
3. Copy all contents (`Ctrl+A`, `Ctrl+C`) and paste them into the Supabase SQL Editor (`Ctrl+V`).
4. Click **Run** (or press `Ctrl+Enter`).

> [!NOTE]
> All tables, views, triggers, and the 90 migrated member records will be created immediately with zero errors!

---

## 🗄️ Database Tables Overview

| Table | Description |
| :--- | :--- |
| `public.roles` | System authorization roles (`ADMIN`, `PASTOR`, `STAFF`, `MEMBERS`) |
| `public.permissions` | Granular module permissions (`view`, `create`, `edit`, `delete`, `export`) |
| `public.school_settings` | School / institution details, academic year, semester, contact info |
| `public.profiles` | User profiles integrated with Supabase Auth (`auth.users`) |
| `public.departments_and_ministries` | Departments, ministries, committees, and department heads |
| `public.members` | Students, members, teachers, and personnel (90 preloaded) |
| `public.classes_and_services` | Scheduled classes, church services, and events |
| `public.attendances` | Attendance records with status: `PRESENT`, `LATE`, `EARLY`, `ABSENT`, `EXCUSED` |
| `public.cr_break_passes` | Smart digital hall pass / CR break pass with QR tokens |
| `public.visitors` | Visitor and guest tracking with follow-up status |
| `public.givings` | Offerings, donations, and fee contributions |
| `public.incomes` | Institution income tracking |
| `public.expenses` | Operating expenses and disbursement logs |
| `public.events` | Campus / church events, departments, and logistical checklists |
| `public.courses` | E-learning courses, modules, lessons, and certificates |

---

## 📊 Pre-built Reporting Views

- **`public.members_directory_view`**: Full names, calculated ages, contact details, and total attendance count per member.
- **`public.attendance_summary_view`**: Breakdown of attendance counts per session (Total, Present, Late, Absent, Excused).
- **`public.financial_summary_view`**: Live calculation of total inflows, expenses, and net balance.

---

## 🔌 Connecting to Frontend (`School.Web`)

1. Install Supabase client in `School.Web`:
   ```bash
   cd "School.Web"
   npm install @supabase/supabase-js
   ```

2. Copy `.env.example` to `.env.local`:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. Import the client anywhere in React:
   ```typescript
   import { supabase } from "./lib/supabaseClient";

   // Fetch members
   const { data: members, error } = await supabase
     .from("members")
     .select("*")
     .order("id");
   ```
