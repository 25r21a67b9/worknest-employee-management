import React, { useState } from 'react';
import {
  Clock,
  CalendarPlus,
  FilePlus2,
  Calendar,
  Bell,
  Megaphone,
  CheckCircle2,
  LogIn,
  LogOut,
  UserCheck,
  Briefcase,
  Building2,
  Phone,
  Mail,
  MapPin,
  Shield,
  Lock,
  Save,
  Activity,
  FolderKanban,
  Award,
  UsersRound,
  CheckSquare,
  AlertCircle,
  Search,
  Star,
  Send,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useWorkNest, getTodayDateString } from '../context/WorkNestContext';
import { TaskStatus } from '../types/worknest';

// ============================================================================
// 1. EMPLOYEE DASHBOARD OVERVIEW (4.A)
// ============================================================================

export const EmployeeDashboardView: React.FC = () => {
  const {
    activeProfile,
    attendanceRecords,
    leaveBalances,
    leaveRequests,
    workplaceRequests,
    projects,
    workTasks,
    performanceReviews,
    notifications,
    announcements,
    holidays,
    checkInToday,
    checkOutToday,
    updateEmployeeTaskProgress,
    setCurrentRoute,
  } = useWorkNest();

  const [checking, setChecking] = useState(false);

  if (!activeProfile) return null;

  const todayStr = getTodayDateString();
  const currentYear = new Date().getFullYear();

  const myAttendance = attendanceRecords.filter((r) => r.employeeUid === activeProfile.uid);
  const todayRecord = myAttendance.find((r) => r.date === todayStr);

  const myBalance = leaveBalances.find(
    (b) => b.employeeUid === activeProfile.uid && b.year === currentYear
  ) || {
    casualTotal: 12,
    casualUsed: 0,
    sickTotal: 10,
    sickUsed: 0,
    earnedTotal: 15,
    earnedUsed: 0,
    unpaidUsed: 0,
  };

  const totalRemainingLeave =
    myBalance.casualTotal -
    myBalance.casualUsed +
    (myBalance.sickTotal - myBalance.sickUsed) +
    (myBalance.earnedTotal - myBalance.earnedUsed);

  const myLeaves = leaveRequests.filter((r) => r.employeeUid === activeProfile.uid);
  const pendingLeavesCount = myLeaves.filter(
    (r) => r.status === 'Pending' || r.status === 'Pending HR Approval'
  ).length;
  const approvedLeavesCount = myLeaves.filter((r) => r.status === 'Approved').length;

  const myRequests = workplaceRequests.filter((r) => r.employeeUid === activeProfile.uid);
  const openRequestsCount = myRequests.filter(
    (r) => r.status === 'Submitted' || r.status === 'Under Review'
  ).length;

  const myProjects = projects.filter(
    (p) => p.teamMemberUids.includes(activeProfile.uid) || p.leadUid === activeProfile.uid
  );
  const myTasks = workTasks.filter((t) => t.assigneeUid === activeProfile.uid);
  const openTasks = myTasks.filter((t) => t.status !== 'Completed');

  const myReviews = performanceReviews.filter((r) => r.employeeUid === activeProfile.uid);
  const latestReview = myReviews[0];

  const myNotifications = notifications
    .filter((n) => n.recipientUid === activeProfile.uid)
    .slice(0, 4);

  const visibleAnnouncements = announcements
    .filter(
      (a) =>
        a.status === 'Published' &&
        (a.targetDepartment === 'All Departments' ||
          a.targetDepartment === activeProfile.departmentName)
    )
    .slice(0, 3);

  const upcomingHolidays = holidays.filter((h) => h.date >= todayStr).slice(0, 4);

  // Build Attendance Chart Data (Last 5 Records)
  const attendanceChartData = myAttendance
    .slice(0, 5)
    .reverse()
    .map((r) => ({
      date: r.date.slice(5),
      hours: Number(((r.workDurationMinutes || 0) / 60).toFixed(1)),
      status: r.status,
    }));

  // Leave Balance Breakdown Chart Data
  const leaveChartData = [
    {
      name: 'Casual',
      Remaining: Math.max(0, myBalance.casualTotal - myBalance.casualUsed),
      Used: myBalance.casualUsed,
    },
    {
      name: 'Sick',
      Remaining: Math.max(0, myBalance.sickTotal - myBalance.sickUsed),
      Used: myBalance.sickUsed,
    },
    {
      name: 'Earned',
      Remaining: Math.max(0, myBalance.earnedTotal - myBalance.earnedUsed),
      Used: myBalance.earnedUsed,
    },
  ];

  const handleCheckIn = async () => {
    setChecking(true);
    try {
      await checkInToday();
    } finally {
      setChecking(false);
    }
  };

  const handleCheckOut = async () => {
    setChecking(true);
    try {
      await checkOutToday();
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome & Quick Attendance Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-teal-700 uppercase tracking-wider">
            <span>{activeProfile.departmentName}</span>
            <span>·</span>
            <span className="font-mono-tabular">{activeProfile.employeeId}</span>
            <span>·</span>
            <span>Manager: {activeProfile.managerName}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {activeProfile.fullName}
          </h1>
          <p className="text-xs text-slate-500">
            {activeProfile.designation} · Status:{' '}
            <strong className="text-slate-700">{activeProfile.status}</strong> · Today is{' '}
            <span className="font-mono-tabular">{todayStr}</span>
          </p>
        </div>

        {/* Quick Check-In / Check-Out Action */}
        <div className="flex flex-wrap items-center gap-3">
          {!todayRecord ? (
            <button
              type="button"
              disabled={checking}
              onClick={handleCheckIn}
              className="px-4 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>Check In for Today</span>
            </button>
          ) : !todayRecord.checkOutTime ? (
            <div className="flex items-center gap-3">
              <div className="px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 text-xs">
                <span className="text-slate-500">Checked in at </span>
                <span className="font-mono-tabular font-bold text-slate-900">
                  {todayRecord.checkInTime}
                </span>
              </div>
              <button
                type="button"
                disabled={checking}
                onClick={handleCheckOut}
                className="px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Check Out</span>
              </button>
            </div>
          ) : (
            <div className="px-3.5 py-2 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>
                Shift Complete:{' '}
                <strong className="font-mono-tabular">
                  {todayRecord.checkInTime} – {todayRecord.checkOutTime}
                </strong>
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setCurrentRoute('emp-apply-leave')}
            className="px-3.5 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <CalendarPlus className="w-3.5 h-3.5 text-teal-600" />
            <span>Apply Leave</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentRoute('emp-projects')}
            className="px-3.5 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <FolderKanban className="w-3.5 h-3.5 text-teal-600" />
            <span>My Tasks ({openTasks.length})</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>TODAY&apos;S ATTENDANCE</span>
            <Clock className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono-tabular">
            {todayRecord ? todayRecord.status : 'Not Checked In'}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {todayRecord
              ? `In: ${todayRecord.checkInTime} ${
                  todayRecord.checkOutTime ? `· Out: ${todayRecord.checkOutTime}` : '· Active Shift'
                }`
              : 'Office Hours: 09:00 – 18:00'}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>AVAILABLE LEAVE QUOTA</span>
            <Calendar className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono-tabular">
            {totalRemainingLeave} Days
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Casual: {myBalance.casualTotal - myBalance.casualUsed} · Sick:{' '}
            {myBalance.sickTotal - myBalance.sickUsed} · Earned:{' '}
            {myBalance.earnedTotal - myBalance.earnedUsed}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>ASSIGNED PROJECTS & TASKS</span>
            <FolderKanban className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono-tabular">
            {openTasks.length} Active
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Across {myProjects.length} project(s) ·{' '}
            {myTasks.filter((t) => t.status === 'Completed').length} completed
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>LEAVES & PERFORMANCE</span>
            <Award className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono-tabular">
            {latestReview ? `${latestReview.overallRating} / 5.0` : `${pendingLeavesCount} Pending`}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {pendingLeavesCount} Pending Leave(s) · {approvedLeavesCount} Approved ·{' '}
            {openRequestsCount} Open Request(s)
          </div>
        </div>
      </div>

      {/* Connected Assigned Projects & Outstanding Tasks Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Outstanding Tasks & Deadlines */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Outstanding Tasks & Upcoming Deadlines
              </h2>
              <p className="text-xs text-slate-500">
                Work assigned by your manager or HR. Updating status syncs directly with HR/Admin.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentRoute('emp-projects')}
              className="text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
            >
              View All Projects & Tasks →
            </button>
          </div>

          {myTasks.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No tasks currently assigned to your profile.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {myTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{task.title}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          task.priority === 'Critical' || task.priority === 'High'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Project: <strong className="text-slate-700">{task.projectName}</strong> · Due:{' '}
                      <span className="font-mono-tabular font-semibold text-slate-800">
                        {task.dueDate}
                      </span>{' '}
                      · Assigned by {task.assignedByName}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono-tabular text-slate-600">
                      {task.progressPercent}%
                    </span>
                    <select
                      aria-label={`Update status for ${task.title}`}
                      value={task.status}
                      onChange={(e) =>
                        updateEmployeeTaskProgress(task.id, {
                          status: e.target.value as TaskStatus,
                          progressPercent:
                            e.target.value === 'Completed'
                              ? 100
                              : e.target.value === 'In Review'
                              ? 85
                              : e.target.value === 'In Progress'
                              ? Math.max(25, task.progressPercent)
                              : 0,
                          deliverableNotes: task.deliverableNotes,
                        })
                      }
                      className="px-2.5 py-1 text-xs font-semibold border border-slate-300 rounded-lg bg-white text-slate-800 cursor-pointer"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="In Review">In Review</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assigned Projects Summary */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Assigned Projects</h2>
              <p className="text-xs text-slate-500">Active initiatives and milestone progress</p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentRoute('emp-projects')}
              className="text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
            >
              Details
            </button>
          </div>

          {myProjects.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No projects assigned yet.
            </div>
          ) : (
            <div className="space-y-4">
              {myProjects.map((prj) => (
                <div
                  key={prj.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {prj.name}{' '}
                        <span className="font-mono-tabular text-slate-500">({prj.code})</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Lead: {prj.leadName} · Deadline:{' '}
                        <span className="font-mono-tabular font-semibold">{prj.deadline}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-teal-700">{prj.status}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Completion Progress</span>
                      <span className="font-mono-tabular font-semibold text-slate-800">
                        {prj.progressPercent}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-teal-600 rounded-full transition-all"
                        style={{ width: `${prj.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Charts Section: Attendance Hours & Leave Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Daily Work Hours</h2>
              <p className="text-xs text-slate-500">
                Logged attendance hours from your recent check-in/out records
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentRoute('emp-attendance')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 cursor-pointer"
            >
              View Full Log →
            </button>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="hours" name="Hours Worked" fill="#0D9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Leave Quota Breakdown</h2>
              <p className="text-xs text-slate-500">Remaining vs. used days by leave type</p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentRoute('emp-my-leaves')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 cursor-pointer"
            >
              Leave History →
            </button>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leaveChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#0F172A' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="Remaining" stackId="a" fill="#0D9488" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Used" stackId="a" fill="#94A3B8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom 3-Column Row: Announcements, Upcoming Holidays, Recent Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Announcements */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-teal-700" />
              <h2 className="text-base font-bold text-slate-900">Announcements</h2>
            </div>
            <button
              type="button"
              onClick={() => setCurrentRoute('emp-announcements')}
              className="text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
            >
              All
            </button>
          </div>
          {visibleAnnouncements.length === 0 ? (
            <div className="text-xs text-slate-500 py-6">No active announcements.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {visibleAnnouncements.map((ann) => (
                <div key={ann.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="text-xs font-semibold text-slate-900 mb-1">{ann.title}</div>
                  <p className="text-xs text-slate-600 line-clamp-2 mb-1.5">{ann.content}</p>
                  <div className="text-[11px] text-slate-400">
                    {ann.authorName} · {ann.targetDepartment} · {ann.priority}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Holidays */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-700" />
              <h2 className="text-base font-bold text-slate-900">Upcoming Holidays</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono-tabular">{currentYear}</span>
          </div>
          {upcomingHolidays.length === 0 ? (
            <div className="text-xs text-slate-500 py-6">No upcoming holidays scheduled.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {upcomingHolidays.map((hol) => (
                <div
                  key={hol.id}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-900">{hol.name}</div>
                    <div className="text-[11px] text-slate-500">{hol.type}</div>
                  </div>
                  <div className="text-xs font-mono-tabular font-semibold text-teal-700 shrink-0">
                    {hol.date}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Notifications & Activity */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-teal-700" />
              <h2 className="text-base font-bold text-slate-900">Notifications & Updates</h2>
            </div>
            <button
              type="button"
              onClick={() => setCurrentRoute('emp-notifications')}
              className="text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
            >
              Inbox
            </button>
          </div>
          {myNotifications.length === 0 ? (
            <div className="text-xs text-slate-500 py-6">No recent notifications.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {myNotifications.map((n) => (
                <div key={n.id} className="py-2.5 first:pt-0 last:pb-0">
                  <div className="text-xs font-semibold text-slate-900">{n.title}</div>
                  <div className="text-xs text-slate-600 line-clamp-2 mt-0.5">{n.message}</div>
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
// 2. DEDICATED EMPLOYEE PROFILE PAGE (4.B)
// ============================================================================

export const EmployeeProfileView: React.FC = () => {
  const {
    activeProfile,
    activePrivateProfile,
    attendanceRecords,
    leaveBalances,
    projects,
    performanceReviews,
    updatePersonalProfile,
  } = useWorkNest();

  const [fullName, setFullName] = useState(activeProfile?.fullName || '');
  const [contactNumber, setContactNumber] = useState(
    activePrivateProfile?.contactNumber || '+1 (555) 234-5678'
  );
  const [emergencyContact, setEmergencyContact] = useState(
    activePrivateProfile?.emergencyContact || ''
  );
  const [address, setAddress] = useState(activePrivateProfile?.address || '');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (activeProfile) setFullName(activeProfile.fullName);
    if (activePrivateProfile) {
      setContactNumber(activePrivateProfile.contactNumber);
      setEmergencyContact(activePrivateProfile.emergencyContact);
      setAddress(activePrivateProfile.address);
    }
  }, [activeProfile, activePrivateProfile]);

  if (!activeProfile) return null;

  const myAttendance = attendanceRecords.filter((r) => r.employeeUid === activeProfile.uid);
  const presentDays = myAttendance.filter((r) => r.status === 'Present').length;
  const lateDays = myAttendance.filter((r) => r.status === 'Late').length;
  const totalMinutes = myAttendance.reduce((acc, r) => acc + (r.workDurationMinutes || 0), 0);

  const myBalance = leaveBalances.find((b) => b.employeeUid === activeProfile.uid);
  const myProjects = projects.filter(
    (p) => p.teamMemberUids.includes(activeProfile.uid) || p.leadUid === activeProfile.uid
  );
  const myReviews = performanceReviews.filter((r) => r.employeeUid === activeProfile.uid);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updatePersonalProfile({
        fullName,
        contactNumber,
        emergencyContact,
        address,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Identity Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-slate-900 text-teal-400 font-bold text-xl flex items-center justify-center shrink-0">
            {activeProfile.avatarInitials}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{activeProfile.fullName}</h1>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
              <span className="font-mono-tabular font-semibold text-slate-800">
                {activeProfile.employeeId}
              </span>
              <span>·</span>
              <span>{activeProfile.designation}</span>
              <span>·</span>
              <span>{activeProfile.departmentName}</span>
              <span>·</span>
              <span className="text-teal-700 font-semibold">{activeProfile.status}</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 sm:text-right">
          <div>
            Joining Date:{' '}
            <span className="font-mono-tabular font-semibold text-slate-800">
              {activeProfile.joiningDate}
            </span>
          </div>
          <div className="mt-1">
            Reporting Manager:{' '}
            <span className="font-semibold text-slate-800">{activeProfile.managerName}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Personal Editable Details vs Restricted HR Fields */}
        <div className="lg:col-span-7 space-y-6">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-xl border border-slate-200 p-6 space-y-5"
          >
            <div>
              <h2 className="text-base font-bold text-slate-900">Permitted Personal Details</h2>
              <p className="text-xs text-slate-500">
                Update your display name, phone number, emergency contact, and residential address.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Corporate Email (Verified)
                </label>
                <input
                  type="email"
                  disabled
                  value={activePrivateProfile?.email || 'protected@worknest.io'}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 bg-slate-50 text-slate-500 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Number
                </label>
                <input
                  type="tel"
                  required
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Emergency Contact
                </label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="Name & relationship phone"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Residential / Mailing Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address, City, State, ZIP"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving Changes...' : 'Save Personal Details'}</span>
              </button>
            </div>
          </form>

          {/* HR-Restricted Employment Record */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-4 h-4 text-slate-500" />
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  HR-Governed Organizational Assignment
                </h2>
                <p className="text-xs text-slate-500">
                  Department, designation, status, and reporting manager can only be modified by
                  authorized HR administrators.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-slate-500 mb-1">Employee ID</div>
                <div className="font-mono-tabular font-semibold text-slate-900">
                  {activeProfile.employeeId}
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-slate-500 mb-1">Department</div>
                <div className="font-semibold text-slate-900">{activeProfile.departmentName}</div>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-slate-500 mb-1">Job Designation</div>
                <div className="font-semibold text-slate-900">{activeProfile.designation}</div>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-slate-500 mb-1">Reporting Manager</div>
                <div className="font-semibold text-slate-900">{activeProfile.managerName}</div>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-slate-500 mb-1">Employment Status</div>
                <div className="font-semibold text-teal-700">{activeProfile.status}</div>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-slate-500 mb-1">System Role</div>
                <div className="font-semibold text-slate-900">{activeProfile.role}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Attendance, Leave, & Assigned Projects Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4">Attendance Summary</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-xl font-bold text-slate-900 font-mono-tabular">
                  {presentDays}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Days Present</div>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-xl font-bold text-amber-700 font-mono-tabular">{lateDays}</div>
                <div className="text-[11px] text-slate-500 mt-1">Late Arrivals</div>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-xl font-bold text-teal-700 font-mono-tabular">
                  {(totalMinutes / 60).toFixed(1)}h
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Logged Hours</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4">Leave Balance Summary</h2>
            {myBalance ? (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="font-medium text-slate-700">Casual Leave</span>
                  <span className="font-mono-tabular font-semibold text-slate-900">
                    {myBalance.casualTotal - myBalance.casualUsed} available /{' '}
                    {myBalance.casualTotal} total
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="font-medium text-slate-700">Sick Leave</span>
                  <span className="font-mono-tabular font-semibold text-slate-900">
                    {myBalance.sickTotal - myBalance.sickUsed} available / {myBalance.sickTotal}{' '}
                    total
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="font-medium text-slate-700">Earned Leave</span>
                  <span className="font-mono-tabular font-semibold text-slate-900">
                    {myBalance.earnedTotal - myBalance.earnedUsed} available /{' '}
                    {myBalance.earnedTotal} total
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="font-medium text-slate-700">Unpaid Leave Used</span>
                  <span className="font-mono-tabular font-semibold text-slate-600">
                    {myBalance.unpaidUsed} day(s)
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500">
                Leave balance initialized for current year.
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-base font-bold text-slate-900 mb-3">
              Assigned Projects & Performance
            </h2>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Active Projects Assigned</span>
                <span className="font-mono-tabular font-semibold text-slate-900">
                  {myProjects.length} Project(s)
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-600">Latest Evaluation Rating</span>
                <span className="font-mono-tabular font-semibold text-teal-700">
                  {myReviews[0] ? `${myReviews[0].overallRating} / 5.0` : 'Pending Cycle'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. EMPLOYEE PROJECTS & TASKS VIEW (4.E - Connected with HR/Admin Work Assignment)
// ============================================================================

export const EmployeeProjectsAndTasksView: React.FC = () => {
  const {
    activeProfile,
    projects,
    workTasks,
    profiles,
    updateEmployeeTaskProgress,
  } = useWorkNest();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<TaskStatus>('In Progress');
  const [editProgress, setEditProgress] = useState<number>(50);
  const [editNotes, setEditNotes] = useState<string>('');
  const [savingTask, setSavingTask] = useState(false);

  if (!activeProfile) return null;

  const myProjects = projects.filter(
    (p) => p.teamMemberUids.includes(activeProfile.uid) || p.leadUid === activeProfile.uid
  );

  const myTasks = workTasks.filter((t) => t.assigneeUid === activeProfile.uid);
  const filteredTasks = myTasks.filter(
    (t) => statusFilter === 'ALL' || t.status === statusFilter
  );

  const openTaskEditor = (task: (typeof myTasks)[0]) => {
    setEditingTaskId(task.id);
    setEditStatus(task.status);
    setEditProgress(task.progressPercent);
    setEditNotes(task.deliverableNotes || '');
  };

  const handleSaveTaskUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTaskId) return;
    setSavingTask(true);
    try {
      await updateEmployeeTaskProgress(editingTaskId, {
        status: editStatus,
        progressPercent: editProgress,
        deliverableNotes: editNotes,
      });
      setEditingTaskId(null);
    } finally {
      setSavingTask(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Assigned Projects Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Assigned Projects & Initiatives</h1>
            <p className="text-xs text-slate-500 mt-1">
              Projects assigned to you by HR/Admin or your department lead. Project progress
              automatically recalculates as you complete assigned tasks.
            </p>
          </div>
          <div className="text-xs font-mono-tabular font-semibold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200">
            {myProjects.length} Active Project(s)
          </div>
        </div>

        {myProjects.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-500">
            You are not currently assigned to any projects.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myProjects.map((prj) => {
              const teamProfiles = profiles.filter((p) => prj.teamMemberUids.includes(p.uid));
              const projectTasks = myTasks.filter((t) => t.projectId === prj.id);
              return (
                <div
                  key={prj.id}
                  className="rounded-xl border border-slate-200 p-5 bg-slate-50/50 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="font-mono-tabular text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          {prj.code}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-1.5">{prj.name}</h3>
                      </div>
                      <span className="text-xs font-semibold text-slate-800 bg-white px-2.5 py-1 rounded border border-slate-200">
                        {prj.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{prj.description}</p>

                    <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                      <div>
                        <span className="text-slate-400">Department:</span>{' '}
                        <span className="font-medium text-slate-800">{prj.departmentName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Project Lead:</span>{' '}
                        <span className="font-medium text-slate-800">{prj.leadName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Start Date:</span>{' '}
                        <span className="font-mono-tabular text-slate-800">{prj.startDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Deadline:</span>{' '}
                        <span className="font-mono-tabular font-semibold text-slate-900">
                          {prj.deadline}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-200/80">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium text-slate-600">
                          Project Completion ({projectTasks.length} of your tasks)
                        </span>
                        <span className="font-mono-tabular font-bold text-teal-700">
                          {prj.progressPercent}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-teal-600 rounded-full transition-all"
                          style={{ width: `${prj.progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Assigned Team:</span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {teamProfiles.map((tp) => (
                          <span
                            key={tp.uid}
                            className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium"
                          >
                            {tp.fullName}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Assigned Tasks & Deliverable Progress Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">My Assigned Tasks & Deliverables</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Update task status, completion percentage, or deliverable notes. Changes sync
              immediately with the HR/Admin Work Assignment view.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {['ALL', 'To Do', 'In Progress', 'In Review', 'Completed'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'ALL' ? 'All Tasks' : st}
              </button>
            ))}
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No tasks match the selected status filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <th className="py-2.5 pr-3">Task & Deliverable</th>
                  <th className="py-2.5 px-3">Project</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3">Progress</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 pl-3 text-right">Update Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50">
                    <td className="py-3.5 pr-3 max-w-xs">
                      <div className="font-bold text-slate-900">{task.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{task.description}</div>
                      {task.deliverableNotes && (
                        <div className="text-[11px] text-teal-700 mt-1">
                          Note: {task.deliverableNotes}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-800">{task.projectName}</td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`font-semibold ${
                          task.priority === 'Critical'
                            ? 'text-red-600'
                            : task.priority === 'High'
                            ? 'text-amber-700'
                            : 'text-slate-700'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono-tabular font-semibold text-slate-800">
                      {task.dueDate}
                    </td>
                    <td className="py-3.5 px-3 w-32">
                      <div className="flex items-center gap-2">
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-teal-600 rounded-full"
                            style={{ width: `${task.progressPercent}%` }}
                          />
                        </div>
                        <span className="font-mono-tabular font-semibold text-slate-700">
                          {task.progressPercent}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-semibold">
                      <span
                        className={
                          task.status === 'Completed'
                            ? 'text-teal-700'
                            : task.status === 'In Progress' || task.status === 'In Review'
                            ? 'text-amber-700'
                            : 'text-slate-600'
                        }
                      >
                        {task.status}
                      </span>
                    </td>
                    <td className="py-3.5 pl-3 text-right">
                      <button
                        type="button"
                        onClick={() => openTaskEditor(task)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Update Task Progress Modal */}
      {editingTaskId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Update Task Status & Deliverable Notes
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Your progress updates are immediately visible to your Manager and HR/Admin.
            </p>
            <form onSubmit={handleSaveTaskUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Task Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => {
                    const nextSt = e.target.value as TaskStatus;
                    setEditStatus(nextSt);
                    if (nextSt === 'Completed') setEditProgress(100);
                    else if (nextSt === 'To Do') setEditProgress(0);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="In Review">In Review</option>
                  <option value="Completed">Completed (100%)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Completion Percentage</span>
                  <span className="font-mono-tabular text-teal-700">{editProgress}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={editProgress}
                  onChange={(e) => setEditProgress(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Deliverable Notes / Status Update
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Describe milestones completed, PR links, or blockers..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTaskId(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTask}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold cursor-pointer"
                >
                  {savingTask ? 'Saving...' : 'Save Task Progress'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 4. EMPLOYEE TEAM & COLLEAGUES VIEW (4.F)
// ============================================================================

export const EmployeeTeamView: React.FC = () => {
  const { activeProfile, profiles, departments, projects, privateProfilesMap } = useWorkNest();
  const [searchQuery, setSearchQuery] = useState('');
  const [scopeTab, setScopeTab] = useState<'MY_DEPT' | 'ALL_ORG'>('MY_DEPT');

  if (!activeProfile) return null;

  const myDept = departments.find((d) => d.id === activeProfile.departmentId);
  const myManager = profiles.find((p) => p.uid === activeProfile.managerUid);

  const displayedColleagues = profiles.filter((p) => {
    const inTab =
      scopeTab === 'MY_DEPT' ? p.departmentId === activeProfile.departmentId : true;
    const matchesSearch =
      !searchQuery.trim() ||
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.departmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    return inTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Department & Reporting Manager Summary Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Assigned Department</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            {myDept ? `${myDept.name} (${myDept.code})` : activeProfile.departmentName}
          </h1>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            {myDept?.description ||
              'Collaborate with your department peers and cross-functional project members.'}
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs text-slate-500">
            <div>
              Department Head:{' '}
              <strong className="text-slate-800">
                {myDept?.headName || activeProfile.managerName}
              </strong>
            </div>
            <div>
              Department Members:{' '}
              <strong className="font-mono-tabular text-slate-800">
                {profiles.filter((p) => p.departmentId === activeProfile.departmentId).length}
              </strong>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6">
          <div className="text-xs font-semibold text-teal-700 uppercase tracking-wider mb-2">
            Your Reporting Supervisor
          </div>
          {myManager ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-teal-400 font-bold text-sm flex items-center justify-center shrink-0">
                {myManager.avatarInitials}
              </div>
              <div>
                <div className="text-base font-bold text-slate-900">{myManager.fullName}</div>
                <div className="text-xs text-slate-500">
                  {myManager.designation} ·{' '}
                  <span className="font-mono-tabular">{myManager.employeeId}</span>
                </div>
                <div className="text-xs text-teal-700 mt-1">
                  {privateProfilesMap[myManager.uid]?.email ||
                    `${myManager.fullName.toLowerCase().replace(/\s+/g, '.')}@worknest.io`}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500">{activeProfile.managerName}</div>
          )}
        </div>
      </div>

      {/* Team Directory List */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setScopeTab('MY_DEPT')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                scopeTab === 'MY_DEPT'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              My Department ({activeProfile.departmentName})
            </button>
            <button
              type="button"
              onClick={() => setScopeTab('ALL_ORG')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                scopeTab === 'ALL_ORG'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Company Directory ({profiles.length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search colleague name, role, ID..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedColleagues.map((colleague) => {
            const sharedProjects = projects.filter(
              (prj) =>
                prj.teamMemberUids.includes(colleague.uid) &&
                prj.teamMemberUids.includes(activeProfile.uid)
            );
            return (
              <div
                key={colleague.uid}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white flex flex-col justify-between gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-900 text-teal-400 font-bold text-xs flex items-center justify-center shrink-0">
                      {colleague.avatarInitials}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        {colleague.fullName}{' '}
                        {colleague.uid === activeProfile.uid && (
                          <span className="text-[10px] font-semibold text-teal-700">(You)</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">{colleague.designation}</div>
                    </div>
                  </div>
                  <span className="font-mono-tabular text-[11px] font-semibold text-slate-500">
                    {colleague.employeeId}
                  </span>
                </div>

                <div className="text-xs space-y-1 pt-2 border-t border-slate-100 text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Department:</span>
                    <span className="font-medium text-slate-800">{colleague.departmentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Role:</span>
                    <span className="font-medium text-slate-800">{colleague.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span
                      className={`font-semibold ${
                        colleague.status === 'Active' ? 'text-teal-700' : 'text-amber-700'
                      }`}
                    >
                      {colleague.status}
                    </span>
                  </div>
                  {sharedProjects.length > 0 && (
                    <div className="pt-1 text-[11px] text-teal-700 font-medium">
                      Shared Project: {sharedProjects.map((p) => p.code).join(', ')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 5. EMPLOYEE PERFORMANCE & REVIEWS VIEW (4.H - Connected with HR Reviews)
// ============================================================================

export const EmployeePerformanceView: React.FC = () => {
  const {
    activeProfile,
    performanceReviews,
    workTasks,
    attendanceRecords,
    submitEmployeeSelfAssessment,
  } = useWorkNest();

  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [selfAssessmentText, setSelfAssessmentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!activeProfile) return null;

  const myReviews = performanceReviews.filter((r) => r.employeeUid === activeProfile.uid);
  const myTasks = workTasks.filter((t) => t.assigneeUid === activeProfile.uid);
  const completedTasks = myTasks.filter((t) => t.status === 'Completed').length;
  const avgTaskProgress =
    myTasks.length > 0
      ? Math.round(myTasks.reduce((acc, t) => acc + t.progressPercent, 0) / myTasks.length)
      : 100;

  const myAttendance = attendanceRecords.filter((r) => r.employeeUid === activeProfile.uid);
  const onTimeCount = myAttendance.filter((r) => r.status === 'Present').length;

  const openSelfAssessmentModal = (rev: (typeof myReviews)[0]) => {
    setSelectedReviewId(rev.id);
    setSelfAssessmentText(rev.employeeSelfAssessment || '');
  };

  const handleSaveSelfAssessment = async (acknowledge: boolean) => {
    if (!selectedReviewId) return;
    setSubmitting(true);
    try {
      await submitEmployeeSelfAssessment(selectedReviewId, selfAssessmentText, acknowledge);
      setSelectedReviewId(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Performance KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>LATEST OVERALL RATING</span>
            <Award className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono-tabular">
            {myReviews[0] ? `${myReviews[0].overallRating} / 5.0` : 'Not Rated Yet'}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {myReviews[0]
              ? `${myReviews[0].reviewCycle} · ${myReviews[0].status}`
              : 'Evaluations published by HR appear here'}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>TASK DELIVERY COMPLETION</span>
            <CheckSquare className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono-tabular">
            {avgTaskProgress}%
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {completedTasks} of {myTasks.length} assigned deliverable(s) completed
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>ATTENDANCE RELIABILITY</span>
            <Clock className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono-tabular">
            {onTimeCount} On-Time Days
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Across {myAttendance.length} recorded attendance shifts
          </div>
        </div>
      </div>

      {/* Performance Evaluation Records */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Performance Reviews & Goal Alignment
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official performance evaluations published by HR and your department lead. Add your
            self-assessment reflection and acknowledge completed reviews.
          </p>
        </div>

        {myReviews.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No performance evaluations have been published for your profile yet.
          </div>
        ) : (
          <div className="space-y-6">
            {myReviews.map((rev) => (
              <div
                key={rev.id}
                className="rounded-xl border border-slate-200 p-6 bg-slate-50/40 space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-base font-bold text-slate-900">{rev.reviewCycle}</h2>
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded border ${
                          rev.status === 'Acknowledged'
                            ? 'bg-teal-50 text-teal-800 border-teal-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {rev.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Reviewed by <strong className="text-slate-700">{rev.reviewerName}</strong> on{' '}
                      <span className="font-mono-tabular">{rev.reviewDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[11px] text-slate-500">Overall Score</div>
                      <div className="text-xl font-bold font-mono-tabular text-teal-700">
                        {rev.overallRating} / 5.0
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => openSelfAssessmentModal(rev)}
                      className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
                    >
                      {rev.status === 'Acknowledged'
                        ? 'Edit Self-Assessment'
                        : 'Respond & Acknowledge'}
                    </button>
                  </div>
                </div>

                {/* Competency Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded-lg bg-white border border-slate-200">
                    <div className="text-slate-500">Technical Execution</div>
                    <div className="text-base font-bold font-mono-tabular text-slate-900 mt-1">
                      {rev.technicalScore} / 5.0
                    </div>
                  </div>
                  <div className="p-3.5 rounded-lg bg-white border border-slate-200">
                    <div className="text-slate-500">Collaboration & Teamwork</div>
                    <div className="text-base font-bold font-mono-tabular text-slate-900 mt-1">
                      {rev.collaborationScore} / 5.0
                    </div>
                  </div>
                  <div className="p-3.5 rounded-lg bg-white border border-slate-200">
                    <div className="text-slate-500">Reliability & Ownership</div>
                    <div className="text-base font-bold font-mono-tabular text-slate-900 mt-1">
                      {rev.reliabilityScore} / 5.0
                    </div>
                  </div>
                </div>

                {/* Qualitative Feedback */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-900">Key Strengths</div>
                    <p className="text-slate-600 leading-relaxed">{rev.keyStrengths}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-900">Growth & Development Areas</div>
                    <p className="text-slate-600 leading-relaxed">{rev.growthAreas}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-900">Goals for Next Period</div>
                    <p className="text-slate-600 leading-relaxed">{rev.goalsNextPeriod}</p>
                  </div>
                </div>

                {/* Employee Self-Assessment Box */}
                <div className="p-4 rounded-lg bg-teal-50/60 border border-teal-200 text-xs">
                  <div className="font-bold text-teal-900 mb-1">
                    Your Employee Self-Assessment & Comments
                  </div>
                  <p className="text-teal-800">
                    {rev.employeeSelfAssessment ||
                      'No self-assessment submitted yet. Click "Respond & Acknowledge" to add your comments and sync with HR.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Self-Assessment Modal */}
      {selectedReviewId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">
              Employee Self-Assessment & Review Acknowledgment
            </h3>
            <p className="text-slate-500">
              Share your accomplishments, reflections, and goals for the upcoming period. Submitting
              updates your HR performance record immediately.
            </p>
            <textarea
              rows={4}
              value={selfAssessmentText}
              onChange={(e) => setSelfAssessmentText(e.target.value)}
              placeholder="Write your self-assessment and response to your reviewer's feedback..."
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedReviewId(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSaveSelfAssessment(true)}
                className="px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting...' : 'Save & Acknowledge Review'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
