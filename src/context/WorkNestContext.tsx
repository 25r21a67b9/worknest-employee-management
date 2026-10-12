import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  AppRoute,
  Profile,
  ProfilePrivate,
  Department,
  AttendanceRecord,
  LeaveType,
  LeaveBalance,
  LeaveRequest,
  WorkplaceRequest,
  Project,
  WorkTask,
  PerformanceReview,
  NotificationItem,
  Announcement,
  Holiday,
  CompanySettings,
  AuditLog,
  UserRole,
  EmploymentStatus,
  AttendanceStatus,
  LeaveRequestStatus,
  WorkplaceRequestCategory,
  WorkplaceRequestPriority,
  WorkplaceRequestStatus,
  ProjectStatus,
  TaskPriority,
  TaskStatus,
  PerformanceReviewStatus,
  AuditCategory,
  sanitizeId,
  sanitizeText,
  getInitials,
} from '../types/worknest';

const BOOTSTRAPPED_ADMIN_EMAIL = '25r21a67b9@mlrit.ac.in';
const LOCAL_STORAGE_KEY = 'worknest_enterprise_state_v2';
const LOCAL_SESSION_KEY = 'worknest_active_demo_uid_v2';

export interface DemoAccountCredential {
  uid: string;
  email: string;
  password: string;
  role: UserRole;
  label: string;
  fullName: string;
  employeeId: string;
  departmentName: string;
  designation: string;
}

export const DEMO_ACCOUNTS: DemoAccountCredential[] = [
  {
    uid: 'emp-eng-01',
    email: 'priya.nair@worknest.io',
    password: 'emp123',
    role: 'Employee',
    label: 'Employee Demo Account',
    fullName: 'Priya Nair',
    employeeId: 'EMP-1004',
    departmentName: 'Platform Engineering',
    designation: 'Senior Staff Engineer',
  },
  {
    uid: 'hr-admin-01',
    email: 'aarav.mehta@worknest.io',
    password: 'admin123',
    role: 'HR',
    label: 'HR / Admin Demo Account',
    fullName: 'Aarav Mehta',
    employeeId: 'EMP-1001',
    departmentName: 'People & Culture',
    designation: 'VP of People & HR Operations',
  },
  {
    uid: 'mgr-eng-01',
    email: 'marcus.vance@worknest.io',
    password: 'mgr123',
    role: 'Manager',
    label: 'Manager Demo Account',
    fullName: 'Marcus Vance',
    employeeId: 'EMP-1002',
    departmentName: 'Platform Engineering',
    designation: 'Director of Engineering',
  },
];

