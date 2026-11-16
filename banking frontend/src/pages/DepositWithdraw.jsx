import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Coins,
} from 'lucide-react';

const DepositWithdraw = () => {
  const { account, refreshAccount } = useAuth();
  const [activeTab, setActiveTab] = useState('deposit'); // 'deposit' or 'withdraw'
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState('');

  const presetAmounts = [50, 100, 250, 500, 1000];

  const handleAction = async (e) => {
    e.preventDefault();
    setError('');
    setMessage(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return setError('Please enter a valid positive amount.');
    }

    if (activeTab === 'withdraw' && numAmount > parseFloat(account?.balance || 0)) {
      return setError('Cannot withdraw more than your available balance.');
    }

    setLoading(true);

    try {
      const endpoint = activeTab === 'deposit' ? '/transactions/deposit' : '/transactions/withdraw';
      const res = await api.post(endpoint, {
        amount: numAmount,
        description: description || (activeTab === 'deposit' ? 'Cash Top-up' : 'ATM Cash Withdrawal'),
      });

      if (res.data.success) {
        setMessage(res.data.message);
        setAmount('');
        setDescription('');
        await refreshAccount();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentBalance = parseFloat(account?.balance || 0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-sky-600 text-white shadow-md shadow-sky-600/30">
            <Coins className="w-6 h-6" />
          </div>
          Deposit & Withdraw
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Simulate ATM deposits and withdrawals to test balance flow and financial statements.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md">
        
        {/* Available Balance Pill */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wallet className="w-5 h-5 text-sky-600" />
            <div>
              <div className="text-xs text-slate-500 font-medium">Current Account Balance</div>
              <div className="text-lg font-bold text-slate-900 font-mono">
                ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-500">#{account?.accountNumber}</span>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('deposit');
              setError('');
              setMessage(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'deposit'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowDownToLine className="w-4 h-4 text-emerald-600" />
            <span>Deposit Cash</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('withdraw');
              setError('');
              setMessage(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'withdraw'
                ? 'bg-white text-amber-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowUpFromLine className="w-4 h-4 text-amber-600" />
            <span>Withdraw Cash</span>
          </button>
        </div>

        {/* Success Alert */}
        {message && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-emerald-800">{message}</p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-rose-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleAction} className="space-y-6">
          
          {/* Preset Chips */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Quick Presets
            </label>
            <div className="grid grid-cols-5 gap-2">
              {presetAmounts.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset.toString())}
                  className={`py-2 text-xs font-bold font-mono rounded-xl border transition-all ${
                    amount === preset.toString()
                      ? 'border-sky-500 bg-sky-50 text-sky-700'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  ${preset}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              {activeTab === 'deposit' ? 'Deposit Amount ($)' : 'Withdrawal Amount ($)'}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-slate-400 font-bold text-lg">$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="block w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-base font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Note Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Description / Memo</label>
            <input
              type="text"
              placeholder={activeTab === 'deposit' ? 'e.g. Salary, Side hustle' : 'e.g. Groceries, Coffee'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 px-4 rounded-xl shadow-md text-sm font-semibold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
              activeTab === 'deposit'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : activeTab === 'deposit' ? (
              <>
                <ArrowDownToLine className="w-4 h-4" />
                <span>Confirm Deposit</span>
              </>
            ) : (
              <>
                <ArrowUpFromLine className="w-4 h-4" />
                <span>Confirm Withdrawal</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};

export default DepositWithdraw;

