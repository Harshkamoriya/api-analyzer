import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { TestRun } from '@/types';

export default async function Dashboard() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Authentication Required</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">Please sign in to view your API test dashboard.</p>
          <Link href="/" className="btn-primary text-white px-6 py-3 rounded-lg font-medium">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

const tests = await prisma.testRun.findMany({
  where: { userId },
  orderBy: { createdAt: 'desc' },
  take: 50,
  select: {
    id: true,
    userId: true,
    url: true,
    method: true,
    avgLatency: true,
    minLatency: true,
    maxLatency: true,
    statusCodes: true,
    createdAt: true,
    aiTips: true
  }
});



  const totalTests = tests.length;
const avgResponseTime = tests.length > 0 
  ? tests.reduce((sum: number, test: TestRun) => sum + test.avgLatency, 0) / tests.length 
  : 0;

const successfulTests = tests.filter((test: TestRun) => 
  test.statusCodes && Object.keys(test.statusCodes).some(code => code.startsWith('2'))
).length;

  const successRate = totalTests > 0 ? (successfulTests / totalTests) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">API Test Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-300">Monitor and analyze your API performance tests</p>
          </div>
          <Link href="/new-test">
            <button className="btn-primary text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 mt-4 md:mt-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>New Test</span>
            </button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Tests</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{totalTests}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Avg Response</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{avgResponseTime.toFixed(0)}ms</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Success Rate</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{successRate.toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">This Month</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{totalTests}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Recent API Tests</h2>
          </div>
          
          {tests.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No tests yet</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">Start by creating your first API performance test.</p>
              <Link href="/new-test">
                <button className="btn-primary text-white px-6 py-3 rounded-lg font-medium">
                  Create First Test
                </button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {tests.map((test :TestRun) => {
                const statusCodes = test.statusCodes ? Object.keys(test.statusCodes) : [];
                const isSuccess = statusCodes.some(code => code.startsWith('2'));
                const isWarning = statusCodes.some(code => code.startsWith('4'));
                const isError = statusCodes.some(code => code.startsWith('5'));
                
                return (
                  <div key={test.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            test.method === 'GET' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' :
                            test.method === 'POST' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' :
                            test.method === 'PUT' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' :
                            test.method === 'DELETE' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200'
                          }`}>
                            {test.method}
                          </span>
                          <span className={`status-indicator ${
                            isSuccess ? 'status-success' : 
                            isWarning ? 'status-warning' : 
                            isError ? 'status-error' : 'status-success'
                          } text-sm font-medium text-slate-900 dark:text-white`}>
                            {test.url}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-slate-500 dark:text-slate-400">Average: </span>
                            <span className="font-semibold text-slate-900 dark:text-white">{test.avgLatency.toFixed(0)}ms</span>
                          </div>
                          <div>
                            <span className="text-slate-500 dark:text-slate-400">Range: </span>
                            <span className="font-semibold text-slate-900 dark:text-white">{test.minLatency}ms - {test.maxLatency}ms</span>
                          </div>
                          <div>
                            <span className="text-slate-500 dark:text-slate-400">Status: </span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {statusCodes.join(', ') || 'N/A'}
                            </span>
                          </div>
                        </div>
                        
                        {test.aiTips && (
                          <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <div className="flex items-start space-x-2">
                              <svg className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                              <div>
                                <p className="text-xs font-medium text-purple-800 dark:text-purple-200 mb-1">AI Recommendation</p>
                                <p className="text-xs text-purple-700 dark:text-purple-300">{test.aiTips.slice(0, 150)}...</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(test.createdAt).toLocaleDateString()} at {new Date(test.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}