export interface RegistrationInput {
  fullName: string;
  email: string;
  password?: string;
  contactNumber: string;
  employeeId?: string;
  departmentId: string;
  departmentName: string;
  designation: string;
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getRelativeDateString(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface PersistedWorkspaceState {
  profiles: Profile[];
  privateProfilesMap: Record<string, ProfilePrivate>;
  departments: Department[];
  attendanceRecords: AttendanceRecord[];
  leaveTypes: LeaveType[];
  leaveBalances: LeaveBalance[];
  leaveRequests: LeaveRequest[];
  workplaceRequests: WorkplaceRequest[];
  projects: Project[];
  workTasks: WorkTask[];
  performanceReviews: PerformanceReview[];
  notifications: NotificationItem[];
  announcements: Announcement[];
  holidays: Holiday[];
  companySettings: CompanySettings;
  auditLogs: AuditLog[];
  demoPasswords: Record<string, string>;
}

function buildInitialEnterpriseState(hrUid = 'hr-admin-01', hrName = 'Aarav Mehta'): PersistedWorkspaceState {
  const today = getTodayDateString();
  const yesterday = getRelativeDateString(-1);
  const twoDaysAgo = getRelativeDateString(-2);
  const nextWeekStart = getRelativeDateString(5);
  const nextWeekEnd = getRelativeDateString(7);
  const currentYear = new Date().getFullYear();

  const companySettings: CompanySettings = {
    id: 'default',
    companyName: 'WorkNest Enterprise Inc.',
    tagline: 'Your Workplace, Connected.',
    timezone: 'UTC-05:00 (Eastern Time)',
    workingDaysCsv: 'Mon,Tue,Wed,Thu,Fri',
    workStartTime: '09:00',
    workEndTime: '18:00',
    lateGraceMinutes: 15,
    requireHrSecondApprovalForLongLeave: true,
    longLeaveThresholdDays: 5,
    autoApproveEmployeeRegistration: true,
    status: 'active',
    updatedByUid: hrUid,
  };

  const departments: Department[] = [
    {
      id: 'dept-eng',
      name: 'Platform Engineering',
      code: 'ENG',
      description: 'Core cloud architecture, frontend systems, and security infrastructure.',
      headUid: 'mgr-eng-01',
      headName: 'Marcus Vance',
      status: 'Active',
      visibility: 'organization',
      createdByUid: hrUid,
    },
    {
      id: 'dept-prod',
      name: 'Product & Design',
      code: 'PRD',
      description: 'Enterprise product management, UX research, and design systems.',
      headUid: 'mgr-prod-01',
      headName: 'Elena Rostova',
      status: 'Active',
      visibility: 'organization',
      createdByUid: hrUid,
    },
    {
      id: 'dept-hr',
      name: 'People & Culture',
      code: 'HR',
      description: 'Talent acquisition, employee relations, leave policy, and compliance.',
      headUid: hrUid,
      headName: hrName,
      status: 'Active',
      visibility: 'organization',
      createdByUid: hrUid,
    },
    {
      id: 'dept-fin',
      name: 'Finance & Operations',
      code: 'FIN',
      description: 'Corporate FP&A, payroll administration, and workplace procurement.',
      headUid: 'mgr-eng-01',
      headName: 'Marcus Vance',
      status: 'Active',
      visibility: 'organization',
      createdByUid: hrUid,
    },
  ];

  const leaveTypes: LeaveType[] = [
    {
      id: 'lt-casual',
      name: 'Casual Leave',
      code: 'CASUAL',
      annualQuotaDays: 12,
      description: 'Short-term personal leave for planned or unplanned personal matters.',
      isPaid: true,
      requiresHrApproval: false,
      status: 'Active',
      visibility: 'organization',
      createdByUid: hrUid,
    },
    {
      id: 'lt-sick',
      name: 'Sick Leave',
      code: 'SICK',
      annualQuotaDays: 10,
      description: 'Medical recovery, health appointments, and wellness rest days.',
      isPaid: true,
      requiresHrApproval: false,
      status: 'Active',
      visibility: 'organization',
      createdByUid: hrUid,
    },
    {
      id: 'lt-earned',
      name: 'Earned Leave',
      code: 'EARNED',
      annualQuotaDays: 15,
      description: 'Accrued annual vacation and extended planned time off.',
      isPaid: true,
      requiresHrApproval: true,
      status: 'Active',
      visibility: 'organization',
      createdByUid: hrUid,
    },
    {
      id: 'lt-unpaid',
      name: 'Unpaid Leave',
      code: 'UNPAID',
      annualQuotaDays: 30,
      description: 'Authorized leave without pay when paid balances are exhausted.',
      isPaid: false,
      requiresHrApproval: true,
      status: 'Active',
      visibility: 'organization',
      createdByUid: hrUid,
    },
  ];

  const profiles: Profile[] = [
    {
      uid: hrUid,
      ownerUid: hrUid,
      hrUid,
      fullName: hrName,
      employeeId: 'EMP-1001',
      departmentId: 'dept-hr',
      departmentName: 'People & Culture',
      designation: 'VP of People & HR Operations',
      role: 'HR',
      status: 'Active',
      managerUid: hrUid,
      managerName: hrName,
      joiningDate: '2023-01-15',
      avatarInitials: getInitials(hrName),
    },
    {
      uid: 'mgr-eng-01',
      ownerUid: hrUid,
      hrUid,
      fullName: 'Marcus Vance',
      employeeId: 'EMP-1002',
      departmentId: 'dept-eng',
      departmentName: 'Platform Engineering',
      designation: 'Director of Engineering',
      role: 'Manager',
      status: 'Active',
      managerUid: hrUid,
      managerName: hrName,
      joiningDate: '2023-03-10',
      avatarInitials: 'MV',
    },
    {
      uid: 'mgr-prod-01',
      ownerUid: hrUid,
      hrUid,
      fullName: 'Elena Rostova',
      employeeId: 'EMP-1003',
      departmentId: 'dept-prod',
      departmentName: 'Product & Design',
      designation: 'Head of Product Design',
      role: 'Manager',
      status: 'Active',
      managerUid: hrUid,
      managerName: hrName,
      joiningDate: '2023-06-01',
      avatarInitials: 'ER',
    },
    {
      uid: 'emp-eng-01',
      ownerUid: hrUid,
      hrUid,
      fullName: 'Priya Nair',
      employeeId: 'EMP-1004',
      departmentId: 'dept-eng',
      departmentName: 'Platform Engineering',
      designation: 'Senior Staff Engineer',
      role: 'Employee',
      status: 'Active',
      managerUid: 'mgr-eng-01',
      managerName: 'Marcus Vance',
      joiningDate: '2024-02-12',
      avatarInitials: 'PN',
    },
    {
      uid: 'emp-eng-02',
      ownerUid: hrUid,
      hrUid,
      fullName: 'David Kim',
      employeeId: 'EMP-1005',
      departmentId: 'dept-eng',
      departmentName: 'Platform Engineering',
      designation: 'Cloud Security Engineer',
      role: 'Employee',
      status: 'Active',
      managerUid: 'mgr-eng-01',
      managerName: 'Marcus Vance',
      joiningDate: '2024-05-20',
      avatarInitials: 'DK',
    },
    {
      uid: 'emp-prod-01',
      ownerUid: hrUid,
      hrUid,
      fullName: 'Sofia Alverez',
      employeeId: 'EMP-1006',
      departmentId: 'dept-prod',
      departmentName: 'Product & Design',
      designation: 'Lead Product Designer',
      role: 'Employee',
      status: 'On Leave',
      managerUid: 'mgr-prod-01',
      managerName: 'Elena Rostova',
      joiningDate: '2024-08-05',
      avatarInitials: 'SA',
    },
    {
      uid: 'emp-pending-01',
      ownerUid: hrUid,
      hrUid,
      fullName: 'Lucas Weber',
      employeeId: 'EMP-1007',
      departmentId: 'dept-fin',
      departmentName: 'Finance & Operations',
      designation: 'Financial Analyst',
      role: 'Employee',
      status: 'Pending Approval',
      managerUid: 'mgr-eng-01',
      managerName: 'Marcus Vance',
      joiningDate: today,
      avatarInitials: 'LW',
    },
  ];

  const privateProfilesMap: Record<string, ProfilePrivate> = {
    [hrUid]: {
      uid: hrUid,
      ownerUid: hrUid,
      email: 'aarav.mehta@worknest.io',
      contactNumber: '+1 (555) 234-8900',
      emergencyContact: 'Rohan Mehta · +1 (555) 234-8901',
      address: '450 Lexington Ave, Suite 1400, New York, NY',
    },
    'mgr-eng-01': {
      uid: 'mgr-eng-01',
      ownerUid: hrUid,
      email: 'marcus.vance@worknest.io',
      contactNumber: '+1 (555) 310-4401',
      emergencyContact: 'Claire Vance · +1 (555) 310-4402',
      address: '210 Hudson St, New York, NY',
    },
    'mgr-prod-01': {
      uid: 'mgr-prod-01',
      ownerUid: hrUid,
      email: 'elena.rostova@worknest.io',
      contactNumber: '+1 (555) 490-1122',
      emergencyContact: 'Viktor Rostov · +1 (555) 490-1123',
      address: '85 Broad St, New York, NY',
    },
    'emp-eng-01': {
      uid: 'emp-eng-01',
      ownerUid: hrUid,
      email: 'priya.nair@worknest.io',
      contactNumber: '+1 (555) 620-7788',
      emergencyContact: 'Arjun Nair · +1 (555) 620-7789',
      address: '1200 Park Ave, Hoboken, NJ',
    },
    'emp-eng-02': {
      uid: 'emp-eng-02',
      ownerUid: hrUid,
      email: 'david.kim@worknest.io',
      contactNumber: '+1 (555) 740-9910',
      emergencyContact: 'Grace Kim · +1 (555) 740-9911',
      address: '330 Madison Ave, New York, NY',
    },
    'emp-prod-01': {
      uid: 'emp-prod-01',
      ownerUid: hrUid,
      email: 'sofia.alverez@worknest.io',
      contactNumber: '+1 (555) 812-3344',
      emergencyContact: 'Mateo Alverez · +1 (555) 812-3345',
      address: '500 Boylston St, Boston, MA',
    },
    'emp-pending-01': {
      uid: 'emp-pending-01',
      ownerUid: hrUid,
      email: 'lucas.weber@worknest.io',
      contactNumber: '+1 (555) 901-5566',
      emergencyContact: 'Hannah Weber · +1 (555) 901-5567',
      address: '101 California St, San Francisco, CA',
    },
  };

  const leaveBalances: LeaveBalance[] = profiles.map((p) => ({
    id: `bal-${p.uid}-${currentYear}`,
    employeeUid: p.uid,
    employeeId: p.employeeId,
    employeeName: p.fullName,
    managerUid: p.managerUid,
    hrUid,
    year: currentYear,
    casualTotal: 12,
    casualUsed: p.uid === 'emp-eng-01' ? 2 : 1,
    sickTotal: 10,
    sickUsed: p.uid === 'emp-prod-01' ? 3 : 0,
    earnedTotal: 15,
    earnedUsed: p.uid === 'mgr-eng-01' ? 4 : 2,
    unpaidUsed: 0,
  }));

  const attendanceRecords: AttendanceRecord[] = [
    {
      id: `att-${hrUid}-${today}`,
      employeeUid: hrUid,
      employeeId: 'EMP-1001',
      employeeName: hrName,
      departmentName: 'People & Culture',
      managerUid: hrUid,
      hrUid,
      date: today,
      checkInTime: '08:52',
      checkOutTime: '',
      workDurationMinutes: 0,
      status: 'Present',
      correctionReason: '',
      correctedByUid: '',
    },
    {
      id: `att-mgr-eng-01-${today}`,
      employeeUid: 'mgr-eng-01',
      employeeId: 'EMP-1002',
      employeeName: 'Marcus Vance',
      departmentName: 'Platform Engineering',
      managerUid: hrUid,
      hrUid,
      date: today,
      checkInTime: '08:58',
      checkOutTime: '',
      workDurationMinutes: 0,
      status: 'Present',
      correctionReason: '',
      correctedByUid: '',
    },
    {
      id: `att-emp-eng-01-${today}`,
      employeeUid: 'emp-eng-01',
      employeeId: 'EMP-1004',
      employeeName: 'Priya Nair',
      departmentName: 'Platform Engineering',
      managerUid: 'mgr-eng-01',
      hrUid,
      date: today,
      checkInTime: '09:04',
      checkOutTime: '',
      workDurationMinutes: 0,
      status: 'Present',
      correctionReason: '',
      correctedByUid: '',
    },
    {
      id: `att-emp-eng-02-${today}`,
      employeeUid: 'emp-eng-02',
      employeeId: 'EMP-1005',
      employeeName: 'David Kim',
      departmentName: 'Platform Engineering',
      managerUid: 'mgr-eng-01',
      hrUid,
      date: today,
      checkInTime: '09:28',
      checkOutTime: '',
      workDurationMinutes: 0,
      status: 'Late',
      correctionReason: '',
      correctedByUid: '',
    },
    {
      id: `att-emp-eng-01-${yesterday}`,
      employeeUid: 'emp-eng-01',
      employeeId: 'EMP-1004',
      employeeName: 'Priya Nair',
      departmentName: 'Platform Engineering',
      managerUid: 'mgr-eng-01',
      hrUid,
      date: yesterday,
      checkInTime: '08:56',
      checkOutTime: '18:04',
      workDurationMinutes: 548,
      status: 'Present',
      correctionReason: '',
      correctedByUid: '',
    },
    {
      id: `att-emp-eng-02-${yesterday}`,
      employeeUid: 'emp-eng-02',
      employeeId: 'EMP-1005',
      employeeName: 'David Kim',
      departmentName: 'Platform Engineering',
      managerUid: 'mgr-eng-01',
      hrUid,
      date: yesterday,
      checkInTime: '09:01',
      checkOutTime: '17:55',
      workDurationMinutes: 534,
      status: 'Present',
      correctionReason: '',
      correctedByUid: '',
    },
    {
      id: `att-emp-eng-01-${twoDaysAgo}`,
      employeeUid: 'emp-eng-01',
      employeeId: 'EMP-1004',
      employeeName: 'Priya Nair',
      departmentName: 'Platform Engineering',
      managerUid: 'mgr-eng-01',
      hrUid,
      date: twoDaysAgo,
      checkInTime: '09:00',
      checkOutTime: '18:10',
      workDurationMinutes: 550,
      status: 'Present',
      correctionReason: '',
      correctedByUid: '',
    },
  ];

  const leaveRequests: LeaveRequest[] = [
    {
      id: 'lr-seed-101',
      employeeUid: 'emp-eng-01',
      employeeId: 'EMP-1004',
      employeeName: 'Priya Nair',
      departmentName: 'Platform Engineering',
      managerUid: 'mgr-eng-01',
      managerName: 'Marcus Vance',
      hrUid,
      leaveTypeCode: 'CASUAL',
      leaveTypeName: 'Casual Leave',
      startDate: nextWeekStart,
      endDate: nextWeekEnd,
      totalDays: 3,
      reason: 'Attending family wedding ceremony in Chicago; handoff notes shared with David Kim.',
      status: 'Pending',
      reviewerUid: '',
      reviewerName: '',
      reviewerRemarks: '',
      reviewedAt: '',
      balanceDeducted: false,
    },
    {
      id: 'lr-seed-102',
      employeeUid: 'emp-eng-02',
      employeeId: 'EMP-1005',
      employeeName: 'David Kim',
      departmentName: 'Platform Engineering',
      managerUid: 'mgr-eng-01',
      managerName: 'Marcus Vance',
      hrUid,
      leaveTypeCode: 'SICK',
      leaveTypeName: 'Sick Leave',
      startDate: getRelativeDateString(2),
      endDate: getRelativeDateString(2),
      totalDays: 1,
      reason: 'Scheduled dental surgery and recovery.',
      status: 'Pending',
      reviewerUid: '',
      reviewerName: '',
      reviewerRemarks: '',
      reviewedAt: '',
      balanceDeducted: false,
    },
    {
      id: 'lr-seed-103',
      employeeUid: 'emp-prod-01',
      employeeId: 'EMP-1006',
      employeeName: 'Sofia Alverez',
      departmentName: 'Product & Design',
      managerUid: 'mgr-prod-01',
      managerName: 'Elena Rostova',
      hrUid,
      leaveTypeCode: 'EARNED',
      leaveTypeName: 'Earned Leave',
      startDate: yesterday,
      endDate: getRelativeDateString(1),
      totalDays: 3,
      reason: 'Planned autumn break approved by Product Design lead.',
      status: 'Approved',
      reviewerUid: 'mgr-prod-01',
      reviewerName: 'Elena Rostova',
      reviewerRemarks: 'Approved. Design sprint deliverables are complete.',
      reviewedAt: twoDaysAgo,
      balanceDeducted: true,
    },
  ];

  const workplaceRequests: WorkplaceRequest[] = [
    {
      id: 'wpr-seed-201',
      employeeUid: 'emp-eng-01',
      employeeId: 'EMP-1004',
      employeeName: 'Priya Nair',
      departmentName: 'Platform Engineering',
      managerUid: 'mgr-eng-01',
      managerName: 'Marcus Vance',
      hrUid,
      category: 'Work From Home',
      title: 'Remote Work During HVAC Maintenance',
      description: 'Requesting to work remotely on Thursday while home utility inspection is completed.',
      targetDate: getRelativeDateString(3),
      priority: 'Medium',
      status: 'Submitted',
      assignedToRole: 'Manager',
      reviewerUid: '',
      reviewerName: '',
      remarks: '',
      resolvedAt: '',
    },
    {
      id: 'wpr-seed-202',
      employeeUid: 'emp-eng-02',
      employeeId: 'EMP-1005',
      employeeName: 'David Kim',
      departmentName: 'Platform Engineering',
      managerUid: 'mgr-eng-01',
      managerName: 'Marcus Vance',
      hrUid,
      category: 'Attendance Correction',
      title: 'Badge Reader Delay at Main Lobby Turnstile',
      description: 'Arrived at 08:55 AM today but security badge terminal was rebooting until 09:28 AM.',
      targetDate: today,
      priority: 'High',
      status: 'Submitted',
      assignedToRole: 'Manager',
      reviewerUid: '',
      reviewerName: '',
      remarks: '',
      resolvedAt: '',
    },
    {
      id: 'wpr-seed-203',
      employeeUid: 'emp-prod-01',
      employeeId: 'EMP-1006',
      employeeName: 'Sofia Alverez',
      departmentName: 'Product & Design',
      managerUid: 'mgr-prod-01',
      managerName: 'Elena Rostova',
      hrUid,
      category: 'Equipment Request',
      title: '27-inch 4K Color-Calibrated Display',
      description: 'Requesting secondary studio display for design system accessibility contrast audits.',
      targetDate: getRelativeDateString(4),
      priority: 'Medium',
      status: 'Under Review',
      assignedToRole: 'IT Support',
      reviewerUid: hrUid,
      reviewerName: hrName,
      remarks: 'Procurement checking inventory in NY office.',
      resolvedAt: '',
    },
  ];

  const projects: Project[] = [
    {
      id: 'proj-cloud-01',
      name: 'Zero-Trust Identity & SSO Gateway',
      code: 'PRJ-ZT01',
      departmentId: 'dept-eng',
      departmentName: 'Platform Engineering',
      leadUid: 'mgr-eng-01',
      leadName: 'Marcus Vance',
      hrUid,
      description:
        'Enterprise-wide migration to hardware-backed WebAuthn SSO and fine-grained RBAC service tokens across regional clusters.',
      startDate: getRelativeDateString(-20),
      deadline: getRelativeDateString(14),
      status: 'Active',
      progressPercent: 68,
      teamMemberUids: ['mgr-eng-01', 'emp-eng-01', 'emp-eng-02'],
      visibility: 'organization',
    },
    {
      id: 'proj-portal-02',
      name: 'WorkNest Mobile Self-Service Experience',
      code: 'PRJ-UX02',
      departmentId: 'dept-prod',
      departmentName: 'Product & Design',
      leadUid: 'mgr-prod-01',
      leadName: 'Elena Rostova',
      hrUid,
      description:
        'Responsive design system tokens, WCAG AA contrast audit, and streamlined leave approval workflows for tablet and mobile viewports.',
      startDate: getRelativeDateString(-15),
      deadline: getRelativeDateString(10),
      status: 'Active',
      progressPercent: 75,
      teamMemberUids: ['mgr-prod-01', 'emp-prod-01', 'emp-eng-01'],
      visibility: 'organization',
    },
    {
      id: 'proj-comp-03',
      name: 'Q4 SOC2 Type II & HR Compliance Audit',
      code: 'PRJ-HR03',
      departmentId: 'dept-hr',
      departmentName: 'People & Culture',
      leadUid: hrUid,
      leadName: hrName,
      hrUid,
      description:
        'Automated audit trail verification, employee onboarding policy enforcement, and annual leave ledger reconciliation.',
      startDate: getRelativeDateString(-30),
      deadline: getRelativeDateString(21),
      status: 'Active',
      progressPercent: 85,
      teamMemberUids: [hrUid, 'mgr-eng-01', 'emp-eng-02', 'emp-pending-01'],
      visibility: 'organization',
    },
  ];

  const workTasks: WorkTask[] = [
    {
      id: 'tsk-101',
      projectId: 'proj-cloud-01',
      projectName: 'Zero-Trust Identity & SSO Gateway',
      title: 'Implement OIDC Token Refresh & Session Revocation API',
      description:
        'Build low-latency token introspection endpoint and automatic session revocation when employee status changes.',
      assigneeUid: 'emp-eng-01',
      assigneeId: 'EMP-1004',
      assigneeName: 'Priya Nair',
      departmentName: 'Platform Engineering',
      assignedByUid: hrUid,
      assignedByName: hrName,
      hrUid,
      priority: 'Critical',
      dueDate: getRelativeDateString(3),
      status: 'In Progress',
      progressPercent: 70,
      deliverableNotes: 'Core middleware complete; running load benchmarks against staging cluster.',
    },
    {
      id: 'tsk-102',
      projectId: 'proj-portal-02',
      projectName: 'WorkNest Mobile Self-Service Experience',
      title: 'Integrate Accessible Keyboard Navigation for Approval Tables',
      description:
        'Ensure all leave and request tables support full keyboard focus rings and screen-reader announcements.',
      assigneeUid: 'emp-eng-01',
      assigneeId: 'EMP-1004',
      assigneeName: 'Priya Nair',
      departmentName: 'Platform Engineering',
      assignedByUid: 'mgr-eng-01',
      assignedByName: 'Marcus Vance',
      hrUid,
      priority: 'High',
      dueDate: getRelativeDateString(6),
      status: 'To Do',
      progressPercent: 15,
      deliverableNotes: 'Reviewed component spec with Sofia Alverez.',
    },
    {
      id: 'tsk-103',
      projectId: 'proj-cloud-01',
      projectName: 'Zero-Trust Identity & SSO Gateway',
      title: 'Configure Automated Security Rules Regression Suite',
      description:
        'Verify all 17 collection schemas against unauthorized cross-tenant read and shadow-field write attempts.',
      assigneeUid: 'emp-eng-01',
      assigneeId: 'EMP-1004',
      assigneeName: 'Priya Nair',
      departmentName: 'Platform Engineering',
      assignedByUid: 'mgr-eng-01',
      assignedByName: 'Marcus Vance',
      hrUid,
      priority: 'High',
      dueDate: yesterday,
      status: 'Completed',
      progressPercent: 100,
      deliverableNotes: 'All 12 adversarial test cases passing with zero lint warnings.',
    },
    {
      id: 'tsk-104',
      projectId: 'proj-cloud-01',
      projectName: 'Zero-Trust Identity & SSO Gateway',
      title: 'TLS 1.3 mTLS Certificate Rotation Pipeline',
      description:
        'Automate 30-day internal service certificate rotation across production Kubernetes ingress nodes.',
      assigneeUid: 'emp-eng-02',
      assigneeId: 'EMP-1005',
      assigneeName: 'David Kim',
      departmentName: 'Platform Engineering',
      assignedByUid: 'mgr-eng-01',
      assignedByName: 'Marcus Vance',
      hrUid,
      priority: 'High',
      dueDate: getRelativeDateString(4),
      status: 'In Review',
      progressPercent: 90,
      deliverableNotes: 'PR #418 submitted for Marcus Vance review.',
    },
    {
      id: 'tsk-105',
      projectId: 'proj-portal-02',
      projectName: 'WorkNest Mobile Self-Service Experience',
      title: 'Finalize High-Contrast Data Visualization Palette',
      description:
        'Deliver navy/teal/slate chart color tokens and tabular-numeral specifications for HR analytics.',
      assigneeUid: 'emp-prod-01',
      assigneeId: 'EMP-1006',
      assigneeName: 'Sofia Alverez',
      departmentName: 'Product & Design',
      assignedByUid: 'mgr-prod-01',
      assignedByName: 'Elena Rostova',
      hrUid,
      priority: 'Medium',
      dueDate: getRelativeDateString(8),
      status: 'Completed',
      progressPercent: 100,
      deliverableNotes: 'Figma tokens exported and verified in production build.',
    },
  ];

  const performanceReviews: PerformanceReview[] = [
    {
      id: 'rev-2026-q3-emp-eng-01',
      employeeUid: 'emp-eng-01',
      employeeId: 'EMP-1004',
      employeeName: 'Priya Nair',
      departmentName: 'Platform Engineering',
      designation: 'Senior Staff Engineer',
      reviewerUid: hrUid,
      reviewerName: `${hrName} & Marcus Vance`,
      hrUid,
      reviewCycle: 'Q3 2026 Performance Evaluation',
      reviewDate: getRelativeDateString(-5),
      overallRating: 4.8,
      technicalScore: 5.0,
      collaborationScore: 4.7,
      reliabilityScore: 4.8,
      keyStrengths:
        'Architected the Zero-Trust SSO gateway ahead of schedule, mentored junior engineers on security best practices, and maintained 99.98% service reliability.',
      growthAreas:
        'Continue delegating routine sprint maintenance tasks to mid-level engineers to free up bandwidth for cross-department architecture RFCs.',
      goalsNextPeriod:
        'Lead Q4 multi-region failover drill, publish 2 internal engineering RFCs, and complete Staff-to-Principal leadership track.',
      employeeSelfAssessment:
        'Delivered the OIDC token introspection service and mentored two new team members in Platform Engineering. Excited to lead the Q4 multi-region reliability initiative.',
      status: 'Published',
    },
    {
      id: 'rev-2026-q3-emp-eng-02',
      employeeUid: 'emp-eng-02',
      employeeId: 'EMP-1005',
      employeeName: 'David Kim',
      departmentName: 'Platform Engineering',
      designation: 'Cloud Security Engineer',
      reviewerUid: 'mgr-eng-01',
      reviewerName: 'Marcus Vance',
      hrUid,
      reviewCycle: 'Q3 2026 Performance Evaluation',
      reviewDate: getRelativeDateString(-6),
      overallRating: 4.5,
      technicalScore: 4.6,
      collaborationScore: 4.5,
      reliabilityScore: 4.3,
      keyStrengths:
        'Strong ownership of mTLS certificate automation and rapid response during SOC2 security audits.',
      growthAreas:
        'Ensure morning standup check-in punctuality and document runbooks prior to sprint close.',
      goalsNextPeriod:
        'Achieve zero-downtime rotation across all 4 production clusters and obtain AWS Security Specialty renewal.',
      employeeSelfAssessment:
        'Completed automated mTLS rotation pipeline and resolved 14 high-priority security findings in Q3.',
      status: 'Acknowledged',
    },
    {
      id: 'rev-2026-q3-emp-prod-01',
      employeeUid: 'emp-prod-01',
      employeeId: 'EMP-1006',
      employeeName: 'Sofia Alverez',
      departmentName: 'Product & Design',
      designation: 'Lead Product Designer',
      reviewerUid: 'mgr-prod-01',
      reviewerName: 'Elena Rostova',
      hrUid,
      reviewCycle: 'Q3 2026 Performance Evaluation',
      reviewDate: getRelativeDateString(-8),
      overallRating: 4.7,
      technicalScore: 4.8,
      collaborationScore: 4.9,
      reliabilityScore: 4.5,
      keyStrengths:
        'Elevated WorkNest UI system to WCAG AA compliance and partnered seamlessly with Platform Engineering.',
      growthAreas:
        'Expand quantitative usability metrics tracking across self-service mobile flows.',
      goalsNextPeriod:
        'Ship unified design system v3 documentation and lead Q4 customer advisory board workshops.',
      employeeSelfAssessment:
        'Focused on typography hierarchy, zero-pill metadata cleanliness, and accessible data tables.',
      status: 'Acknowledged',
    },
  ];

  const announcements: Announcement[] = [
    {
      id: 'ann-seed-01',
      title: 'Q4 Annual Performance & Career Growth Cycle Open',
      content:
        'All full-time employees and department heads can now review Q3 evaluations, submit self-assessments, and track Q4 project milestones in the Performance and Projects modules.',
      targetDepartment: 'All Departments',
      priority: 'Important',
      authorUid: hrUid,
      authorName: hrName,
      status: 'Published',
      visibility: 'organization',
    },
    {
      id: 'ann-seed-02',
      title: 'Updated Hybrid Work & Flex-Friday Guidelines',
      content:
        'WorkNest continues to support flexible hybrid collaboration. Employees planning Work From Home days should submit requests through the My Requests portal at least 24 hours in advance.',
      targetDepartment: 'All Departments',
      priority: 'Normal',
      authorUid: hrUid,
      authorName: hrName,
      status: 'Published',
      visibility: 'organization',
    },
  ];

  const holidays: Holiday[] = [
    {
      id: 'hol-seed-01',
      name: 'Veterans & Remembrance Day Observed',
      date: `${currentYear}-11-11`,
      type: 'Public Holiday',
      description: 'Federal public holiday observed across all US offices.',
      visibility: 'organization',
      createdByUid: hrUid,
    },
    {
      id: 'hol-seed-02',
      name: 'Thanksgiving Day',
      date: `${currentYear}-11-26`,
      type: 'Public Holiday',
      description: 'Annual Thanksgiving holiday closure.',
      visibility: 'organization',
      createdByUid: hrUid,
    },
    {
      id: 'hol-seed-03',
      name: 'WorkNest Year-End Wellness Recharge',
      date: `${currentYear}-12-24`,
      type: 'Company Holiday',
      description: 'Company-wide paid winter recharge day.',
      visibility: 'organization',
      createdByUid: hrUid,
    },
    {
      id: 'hol-seed-04',
      name: 'Year-End Holiday Closure',
      date: `${currentYear}-12-25`,
      type: 'Public Holiday',
      description: 'Annual winter holiday office closure.',
      visibility: 'organization',
      createdByUid: hrUid,
    },
  ];

  const notifications: NotificationItem[] = [
    {
      id: 'notif-seed-01',
      recipientUid: hrUid,
      senderUid: hrUid,
      category: 'Profile',
      title: 'New Employee Awaiting Approval',
      message:
        'Lucas Weber (EMP-1007 · Finance & Operations) registered and is awaiting HR activation.',
      relatedEntityId: 'emp-pending-01',
      relatedRoute: 'hr-employees',
      isRead: false,
    },
    {
      id: 'notif-seed-02',
      recipientUid: 'mgr-eng-01',
      senderUid: 'emp-eng-01',
      category: 'Leave',
      title: 'Leave Request Pending Review',
      message: 'Priya Nair submitted a 3-day Casual Leave application for next week.',
      relatedEntityId: 'lr-seed-101',
      relatedRoute: 'mgr-leave-approvals',
      isRead: false,
    },
    {
      id: 'notif-seed-03',
      recipientUid: 'emp-eng-01',
      senderUid: hrUid,
      category: 'Task',
      title: 'Critical Task Assigned: OIDC Token Refresh API',
      message:
        'Aarav Mehta assigned you "Implement OIDC Token Refresh & Session Revocation API" under Zero-Trust Identity & SSO Gateway.',
      relatedEntityId: 'tsk-101',
      relatedRoute: 'emp-projects',
      isRead: false,
    },
    {
      id: 'notif-seed-04',
      recipientUid: 'emp-eng-01',
      senderUid: hrUid,
      category: 'Performance',
      title: 'Q3 2026 Performance Evaluation Published',
      message:
        'Your Q3 2026 Performance Evaluation (4.8 / 5.0) has been published. Please review and acknowledge in My Performance.',
      relatedEntityId: 'rev-2026-q3-emp-eng-01',
      relatedRoute: 'emp-performance',
      isRead: false,
    },
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'log-seed-01',
      actorUid: hrUid,
      actorName: hrName,
      actorRole: 'HR',
      hrUid,
      action: 'Published Q3 Performance Reviews',
      category: 'Performance',
      targetId: 'rev-2026-q3-emp-eng-01',
      details: 'Published Q3 2026 evaluations and Q4 goals for Platform Engineering and Product Design.',
    },
    {
      id: 'log-seed-02',
      actorUid: 'mgr-eng-01',
      actorName: 'Marcus Vance',
      actorRole: 'Manager',
      hrUid,
      action: 'Assigned Engineering Sprint Tasks',
      category: 'Project',
      targetId: 'proj-cloud-01',
      details: 'Assigned OIDC Token Refresh and mTLS rotation tasks under PRJ-ZT01.',
    },
    {
      id: 'log-seed-03',
      actorUid: hrUid,
      actorName: hrName,
      actorRole: 'HR',
      hrUid,
      action: 'Workspace Initialized',
      category: 'Settings',
      targetId: 'default',
      details:
        'Initialized WorkNest enterprise departments, leave policies, projects, reviews, and org hierarchy.',
    },
  ];

  const demoPasswords: Record<string, string> = {
    'priya.nair@worknest.io': 'emp123',
    'aarav.mehta@worknest.io': 'admin123',
    'marcus.vance@worknest.io': 'mgr123',
    'elena.rostova@worknest.io': 'mgr123',
    'david.kim@worknest.io': 'emp123',
    'sofia.alverez@worknest.io': 'emp123',
    'lucas.weber@worknest.io': 'emp123',
  };

  return {
    profiles,
    privateProfilesMap,
    departments,
    attendanceRecords,
    leaveTypes,
    leaveBalances,
    leaveRequests,
    workplaceRequests,
    projects,
    workTasks,
    performanceReviews,
    notifications,
    announcements,
    holidays,
    companySettings,
    auditLogs,
    demoPasswords,
  };
}

function loadInitialState(): PersistedWorkspaceState {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedWorkspaceState>;
      const fallback = buildInitialEnterpriseState();
      return {
        profiles: parsed.profiles?.length ? parsed.profiles : fallback.profiles,
        privateProfilesMap:
          parsed.privateProfilesMap && Object.keys(parsed.privateProfilesMap).length
            ? parsed.privateProfilesMap
            : fallback.privateProfilesMap,
        departments: parsed.departments?.length ? parsed.departments : fallback.departments,
        attendanceRecords: parsed.attendanceRecords?.length
          ? parsed.attendanceRecords
          : fallback.attendanceRecords,
        leaveTypes: parsed.leaveTypes?.length ? parsed.leaveTypes : fallback.leaveTypes,
        leaveBalances: parsed.leaveBalances?.length ? parsed.leaveBalances : fallback.leaveBalances,
        leaveRequests: parsed.leaveRequests || fallback.leaveRequests,
        workplaceRequests: parsed.workplaceRequests || fallback.workplaceRequests,
        projects: parsed.projects?.length ? parsed.projects : fallback.projects,
        workTasks: parsed.workTasks?.length ? parsed.workTasks : fallback.workTasks,
        performanceReviews: parsed.performanceReviews?.length
          ? parsed.performanceReviews
          : fallback.performanceReviews,
        notifications: parsed.notifications || fallback.notifications,
        announcements: parsed.announcements?.length ? parsed.announcements : fallback.announcements,
        holidays: parsed.holidays?.length ? parsed.holidays : fallback.holidays,
        companySettings: parsed.companySettings || fallback.companySettings,
        auditLogs: parsed.auditLogs || fallback.auditLogs,
        demoPasswords: { ...fallback.demoPasswords, ...(parsed.demoPasswords || {}) },
      };
    }
  } catch (e) {
    console.warn('Unable to read persisted workspace state, using fresh enterprise seed:', e);
  }
  return buildInitialEnterpriseState();
}

