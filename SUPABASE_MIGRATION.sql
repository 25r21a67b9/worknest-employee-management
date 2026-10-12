-- ============================================================================
-- WORKNEST – EMPLOYEE & LEAVE MANAGEMENT SYSTEM
-- PostgreSQL / Supabase Database Migration & Row Level Security (RLS) Script
-- ============================================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- 1. DEPARTMENTS TABLE
create table if not exists public.departments (
  id text primary key,
  name text not null unique,
  code text not null unique,
  description text not null,
  head_uid text,
  head_name text not null default 'Unassigned',
  status text not null default 'Active' check (status in ('Active', 'Deactivated')),
  created_by_uid text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. PROFILES TABLE (Employee Directory & Reporting Hierarchy)
create table if not exists public.profiles (
  uid text primary key,
  owner_uid text not null,
  hr_uid text not null,
  full_name text not null,
  employee_id text not null unique,
  department_id text not null references public.departments(id),
  department_name text not null,
  designation text not null,
  role text not null default 'Employee' check (role in ('Employee', 'Manager', 'HR')),
  status text not null default 'Active' check (status in ('Active', 'Pending Approval', 'On Leave', 'Deactivated')),
  manager_uid text not null default 'unassigned',
  manager_name text not null default 'Unassigned',
  joining_date date not null default current_date,
  avatar_initials text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_manager_uid on public.profiles(manager_uid);
create index if not exists idx_profiles_department_id on public.profiles(department_id);
create index if not exists idx_profiles_role on public.profiles(role);

-- 3. PROFILE PRIVATE TABLE (Isolated PII)
create table if not exists public.profile_private (
  uid text primary key references public.profiles(uid) on delete cascade,
  owner_uid text not null,
  email text not null unique,
  contact_number text not null,
  emergency_contact text not null default '',
  address text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. ATTENDANCE RECORDS TABLE
create table if not exists public.attendance_records (
  id text primary key,
  employee_uid text not null references public.profiles(uid) on delete cascade,
  employee_id text not null,
  employee_name text not null,
  department_name text not null,
  manager_uid text not null,
  hr_uid text not null,
  date date not null,
  check_in_time text not null,
  check_out_time text not null default '',
  work_duration_minutes integer not null default 0,
  status text not null check (status in ('Present', 'Late', 'Absent', 'On Leave', 'Half Day')),
  correction_reason text not null default '',
  corrected_by_uid text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(employee_uid, date)
);

create index if not exists idx_attendance_employee_date on public.attendance_records(employee_uid, date);
create index if not exists idx_attendance_manager on public.attendance_records(manager_uid);

-- 5. LEAVE TYPES TABLE
create table if not exists public.leave_types (
  id text primary key,
  name text not null unique,
  code text not null unique,
  annual_quota_days numeric(5,1) not null default 12,
  description text not null,
  is_paid boolean not null default true,
  requires_hr_approval boolean not null default false,
  status text not null default 'Active' check (status in ('Active', 'Inactive')),
  created_by_uid text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. LEAVE BALANCES TABLE
create table if not exists public.leave_balances (
  id text primary key,
  employee_uid text not null references public.profiles(uid) on delete cascade,
  employee_id text not null,
  employee_name text not null,
  manager_uid text not null,
  hr_uid text not null,
  year integer not null,
  casual_total numeric(5,1) not null default 12,
  casual_used numeric(5,1) not null default 0,
  sick_total numeric(5,1) not null default 10,
  sick_used numeric(5,1) not null default 0,
  earned_total numeric(5,1) not null default 15,
  earned_used numeric(5,1) not null default 0,
  unpaid_used numeric(5,1) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(employee_uid, year)
);

-- 7. LEAVE REQUESTS TABLE
create table if not exists public.leave_requests (
  id text primary key,
  employee_uid text not null references public.profiles(uid) on delete cascade,
  employee_id text not null,
  employee_name text not null,
  department_name text not null,
  manager_uid text not null,
  manager_name text not null,
  hr_uid text not null,
  leave_type_code text not null,
  leave_type_name text not null,
  start_date date not null,
  end_date date not null,
  total_days numeric(5,1) not null,
  reason text not null,
  status text not null default 'Pending' check (status in ('Pending', 'Pending HR Approval', 'Approved', 'Rejected', 'Cancelled')),
  reviewer_uid text not null default '',
  reviewer_name text not null default '',
  reviewer_remarks text not null default '',
  reviewed_at text not null default '',
  balance_deducted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_leave_requests_employee on public.leave_requests(employee_uid);
create index if not exists idx_leave_requests_manager on public.leave_requests(manager_uid);

-- 8. WORKPLACE REQUESTS TABLE
create table if not exists public.workplace_requests (
  id text primary key,
  employee_uid text not null references public.profiles(uid) on delete cascade,
  employee_id text not null,
  employee_name text not null,
  department_name text not null,
  manager_uid text not null,
  manager_name text not null,
  hr_uid text not null,
  category text not null,
  title text not null,
  description text not null,
  target_date date not null,
  priority text not null check (priority in ('Low', 'Medium', 'High', 'Urgent')),
  status text not null default 'Submitted' check (status in ('Submitted', 'Under Review', 'Approved', 'Rejected', 'Resolved')),
  assigned_to_role text not null check (assigned_to_role in ('Manager', 'HR', 'IT Support')),
  reviewer_uid text not null default '',
  reviewer_name text not null default '',
  remarks text not null default '',
  resolved_at text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 9. NOTIFICATIONS TABLE
create table if not exists public.notifications (
  id text primary key,
  recipient_uid text not null references public.profiles(uid) on delete cascade,
  sender_uid text not null,
  category text not null check (category in ('Leave', 'Request', 'Attendance', 'Announcement', 'Profile')),
  title text not null,
  message text not null,
  related_entity_id text not null default '',
  related_route text not null default 'dashboard',
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 10. ANNOUNCEMENTS TABLE
create table if not exists public.announcements (
  id text primary key,
  title text not null,
  content text not null,
  target_department text not null default 'All Departments',
  priority text not null default 'Normal' check (priority in ('Normal', 'Important', 'Urgent')),
  author_uid text not null,
  author_name text not null,
  status text not null default 'Published' check (status in ('Published', 'Archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 11. HOLIDAYS TABLE
create table if not exists public.holidays (
  id text primary key,
  name text not null,
  date date not null,
  type text not null check (type in ('Public Holiday', 'Company Holiday', 'Optional Holiday')),
  description text not null default '',
  created_by_uid text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 12. AUDIT LOGS TABLE
create table if not exists public.audit_logs (
  id text primary key,
  actor_uid text not null,
  actor_name text not null,
  actor_role text not null,
  hr_uid text not null,
  action text not null,
  category text not null,
  target_id text not null,
  details text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security (RLS) on all tables
alter table public.departments enable row level security;
alter table public.profiles enable row level security;
alter table public.profile_private enable row level security;
alter table public.attendance_records enable row level security;
alter table public.leave_types enable row level security;
alter table public.leave_balances enable row level security;
alter table public.leave_requests enable row level security;
alter table public.workplace_requests enable row level security;
alter table public.notifications enable row level security;
alter table public.announcements enable row level security;
alter table public.holidays enable row level security;
alter table public.audit_logs enable row level security;
