export type UserRole = 'Employee' | 'Manager' | 'HR';

export type EmploymentStatus = 'Active' | 'Pending Approval' | 'On Leave' | 'Deactivated';

export type AttendanceStatus = 'Present' | 'Late' | 'Absent' | 'On Leave' | 'Half Day';

export type LeaveRequestStatus =
  | 'Pending'
  | 'Pending HR Approval'
  | 'Approved'
  | 'Rejected'
  | 'Cancelled';

export type WorkplaceRequestCategory =
  | 'Work From Home'
  | 'Permission / Short Leave'
  | 'Shift Change'
  | 'Attendance Correction'
  | 'Equipment Request'
  | 'IT Support'
  | 'HR Support'
  | 'Other Workplace Requests';

export type WorkplaceRequestPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type WorkplaceRequestStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Approved'
  | 'Rejected'
  | 'Resolved';

export type ProjectStatus = 'Planning' | 'Active' | 'On Hold' | 'Completed';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type TaskStatus = 'To Do' | 'In Progress' | 'In Review' | 'Completed';

export type PerformanceReviewStatus = 'Draft' | 'Published' | 'Acknowledged';

export type NotificationCategory =
  | 'Leave'
  | 'Request'
  | 'Attendance'
  | 'Announcement'
  | 'Profile'
  | 'Task'
  | 'Performance';

export type AuditCategory =
  | 'Employee'
  | 'Department'
  | 'Manager'
  | 'Attendance'
  | 'Leave'
  | 'Request'
  | 'Project'
  | 'Performance'
  | 'Settings'
  | 'Security';

// Blueprint Validation Constants (Synchronicity with firebase-blueprint.json & firestore.rules)
export const BLUEPRINT_CONSTRAINTS = {
  ID_REGEX: /^[a-zA-Z0-9_-]+$/,
  DATE_REGEX: /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/,
  TIME_REGEX: /^[0-9]{2}:[0-9]{2}$/,
  MAX_ID_LEN: 128,
  MAX_NAME_LEN: 100,
  MAX_EMP_ID_LEN: 32,
  MAX_DEPT_NAME_LEN: 80,
  MAX_DESIGNATION_LEN: 80,
  MAX_EMAIL_LEN: 120,
  MAX_PHONE_LEN: 30,
  MAX_ADDRESS_LEN: 250,
  MAX_REASON_LEN: 500,
  MAX_DESCRIPTION_LEN: 800,
  MAX_ANNOUNCEMENT_LEN: 1500,
  MAX_AUDIT_DETAILS_LEN: 600,
} as const;

export function sanitizeId(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, BLUEPRINT_CONSTRAINTS.MAX_ID_LEN);
  return cleaned.length > 0 ? cleaned : 'id-default';
}

export function sanitizeText(raw: string, minLen: number, maxLen: number, fallback = 'N/A'): string {
  const trimmed = (raw || '').trim();
  if (trimmed.length < minLen) {
    return fallback.slice(0, maxLen);
  }
  return trimmed.slice(0, maxLen);
}

