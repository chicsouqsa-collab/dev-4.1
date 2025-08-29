import React, { useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { AppSettings, NormalizationRule } from '../types';
import { DEFAULT_SETTINGS } from '../constants';
import { testApiKey } from '../services/geminiService';

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useLocalStorage<AppSettings>('appSettings', DEFAULT_SETTINGS);
  const [apiKeyStatus, setApiKeyStatus] = useState<{ message: string; ok: boolean } | null>(null);

  const handleTestApiKey = async () => {
    setApiKeyStatus({ message: 'Testing...', ok: false });
    const result = await testApiKey();
    setApiKeyStatus(result);
  };

  const handleRuleChange = (index: number, field: 'from' | 'to', value: string) => {
    const newRules = [...settings.normalizationRules];
    newRules[index][field] = value;
    setSettings(prev => ({ ...prev, normalizationRules: newRules }));
  };

  const addRule = () => {
    const newRule: NormalizationRule = { id: `rule-${Date.now()}`, from: '', to: '' };
    setSettings(prev => ({ ...prev, normalizationRules: [...prev.normalizationRules, newRule] }));
  };
  
  const removeRule = (id: string) => {
    setSettings(prev => ({ ...prev, normalizationRules: prev.normalizationRules.filter(rule => rule.id !== id) }));
  };
  
  const handleInstructionChange = (id: string, value: string) => {
    const newInstructions = settings.aiInstructions.map(inst => 
        inst.id === id ? { ...inst, instruction: value } : inst
    );
    setSettings(prev => ({ ...prev, aiInstructions: newInstructions }));
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Gemini API Key</h2>
        <p className="mb-2 text-gray-600 dark:text-gray-300">
            For security, the Gemini API key must be configured as an environment variable, not entered in the UI.
        </p>
        <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-200 mb-2">
                For local development, create a file named <code className="font-mono text-sm bg-gray-200 dark:bg-gray-700 p-1 rounded">.env.local</code> in the project's root directory.
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-200">
                Add your API key to this file:
            </p>
            <pre className="mt-2 bg-gray-200 dark:bg-gray-700 p-3 rounded-md text-sm text-gray-800 dark:text-gray-100 overflow-x-auto">
                <code>VITE_API_KEY="your-api-key-goes-here"</code>
            </pre>
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                After creating the file, you'll need to restart the development server for the change to take effect. For production deployments, this variable should be set in your hosting provider's settings.
            </p>
        </div>
        <div className="mt-4">
            <button onClick={handleTestApiKey} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Test Connection</button>
            {apiKeyStatus && (
              <p className={`mt-2 text-sm ${apiKeyStatus.ok ? 'text-green-600' : 'text-red-500'}`}>{apiKeyStatus.message}</p>
            )}
        </div>
      </div>

      {/* Dynamic AI Instructions */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Dynamic Sourcing & Enrichment Instructions</h2>
        <div className="space-y-4">
          {settings.aiInstructions.map(instruction => (
            <div key={instruction.id}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{instruction.label} ({instruction.tag})</label>
              <textarea
                value={instruction.instruction}
                onChange={(e) => handleInstructionChange(instruction.id, e.target.value)}
                rows={3}
                className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Normalization Dictionary */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Normalization Dictionary Editor</h2>
        <div className="space-y-2">
          {settings.normalizationRules.map((rule, index) => (
            <div key={rule.id} className="flex items-center space-x-2">
              <input type="text" value={rule.from} onChange={(e) => handleRuleChange(index, 'from', e.target.value)} placeholder="From (e.g., citrus note)" className="w-1/2 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" />
              <span>→</span>
              <input type="text" value={rule.to} onChange={(e) => handleRuleChange(index, 'to', e.target.value)} placeholder="To (e.g., Citrus)" className="w-1/2 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" />
               <button onClick={() => removeRule(rule.id)} className="p-2 text-red-500 hover:text-red-700">&times;</button>
            </div>
          ))}
        </div>
        <button onClick={addRule} className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Add Rule</button>
      </div>

    </div>
  );
};

export default SettingsPage;