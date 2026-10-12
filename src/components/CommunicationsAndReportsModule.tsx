import React, { useState } from 'react';
import {
  Bell,
  Megaphone,
  FileSpreadsheet,
  Download,
  CheckCheck,
  Filter,
  Plus,
  Archive,
  Calendar,
  Clock,
  FolderKanban,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { useWorkNest } from '../context/WorkNestContext';
import { AppRoute } from '../types/worknest';

// ============================================================================
// 1. REAL-TIME NOTIFICATIONS INBOX (Role-Filtered & Actionable)
// ============================================================================

export const NotificationsModuleView: React.FC = () => {
  const {
    activeProfile,
    isAuthorizedAdmin,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setCurrentRoute,
  } = useWorkNest();

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  if (!activeProfile) return null;

  const myNotifications = notifications.filter((n) => {
    const isMine =
      n.recipientUid === activeProfile.uid ||
      (activeProfile.role === 'HR' && isAuthorizedAdmin && n.recipientUid === 'hr-admin-01');
    const matchesCat = categoryFilter === 'ALL' || n.category === categoryFilter;
    return isMine && matchesCat;
  });

  const unreadCount = myNotifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Notifications Center</h1>
            <p className="text-xs text-slate-500 mt-1">
              Real-time alerts for leave approvals, assigned tasks, performance evaluations,
              attendance updates, and announcements.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700"
              >
                <option value="ALL">All Categories</option>
                <option value="Leave">Leave</option>
                <option value="Task">Projects & Tasks</option>
                <option value="Performance">Performance Reviews</option>
                <option value="Request">Workplace Requests</option>
                <option value="Attendance">Attendance</option>
                <option value="Announcement">Announcements</option>
                <option value="Profile">Profile & Onboarding</option>
              </select>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsRead}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark All Read ({unreadCount})</span>
              </button>
            )}
          </div>
        </div>

        {myNotifications.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            Your notification inbox is clear for the selected filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {myNotifications.map((item) => (
              <div
                key={item.id}
                className={`py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  !item.isRead ? 'bg-teal-50/40 -mx-4 px-4 rounded-lg' : ''
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      !item.isRead
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {item.category === 'Leave' ? (
                      <Calendar className="w-4 h-4" />
                    ) : item.category === 'Attendance' ? (
                      <Clock className="w-4 h-4" />
                    ) : item.category === 'Announcement' ? (
                      <Megaphone className="w-4 h-4" />
                    ) : item.category === 'Task' ? (
                      <FolderKanban className="w-4 h-4" />
                    ) : item.category === 'Performance' ? (
                      <Award className="w-4 h-4" />
                    ) : item.category === 'Request' ? (
                      <FolderKanban className="w-4 h-4" />
                    ) : (
                      <ShieldCheck className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{item.title}</span>
                      <span className="text-[11px] font-semibold text-teal-700">
                        · {item.category}
                      </span>
                      {!item.isRead && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.message}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.relatedRoute && (
                    <button
                      type="button"
                      onClick={() => {
                        markNotificationRead(item.id);
                        setCurrentRoute(item.relatedRoute as AppRoute);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
                    >
                      Open Module
                    </button>
                  )}
                  {!item.isRead && (
                    <button
                      type="button"
                      onClick={() => markNotificationRead(item.id)}
                      className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold cursor-pointer"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 2. COMPANY ANNOUNCEMENTS BOARD (With HR Publishing Studio)
// ============================================================================

export const AnnouncementsModuleView: React.FC = () => {
  const {
    activeProfile,
    announcements,
    departments,
    publishAnnouncement,
    archiveAnnouncement,
  } = useWorkNest();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetDept, setTargetDept] = useState('All Departments');
  const [priority, setPriority] = useState<'Normal' | 'Important' | 'Urgent'>('Important');
  const [publishing, setPublishing] = useState(false);

  if (!activeProfile) return null;

  const isHr = activeProfile.role === 'HR';

  const visibleList = announcements.filter((a) => {
    if (isHr) return true;
    return (
      a.status === 'Published' &&
      (a.targetDepartment === 'All Departments' ||
        a.targetDepartment === activeProfile.departmentName)
    );
  });

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setPublishing(true);
    try {
      await publishAnnouncement({
        title: title.trim(),
        content: content.trim(),
        targetDepartment: targetDept,
        priority,
      });
      setTitle('');
      setContent('');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {isHr && (
        <div className="lg:col-span-5">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-base font-bold text-slate-900 mb-1">
              Publish Company Announcement
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Broadcast official notices to all employees or a specific department. Published
              announcements immediately appear on Employee and Manager dashboards.
            </p>

            <form onSubmit={handlePublish} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Announcement Headline *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Annual Health Benefits Open Enrollment"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Audience</label>
                  <select
                    value={targetDept}
                    onChange={(e) => setTargetDept(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="All Departments">All Departments</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value as 'Normal' | 'Important' | 'Urgent')
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Important">Important</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Announcement Content *
                </label>
                <textarea
                  rows={5}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write the full announcement details..."
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <button
                type="submit"
                disabled={publishing}
                className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{publishing ? 'Publishing...' : 'Publish Announcement'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      <div className={isHr ? 'lg:col-span-7' : 'lg:col-span-12'}>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Megaphone className="w-4 h-4 text-teal-700" />
            <h2 className="text-base font-bold text-slate-900">
              Company Announcements ({visibleList.length})
            </h2>
          </div>

          {visibleList.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No announcements available for your department.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {visibleList.map((ann) => (
                <div key={ann.id} className="py-5 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{ann.title}</h3>
                      <div className="text-xs text-slate-500 mt-0.5">
                        <span>Audience: {ann.targetDepartment}</span>
                        <span className="mx-1.5">·</span>
                        <span>Priority: {ann.priority}</span>
                        <span className="mx-1.5">·</span>
                        <span>Published by {ann.authorName}</span>
                        <span className="mx-1.5">·</span>
                        <span>Status: {ann.status}</span>
                      </div>
                    </div>

                    {isHr && ann.status === 'Published' && (
                      <button
                        type="button"
                        onClick={() => archiveAnnouncement(ann.id)}
                        className="px-2.5 py-1 rounded-md border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Archive className="w-3 h-3" />
                        <span>Archive</span>
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed mt-3 whitespace-pre-line">
                    {ann.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. REPORTING & CSV EXPORT MODULE (9 REPORT TYPES INCLUDING PROJECTS & REVIEWS)
// ============================================================================

type ReportType =
  | 'DIRECTORY'
  | 'DEPARTMENT'
  | 'ATTENDANCE'
  | 'LEAVE'
  | 'PROJECTS_TASKS'
  | 'PERFORMANCE_REVIEWS'
  | 'PENDING_APPROVALS'
  | 'WORKPLACE_REQUESTS'
  | 'ACTIVITY_SUMMARY';

export const ReportsModuleView: React.FC<{ scope: 'manager' | 'hr' }> = ({ scope }) => {
  const {
    activeProfile,
    profiles,
    departments,
    attendanceRecords,
    leaveRequests,
    workplaceRequests,
    workTasks,
    performanceReviews,
    auditLogs,
  } = useWorkNest();

  const [reportType, setReportType] = useState<ReportType>('DIRECTORY');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  if (!activeProfile) return null;

  const isManagerScope = scope === 'manager';

  const scopedProfiles = profiles.filter((p) => {
    const inRoleScope = isManagerScope ? p.managerUid === activeProfile.uid : true;
    const inDept = deptFilter === 'ALL' || p.departmentName === deptFilter;
    const inStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return inRoleScope && inDept && inStatus;
  });

  const scopedAttendance = attendanceRecords.filter((r) => {
    const inRoleScope = isManagerScope ? r.managerUid === activeProfile.uid : true;
    const inDept = deptFilter === 'ALL' || r.departmentName === deptFilter;
    const inFrom = dateFrom ? r.date >= dateFrom : true;
    const inTo = dateTo ? r.date <= dateTo : true;
    return inRoleScope && inDept && inFrom && inTo;
  });

  const scopedLeaves = leaveRequests.filter((r) => {
    const inRoleScope = isManagerScope ? r.managerUid === activeProfile.uid : true;
    const inDept = deptFilter === 'ALL' || r.departmentName === deptFilter;
    const inFrom = dateFrom ? r.startDate >= dateFrom : true;
    const inTo = dateTo ? r.endDate <= dateTo : true;
    return inRoleScope && inDept && inFrom && inTo;
  });

  const scopedWorkplace = workplaceRequests.filter((r) => {
    const inRoleScope = isManagerScope ? r.managerUid === activeProfile.uid : true;
    const inDept = deptFilter === 'ALL' || r.departmentName === deptFilter;
    return inRoleScope && inDept;
  });

  const scopedTasks = workTasks.filter((t) => {
    const inDept = deptFilter === 'ALL' || t.departmentName === deptFilter;
    return inDept;
  });

  const scopedReviews = performanceReviews.filter((r) => {
    const inDept = deptFilter === 'ALL' || r.departmentName === deptFilter;
    return inDept;
  });

  const downloadCsv = () => {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (reportType === 'DIRECTORY') {
      headers = [
        'Employee ID',
        'Full Name',
        'Department',
        'Designation',
        'Role',
        'Manager',
        'Status',
        'Joining Date',
      ];
      rows = scopedProfiles.map((p) => [
        p.employeeId,
        p.fullName,
        p.departmentName,
        p.designation,
        p.role,
        p.managerName,
        p.status,
        p.joiningDate,
      ]);
    } else if (reportType === 'DEPARTMENT') {
      headers = [
        'Department Code',
        'Department Name',
        'Department Head',
        'Active Employees',
        'Status',
      ];
      rows = departments.map((d) => [
        d.code,
        d.name,
        d.headName,
        String(profiles.filter((p) => p.departmentId === d.id).length),
        d.status,
      ]);
    } else if (reportType === 'ATTENDANCE') {
      headers = [
        'Date',
        'Employee ID',
        'Employee Name',
        'Department',
        'Check In',
        'Check Out',
        'Duration (Mins)',
        'Status',
      ];
      rows = scopedAttendance.map((a) => [
        a.date,
        a.employeeId,
        a.employeeName,
        a.departmentName,
        a.checkInTime,
        a.checkOutTime,
        String(a.workDurationMinutes),
        a.status,
      ]);
    } else if (reportType === 'PROJECTS_TASKS') {
      headers = [
        'Task ID',
        'Project',
        'Task Title',
        'Assignee ID',
        'Assignee Name',
        'Department',
        'Priority',
        'Due Date',
        'Progress %',
        'Status',
      ];
      rows = scopedTasks.map((t) => [
        t.id,
        t.projectName,
        t.title,
        t.assigneeId,
        t.assigneeName,
        t.departmentName,
        t.priority,
        t.dueDate,
        String(t.progressPercent),
        t.status,
      ]);
    } else if (reportType === 'PERFORMANCE_REVIEWS') {
      headers = [
        'Review ID',
        'Employee ID',
        'Employee Name',
        'Department',
        'Cycle',
        'Overall Rating',
        'Technical',
        'Collaboration',
        'Reliability',
        'Status',
      ];
      rows = scopedReviews.map((r) => [
        r.id,
        r.employeeId,
        r.employeeName,
        r.departmentName,
        r.reviewCycle,
        String(r.overallRating),
        String(r.technicalScore),
        String(r.collaborationScore),
        String(r.reliabilityScore),
        r.status,
      ]);
    } else if (reportType === 'LEAVE' || reportType === 'PENDING_APPROVALS') {
      const targetList =
        reportType === 'PENDING_APPROVALS'
          ? scopedLeaves.filter(
              (l) => l.status === 'Pending' || l.status === 'Pending HR Approval'
            )
          : scopedLeaves;
      headers = [
        'Request ID',
        'Employee ID',
        'Employee Name',
        'Leave Type',
        'Start Date',
        'End Date',
        'Days',
        'Status',
        'Reviewer',
      ];
      rows = targetList.map((l) => [
        l.id,
        l.employeeId,
        l.employeeName,
        l.leaveTypeName,
        l.startDate,
        l.endDate,
        String(l.totalDays),
        l.status,
        l.reviewerName || l.managerName,
      ]);
    } else if (reportType === 'WORKPLACE_REQUESTS') {
      headers = [
        'Request ID',
        'Employee Name',
        'Department',
        'Category',
        'Title',
        'Target Date',
        'Priority',
        'Status',
      ];
      rows = scopedWorkplace.map((w) => [
        w.id,
        w.employeeName,
        w.departmentName,
        w.category,
        w.title,
        w.targetDate,
        w.priority,
        w.status,
      ]);
    } else {
      headers = ['Actor Name', 'Role', 'Category', 'Action', 'Target ID', 'Details'];
      rows = auditLogs.map((l) => [
        l.actorName,
        l.actorRole,
        l.category,
        l.action,
        l.targetId,
        l.details,
      ]);
    }

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `worknest_${reportType.toLowerCase()}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {isManagerScope ? 'Authorized Team Reports' : 'Enterprise Workforce Reports'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Filter by report category, department, and date range, or export clean CSV records.
            </p>
          </div>

          <button
            type="button"
            onClick={downloadCsv}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>
        </div>

        {/* Report Type Selector */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl mb-6">
          {(
            [
              { id: 'DIRECTORY', label: 'Employee Directory' },
              { id: 'DEPARTMENT', label: 'Department Report' },
              { id: 'ATTENDANCE', label: 'Attendance Report' },
              { id: 'LEAVE', label: 'Leave Report' },
              { id: 'PROJECTS_TASKS', label: 'Projects & Tasks' },
              { id: 'PERFORMANCE_REVIEWS', label: 'Performance Reviews' },
              { id: 'PENDING_APPROVALS', label: 'Pending Approvals' },
              { id: 'WORKPLACE_REQUESTS', label: 'Workplace Requests' },
              { id: 'ACTIVITY_SUMMARY', label: 'Audit Summary' },
            ] as { id: ReportType; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setReportType(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                reportType === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Department Filter</label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Deactivated">Deactivated</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono-tabular"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono-tabular"
            />
          </div>
        </div>

        {/* Dynamic Report Data Grid */}
        {reportType === 'DIRECTORY' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <th className="py-2.5 pr-3">Employee ID</th>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Designation</th>
                  <th className="py-2.5 px-3">Reporting Manager</th>
                  <th className="py-2.5 pl-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scopedProfiles.map((p) => (
                  <tr key={p.uid} className="hover:bg-slate-50">
                    <td className="py-2.5 pr-3 font-mono-tabular font-semibold">{p.employeeId}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{p.fullName}</td>
                    <td className="py-2.5 px-3">{p.departmentName}</td>
                    <td className="py-2.5 px-3">{p.designation}</td>
                    <td className="py-2.5 px-3">{p.managerName}</td>
                    <td className="py-2.5 pl-3 text-right font-semibold text-teal-700">
                      {p.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'DEPARTMENT' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <th className="py-2.5 pr-3">Code</th>
                  <th className="py-2.5 px-3">Department Name</th>
                  <th className="py-2.5 px-3">Department Head</th>
                  <th className="py-2.5 px-3 text-right">Headcount</th>
                  <th className="py-2.5 pl-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departments.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="py-2.5 pr-3 font-mono-tabular font-semibold">{d.code}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{d.name}</td>
                    <td className="py-2.5 px-3">{d.headName}</td>
                    <td className="py-2.5 px-3 text-right font-mono-tabular">
                      {profiles.filter((p) => p.departmentId === d.id).length}
                    </td>
                    <td className="py-2.5 pl-3 text-right font-semibold text-teal-700">
                      {d.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'ATTENDANCE' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <th className="py-2.5 pr-3">Date</th>
                  <th className="py-2.5 px-3">Employee</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3 text-right">In / Out</th>
                  <th className="py-2.5 pl-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scopedAttendance.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="py-2.5 pr-3 font-mono-tabular">{a.date}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {a.employeeName} ({a.employeeId})
                    </td>
                    <td className="py-2.5 px-3">{a.departmentName}</td>
                    <td className="py-2.5 px-3 text-right font-mono-tabular">
                      {a.checkInTime} – {a.checkOutTime || 'Active'}
                    </td>
                    <td className="py-2.5 pl-3 text-right font-semibold text-teal-700">
                      {a.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'PROJECTS_TASKS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <th className="py-2.5 pr-3">Task</th>
                  <th className="py-2.5 px-3">Project</th>
                  <th className="py-2.5 px-3">Assigned Employee</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3 text-right">Completion</th>
                  <th className="py-2.5 pl-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scopedTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="py-2.5 pr-3 font-semibold text-slate-900">{t.title}</td>
                    <td className="py-2.5 px-3">{t.projectName}</td>
                    <td className="py-2.5 px-3">
                      {t.assigneeName} ({t.assigneeId})
                    </td>
                    <td className="py-2.5 px-3 font-mono-tabular">{t.dueDate}</td>
                    <td className="py-2.5 px-3 text-right font-mono-tabular font-semibold">
                      {t.progressPercent}%
                    </td>
                    <td className="py-2.5 pl-3 text-right font-semibold text-teal-700">
                      {t.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'PERFORMANCE_REVIEWS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <th className="py-2.5 pr-3">Employee</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Review Cycle</th>
                  <th className="py-2.5 px-3 text-right">Overall Score</th>
                  <th className="py-2.5 pl-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scopedReviews.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-2.5 pr-3 font-semibold text-slate-900">
                      {r.employeeName} ({r.employeeId})
                    </td>
                    <td className="py-2.5 px-3">{r.departmentName}</td>
                    <td className="py-2.5 px-3">{r.reviewCycle}</td>
                    <td className="py-2.5 px-3 text-right font-mono-tabular font-bold text-teal-700">
                      {r.overallRating} / 5.0
                    </td>
                    <td className="py-2.5 pl-3 text-right font-semibold">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {(reportType === 'LEAVE' || reportType === 'PENDING_APPROVALS') && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <th className="py-2.5 pr-3">ID</th>
                  <th className="py-2.5 px-3">Employee</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Dates</th>
                  <th className="py-2.5 px-3">Reviewer</th>
                  <th className="py-2.5 pl-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scopedLeaves
                  .filter((l) =>
                    reportType === 'PENDING_APPROVALS'
                      ? l.status === 'Pending' || l.status === 'Pending HR Approval'
                      : true
                  )
                  .map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50">
                      <td className="py-2.5 pr-3 font-mono-tabular">{l.id}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {l.employeeName}
                      </td>
                      <td className="py-2.5 px-3">{l.leaveTypeName}</td>
                      <td className="py-2.5 px-3 font-mono-tabular">
                        {l.startDate} → {l.endDate} ({l.totalDays}d)
                      </td>
                      <td className="py-2.5 px-3">{l.reviewerName || l.managerName}</td>
                      <td className="py-2.5 pl-3 text-right font-semibold">{l.status}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'WORKPLACE_REQUESTS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <th className="py-2.5 pr-3">ID</th>
                  <th className="py-2.5 px-3">Employee</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 pl-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scopedWorkplace.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50">
                    <td className="py-2.5 pr-3 font-mono-tabular">{w.id}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{w.employeeName}</td>
                    <td className="py-2.5 px-3">{w.category}</td>
                    <td className="py-2.5 px-3">{w.title}</td>
                    <td className="py-2.5 pl-3 text-right font-semibold">{w.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'ACTIVITY_SUMMARY' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <th className="py-2.5 pr-3">Actor</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 pl-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2.5 pr-3 font-semibold text-slate-900">{log.actorName}</td>
                    <td className="py-2.5 px-3">{log.actorRole}</td>
                    <td className="py-2.5 px-3">{log.category}</td>
                    <td className="py-2.5 px-3 font-semibold">{log.action}</td>
                    <td className="py-2.5 pl-3 text-slate-600">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
