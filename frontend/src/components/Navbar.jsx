import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, Shield, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2 text-xl font-bold text-indigo-400">
        <BookOpen className="w-6 h-6 text-indigo-500" />
        <span>SkillForge</span>
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="flex items-center gap-1.5 text-xs font-semibold bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-full text-slate-300 capitalize">
              {user.role === 'admin' ? (
                <Shield className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <User className="w-3.5 h-3.5 text-indigo-400" />
              )}
              {user.role}
            </span>

            <Link
              to={user.role === 'admin' ? '/admin/dashboard' : '/my-courses'}
              className="text-sm font-medium hover:text-indigo-400 transition"
            >
              {user.role === 'admin' ? 'Admin Panel' : 'My Courses'}
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-sm font-medium transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </>
        ) : (
          <div className="flex gap-3">
            <Link to="/login" className="px-4 py-2 text-sm font-medium hover:text-indigo-400 transition">
              Log in
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition shadow-lg shadow-indigo-600/30"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}