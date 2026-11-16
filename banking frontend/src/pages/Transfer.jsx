import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  SendHorizontal,
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  Wallet,
} from 'lucide-react';

const Transfer = () => {
  const { account, refreshAccount } = useAuth();
  const navigate = useNavigate();

  const [recipientNumber, setRecipientNumber] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState('');

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  // Debounced lookup when user finishes typing a 10-digit account number
  useEffect(() => {
    const cleanNumber = recipientNumber.trim();
    if (cleanNumber.length >= 8) {
      const timer = setTimeout(async () => {
        setLookingUp(true);
        setLookupError('');
        setRecipientName('');

        try {
          const res = await api.get(`/account/lookup/${cleanNumber}`);
          if (res.data.success) {
            setRecipientName(res.data.recipient.fullName);
          }
        } catch (err) {
          setLookupError(err.response?.data?.message || 'Recipient account not found');
          setRecipientName('');
        } finally {
          setLookingUp(false);
        }
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setRecipientName('');
      setLookupError('');
    }
  }, [recipientNumber]);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return setError('Please enter a valid positive transfer amount.');
    }

    if (numAmount > parseFloat(account?.balance || 0)) {
      return setError('Insufficient available balance for this transfer.');
    }

    setSubmitting(true);

    try {
      const res = await api.post('/transactions/transfer', {
        recipientAccountNumber: recipientNumber.trim(),
        amount: numAmount,
        description: description || `Transfer to ${recipientName || recipientNumber}`,
      });

      if (res.data.success) {
        setSuccessData(res.data);
        await refreshAccount();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Transfer failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const setAmountPercent = (percentage) => {
    const total = parseFloat(account?.balance || 0);
    const calculated = (total * percentage).toFixed(2);
    setAmount(calculated);
  };

  const currentBalance = parseFloat(account?.balance || 0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-sky-600 text-white shadow-md shadow-sky-600/30">
            <SendHorizontal className="w-6 h-6" />
          </div>
          Transfer Funds
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Instantly transfer money to any registered bank account using ACID-protected transactions.
        </p>
      </div>

      {successData ? (
        /* Transfer Receipt View */
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-lg text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Transaction Completed
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-3">
              ${parseFloat(amount).toFixed(2)}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Sent to <strong className="text-slate-800">{recipientName}</strong> (#{recipientNumber})
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 text-left space-y-2 border border-slate-100 text-xs text-slate-600 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Transaction ID:</span>
              <span className="font-bold text-slate-800">{successData.transaction?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Updated Balance:</span>
              <span className="font-bold text-emerald-600">${parseFloat(successData.newBalance).toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setSuccessData(null);
                setRecipientNumber('');
                setRecipientName('');
                setAmount('');
                setDescription('');
              }}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-sm transition-colors"
            >
              Make Another Transfer
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-md"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      ) : (
        /* Transfer Form */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md">
          
          {/* Available balance banner */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-sky-600" />
              <div>
                <div className="text-xs text-slate-500 font-medium">Your Available Balance</div>
                <div className="text-lg font-bold text-slate-900 font-mono">
                  ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
            <div className="text-xs font-mono text-slate-500">
              #{account?.accountNumber}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-rose-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleTransfer} className="space-y-6">
            
            {/* Recipient Account Input & Live Verification */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Recipient Account Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. 1012345678"
                  value={recipientNumber}
                  onChange={(e) => setRecipientNumber(e.target.value)}
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                />
                {lookingUp && (
                  <div className="absolute right-3.5 top-3.5">
                    <div className="w-5 h-5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {/* Real-time Recipient Badge */}
              {recipientName && (
                <div className="mt-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-2.5 text-xs text-emerald-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Verified Account Holder: <strong className="font-bold uppercase tracking-wide">{recipientName}</strong>
                  </span>
                </div>
              )}

              {lookupError && (
                <div className="mt-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-800 font-medium">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{lookupError}</span>
                </div>
              )}
            </div>

            {/* Amount input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-semibold text-slate-700">Amount to Transfer ($)</label>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAmountPercent(0.25)}
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  >
                    25%
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmountPercent(0.5)}
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmountPercent(1)}
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  >
                    MAX
                  </button>
                </div>
              </div>

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

            {/* Note / Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Note / Reference (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Rent, Freelance Payment, Dinner split"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || (recipientNumber.length >= 8 && !!lookupError)}
              className="w-full py-3.5 px-4 rounded-xl shadow-md text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Send Money Securely</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>
      )}

    </div>
  );
};

export default Transfer;

