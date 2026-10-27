import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Calendar, Check, Loader2, ShieldCheck } from 'lucide-react';

interface GoogleAuthButtonProps {
  variant?: 'header' | 'wizard' | 'compact';
  onNavigateToBookings?: () => void;
  onNavigateToAdmin?: () => void;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  variant = 'header',
  onNavigateToBookings,
  onNavigateToAdmin,
}) => {
  const { user, isAdmin, loading, signInWithGoogle, signOut } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Sign-in error:', err);
    } finally {
      setSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500" />
        <span className="hidden sm:inline">Checking...</span>
      </div>
    );
  }

  // Google SVG Icon
  const GoogleGIcon = () => (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );

  // Signed In View
  if (user) {
    return (
      <div className="relative inline-block text-left" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-2.5 py-1 sm:py-1.5 rounded-full bg-white border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          title={`Signed in as ${user.displayName || user.email}`}
        >
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-slate-200"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
              {(user.displayName || user.email || 'U')[0].toUpperCase()}
            </div>
          )}
          <span className="text-xs font-bold text-slate-800 max-w-[90px] sm:max-w-[120px] truncate hidden xs:inline">
            {user.displayName?.split(' ')[0] || 'My Account'}
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-xs text-slate-500 font-medium">Signed in with Google</p>
              <p className="text-sm font-bold text-slate-900 truncate mt-0.5">
                {user.displayName || 'Solar Customer'}
              </p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>

            <div className="py-1">
              {onNavigateToBookings && (
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    onNavigateToBookings();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left"
                >
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>My Cleaning Bookings</span>
                </button>
              )}

              {isAdmin && onNavigateToAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    onNavigateToAdmin();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-amber-800 hover:bg-amber-50 transition-colors text-left"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Admin Command Center</span>
                </button>
              )}
            </div>

            <div className="border-t border-slate-100 pt-1">
              <button
                type="button"
                onClick={async () => {
                  setDropdownOpen(false);
                  await signOut();
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Not Signed In - Wizard Variant
  if (variant === 'wizard') {
    return (
      <button
        type="button"
        onClick={handleSignIn}
        disabled={signingIn}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 text-slate-700 font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-98 disabled:opacity-60"
      >
        {signingIn ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>Connecting Google...</span>
          </>
        ) : (
          <>
            <GoogleGIcon />
            <span>1-Click Auto-Fill with Google</span>
          </>
        )}
      </button>
    );
  }

  // Not Signed In - Header Variant
  return (
    <button
      type="button"
      onClick={handleSignIn}
      disabled={signingIn}
      className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-300 text-slate-700 text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95 disabled:opacity-60"
      title="Sign in with your Google Account"
    >
      {signingIn ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
          <span className="hidden sm:inline">Signing in...</span>
        </>
      ) : (
        <>
          <GoogleGIcon />
          <span>Sign In</span>
        </>
      )}
    </button>
  );
};
