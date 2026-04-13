import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard,
  Users,
  Calendar,
  AlertCircle,
  CreditCard,
  FileText,
  Settings,
  LogOut,
} from 'lucide-react';

export function Sidebar() {
  const location = useLocation();
  const { signOut } = useAuthStore();

  const links = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/riders', label: 'Riders', icon: Users },
    { path: '/leaves', label: 'Leaves', icon: Calendar },
    { path: '/fines', label: 'Fines', icon: AlertCircle },
    { path: '/payments', label: 'Payments', icon: CreditCard },
    { path: '/reports', label: 'Reports', icon: FileText },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
          Rear
        </h1>
        <p className="text-slate-400 text-sm mt-1">HR Management Portal</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-6">
        {links.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all duration-200 ${
              isActive(path)
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-slate-700">
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-700 rounded-lg transition-all duration-200"
        >
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
