import React, { useState } from 'react';
import {
  Clock,
  LogIn,
  LogOut,
  CalendarPlus,
  XCircle,
  Plus,
  Search,
  Edit3,
  CheckCircle2,
} from 'lucide-react';
import {
  useWorkNest,
  getTodayDateString,
} from '../context/WorkNestContext';
import {
  AttendanceRecord,
  AttendanceStatus,
  WorkplaceRequestCategory,
  WorkplaceRequestPriority,
} from '../types/worknest';

// ============================================================================
// 1. ATTENDANCE MANAGEMENT VIEW (EMPLOYEE, MANAGER TEAM, AND HR ORG-WIDE)
// ============================================================================

export const AttendanceView: React.FC<{ scope: 'employee' | 'manager' | 'hr' }> = ({ scope }) => {
  const {
    activeProfile,
    profiles,
    attendanceRecords,
    companySettings,
    checkInToday,
    checkOutToday,
    correctAttendanceRecord,
    createManualAttendanceRecord,
  } = useWorkNest();

  const [monthFilter, setMonthFilter] = useState(getTodayDateString().slice(0, 7));
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // HR Correction Modal State
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [corrCheckIn, setCorrCheckIn] = useState('09:00');
  const [corrCheckOut, setCorrCheckOut] = useState('18:00');
  const [corrDuration, setCorrDuration] = useState(480);
  const [corrStatus, setCorrStatus] = useState<AttendanceStatus>('Present');
  const [corrReason, setCorrReason] = useState('');

  // HR Manual Entry Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [manualEmpUid, setManualEmpUid] = useState('');
  const [manualDate, setManualDate] = useState(getTodayDateString());
  const [manualIn, setManualIn] = useState('09:00');
  const [manualOut, setManualOut] = useState('18:00');
  const [manualStatus, setManualStatus] = useState<AttendanceStatus>('Present');
  const [manualReason, setManualReason] = useState('');

  if (!activeProfile) return null;

  const today = getTodayDateString();
  const todayOwnRecord = attendanceRecords.find(
    (r) => r.employeeUid === activeProfile.uid && r.date === today
  );

  // Scoped records based on role
  const scopedRecords = attendanceRecords.filter((rec) => {
    if (scope === 'employee') return rec.employeeUid === activeProfile.uid;
    if (scope === 'manager') return rec.managerUid === activeProfile.uid;
    return true;
  });

  const filteredRecords = scopedRecords.filter((rec) => {
    const matchesMonth = monthFilter ? rec.date.startsWith(monthFilter) : true;
    const matchesStatus = statusFilter === 'ALL' ? true : rec.status === statusFilter;
    const matchesSearch = searchQuery.trim()
      ? rec.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.departmentName.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesMonth && matchesStatus && matchesSearch;
  });

  const totalPresent = filteredRecords.filter((r) => r.status === 'Present').length;
  const totalLate = filteredRecords.filter((r) => r.status === 'Late').length;
  const totalAbsent = filteredRecords.filter((r) => r.status === 'Absent').length;
  const totalOnLeave = filteredRecords.filter((r) => r.status === 'On Leave').length;
  const totalMinutes = filteredRecords.reduce((acc, r) => acc + (r.workDurationMinutes || 0), 0);

  const openCorrectionModal = (rec: AttendanceRecord) => {
    setEditingRecord(rec);
    setCorrCheckIn(rec.checkInTime);
    setCorrCheckOut(rec.checkOutTime || '18:00');
    setCorrDuration(rec.workDurationMinutes || 480);
    setCorrStatus(rec.status);
    setCorrReason(rec.correctionReason || '');
  };

  const handleSaveCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord || !corrReason.trim()) return;
    await correctAttendanceRecord(editingRecord.id, {
      checkInTime: corrCheckIn,
      checkOutTime: corrCheckOut,
      workDurationMinutes: Number(corrDuration),
      status: corrStatus,
      correctionReason: corrReason.trim(),
    });
    setEditingRecord(null);
  };

  const handleSaveManualEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmpUid || !manualReason.trim()) return;
    const [inH, inM] = manualIn.split(':').map(Number);
    const [outH, outM] = manualOut.split(':').map(Number);
    const dur = Math.max(0, (outH * 60 + outM) - (inH * 60 + inM));
    await createManualAttendanceRecord({
      employeeUid: manualEmpUid,
      date: manualDate,
      checkInTime: manualIn,
      checkOutTime: manualOut,
      workDurationMinutes: dur,
      status: manualStatus,
      correctionReason: manualReason.trim(),
    });
    setShowAddModal(false);
    setManualReason('');
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {scope === 'employee'
              ? 'My Daily & Monthly Attendance'
              : scope === 'manager'
              ? 'Authorized Team Attendance'
              : 'Organization Attendance & Audit Corrections'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configured Hours: {companySettings?.workStartTime || '09:00'} –{' '}
            {companySettings?.workEndTime || '18:00'} ({companySettings?.timezone || 'UTC-05:00'}) ·
            Grace Period: {companySettings?.lateGraceMinutes ?? 15} mins
          </p>
        </div>

        <div className="flex items-center gap-3">
          {scope === 'employee' && (
            <>
              {!todayOwnRecord ? (
                <button
                  type="button"
                  onClick={checkInToday}
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Check In for Today ({today})</span>
                </button>
              ) : !todayOwnRecord.checkOutTime ? (
                <button
                  type="button"
                  onClick={checkOutToday}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Check Out (Checked in at {todayOwnRecord.checkInTime})</span>
                </button>
              ) : (
                <div className="text-xs font-semibold text-teal-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    Completed Today: {todayOwnRecord.checkInTime} – {todayOwnRecord.checkOutTime}
                  </span>
                </div>
              )}
            </>
          )}

          {scope === 'hr' && (
            <button
              type="button"
              onClick={() => {
                setManualEmpUid(profiles[0]?.uid || '');
                setShowAddModal(true);
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record / Override Attendance</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-slate-500">Present</div>
          <div className="text-2xl font-bold text-teal-700 font-mono-tabular mt-1">
            {totalPresent}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-slate-500">Late Arrivals</div>
          <div className="text-2xl font-bold text-amber-700 font-mono-tabular mt-1">
            {totalLate}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-slate-500">Absent</div>
          <div className="text-2xl font-bold text-red-600 font-mono-tabular mt-1">
            {totalAbsent}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-slate-500">On Leave</div>
          <div className="text-2xl font-bold text-slate-900 font-mono-tabular mt-1">
            {totalOnLeave}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 col-span-2 sm:col-span-1">
          <div className="text-xs text-slate-500">Recorded Hours</div>
          <div className="text-2xl font-bold text-slate-900 font-mono-tabular mt-1">
            {(totalMinutes / 60).toFixed(1)}h
          </div>
        </div>
      </div>

      {/* Filters & Attendance Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Month Filter
              </label>
              <input
                type="month"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono-tabular"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Attendance Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="ALL">All Statuses</option>
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Absent">Absent</option>
                <option value="On Leave">On Leave</option>
                <option value="Half Day">Half Day</option>
              </select>
            </div>
          </div>

          {scope !== 'employee' && (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search employee or ID..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg"
              />
            </div>
          )}
        </div>

        {filteredRecords.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No attendance records match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <th className="py-2.5 pr-4">Date</th>
                  <th className="py-2.5 px-3">Employee</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3 text-right">Check In</th>
                  <th className="py-2.5 px-3 text-right">Check Out</th>
                  <th className="py-2.5 px-3 text-right">Duration</th>
                  <th className="py-2.5 px-3">Status & Audit Notes</th>
                  {scope === 'hr' && <th className="py-2.5 pl-3 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50">
                    <td className="py-3 pr-4 font-mono-tabular font-semibold text-slate-900">
                      {rec.date}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{rec.employeeName}</div>
                      <div className="text-[11px] text-slate-500 font-mono-tabular">
                        {rec.employeeId}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{rec.departmentName}</td>
                    <td className="py-3 px-3 text-right font-mono-tabular text-slate-800">
                      {rec.checkInTime}
                    </td>
                    <td className="py-3 px-3 text-right font-mono-tabular text-slate-800">
                      {rec.checkOutTime || 'Active'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono-tabular text-slate-700">
                      {rec.workDurationMinutes > 0
                        ? `${Math.floor(rec.workDurationMinutes / 60)}h ${
                            rec.workDurationMinutes % 60
                          }m`
                        : '—'}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`font-semibold ${
                          rec.status === 'Present'
                            ? 'text-teal-700'
                            : rec.status === 'Late'
                            ? 'text-amber-700'
                            : rec.status === 'Absent'
                            ? 'text-red-600'
                            : 'text-slate-700'
                        }`}
                      >
                        {rec.status}
                      </span>
                      {rec.correctionReason && (
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Audit Note: {rec.correctionReason}
                        </div>
                      )}
                    </td>
                    {scope === 'hr' && (
                      <td className="py-3 pl-3 text-right">
                        <button
                          type="button"
                          onClick={() => openCorrectionModal(rec)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Correct</span>
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* HR Attendance Correction Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Attendance Record Correction
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {editingRecord.employeeName} ({editingRecord.employeeId}) · Date: {editingRecord.date}
            </p>
            <form onSubmit={handleSaveCorrection} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Check-In Time</label>
                  <input
                    type="time"
                    required
                    value={corrCheckIn}
                    onChange={(e) => setCorrCheckIn(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Check-Out Time</label>
                  <input
                    type="time"
                    value={corrCheckOut}
                    onChange={(e) => setCorrCheckOut(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono-tabular"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={1440}
                    required
                    value={corrDuration}
                    onChange={(e) => setCorrDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={corrStatus}
                    onChange={(e) => setCorrStatus(e.target.value as AttendanceStatus)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Present">Present</option>
                    <option value="Late">Late</option>
                    <option value="Absent">Absent</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Half Day">Half Day</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mandatory Audit Reason *
                </label>
                <textarea
                  rows={2}
                  required
                  value={corrReason}
                  onChange={(e) => setCorrReason(e.target.value)}
                  placeholder="State the verified reason for this attendance correction..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 cursor-pointer"
                >
                  Save & Record Audit Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HR Manual Attendance Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Record Organization Attendance Entry
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Create or override a daily attendance entry with an immutable audit reason.
            </p>
            <form onSubmit={handleSaveManualEntry} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Employee *</label>
                <select
                  value={manualEmpUid}
                  onChange={(e) => setManualEmpUid(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  {profiles.map((p) => (
                    <option key={p.uid} value={p.uid}>
                      {p.fullName} ({p.employeeId} · {p.departmentName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status *</label>
                  <select
                    value={manualStatus}
                    onChange={(e) => setManualStatus(e.target.value as AttendanceStatus)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Present">Present</option>
                    <option value="Late">Late</option>
                    <option value="Absent">Absent</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Half Day">Half Day</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Check In</label>
                  <input
                    type="time"
                    value={manualIn}
                    onChange={(e) => setManualIn(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Check Out</label>
                  <input
                    type="time"
                    value={manualOut}
                    onChange={(e) => setManualOut(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono-tabular"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mandatory Audit Reason *
                </label>
                <textarea
                  rows={2}
                  required
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  placeholder="e.g. Approved field visit or badge reader sync..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 cursor-pointer"
                >
                  Record Attendance
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
// 2. LEAVE APPLICATION & MY LEAVES VIEW
// ============================================================================

export const EmployeeLeaveView: React.FC<{ initialTab: 'apply' | 'history' }> = ({
  initialTab,
}) => {
  const {
    activeProfile,
    leaveTypes,
    leaveBalances,
    leaveRequests,
    holidays,
    submitLeaveRequest,
    cancelLeaveRequest,
    setCurrentRoute,
  } = useWorkNest();

  const [selectedCode, setSelectedCode] = useState('CASUAL');
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [endDate, setEndDate] = useState(getTodayDateString());
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  if (!activeProfile) return null;

  const activeLeaveTypes =
    leaveTypes.filter((lt) => lt.status === 'Active').length > 0
      ? leaveTypes.filter((lt) => lt.status === 'Active')
      : [
          {
            id: 'lt-casual',
            name: 'Casual Leave',
            code: 'CASUAL',
            annualQuotaDays: 12,
            description: 'Short-term personal leave.',
            isPaid: true,
            requiresHrApproval: false,
            status: 'Active' as const,
            visibility: 'organization' as const,
            createdByUid: activeProfile.uid,
          },
          {
            id: 'lt-sick',
            name: 'Sick Leave',
            code: 'SICK',
            annualQuotaDays: 10,
            description: 'Medical recovery and wellness leave.',
            isPaid: true,
            requiresHrApproval: false,
            status: 'Active' as const,
            visibility: 'organization' as const,
            createdByUid: activeProfile.uid,
          },
          {
            id: 'lt-earned',
            name: 'Earned Leave',
            code: 'EARNED',
            annualQuotaDays: 15,
            description: 'Planned annual vacation.',
            isPaid: true,
            requiresHrApproval: true,
            status: 'Active' as const,
            visibility: 'organization' as const,
            createdByUid: activeProfile.uid,
          },
          {
            id: 'lt-unpaid',
            name: 'Unpaid Leave',
            code: 'UNPAID',
            annualQuotaDays: 30,
            description: 'Authorized leave without pay.',
            isPaid: false,
            requiresHrApproval: true,
            status: 'Active' as const,
            visibility: 'organization' as const,
            createdByUid: activeProfile.uid,
          },
        ];

  const myBalance = leaveBalances.find((b) => b.employeeUid === activeProfile.uid);
  const myRequests = leaveRequests.filter((r) => r.employeeUid === activeProfile.uid);

  // Calculate business days between startDate and endDate (excluding holidays)
  const computedDays = React.useMemo(() => {
    if (!startDate || !endDate || endDate < startDate) return 0;
    const s = new Date(`${startDate}T00:00:00`);
    const e = new Date(`${endDate}T00:00:00`);
    const holidayDates = new Set(holidays.map((h) => h.date));
    let count = 0;
    const cur = new Date(s);
    while (cur <= e) {
      const dayOfWeek = cur.getDay();
      const iso = cur.toISOString().slice(0, 10);
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayDates.has(iso)) {
        count += 1;
      }
      cur.setDate(cur.getDate() + 1);
    }
    return count > 0 ? count : 1;
  }, [startDate, endDate, holidays]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (endDate < startDate) return;
    const chosenType =
      activeLeaveTypes.find((t) => t.code === selectedCode) || activeLeaveTypes[0];

    setSubmitting(true);
    try {
      await submitLeaveRequest({
        leaveTypeCode: chosenType.code,
        leaveTypeName: chosenType.name,
        startDate,
        endDate,
        totalDays: computedDays,
        reason,
      });
      setReason('');
      setCurrentRoute('emp-my-leaves');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Leave Balance Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-xs text-slate-500">Casual Leave</div>
          <div className="text-2xl font-bold text-slate-900 font-mono-tabular mt-1">
            {myBalance ? myBalance.casualTotal - myBalance.casualUsed : 12}d
          </div>
          <div className="text-[11px] text-slate-400 font-mono-tabular mt-1">
            Used: {myBalance?.casualUsed || 0} / {myBalance?.casualTotal || 12} days
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-xs text-slate-500">Sick Leave</div>
          <div className="text-2xl font-bold text-slate-900 font-mono-tabular mt-1">
            {myBalance ? myBalance.sickTotal - myBalance.sickUsed : 10}d
          </div>
          <div className="text-[11px] text-slate-400 font-mono-tabular mt-1">
            Used: {myBalance?.sickUsed || 0} / {myBalance?.sickTotal || 10} days
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-xs text-slate-500">Earned Leave</div>
          <div className="text-2xl font-bold text-teal-700 font-mono-tabular mt-1">
            {myBalance ? myBalance.earnedTotal - myBalance.earnedUsed : 15}d
          </div>
          <div className="text-[11px] text-slate-400 font-mono-tabular mt-1">
            Used: {myBalance?.earnedUsed || 0} / {myBalance?.earnedTotal || 15} days
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-xs text-slate-500">Unpaid Leave Taken</div>
          <div className="text-2xl font-bold text-slate-700 font-mono-tabular mt-1">
            {myBalance?.unpaidUsed || 0}d
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Routed to {activeProfile.managerName}
          </div>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setCurrentRoute('emp-apply-leave')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            initialTab === 'apply'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Apply for Leave
        </button>
        <button
          type="button"
          onClick={() => setCurrentRoute('emp-my-leaves')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            initialTab === 'history'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          My Leave History ({myRequests.length})
        </button>
      </div>

      {initialTab === 'apply' ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Submit New Leave Application</h2>
          <p className="text-xs text-slate-500 mb-6">
            Your application will be routed directly to your reporting manager (
            <span className="font-semibold text-slate-800">{activeProfile.managerName}</span>) for
            review.
          </p>

          <form onSubmit={handleApply} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Leave Type *</label>
              <select
                value={selectedCode}
                onChange={(e) => setSelectedCode(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white"
              >
                {activeLeaveTypes.map((lt) => (
                  <option key={lt.id} value={lt.code}>
                    {lt.name} ({lt.isPaid ? 'Paid' : 'Unpaid'} · Annual Quota: {lt.annualQuotaDays}d)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Start Date *</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (endDate < e.target.value) setEndDate(e.target.value);
                  }}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg font-mono-tabular"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">End Date *</label>
                <input
                  type="date"
                  required
                  min={startDate}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg font-mono-tabular"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600">Calculated Working Days (excluding holidays):</span>
              <span className="text-sm font-bold text-teal-700 font-mono-tabular">
                {computedDays} Day(s)
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Reason & Handover Notes *
              </label>
              <textarea
                rows={3}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Provide reason for leave and any task delegation or coverage notes..."
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting || computedDays <= 0}
                className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>{submitting ? 'Submitting Application...' : 'Submit Leave Application'}</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Leave Application Ledger</h2>
              <p className="text-xs text-slate-500">
                Track approval status, reviewer decisions, and manager remarks
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentRoute('emp-apply-leave')}
              className="px-3.5 py-2 rounded-lg bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 cursor-pointer"
            >
              + Apply for Leave
            </button>
          </div>

          {myRequests.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              You have not submitted any leave applications yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                    <th className="py-2.5 pr-3">Request ID</th>
                    <th className="py-2.5 px-3">Leave Type</th>
                    <th className="py-2.5 px-3">Dates & Duration</th>
                    <th className="py-2.5 px-3">Reason</th>
                    <th className="py-2.5 px-3">Reviewer & Remarks</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 pl-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {myRequests.map((lr) => (
                    <tr key={lr.id} className="hover:bg-slate-50">
                      <td className="py-3 pr-3 font-mono-tabular font-semibold text-slate-700">
                        {lr.id}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {lr.leaveTypeName}
                      </td>
                      <td className="py-3 px-3 font-mono-tabular text-slate-700">
                        {lr.startDate} → {lr.endDate} ({lr.totalDays}d)
                      </td>
                      <td className="py-3 px-3 text-slate-600 max-w-xs">{lr.reason}</td>
                      <td className="py-3 px-3 text-slate-600">
                        <div>
                          Reviewer:{' '}
                          <span className="font-medium text-slate-900">
                            {lr.reviewerName || lr.managerName}
                          </span>
                        </div>
                        {lr.reviewerRemarks && (
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            &ldquo;{lr.reviewerRemarks}&rdquo;
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 font-semibold">
                        <span
                          className={
                            lr.status === 'Approved'
                              ? 'text-teal-700'
                              : lr.status === 'Rejected'
                              ? 'text-red-600'
                              : lr.status === 'Cancelled'
                              ? 'text-slate-400'
                              : 'text-amber-700'
                          }
                        >
                          {lr.status}
                        </span>
                      </td>
                      <td className="py-3 pl-3 text-right">
                        {lr.status === 'Pending' && (
                          <button
                            type="button"
                            onClick={() => setConfirmCancelId(lr.id)}
                            className="px-2.5 py-1 rounded-md border border-red-200 text-red-700 hover:bg-red-50 text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Cancel</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog for Leave Cancellation */}
      {confirmCancelId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-sm w-full p-6">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Cancel Pending Leave Application?
            </h3>
            <p className="text-xs text-slate-600 mb-5">
              Are you sure you want to cancel leave request{' '}
              <span className="font-mono-tabular font-semibold">{confirmCancelId}</span>? This
              action will mark the request as Cancelled.
            </p>
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setConfirmCancelId(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Keep Request
              </button>
              <button
                type="button"
                onClick={async () => {
                  const id = confirmCancelId;
                  setConfirmCancelId(null);
                  await cancelLeaveRequest(id);
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 cursor-pointer"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 3. GENERAL WORKPLACE REQUESTS MODULE (MY REQUESTS)
// ============================================================================

const REQUEST_CATEGORIES: WorkplaceRequestCategory[] = [
  'Work From Home',
  'Permission / Short Leave',
  'Shift Change',
  'Attendance Correction',
  'Equipment Request',
  'IT Support',
  'HR Support',
  'Other Workplace Requests',
];

export const EmployeeWorkplaceRequestsView: React.FC = () => {
  const { activeProfile, workplaceRequests, submitWorkplaceRequest } = useWorkNest();

  const [category, setCategory] = useState<WorkplaceRequestCategory>('Work From Home');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState(getTodayDateString());
  const [priority, setPriority] = useState<WorkplaceRequestPriority>('Medium');
  const [submitting, setSubmitting] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  if (!activeProfile) return null;

  const myRequests = workplaceRequests.filter((r) => {
    const isMine = r.employeeUid === activeProfile.uid;
    const matchesCat = filterCategory === 'ALL' || r.category === filterCategory;
    return isMine && matchesCat;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setSubmitting(true);
    try {
      await submitWorkplaceRequest({
        category,
        title: title.trim(),
        description: description.trim(),
        targetDate,
        priority,
      });
      setTitle('');
      setDescription('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left: Submit Workplace Request Form */}
      <div className="lg:col-span-5">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-base font-bold text-slate-900 mb-1">Submit a Workplace Request</h2>
          <p className="text-xs text-slate-500 mb-5">
            Requests are automatically routed to your reporting manager ({activeProfile.managerName}
            ), HR, or IT Support based on category.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Request Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as WorkplaceRequestCategory)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                {REQUEST_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Request Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Remote work request for Friday client workshop"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Effective Date *</label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono-tabular"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Priority *</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as WorkplaceRequestPriority)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Detailed Description *
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Include relevant timings, shift details, equipment specs, or reason..."
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Submitting Request...' : 'Submit Workplace Request'}
            </button>
          </form>
        </div>
      </div>

      {/* Right: Track My Requests */}
      <div className="lg:col-span-7">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">My Submitted Requests</h2>
              <p className="text-xs text-slate-500">
                Track status updates, assigned reviewers, and resolution remarks
              </p>
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="ALL">All Categories</option>
              {REQUEST_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {myRequests.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No workplace requests found for this category.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {myRequests.map((req) => (
                <div key={req.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-bold text-slate-900">{req.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        <span>{req.category}</span>
                        <span className="mx-1.5">·</span>
                        <span className="font-mono-tabular">{req.id}</span>
                        <span className="mx-1.5">·</span>
                        <span>Target Date: {req.targetDate}</span>
                        <span className="mx-1.5">·</span>
                        <span>Priority: {req.priority}</span>
                      </div>
                    </div>

                    <div className="text-xs font-semibold shrink-0">
                      <span
                        className={
                          req.status === 'Approved' || req.status === 'Resolved'
                            ? 'text-teal-700'
                            : req.status === 'Rejected'
                            ? 'text-red-600'
                            : 'text-amber-700'
                        }
                      >
                        {req.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{req.description}</p>

                  <div className="mt-2.5 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      Routed to: <span className="font-semibold text-slate-700">{req.assignedToRole}</span>
                      {req.reviewerName && ` · Reviewed by ${req.reviewerName}`}
                    </div>
                    {req.remarks && (
                      <div className="text-slate-700">
                        Resolution Note: &ldquo;{req.remarks}&rdquo;
                      </div>
                    )}
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
