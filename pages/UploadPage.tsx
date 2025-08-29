import React, { useState, useCallback } from 'react';
import { BaseProduct, EnrichedProduct, AppSettings } from '../types';
import { ENRICHED_PRODUCT_COLUMNS } from '../constants';
import { parseCSV, exportStandardCSV, exportWooCommerceCSV } from '../services/csvService';
import { enrichProductWithGemini } from '../services/geminiService';
import { findProductInLibrary, saveProductsToLibrary } from '../services/dbService';
import useLocalStorage from '../hooks/useLocalStorage';
import { DEFAULT_SETTINGS } from '../constants';

// Helper function to add a delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const UploadPage: React.FC = () => {
    const [settings] = useLocalStorage<AppSettings>('appSettings', DEFAULT_SETTINGS);
    const [baseProducts, setBaseProducts] = useState<BaseProduct[]>([]);
    const [enrichedProducts, setEnrichedProducts] = useState<EnrichedProduct[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isEnriching, setIsEnriching] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setError(null);
            setBaseProducts([]);
            setEnrichedProducts([]);
            try {
                const content = await file.text();
                const parsedProducts = await parseCSV(content);
                if (parsedProducts.length > 100) {
                    throw new Error("CSV file cannot contain more than 100 products.");
                }
                setBaseProducts(parsedProducts);
            } catch (err: any) {
                setError(err.message);
            }
        }
    };

    const handleEnrichment = useCallback(async () => {
        // FIX: Removed API key check to align with guidelines to assume key is present in environment.
        // The service will throw an error if the key is missing, which is caught below.
        setIsEnriching(true);
        setProgress(0);
        setError(null);

        const initialEnriched = baseProducts.map(p => ({
            ...p,
            'Top Notes': '', 'Middle Notes': '', 'Base Notes': '', 'Fragrance Family': '', Occasion: '', Gender: '', 'Intent of Use': '', Finish: '', Consistency: '', 'Sun Protection': '', 'How to Apply': '', 'Skin Type': '', 'Skincare Concern': '', 'What it Treats / Solves': '', 'Key Ingredients': '', 'Product Category': '', 'Short Description': '', 'Detailed Description': '', Image: '', Gallery: '', Sources: '',
            status: 'pending'
        } as EnrichedProduct));
        setEnrichedProducts(initialEnriched);

        for (let i = 0; i < baseProducts.length; i++) {
            const product = baseProducts[i];
            
            setEnrichedProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: 'enriching' } : p));
            
            try {
                const existingProduct = findProductInLibrary(product.Name, product.Brand, product.Size, product.Shade);
                if (existingProduct) {
                    setEnrichedProducts(prev => prev.map(p => p.id === product.id ? { ...existingProduct, status: 'enriched' } : p));
                } else {
                    const enrichedData = await enrichProductWithGemini(product, settings);
                    setEnrichedProducts(prev => prev.map(p => p.id === product.id ? { ...p, ...enrichedData, status: 'enriched' } : p));
                    
                    // FIX: Increased delay to 5 seconds to further prevent rate limit errors.
                    // This allows for a maximum of 12 requests per minute.
                    if (i < baseProducts.length - 1) {
                        await sleep(5000);
                    }
                }
            } catch (err: any) {
                let userFriendlyError = `Failed to enrich ${product.Name}: ${err.message}`;
                 // The error message from the service is now pre-parsed and cleaner.
                // This check provides extra context for the user for rate limit issues.
                if (err.message && err.message.toLowerCase().includes('quota')) {
                    userFriendlyError = `Rate limit exceeded: "${err.message}". The app waits between requests to prevent this. Please wait a minute before trying again or check your API plan limits.`;
                }
                setError(userFriendlyError);
                setEnrichedProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: 'failed' } : p));
                
                // FIX: Increased delay to 5 seconds to further prevent rate limit errors.
                // Also wait after a failed API call to avoid hammering a potentially failing service.
                if (i < baseProducts.length - 1) {
                    await sleep(5000);
                }
            } finally {
                setProgress(((i + 1) / baseProducts.length) * 100);
            }
        }

        setIsEnriching(false);
    }, [baseProducts, settings]);
    
    const handleSaveToLibrary = () => {
        const productsToSave = enrichedProducts.filter(p => p.status === 'enriched');
        saveProductsToLibrary(productsToSave);
        alert(`${productsToSave.length} products saved to the library.`);
    };

    const handleUpdateProduct = (updatedProduct: EnrichedProduct) => {
        setEnrichedProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">1. Upload Product CSV</h2>
                <input type="file" accept=".csv" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                {error && <p className="text-red-500 mt-2">{error}</p>}
                {baseProducts.length > 0 && <p className="text-green-600 mt-2">{baseProducts.length} products loaded successfully.</p>}
            </div>

            {baseProducts.length > 0 && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4">2. Enrich Data</h2>
                    <button onClick={handleEnrichment} disabled={isEnriching || enrichedProducts.length > 0} className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                        {isEnriching ? 'Enriching...' : 'Start Enrichment'}
                    </button>
                </div>
            )}

            {isEnriching && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold">Enrichment Progress</h3>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                        <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{Math.round(progress)}% Complete</p>
                </div>
            )}

            {enrichedProducts.length > 0 && !isEnriching && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4">3. Preview, Edit & Export</h2>
                    <div className="flex space-x-4 mb-4">
                        <button onClick={handleSaveToLibrary} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Approve & Save to DB</button>
                        <button onClick={() => exportStandardCSV(enrichedProducts)} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Export Standard CSV</button>
                        <button onClick={() => exportWooCommerceCSV(enrichedProducts)} className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">Export WooCommerce CSV</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                           <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                    {ENRICHED_PRODUCT_COLUMNS.map(col => (
                                        <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">{col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {enrichedProducts.map(product => (
                                    <tr key={product.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {product.status === 'enriched' && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Enriched</span>}
                                            {product.status === 'enriching' && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Enriching</span>}
                                            {product.status === 'failed' && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Failed</span>}
                                            {product.status === 'pending' && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Pending</span>}
                                        </td>
                                        {ENRICHED_PRODUCT_COLUMNS.map(col => (
                                            <td key={`${product.id}-${col}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                                               <input 
                                                    type="text" 
                                                    value={product[col as keyof EnrichedProduct] as string || ''}
                                                    onChange={(e) => handleUpdateProduct({ ...product, [col]: e.target.value })}
                                                    className="w-48 bg-transparent border border-gray-300 dark:border-gray-600 rounded-md p-1 focus:ring-indigo-500 focus:border-indigo-500"
                                               />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UploadPage;