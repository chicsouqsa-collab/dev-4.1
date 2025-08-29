
import React from 'react';

const HistoryPage: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Enriched Listings History</h1>
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-200">History Feature Coming Soon</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">This section will display a log of all your past enrichment batches.</p>
      </div>
    </div>
  );
};

export default HistoryPage;