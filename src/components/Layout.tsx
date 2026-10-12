import React, { useState } from 'react';
import {
  LayoutDashboard,
  UserCircle,
  Clock,
  CalendarPlus,
  CalendarCheck,
  FilePlus2,
  FolderKanban,
  Bell,
  Megaphone,
  Users,
  CheckSquare,
  Calendar,
  Building2,
  UserCog,
  FileSpreadsheet,
  Settings,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  Sparkles,
  RefreshCw,
  Award,
  UsersRound,
  Briefcase,
} from 'lucide-react';
import { AppRoute, UserRole } from '../types/worknest';
import { useWorkNest } from '../context/WorkNestContext';
import { WorkNestLogo } from './PublicPages';

interface NavItem {
  route: AppRoute;
  label: string;
  icon: React.FC<{ className?: string }>;
  badge?: number;
}

export const PortalLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    activeProfile,
    currentRoute,
    setCurrentRoute,
    logout,
    notifications,
    leaveRequests,
    workplaceRequests,
    workTasks,
    profiles,
    switchActivePersona,
    bannerMessage,
    setBannerMessage,
    seedEnterpriseWorkspace,
    dataLoading,
  } = useWorkNest();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!activeProfile) return null;

  const unreadCount = notifications.filter(
    (n) => !n.isRead && n.recipientUid === activeProfile.uid
  ).length;

  const myOpenTasksCount = workTasks.filter(
    (t) => t.assigneeUid === activeProfile.uid && t.status !== 'Completed'
  ).length;

  // Pending counts for Manager
  const mgrPendingLeaves = leaveRequests.filter(
    (r) => r.managerUid === activeProfile.uid && r.status === 'Pending'
  ).length;
  const mgrPendingRequests = workplaceRequests.filter(
    (r) =>
      r.managerUid === activeProfile.uid &&
      (r.status === 'Submitted' || r.status === 'Under Review')
  ).length;

  // Pending counts for HR
  const hrPendingLeaves = leaveRequests.filter(
    (r) => r.status === 'Pending' || r.status === 'Pending HR Approval'
  ).length;
  const hrPendingRequests = workplaceRequests.filter(
    (r) => r.status === 'Submitted' || r.status === 'Under Review'
  ).length;
  const hrOpenTasksCount = workTasks.filter((t) => t.status !== 'Completed').length;

  const employeeNav: NavItem[] = [
    { route: 'emp-dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { route: 'emp-profile', label: 'My Profile', icon: UserCircle },
    { route: 'emp-attendance', label: 'Attendance', icon: Clock },
    { route: 'emp-apply-leave', label: 'Apply Leave', icon: CalendarPlus },
    { route: 'emp-my-leaves', label: 'My Leave Requests', icon: CalendarCheck },
    {
      route: 'emp-projects',
      label: 'Projects & Tasks',
      icon: FolderKanban,
      badge: myOpenTasksCount || undefined,
    },
    { route: 'emp-team', label: 'My Team & Directory', icon: UsersRound },
    { route: 'emp-performance', label: 'My Performance', icon: Award },
    { route: 'emp-my-requests', label: 'Workplace Requests', icon: Briefcase },
    {
      route: 'emp-notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadCount || undefined,
    },
    { route: 'emp-announcements', label: 'Announcements', icon: Megaphone },
  ];

  const managerNav: NavItem[] = [
    { route: 'mgr-dashboard', label: 'Manager Dashboard', icon: LayoutDashboard },
    { route: 'mgr-team', label: 'My Team', icon: Users },
    {
      route: 'mgr-leave-approvals',
      label: 'Leave Approvals',
      icon: CalendarCheck,
      badge: mgrPendingLeaves || undefined,
    },
    {
      route: 'mgr-request-approvals',
      label: 'Request Approvals',
      icon: CheckSquare,
      badge: mgrPendingRequests || undefined,
    },
    { route: 'mgr-attendance', label: 'Team Attendance', icon: Clock },
    { route: 'mgr-reports', label: 'Team Reports', icon: FileSpreadsheet },
    {
      route: 'mgr-notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadCount || undefined,
    },
    { route: 'mgr-announcements', label: 'Announcements', icon: Megaphone },
    { route: 'emp-profile', label: 'My Personal Profile', icon: UserCircle },
  ];

  const hrNav: NavItem[] = [
    { route: 'hr-dashboard', label: 'HR / Admin Dashboard', icon: LayoutDashboard },
    { route: 'hr-employees', label: 'Employees', icon: Users },
    { route: 'hr-departments', label: 'Departments', icon: Building2 },
    { route: 'hr-managers', label: 'Managers & Reporting', icon: UserCog },
    { route: 'hr-attendance', label: 'Attendance Control', icon: Clock },
    {
      route: 'hr-leaves',
      label: 'Leave Control',
      icon: CalendarCheck,
      badge: hrPendingLeaves || undefined,
    },
    {
      route: 'hr-work',
      label: 'Work & Task Assignment',
      icon: FolderKanban,
      badge: hrOpenTasksCount || undefined,
    },
    { route: 'hr-reviews', label: 'Performance Reviews', icon: Award },
    {
      route: 'hr-requests',
      label: 'Workplace Requests',
      icon: CheckSquare,
      badge: hrPendingRequests || undefined,
    },
    { route: 'hr-announcements', label: 'Announcements', icon: Megaphone },
    { route: 'hr-reports', label: 'Reports & Export', icon: FileSpreadsheet },
    { route: 'hr-settings', label: 'Company Settings', icon: Settings },
    { route: 'hr-audit', label: 'Roles & Audit Logs', icon: ShieldAlert },
  ];

  const navItems =
    activeProfile.role === 'HR'
      ? hrNav
      : activeProfile.role === 'Manager'
      ? managerNav
      : employeeNav;

  const roleBadgeLabel: Record<UserRole, string> = {
    Employee: 'Employee Portal',
    Manager: 'Department Manager Portal',
    HR: 'HR & Admin Portal',
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Desktop Sidebar (Fixed 264px Dark Navy) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-[264px] lg:fixed lg:inset-y-0 bg-slate-900 text-slate-300 border-r border-slate-800 z-30">
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800">
          <WorkNestLogo light size="sm" />
        </div>

        {/* Active Role & User Summary */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-600/20 border border-teal-500/30 text-teal-300 font-bold text-sm flex items-center justify-center shrink-0">
              {activeProfile.avatarInitials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-white truncate">
                {activeProfile.fullName}
              </div>
              <div className="text-xs text-slate-400 truncate">
                {activeProfile.employeeId} · {activeProfile.departmentName}
              </div>
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px]">
            <span className="text-teal-400 font-semibold">
              {roleBadgeLabel[activeProfile.role]}
            </span>
            <span className="text-slate-400 font-mono-tabular">{activeProfile.status}</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.route;
            return (
              <button
                key={item.route}
                type="button"
                onClick={() => setCurrentRoute(item.route)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-teal-600/15 text-teal-300 border-l-2 border-teal-400 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-400' : ''}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-mono-tabular font-bold rounded bg-teal-500/20 text-teal-300">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Connected Demo Role Switcher in Sidebar Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/60 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1 font-semibold text-teal-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Switch Connected Role</span>
            </span>
            <button
              type="button"
              onClick={seedEnterpriseWorkspace}
              disabled={dataLoading}
              title="Reset sample data to defaults"
              className="text-slate-400 hover:text-white inline-flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${dataLoading ? 'animate-spin' : ''}`} />
              <span>Reset Data</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1">
            <button
              type="button"
              onClick={() => switchActivePersona('emp-eng-01')}
              className={`py-1.5 px-2 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                activeProfile.role === 'Employee'
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Employee
            </button>
            <button
              type="button"
              onClick={() => switchActivePersona('mgr-eng-01')}
              className={`py-1.5 px-2 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                activeProfile.role === 'Manager'
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Manager
            </button>
            <button
              type="button"
              onClick={() => switchActivePersona('hr-admin-01')}
              className={`py-1.5 px-2 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                activeProfile.role === 'HR'
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              HR/Admin
            </button>
          </div>

          <select
            aria-label="Inspect specific employee persona"
            value={activeProfile.uid}
            onChange={(e) => switchActivePersona(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:border-teal-500"
          >
            {profiles.map((p) => (
              <option key={p.uid} value={p.uid}>
                {p.role}: {p.fullName} ({p.employeeId})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={logout}
            className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-red-950/60 hover:text-red-300 text-slate-300 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out of WorkNest</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-[264px] flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>{roleBadgeLabel[activeProfile.role]}</span>
                <span className="hidden md:inline-block text-slate-300">·</span>
                <span className="hidden md:inline-block text-xs font-normal text-slate-500">
                  {activeProfile.designation}
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Signed in as <strong className="text-slate-700">{activeProfile.fullName}</strong> (
                <span className="font-mono-tabular">{activeProfile.employeeId}</span>) · Reporting
                to {activeProfile.managerName}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Top Bar Role Switcher for Evaluators */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2">
                Demo Role:
              </span>
              <button
                type="button"
                onClick={() => switchActivePersona('emp-eng-01')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeProfile.role === 'Employee'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Employee
              </button>
              <button
                type="button"
                onClick={() => switchActivePersona('hr-admin-01')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeProfile.role === 'HR'
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                HR / Admin
              </button>
              <button
                type="button"
                onClick={() => switchActivePersona('mgr-eng-01')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeProfile.role === 'Manager'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Manager
              </button>
            </div>

            <button
              type="button"
              onClick={() =>
                setCurrentRoute(
                  activeProfile.role === 'Manager'
                    ? 'mgr-notifications'
                    : 'emp-notifications'
                )
              }
              className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={logout}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Global Action Feedback Banner */}
        {bannerMessage && (
          <div className="px-4 sm:px-8 pt-4">
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs font-medium shadow-2xs ${
                bannerMessage.type === 'success'
                  ? 'bg-teal-50 border-teal-200 text-teal-900'
                  : bannerMessage.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-slate-100 border-slate-300 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {bannerMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                ) : bannerMessage.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                ) : (
                  <Info className="w-4 h-4 text-slate-600 shrink-0" />
                )}
                <span>{bannerMessage.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setBannerMessage(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-950/60"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-xs bg-slate-900 text-slate-200 h-full flex flex-col justify-between p-4 z-10 overflow-y-auto">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <WorkNestLogo light size="sm" />
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Role Switcher */}
                <div className="my-3 p-2.5 rounded-lg bg-slate-800/80 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                    Switch Connected Role
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        switchActivePersona('emp-eng-01');
                        setMobileMenuOpen(false);
                      }}
                      className={`py-1.5 px-2 rounded text-[11px] font-semibold ${
                        activeProfile.role === 'Employee'
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      Employee
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        switchActivePersona('hr-admin-01');
                        setMobileMenuOpen(false);
                      }}
                      className={`py-1.5 px-2 rounded text-[11px] font-semibold ${
                        activeProfile.role === 'HR'
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      HR/Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        switchActivePersona('mgr-eng-01');
                        setMobileMenuOpen(false);
                      }}
                      className={`py-1.5 px-2 rounded text-[11px] font-semibold ${
                        activeProfile.role === 'Manager'
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      Manager
                    </button>
                  </div>
                </div>

                <div className="py-2 space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentRoute === item.route;
                    return (
                      <button
                        key={item.route}
                        type="button"
                        onClick={() => {
                          setCurrentRoute(item.route);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium ${
                          isActive
                            ? 'bg-teal-600/20 text-teal-300 font-semibold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="px-1.5 py-0.5 text-[10px] rounded bg-teal-500/20 text-teal-300">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-3">
                <select
                  value={activeProfile.uid}
                  onChange={(e) => {
                    switchActivePersona(e.target.value);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded text-slate-200"
                >
                  {profiles.map((p) => (
                    <option key={p.uid} value={p.uid}>
                      {p.role}: {p.fullName}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={logout}
                  className="w-full py-2 px-3 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium flex items-center justify-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Workspace Canvas */}
        <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
};
