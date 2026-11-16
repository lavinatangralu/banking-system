import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Landmark,
  LayoutDashboard,
  SendHorizontal,
  ArrowDownUp,
  History,
  LogOut,
  Wallet,
} from 'lucide-react';

const Navbar = () => {
  const { user, account, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Transfer', path: '/transfer', icon: SendHorizontal },
    { name: 'Deposit & Withdraw', path: '/deposit-withdraw', icon: ArrowDownUp },
    { name: 'History', path: '/transactions', icon: History },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & App Name */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 text-slate-900 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
                <Landmark className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight tracking-tight text-slate-900">Apex Bank</span>
                <span className="text-[10px] font-semibold text-sky-600 uppercase tracking-widest">Core Digital</span>
              </div>
            </Link>

            {/* Nav links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-sky-50 text-sky-700 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User profile & Quick Balance Pill */}
          <div className="flex items-center gap-4">
            {account && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200/60 rounded-full">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-800">
                  ${parseFloat(account.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}

            <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-slate-900">{user?.fullName}</div>
                <div className="text-xs text-slate-500 font-mono">#{account?.accountNumber}</div>
              </div>

              <button
                onClick={logout}
                title="Logout"
                className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Mobile nav subbar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-100 py-2 bg-slate-50/50">
        {navLinks.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-2 ${
                isActive ? 'text-sky-600 font-semibold' : 'text-slate-500'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;