interface WorkNestContextValue {
  authUser: User | null;
  isDemoSession: boolean;
  authReady: boolean;
  currentProfile: Profile | null;
  activeProfile: Profile | null;
  activePrivateProfile: ProfilePrivate | null;
  isAuthorizedAdmin: boolean;
  currentRoute: AppRoute;
  setCurrentRoute: (route: AppRoute) => void;
  // Persona / Role Switcher for immediate testing across Employee, HR/Admin, and Manager
  switchActivePersona: (profileUid: string) => void;
  switchOwnRoleForTesting: (newRole: UserRole) => Promise<void>;
  quickDemoLogin: (role: UserRole) => Promise<void>;
  // Data Collections
  profiles: Profile[];
  privateProfilesMap: Record<string, ProfilePrivate>;
  departments: Department[];
  attendanceRecords: AttendanceRecord[];
  leaveTypes: LeaveType[];
  leaveBalances: LeaveBalance[];
  leaveRequests: LeaveRequest[];
  workplaceRequests: WorkplaceRequest[];
  projects: Project[];
  workTasks: WorkTask[];
  performanceReviews: PerformanceReview[];
  notifications: NotificationItem[];
  announcements: Announcement[];
  holidays: Holiday[];
  companySettings: CompanySettings | null;
  auditLogs: AuditLog[];
  dataLoading: boolean;
  bannerMessage: { type: 'success' | 'error' | 'info'; text: string } | null;
  setBannerMessage: (msg: { type: 'success' | 'error' | 'info'; text: string } | null) => void;
  // Auth Actions
  loginWithGoogle: (pendingReg?: RegistrationInput) => Promise<void>;
  loginWithEmail: (email: string, password: string, preferredPortal?: 'Employee' | 'HR' | 'Manager') => Promise<void>;
  registerEmployee: (input: RegistrationInput) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  // Employee & Profile Actions
  updatePersonalProfile: (updates: {
    fullName: string;
    contactNumber: string;
    emergencyContact: string;
    address: string;
  }) => Promise<void>;
  // Attendance Actions
  checkInToday: () => Promise<void>;
  checkOutToday: () => Promise<void>;
  correctAttendanceRecord: (
    recordId: string,
    updates: {
      checkInTime: string;
      checkOutTime: string;
      workDurationMinutes: number;
      status: AttendanceStatus;
      correctionReason: string;
    }
  ) => Promise<void>;
  createManualAttendanceRecord: (input: {
    employeeUid: string;
    date: string;
    checkInTime: string;
    checkOutTime: string;
    workDurationMinutes: number;
    status: AttendanceStatus;
    correctionReason: string;
  }) => Promise<void>;
  // Leave Actions
  submitLeaveRequest: (input: {
    leaveTypeCode: string;
    leaveTypeName: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
  }) => Promise<void>;
  cancelLeaveRequest: (requestId: string) => Promise<void>;
  reviewLeaveRequest: (
    requestId: string,
    decision: 'Approved' | 'Rejected' | 'Pending HR Approval',
    remarks: string
  ) => Promise<void>;
  // Workplace Request Actions
  submitWorkplaceRequest: (input: {
    category: WorkplaceRequestCategory;
    title: string;
    description: string;
    targetDate: string;
    priority: WorkplaceRequestPriority;
  }) => Promise<void>;
  reviewWorkplaceRequest: (
    requestId: string,
    status: WorkplaceRequestStatus,
    remarks: string
  ) => Promise<void>;
  // Projects & Tasks (Connected Employee <-> HR/Admin Work Assignment)
  createOrUpdateProject: (input: {
    id?: string;
    name: string;
    code: string;
    departmentId: string;
    leadUid: string;
    description: string;
    startDate: string;
    deadline: string;
    status: ProjectStatus;
    progressPercent: number;
    teamMemberUids: string[];
  }) => Promise<void>;
  assignOrUpdateTask: (input: {
    id?: string;
    projectId: string;
    title: string;
    description: string;
    assigneeUid: string;
    priority: TaskPriority;
    dueDate: string;
    status: TaskStatus;
    progressPercent: number;
    deliverableNotes: string;
  }) => Promise<void>;
  updateEmployeeTaskProgress: (
    taskId: string,
    updates: {
      status: TaskStatus;
      progressPercent: number;
      deliverableNotes: string;
    }
  ) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  // Performance Reviews (Connected HR/Admin <-> Employee Reviews)
  createOrUpdatePerformanceReview: (input: {
    id?: string;
    employeeUid: string;
    reviewCycle: string;
    reviewDate: string;
    technicalScore: number;
    collaborationScore: number;
    reliabilityScore: number;
    keyStrengths: string;
    growthAreas: string;
    goalsNextPeriod: string;
    status: PerformanceReviewStatus;
  }) => Promise<void>;
  submitEmployeeSelfAssessment: (
    reviewId: string,
    selfAssessment: string,
    acknowledge: boolean
  ) => Promise<void>;
  // HR Employee / Department / Manager Actions
  hrCreateOrUpdateEmployee: (input: {
    uid?: string;
    fullName: string;
    email: string;
    contactNumber: string;
    employeeId: string;
    departmentId: string;
    designation: string;
    role: UserRole;
    status: EmploymentStatus;
    managerUid: string;
    joiningDate: string;
  }) => Promise<void>;
  hrCreateOrUpdateDepartment: (input: {
    id?: string;
    name: string;
    code: string;
    description: string;
    headUid: string;
    status: 'Active' | 'Deactivated';
  }) => Promise<void>;
  hrAssignManagerToEmployee: (employeeUid: string, managerUid: string) => Promise<void>;
  // Notifications & Announcements
  markNotificationRead: (notificationId: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  publishAnnouncement: (input: {
    title: string;
    content: string;
    targetDepartment: string;
    priority: 'Normal' | 'Important' | 'Urgent';
  }) => Promise<void>;
  archiveAnnouncement: (announcementId: string) => Promise<void>;
  // Company Settings, Leave Types & Holidays
  updateCompanySettings: (updates: Partial<CompanySettings>) => Promise<void>;
  saveLeaveType: (input: {
    id?: string;
    name: string;
    code: string;
    annualQuotaDays: number;
    description: string;
    isPaid: boolean;
    requiresHrApproval: boolean;
    status: 'Active' | 'Inactive';
  }) => Promise<void>;
  saveHoliday: (input: {
    id?: string;
    name: string;
    date: string;
    type: 'Public Holiday' | 'Company Holiday' | 'Optional Holiday';
    description: string;
  }) => Promise<void>;
  deleteHoliday: (holidayId: string) => Promise<void>;
  seedEnterpriseWorkspace: () => Promise<void>;
}

const WorkNestContext = createContext<WorkNestContextValue | undefined>(undefined);

export const WorkNestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialData = React.useMemo(() => loadInitialState(), []);

  const [authUser, setAuthUser] = useState<User | null>(null);
  const [demoSessionUid, setDemoSessionUid] = useState<string | null>(() => {
    try {
      return localStorage.getItem(LOCAL_SESSION_KEY);
    } catch {
      return null;
    }
  });
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [activePersonaUid, setActivePersonaUid] = useState<string | null>(null);
  const [isAuthorizedAdmin, setIsAuthorizedAdmin] = useState<boolean>(false);
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('welcome');

