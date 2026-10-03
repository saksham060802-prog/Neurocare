import React from 'react';
import { User } from 'firebase/auth';
import { LogIn, LogOut, CheckCircle2 } from 'lucide-react';

interface GoogleAuthButtonProps {
  user: User | null;
  isLoading: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  compact?: boolean;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  user,
  isLoading,
  onSignIn,
  onSignOut,
  compact = false,
}) => {
  if (user) {
    if (compact) {
      return (
        <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-medium">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || 'User'} className="w-5 h-5 rounded-full" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          )}
          <span className="truncate max-w-[100px] sm:max-w-[140px] font-semibold">{user.displayName || user.email}</span>
          <button
            onClick={onSignOut}
            title="Sign out of Google"
            className="p-1 hover:bg-emerald-100 rounded-full text-emerald-700 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl shadow-xs">
        <div className="flex items-center space-x-3">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || 'User'} className="w-10 h-10 rounded-full border border-emerald-300" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-lg">
              {user.displayName ? user.displayName[0] : 'U'}
            </div>
          )}
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-stone-900 text-sm">{user.displayName || 'Connected User'}</span>
              <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-md text-[10px] font-bold uppercase tracking-wider">
                Google Connected
              </span>
            </div>
            <p className="text-xs text-stone-600 truncate max-w-[200px] sm:max-w-[300px]">{user.email}</p>
          </div>
        </div>

        <button
          onClick={onSignOut}
          className="flex items-center space-x-1.5 px-3 py-2 text-xs font-bold text-stone-700 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-all shadow-2xs"
        >
          <LogOut className="w-3.5 h-3.5 text-stone-500" />
          <span>Sign Out</span>
        </button>
      </div>
    );
  }

  // Official Standard Google Sign-In button styling as mandated by Google guidelines & skill
  return (
    <button
      onClick={onSignIn}
      disabled={isLoading}
      className={`relative inline-flex items-center justify-center font-sans text-stone-700 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl shadow-xs hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer ${
        compact ? 'px-3 py-1.5 text-xs font-semibold' : 'w-full py-3 px-4 text-sm font-bold'
      }`}
    >
      <div className="flex items-center space-x-3">
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 48 48">
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
          />
          <path
            fill="#FBBC05"
            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
          />
        </svg>
        <span>{isLoading ? 'Connecting Google Account...' : 'Sign in with Google'}</span>
      </div>
    </button>
  );
};
