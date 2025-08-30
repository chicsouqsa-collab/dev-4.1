
import React, { useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { AppSettings, NormalizationRule, AiInstruction } from '../types';
import { DEFAULT_SETTINGS, CORE_FIELDS } from '../constants';
import { testApiKey } from '../services/geminiService';

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useLocalStorage<AppSettings>('appSettings', DEFAULT_SETTINGS);
  const [apiKeyStatus, setApiKeyStatus] = useState<{ message: string; ok: boolean } | null>(null);
  const [newFieldName, setNewFieldName] = useState('');

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

  const handleAddField = () => {
      if (!newFieldName || settings.productFields.includes(newFieldName)) {
          alert("Field name cannot be empty and must be unique.");
          return;
      }

      const newFields = [...settings.productFields, newFieldName];
      const newInstructionId = `${newFieldName.toUpperCase().replace(/\s/g, '_')}_FORMAT`;
      const newInstruction: AiInstruction = {
          id: newInstructionId,
          tag: `[${newInstructionId}]`,
          label: `${newFieldName} Format`,
          instruction: `Provide details for ${newFieldName}.`
      };
      const newInstructions = [...settings.aiInstructions, newInstruction];

      setSettings(prev => ({
          ...prev,
          productFields: newFields,
          aiInstructions: newInstructions,
      }));
      setNewFieldName('');
  };

  const handleRemoveField = (fieldName: string) => {
      if (CORE_FIELDS.includes(fieldName)) {
          alert("Cannot remove a core field.");
          return;
      }
      const newFields = settings.productFields.filter(f => f !== fieldName);
      const instructionIdToRemove = `${fieldName.toUpperCase().replace(/\s/g, '_')}_FORMAT`;
      const newInstructions = settings.aiInstructions.filter(inst => inst.id !== instructionIdToRemove);
      
      setSettings(prev => ({
          ...prev,
          productFields: newFields,
          aiInstructions: newInstructions,
      }));
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Gemini API Key</h2>
        <p className="mb-2 text-gray-600 dark:text-gray-300">
            For security, the Gemini API key must be configured as an environment variable (`API_KEY`), not entered in the UI.
        </p>
        <div className="mt-4">
            <button onClick={handleTestApiKey} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Test Connection</button>
            {apiKeyStatus && (
              <p className={`mt-2 text-sm ${apiKeyStatus.ok ? 'text-green-600' : 'text-red-500'}`}>{apiKeyStatus.message}</p>
            )}
        </div>
      </div>

      {/* Manage Product Fields */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Manage Product Fields</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Add or remove fields to be enriched by the AI. Core fields cannot be removed.</p>
        <div className="space-y-2">
            {settings.productFields.map(field => (
                <div key={field} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <span className="font-medium">{field}</span>
                    <button 
                        onClick={() => handleRemoveField(field)} 
                        disabled={CORE_FIELDS.includes(field)}
                        className="p-1 text-red-500 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed text-xl font-bold">&times;</button>
                </div>
            ))}
        </div>
        <div className="flex items-center space-x-2 mt-4">
            <input 
                type="text" 
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                placeholder="New field name"
                className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
            />
            <button onClick={handleAddField} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Add Field</button>
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
