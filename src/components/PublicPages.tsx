import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  Users,
  CalendarCheck,
  Clock,
  ArrowRight,
  Lock,
  Mail,
  Eye,
  EyeOff,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Phone,
  Briefcase,
  BadgeCheck,
  ChevronLeft,
  Sparkles,
  KeyRound,
  FolderKanban,
  Award,
} from 'lucide-react';
import { useWorkNest, DEMO_ACCOUNTS } from '../context/WorkNestContext';
import { UserRole } from '../types/worknest';

// ============================================================================
// WORKNEST BRAND LOGO COMPONENT
// ============================================================================

export const WorkNestLogo: React.FC<{ light?: boolean; size?: 'sm' | 'md' | 'lg' }> = ({
  light = false,
  size = 'md',
}) => {
  const iconBoxSize =
    size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-11 h-11' : 'w-9 h-9';
  const textSize =
    size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      <div
        className={`${iconBoxSize} rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-xs shrink-0`}
      >
        <Building2 className="w-5 h-5 stroke-[2.2]" />
      </div>
      <div className="flex flex-col leading-none">
        <span
          className={`${textSize} font-bold tracking-tight ${
            light ? 'text-white' : 'text-slate-900'
          }`}
        >
          Work<span className="text-teal-600">Nest</span>
        </span>
        <span
          className={`text-[10px] font-medium tracking-wider uppercase mt-0.5 ${
            light ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          Your Workplace, Connected.
        </span>
      </div>
    </div>
  );
};

// ============================================================================
// 1. WELCOME PAGE (First Screen Before Authentication)
// ============================================================================

export const WelcomePage: React.FC = () => {
  const { setCurrentRoute, quickDemoLogin } = useWorkNest();
  const [launchingRole, setLaunchingRole] = useState<UserRole | null>(null);

  const handleQuickLaunch = async (role: UserRole) => {
    setLaunchingRole(role);
    try {
      await quickDemoLogin(role);
    } finally {
      setLaunchingRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-xs sticky top-0 z-20">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
          <WorkNestLogo size="md" />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentRoute('login')}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setCurrentRoute('register')}
              className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </div>
      </header>

      {/* Main Split Hero Section */}
      <main className="flex-1 flex items-center py-12 lg:py-16">
        <div className="max-w-[1440px] mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Brand Value & Primary Actions */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Connected Employee & HR Management Portal</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-[1.12]">
                Welcome to WorkNest.
              </h1>
              <p className="text-xl font-medium text-teal-700">
                Your Workplace, Connected.
              </p>
              <p className="text-base text-slate-600 leading-relaxed max-w-xl">
                A unified corporate workspace for attendance tracking, leave approvals, project &
                task assignments, performance reviews, and departmental workforce administration —
                designed with connected Employee, Manager, and HR/Admin dashboards.
              </p>
            </div>

            {/* Primary CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                type="button"
                onClick={() => setCurrentRoute('login')}
                className="px-6 py-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <span>Login to Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentRoute('register')}
                className="px-6 py-3 rounded-lg bg-white hover:bg-slate-100 text-slate-800 font-semibold text-sm border border-slate-300 transition-all cursor-pointer"
              >
                Create Employee Account
              </button>
            </div>

            {/* Instant Demo Role Access Card */}
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Instant Demo Role Launch (Pre-Loaded Data)
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">1-Click Evaluation Access</span>
              </div>
              <p className="text-xs text-slate-600">
                Explore the connected system immediately as an Employee, HR/Admin, or Manager. Any
                action taken in one role automatically updates the other dashboards.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <button
                  type="button"
                  disabled={launchingRole !== null}
                  onClick={() => handleQuickLaunch('Employee')}
                  className="p-3 rounded-lg border border-slate-200 hover:border-teal-600 hover:bg-teal-50/50 text-left transition-all cursor-pointer group"
                >
                  <div className="text-xs font-bold text-slate-900 group-hover:text-teal-800 flex items-center justify-between">
                    <span>Employee Demo</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600" />
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5 font-medium">Priya Nair</div>
                  <div className="text-[10px] font-mono-tabular text-slate-400 mt-0.5">
                    EMP-1004 · Staff Eng
                  </div>
                </button>

                <button
                  type="button"
                  disabled={launchingRole !== null}
                  onClick={() => handleQuickLaunch('HR')}
                  className="p-3 rounded-lg border border-slate-200 hover:border-teal-600 hover:bg-teal-50/50 text-left transition-all cursor-pointer group"
                >
                  <div className="text-xs font-bold text-slate-900 group-hover:text-teal-800 flex items-center justify-between">
                    <span>HR / Admin Demo</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600" />
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5 font-medium">Aarav Mehta</div>
                  <div className="text-[10px] font-mono-tabular text-slate-400 mt-0.5">
                    EMP-1001 · VP People Ops
                  </div>
                </button>

                <button
                  type="button"
                  disabled={launchingRole !== null}
                  onClick={() => handleQuickLaunch('Manager')}
                  className="p-3 rounded-lg border border-slate-200 hover:border-teal-600 hover:bg-teal-50/50 text-left transition-all cursor-pointer group"
                >
                  <div className="text-xs font-bold text-slate-900 group-hover:text-teal-800 flex items-center justify-between">
                    <span>Manager Demo</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600" />
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5 font-medium">Marcus Vance</div>
                  <div className="text-[10px] font-mono-tabular text-slate-400 mt-0.5">
                    EMP-1002 · Director Eng
                  </div>
                </button>
              </div>
            </div>

            {/* Key Capabilities Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span>Attendance & Leaves</span>
                </div>
                <p className="text-xs text-slate-500">
                  Daily check-in/out timestamps, leave quotas, and multi-stage approvals.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                  <FolderKanban className="w-4 h-4 text-teal-600" />
                  <span>Projects & Tasks</span>
                </div>
                <p className="text-xs text-slate-500">
                  Assign projects and tasks from HR/Admin and track real-time completion.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                  <Award className="w-4 h-4 text-teal-600" />
                  <span>Reviews & Directory</span>
                </div>
                <p className="text-xs text-slate-500">
                  Structured performance evaluations, self-assessments, and team hierarchy.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Architectural Workplace Visual Preview */}
          <div className="lg:col-span-6">
            <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.35) 1px, transparent 0)',
                  backgroundSize: '24px 24px',
                }}
              />

              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-teal-400 font-semibold">
                      Connected Operations Architecture
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5">
                      Synchronized Employee & HR State
                    </h3>
                  </div>
                  <span className="text-xs font-mono-tabular text-slate-400 bg-slate-800 px-2.5 py-1 rounded">
                    LIVE SYNC
                  </span>
                </div>

                {/* Role Hierarchy Illustration Cards */}
                <div className="space-y-3">
                  <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 font-bold text-xs shrink-0 mt-0.5">
                        EMP
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">
                          Employee Self-Service Portal
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Check in/out, apply for leave, update assigned task progress, view team
                          colleagues, and acknowledge performance reviews.
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono-tabular text-teal-400 shrink-0">
                      Level 1
                    </span>
                  </div>

                  <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-300 font-bold text-xs shrink-0 mt-0.5">
                        MGR
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">
                          Department Manager Workspace
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Supervise assigned direct reports, approve or reject team leave and
                          workplace requests, and monitor daily attendance.
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono-tabular text-sky-400 shrink-0">
                      Level 2
                    </span>
                  </div>

                  <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 font-bold text-xs shrink-0 mt-0.5">
                        HR
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">
                          HR & System Administration
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Manage employees & departments, assign projects and tasks, publish
                          announcements, conduct performance reviews, and export reports.
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono-tabular text-amber-400 shrink-0">
                      Level 3
                    </span>
                  </div>
                </div>

                {/* Live Metrics Footer inside Card */}
                <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-800 text-center">
                  <div>
                    <div className="text-xl font-bold font-mono-tabular text-white">4</div>
                    <div className="text-[11px] text-slate-400">Departments</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold font-mono-tabular text-teal-400">4</div>
                    <div className="text-[11px] text-slate-400">Active Projects</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold font-mono-tabular text-white">100%</div>
                    <div className="text-[11px] text-slate-400">Connected State</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-5">
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>© {new Date().getFullYear()} WorkNest Enterprise Inc. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <span>Employee Portal</span>
            <span>Leave & Attendance</span>
            <span>Projects & Performance</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

// ============================================================================
// 2. LOGIN PAGE (Email/Password, Documented Demo Accounts, Google OAuth)
// ============================================================================

export const LoginPage: React.FC = () => {
  const {
    setCurrentRoute,
    loginWithEmail,
    loginWithGoogle,
    quickDemoLogin,
    sendPasswordReset,
  } = useWorkNest();

  const [email, setEmail] = useState(DEMO_ACCOUNTS[0].email);
  const [password, setPassword] = useState(DEMO_ACCOUNTS[0].password);
  const [selectedRoleTab, setSelectedRoleTab] = useState<UserRole>('Employee');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);
  const [forgotMode, setForgotMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectDemoAccount = (acc: (typeof DEMO_ACCOUNTS)[0]) => {
    setSelectedRoleTab(acc.role);
    setEmail(acc.email);
    setPassword(acc.password);
    setErrorMsg(null);
    setInfoMsg(`Filled credentials for ${acc.label} (${acc.fullName}). Click Sign In below.`);
  };

  const handleDirectDemoLogin = async (role: UserRole) => {
    setErrorMsg(null);
    setSubmitting(true);
    try {
      await quickDemoLogin(role);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to start demo session.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMsg('Please enter a valid corporate email address.');
      return;
    }

    if (forgotMode) {
      setSubmitting(true);
      try {
        await sendPasswordReset(trimmedEmail);
        setInfoMsg(`Password reset link dispatched to ${trimmedEmail}.`);
      } catch (err) {
        setErrorMsg(
          err instanceof Error ? err.message : 'Unable to send password reset email.'
        );
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!password || password.length < 4) {
      setErrorMsg('Please enter your account password.');
      return;
    }

    setSubmitting(true);
    try {
      await loginWithEmail(trimmedEmail, password, selectedRoleTab);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Invalid credentials. Select a Demo Account card or check your email and password.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Google authentication was cancelled or failed.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentRoute('welcome')}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Welcome</span>
          </button>
          <WorkNestLogo size="sm" />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Sign-In Form */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-xs p-8">
            <div className="mb-5">
              <h1 className="text-2xl font-bold text-slate-900">
                {forgotMode ? 'Reset Your Password' : 'Sign In to WorkNest'}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {forgotMode
                  ? 'Enter your registered work email to receive password recovery instructions.'
                  : 'Select a role tab below or enter your email and password to open your dashboard.'}
              </p>
            </div>

            {/* Quick Role Selector Tabs */}
            {!forgotMode && (
              <div className="mb-5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Select Role to Auto-Fill Demo Credentials
                </label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
                  {DEMO_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.uid}
                      type="button"
                      onClick={() => selectDemoAccount(acc)}
                      className={`py-2 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        selectedRoleTab === acc.role
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {acc.role === 'HR' ? 'HR / Admin' : acc.role}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {infoMsg && (
              <div className="mb-5 p-3.5 rounded-lg bg-teal-50 border border-teal-200 flex items-start gap-2.5 text-xs text-teal-800">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>{infoMsg}</span>
              </div>
            )}

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Corporate Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@worknest.io"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              {!forgotMode && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotMode(true);
                        setErrorMsg(null);
                        setInfoMsg(null);
                      }}
                      className="text-xs font-medium text-teal-700 hover:text-teal-800 cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {!forgotMode && (
                <div className="flex items-center justify-between pt-1">
                  <label className="inline-flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberSession}
                      onChange={(e) => setRememberSession(e.target.checked)}
                      className="rounded border-slate-300 text-slate-900 focus:ring-0"
                    />
                    <span>Keep session active on this device</span>
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {submitting
                  ? 'Signing In...'
                  : forgotMode
                  ? 'Send Password Reset Email'
                  : 'Sign In with Email'}
              </button>

              {forgotMode && (
                <button
                  type="button"
                  onClick={() => {
                    setForgotMode(false);
                    setErrorMsg(null);
                    setInfoMsg(null);
                  }}
                  className="w-full py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Return to Password Sign In
                </button>
              )}
            </form>

            {!forgotMode && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 text-slate-400 font-medium">
                      Or SSO Workspace Login
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={submitting}
                  className="w-full py-2.5 px-4 rounded-lg bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-300 flex items-center justify-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <BadgeCheck className="w-4 h-4 text-teal-600" />
                  <span>Continue with Google Workspace</span>
                </button>
              </>
            )}

            <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
              New employee joining the organization?{' '}
              <button
                type="button"
                onClick={() => setCurrentRoute('register')}
                className="font-semibold text-teal-700 hover:text-teal-800 cursor-pointer"
              >
                Create an Employee Account
              </button>
            </div>
          </div>

          {/* Right Column: Documented Demo Credentials & 1-Click Role Access */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-teal-700" />
                  <h2 className="text-base font-bold text-slate-900">
                    Documented Demo Accounts
                  </h2>
                </div>
                <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
                  Pre-Seeded Data Ready
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Click <strong>1-Click Launch</strong> on any account below to enter that dashboard
                immediately, or click <strong>Fill Form</strong> to test the email/password login
                flow. Both dashboards share synchronized data.
              </p>

              <div className="space-y-3">
                {DEMO_ACCOUNTS.map((acc) => (
                  <div
                    key={acc.uid}
                    className={`p-4 rounded-xl border transition-all ${
                      selectedRoleTab === acc.role
                        ? 'border-slate-900 bg-slate-50/70'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div>
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-teal-50 text-teal-800 border-teal-200">
                          {acc.label}
                        </span>
                        <div className="text-sm font-bold text-slate-900 mt-1">
                          {acc.fullName}{' '}
                          <span className="font-mono-tabular text-xs font-semibold text-slate-500">
                            ({acc.employeeId})
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {acc.departmentName} · {acc.designation}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => selectDemoAccount(acc)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer"
                        >
                          Fill Form
                        </button>
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={() => handleDirectDemoLogin(acc.role)}
                          className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <span>1-Click Launch</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/70 text-[11px] font-mono-tabular">
                      <div className="text-slate-600">
                        Email: <span className="font-semibold text-slate-900">{acc.email}</span>
                      </div>
                      <div className="text-slate-600">
                        Password:{' '}
                        <span className="font-semibold text-slate-900">{acc.password}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
                <strong className="text-slate-800">Architecture & Security Note:</strong> Demo
                accounts above use browser LocalStorage persistence for instant evaluation and
                cross-role state synchronization without external setup. Note that LocalStorage
                demonstration sessions are for project testing and do not replace production server
                authentication (which is also supported via Google Workspace & Cloud Firestore).
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-slate-400">
        WorkNest Employee & Leave Management System · Connected Multi-Role Portal
      </footer>
    </div>
  );
};

// ============================================================================
// 3. PUBLIC EMPLOYEE REGISTRATION PAGE (Ordinary Employee Role Only)
// ============================================================================

export const RegisterPage: React.FC = () => {
  const { setCurrentRoute, registerEmployee, departments } = useWorkNest();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || 'dept-eng');
  const [designation, setDesignation] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (fullName.trim().length < 2) {
      setErrorMsg('Please enter your full legal name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg('Please enter a valid corporate email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Password and Confirm Password do not match.');
      return;
    }
    if (contactNumber.trim().length < 7) {
      setErrorMsg('Please provide a valid contact phone number.');
      return;
    }
    if (designation.trim().length < 2) {
      setErrorMsg('Please enter your job designation / role title.');
      return;
    }

    const chosenDept = departments.find((d) => d.id === departmentId);

    setSubmitting(true);
    try {
      await registerEmployee({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        contactNumber: contactNumber.trim(),
        employeeId: employeeId.trim(),
        departmentId,
        departmentName: chosenDept ? chosenDept.name : 'Platform Engineering',
        designation: designation.trim(),
      });
    } catch (err) {
      const code = err instanceof Error ? err.message : '';
      if (code.includes('email-already-in-use')) {
        setErrorMsg('This email address is already registered. Please sign in instead.');
      } else {
        setErrorMsg(err instanceof Error ? err.message : 'Registration failed.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentRoute('welcome')}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Welcome</span>
          </button>
          <WorkNestLogo size="sm" />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-xs p-8">
          <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Employee Onboarding Registration</h1>
              <p className="text-sm text-slate-500 mt-1">
                Create your WorkNest employee profile. Self-registration creates a standard
                Employee account only.
              </p>
            </div>
            <div className="px-3 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold shrink-0">
              Role: Employee
            </div>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jordan Rivera"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Corporate Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jordan.rivera@worknest.io"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Contact Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="+1 (555) 390-1122"
                    className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Employee ID (Optional if assigned)
                </label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="Auto-generated if left blank"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-slate-900 font-mono-tabular"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Department *
                </label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-slate-900 bg-white"
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Designation / Job Title *
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Cloud Systems Analyst"
                    className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-3.5 pr-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                <span>{submitting ? 'Creating Employee Account...' : 'Complete Registration'}</span>
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
            Already have a WorkNest account?{' '}
            <button
              type="button"
              onClick={() => setCurrentRoute('login')}
              className="font-semibold text-teal-700 hover:text-teal-800 cursor-pointer"
            >
              Sign In Here
            </button>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-slate-400">
        WorkNest Employee & Leave Management System · Role-Governed Onboarding
      </footer>
    </div>
  );
};
