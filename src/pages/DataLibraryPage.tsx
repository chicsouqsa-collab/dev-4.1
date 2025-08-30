
import React, { useState, useEffect, useMemo } from 'react';
import { EnrichedProduct, AppSettings, StandardizedValues } from '../types';
import { getFullLibrary, updateProductInLibrary, deleteProductFromLibrary, getStandardizedValues, updateStandardizedValues } from '../services/dbService';
import useLocalStorage from '../hooks/useLocalStorage';
import { DEFAULT_SETTINGS, STANDARDIZABLE_FIELDS } from '../constants';
import { exportStandardCSV, exportWooCommerceCSV } from '../services/csvService';
import AutocompleteInput from '../components/AutocompleteInput';

const DataLibraryPage: React.FC = () => {
    const [library, setLibrary] = useState<EnrichedProduct[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingProduct, setEditingProduct] = useState<EnrichedProduct | null>(null);
    const [settings] = useLocalStorage<AppSettings>('appSettings', DEFAULT_SETTINGS);
    const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
    const [standardizedValues, setStandardizedValues] = useState<StandardizedValues>({});

    useEffect(() => {
        setLibrary(getFullLibrary());
        setStandardizedValues(getStandardizedValues());
    }, []);

    const filteredLibrary = useMemo(() => {
        if (!searchTerm) return library;
        return library.filter(p =>
            Object.values(p).some(val =>
                String(val).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [library, searchTerm]);

    const handleUpdate = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        if (editingProduct) {
            setEditingProduct({ ...editingProduct, [field]: e.target.value });
        }
    };
    
    const handleSave = (productToSave: EnrichedProduct) => {
        updateProductInLibrary(productToSave);
        updateStandardizedValues([productToSave]);
        setStandardizedValues(getStandardizedValues());
        setLibrary(prev => prev.map(p => p.id === productToSave.id ? productToSave : p));
        setEditingProduct(null);
    };

    const handleDelete = (productId: string) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            deleteProductFromLibrary(productId);
            setLibrary(prev => prev.filter(p => p.id !== productId));
        }
    };
    
    const handleSelect = (productId: string, isSelected: boolean) => {
        const newSet = new Set(selectedProductIds);
        if (isSelected) {
            newSet.add(productId);
        } else {
            newSet.delete(productId);
        }
        setSelectedProductIds(newSet);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const allVisibleIds = new Set(filteredLibrary.map(p => p.id));
            setSelectedProductIds(allVisibleIds);
        } else {
            setSelectedProductIds(new Set());
        }
    };
    
    const handleExport = (type: 'standard' | 'woocommerce') => {
        const selectedProducts = library.filter(p => selectedProductIds.has(p.id));
        if (selectedProducts.length === 0) {
            alert('Please select products to export.');
            return;
        }
        if (type === 'standard') {
            exportStandardCSV(selectedProducts, settings.productFields);
        } else {
            exportWooCommerceCSV(selectedProducts);
        }
    };

    const areAllSelected = filteredLibrary.length > 0 && selectedProductIds.size === filteredLibrary.length;

    return (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Data Library</h1>
            <div className="flex justify-between items-center mb-4">
                 <input
                    type="text"
                    placeholder="Search library..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-1/3 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                />
                <div className="flex space-x-2">
                    <button onClick={() => handleExport('standard')} disabled={selectedProductIds.size === 0} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400">Export Standard</button>
                    <button onClick={() => handleExport('woocommerce')} disabled={selectedProductIds.size === 0} className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400">Export WooCommerce</button>
                </div>
            </div>
           
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3"><input type="checkbox" onChange={handleSelectAll} checked={areAllSelected} /></th>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                            {settings.productFields.map(col => (
                                <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredLibrary.map(product => (
                            <tr key={product.id}>
                                <td className="px-6 py-4"><input type="checkbox" checked={selectedProductIds.has(product.id)} onChange={(e) => handleSelect(product.id, e.target.checked)} /></td>
                               <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {editingProduct?.id === product.id ? (
                                        <button onClick={() => handleSave(editingProduct)} className="text-indigo-600 hover:text-indigo-900">Save</button>
                                    ) : (
                                        <button onClick={() => setEditingProduct({ ...product })} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                    )}
                                    <button onClick={() => handleDelete(product.id)} className="ml-4 text-red-600 hover:text-red-900">Delete</button>
                                </td>
                                {settings.productFields.map(col => (
                                    <td key={`${product.id}-${col}`} className="px-6 py-4 whitespace-nowrap text-sm">
                                        {editingProduct?.id === product.id ? (
                                            STANDARDIZABLE_FIELDS.includes(col) ? (
                                                <AutocompleteInput
                                                    value={editingProduct[col] || ''}
                                                    onChange={(e) => handleUpdate(e, col)}
                                                    fieldName={col}
                                                    options={standardizedValues[col] || []}
                                                />
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={editingProduct[col] || ''}
                                                    onChange={(e) => handleUpdate(e, col)}
                                                    className="w-48 bg-transparent border border-gray-300 dark:border-gray-600 rounded-md p-1"
                                                />
                                            )
                                        ) : (
                                            <span className="text-gray-900 dark:text-gray-200">{product[col]}</span>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {filteredLibrary.length === 0 && <p className="text-center py-8 text-gray-500">No products found.</p>}
        </div>
    );
};

export default DataLibraryPage;