export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'WN';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export interface Profile {
  uid: string;
  ownerUid: string;
  hrUid: string;
  fullName: string;
  employeeId: string;
  departmentId: string;
  departmentName: string;
  designation: string;
  role: UserRole;
  status: EmploymentStatus;
  managerUid: string;
  managerName: string;
  joiningDate: string;
  avatarInitials: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ProfilePrivate {
  uid: string;
  ownerUid: string;
  email: string;
  contactNumber: string;
  emergencyContact: string;
  address: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  headUid: string;
  headName: string;
  status: 'Active' | 'Deactivated';
  visibility: 'organization';
  createdByUid: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface AttendanceRecord {
  id: string;
  employeeUid: string;
  employeeId: string;
  employeeName: string;
  departmentName: string;
  managerUid: string;
  hrUid: string;
  date: string;
  checkInTime: string;
  checkOutTime: string;
  workDurationMinutes: number;
  status: AttendanceStatus;
  correctionReason: string;
  correctedByUid: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface LeaveType {
  id: string;
  name: string;
  code: string;
  annualQuotaDays: number;
  description: string;
  isPaid: boolean;
  requiresHrApproval: boolean;
  status: 'Active' | 'Inactive';
  visibility: 'organization';
  createdByUid: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface LeaveBalance {
  id: string;
  employeeUid: string;
  employeeId: string;
  employeeName: string;
  managerUid: string;
  hrUid: string;
  year: number;
  casualTotal: number;
  casualUsed: number;
  sickTotal: number;
  sickUsed: number;
  earnedTotal: number;
  earnedUsed: number;
  unpaidUsed: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface LeaveRequest {
  id: string;
  employeeUid: string;
  employeeId: string;
  employeeName: string;
  departmentName: string;
  managerUid: string;
  managerName: string;
  hrUid: string;
  leaveTypeCode: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveRequestStatus;
  reviewerUid: string;
  reviewerName: string;
  reviewerRemarks: string;
  reviewedAt: string;
  balanceDeducted: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface WorkplaceRequest {
  id: string;
  employeeUid: string;
  employeeId: string;
  employeeName: string;
  departmentName: string;
  managerUid: string;
  managerName: string;
  hrUid: string;
  category: WorkplaceRequestCategory;
  title: string;
  description: string;
  targetDate: string;
  priority: WorkplaceRequestPriority;
  status: WorkplaceRequestStatus;
  assignedToRole: 'Manager' | 'HR' | 'IT Support';
  reviewerUid: string;
  reviewerName: string;
  remarks: string;
  resolvedAt: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  departmentName: string;
  leadUid: string;
  leadName: string;
  hrUid: string;
  description: string;
  startDate: string;
  deadline: string;
  status: ProjectStatus;
  progressPercent: number;
  teamMemberUids: string[];
  visibility: 'organization';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface WorkTask {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  description: string;
  assigneeUid: string;
  assigneeId: string;
  assigneeName: string;
  departmentName: string;
  assignedByUid: string;
  assignedByName: string;
  hrUid: string;
  priority: TaskPriority;
  dueDate: string;
  status: TaskStatus;
  progressPercent: number;
  deliverableNotes: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface PerformanceReview {
  id: string;
  employeeUid: string;
  employeeId: string;
  employeeName: string;
  departmentName: string;
  designation: string;
  reviewerUid: string;
  reviewerName: string;
  hrUid: string;
  reviewCycle: string;
  reviewDate: string;
  overallRating: number;
  technicalScore: number;
  collaborationScore: number;
  reliabilityScore: number;
  keyStrengths: string;
  growthAreas: string;
  goalsNextPeriod: string;
  employeeSelfAssessment: string;
  status: PerformanceReviewStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface NotificationItem {
  id: string;
  recipientUid: string;
  senderUid: string;
  category: NotificationCategory;
  title: string;
  message: string;
  relatedEntityId: string;
  relatedRoute: string;
  isRead: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetDepartment: string;
  priority: 'Normal' | 'Important' | 'Urgent';
  authorUid: string;
  authorName: string;
  status: 'Published' | 'Archived';
  visibility: 'organization';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  type: 'Public Holiday' | 'Company Holiday' | 'Optional Holiday';
  description: string;
  visibility: 'organization';
  createdByUid: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CompanySettings {
  id: string;
  companyName: string;
  tagline: string;
  timezone: string;
  workingDaysCsv: string;
  workStartTime: string;
  workEndTime: string;
  lateGraceMinutes: number;
  requireHrSecondApprovalForLongLeave: boolean;
  longLeaveThresholdDays: number;
  autoApproveEmployeeRegistration: boolean;
  status: 'active';
  updatedByUid: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface AuditLog {
  id: string;
  actorUid: string;
  actorName: string;
  actorRole: UserRole;
  hrUid: string;
  action: string;
  category: AuditCategory;
  targetId: string;
  details: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type AppRoute =
  // Public
  | 'welcome'
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'reset-password'
  // Employee
  | 'emp-dashboard'
  | 'emp-profile'
  | 'emp-attendance'
  | 'emp-apply-leave'
  | 'emp-my-leaves'
  | 'emp-projects'
  | 'emp-team'
  | 'emp-performance'
  | 'emp-my-requests'
  | 'emp-notifications'
  | 'emp-announcements'
  // Manager
  | 'mgr-dashboard'
  | 'mgr-team'
  | 'mgr-attendance'
  | 'mgr-leave-approvals'
  | 'mgr-request-approvals'
  | 'mgr-reports'
  | 'mgr-announcements'
  | 'mgr-notifications'
  // HR / Admin
  | 'hr-dashboard'
  | 'hr-employees'
  | 'hr-departments'
  | 'hr-managers'
  | 'hr-attendance'
  | 'hr-leaves'
  | 'hr-work'
  | 'hr-reviews'
  | 'hr-requests'
  | 'hr-announcements'
  | 'hr-reports'
  | 'hr-settings'
  | 'hr-roles'
  | 'hr-audit';
