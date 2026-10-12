import React, { useState } from 'react';
import {
  Users,
  Building2,
  UserCheck,
  Clock,
  CalendarCheck,
  FolderKanban,
  Megaphone,
  FileSpreadsheet,
  Settings,
  Shield,
  Plus,
  Search,
  Edit3,
  CheckCircle2,
  XCircle,
  Trash2,
  Sparkles,
  History,
  Award,
  CheckSquare,
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
import {
  EmploymentStatus,
  UserRole,
  Department,
  Profile,
  ProjectStatus,
  TaskPriority,
  TaskStatus,
  PerformanceReviewStatus,
  Project,
  WorkTask,
  PerformanceReview,
} from '../types/worknest';

// ============================================================================
// 1. HR / ADMINISTRATOR EXECUTIVE DASHBOARD
// ============================================================================

export const HrDashboardView: React.FC = () => {
  const {
    profiles,
    departments,
    attendanceRecords,
    leaveRequests,
    workplaceRequests,
    projects,
    workTasks,
    performanceReviews,
    announcements,
    auditLogs,
    setCurrentRoute,
    seedEnterpriseWorkspace,
    dataLoading,
  } = useWorkNest();

  const todayStr = getTodayDateString();

  const activeEmployees = profiles.filter((p) => p.status === 'Active');
  const pendingAccounts = profiles.filter((p) => p.status === 'Pending Approval');
  const managersCount = profiles.filter((p) => p.role === 'Manager').length;

  const todayAttendance = attendanceRecords.filter((r) => r.date === todayStr);
  const presentToday = todayAttendance.filter(
    (r) => r.status === 'Present' || r.status === 'Late'
  ).length;
  const lateToday = todayAttendance.filter((r) => r.status === 'Late').length;

  const pendingLeaves = leaveRequests.filter(
    (r) => r.status === 'Pending' || r.status === 'Pending HR Approval'
  );
  const openWorkplaceRequests = workplaceRequests.filter(
    (r) => r.status === 'Submitted' || r.status === 'Under Review'
  );

  const activeProjectsCount = projects.filter((p) => p.status !== 'Completed').length;
  const openTasksCount = workTasks.filter((t) => t.status !== 'Completed').length;
  const completedTasksCount = workTasks.filter((t) => t.status === 'Completed').length;

  // Department headcount chart
  const deptChartData = departments.map((d) => ({
    name: d.code,
    fullName: d.name,
    Employees: profiles.filter((p) => p.departmentId === d.id && p.status !== 'Deactivated')
      .length,
  }));

  // Leave status distribution chart
  const leaveStatusData = [
    {
      name: 'Pending',
      Count: leaveRequests.filter(
        (r) => r.status === 'Pending' || r.status === 'Pending HR Approval'
      ).length,
    },
    {
      name: 'Approved',
      Count: leaveRequests.filter((r) => r.status === 'Approved').length,
    },
    {
      name: 'Rejected',
      Count: leaveRequests.filter((r) => r.status === 'Rejected').length,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Executive Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-teal-700 mb-1">
            HR & Organization Administration
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Enterprise Workforce & Leave Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Full visibility across {departments.length} departments, {profiles.length} employee
            profiles, {projects.length} active projects, and {performanceReviews.length} performance
            evaluations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setCurrentRoute('hr-employees')}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manage Employees</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentRoute('hr-work')}
            className="px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Assign Projects & Tasks</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentRoute('hr-reports')}
            className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
            <span>Export Reports</span>
          </button>
          <button
            type="button"
            disabled={dataLoading}
            onClick={seedEnterpriseWorkspace}
            className="px-3.5 py-2 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Reset Sample Data</span>
          </button>
        </div>
      </div>

      {/* 4 Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>TOTAL WORKFORCE</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono-tabular">
            {profiles.length} Employees
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {activeEmployees.length} Active · {managersCount} Managers · {pendingAccounts.length}{' '}
            Pending
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>TODAY&apos;S ATTENDANCE</span>
            <Clock className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono-tabular">
            {presentToday} Checked In
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {lateToday} Late Arrivals · {departments.length} Active Departments
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>PROJECTS & WORK TASKS</span>
            <FolderKanban className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono-tabular">
            {activeProjectsCount} Projects
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {openTasksCount} Open Tasks · {completedTasksCount} Completed Deliverables
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>LEAVES & REVIEWS</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 font-mono-tabular">
            {pendingLeaves.length} Pending Leave(s)
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {performanceReviews.length} Performance Review(s) · {openWorkplaceRequests.length}{' '}
            Workplace Request(s)
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Workforce Distribution by Department
              </h2>
              <p className="text-xs text-slate-500">Active employee headcount per department</p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentRoute('hr-departments')}
              className="text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
            >
              Manage Departments →
            </button>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#0F172A' }} />
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
                <Bar dataKey="Employees" fill="#0D9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Leave Request Pipeline</h2>
              <p className="text-xs text-slate-500">Company-wide leave statuses</p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentRoute('hr-leaves')}
              className="text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
            >
              Leave Control →
            </button>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leaveStatusData} layout="vertical">
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
                <Bar dataKey="Count" fill="#0F172A" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Split: Active Projects/Tasks Snapshot & Recent Audit History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">
              Active Projects & Assigned Deliverables
            </h2>
            <button
              type="button"
              onClick={() => setCurrentRoute('hr-work')}
              className="text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
            >
              Assign Work →
            </button>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {workTasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="font-semibold text-slate-900">
                    {task.title} ·{' '}
                    <span className="text-teal-700 font-medium">{task.projectName}</span>
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    Assigned to: <strong className="text-slate-700">{task.assigneeName}</strong> (
                    <span className="font-mono-tabular">{task.assigneeId}</span>) · Due{' '}
                    <span className="font-mono-tabular">{task.dueDate}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono-tabular font-bold text-slate-900">
                    {task.progressPercent}%
                  </div>
                  <div className="text-[11px] text-slate-500">{task.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Recent System Audit Trail</h2>
            <button
              type="button"
              onClick={() => setCurrentRoute('hr-audit')}
              className="text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
            >
              Full Audit Log →
            </button>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="py-2.5 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{log.action}</span>
                  <span className="text-[11px] font-mono-tabular text-teal-700">
                    {log.category}
                  </span>
                </div>
                <p className="text-slate-600 mt-0.5 line-clamp-1">{log.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. HR EMPLOYEE DIRECTORY & RECORD MANAGEMENT (5.B)
// ============================================================================

export const HrEmployeesView: React.FC = () => {
  const {
    profiles,
    privateProfilesMap,
    departments,
    hrCreateOrUpdateEmployee,
  } = useWorkNest();

  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUid, setEditingUid] = useState<string | undefined>(undefined);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || 'dept-eng');
  const [designation, setDesignation] = useState('');
  const [role, setRole] = useState<UserRole>('Employee');
  const [status, setStatus] = useState<EmploymentStatus>('Active');
  const [managerUid, setManagerUid] = useState('mgr-eng-01');
  const [joiningDate, setJoiningDate] = useState(getTodayDateString());
  const [saving, setSaving] = useState(false);

  const managersList = profiles.filter((p) => p.role === 'Manager' || p.role === 'HR');

  const filteredProfiles = profiles.filter((p) => {
    const matchesDept = deptFilter === 'ALL' || p.departmentId === deptFilter;
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.departmentName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesStatus && matchesSearch;
  });

  const openAddModal = () => {
    setEditingUid(undefined);
    setFullName('');
    setEmail('');
    setContactNumber('+1 (555) 400-1000');
    setEmployeeId(`EMP-${100 + profiles.length + 1}`);
    setDepartmentId(departments[0]?.id || 'dept-eng');
    setDesignation('Software Engineer');
    setRole('Employee');
    setStatus('Active');
    setManagerUid(managersList[0]?.uid || 'mgr-eng-01');
    setJoiningDate(getTodayDateString());
    setModalOpen(true);
  };

  const openEditModal = (emp: Profile) => {
    const priv = privateProfilesMap[emp.uid];
    setEditingUid(emp.uid);
    setFullName(emp.fullName);
    setEmail(priv?.email || `${emp.fullName.toLowerCase().replace(/\s+/g, '.')}@worknest.io`);
    setContactNumber(priv?.contactNumber || '+1 (555) 234-5678');
    setEmployeeId(emp.employeeId);
    setDepartmentId(emp.departmentId);
    setDesignation(emp.designation);
    setRole(emp.role);
    setStatus(emp.status);
    setManagerUid(emp.managerUid);
    setJoiningDate(emp.joiningDate);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await hrCreateOrUpdateEmployee({
        uid: editingUid,
        fullName,
        email,
        contactNumber,
        employeeId,
        departmentId,
        designation,
        role,
        status,
        managerUid,
        joiningDate,
      });
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Employee Directory & Record Management
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Add employees, assign employee IDs, configure departments and reporting managers, or
              deactivate records while preserving history.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Employee</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="On Leave">On Leave</option>
              <option value="Deactivated">Deactivated</option>
            </select>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, ID, designation..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        {/* Employee Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                <th className="py-2.5 pr-3">Employee ID</th>
                <th className="py-2.5 px-3">Full Name & Email</th>
                <th className="py-2.5 px-3">Department & Designation</th>
                <th className="py-2.5 px-3">Reporting Manager</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 pl-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProfiles.map((emp) => (
                <tr key={emp.uid} className="hover:bg-slate-50">
                  <td className="py-3 pr-3 font-mono-tabular font-semibold text-slate-800">
                    {emp.employeeId}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{emp.fullName}</div>
                    <div className="text-[11px] text-slate-500">
                      {privateProfilesMap[emp.uid]?.email ||
                        `${emp.fullName.toLowerCase().replace(/\s+/g, '.')}@worknest.io`}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-900">{emp.departmentName}</div>
                    <div className="text-[11px] text-slate-500">{emp.designation}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-700">{emp.managerName}</td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{emp.role}</td>
                  <td className="py-3 px-3 font-semibold">
                    <span
                      className={
                        emp.status === 'Active'
                          ? 'text-teal-700'
                          : emp.status === 'Pending Approval'
                          ? 'text-amber-700'
                          : emp.status === 'Deactivated'
                          ? 'text-red-600'
                          : 'text-slate-600'
                      }
                    >
                      {emp.status}
                    </span>
                  </td>
                  <td className="py-3 pl-3 text-right">
                    <button
                      type="button"
                      onClick={() => openEditModal(emp)}
                      className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Employee Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {editingUid ? 'Edit Employee Record' : 'Add New Employee'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Configure employee ID, department, reporting manager, role, and employment status.
            </p>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Employee ID *</label>
                  <input
                    type="text"
                    required
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono-tabular"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Work Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Contact Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department *</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Designation *</label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Reporting Manager *
                  </label>
                  <select
                    value={managerUid}
                    onChange={(e) => setManagerUid(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {managersList.map((m) => (
                      <option key={m.uid} value={m.uid}>
                        {m.fullName} ({m.role} · {m.departmentName})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Joining Date *</label>
                  <input
                    type="date"
                    required
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono-tabular"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">System Role *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager / Department Head</option>
                    <option value="HR">HR / Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Employment Status *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as EmploymentStatus)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending Approval">Pending Approval</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Deactivated">Deactivated (Historical Preserved)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save Employee Record'}
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
// 3. HR DEPARTMENT & MANAGER MANAGEMENT (5.C)
// ============================================================================

export const HrDepartmentAndManagerView: React.FC<{
  mode: 'departments' | 'managers';
}> = ({ mode }) => {
  const {
    profiles,
    departments,
    hrCreateOrUpdateDepartment,
    hrAssignManagerToEmployee,
    hrCreateOrUpdateEmployee,
    privateProfilesMap,
  } = useWorkNest();

  const [deptModal, setDeptModal] = useState(false);
  const [editDeptId, setEditDeptId] = useState<string | undefined>(undefined);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptDesc, setDeptDesc] = useState('');
  const [deptHeadUid, setDeptHeadUid] = useState('');
  const [deptStatus, setDeptStatus] = useState<'Active' | 'Deactivated'>('Active');

  const [selectedEmpUid, setSelectedEmpUid] = useState(profiles[0]?.uid || '');
  const [targetMgrUid, setTargetMgrUid] = useState('mgr-eng-01');

  const managers = profiles.filter((p) => p.role === 'Manager' || p.role === 'HR');

  const openCreateDept = () => {
    setEditDeptId(undefined);
    setDeptName('');
    setDeptCode('');
    setDeptDesc('');
    setDeptHeadUid(managers[0]?.uid || '');
    setDeptStatus('Active');
    setDeptModal(true);
  };

  const openEditDept = (d: Department) => {
    setEditDeptId(d.id);
    setDeptName(d.name);
    setDeptCode(d.code);
    setDeptDesc(d.description);
    setDeptHeadUid(d.headUid);
    setDeptStatus(d.status);
    setDeptModal(true);
  };

  const handleSaveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    await hrCreateOrUpdateDepartment({
      id: editDeptId,
      name: deptName,
      code: deptCode,
      description: deptDesc,
      headUid: deptHeadUid,
      status: deptStatus,
    });
    setDeptModal(false);
  };

  const handleAssignManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpUid || !targetMgrUid) return;
    await hrAssignManagerToEmployee(selectedEmpUid, targetMgrUid);
  };

  if (mode === 'departments') {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Department Management</h1>
            <p className="text-xs text-slate-500 mt-1">
              Create organizational units, assign department heads, and manage departmental
              assignments.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateDept}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Department</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {departments.map((d) => {
            const deptMembers = profiles.filter((p) => p.departmentId === d.id);
            return (
              <div key={d.id} className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="text-base font-bold text-slate-900">{d.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Code: <span className="font-mono-tabular font-semibold">{d.code}</span> ·
                      Head: <span className="font-semibold text-slate-800">{d.headName}</span> ·
                      Status: <span className="text-teal-700 font-semibold">{d.status}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => openEditDept(d)}
                    className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 cursor-pointer"
                  >
                    Edit
                  </button>
                </div>

                <p className="text-xs text-slate-600 mb-4">{d.description}</p>

                <div className="pt-3 border-t border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-500 mb-2">
                    Assigned Employees ({deptMembers.length})
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {deptMembers.map((m) => (
                      <div key={m.uid} className="flex items-center justify-between text-slate-700">
                        <span>
                          {m.fullName} ({m.designation})
                        </span>
                        <span className="font-mono-tabular text-slate-500">{m.employeeId}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {deptModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6">
              <h3 className="text-base font-bold text-slate-900 mb-1">
                {editDeptId ? 'Edit Department' : 'Create Department'}
              </h3>
              <form onSubmit={handleSaveDept} className="space-y-4 text-xs mt-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Department Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={deptName}
                      onChange={(e) => setDeptName(e.target.value)}
                      placeholder="e.g. Cloud Infrastructure"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Code *</label>
                    <input
                      type="text"
                      required
                      value={deptCode}
                      onChange={(e) => setDeptCode(e.target.value)}
                      placeholder="INFRA"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono-tabular uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Department Head *
                  </label>
                  <select
                    value={deptHeadUid}
                    onChange={(e) => setDeptHeadUid(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {profiles.map((p) => (
                      <option key={p.uid} value={p.uid}>
                        {p.fullName} ({p.role} · {p.employeeId})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={deptDesc}
                    onChange={(e) => setDeptDesc(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={deptStatus}
                    onChange={(e) => setDeptStatus(e.target.value as 'Active' | 'Deactivated')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Deactivated">Deactivated</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeptModal(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold cursor-pointer"
                  >
                    Save Department
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-base font-bold text-slate-900 mb-1">
            Assign Employee to Reporting Manager
          </h2>
          <p className="text-xs text-slate-500 mb-5">
            Changes immediately update reporting relationships and route all pending leave and
            workplace requests to the newly assigned supervisor.
          </p>

          <form onSubmit={handleAssignManager} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Employee *</label>
              <select
                value={selectedEmpUid}
                onChange={(e) => setSelectedEmpUid(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg bg-white"
              >
                {profiles.map((p) => (
                  <option key={p.uid} value={p.uid}>
                    {p.fullName} ({p.employeeId} · Current Manager: {p.managerName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Assign Reporting Manager *
              </label>
              <select
                value={targetMgrUid}
                onChange={(e) => setTargetMgrUid(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg bg-white"
              >
                {managers.map((m) => (
                  <option key={m.uid} value={m.uid}>
                    {m.fullName} ({m.role} · {m.departmentName})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Update Reporting Relationship</span>
            </button>
          </form>
        </div>

        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-base font-bold text-slate-900 mb-1">
            Authorized Managers & Supervised Teams
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Promote employees to Manager or revoke managerial permissions.
          </p>

          <div className="divide-y divide-slate-100 text-xs">
            {profiles.map((p) => {
              const directReports = profiles.filter(
                (r) => r.managerUid === p.uid && r.uid !== p.uid
              );
              const isMgr = p.role === 'Manager';
              return (
                <div
                  key={p.uid}
                  className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="font-semibold text-slate-900">
                      {p.fullName} ({p.employeeId}) ·{' '}
                      <span className="text-teal-700">{p.role}</span>
                    </div>
                    <div className="text-slate-500 mt-0.5">
                      {p.departmentName} · {p.designation} ·{' '}
                      <span className="font-mono-tabular">
                        {directReports.length} Direct Report(s)
                      </span>
                    </div>
                  </div>

                  {p.role !== 'HR' && (
                    <button
                      type="button"
                      onClick={() =>
                        hrCreateOrUpdateEmployee({
                          uid: p.uid,
                          fullName: p.fullName,
                          email:
                            privateProfilesMap[p.uid]?.email ||
                            `${p.fullName.toLowerCase().replace(/\s+/g, '.')}@worknest.io`,
                          contactNumber:
                            privateProfilesMap[p.uid]?.contactNumber || '+1 (555) 200-1000',
                          employeeId: p.employeeId,
                          departmentId: p.departmentId,
                          designation: p.designation,
                          role: isMgr ? 'Employee' : 'Manager',
                          status: p.status,
                          managerUid: p.managerUid,
                          joiningDate: p.joiningDate,
                        })
                      }
                      className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                        isMgr
                          ? 'border border-red-200 text-red-700 hover:bg-red-50'
                          : 'bg-teal-700 text-white hover:bg-teal-800'
                      }`}
                    >
                      {isMgr ? 'Revoke Manager Role' : 'Authorize as Manager'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 4. HR WORK & TASK ASSIGNMENT VIEW (5.F - Connected with Employee Projects & Tasks)
// ============================================================================

export const HrWorkAndTasksView: React.FC = () => {
  const {
    projects,
    workTasks,
    profiles,
    departments,
    createOrUpdateProject,
    assignOrUpdateTask,
    deleteTask,
  } = useWorkNest();

  const [prjModal, setPrjModal] = useState(false);
  const [editPrjId, setEditPrjId] = useState<string | undefined>(undefined);
  const [prjName, setPrjName] = useState('');
  const [prjCode, setPrjCode] = useState('');
  const [prjDeptId, setPrjDeptId] = useState(departments[0]?.id || 'dept-eng');
  const [prjLeadUid, setPrjLeadUid] = useState('mgr-eng-01');
  const [prjDesc, setPrjDesc] = useState('');
  const [prjStartDate, setPrjStartDate] = useState(getTodayDateString());
  const [prjDeadline, setPrjDeadline] = useState(getTodayDateString());
  const [prjStatus, setPrjStatus] = useState<ProjectStatus>('Active');
  const [prjProgress, setPrjProgress] = useState(40);
  const [prjTeamUids, setPrjTeamUids] = useState<string[]>(['emp-eng-01', 'emp-eng-02']);

  const [taskModal, setTaskModal] = useState(false);
  const [editTaskId, setEditTaskId] = useState<string | undefined>(undefined);
  const [taskProjectId, setTaskProjectId] = useState(projects[0]?.id || 'proj-cloud-01');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAssigneeUid, setTaskAssigneeUid] = useState('emp-eng-01');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('High');
  const [taskDueDate, setTaskDueDate] = useState(getTodayDateString());
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('In Progress');
  const [taskProgress, setTaskProgress] = useState(25);
  const [taskNotes, setTaskNotes] = useState('');

  const [filterProject, setFilterProject] = useState('ALL');
  const [filterAssignee, setFilterAssignee] = useState('ALL');

  const openNewProject = () => {
    setEditPrjId(undefined);
    setPrjName('');
    setPrjCode(`PRJ-${projects.length + 101}`);
    setPrjDeptId(departments[0]?.id || 'dept-eng');
    setPrjLeadUid('mgr-eng-01');
    setPrjDesc('');
    setPrjStartDate(getTodayDateString());
    setPrjDeadline(getTodayDateString());
    setPrjStatus('Active');
    setPrjProgress(0);
    setPrjTeamUids(['emp-eng-01']);
    setPrjModal(true);
  };

  const openEditProject = (p: Project) => {
    setEditPrjId(p.id);
    setPrjName(p.name);
    setPrjCode(p.code);
    setPrjDeptId(p.departmentId);
    setPrjLeadUid(p.leadUid);
    setPrjDesc(p.description);
    setPrjStartDate(p.startDate);
    setPrjDeadline(p.deadline);
    setPrjStatus(p.status);
    setPrjProgress(p.progressPercent);
    setPrjTeamUids(p.teamMemberUids);
    setPrjModal(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    await createOrUpdateProject({
      id: editPrjId,
      name: prjName,
      code: prjCode,
      departmentId: prjDeptId,
      leadUid: prjLeadUid,
      description: prjDesc,
      startDate: prjStartDate,
      deadline: prjDeadline,
      status: prjStatus,
      progressPercent: prjProgress,
      teamMemberUids: prjTeamUids,
    });
    setPrjModal(false);
  };

  const openNewTask = () => {
    setEditTaskId(undefined);
    setTaskProjectId(projects[0]?.id || 'proj-cloud-01');
    setTaskTitle('');
    setTaskDesc('');
    setTaskAssigneeUid('emp-eng-01');
    setTaskPriority('High');
    setTaskDueDate(getTodayDateString());
    setTaskStatus('To Do');
    setTaskProgress(0);
    setTaskNotes('');
    setTaskModal(true);
  };

  const openEditTask = (t: WorkTask) => {
    setEditTaskId(t.id);
    setTaskProjectId(t.projectId);
    setTaskTitle(t.title);
    setTaskDesc(t.description);
    setTaskAssigneeUid(t.assigneeUid);
    setTaskPriority(t.priority);
    setTaskDueDate(t.dueDate);
    setTaskStatus(t.status);
    setTaskProgress(t.progressPercent);
    setTaskNotes(t.deliverableNotes);
    setTaskModal(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    await assignOrUpdateTask({
      id: editTaskId,
      projectId: taskProjectId,
      title: taskTitle,
      description: taskDesc,
      assigneeUid: taskAssigneeUid,
      priority: taskPriority,
      dueDate: taskDueDate,
      status: taskStatus,
      progressPercent: taskProgress,
      deliverableNotes: taskNotes,
    });
    setTaskModal(false);
  };

  const toggleTeamMember = (uid: string) => {
    setPrjTeamUids((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const filteredTasks = workTasks.filter((t) => {
    const matchPrj = filterProject === 'ALL' || t.projectId === filterProject;
    const matchEmp = filterAssignee === 'ALL' || t.assigneeUid === filterAssignee;
    return matchPrj && matchEmp;
  });

  return (
    <div className="space-y-8">
      {/* Projects Portfolio Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Project Portfolio & Work Assignment
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Create projects, assign employees to project teams, and allocate deliverable tasks
              with deadlines.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={openNewProject}
              className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Project</span>
            </button>
            <button
              type="button"
              onClick={openNewTask}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Assign New Task</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((p) => {
            const members = profiles.filter((prof) => p.teamMemberUids.includes(prof.uid));
            return (
              <div
                key={p.id}
                className="rounded-xl border border-slate-200 p-5 bg-slate-50/40 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-mono-tabular text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {p.code}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{p.name}</h3>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {p.departmentName} · Lead: <strong className="text-slate-700">{p.leadName}</strong>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => openEditProject(p)}
                      className="px-2.5 py-1 rounded bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 mt-2">{p.description}</p>
                </div>

                <div className="space-y-2.5 pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Status: <strong className="text-slate-800">{p.status}</strong> · Deadline:{' '}
                      <span className="font-mono-tabular font-semibold">{p.deadline}</span>
                    </span>
                    <span className="font-mono-tabular font-bold text-teal-700">
                      {p.progressPercent}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-600 rounded-full"
                      style={{ width: `${p.progressPercent}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {members.map((m) => (
                      <span
                        key={m.uid}
                        className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[11px] text-slate-700"
                      >
                        {m.fullName}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Assigned Work Tasks Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Assigned Employee Tasks & Deliverables ({filteredTasks.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Track progress and deliverable notes updated live by employees from their portal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
            >
              <option value="ALL">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
            >
              <option value="ALL">All Employees</option>
              {profiles.map((emp) => (
                <option key={emp.uid} value={emp.uid}>
                  {emp.fullName} ({emp.employeeId})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                <th className="py-2.5 pr-3">Task & Deliverable Notes</th>
                <th className="py-2.5 px-3">Project</th>
                <th className="py-2.5 px-3">Assigned Employee</th>
                <th className="py-2.5 px-3">Priority & Due</th>
                <th className="py-2.5 px-3">Completion</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 pl-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="py-3.5 pr-3 max-w-xs">
                    <div className="font-bold text-slate-900">{t.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{t.description}</div>
                    {t.deliverableNotes && (
                      <div className="text-[11px] text-teal-700 mt-1">
                        Employee Note: {t.deliverableNotes}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-3 font-medium text-slate-800">{t.projectName}</td>
                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-slate-900">{t.assigneeName}</div>
                    <div className="font-mono-tabular text-[11px] text-slate-500">
                      {t.assigneeId} · {t.departmentName}
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-slate-800">{t.priority}</div>
                    <div className="font-mono-tabular text-[11px] text-slate-500">
                      Due: {t.dueDate}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 font-mono-tabular font-bold text-teal-700">
                    {t.progressPercent}%
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-slate-800">{t.status}</td>
                  <td className="py-3.5 pl-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditTask(t)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteTask(t.id)}
                        className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                        title="Remove task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Project Modal */}
      {prjModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto text-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {editPrjId ? 'Edit Project' : 'Create New Project'}
            </h3>
            <form onSubmit={handleSaveProject} className="space-y-4 mt-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Project Name *</label>
                  <input
                    type="text"
                    required
                    value={prjName}
                    onChange={(e) => setPrjName(e.target.value)}
                    placeholder="e.g. Q4 Security Compliance"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Project Code *</label>
                  <input
                    type="text"
                    required
                    value={prjCode}
                    onChange={(e) => setPrjCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono-tabular uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={prjDeptId}
                    onChange={(e) => setPrjDeptId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Project Lead</label>
                  <select
                    value={prjLeadUid}
                    onChange={(e) => setPrjLeadUid(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {profiles.map((p) => (
                      <option key={p.uid} value={p.uid}>
                        {p.fullName} ({p.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={prjStartDate}
                    onChange={(e) => setPrjStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Deadline</label>
                  <input
                    type="date"
                    value={prjDeadline}
                    onChange={(e) => setPrjDeadline(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={prjStatus}
                    onChange={(e) => setPrjStatus(e.target.value as ProjectStatus)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Active">Active</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  value={prjDesc}
                  onChange={(e) => setPrjDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Assign Team Members
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2.5 border border-slate-200 rounded-lg bg-slate-50">
                  {profiles.map((emp) => (
                    <label key={emp.uid} className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prjTeamUids.includes(emp.uid)}
                        onChange={() => toggleTeamMember(emp.uid)}
                        className="rounded border-slate-300"
                      />
                      <span>
                        {emp.fullName} ({emp.employeeId})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPrjModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold cursor-pointer"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {taskModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 text-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {editTaskId ? 'Edit Assigned Task' : 'Assign New Employee Task'}
            </h3>
            <p className="text-slate-500 mb-4">
              The selected employee will immediately see this task on their Employee Dashboard and
              Projects & Tasks view.
            </p>
            <form onSubmit={handleSaveTask} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Project *</label>
                  <select
                    value={taskProjectId}
                    onChange={(e) => setTaskProjectId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Assign to Employee *
                  </label>
                  <select
                    value={taskAssigneeUid}
                    onChange={(e) => setTaskAssigneeUid(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {profiles.map((emp) => (
                      <option key={emp.uid} value={emp.uid}>
                        {emp.fullName} ({emp.employeeId} · {emp.departmentName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Implement SSO Session Timeout Handler"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Task Scope & Instructions *
                </label>
                <textarea
                  rows={3}
                  required
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={taskStatus}
                    onChange={(e) => setTaskStatus(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="In Review">In Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTaskModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold cursor-pointer"
                >
                  Save & Assign Task
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
// 5. HR PERFORMANCE REVIEWS MANAGEMENT (5.H - Connected with Employee Performance)
// ============================================================================

export const HrPerformanceReviewsView: React.FC = () => {
  const {
    performanceReviews,
    profiles,
    createOrUpdatePerformanceReview,
  } = useWorkNest();

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | undefined>(undefined);
  const [employeeUid, setEmployeeUid] = useState('emp-eng-01');
  const [reviewCycle, setReviewCycle] = useState('2026 Mid-Year Performance Evaluation');
  const [reviewDate, setReviewDate] = useState(getTodayDateString());
  const [technicalScore, setTechnicalScore] = useState(4.8);
  const [collaborationScore, setCollaborationScore] = useState(4.7);
  const [reliabilityScore, setReliabilityScore] = useState(4.9);
  const [keyStrengths, setKeyStrengths] = useState('');
  const [growthAreas, setGrowthAreas] = useState('');
  const [goalsNextPeriod, setGoalsNextPeriod] = useState('');
  const [status, setStatus] = useState<PerformanceReviewStatus>('Published');

  const openNewReview = () => {
    setEditId(undefined);
    setEmployeeUid('emp-eng-01');
    setReviewCycle('2026 Annual Performance Review');
    setReviewDate(getTodayDateString());
    setTechnicalScore(4.5);
    setCollaborationScore(4.5);
    setReliabilityScore(4.5);
    setKeyStrengths('');
    setGrowthAreas('');
    setGoalsNextPeriod('');
    setStatus('Published');
    setModalOpen(true);
  };

  const openEditReview = (rev: PerformanceReview) => {
    setEditId(rev.id);
    setEmployeeUid(rev.employeeUid);
    setReviewCycle(rev.reviewCycle);
    setReviewDate(rev.reviewDate);
    setTechnicalScore(rev.technicalScore);
    setCollaborationScore(rev.collaborationScore);
    setReliabilityScore(rev.reliabilityScore);
    setKeyStrengths(rev.keyStrengths);
    setGrowthAreas(rev.growthAreas);
    setGoalsNextPeriod(rev.goalsNextPeriod);
    setStatus(rev.status);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await createOrUpdatePerformanceReview({
      id: editId,
      employeeUid,
      reviewCycle,
      reviewDate,
      technicalScore,
      collaborationScore,
      reliabilityScore,
      keyStrengths,
      growthAreas,
      goalsNextPeriod,
      status,
    });
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Employee Performance Reviews & Evaluations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Publish structured performance evaluations, competency ratings, and next-period goals.
            Employees can view and acknowledge reviews from their portal.
          </p>
        </div>
        <button
          type="button"
          onClick={openNewReview}
          className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Performance Review</span>
        </button>
      </div>

      <div className="space-y-4">
        {performanceReviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 text-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-base font-bold text-slate-900">{rev.employeeName}</span>
                  <span className="font-mono-tabular text-slate-500">({rev.employeeId})</span>
                  <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 font-semibold">
                    {rev.status}
                  </span>
                </div>
                <div className="text-slate-500 mt-0.5">
                  {rev.departmentName} · {rev.designation} · Cycle:{' '}
                  <strong className="text-slate-700">{rev.reviewCycle}</strong> ({rev.reviewDate})
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">Overall Rating</div>
                  <div className="text-lg font-bold font-mono-tabular text-teal-700">
                    {rev.overallRating} / 5.0
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openEditReview(rev)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold cursor-pointer"
                >
                  Edit Review
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="font-semibold text-slate-800 mb-1">
                  Key Strengths (Tech: {rev.technicalScore}/5)
                </div>
                <p className="text-slate-600">{rev.keyStrengths}</p>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="font-semibold text-slate-800 mb-1">
                  Growth Areas (Collab: {rev.collaborationScore}/5)
                </div>
                <p className="text-slate-600">{rev.growthAreas}</p>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="font-semibold text-slate-800 mb-1">
                  Next-Period Goals (Rel: {rev.reliabilityScore}/5)
                </div>
                <p className="text-slate-600">{rev.goalsNextPeriod}</p>
              </div>
            </div>

            {rev.employeeSelfAssessment && (
              <div className="p-3.5 rounded-lg bg-teal-50/60 border border-teal-200">
                <span className="font-bold text-teal-900">Employee Self-Assessment Response: </span>
                <span className="text-teal-800">{rev.employeeSelfAssessment}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto text-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {editId ? 'Edit Performance Evaluation' : 'New Performance Evaluation'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Employee *</label>
                  <select
                    value={employeeUid}
                    onChange={(e) => setEmployeeUid(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {profiles.map((emp) => (
                      <option key={emp.uid} value={emp.uid}>
                        {emp.fullName} ({emp.employeeId} · {emp.departmentName})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Review Cycle *</label>
                  <input
                    type="text"
                    required
                    value={reviewCycle}
                    onChange={(e) => setReviewCycle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Technical Score (1–5)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min={1}
                    max={5}
                    required
                    value={technicalScore}
                    onChange={(e) => setTechnicalScore(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Collaboration (1–5)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min={1}
                    max={5}
                    required
                    value={collaborationScore}
                    onChange={(e) => setCollaborationScore(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Reliability (1–5)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min={1}
                    max={5}
                    required
                    value={reliabilityScore}
                    onChange={(e) => setReliabilityScore(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono-tabular"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Key Strengths *</label>
                <textarea
                  rows={2}
                  required
                  value={keyStrengths}
                  onChange={(e) => setKeyStrengths(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Areas for Growth *
                </label>
                <textarea
                  rows={2}
                  required
                  value={growthAreas}
                  onChange={(e) => setGrowthAreas(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Goals for Next Period *
                </label>
                <textarea
                  rows={2}
                  required
                  value={goalsNextPeriod}
                  onChange={(e) => setGoalsNextPeriod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Review Date</label>
                  <input
                    type="date"
                    value={reviewDate}
                    onChange={(e) => setReviewDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as PerformanceReviewStatus)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published (Visible to Employee)</option>
                    <option value="Acknowledged">Acknowledged</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold cursor-pointer"
                >
                  Save & Publish Review
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
// 6. COMPANY SETTINGS, LEAVE POLICIES & HOLIDAYS
// ============================================================================

export const HrCompanySettingsView: React.FC = () => {
  const {
    companySettings,
    leaveTypes,
    holidays,
    updateCompanySettings,
    saveLeaveType,
    saveHoliday,
    deleteHoliday,
  } = useWorkNest();

  const [companyName, setCompanyName] = useState(
    companySettings?.companyName || 'WorkNest Enterprise Inc.'
  );
  const [tagline, setTagline] = useState(
    companySettings?.tagline || 'Your Workplace, Connected.'
  );
  const [timezone, setTimezone] = useState(
    companySettings?.timezone || 'UTC-05:00 (Eastern Time)'
  );
  const [workingDaysCsv, setWorkingDaysCsv] = useState(
    companySettings?.workingDaysCsv || 'Mon,Tue,Wed,Thu,Fri'
  );
  const [workStartTime, setWorkStartTime] = useState(companySettings?.workStartTime || '09:00');
  const [workEndTime, setWorkEndTime] = useState(companySettings?.workEndTime || '18:00');
  const [lateGraceMinutes, setLateGraceMinutes] = useState(
    companySettings?.lateGraceMinutes ?? 15
  );
  const [requireHrSecond, setRequireHrSecond] = useState(
    companySettings?.requireHrSecondApprovalForLongLeave ?? true
  );
  const [longLeaveThreshold, setLongLeaveThreshold] = useState(
    companySettings?.longLeaveThresholdDays ?? 5
  );
  const [autoApproveReg, setAutoApproveReg] = useState(
    companySettings?.autoApproveEmployeeRegistration ?? true
  );

  // Holiday form
  const [holName, setHolName] = useState('');
  const [holDate, setHolDate] = useState(getTodayDateString());
  const [holType] = useState<'Public Holiday' | 'Company Holiday' | 'Optional Holiday'>(
    'Public Holiday'
  );

  // Leave Type form
  const [ltName, setLtName] = useState('');
  const [ltCode, setLtCode] = useState('');
  const [ltQuota] = useState(12);
  const [ltPaid] = useState(true);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateCompanySettings({
      companyName,
      tagline,
      timezone,
      workingDaysCsv,
      workStartTime,
      workEndTime,
      lateGraceMinutes,
      requireHrSecondApprovalForLongLeave: requireHrSecond,
      longLeaveThresholdDays: longLeaveThreshold,
      autoApproveEmployeeRegistration: autoApproveReg,
    });
  };

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holName.trim()) return;
    await saveHoliday({
      name: holName.trim(),
      date: holDate,
      type: holType,
      description: `${holType} configured by HR`,
    });
    setHolName('');
  };

  const handleAddLeaveType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ltName.trim() || !ltCode.trim()) return;
    await saveLeaveType({
      name: ltName.trim(),
      code: ltCode.trim().toUpperCase(),
      annualQuotaDays: ltQuota,
      description: `${ltName.trim()} policy (${ltQuota} days/year)`,
      isPaid: ltPaid,
      requiresHrApproval: false,
      status: 'Active',
    });
    setLtName('');
    setLtCode('');
  };

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSaveSettings}
        className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 text-xs"
      >
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-teal-700" />
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              Company Settings, Working Hours & Approval Rules
            </h1>
            <p className="text-slate-500">
              Configure working days, office hours, late arrival grace periods, and leave approval
              thresholds.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Portal Tagline</label>
            <input
              type="text"
              required
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Timezone</label>
            <input
              type="text"
              required
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Working Days (CSV)</label>
            <input
              type="text"
              required
              value={workingDaysCsv}
              onChange={(e) => setWorkingDaysCsv(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono-tabular"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Office Start Time</label>
            <input
              type="time"
              required
              value={workStartTime}
              onChange={(e) => setWorkStartTime(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono-tabular"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Office End Time</label>
            <input
              type="time"
              required
              value={workEndTime}
              onChange={(e) => setWorkEndTime(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono-tabular"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Late Grace Period (Mins)
            </label>
            <input
              type="number"
              min={0}
              max={120}
              required
              value={lateGraceMinutes}
              onChange={(e) => setLateGraceMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono-tabular"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <label className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={requireHrSecond}
              onChange={(e) => setRequireHrSecond(e.target.checked)}
              className="rounded border-slate-300 text-slate-900"
            />
            <span>Require 2nd-Stage HR Approval for Extended Leaves</span>
          </label>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
            <span>Extended Leave Threshold (Days):</span>
            <input
              type="number"
              min={1}
              max={60}
              value={longLeaveThreshold}
              onChange={(e) => setLongLeaveThreshold(Number(e.target.value))}
              className="w-16 px-2 py-1 border border-slate-300 rounded bg-white font-mono-tabular"
            />
          </div>

          <label className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={autoApproveReg}
              onChange={(e) => setAutoApproveReg(e.target.checked)}
              className="rounded border-slate-300 text-slate-900"
            />
            <span>Auto-Activate New Employee Registrations</span>
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
          >
            Save Company Configuration
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900">Leave Types & Quotas</h2>
          <form onSubmit={handleAddLeaveType} className="grid grid-cols-4 gap-2">
            <input
              type="text"
              required
              value={ltName}
              onChange={(e) => setLtName(e.target.value)}
              placeholder="Leave Name"
              className="col-span-2 px-3 py-1.5 border border-slate-300 rounded-lg"
            />
            <input
              type="text"
              required
              value={ltCode}
              onChange={(e) => setLtCode(e.target.value)}
              placeholder="CODE"
              className="px-3 py-1.5 border border-slate-300 rounded-lg font-mono-tabular uppercase"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-teal-700 text-white font-semibold cursor-pointer"
            >
              + Add
            </button>
          </form>

          <div className="divide-y divide-slate-100">
            {leaveTypes.map((lt) => (
              <div key={lt.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900">{lt.name}</span> (
                  <span className="font-mono-tabular">{lt.code}</span>)
                </div>
                <div className="font-mono-tabular text-slate-600">
                  {lt.annualQuotaDays} days/yr · {lt.isPaid ? 'Paid' : 'Unpaid'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900">Official Company Holidays</h2>
          <form onSubmit={handleAddHoliday} className="grid grid-cols-4 gap-2">
            <input
              type="text"
              required
              value={holName}
              onChange={(e) => setHolName(e.target.value)}
              placeholder="Holiday Name"
              className="col-span-2 px-3 py-1.5 border border-slate-300 rounded-lg"
            />
            <input
              type="date"
              required
              value={holDate}
              onChange={(e) => setHolDate(e.target.value)}
              className="px-2 py-1.5 border border-slate-300 rounded-lg font-mono-tabular"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-semibold cursor-pointer"
            >
              + Add
            </button>
          </form>

          <div className="divide-y divide-slate-100">
            {holidays.map((h) => (
              <div key={h.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900">{h.name}</span> ·{' '}
                  <span className="text-slate-500">{h.type}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono-tabular font-semibold text-teal-700">{h.date}</span>
                  <button
                    type="button"
                    onClick={() => deleteHoliday(h.id)}
                    className="text-slate-400 hover:text-red-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 7. USER & ROLE PERMISSIONS + IMMUTABLE AUDIT HISTORY
// ============================================================================

export const HrRolesAndAuditView: React.FC<{ section: 'roles' | 'audit' }> = ({ section }) => {
  const {
    profiles,
    privateProfilesMap,
    auditLogs,
    hrCreateOrUpdateEmployee,
  } = useWorkNest();

  const [categoryFilter, setCategoryFilter] = useState('ALL');

  if (section === 'roles') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-teal-700" />
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Role-Based Access Control (RBAC) Matrix
            </h1>
            <p className="text-xs text-slate-500">
              Manage Employee, Manager, and HR Administrator privileges enforced by database
              security rules.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                <th className="py-2.5 pr-3">Employee ID</th>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Current Role</th>
                <th className="py-2.5 pl-3 text-right">Change Authorized Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {profiles.map((p) => (
                <tr key={p.uid} className="hover:bg-slate-50">
                  <td className="py-3 pr-3 font-mono-tabular font-semibold">{p.employeeId}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{p.fullName}</td>
                  <td className="py-3 px-3 text-slate-600">{p.departmentName}</td>
                  <td className="py-3 px-3 font-semibold text-teal-700">{p.role}</td>
                  <td className="py-3 pl-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      {(['Employee', 'Manager', 'HR'] as UserRole[]).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() =>
                            hrCreateOrUpdateEmployee({
                              uid: p.uid,
                              fullName: p.fullName,
                              email:
                                privateProfilesMap[p.uid]?.email ||
                                `${p.fullName.toLowerCase().replace(/\s+/g, '.')}@worknest.io`,
                              contactNumber:
                                privateProfilesMap[p.uid]?.contactNumber || '+1 (555) 200-1000',
                              employeeId: p.employeeId,
                              departmentId: p.departmentId,
                              designation: p.designation,
                              role: r,
                              status: p.status,
                              managerUid: p.managerUid,
                              joiningDate: p.joiningDate,
                            })
                          }
                          className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer ${
                            p.role === r
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const filteredLogs = auditLogs.filter(
    (l) => categoryFilter === 'ALL' || l.category === categoryFilter
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-teal-700" />
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Immutable Security & Operational Audit History
            </h1>
            <p className="text-xs text-slate-500">
              Tamper-evident log of sensitive actions, attendance corrections, leave approvals, work
              assignments, and performance reviews.
            </p>
          </div>
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
        >
          <option value="ALL">All Audit Categories</option>
          <option value="Employee">Employee</option>
          <option value="Department">Department</option>
          <option value="Manager">Manager</option>
          <option value="Attendance">Attendance</option>
          <option value="Leave">Leave</option>
          <option value="Project">Project & Tasks</option>
          <option value="Performance">Performance Reviews</option>
          <option value="Request">Request</option>
          <option value="Settings">Settings</option>
        </select>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-500">
          No audit records match the selected category.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                <th className="py-2.5 pr-3">Log ID</th>
                <th className="py-2.5 px-3">Actor & Role</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 pl-3">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-3 pr-3 font-mono-tabular text-slate-500">{log.id}</td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-900">{log.actorName}</span> ·{' '}
                    <span className="text-slate-500">{log.actorRole}</span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-teal-700">{log.category}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{log.action}</td>
                  <td className="py-3 pl-3 text-slate-600">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
