import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { LayoutGrid, Power, Sun, LineChart } from 'lucide-react';

export function Layout({ children, signOut }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          <div className="p-6">
            <div className="flex items-center gap-2">
              <Sun className="h-8 w-8 text-blue-500" />
              <span className="text-xl font-bold">Solar Dashboard</span>
            </div>
          </div>

          <nav className="flex-1 p-4">
            <div className="space-y-1">
              <Link
                to="/"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  location.pathname === '/'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <LayoutGrid className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/benchmarks"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  location.pathname === '/benchmarks'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <LineChart className="h-5 w-5" />
                <span>Benchmarks</span>
              </Link>
            </div>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 w-full text-left text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              <Power className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}