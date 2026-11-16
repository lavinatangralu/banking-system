import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  CreditCard,
  Copy,
  Check,
  SendHorizontal,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Clock,
  ShieldCheck,
} from 'lucide-react';

const Dashboard = () => {
  const { user, account, refreshAccount } = useAuth();
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecent = async () => {
    try {
      const res = await api.get('/transactions/history');
      if (res.data.success) {
        setRecentTransactions(res.data.transactions.slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecent();
  }, []);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshAccount(), fetchRecent()]);
    setRefreshing(false);
  };

  const copyAccountNumber = () => {
    if (account?.accountNumber) {
      navigator.clipboard.writeText(account.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const balanceNumber = parseFloat(account?.balance || 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Greeting Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.fullName}! 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Bank-grade 256-bit SSL encrypted session</span>
          </p>
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-slate-500 ${refreshing ? 'animate-spin text-sky-600' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Grid: Virtual Card + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Virtual Bank Card (Hero) */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-tr from-slate-900 via-sky-950 to-slate-900 p-7 sm:p-8 text-white shadow-xl shadow-slate-900/10 border border-slate-800 flex flex-col justify-between min-h-[220px]">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs uppercase tracking-widest text-sky-300 font-semibold">Available Balance</p>
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 text-white">
                ${balanceNumber.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
              <CreditCard className="w-6 h-6 text-sky-300" />
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 relative z-10">
            <div>
              <p className="text-xs text-slate-400 font-medium">Account Number</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-lg font-bold tracking-wider text-slate-100">
                  {account?.accountNumber ? account.accountNumber.replace(/(\d{4})/g, '$1 ').trim() : '•••• •••• ••'}
                </span>
                <button
                  onClick={copyAccountNumber}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
                  title="Copy account number"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                {copied && <span className="text-xs text-emerald-400 font-medium">Copied!</span>}
              </div>
            </div>

            <div className="sm:text-right">
              <p className="text-xs text-slate-400 font-medium">Account Holder</p>
              <p className="text-sm font-semibold text-slate-100 mt-0.5 uppercase tracking-wide">
                {user?.fullName}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between gap-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Quick Actions</h2>
          
          <div className="grid grid-cols-1 gap-3">
            <Link
              to="/transfer"
              className="group flex items-center justify-between p-3.5 rounded-2xl bg-sky-50/60 hover:bg-sky-50 border border-sky-100 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-sky-600 text-white shadow-sm shadow-sky-600/30 group-hover:scale-105 transition-transform">
                  <SendHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Transfer Funds</div>
                  <div className="text-xs text-slate-500">Send money to any account</div>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-sky-600 opacity-60 group-hover:opacity-100 transition-opacity" />
            </Link>

            <Link
              to="/deposit-withdraw"
              className="group flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/60 hover:bg-emerald-50 border border-emerald-100 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 group-hover:scale-105 transition-transform">
                  <ArrowDownToLine className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Deposit Cash</div>
                  <div className="text-xs text-slate-500">Instant test wallet top-up</div>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-emerald-600 opacity-60 group-hover:opacity-100 transition-opacity" />
            </Link>

            <Link
              to="/deposit-withdraw"
              className="group flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/60 hover:bg-amber-50 border border-amber-100 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-600 text-white shadow-sm shadow-amber-600/30 group-hover:scale-105 transition-transform">
                  <ArrowUpFromLine className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Withdraw Cash</div>
                  <div className="text-xs text-slate-500">Simulate ATM payout</div>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-amber-600 opacity-60 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
        </div>

      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-bold text-slate-900">Recent Transactions</h2>
          </div>
          <Link
            to="/transactions"
            className="text-sm font-semibold text-sky-600 hover:text-sky-700 transition-colors"
          >
            View Full Statement &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm">Loading transactions...</p>
          </div>
        ) : recentTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="text-sm">No transactions found yet. Try depositing or transferring funds!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="py-3.5 px-6">Type & Description</th>
                  <th className="py-3.5 px-6">Counterparty</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {recentTransactions.map((tx) => {
                  const isCredit = tx.direction === 'CREDIT';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-xl ${
                              isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                            }`}
                          >
                            {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{tx.description || tx.type}</div>
                            <div className="text-xs text-slate-400 font-mono">{tx.type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-medium">{tx.counterparty}</td>
                      <td className="py-4 px-6 text-slate-500 text-xs font-mono">
                        {new Date(tx.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td
                        className={`py-4 px-6 text-right font-bold font-mono text-base ${
                          isCredit ? 'text-emerald-600' : 'text-slate-900'
                        }`}
                      >
                        {isCredit ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;

