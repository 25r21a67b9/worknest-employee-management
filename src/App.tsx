/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { WorkNestProvider, useWorkNest } from './context/WorkNestContext';
import { WelcomePage, LoginPage, RegisterPage } from './components/PublicPages';
import { PortalLayout } from './components/Layout';
import {
  EmployeeDashboardView,
  EmployeeProfileView,
  EmployeeProjectsAndTasksView,
  EmployeeTeamView,
  EmployeePerformanceView,
} from './components/EmployeeModule';
import {
  AttendanceView,
  EmployeeLeaveView,
  EmployeeWorkplaceRequestsView,
} from './components/AttendanceAndLeaveModule';
import {
  ManagerDashboardView,
  ManagerTeamView,
  ManagerApprovalCenterView,
} from './components/ManagerModule';
import {
  HrDashboardView,
  HrEmployeesView,
  HrDepartmentAndManagerView,
  HrWorkAndTasksView,
  HrPerformanceReviewsView,
  HrCompanySettingsView,
  HrRolesAndAuditView,
} from './components/HrAdminModule';
import {
  NotificationsModuleView,
  AnnouncementsModuleView,
  ReportsModuleView,
} from './components/CommunicationsAndReportsModule';

const WorkNestRouter: React.FC = () => {
  const { authUser, isDemoSession, authReady, activeProfile, currentRoute } = useWorkNest();

  if (!authReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 rounded-lg bg-teal-600 mx-auto animate-pulse" />
          <div className="text-xs font-semibold text-slate-600">
            Initializing WorkNest Enterprise Workspace...
          </div>
        </div>
      </div>
    );
  }

  // Unauthenticated Public Routes (when neither Firebase user nor Demo Session is active)
  if ((!authUser && !isDemoSession) || !activeProfile) {
    if (currentRoute === 'login') return <LoginPage />;
    if (currentRoute === 'register') return <RegisterPage />;
    return <WelcomePage />;
  }

  // Render active role portal view
  const renderPortalView = () => {
    switch (currentRoute) {
      // Employee Portal Views
      case 'emp-dashboard':
        return <EmployeeDashboardView />;
      case 'emp-profile':
        return <EmployeeProfileView />;
      case 'emp-attendance':
        return <AttendanceView scope="employee" />;
      case 'emp-apply-leave':
        return <EmployeeLeaveView initialTab="apply" />;
      case 'emp-my-leaves':
        return <EmployeeLeaveView initialTab="history" />;
      case 'emp-projects':
        return <EmployeeProjectsAndTasksView />;
      case 'emp-team':
        return <EmployeeTeamView />;
      case 'emp-performance':
        return <EmployeePerformanceView />;
      case 'emp-my-requests':
        return <EmployeeWorkplaceRequestsView />;
      case 'emp-notifications':
        return <NotificationsModuleView />;
      case 'emp-announcements':
        return <AnnouncementsModuleView />;

      // Manager Portal Views
      case 'mgr-dashboard':
        return <ManagerDashboardView />;
      case 'mgr-team':
        return <ManagerTeamView />;
      case 'mgr-leave-approvals':
        return <ManagerApprovalCenterView initialSection="leave" />;
      case 'mgr-request-approvals':
        return <ManagerApprovalCenterView initialSection="requests" />;
      case 'mgr-attendance':
        return <AttendanceView scope="manager" />;
      case 'mgr-reports':
        return <ReportsModuleView scope="manager" />;
      case 'mgr-notifications':
        return <NotificationsModuleView />;
      case 'mgr-announcements':
        return <AnnouncementsModuleView />;

      // HR / Admin Portal Views
      case 'hr-dashboard':
        return <HrDashboardView />;
      case 'hr-employees':
        return <HrEmployeesView />;
      case 'hr-departments':
        return <HrDepartmentAndManagerView mode="departments" />;
      case 'hr-managers':
        return <HrDepartmentAndManagerView mode="managers" />;
      case 'hr-attendance':
        return <AttendanceView scope="hr" />;
      case 'hr-leaves':
        return <ManagerApprovalCenterView initialSection="leave" />;
      case 'hr-work':
        return <HrWorkAndTasksView />;
      case 'hr-reviews':
        return <HrPerformanceReviewsView />;
      case 'hr-requests':
        return <ManagerApprovalCenterView initialSection="requests" />;
      case 'hr-announcements':
        return <AnnouncementsModuleView />;
      case 'hr-reports':
        return <ReportsModuleView scope="hr" />;
      case 'hr-settings':
        return <HrCompanySettingsView />;
      case 'hr-roles':
        return <HrRolesAndAuditView section="roles" />;
      case 'hr-audit':
        return (
          <div className="space-y-8">
            <HrRolesAndAuditView section="roles" />
            <HrRolesAndAuditView section="audit" />
          </div>
        );

      default:
        return activeProfile.role === 'HR' ? (
          <HrDashboardView />
        ) : activeProfile.role === 'Manager' ? (
          <ManagerDashboardView />
        ) : (
          <EmployeeDashboardView />
        );
    }
  };

  return <PortalLayout>{renderPortalView()}</PortalLayout>;
};

export default function App() {
  return (
    <WorkNestProvider>
      <WorkNestRouter />
    </WorkNestProvider>
  );
}
