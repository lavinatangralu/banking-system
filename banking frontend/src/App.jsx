import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transfer from './pages/Transfer';
import DepositWithdraw from './pages/DepositWithdraw';
import Transactions from './pages/Transactions';

// Layout wrapper for authenticated pages with the top navigation bar
const AuthenticatedLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="py-6 border-t border-slate-200 bg-white text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} Apex Bank. Full-Stack PERN Core Banking System.
      </footer>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Banking Routes */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/"
              element={
                <AuthenticatedLayout>
                  <Dashboard />
                </AuthenticatedLayout>
              }
            />
            <Route
              path="/transfer"
              element={
                <AuthenticatedLayout>
                  <Transfer />
                </AuthenticatedLayout>
              }
            />
            <Route
              path="/deposit-withdraw"
              element={
                <AuthenticatedLayout>
                  <DepositWithdraw />
                </AuthenticatedLayout>
              }
            />
            <Route
              path="/transactions"
              element={
                <AuthenticatedLayout>
                  <Transactions />
                </AuthenticatedLayout>
              }
            />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