  const [profiles, setProfiles] = useState<Profile[]>(initialData.profiles);
  const [privateProfilesMap, setPrivateProfilesMap] = useState<Record<string, ProfilePrivate>>(
    initialData.privateProfilesMap
  );
  const [departments, setDepartments] = useState<Department[]>(initialData.departments);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(
    initialData.attendanceRecords
  );
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>(initialData.leaveTypes);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>(initialData.leaveBalances);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialData.leaveRequests);
  const [workplaceRequests, setWorkplaceRequests] = useState<WorkplaceRequest[]>(
    initialData.workplaceRequests
  );
  const [projects, setProjects] = useState<Project[]>(initialData.projects);
  const [workTasks, setWorkTasks] = useState<WorkTask[]>(initialData.workTasks);
  const [performanceReviews, setPerformanceReviews] = useState<PerformanceReview[]>(
    initialData.performanceReviews
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialData.notifications);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialData.announcements);
  const [holidays, setHolidays] = useState<Holiday[]>(initialData.holidays);
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(
    initialData.companySettings
  );
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialData.auditLogs);
  const [demoPasswords, setDemoPasswords] = useState<Record<string, string>>(
    initialData.demoPasswords
  );

  const [dataLoading, setDataLoading] = useState<boolean>(false);
  const [bannerMessage, setBannerMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const pendingRegistrationRef = React.useRef<RegistrationInput | null>(null);

  // Persist connected state to localStorage whenever collections change so Employee <-> HR/Admin stay 100% synced
  useEffect(() => {
    if (!companySettings) return;
    try {
      const snapshot: PersistedWorkspaceState = {
        profiles,
        privateProfilesMap,
        departments,
        attendanceRecords,
        leaveTypes,
        leaveBalances,
        leaveRequests,
        workplaceRequests,
        projects,
        workTasks,
        performanceReviews,
        notifications,
        announcements,
        holidays,
        companySettings,
        auditLogs,
        demoPasswords,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(snapshot));
    } catch (e) {
      console.warn('Could not persist state to localStorage:', e);
    }
  }, [
    profiles,
    privateProfilesMap,
    departments,
    attendanceRecords,
    leaveTypes,
    leaveBalances,
    leaveRequests,
    workplaceRequests,
    projects,
    workTasks,
    performanceReviews,
    notifications,
    announcements,
    holidays,
    companySettings,
    auditLogs,
    demoPasswords,
  ]);

  const showBanner = useCallback((type: 'success' | 'error' | 'info', text: string) => {
    setBannerMessage({ type, text });
  }, []);

  const canWriteToFirestore = useCallback(() => {
    return Boolean(auth.currentUser && auth.currentUser.emailVerified);
  }, []);

  const writeAuditLog = useCallback(
    async (
      actorProfile: Profile,
      action: string,
      category: AuditCategory,
      targetId: string,
      details: string
    ) => {
      const logId = sanitizeId(`log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
      const newLog: AuditLog = {
        id: logId,
        actorUid: actorProfile.uid,
        actorName: sanitizeText(actorProfile.fullName, 2, 100, 'WorkNest User'),
        actorRole: actorProfile.role,
        hrUid: sanitizeId(actorProfile.hrUid || 'hr-admin-01'),
        action: sanitizeText(action, 2, 120, 'System Action'),
        category,
        targetId: sanitizeId(targetId),
        details: sanitizeText(details, 2, 600, 'Completed action'),
      };
      setAuditLogs((prev) => [newLog, ...prev]);

      if (canWriteToFirestore() && auth.currentUser) {
        try {
          await setDoc(doc(db, 'audit_logs', logId), {
            ...newLog,
            actorUid: auth.currentUser.uid,
            hrUid: sanitizeId(actorProfile.hrUid || auth.currentUser.uid),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, `audit_logs/${logId}`);
        }
      }
    },
    [canWriteToFirestore]
  );

  const createNotification = useCallback(
    async (
      recipientUid: string,
      category: NotificationItem['category'],
      title: string,
      message: string,
      relatedEntityId: string,
      relatedRoute: string
    ) => {
      if (!recipientUid || recipientUid === 'unassigned') return;
      const notifId = sanitizeId(`notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
      const senderUid = auth.currentUser?.uid || activePersonaUid || 'hr-admin-01';
      const newNotif: NotificationItem = {
        id: notifId,
        recipientUid: sanitizeId(recipientUid),
        senderUid: sanitizeId(senderUid),
        category,
        title: sanitizeText(title, 2, 120, 'WorkNest Update'),
        message: sanitizeText(message, 2, 500, 'You have a new notification.'),
        relatedEntityId: sanitizeId(relatedEntityId),
        relatedRoute: sanitizeText(relatedRoute, 1, 80, 'emp-dashboard'),
        isRead: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);

      if (canWriteToFirestore() && auth.currentUser) {
        try {
          await setDoc(doc(db, 'notifications', notifId), {
            ...newNotif,
            senderUid: auth.currentUser.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, `notifications/${notifId}`);
        }
      }
    },
    [activePersonaUid, canWriteToFirestore]
  );

  // Seed initial enterprise data into Firestore for bootstrapped admin if database is empty
  const seedWorkspaceForAdmin = useCallback(async (user: User) => {
    const adminUid = user.uid;
    const adminName = sanitizeText(
      user.displayName || 'Aarav Mehta',
      2,
      100,
      'Aarav Mehta'
    );
    const adminEmail = sanitizeText(
      user.email || BOOTSTRAPPED_ADMIN_EMAIL,
      5,
      120,
      BOOTSTRAPPED_ADMIN_EMAIL
    );
    const seeded = buildInitialEnterpriseState(adminUid, adminName);

    try {
      const batch = writeBatch(db);

      batch.set(doc(db, 'admins', adminUid), {
        uid: adminUid,
        email: adminEmail,
        role: 'HR',
        grantedByUid: adminUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      batch.set(doc(db, 'company_settings', 'default'), {
        ...seeded.companySettings,
        updatedByUid: adminUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      for (const d of seeded.departments) {
        batch.set(doc(db, 'departments', d.id), {
          ...d,
          createdByUid: adminUid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      for (const lt of seeded.leaveTypes) {
        batch.set(doc(db, 'leave_types', lt.id), {
          ...lt,
          createdByUid: adminUid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      for (const p of seeded.profiles) {
        batch.set(doc(db, 'profiles', p.uid), {
          ...p,
          ownerUid: adminUid,
          hrUid: adminUid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      await batch.commit();

      const batch2 = writeBatch(db);

      for (const pp of Object.values(seeded.privateProfilesMap)) {
        batch2.set(doc(db, 'profile_private', pp.uid), {
          ...pp,
          ownerUid: adminUid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      for (const bal of seeded.leaveBalances) {
        batch2.set(doc(db, 'leave_balances', bal.id), {
          ...bal,
          hrUid: adminUid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      for (const att of seeded.attendanceRecords) {
        batch2.set(doc(db, 'attendance_records', att.id), {
          ...att,
          hrUid: adminUid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      for (const lr of seeded.leaveRequests) {
        batch2.set(doc(db, 'leave_requests', lr.id), {
          ...lr,
          hrUid: adminUid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      for (const wr of seeded.workplaceRequests) {
        batch2.set(doc(db, 'workplace_requests', wr.id), {
          ...wr,
          hrUid: adminUid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      for (const prj of seeded.projects) {
        batch2.set(doc(db, 'projects', prj.id), {
          ...prj,
          hrUid: adminUid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      for (const tsk of seeded.workTasks) {
        batch2.set(doc(db, 'work_tasks', tsk.id), {
          ...tsk,
          hrUid: adminUid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      for (const rev of seeded.performanceReviews) {
        batch2.set(doc(db, 'performance_reviews', rev.id), {
          ...rev,
          hrUid: adminUid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      for (const ann of seeded.announcements) {
        batch2.set(doc(db, 'announcements', ann.id), {
          ...ann,
          authorUid: adminUid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      for (const hol of seeded.holidays) {
        batch2.set(doc(db, 'holidays', hol.id), {
          ...hol,
          createdByUid: adminUid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      await batch2.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'seedWorkspaceForAdmin');
    }
  }, []);

  const ensureUserProfile = useCallback(
    async (user: User) => {
      const uid = user.uid;
      const isBootstrapped =
        user.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase() &&
        user.emailVerified;

      try {
        const settingsSnap = await getDoc(doc(db, 'company_settings', 'default'));
        if (!settingsSnap.exists() && isBootstrapped) {
          await seedWorkspaceForAdmin(user);
        }

        const profileRef = doc(db, 'profiles', uid);
        const profileSnap = await getDoc(profileRef);

        if (!profileSnap.exists()) {
          const pendingReg = pendingRegistrationRef.current;
          const fullName = sanitizeText(
            pendingReg?.fullName || user.displayName || user.email?.split('@')[0] || 'Employee',
            2,
            100,
            'WorkNest Employee'
          );
          const empCode = sanitizeId(
            pendingReg?.employeeId || `EMP-${Math.floor(1000 + Math.random() * 9000)}`
          ).slice(0, 32);
          const deptId = sanitizeId(pendingReg?.departmentId || 'dept-eng');
          const deptName = sanitizeText(
            pendingReg?.departmentName || 'Platform Engineering',
            2,
            80,
            'Platform Engineering'
          );
          const designation = sanitizeText(
            pendingReg?.designation ||
              (isBootstrapped ? 'VP of People & HR Operations' : 'Software Engineer'),
            2,
            80,
            'Software Engineer'
          );
          const role: UserRole = isBootstrapped ? 'HR' : 'Employee';
          const autoApprove = settingsSnap.exists()
            ? (settingsSnap.data() as CompanySettings).autoApproveEmployeeRegistration
            : true;
          const status: EmploymentStatus = isBootstrapped
            ? 'Active'
            : autoApprove
            ? 'Active'
            : 'Pending Approval';

          const newProfile: Omit<Profile, 'createdAt' | 'updatedAt'> = {
            uid,
            ownerUid: uid,
            hrUid: uid,
            fullName,
            employeeId: empCode,
            departmentId: deptId,
            departmentName: deptName,
            designation,
            role,
            status,
            managerUid: 'mgr-eng-01',
            managerName: 'Marcus Vance',
            joiningDate: getTodayDateString(),
            avatarInitials: getInitials(fullName),
          };

          await setDoc(profileRef, {
            ...newProfile,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });

          const privRef = doc(db, 'profile_private', uid);
          await setDoc(privRef, {
            uid,
            ownerUid: uid,
            email: sanitizeText(user.email || pendingReg?.email || 'employee@worknest.io', 5, 120),
            contactNumber: sanitizeText(pendingReg?.contactNumber || '+1 (555) 019-2834', 5, 30),
            emergencyContact: '',
            address: '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });

          const currentYear = new Date().getFullYear();
          const balId = sanitizeId(`bal-${uid}-${currentYear}`);
          await setDoc(doc(db, 'leave_balances', balId), {
            id: balId,
            employeeUid: uid,
            employeeId: empCode,
            employeeName: fullName,
            managerUid: 'mgr-eng-01',
            hrUid: uid,
            year: currentYear,
            casualTotal: 12,
            casualUsed: 0,
            sickTotal: 10,
            sickUsed: 0,
            earnedTotal: 15,
            earnedUsed: 0,
            unpaidUsed: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });

          pendingRegistrationRef.current = null;
        }

        if (isBootstrapped) {
          setIsAuthorizedAdmin(true);
        } else {
          const adminDoc = await getDoc(doc(db, 'admins', uid));
          setIsAuthorizedAdmin(adminDoc.exists());
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `profiles/${uid}`);
      }
    },
    [seedWorkspaceForAdmin]
  );

  // Sync Demo Session when demoSessionUid changes
  useEffect(() => {
    if (demoSessionUid && !authUser) {
      const found = profiles.find((p) => p.uid === demoSessionUid) || profiles[0];
      if (found) {
        setCurrentProfile(found);
        setActivePersonaUid(found.uid);
        setIsAuthorizedAdmin(true); // Allow full role switching in Demo Mode for testing
        setCurrentRoute((prevRoute) => {
          if (
            prevRoute === 'welcome' ||
            prevRoute === 'login' ||
            prevRoute === 'register' ||
            prevRoute === 'forgot-password' ||
            prevRoute === 'reset-password'
          ) {
            if (found.role === 'HR') return 'hr-dashboard';
            if (found.role === 'Manager') return 'mgr-dashboard';
            return 'emp-dashboard';
          }
          return prevRoute;
        });
      }
    }
  }, [demoSessionUid, authUser, profiles]);

  // Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      if (user) {
        setDataLoading(true);
        try {
          await ensureUserProfile(user);
        } catch (err) {
          console.error('Profile initialization error:', err);
        } finally {
          setDataLoading(false);
          setAuthReady(true);
        }
      } else {
        setAuthReady(true);
      }
    });
    return () => unsubscribe();
  }, [ensureUserProfile]);

  // Real-time Firestore listeners once authenticated via Firebase Auth
  useEffect(() => {
    if (!authReady || !authUser) return;

    const uid = authUser.uid;
    const isBootstrapped =
      authUser.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase() &&
      authUser.emailVerified;

    const unsubscribers: (() => void)[] = [];

    unsubscribers.push(
      onSnapshot(
        doc(db, 'profiles', uid),
        (snap) => {
          if (snap.exists()) {
            const prof = snap.data() as Profile;
            setCurrentProfile(prof);
            setActivePersonaUid((prev) => prev || prof.uid);
            setCurrentRoute((prevRoute) => {
              if (
                prevRoute === 'welcome' ||
                prevRoute === 'login' ||
                prevRoute === 'register' ||
                prevRoute === 'forgot-password' ||
                prevRoute === 'reset-password'
              ) {
                if (prof.role === 'HR') return 'hr-dashboard';
                if (prof.role === 'Manager') return 'mgr-dashboard';
                return 'emp-dashboard';
              }
              return prevRoute;
            });
          }
        },
        (err) => handleFirestoreError(err, OperationType.GET, `profiles/${uid}`)
      )
    );

    unsubscribers.push(
      onSnapshot(
        doc(db, 'company_settings', 'default'),
        (snap) => {
          if (snap.exists()) {
            setCompanySettings(snap.data() as CompanySettings);
          }
        },
        (err) => handleFirestoreError(err, OperationType.GET, 'company_settings/default')
      )
    );

    unsubscribers.push(
      onSnapshot(
        query(collection(db, 'departments'), where('visibility', '==', 'organization')),
        (snap) => {
          if (!snap.empty) setDepartments(snap.docs.map((d) => d.data() as Department));
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'departments')
      )
    );

    unsubscribers.push(
      onSnapshot(
        query(collection(db, 'leave_types'), where('visibility', '==', 'organization')),
        (snap) => {
          if (!snap.empty) setLeaveTypes(snap.docs.map((d) => d.data() as LeaveType));
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'leave_types')
      )
    );

    unsubscribers.push(
      onSnapshot(
        query(collection(db, 'holidays'), where('visibility', '==', 'organization')),
        (snap) => {
          if (!snap.empty) {
            const list = snap.docs.map((d) => d.data() as Holiday);
            list.sort((a, b) => a.date.localeCompare(b.date));
            setHolidays(list);
          }
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'holidays')
      )
    );

    unsubscribers.push(
      onSnapshot(
        query(collection(db, 'announcements'), where('visibility', '==', 'organization')),
        (snap) => {
          if (!snap.empty) setAnnouncements(snap.docs.map((d) => d.data() as Announcement));
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'announcements')
      )
    );

    unsubscribers.push(
      onSnapshot(
        query(collection(db, 'projects'), where('visibility', '==', 'organization')),
        (snap) => {
          if (!snap.empty) setProjects(snap.docs.map((d) => d.data() as Project));
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'projects')
      )
    );

    if (isBootstrapped) {
      unsubscribers.push(
        onSnapshot(
          query(collection(db, 'profiles'), where('hrUid', '==', uid)),
          (snap) => {
            if (!snap.empty) setProfiles(snap.docs.map((d) => d.data() as Profile));
          },
          (err) => handleFirestoreError(err, OperationType.LIST, 'profiles')
        )
      );

      unsubscribers.push(
        onSnapshot(
          query(collection(db, 'profile_private'), where('ownerUid', '==', uid)),
          (snap) => {
            if (!snap.empty) {
              const map: Record<string, ProfilePrivate> = {};
              snap.docs.forEach((d) => {
                const data = d.data() as ProfilePrivate;
                map[data.uid] = data;
              });
              setPrivateProfilesMap(map);
            }
          },
          (err) => handleFirestoreError(err, OperationType.LIST, 'profile_private')
        )
      );

      unsubscribers.push(
        onSnapshot(
          query(collection(db, 'attendance_records'), where('hrUid', '==', uid)),
          (snap) => {
            if (!snap.empty) {
              const list = snap.docs.map((d) => d.data() as AttendanceRecord);
              list.sort((a, b) => b.date.localeCompare(a.date));
              setAttendanceRecords(list);
            }
          },
          (err) => handleFirestoreError(err, OperationType.LIST, 'attendance_records')
        )
      );

      unsubscribers.push(
        onSnapshot(
          query(collection(db, 'leave_balances'), where('hrUid', '==', uid)),
          (snap) => {
            if (!snap.empty) setLeaveBalances(snap.docs.map((d) => d.data() as LeaveBalance));
          },
          (err) => handleFirestoreError(err, OperationType.LIST, 'leave_balances')
        )
      );

      unsubscribers.push(
        onSnapshot(
          query(collection(db, 'leave_requests'), where('hrUid', '==', uid)),
          (snap) => {
            if (!snap.empty) {
              const list = snap.docs.map((d) => d.data() as LeaveRequest);
              list.sort((a, b) => b.startDate.localeCompare(a.startDate));
              setLeaveRequests(list);
            }
          },
          (err) => handleFirestoreError(err, OperationType.LIST, 'leave_requests')
        )
      );

      unsubscribers.push(
        onSnapshot(
          query(collection(db, 'workplace_requests'), where('hrUid', '==', uid)),
          (snap) => {
            if (!snap.empty) {
              const list = snap.docs.map((d) => d.data() as WorkplaceRequest);
              list.sort((a, b) => b.targetDate.localeCompare(a.targetDate));
              setWorkplaceRequests(list);
            }
          },
          (err) => handleFirestoreError(err, OperationType.LIST, 'workplace_requests')
        )
      );

      unsubscribers.push(
        onSnapshot(
          query(collection(db, 'work_tasks'), where('hrUid', '==', uid)),
          (snap) => {
            if (!snap.empty) setWorkTasks(snap.docs.map((d) => d.data() as WorkTask));
          },
          (err) => handleFirestoreError(err, OperationType.LIST, 'work_tasks')
        )
      );

      unsubscribers.push(
        onSnapshot(
          query(collection(db, 'performance_reviews'), where('hrUid', '==', uid)),
          (snap) => {
            if (!snap.empty) {
              setPerformanceReviews(snap.docs.map((d) => d.data() as PerformanceReview));
            }
          },
          (err) => handleFirestoreError(err, OperationType.LIST, 'performance_reviews')
        )
      );
    }

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [authReady, authUser]);

  const activeProfile: Profile | null = React.useMemo(() => {
    if (activePersonaUid && profiles.length > 0) {
      const found = profiles.find((p) => p.uid === activePersonaUid);
      if (found) return found;
    }
    if (currentProfile) {
      const synced = profiles.find((p) => p.uid === currentProfile.uid);
      return synced || currentProfile;
    }
    return null;
  }, [currentProfile, activePersonaUid, profiles]);

  const activePrivateProfile: ProfilePrivate | null = React.useMemo(() => {
    if (!activeProfile) return null;
    return privateProfilesMap[activeProfile.uid] || null;
  }, [activeProfile, privateProfilesMap]);

  const switchActivePersona = useCallback(
    (profileUid: string) => {
      const target = profiles.find((p) => p.uid === profileUid);
      if (!target) return;
      setActivePersonaUid(target.uid);
      setCurrentProfile(target);
      if (!authUser) {
        setDemoSessionUid(target.uid);
        try {
          localStorage.setItem(LOCAL_SESSION_KEY, target.uid);
        } catch {
          // ignore
        }
      }
      if (target.role === 'HR') setCurrentRoute('hr-dashboard');
      else if (target.role === 'Manager') setCurrentRoute('mgr-dashboard');
      else setCurrentRoute('emp-dashboard');
      showBanner(
        'info',
        `Switched active workspace role to ${target.fullName} (${target.role} · ${target.departmentName}). All data remains connected.`
      );
    },
    [profiles, authUser, showBanner]
  );

  const switchOwnRoleForTesting = useCallback(
    async (newRole: UserRole) => {
      if (!activeProfile) return;
      setProfiles((prev) =>
        prev.map((p) => (p.uid === activeProfile.uid ? { ...p, role: newRole } : p))
      );
      if (canWriteToFirestore() && authUser) {
        try {
          await updateDoc(doc(db, 'profiles', activeProfile.uid), {
            role: newRole,
            updatedAt: serverTimestamp(),
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `profiles/${activeProfile.uid}`);
        }
      }
      if (newRole === 'HR') setCurrentRoute('hr-dashboard');
      else if (newRole === 'Manager') setCurrentRoute('mgr-dashboard');
      else setCurrentRoute('emp-dashboard');
      showBanner('success', `Updated active role to ${newRole}.`);
    },
    [activeProfile, canWriteToFirestore, authUser, showBanner]
  );

  const quickDemoLogin = useCallback(
    async (role: UserRole) => {
      const targetAccount =
        DEMO_ACCOUNTS.find((a) => a.role === role) || DEMO_ACCOUNTS[0];
      const targetProfile =
        profiles.find((p) => p.uid === targetAccount.uid) ||
        profiles.find((p) => p.role === role) ||
        profiles[0];

      if (!targetProfile) return;
      setDemoSessionUid(targetProfile.uid);
      setCurrentProfile(targetProfile);
      setActivePersonaUid(targetProfile.uid);
      setIsAuthorizedAdmin(true);
      try {
        localStorage.setItem(LOCAL_SESSION_KEY, targetProfile.uid);
      } catch {
        // ignore
      }
      if (targetProfile.role === 'HR') setCurrentRoute('hr-dashboard');
      else if (targetProfile.role === 'Manager') setCurrentRoute('mgr-dashboard');
      else setCurrentRoute('emp-dashboard');

      showBanner(
        'success',
        `Signed in as ${targetProfile.fullName} (${targetProfile.role} · ${targetProfile.employeeId}).`
      );
    },
    [profiles, showBanner]
  );

  // ============================================================================
  // AUTHENTICATION HANDLERS (Supports Demo Credentials + Firebase Auth)
  // ============================================================================

  const loginWithGoogle = async (pendingReg?: RegistrationInput) => {
    if (pendingReg) {
      pendingRegistrationRef.current = pendingReg;
    }
    await signInWithPopup(auth, googleProvider);
  };

  const loginWithEmail = async (
    email: string,
    password: string,
    preferredPortal?: 'Employee' | 'HR' | 'Manager'
  ) => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Check against local/demo accounts first so documented credentials work out-of-the-box
    const matchingPrivate = Object.values(privateProfilesMap).find(
      (pp) => pp.email.toLowerCase() === cleanEmail
    );
    const matchingDemo = DEMO_ACCOUNTS.find((d) => d.email.toLowerCase() === cleanEmail);
    const expectedPass =
      demoPasswords[cleanEmail] || matchingDemo?.password;

    if (matchingPrivate || matchingDemo) {
      if (expectedPass && password !== expectedPass) {
        throw new Error(
          `Incorrect password for ${cleanEmail}. For the demo account, use password "${expectedPass}".`
        );
      }
      const targetUid = matchingPrivate?.uid || matchingDemo?.uid;
      const targetProf =
        profiles.find((p) => p.uid === targetUid) ||
        profiles.find((p) => p.role === (preferredPortal || 'Employee'));

      if (!targetProf) {
        throw new Error('Employee profile record not found in directory.');
      }

      if (targetProf.status === 'Deactivated') {
        throw new Error(
          'This account has been deactivated by HR. Please contact People & Culture.'
        );
      }

      if (
        preferredPortal &&
        preferredPortal === 'HR' &&
        targetProf.role !== 'HR'
      ) {
        throw new Error(
          `${targetProf.fullName} (${targetProf.employeeId}) is registered with the ${targetProf.role} role and cannot sign in through the HR/Admin portal tab. Please switch to the Employee tab or use aarav.mehta@worknest.io.`
        );
      }

      setDemoSessionUid(targetProf.uid);
      setCurrentProfile(targetProf);
      setActivePersonaUid(targetProf.uid);
      setIsAuthorizedAdmin(true);
      try {
        localStorage.setItem(LOCAL_SESSION_KEY, targetProf.uid);
      } catch {
        // ignore
      }
      if (targetProf.role === 'HR') setCurrentRoute('hr-dashboard');
      else if (targetProf.role === 'Manager') setCurrentRoute('mgr-dashboard');
      else setCurrentRoute('emp-dashboard');

      showBanner(
        'success',
        `Welcome back, ${targetProf.fullName} (${targetProf.role} · ${targetProf.employeeId}).`
      );
      return;
    }

    // 2. Fallback to Firebase Email/Password if not a local/demo account
    await signInWithEmailAndPassword(auth, cleanEmail, password);
  };

  const registerEmployee = async (input: RegistrationInput) => {
    const cleanEmail = input.email.trim().toLowerCase();

    // Prevent duplicate email registrations across workspace directory
    const existingEmail = Object.values(privateProfilesMap).some(
      (pp) => pp.email.toLowerCase() === cleanEmail
    );
    if (existingEmail) {
      throw new Error(
        'An employee account with this email address is already registered. Please sign in instead.'
      );
    }

    const newUid = sanitizeId(`emp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);
    const cleanName = sanitizeText(input.fullName, 2, 100, 'Employee');
    const empCode = sanitizeId(
      input.employeeId || `EMP-${1000 + profiles.length + 1}`
    ).slice(0, 32);
    const autoApprove = companySettings ? companySettings.autoApproveEmployeeRegistration : true;
    const status: EmploymentStatus = autoApprove ? 'Active' : 'Pending Approval';

    const newProfile: Profile = {
      uid: newUid,
      ownerUid: newUid,
      hrUid: 'hr-admin-01',
      fullName: cleanName,
      employeeId: empCode,
      departmentId: sanitizeId(input.departmentId || 'dept-eng'),
      departmentName: sanitizeText(input.departmentName || 'Platform Engineering', 2, 80),
      designation: sanitizeText(input.designation || 'Software Engineer', 2, 80),
      role: 'Employee', // Public registration strictly creates an ordinary Employee account
      status,
      managerUid: 'mgr-eng-01',
      managerName: 'Marcus Vance',
      joiningDate: getTodayDateString(),
      avatarInitials: getInitials(cleanName),
    };

    const newPrivate: ProfilePrivate = {
      uid: newUid,
      ownerUid: newUid,
      email: cleanEmail,
      contactNumber: sanitizeText(input.contactNumber, 5, 30, '+1 (555) 000-0000'),
      emergencyContact: '',
      address: '',
    };

    const currentYear = new Date().getFullYear();
    const newBalance: LeaveBalance = {
      id: `bal-${newUid}-${currentYear}`,
      employeeUid: newUid,
      employeeId: empCode,
      employeeName: cleanName,
      managerUid: 'mgr-eng-01',
      hrUid: 'hr-admin-01',
      year: currentYear,
      casualTotal: 12,
      casualUsed: 0,
      sickTotal: 10,
      sickUsed: 0,
      earnedTotal: 15,
      earnedUsed: 0,
      unpaidUsed: 0,
    };

    setProfiles((prev) => [...prev, newProfile]);
    setPrivateProfilesMap((prev) => ({ ...prev, [newUid]: newPrivate }));
    setLeaveBalances((prev) => [...prev, newBalance]);
    if (input.password) {
      setDemoPasswords((prev) => ({ ...prev, [cleanEmail]: input.password! }));
    }

    await createNotification(
      'hr-admin-01',
      'Profile',
      `New Employee Registered: ${cleanName}`,
      `${cleanName} (${empCode} · ${newProfile.departmentName}) created an employee account (${status}).`,
      newUid,
      'hr-employees'
    );

    await writeAuditLog(
      newProfile,
      'Employee Account Registered',
      'Employee',
      newUid,
      `${cleanName} (${empCode}) registered in ${newProfile.departmentName} with status ${status}.`
    );

    setDemoSessionUid(newUid);
    setCurrentProfile(newProfile);
    setActivePersonaUid(newUid);
    setIsAuthorizedAdmin(true);
    try {
      localStorage.setItem(LOCAL_SESSION_KEY, newUid);
    } catch {
      // ignore
    }
    setCurrentRoute('emp-dashboard');
    showBanner(
      'success',
      status === 'Pending Approval'
        ? `Account created for ${cleanName} (${empCode}). Your profile is currently Pending HR Approval.`
        : `Welcome to WorkNest, ${cleanName} (${empCode})!`
    );
  };

  const sendPasswordReset = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const existsLocal = Object.values(privateProfilesMap).some(
      (pp) => pp.email.toLowerCase() === cleanEmail
    );
    if (existsLocal) {
      return;
    }
    await sendPasswordResetEmail(auth, cleanEmail);
  };

  const logout = async () => {
    setDemoSessionUid(null);
    setCurrentProfile(null);
    setActivePersonaUid(null);
    try {
      localStorage.removeItem(LOCAL_SESSION_KEY);
    } catch {
      // ignore
    }
    if (authUser) {
      await signOut(auth);
    }
    setCurrentRoute('welcome');
  };

  // ============================================================================
  // PROFILE UPDATE
  // ============================================================================

  const updatePersonalProfile = async (updates: {
    fullName: string;
    contactNumber: string;
    emergencyContact: string;
    address: string;
  }) => {
    if (!activeProfile) return;
    const targetUid = activeProfile.uid;
    const cleanName = sanitizeText(updates.fullName, 2, 100, activeProfile.fullName);
    const initials = getInitials(cleanName);

    setProfiles((prev) =>
      prev.map((p) =>
        p.uid === targetUid ? { ...p, fullName: cleanName, avatarInitials: initials } : p
      )
    );

    setPrivateProfilesMap((prev) => {
      const existing = prev[targetUid] || {
        uid: targetUid,
        ownerUid: targetUid,
        email: `${cleanName.toLowerCase().replace(/\s+/g, '.')}@worknest.io`,
        contactNumber: '',
        emergencyContact: '',
        address: '',
      };
      return {
        ...prev,
        [targetUid]: {
          ...existing,
          contactNumber: sanitizeText(updates.contactNumber, 5, 30, existing.contactNumber),
          emergencyContact: sanitizeText(updates.emergencyContact, 0, 120, ''),
          address: sanitizeText(updates.address, 0, 250, ''),
        },
      };
    });

    if (canWriteToFirestore()) {
      try {
        await updateDoc(doc(db, 'profiles', targetUid), {
          fullName: cleanName,
          avatarInitials: initials,
          updatedAt: serverTimestamp(),
        });
        if (privateProfilesMap[targetUid]) {
          await updateDoc(doc(db, 'profile_private', targetUid), {
            contactNumber: sanitizeText(
              updates.contactNumber,
              5,
              30,
              privateProfilesMap[targetUid].contactNumber
            ),
            emergencyContact: sanitizeText(updates.emergencyContact, 0, 120, ''),
            address: sanitizeText(updates.address, 0, 250, ''),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `profiles/${targetUid}`);
      }
    }

    await writeAuditLog(
      activeProfile,
      'Updated Personal Profile',
      'Employee',
      targetUid,
      `${cleanName} updated personal contact details.`
    );
    showBanner('success', 'Your profile details have been updated.');
  };

  // ============================================================================
  // ATTENDANCE ACTIONS
  // ============================================================================

  const checkInToday = async () => {
    if (!activeProfile) return;
    const today = getTodayDateString();
    const recordId = sanitizeId(`att-${activeProfile.uid}-${today}`);
    const existing = attendanceRecords.find(
      (r) => r.employeeUid === activeProfile.uid && r.date === today
    );
    if (existing) {
      showBanner('error', 'You have already checked in for today.');
      return;
    }

    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const timeStr = `${hh}:${mm}`;

    let status: AttendanceStatus = 'Present';
    if (companySettings) {
      const [startH, startM] = companySettings.workStartTime.split(':').map(Number);
      const thresholdMinutes = startH * 60 + startM + companySettings.lateGraceMinutes;
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      if (currentMinutes > thresholdMinutes) {
        status = 'Late';
      }
    }

    const newRecord: AttendanceRecord = {
      id: recordId,
      employeeUid: activeProfile.uid,
      employeeId: activeProfile.employeeId,
      employeeName: activeProfile.fullName,
      departmentName: activeProfile.departmentName,
      managerUid: activeProfile.managerUid,
      hrUid: activeProfile.hrUid,
      date: today,
      checkInTime: timeStr,
      checkOutTime: '',
      workDurationMinutes: 0,
      status,
      correctionReason: '',
      correctedByUid: '',
    };

    setAttendanceRecords((prev) => [newRecord, ...prev]);

    if (canWriteToFirestore()) {
      try {
        await setDoc(doc(db, 'attendance_records', recordId), {
          ...newRecord,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `attendance_records/${recordId}`);
      }
    }

    await writeAuditLog(
      activeProfile,
      'Daily Check-In',
      'Attendance',
      recordId,
      `${activeProfile.fullName} checked in at ${timeStr} (${status}).`
    );
    showBanner('success', `Checked in at ${timeStr} (${status}).`);
  };

  const checkOutToday = async () => {
    if (!activeProfile) return;
    const today = getTodayDateString();
    const existing = attendanceRecords.find(
      (r) => r.employeeUid === activeProfile.uid && r.date === today
    );
    if (!existing) {
      showBanner('error', 'You must check in before checking out.');
      return;
    }
    if (existing.checkOutTime) {
      showBanner('error', 'You have already checked out for today.');
      return;
    }

    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const checkOutStr = `${hh}:${mm}`;

    const [inH, inM] = existing.checkInTime.split(':').map(Number);
    const inMinutes = (inH || 9) * 60 + (inM || 0);
    const outMinutes = now.getHours() * 60 + now.getMinutes();
    const duration = Math.max(1, Math.min(1440, outMinutes - inMinutes));

    setAttendanceRecords((prev) =>
      prev.map((r) =>
        r.id === existing.id
          ? { ...r, checkOutTime: checkOutStr, workDurationMinutes: duration }
          : r
      )
    );

    if (canWriteToFirestore()) {
      try {
        await updateDoc(doc(db, 'attendance_records', existing.id), {
          checkOutTime: checkOutStr,
          workDurationMinutes: duration,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `attendance_records/${existing.id}`);
      }
    }

    await writeAuditLog(
      activeProfile,
      'Daily Check-Out',
      'Attendance',
      existing.id,
      `${activeProfile.fullName} checked out at ${checkOutStr} (${duration} mins worked).`
    );
    showBanner(
      'success',
      `Checked out at ${checkOutStr}. Recorded ${Math.floor(duration / 60)}h ${duration % 60}m.`
    );
  };

  const correctAttendanceRecord = async (
    recordId: string,
    updates: {
      checkInTime: string;
      checkOutTime: string;
      workDurationMinutes: number;
      status: AttendanceStatus;
      correctionReason: string;
    }
  ) => {
    if (!activeProfile) return;
    const cleanIn = sanitizeText(updates.checkInTime, 1, 40, '09:00');
    const cleanOut = sanitizeText(updates.checkOutTime, 0, 40, '');
    const cleanDur = Math.max(0, Math.min(1440, Number(updates.workDurationMinutes) || 0));
    const cleanReason = sanitizeText(
      updates.correctionReason,
      2,
      300,
      'HR administrative correction'
    );

    setAttendanceRecords((prev) =>
      prev.map((r) =>
        r.id === recordId
          ? {
              ...r,
              checkInTime: cleanIn,
              checkOutTime: cleanOut,
              workDurationMinutes: cleanDur,
              status: updates.status,
              correctionReason: cleanReason,
              correctedByUid: activeProfile.uid,
            }
          : r
      )
    );

    if (canWriteToFirestore() && auth.currentUser) {
      try {
        await updateDoc(doc(db, 'attendance_records', recordId), {
          checkInTime: cleanIn,
          checkOutTime: cleanOut,
          workDurationMinutes: cleanDur,
          status: updates.status,
          correctionReason: cleanReason,
          correctedByUid: auth.currentUser.uid,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `attendance_records/${recordId}`);
      }
    }

    const targetRecord = attendanceRecords.find((r) => r.id === recordId);
    if (targetRecord) {
      await createNotification(
        targetRecord.employeeUid,
        'Attendance',
        'Attendance Record Corrected',
        `HR updated your attendance record for ${targetRecord.date} to ${updates.status}. Reason: ${cleanReason}`,
        recordId,
        'emp-attendance'
      );
    }

    await writeAuditLog(
      activeProfile,
      'Attendance Correction',
      'Attendance',
      recordId,
      `Corrected attendance ${recordId} to ${updates.status}: ${cleanReason}`
    );
    showBanner('success', 'Attendance record updated and logged in audit history.');
  };

  const createManualAttendanceRecord = async (input: {
    employeeUid: string;
    date: string;
    checkInTime: string;
    checkOutTime: string;
    workDurationMinutes: number;
    status: AttendanceStatus;
    correctionReason: string;
  }) => {
    if (!activeProfile) return;
    const emp = profiles.find((p) => p.uid === input.employeeUid);
    if (!emp) return;
    const recordId = sanitizeId(`att-${emp.uid}-${input.date}`);

    const newRec: AttendanceRecord = {
      id: recordId,
      employeeUid: emp.uid,
      employeeId: emp.employeeId,
      employeeName: emp.fullName,
      departmentName: emp.departmentName,
      managerUid: emp.managerUid,
      hrUid: emp.hrUid,
      date: input.date,
      checkInTime: sanitizeText(input.checkInTime, 1, 40, '09:00'),
      checkOutTime: sanitizeText(input.checkOutTime, 0, 40, '18:00'),
      workDurationMinutes: Math.max(0, Math.min(1440, Number(input.workDurationMinutes) || 480)),
      status: input.status,
      correctionReason: sanitizeText(
        input.correctionReason,
        2,
        300,
        'HR manual attendance entry'
      ),
      correctedByUid: activeProfile.uid,
    };

    setAttendanceRecords((prev) => {
      const filtered = prev.filter((r) => r.id !== recordId);
      return [newRec, ...filtered];
    });

    if (canWriteToFirestore() && auth.currentUser) {
      try {
        await setDoc(doc(db, 'attendance_records', recordId), {
          ...newRec,
          correctedByUid: auth.currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `attendance_records/${recordId}`);
      }
    }

    await createNotification(
      emp.uid,
      'Attendance',
      'Attendance Entry Recorded by HR',
      `HR recorded your attendance for ${input.date} (${input.status}).`,
      recordId,
      'emp-attendance'
    );

    await writeAuditLog(
      activeProfile,
      'Manual Attendance Entry',
      'Attendance',
      recordId,
      `Created attendance entry for ${emp.fullName} on ${input.date} (${input.status}).`
    );
    showBanner('success', `Recorded attendance for ${emp.fullName} on ${input.date}.`);
  };

  // ============================================================================
  // LEAVE MANAGEMENT WORKFLOW
  // ============================================================================

  const submitLeaveRequest = async (input: {
    leaveTypeCode: string;
    leaveTypeName: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
  }) => {
    if (!activeProfile) return;

    const overlapping = leaveRequests.find(
      (lr) =>
        lr.employeeUid === activeProfile.uid &&
        (lr.status === 'Pending' ||
          lr.status === 'Pending HR Approval' ||
          lr.status === 'Approved') &&
        input.startDate <= lr.endDate &&
        input.endDate >= lr.startDate
    );
    if (overlapping) {
      showBanner(
        'error',
        `Overlapping leave request detected (${overlapping.startDate} to ${overlapping.endDate}).`
      );
      return;
    }

    const empBalance = leaveBalances.find((b) => b.employeeUid === activeProfile.uid);
    if (empBalance && input.leaveTypeCode !== 'UNPAID') {
      if (
        input.leaveTypeCode === 'CASUAL' &&
        empBalance.casualTotal - empBalance.casualUsed < input.totalDays
      ) {
        showBanner('error', 'Insufficient Casual Leave balance for the requested days.');
        return;
      }
      if (
        input.leaveTypeCode === 'SICK' &&
        empBalance.sickTotal - empBalance.sickUsed < input.totalDays
      ) {
        showBanner('error', 'Insufficient Sick Leave balance for the requested days.');
        return;
      }
      if (
        input.leaveTypeCode === 'EARNED' &&
        empBalance.earnedTotal - empBalance.earnedUsed < input.totalDays
      ) {
        showBanner('error', 'Insufficient Earned Leave balance for the requested days.');
        return;
      }
    }

    const reqId = sanitizeId(`lr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);
    const newReq: LeaveRequest = {
      id: reqId,
      employeeUid: activeProfile.uid,
      employeeId: activeProfile.employeeId,
      employeeName: activeProfile.fullName,
      departmentName: activeProfile.departmentName,
      managerUid: activeProfile.managerUid,
      managerName: activeProfile.managerName,
      hrUid: activeProfile.hrUid,
      leaveTypeCode: sanitizeId(input.leaveTypeCode).slice(0, 16),
      leaveTypeName: sanitizeText(input.leaveTypeName, 2, 60, 'Casual Leave'),
      startDate: input.startDate,
      endDate: input.endDate,
      totalDays: Math.max(0.5, Math.min(365, input.totalDays)),
      reason: sanitizeText(input.reason, 3, 500, 'Personal leave request'),
      status: 'Pending',
      reviewerUid: '',
      reviewerName: '',
      reviewerRemarks: '',
      reviewedAt: '',
      balanceDeducted: false,
    };

    setLeaveRequests((prev) => [newReq, ...prev]);

    if (canWriteToFirestore()) {
      try {
        await setDoc(doc(db, 'leave_requests', reqId), {
          ...newReq,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `leave_requests/${reqId}`);
      }
    }

    await createNotification(
      activeProfile.managerUid,
      'Leave',
      `New Leave Application: ${activeProfile.fullName}`,
      `${activeProfile.fullName} requested ${input.totalDays} day(s) of ${input.leaveTypeName} (${input.startDate} to ${input.endDate}).`,
      reqId,
      'mgr-leave-approvals'
    );

    await writeAuditLog(
      activeProfile,
      'Submitted Leave Application',
      'Leave',
      reqId,
      `${activeProfile.fullName} applied for ${input.totalDays} day(s) of ${input.leaveTypeName} (${input.startDate} to ${input.endDate}).`
    );
    showBanner(
      'success',
      `Leave request ${reqId} submitted and routed to ${activeProfile.managerName} & HR.`
    );
  };

  const cancelLeaveRequest = async (requestId: string) => {
    if (!activeProfile) return;
    const target = leaveRequests.find((r) => r.id === requestId);
    if (!target || target.status !== 'Pending') {
      showBanner('error', 'Only pending leave requests can be cancelled.');
      return;
    }

    setLeaveRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'Cancelled' } : r))
    );

    if (canWriteToFirestore()) {
      try {
        await updateDoc(doc(db, 'leave_requests', requestId), {
          status: 'Cancelled',
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `leave_requests/${requestId}`);
      }
    }

    await writeAuditLog(
      activeProfile,
      'Cancelled Leave Request',
      'Leave',
      requestId,
      `${activeProfile.fullName} cancelled pending leave application ${requestId}.`
    );
    showBanner('info', `Leave request ${requestId} has been cancelled.`);
  };

  const reviewLeaveRequest = async (
    requestId: string,
    decision: 'Approved' | 'Rejected' | 'Pending HR Approval',
    remarks: string
  ) => {
    if (!activeProfile) return;
    const req = leaveRequests.find((r) => r.id === requestId);
    if (!req) return;

    if (req.employeeUid === activeProfile.uid && activeProfile.role !== 'HR') {
      showBanner(
        'error',
        'Managers cannot approve their own leave requests. Please escalate to HR.'
      );
      return;
    }

    let finalStatus: LeaveRequestStatus = decision;
    if (
      decision === 'Approved' &&
      activeProfile.role === 'Manager' &&
      companySettings?.requireHrSecondApprovalForLongLeave &&
      req.totalDays >= (companySettings.longLeaveThresholdDays || 5)
    ) {
      finalStatus = 'Pending HR Approval';
    }

    const shouldDeductBalance = finalStatus === 'Approved' && !req.balanceDeducted;
    const cleanRemarks = sanitizeText(
      remarks,
      2,
      500,
      finalStatus === 'Approved' ? 'Approved per team schedule.' : 'Reviewed by management.'
    );
    const reviewedAtStr = getTodayDateString();

    setLeaveRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: finalStatus,
              reviewerUid: activeProfile.uid,
              reviewerName: activeProfile.fullName,
              reviewerRemarks: cleanRemarks,
              reviewedAt: reviewedAtStr,
              balanceDeducted: shouldDeductBalance ? true : r.balanceDeducted,
            }
          : r
      )
    );

    if (shouldDeductBalance) {
      const code = req.leaveTypeCode.toUpperCase();
      setLeaveBalances((prev) =>
        prev.map((b) =>
          b.employeeUid === req.employeeUid
            ? {
                ...b,
                casualUsed:
                  code === 'CASUAL' ? Math.min(100, b.casualUsed + req.totalDays) : b.casualUsed,
                sickUsed:
                  code === 'SICK' ? Math.min(100, b.sickUsed + req.totalDays) : b.sickUsed,
                earnedUsed:
                  code === 'EARNED' ? Math.min(100, b.earnedUsed + req.totalDays) : b.earnedUsed,
                unpaidUsed:
                  code === 'UNPAID' ? Math.min(365, b.unpaidUsed + req.totalDays) : b.unpaidUsed,
              }
            : b
        )
      );
    }

    if (canWriteToFirestore() && auth.currentUser) {
      try {
        await updateDoc(doc(db, 'leave_requests', requestId), {
          status: finalStatus,
          reviewerUid: auth.currentUser.uid,
          reviewerName: sanitizeText(activeProfile.fullName, 2, 100, 'Reviewer'),
          reviewerRemarks: cleanRemarks,
          reviewedAt: reviewedAtStr,
          balanceDeducted: shouldDeductBalance ? true : req.balanceDeducted,
          updatedAt: serverTimestamp(),
        });

        if (shouldDeductBalance) {
          const empBalance = leaveBalances.find((b) => b.employeeUid === req.employeeUid);
          if (empBalance) {
            const code = req.leaveTypeCode.toUpperCase();
            await updateDoc(doc(db, 'leave_balances', empBalance.id), {
              casualUsed:
                code === 'CASUAL'
                  ? Math.min(100, empBalance.casualUsed + req.totalDays)
                  : empBalance.casualUsed,
              sickUsed:
                code === 'SICK'
                  ? Math.min(100, empBalance.sickUsed + req.totalDays)
                  : empBalance.sickUsed,
              earnedUsed:
                code === 'EARNED'
                  ? Math.min(100, empBalance.earnedUsed + req.totalDays)
                  : empBalance.earnedUsed,
              unpaidUsed:
                code === 'UNPAID'
                  ? Math.min(365, empBalance.unpaidUsed + req.totalDays)
                  : empBalance.unpaidUsed,
              updatedAt: serverTimestamp(),
            });
          }
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `leave_requests/${requestId}`);
      }
    }

    await createNotification(
      req.employeeUid,
      'Leave',
      `Leave Application ${finalStatus}`,
      `Your ${req.leaveTypeName} request (${req.startDate} to ${req.endDate}) was marked ${finalStatus} by ${activeProfile.fullName}. Remarks: ${cleanRemarks}`,
      requestId,
      'emp-my-leaves'
    );

    await writeAuditLog(
      activeProfile,
      `Leave Request ${finalStatus}`,
      'Leave',
      requestId,
      `${activeProfile.fullName} marked leave request ${requestId} (${req.employeeName}) as ${finalStatus}.`
    );

    showBanner(
      'success',
      `Leave application ${requestId} marked as ${finalStatus}${
        shouldDeductBalance ? ' and leave balance updated' : ''
      }.`
    );
  };

  // ============================================================================
  // GENERAL WORKPLACE REQUESTS
  // ============================================================================

  const submitWorkplaceRequest = async (input: {
    category: WorkplaceRequestCategory;
    title: string;
    description: string;
    targetDate: string;
    priority: WorkplaceRequestPriority;
  }) => {
    if (!activeProfile) return;
    const reqId = sanitizeId(`wpr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);

    let assignedToRole: 'Manager' | 'HR' | 'IT Support' = 'Manager';
    if (input.category === 'IT Support' || input.category === 'Equipment Request') {
      assignedToRole = 'IT Support';
    } else if (input.category === 'HR Support') {
      assignedToRole = 'HR';
    }

    const newWp: WorkplaceRequest = {
      id: reqId,
      employeeUid: activeProfile.uid,
      employeeId: activeProfile.employeeId,
      employeeName: activeProfile.fullName,
      departmentName: activeProfile.departmentName,
      managerUid: activeProfile.managerUid,
      managerName: activeProfile.managerName,
      hrUid: activeProfile.hrUid,
      category: input.category,
      title: sanitizeText(input.title, 3, 120, input.category),
      description: sanitizeText(input.description, 3, 800, 'Workplace request submitted'),
      targetDate: input.targetDate,
      priority: input.priority,
      status: 'Submitted',
      assignedToRole,
      reviewerUid: '',
      reviewerName: '',
      remarks: '',
      resolvedAt: '',
    };

    setWorkplaceRequests((prev) => [newWp, ...prev]);

    if (canWriteToFirestore()) {
      try {
        await setDoc(doc(db, 'workplace_requests', reqId), {
          ...newWp,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `workplace_requests/${reqId}`);
      }
    }

    const notifyTarget =
      assignedToRole === 'Manager' ? activeProfile.managerUid : activeProfile.hrUid;
    await createNotification(
      notifyTarget,
      'Request',
      `New ${input.category} Request: ${activeProfile.fullName}`,
      `${activeProfile.fullName} submitted "${input.title}" (${input.priority} priority).`,
      reqId,
      assignedToRole === 'Manager' ? 'mgr-request-approvals' : 'hr-requests'
    );

    await writeAuditLog(
      activeProfile,
      'Submitted Workplace Request',
      'Request',
      reqId,
      `${activeProfile.fullName} submitted ${input.category} request "${input.title}".`
    );
    showBanner('success', `Request ${reqId} submitted and routed to ${assignedToRole}.`);
  };

  const reviewWorkplaceRequest = async (
    requestId: string,
    status: WorkplaceRequestStatus,
    remarks: string
  ) => {
    if (!activeProfile) return;
    const req = workplaceRequests.find((r) => r.id === requestId);
    if (!req) return;

    if (req.employeeUid === activeProfile.uid && activeProfile.role !== 'HR') {
      showBanner('error', 'Managers cannot approve their own workplace requests.');
      return;
    }

    const cleanRemarks = sanitizeText(
      remarks,
      2,
      500,
      `Marked ${status} by ${activeProfile.fullName}.`
    );
    const resolvedAtStr =
      status === 'Approved' || status === 'Rejected' || status === 'Resolved'
        ? getTodayDateString()
        : '';

    setWorkplaceRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status,
              reviewerUid: activeProfile.uid,
              reviewerName: activeProfile.fullName,
              remarks: cleanRemarks,
              resolvedAt: resolvedAtStr,
            }
          : r
      )
    );

    if (canWriteToFirestore() && auth.currentUser) {
      try {
        await updateDoc(doc(db, 'workplace_requests', requestId), {
          status,
          reviewerUid: auth.currentUser.uid,
          reviewerName: sanitizeText(activeProfile.fullName, 2, 100, 'Reviewer'),
          remarks: cleanRemarks,
          resolvedAt: resolvedAtStr,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `workplace_requests/${requestId}`);
      }
    }

    await createNotification(
      req.employeeUid,
      'Request',
      `Workplace Request ${status}`,
      `Your ${req.category} request ("${req.title}") is now ${status}. Notes: ${cleanRemarks}`,
      requestId,
      'emp-my-requests'
    );

    await writeAuditLog(
      activeProfile,
      `Workplace Request ${status}`,
      'Request',
      requestId,
      `${activeProfile.fullName} updated request ${requestId} (${req.title}) to ${status}.`
    );
    showBanner('success', `Request ${requestId} updated to ${status}.`);
  };

  // ============================================================================
  // PROJECTS & WORK TASKS (Connected HR/Admin <-> Employee Work Assignment)
  // ============================================================================

  const createOrUpdateProject = async (input: {
    id?: string;
    name: string;
    code: string;
    departmentId: string;
    leadUid: string;
    description: string;
    startDate: string;
    deadline: string;
    status: ProjectStatus;
    progressPercent: number;
    teamMemberUids: string[];
  }) => {
    if (!activeProfile) return;
    const isNew = !input.id;
    const prjId = sanitizeId(
      input.id || `proj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    );
    const dept = departments.find((d) => d.id === input.departmentId) || departments[0];
    const lead = profiles.find((p) => p.uid === input.leadUid) || activeProfile;
    const boundedTeam = Array.from(new Set([lead.uid, ...input.teamMemberUids])).slice(0, 10);

    const projectRecord: Project = {
      id: prjId,
      name: sanitizeText(input.name, 2, 120, 'Enterprise Project'),
      code: sanitizeId(input.code.toUpperCase()).slice(0, 24),
      departmentId: dept ? dept.id : 'dept-eng',
      departmentName: dept ? dept.name : 'Platform Engineering',
      leadUid: lead.uid,
      leadName: lead.fullName,
      hrUid: activeProfile.hrUid || 'hr-admin-01',
      description: sanitizeText(input.description, 3, 800, 'Project scope and objectives.'),
      startDate: input.startDate || getTodayDateString(),
      deadline: input.deadline || getRelativeDateString(14),
      status: input.status,
      progressPercent: Math.max(0, Math.min(100, Number(input.progressPercent) || 0)),
      teamMemberUids: boundedTeam,
      visibility: 'organization',
    };

    setProjects((prev) => {
      if (isNew) return [projectRecord, ...prev];
      return prev.map((p) => (p.id === prjId ? projectRecord : p));
    });

    if (canWriteToFirestore() && auth.currentUser) {
      try {
        await setDoc(doc(db, 'projects', prjId), {
          ...projectRecord,
          hrUid: auth.currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `projects/${prjId}`);
      }
    }

    if (isNew) {
      for (const memberUid of boundedTeam) {
        if (memberUid !== activeProfile.uid) {
          await createNotification(
            memberUid,
            'Task',
            `Assigned to Project: ${projectRecord.name}`,
            `You have been assigned to project ${projectRecord.name} (${projectRecord.code}) led by ${lead.fullName}.`,
            prjId,
            'emp-projects'
          );
        }
      }
    }

    await writeAuditLog(
      activeProfile,
      isNew ? 'Created Project' : 'Updated Project',
      'Project',
      prjId,
      `${isNew ? 'Created' : 'Updated'} project "${projectRecord.name}" (${projectRecord.code}) · Status: ${projectRecord.status}`
    );
    showBanner('success', `Project "${projectRecord.name}" saved and synchronized.`);
  };

  const assignOrUpdateTask = async (input: {
    id?: string;
    projectId: string;
    title: string;
    description: string;
    assigneeUid: string;
    priority: TaskPriority;
    dueDate: string;
    status: TaskStatus;
    progressPercent: number;
    deliverableNotes: string;
  }) => {
    if (!activeProfile) return;
    const isNew = !input.id;
    const taskId = sanitizeId(
      input.id || `tsk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    );
    const prj = projects.find((p) => p.id === input.projectId) || projects[0];
    const emp = profiles.find((p) => p.uid === input.assigneeUid) || profiles[0];
    if (!emp) return;

    const progress =
      input.status === 'Completed'
        ? 100
        : Math.max(0, Math.min(100, Number(input.progressPercent) || 0));

    const taskRecord: WorkTask = {
      id: taskId,
      projectId: prj ? prj.id : 'proj-cloud-01',
      projectName: prj ? prj.name : 'General Initiative',
      title: sanitizeText(input.title, 2, 140, 'Assigned Deliverable'),
      description: sanitizeText(input.description, 2, 800, 'Task requirements and scope.'),
      assigneeUid: emp.uid,
      assigneeId: emp.employeeId,
      assigneeName: emp.fullName,
      departmentName: emp.departmentName,
      assignedByUid: activeProfile.uid,
      assignedByName: activeProfile.fullName,
      hrUid: activeProfile.hrUid || 'hr-admin-01',
      priority: input.priority,
      dueDate: input.dueDate || getRelativeDateString(7),
      status: input.status,
      progressPercent: progress,
      deliverableNotes: sanitizeText(input.deliverableNotes, 0, 600, ''),
    };

    // Ensure employee is also included in the project's teamMemberUids
    if (prj && !prj.teamMemberUids.includes(emp.uid) && prj.teamMemberUids.length < 10) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === prj.id
            ? { ...p, teamMemberUids: [...p.teamMemberUids, emp.uid] }
            : p
        )
      );
    }

    setWorkTasks((prev) => {
      if (isNew) return [taskRecord, ...prev];
      return prev.map((t) => (t.id === taskId ? taskRecord : t));
    });

    if (canWriteToFirestore() && auth.currentUser) {
      try {
        await setDoc(doc(db, 'work_tasks', taskId), {
          ...taskRecord,
          assignedByUid: auth.currentUser.uid,
          hrUid: auth.currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `work_tasks/${taskId}`);
      }
    }

    await createNotification(
      emp.uid,
      'Task',
      isNew ? `New Task Assigned: ${taskRecord.title}` : `Task Updated: ${taskRecord.title}`,
      `${activeProfile.fullName} assigned "${taskRecord.title}" (${taskRecord.priority} priority, due ${taskRecord.dueDate}) under ${taskRecord.projectName}.`,
      taskId,
      'emp-projects'
    );

    await writeAuditLog(
      activeProfile,
      isNew ? 'Assigned Employee Task' : 'Updated Employee Task',
      'Project',
      taskId,
      `${isNew ? 'Assigned' : 'Updated'} task "${taskRecord.title}" for ${emp.fullName} (${emp.employeeId}) · Due: ${taskRecord.dueDate}`
    );
    showBanner('success', `Task "${taskRecord.title}" assigned to ${emp.fullName}.`);
  };

  const updateEmployeeTaskProgress = async (
    taskId: string,
    updates: {
      status: TaskStatus;
      progressPercent: number;
      deliverableNotes: string;
    }
  ) => {
    if (!activeProfile) return;
    const target = workTasks.find((t) => t.id === taskId);
    if (!target) return;

    const cleanProgress =
      updates.status === 'Completed'
        ? 100
        : updates.status === 'To Do' && updates.progressPercent === 100
        ? 0
        : Math.max(0, Math.min(100, Number(updates.progressPercent) || 0));
    const cleanStatus: TaskStatus =
      cleanProgress === 100 ? 'Completed' : updates.status;
    const cleanNotes = sanitizeText(updates.deliverableNotes, 0, 600, '');

    const updatedTasks = workTasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            status: cleanStatus,
            progressPercent: cleanProgress,
            deliverableNotes: cleanNotes,
          }
        : t
    );
    setWorkTasks(updatedTasks);

    // Automatically recalculate parent project progressPercent from its linked tasks
    const projectTasks = updatedTasks.filter((t) => t.projectId === target.projectId);
    if (projectTasks.length > 0) {
      const avgProgress = Math.round(
        projectTasks.reduce((acc, item) => acc + item.progressPercent, 0) / projectTasks.length
      );
      setProjects((prev) =>
        prev.map((p) =>
          p.id === target.projectId
            ? {
                ...p,
                progressPercent: avgProgress,
                status: avgProgress === 100 ? 'Completed' : p.status,
              }
            : p
        )
      );
    }

    if (canWriteToFirestore()) {
      try {
        await updateDoc(doc(db, 'work_tasks', taskId), {
          status: cleanStatus,
          progressPercent: cleanProgress,
          deliverableNotes: cleanNotes,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `work_tasks/${taskId}`);
      }
    }

    await createNotification(
      target.assignedByUid || 'hr-admin-01',
      'Task',
      `Task Progress Updated: ${target.title}`,
      `${activeProfile.fullName} updated "${target.title}" to ${cleanStatus} (${cleanProgress}%).`,
      taskId,
      'hr-work'
    );

    await writeAuditLog(
      activeProfile,
      'Updated Task Progress',
      'Project',
      taskId,
      `${activeProfile.fullName} updated task "${target.title}" to ${cleanStatus} (${cleanProgress}%).`
    );
    showBanner('success', `Task "${target.title}" updated to ${cleanStatus} (${cleanProgress}%).`);
  };

  const deleteTask = async (taskId: string) => {
    if (!activeProfile) return;
    setWorkTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (canWriteToFirestore()) {
      try {
        await deleteDoc(doc(db, 'work_tasks', taskId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `work_tasks/${taskId}`);
      }
    }
    showBanner('info', 'Task removed.');
  };

  // ============================================================================
  // PERFORMANCE REVIEWS (Connected HR/Admin <-> Employee Performance)
  // ============================================================================

  const createOrUpdatePerformanceReview = async (input: {
    id?: string;
    employeeUid: string;
    reviewCycle: string;
    reviewDate: string;
    technicalScore: number;
    collaborationScore: number;
    reliabilityScore: number;
    keyStrengths: string;
    growthAreas: string;
    goalsNextPeriod: string;
    status: PerformanceReviewStatus;
  }) => {
    if (!activeProfile) return;
    const isNew = !input.id;
    const revId = sanitizeId(
      input.id || `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    );
    const emp = profiles.find((p) => p.uid === input.employeeUid);
    if (!emp) return;

    const tech = Math.max(1, Math.min(5, Number(input.technicalScore) || 4));
    const collab = Math.max(1, Math.min(5, Number(input.collaborationScore) || 4));
    const rel = Math.max(1, Math.min(5, Number(input.reliabilityScore) || 4));
    const overall = Number(((tech + collab + rel) / 3).toFixed(1));

    const existingRev = performanceReviews.find((r) => r.id === revId);

    const reviewRecord: PerformanceReview = {
      id: revId,
      employeeUid: emp.uid,
      employeeId: emp.employeeId,
      employeeName: emp.fullName,
      departmentName: emp.departmentName,
      designation: emp.designation,
      reviewerUid: activeProfile.uid,
      reviewerName: activeProfile.fullName,
      hrUid: activeProfile.hrUid || 'hr-admin-01',
      reviewCycle: sanitizeText(input.reviewCycle, 2, 60, 'Annual Performance Review'),
      reviewDate: input.reviewDate || getTodayDateString(),
      overallRating: overall,
      technicalScore: tech,
      collaborationScore: collab,
      reliabilityScore: rel,
      keyStrengths: sanitizeText(input.keyStrengths, 2, 800, 'Consistent delivery and teamwork.'),
      growthAreas: sanitizeText(input.growthAreas, 2, 800, 'Continue expanding domain leadership.'),
      goalsNextPeriod: sanitizeText(input.goalsNextPeriod, 2, 800, 'Deliver upcoming roadmap milestones.'),
      employeeSelfAssessment: existingRev?.employeeSelfAssessment || '',
      status: input.status,
    };

    setPerformanceReviews((prev) => {
      if (isNew) return [reviewRecord, ...prev];
      return prev.map((r) => (r.id === revId ? reviewRecord : r));
    });

    if (canWriteToFirestore() && auth.currentUser) {
      try {
        await setDoc(doc(db, 'performance_reviews', revId), {
          ...reviewRecord,
          reviewerUid: auth.currentUser.uid,
          hrUid: auth.currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `performance_reviews/${revId}`);
      }
    }

    if (input.status === 'Published') {
      await createNotification(
        emp.uid,
        'Performance',
        `Performance Review Published: ${reviewRecord.reviewCycle}`,
        `${activeProfile.fullName} published your ${reviewRecord.reviewCycle} (${overall} / 5.0). View details and add your self-assessment in My Performance.`,
        revId,
        'emp-performance'
      );
    }

    await writeAuditLog(
      activeProfile,
      isNew ? 'Created Performance Review' : 'Updated Performance Review',
      'Performance',
      revId,
      `${isNew ? 'Created' : 'Updated'} ${reviewRecord.reviewCycle} for ${emp.fullName} (${overall}/5.0 · ${reviewRecord.status}).`
    );
    showBanner(
      'success',
      `Performance review for ${emp.fullName} (${overall} / 5.0) saved as ${reviewRecord.status}.`
    );
  };

  const submitEmployeeSelfAssessment = async (
    reviewId: string,
    selfAssessment: string,
    acknowledge: boolean
  ) => {
    if (!activeProfile) return;
    const target = performanceReviews.find((r) => r.id === reviewId);
    if (!target) return;

    const cleanAssessment = sanitizeText(
      selfAssessment,
      2,
      800,
      'Reviewed evaluation and aligned on next-period goals.'
    );
    const nextStatus: PerformanceReviewStatus = acknowledge ? 'Acknowledged' : target.status;

    setPerformanceReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              employeeSelfAssessment: cleanAssessment,
              status: nextStatus,
            }
          : r
      )
    );

    if (canWriteToFirestore()) {
      try {
        await updateDoc(doc(db, 'performance_reviews', reviewId), {
          employeeSelfAssessment: cleanAssessment,
          status: nextStatus,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `performance_reviews/${reviewId}`);
      }
    }

    await createNotification(
      target.hrUid || 'hr-admin-01',
      'Performance',
      `Review ${acknowledge ? 'Acknowledged' : 'Response Updated'}: ${activeProfile.fullName}`,
      `${activeProfile.fullName} submitted self-assessment notes for ${target.reviewCycle}.`,
      reviewId,
      'hr-reviews'
    );

    await writeAuditLog(
      activeProfile,
      acknowledge ? 'Acknowledged Performance Review' : 'Updated Self-Assessment',
      'Performance',
      reviewId,
      `${activeProfile.fullName} updated self-assessment for ${target.reviewCycle} (${nextStatus}).`
    );
    showBanner(
      'success',
      acknowledge
        ? 'Performance review acknowledged and synced with HR.'
        : 'Self-assessment response saved.'
    );
  };

  // ============================================================================
  // HR / ADMINISTRATOR OPERATIONS
  // ============================================================================

  const hrCreateOrUpdateEmployee = async (input: {
    uid?: string;
    fullName: string;
    email: string;
    contactNumber: string;
    employeeId: string;
    departmentId: string;
    designation: string;
    role: UserRole;
    status: EmploymentStatus;
    managerUid: string;
    joiningDate: string;
  }) => {
    if (!activeProfile) return;
    const isNew = !input.uid;
    const targetUid = sanitizeId(
      input.uid || `emp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    );
    const dept = departments.find((d) => d.id === input.departmentId) || departments[0];
    const deptId = dept ? dept.id : 'dept-eng';
    const deptName = dept ? dept.name : 'Platform Engineering';
    const mgr = profiles.find((p) => p.uid === input.managerUid);
    const managerUid = mgr ? mgr.uid : 'mgr-eng-01';
    const managerName = mgr ? mgr.fullName : 'Marcus Vance';
    const cleanName = sanitizeText(input.fullName, 2, 100, 'Employee');
    const cleanEmpId = sanitizeId(input.employeeId).slice(0, 32);
    const cleanEmail = sanitizeText(input.email, 5, 120, 'employee@worknest.io').toLowerCase();

    const updatedProfile: Profile = {
      uid: targetUid,
      ownerUid: activeProfile.uid,
      hrUid: activeProfile.hrUid || 'hr-admin-01',
      fullName: cleanName,
      employeeId: cleanEmpId,
      departmentId: deptId,
      departmentName: deptName,
      designation: sanitizeText(input.designation, 2, 80, 'Specialist'),
      role: input.role,
      status: input.status,
      managerUid,
      managerName,
      joiningDate: input.joiningDate || getTodayDateString(),
      avatarInitials: getInitials(cleanName),
    };

    const updatedPrivate: ProfilePrivate = {
      uid: targetUid,
      ownerUid: activeProfile.uid,
      email: cleanEmail,
      contactNumber: sanitizeText(input.contactNumber, 5, 30, '+1 (555) 010-0000'),
      emergencyContact: privateProfilesMap[targetUid]?.emergencyContact || '',
      address: privateProfilesMap[targetUid]?.address || '',
    };

    setProfiles((prev) => {
      if (isNew) return [...prev, updatedProfile];
      return prev.map((p) => (p.uid === targetUid ? updatedProfile : p));
    });

    setPrivateProfilesMap((prev) => ({
      ...prev,
      [targetUid]: updatedPrivate,
    }));

    if (isNew) {
      const currentYear = new Date().getFullYear();
      const balId = sanitizeId(`bal-${targetUid}-${currentYear}`);
      setLeaveBalances((prev) => [
        ...prev,
        {
          id: balId,
          employeeUid: targetUid,
          employeeId: cleanEmpId,
          employeeName: cleanName,
          managerUid,
          hrUid: activeProfile.hrUid || 'hr-admin-01',
          year: currentYear,
          casualTotal: 12,
          casualUsed: 0,
          sickTotal: 10,
          sickUsed: 0,
          earnedTotal: 15,
          earnedUsed: 0,
          unpaidUsed: 0,
        },
      ]);
      setDemoPasswords((prev) => ({ ...prev, [cleanEmail]: 'emp123' }));
    } else {
      setLeaveBalances((prev) =>
        prev.map((b) =>
          b.employeeUid === targetUid ? { ...b, managerUid, employeeName: cleanName } : b
        )
      );
    }

    if (canWriteToFirestore() && auth.currentUser) {
      try {
        await setDoc(doc(db, 'profiles', targetUid), {
          ...updatedProfile,
          ownerUid: auth.currentUser.uid,
          hrUid: auth.currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        await setDoc(doc(db, 'profile_private', targetUid), {
          ...updatedPrivate,
          ownerUid: auth.currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `profiles/${targetUid}`);
      }
    }

    await createNotification(
      targetUid,
      'Profile',
      isNew ? 'Welcome to WorkNest' : 'Employee Record Updated by HR',
      `${cleanName} (${cleanEmpId}) is assigned to ${deptName} (${input.designation}) reporting to ${managerName}.`,
      targetUid,
      'emp-profile'
    );

    await writeAuditLog(
      activeProfile,
      isNew ? 'Added Employee Record' : 'Updated Employee Record',
      'Employee',
      targetUid,
      `${isNew ? 'Created' : 'Updated'} ${cleanName} (${cleanEmpId}) · Role: ${input.role} · Status: ${input.status} · Manager: ${managerName}`
    );
    showBanner('success', `Employee record for ${cleanName} saved.`);
  };

  const hrAssignManagerToEmployee = async (employeeUid: string, managerUid: string) => {
    if (!activeProfile) return;
    const emp = profiles.find((p) => p.uid === employeeUid);
    const mgr = profiles.find((p) => p.uid === managerUid);
    if (!emp || !mgr) return;
    if (emp.uid === mgr.uid && mgr.role !== 'HR') {
      showBanner('error', 'An employee cannot be assigned as their own reporting manager.');
      return;
    }

    setProfiles((prev) =>
      prev.map((p) =>
        p.uid === emp.uid ? { ...p, managerUid: mgr.uid, managerName: mgr.fullName } : p
      )
    );
    setLeaveBalances((prev) =>
      prev.map((b) => (b.employeeUid === emp.uid ? { ...b, managerUid: mgr.uid } : b))
    );
    setLeaveRequests((prev) =>
      prev.map((lr) =>
        lr.employeeUid === emp.uid && lr.status === 'Pending'
          ? { ...lr, managerUid: mgr.uid, managerName: mgr.fullName }
          : lr
      )
    );
    setWorkplaceRequests((prev) =>
      prev.map((wr) =>
        wr.employeeUid === emp.uid &&
        wr.status === 'Submitted' &&
        wr.assignedToRole === 'Manager'
          ? { ...wr, managerUid: mgr.uid, managerName: mgr.fullName }
          : wr
      )
    );

    if (canWriteToFirestore()) {
      try {
        await updateDoc(doc(db, 'profiles', emp.uid), {
          managerUid: mgr.uid,
          managerName: mgr.fullName,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `profiles/${emp.uid}`);
      }
    }

    await createNotification(
      emp.uid,
      'Profile',
      'Reporting Manager Updated',
      `HR assigned ${mgr.fullName} as your reporting manager.`,
      emp.uid,
      'emp-profile'
    );

    await writeAuditLog(
      activeProfile,
      'Updated Reporting Relationship',
      'Manager',
      emp.uid,
      `Assigned ${emp.fullName} (${emp.employeeId}) to report to ${mgr.fullName}.`
    );
    showBanner('success', `Assigned ${emp.fullName} to ${mgr.fullName}.`);
  };

  const hrCreateOrUpdateDepartment = async (input: {
    id?: string;
    name: string;
    code: string;
    description: string;
    headUid: string;
    status: 'Active' | 'Deactivated';
  }) => {
    if (!activeProfile) return;
    const isNew = !input.id;
    const deptId = sanitizeId(
      input.id || `dept-${input.code.toLowerCase()}-${Date.now().toString().slice(-4)}`
    );
    const headProfile = profiles.find((p) => p.uid === input.headUid);
    const headUid = headProfile ? headProfile.uid : activeProfile.uid;
    const headName = headProfile ? headProfile.fullName : activeProfile.fullName;

    const deptRecord: Department = {
      id: deptId,
      name: sanitizeText(input.name, 2, 80, 'Department'),
      code: sanitizeId(input.code.toUpperCase()).slice(0, 20),
      description: sanitizeText(input.description, 2, 300, 'Company department'),
      headUid,
      headName,
      status: input.status,
      visibility: 'organization',
      createdByUid: activeProfile.uid,
    };

    setDepartments((prev) => {
      if (isNew) return [...prev, deptRecord];
      return prev.map((d) => (d.id === deptId ? deptRecord : d));
    });

    if (headProfile && headProfile.role === 'Employee') {
      setProfiles((prev) =>
        prev.map((p) => (p.uid === headProfile.uid ? { ...p, role: 'Manager' } : p))
      );
    }

    if (canWriteToFirestore() && auth.currentUser) {
      try {
        await setDoc(doc(db, 'departments', deptId), {
          ...deptRecord,
          createdByUid: auth.currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `departments/${deptId}`);
      }
    }

    await writeAuditLog(
      activeProfile,
      isNew ? 'Created Department' : 'Updated Department',
      'Department',
      deptId,
      `${isNew ? 'Created' : 'Updated'} department ${input.name} (${input.code}) headed by ${headName}.`
    );
    showBanner('success', `Department "${input.name}" saved.`);
  };

  // ============================================================================
  // NOTIFICATIONS & ANNOUNCEMENTS
  // ============================================================================

  const markNotificationRead = async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
    if (canWriteToFirestore()) {
      try {
        await updateDoc(doc(db, 'notifications', notificationId), {
          isRead: true,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `notifications/${notificationId}`);
      }
    }
  };

  const markAllNotificationsRead = async () => {
    if (!activeProfile) return;
    setNotifications((prev) =>
      prev.map((n) =>
        n.recipientUid === activeProfile.uid || isAuthorizedAdmin
          ? { ...n, isRead: true }
          : n
      )
    );
    showBanner('success', 'All notifications marked as read.');
  };

  const publishAnnouncement = async (input: {
    title: string;
    content: string;
    targetDepartment: string;
    priority: 'Normal' | 'Important' | 'Urgent';
  }) => {
    if (!activeProfile) return;
    const annId = sanitizeId(`ann-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);

    const newAnn: Announcement = {
      id: annId,
      title: sanitizeText(input.title, 3, 140, 'Company Announcement'),
      content: sanitizeText(input.content, 5, 1500, 'Announcement details'),
      targetDepartment: sanitizeText(input.targetDepartment, 1, 80, 'All Departments'),
      priority: input.priority,
      authorUid: activeProfile.uid,
      authorName: sanitizeText(activeProfile.fullName, 2, 100, 'HR Administration'),
      status: 'Published',
      visibility: 'organization',
    };

    setAnnouncements((prev) => [newAnn, ...prev]);

    if (canWriteToFirestore() && auth.currentUser) {
      try {
        await setDoc(doc(db, 'announcements', annId), {
          ...newAnn,
          authorUid: auth.currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `announcements/${annId}`);
      }
    }

    const recipients = profiles.filter(
      (p) =>
        p.status === 'Active' &&
        (input.targetDepartment === 'All Departments' ||
          p.departmentName === input.targetDepartment)
    );
    for (const rec of recipients.slice(0, 10)) {
      await createNotification(
        rec.uid,
        'Announcement',
        `Announcement: ${input.title}`,
        input.content.slice(0, 180),
        annId,
        rec.role === 'HR'
          ? 'hr-announcements'
          : rec.role === 'Manager'
          ? 'mgr-announcements'
          : 'emp-announcements'
      );
    }

    await writeAuditLog(
      activeProfile,
      'Published Announcement',
      'Settings',
      annId,
      `Published "${input.title}" to ${input.targetDepartment} (${input.priority}).`
    );
    showBanner('success', 'Announcement published across the organization.');
  };

  const archiveAnnouncement = async (announcementId: string) => {
    if (!activeProfile) return;
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === announcementId ? { ...a, status: 'Archived' } : a))
    );
    if (canWriteToFirestore()) {
      try {
        await updateDoc(doc(db, 'announcements', announcementId), {
          status: 'Archived',
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `announcements/${announcementId}`);
      }
    }
    showBanner('info', 'Announcement archived.');
  };

  // ============================================================================
  // COMPANY SETTINGS, LEAVE TYPES & HOLIDAYS
  // ============================================================================

  const updateCompanySettings = async (updates: Partial<CompanySettings>) => {
    if (!activeProfile || !companySettings) return;
    const merged: CompanySettings = {
      id: 'default',
      companyName: sanitizeText(
        updates.companyName ?? companySettings.companyName,
        2,
        100,
        'WorkNest'
      ),
      tagline: sanitizeText(
        updates.tagline ?? companySettings.tagline,
        2,
        140,
        'Your Workplace, Connected.'
      ),
      timezone: sanitizeText(
        updates.timezone ?? companySettings.timezone,
        2,
        60,
        'UTC-05:00'
      ),
      workingDaysCsv: sanitizeText(
        updates.workingDaysCsv ?? companySettings.workingDaysCsv,
        3,
        60,
        'Mon,Tue,Wed,Thu,Fri'
      ),
      workStartTime: updates.workStartTime ?? companySettings.workStartTime,
      workEndTime: updates.workEndTime ?? companySettings.workEndTime,
      lateGraceMinutes: Number(updates.lateGraceMinutes ?? companySettings.lateGraceMinutes),
      requireHrSecondApprovalForLongLeave:
        updates.requireHrSecondApprovalForLongLeave ??
        companySettings.requireHrSecondApprovalForLongLeave,
      longLeaveThresholdDays: Number(
        updates.longLeaveThresholdDays ?? companySettings.longLeaveThresholdDays
      ),
      autoApproveEmployeeRegistration:
        updates.autoApproveEmployeeRegistration ??
        companySettings.autoApproveEmployeeRegistration,
      status: 'active',
      updatedByUid: activeProfile.uid,
    };

    setCompanySettings(merged);

    if (canWriteToFirestore() && auth.currentUser) {
      try {
        await updateDoc(doc(db, 'company_settings', 'default'), {
          ...merged,
          updatedByUid: auth.currentUser.uid,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, 'company_settings/default');
      }
    }

    await writeAuditLog(
      activeProfile,
      'Updated Company Settings',
      'Settings',
      'default',
      `Updated global company settings (${merged.companyName}, hours ${merged.workStartTime}-${merged.workEndTime}).`
    );
    showBanner('success', 'Company configuration and policies updated.');
  };

  const saveLeaveType = async (input: {
    id?: string;
    name: string;
    code: string;
    annualQuotaDays: number;
    description: string;
    isPaid: boolean;
    requiresHrApproval: boolean;
    status: 'Active' | 'Inactive';
  }) => {
    if (!activeProfile) return;
    const isNew = !input.id;
    const ltId = sanitizeId(
      input.id || `lt-${input.code.toLowerCase()}-${Date.now().toString().slice(-4)}`
    );
    const ltRecord: LeaveType = {
      id: ltId,
      name: sanitizeText(input.name, 2, 60, 'Leave Type'),
      code: sanitizeId(input.code.toUpperCase()).slice(0, 16),
      annualQuotaDays: Math.max(0, Math.min(365, Number(input.annualQuotaDays) || 10)),
      description: sanitizeText(input.description, 2, 250, 'Company leave policy'),
      isPaid: input.isPaid,
      requiresHrApproval: input.requiresHrApproval,
      status: input.status,
      visibility: 'organization',
      createdByUid: activeProfile.uid,
    };

    setLeaveTypes((prev) => {
      if (isNew) return [...prev, ltRecord];
      return prev.map((lt) => (lt.id === ltId ? ltRecord : lt));
    });

    if (canWriteToFirestore() && auth.currentUser) {
      try {
        await setDoc(doc(db, 'leave_types', ltId), {
          ...ltRecord,
          createdByUid: auth.currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `leave_types/${ltId}`);
      }
    }
    showBanner('success', `Leave policy "${input.name}" saved.`);
  };

  const saveHoliday = async (input: {
    id?: string;
    name: string;
    date: string;
    type: 'Public Holiday' | 'Company Holiday' | 'Optional Holiday';
    description: string;
  }) => {
    if (!activeProfile) return;
    const holId = sanitizeId(
      input.id || `hol-${input.date}-${Date.now().toString().slice(-3)}`
    );
    const holRecord: Holiday = {
      id: holId,
      name: sanitizeText(input.name, 2, 100, 'Company Holiday'),
      date: input.date,
      type: input.type,
      description: sanitizeText(input.description, 0, 250, ''),
      visibility: 'organization',
      createdByUid: activeProfile.uid,
    };

    setHolidays((prev) => {
      const filtered = prev.filter((h) => h.id !== holId);
      const next = [...filtered, holRecord];
      next.sort((a, b) => a.date.localeCompare(b.date));
      return next;
    });

    if (canWriteToFirestore() && auth.currentUser) {
      try {
        await setDoc(doc(db, 'holidays', holId), {
          ...holRecord,
          createdByUid: auth.currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `holidays/${holId}`);
      }
    }
    showBanner('success', `Holiday "${input.name}" saved.`);
  };

  const deleteHoliday = async (holidayId: string) => {
    setHolidays((prev) => prev.filter((h) => h.id !== holidayId));
    if (canWriteToFirestore()) {
      try {
        await deleteDoc(doc(db, 'holidays', holidayId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `holidays/${holidayId}`);
      }
    }
    showBanner('info', 'Holiday removed from calendar.');
  };

  const seedEnterpriseWorkspace = async () => {
    setDataLoading(true);
    try {
      const fresh = buildInitialEnterpriseState();
      setProfiles(fresh.profiles);
      setPrivateProfilesMap(fresh.privateProfilesMap);
      setDepartments(fresh.departments);
      setAttendanceRecords(fresh.attendanceRecords);
      setLeaveTypes(fresh.leaveTypes);
      setLeaveBalances(fresh.leaveBalances);
      setLeaveRequests(fresh.leaveRequests);
      setWorkplaceRequests(fresh.workplaceRequests);
      setProjects(fresh.projects);
      setWorkTasks(fresh.workTasks);
      setPerformanceReviews(fresh.performanceReviews);
      setNotifications(fresh.notifications);
      setAnnouncements(fresh.announcements);
      setHolidays(fresh.holidays);
      setCompanySettings(fresh.companySettings);
      setAuditLogs(fresh.auditLogs);
      setDemoPasswords(fresh.demoPasswords);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fresh));

      if (authUser) {
        await seedWorkspaceForAdmin(authUser);
      }
      showBanner(
        'success',
        'Enterprise sample departments, employees, projects, tasks, reviews, and requests reset to default.'
      );
    } finally {
      setDataLoading(false);
    }
  };

  return (
    <WorkNestContext.Provider
      value={{
        authUser,
        isDemoSession: Boolean(demoSessionUid),
        authReady,
        currentProfile,
        activeProfile,
        activePrivateProfile,
        isAuthorizedAdmin,
        currentRoute,
        setCurrentRoute,
        switchActivePersona,
        switchOwnRoleForTesting,
        quickDemoLogin,
        profiles,
        privateProfilesMap,
        departments,
        attendanceRecords,
        leaveTypes,
        leaveBalances,
        leaveRequests,
        workplaceRequests,
        projects,
        workTasks,
        performanceReviews,
        notifications,
        announcements,
        holidays,
        companySettings,
        auditLogs,
        dataLoading,
        bannerMessage,
        setBannerMessage,
        loginWithGoogle,
        loginWithEmail,
        registerEmployee,
        sendPasswordReset,
        logout,
        updatePersonalProfile,
        checkInToday,
        checkOutToday,
        correctAttendanceRecord,
        createManualAttendanceRecord,
        submitLeaveRequest,
        cancelLeaveRequest,
        reviewLeaveRequest,
        submitWorkplaceRequest,
        reviewWorkplaceRequest,
        createOrUpdateProject,
        assignOrUpdateTask,
        updateEmployeeTaskProgress,
        deleteTask,
        createOrUpdatePerformanceReview,
        submitEmployeeSelfAssessment,
        hrCreateOrUpdateEmployee,
        hrCreateOrUpdateDepartment,
        hrAssignManagerToEmployee,
        markNotificationRead,
        markAllNotificationsRead,
        publishAnnouncement,
        archiveAnnouncement,
        updateCompanySettings,
        saveLeaveType,
        saveHoliday,
        deleteHoliday,
        seedEnterpriseWorkspace,
      }}
    >
      {children}
    </WorkNestContext.Provider>
  );
};

export function useWorkNest(): WorkNestContextValue {
  const ctx = useContext(WorkNestContext);
  if (!ctx) {
    throw new Error('useWorkNest must be used within a WorkNestProvider');
  }
  return ctx;
}
