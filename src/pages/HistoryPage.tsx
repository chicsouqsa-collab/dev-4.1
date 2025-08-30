
import React, { useState, useEffect } from 'react';
import { HistoryBatch } from '../types';
import { getHistory, clearHistory } from '../services/dbService';
import useLocalStorage from '../hooks/useLocalStorage';
import { AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../constants';

const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<HistoryBatch[]>([]);
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);
  const [settings] = useLocalStorage<AppSettings>('appSettings', DEFAULT_SETTINGS);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear the entire enrichment history? This action cannot be undone.")) {
      clearHistory();
      setHistory([]);
    }
  };

  const toggleBatchDetails = (batchId: string) => {
    setExpandedBatchId(prevId => prevId === batchId ? null : batchId);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Enriched Listings History</h1>
        {history.length > 0 && (
          <button onClick={handleClearHistory} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
            Clear History
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-200">No History Found</h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Complete an enrichment on the 'Upload New' page to see its summary here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map(batch => (
            <div key={batch.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700" onClick={() => toggleBatchDetails(batch.id)}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-lg text-gray-800 dark:text-gray-200">Batch from {new Date(batch.date).toLocaleString()}</p>
                    <div className="flex space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <span>Total: {batch.totalProducts}</span>
                      <span className="text-green-600">Enriched: {batch.enrichedCount}</span>
                      <span className="text-red-600">Failed: {batch.failedCount}</span>
                    </div>
                  </div>
                  <svg className={`w-6 h-6 transform transition-transform ${expandedBatchId === batch.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
              {expandedBatchId === batch.id && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        {settings.productFields.map(col => (
                          <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {batch.products.map(product => (
                        <tr key={product.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                              {product.status === 'enriched' && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Enriched</span>}
                              {product.status === 'failed' && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Failed</span>}
                          </td>
                          {settings.productFields.map(col => (
                            <td key={`${product.id}-${col}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200 max-w-xs truncate">{product[col]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
