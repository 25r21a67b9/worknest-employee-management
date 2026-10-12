import React, { useState } from 'react';
import {
  Users,
  CheckSquare,
  FileText,
  Clock,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  Activity,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useWorkNest, getTodayDateString } from '../context/WorkNestContext';
import {
  Profile,
  LeaveRequest,
  WorkplaceRequest,
  WorkplaceRequestStatus,
} from '../types/worknest';

// ============================================================================
// 1. MANAGER DASHBOARD
// ============================================================================

export const ManagerDashboardView: React.FC = () => {
  const {
    activeProfile,
    profiles,
    attendanceRecords,
    leaveRequests,
    workplaceRequests,
    auditLogs,
    setCurrentRoute,
  } = useWorkNest();

  if (!activeProfile) return null;

  const today = getTodayDateString();
  const myTeam = profiles.filter(
    (p) => p.managerUid === activeProfile.uid && p.uid !== activeProfile.uid
  );
  const teamUids = new Set(myTeam.map((p) => p.uid));

  const todayTeamAttendance = attendanceRecords.filter(
    (r) => teamUids.has(r.employeeUid) && r.date === today
  );

  const presentCount = todayTeamAttendance.filter(
    (r) => r.status === 'Present' || r.status === 'Late'
  ).length;
  const onLeaveCount = myTeam.filter((p) => p.status === 'On Leave').length;
  const absentCount = Math.max(0, myTeam.length - presentCount - onLeaveCount);

  const teamLeaveRequests = leaveRequests.filter((r) => r.managerUid === activeProfile.uid);
  const pendingLeaves = teamLeaveRequests.filter((r) => r.status === 'Pending');
  const upcomingLeaves = teamLeaveRequests.filter(
    (r) => r.status === 'Approved' && r.endDate >= today
  );

  const teamWpRequests = workplaceRequests.filter((r) => r.managerUid === activeProfile.uid);
  const pendingWpRequests = teamWpRequests.filter(
    (r) => r.status === 'Submitted' || r.status === 'Under Review'
  );

  const teamChartData = myTeam.map((member) => {
    const memberAtt = attendanceRecords.filter((r) => r.employeeUid === member.uid);
    const presentDays = memberAtt.filter((r) => r.status === 'Present').length;
    const lateDays = memberAtt.filter((r) => r.status === 'Late').length;
    return {
      name: member.fullName.split(' ')[0],
      Present: presentDays,
      Late: lateDays,
    };
  });

  const recentTeamActivity = auditLogs
    .filter((l) => teamUids.has(l.actorUid) || l.actorUid === activeProfile.uid)
    .slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Manager Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            Manager Overview · {activeProfile.departmentName}
          </h1>
          <div className="text-xs text-slate-500">
            <span>Supervisor: {activeProfile.fullName}</span>
            <span className="mx-2">·</span>
            <span className="font-mono-tabular">{myTeam.length} Direct Reports</span>
            <span className="mx-2">·</span>
            <span>Date: {today}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setCurrentRoute('mgr-leave-approvals')}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 cursor-pointer"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Review Leave Approvals ({pendingLeaves.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentRoute('mgr-request-approvals')}
            className="px-4 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Workplace Requests ({pendingWpRequests.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentRoute('mgr-team')}
            className="px-4 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center gap-1.5 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>My Team Directory</span>
          </button>
        </div>
      </div>

      {/* 6 KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-slate-500">Team Members</div>
          <div className="text-2xl font-bold text-slate-900 font-mono-tabular mt-1">
            {myTeam.length}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-slate-500">Present Today</div>
          <div className="text-2xl font-bold text-teal-700 font-mono-tabular mt-1">
            {presentCount}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-slate-500">Absent / Not In</div>
          <div className="text-2xl font-bold text-amber-700 font-mono-tabular mt-1">
            {absentCount}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-slate-500">On Leave</div>
          <div className="text-2xl font-bold text-slate-900 font-mono-tabular mt-1">
            {onLeaveCount}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-slate-500">Pending Leaves</div>
          <div className="text-2xl font-bold text-teal-700 font-mono-tabular mt-1">
            {pendingLeaves.length}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-slate-500">Pending Requests</div>
          <div className="text-2xl font-bold text-slate-900 font-mono-tabular mt-1">
            {pendingWpRequests.length}
          </div>
        </div>
      </div>

      {/* Middle Row: Team Attendance Chart & Actionable Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Team Attendance Distribution</h2>
              <p className="text-xs text-slate-500">On-time vs. late check-ins across team</p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentRoute('mgr-attendance')}
              className="text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
            >
              View Log
            </button>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamChartData} barSize={26}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 12, fill: '#475569' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="Present" fill="#0D9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Late" fill="#D97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Awaiting Your Review ({pendingLeaves.length + pendingWpRequests.length})
              </h2>
              <p className="text-xs text-slate-500">
                Direct report leave applications and workplace requests
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentRoute('mgr-leave-approvals')}
              className="text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
            >
              Open Approval Center
            </button>
          </div>

          {pendingLeaves.length === 0 && pendingWpRequests.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">
              All team leave applications and workplace requests have been processed.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {pendingLeaves.slice(0, 3).map((lr) => (
                <div
                  key={lr.id}
                  className="py-3 flex items-center justify-between gap-4 first:pt-0"
                >
                  <div>
                    <div className="font-semibold text-slate-900">
                      {lr.employeeName} · {lr.leaveTypeName} ({lr.totalDays}d)
                    </div>
                    <div className="text-slate-500 mt-0.5">
                      <span className="font-mono-tabular">
                        {lr.startDate} → {lr.endDate}
                      </span>{' '}
                      · {lr.reason}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentRoute('mgr-leave-approvals')}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 shrink-0 cursor-pointer"
                  >
                    Review
                  </button>
                </div>
              ))}
              {pendingWpRequests.slice(0, 3).map((wr) => (
                <div
                  key={wr.id}
                  className="py-3 flex items-center justify-between gap-4 last:pb-0"
                >
                  <div>
                    <div className="font-semibold text-slate-900">
                      {wr.employeeName} · {wr.category}
                    </div>
                    <div className="text-slate-500 mt-0.5">
                      {wr.title} · Target: <span className="font-mono-tabular">{wr.targetDate}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentRoute('mgr-request-approvals')}
                    className="px-3 py-1.5 rounded-lg bg-teal-700 text-white font-semibold hover:bg-teal-800 shrink-0 cursor-pointer"
                  >
                    Review
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Upcoming Team Leave & Recent Team Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4">Upcoming Approved Team Leave</h2>
          {upcomingLeaves.length === 0 ? (
            <div className="text-xs text-slate-500 py-6">
              No upcoming approved leaves scheduled for your team.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {upcomingLeaves.map((lr) => (
                <div key={lr.id} className="py-3 first:pt-0 last:pb-0 flex justify-between gap-4">
                  <div>
                    <div className="font-semibold text-slate-900">{lr.employeeName}</div>
                    <div className="text-slate-500">{lr.leaveTypeName}</div>
                  </div>
                  <div className="text-right font-mono-tabular text-teal-700 font-semibold">
                    {lr.startDate} → {lr.endDate} ({lr.totalDays}d)
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4">Recent Team Activity</h2>
          {recentTeamActivity.length === 0 ? (
            <div className="text-xs text-slate-500 py-6">No recent team activity logged.</div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {recentTeamActivity.map((act) => (
                <div key={act.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start gap-2.5">
                  <Activity className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900">{act.action}:</span>{' '}
                    <span className="text-slate-600">{act.details}</span>
                  </div>
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
// 2. MY TEAM DIRECTORY & AUTHORIZED EMPLOYEE DETAIL MODAL
// ============================================================================

export const ManagerTeamView: React.FC = () => {
  const {
    activeProfile,
    profiles,
    privateProfilesMap,
    attendanceRecords,
    leaveBalances,
    leaveRequests,
  } = useWorkNest();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null);

  if (!activeProfile) return null;

  const today = getTodayDateString();
  const myTeam = profiles.filter(
    (p) => p.managerUid === activeProfile.uid && p.uid !== activeProfile.uid
  );

  const filteredTeam = myTeam.filter((member) => {
    const matchesStatus = statusFilter === 'ALL' || member.status === statusFilter;
    const matchesSearch = searchQuery.trim()
      ? member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.designation.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              My Assigned Team ({filteredTeam.length})
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Authorized direct reports supervised by {activeProfile.fullName}. Click any team
              member to inspect their authorized profile, attendance, and leave summary.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="ALL">All Employment Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Pending Approval">Pending Approval</option>
            </select>

            <div className="relative w-60">
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
        </div>

        {filteredTeam.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No assigned employees match your current filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <th className="py-2.5 pr-3">Employee ID</th>
                  <th className="py-2.5 px-3">Employee Name</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Designation</th>
                  <th className="py-2.5 px-3">Corporate Email</th>
                  <th className="py-2.5 px-3">Today&apos;s Attendance</th>
                  <th className="py-2.5 px-3">Employment Status</th>
                  <th className="py-2.5 pl-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredTeam.map((member) => {
                  const todayAtt = attendanceRecords.find(
                    (r) => r.employeeUid === member.uid && r.date === today
                  );
                  const emailStr =
                    privateProfilesMap[member.uid]?.email ||
                    `${member.fullName.toLowerCase().replace(/\s+/g, '.')}@worknest.io`;
                  return (
                    <tr
                      key={member.uid}
                      onClick={() => setSelectedMember(member)}
                      className="hover:bg-slate-50 cursor-pointer"
                    >
                      <td className="py-3 pr-3 font-mono-tabular font-semibold text-slate-800">
                        {member.employeeId}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {member.fullName}
                      </td>
                      <td className="py-3 px-3 text-slate-600">{member.departmentName}</td>
                      <td className="py-3 px-3 text-slate-600">{member.designation}</td>
                      <td className="py-3 px-3 text-slate-600">{emailStr}</td>
                      <td className="py-3 px-3 font-semibold">
                        <span
                          className={
                            todayAtt?.status === 'Present'
                              ? 'text-teal-700'
                              : todayAtt?.status === 'Late'
                              ? 'text-amber-700'
                              : 'text-slate-500'
                          }
                        >
                          {todayAtt ? `${todayAtt.status} (${todayAtt.checkInTime})` : 'Not Checked In'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{member.status}</td>
                      <td className="py-3 pl-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMember(member);
                          }}
                          className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Authorized Employee Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-teal-400 font-bold text-sm flex items-center justify-center">
                  {selectedMember.avatarInitials}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedMember.fullName}</h3>
                  <div className="text-xs text-slate-500">
                    <span className="font-mono-tabular font-semibold text-slate-700">
                      {selectedMember.employeeId}
                    </span>{' '}
                    · {selectedMember.designation} · {selectedMember.departmentName}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="p-1 text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const bal = leaveBalances.find((b) => b.employeeUid === selectedMember.uid);
              const att = attendanceRecords
                .filter((r) => r.employeeUid === selectedMember.uid)
                .slice(0, 5);
              const leaves = leaveRequests
                .filter((r) => r.employeeUid === selectedMember.uid)
                .slice(0, 4);

              return (
                <div className="space-y-5 pt-4 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="text-slate-500">Joining Date</div>
                      <div className="font-mono-tabular font-semibold text-slate-900 mt-0.5">
                        {selectedMember.joiningDate}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="text-slate-500">Casual Balance</div>
                      <div className="font-mono-tabular font-semibold text-teal-700 mt-0.5">
                        {bal ? bal.casualTotal - bal.casualUsed : 12}d left
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="text-slate-500">Sick Balance</div>
                      <div className="font-mono-tabular font-semibold text-teal-700 mt-0.5">
                        {bal ? bal.sickTotal - bal.sickUsed : 10}d left
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="text-slate-500">Earned Balance</div>
                      <div className="font-mono-tabular font-semibold text-teal-700 mt-0.5">
                        {bal ? bal.earnedTotal - bal.earnedUsed : 15}d left
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 mb-2">Recent Attendance Logs</h4>
                    {att.length === 0 ? (
                      <div className="text-slate-500">No attendance logs recorded.</div>
                    ) : (
                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg px-3">
                        {att.map((a) => (
                          <div key={a.id} className="py-2 flex justify-between">
                            <span className="font-mono-tabular">{a.date}</span>
                            <span className="font-mono-tabular">
                              In: {a.checkInTime} · Out: {a.checkOutTime || 'Active'}
                            </span>
                            <span className="font-semibold text-teal-700">{a.status}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 mb-2">Leave Application History</h4>
                    {leaves.length === 0 ? (
                      <div className="text-slate-500">No leave requests submitted.</div>
                    ) : (
                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg px-3">
                        {leaves.map((l) => (
                          <div key={l.id} className="py-2 flex justify-between">
                            <span>
                              {l.leaveTypeName} ({l.totalDays}d)
                            </span>
                            <span className="font-mono-tabular">
                              {l.startDate} → {l.endDate}
                            </span>
                            <span className="font-semibold">{l.status}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 3. UNIFIED MANAGER APPROVAL CENTER (6 REQUIRED TABS)
// ============================================================================

type ApprovalTab =
  | 'LEAVE'
  | 'WFH'
  | 'PERMISSION'
  | 'SHIFT'
  | 'ATTENDANCE_CORRECTION'
  | 'OTHER';

export const ManagerApprovalCenterView: React.FC<{
  initialSection: 'leave' | 'requests';
}> = ({ initialSection }) => {
  const {
    activeProfile,
    leaveRequests,
    workplaceRequests,
    reviewLeaveRequest,
    reviewWorkplaceRequest,
  } = useWorkNest();

  const [activeTab, setActiveTab] = useState<ApprovalTab>(
    initialSection === 'leave' ? 'LEAVE' : 'WFH'
  );
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [selectedWp, setSelectedWp] = useState<WorkplaceRequest | null>(null);
  const [remarks, setRemarks] = useState('');
  const [processing, setProcessing] = useState(false);

  React.useEffect(() => {
    setActiveTab(initialSection === 'leave' ? 'LEAVE' : 'WFH');
  }, [initialSection]);

  if (!activeProfile) return null;

  const isHr = activeProfile.role === 'HR';

  const scopedLeaves = leaveRequests.filter((lr) =>
    isHr ? true : lr.managerUid === activeProfile.uid
  );

  const scopedWp = workplaceRequests.filter((wr) =>
    isHr ? true : wr.managerUid === activeProfile.uid
  );

  const filteredWpByTab = scopedWp.filter((wr) => {
    if (activeTab === 'WFH') return wr.category === 'Work From Home';
    if (activeTab === 'PERMISSION') return wr.category === 'Permission / Short Leave';
    if (activeTab === 'SHIFT') return wr.category === 'Shift Change';
    if (activeTab === 'ATTENDANCE_CORRECTION') return wr.category === 'Attendance Correction';
    if (activeTab === 'OTHER') {
      return (
        wr.category === 'Equipment Request' ||
        wr.category === 'IT Support' ||
        wr.category === 'HR Support' ||
        wr.category === 'Other Workplace Requests'
      );
    }
    return true;
  });

  const handleLeaveDecision = async (decision: 'Approved' | 'Rejected') => {
    if (!selectedLeave) return;
    setProcessing(true);
    try {
      await reviewLeaveRequest(
        selectedLeave.id,
        decision,
        remarks.trim() || `${decision} by ${activeProfile.fullName}`
      );
      setSelectedLeave(null);
      setRemarks('');
    } finally {
      setProcessing(false);
    }
  };

  const handleWpDecision = async (decision: WorkplaceRequestStatus) => {
    if (!selectedWp) return;
    setProcessing(true);
    try {
      await reviewWorkplaceRequest(
        selectedWp.id,
        decision,
        remarks.trim() || `${decision} by ${activeProfile.fullName}`
      );
      setSelectedWp(null);
      setRemarks('');
    } finally {
      setProcessing(false);
    }
  };

  const tabs: { id: ApprovalTab; label: string; count: number }[] = [
    {
      id: 'LEAVE',
      label: 'Leave Applications',
      count: scopedLeaves.filter((l) => l.status === 'Pending' || l.status === 'Pending HR Approval').length,
    },
    {
      id: 'WFH',
      label: 'Work From Home',
      count: scopedWp.filter(
        (w) => w.category === 'Work From Home' && (w.status === 'Submitted' || w.status === 'Under Review')
      ).length,
    },
    {
      id: 'PERMISSION',
      label: 'Permission Requests',
      count: scopedWp.filter(
        (w) =>
          w.category === 'Permission / Short Leave' &&
          (w.status === 'Submitted' || w.status === 'Under Review')
      ).length,
    },
    {
      id: 'SHIFT',
      label: 'Shift Change',
      count: scopedWp.filter(
        (w) => w.category === 'Shift Change' && (w.status === 'Submitted' || w.status === 'Under Review')
      ).length,
    },
    {
      id: 'ATTENDANCE_CORRECTION',
      label: 'Attendance Correction',
      count: scopedWp.filter(
        (w) =>
          w.category === 'Attendance Correction' &&
          (w.status === 'Submitted' || w.status === 'Under Review')
      ).length,
    },
    {
      id: 'OTHER',
      label: 'Other Requests',
      count: scopedWp.filter(
        (w) =>
          ['Equipment Request', 'IT Support', 'HR Support', 'Other Workplace Requests'].includes(
            w.category
          ) &&
          (w.status === 'Submitted' || w.status === 'Under Review')
      ).length,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h1 className="text-xl font-bold text-slate-900 mb-1">
          Unified Approval & Decision Center
        </h1>
        <p className="text-xs text-slate-500 mb-5">
          Review employee applications, record remarks, and authorize or decline requests. Self-approval
          is strictly blocked by database security rules.
        </p>

        {/* 6 Interactive Segmented Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl mb-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === t.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{t.label}</span>
              <span className="ml-1.5 font-mono-tabular text-teal-700">({t.count})</span>
            </button>
          ))}
        </div>

        {/* TAB 1: LEAVE APPLICATIONS */}
        {activeTab === 'LEAVE' ? (
          scopedLeaves.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No leave applications assigned to your approval queue.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                    <th className="py-2.5 pr-3">Request ID</th>
                    <th className="py-2.5 px-3">Employee</th>
                    <th className="py-2.5 px-3">Leave Type & Dates</th>
                    <th className="py-2.5 px-3">Reason</th>
                    <th className="py-2.5 px-3">Status & Decision</th>
                    <th className="py-2.5 pl-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {scopedLeaves.map((lr) => {
                    const canReview =
                      (lr.status === 'Pending' || (isHr && lr.status === 'Pending HR Approval')) &&
                      (lr.employeeUid !== activeProfile.uid || isHr);
                    return (
                      <tr key={lr.id} className="hover:bg-slate-50">
                        <td className="py-3 pr-3 font-mono-tabular font-semibold text-slate-700">
                          {lr.id}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900">{lr.employeeName}</div>
                          <div className="text-[11px] text-slate-500">
                            {lr.employeeId} · {lr.departmentName}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900">
                            {lr.leaveTypeName} ({lr.totalDays}d)
                          </div>
                          <div className="text-[11px] font-mono-tabular text-slate-500">
                            {lr.startDate} → {lr.endDate}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600 max-w-xs">{lr.reason}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`font-semibold ${
                              lr.status === 'Approved'
                                ? 'text-teal-700'
                                : lr.status === 'Rejected'
                                ? 'text-red-600'
                                : 'text-amber-700'
                            }`}
                          >
                            {lr.status}
                          </span>
                          {lr.reviewerName && (
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              By {lr.reviewerName} ({lr.reviewedAt})
                            </div>
                          )}
                        </td>
                        <td className="py-3 pl-3 text-right">
                          {canReview ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedLeave(lr);
                                setRemarks(lr.reviewerRemarks || '');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 cursor-pointer"
                            >
                              Review & Decide
                            </button>
                          ) : (
                            <span className="text-slate-400">Processed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : /* TABS 2-6: WORKPLACE REQUESTS */ filteredWpByTab.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No workplace requests found in this category.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <th className="py-2.5 pr-3">Request ID</th>
                  <th className="py-2.5 px-3">Employee</th>
                  <th className="py-2.5 px-3">Category & Title</th>
                  <th className="py-2.5 px-3">Target Date & Priority</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 pl-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredWpByTab.map((wr) => {
                  const canReview =
                    (wr.status === 'Submitted' || wr.status === 'Under Review') &&
                    (wr.employeeUid !== activeProfile.uid || isHr);
                  return (
                    <tr key={wr.id} className="hover:bg-slate-50">
                      <td className="py-3 pr-3 font-mono-tabular font-semibold text-slate-700">
                        {wr.id}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{wr.employeeName}</div>
                        <div className="text-[11px] text-slate-500">
                          {wr.employeeId} · {wr.departmentName}
                        </div>
                      </td>
                      <td className="py-3 px-3 max-w-xs">
                        <div className="font-semibold text-slate-900">{wr.title}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-2">
                          {wr.description}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-mono-tabular text-slate-800">{wr.targetDate}</div>
                        <div className="text-[11px] text-slate-500">Priority: {wr.priority}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-semibold ${
                            wr.status === 'Approved' || wr.status === 'Resolved'
                              ? 'text-teal-700'
                              : wr.status === 'Rejected'
                              ? 'text-red-600'
                              : 'text-amber-700'
                          }`}
                        >
                          {wr.status}
                        </span>
                        {wr.reviewerName && (
                          <div className="text-[11px] text-slate-500">By {wr.reviewerName}</div>
                        )}
                      </td>
                      <td className="py-3 pl-3 text-right">
                        {canReview ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedWp(wr);
                              setRemarks(wr.remarks || '');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 cursor-pointer"
                          >
                            Review Request
                          </button>
                        ) : (
                          <span className="text-slate-400">Closed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Leave Review Modal */}
      {selectedLeave && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Review Leave Application · {selectedLeave.id}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {selectedLeave.employeeName} ({selectedLeave.employeeId} ·{' '}
              {selectedLeave.departmentName})
            </p>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5 mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Leave Type:</span>
                <span className="font-semibold text-slate-900">{selectedLeave.leaveTypeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dates & Duration:</span>
                <span className="font-mono-tabular font-semibold text-teal-700">
                  {selectedLeave.startDate} → {selectedLeave.endDate} ({selectedLeave.totalDays}{' '}
                  days)
                </span>
              </div>
              <div className="pt-1 border-t border-slate-200">
                <span className="text-slate-500 block mb-0.5">Employee Reason:</span>
                <span className="text-slate-800">{selectedLeave.reason}</span>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Reviewer Remarks & Handover Instructions *
              </label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter approval remarks or reason for rejection..."
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSelectedLeave(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => handleLeaveDecision('Rejected')}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => handleLeaveDecision('Approved')}
                  className="px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve Leave</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workplace Request Review Modal */}
      {selectedWp && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Review {selectedWp.category} · {selectedWp.id}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {selectedWp.employeeName} ({selectedWp.employeeId} · {selectedWp.departmentName})
            </p>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5 mb-4">
              <div className="font-semibold text-slate-900">{selectedWp.title}</div>
              <div className="text-slate-600">{selectedWp.description}</div>
              <div className="text-[11px] text-slate-500 pt-1">
                Effective Date: <span className="font-mono-tabular">{selectedWp.targetDate}</span> ·
                Priority: {selectedWp.priority}
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Reviewer Resolution Remarks *
              </label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add decision notes or resolution steps..."
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSelectedWp(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => handleWpDecision('Rejected')}
                  className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer"
                >
                  Reject
                </button>
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => handleWpDecision('Resolved')}
                  className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
                >
                  Mark Resolved
                </button>
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => handleWpDecision('Approved')}
                  className="px-3.5 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold cursor-pointer"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
