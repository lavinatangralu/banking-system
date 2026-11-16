import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  History,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  FileSpreadsheet,
} from 'lucide-react';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'CREDIT', 'DEBIT'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await api.get('/transactions/history');
        if (res.data.success) {
          setTransactions(res.data.transactions);
        }
      } catch (err) {
        console.error('Failed to load transaction history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Filter transactions based on type and search query
  const filtered = transactions.filter((tx) => {
    const matchesFilter = filterType === 'ALL' || tx.direction === filterType;
    const matchesSearch =
      (tx.description && tx.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tx.counterparty && tx.counterparty.toLowerCase().includes(searchQuery.toLowerCase())) ||
      tx.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Calculate totals
  const totalCredited = transactions
    .filter((tx) => tx.direction === 'CREDIT')
    .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

  const totalDebited = transactions
    .filter((tx) => tx.direction === 'DEBIT')
    .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Title & Summary Stats */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-600 text-white shadow-md shadow-sky-600/30">
              <History className="w-6 h-6" />
            </div>
            Account Statement
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time ledger of all deposits, withdrawals, and account-to-account transfers.
          </p>
        </div>

        {/* Mini stats cards */}
        <div className="flex gap-4">
          <div className="px-4 py-2.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Total Inflow</div>
            <div className="text-lg font-bold text-emerald-800 font-mono">
              +${totalCredited.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="px-4 py-2.5 bg-rose-50 border border-rose-200/80 rounded-2xl">
            <div className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Total Outflow</div>
            <div className="text-lg font-bold text-rose-800 font-mono">
              -${totalDebited.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* Controls: Search and Filter Tabs */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search statements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            {['ALL', 'CREDIT', 'DEBIT'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterType === type
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {type === 'ALL' ? 'All Activity' : type === 'CREDIT' ? 'Money In' : 'Money Out'}
              </button>
            ))}
          </div>

        </div>

        {/* Table Content */}
        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm">Fetching ledger records...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-700">No transactions match your search</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting your filters or make a new transfer.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="py-3.5 px-6">Description & Type</th>
                  <th className="py-3.5 px-6">Counterparty</th>
                  <th className="py-3.5 px-6">Date & Time</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map((tx) => {
                  const isCredit = tx.direction === 'CREDIT';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-xl shrink-0 ${
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

                      <td className="py-4 px-6 text-slate-600 font-medium">
                        {tx.counterparty}
                      </td>

                      <td className="py-4 px-6 text-slate-500 text-xs font-mono">
                        {new Date(tx.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {tx.status}
                        </span>
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

export default Transactions;

