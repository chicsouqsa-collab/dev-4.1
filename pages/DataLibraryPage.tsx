
import React, { useState, useEffect, useMemo } from 'react';
import { EnrichedProduct } from '../types';
import { ENRICHED_PRODUCT_COLUMNS } from '../constants';
import { getFullLibrary, updateProductInLibrary, deleteProductFromLibrary } from '../services/dbService';

const DataLibraryPage: React.FC = () => {
    const [library, setLibrary] = useState<EnrichedProduct[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingProduct, setEditingProduct] = useState<EnrichedProduct | null>(null);

    useEffect(() => {
        setLibrary(getFullLibrary());
    }, []);

    const filteredLibrary = useMemo(() => {
        if (!searchTerm) return library;
        return library.filter(p =>
            Object.values(p).some(val =>
                String(val).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [library, searchTerm]);

    const handleUpdate = (e: React.ChangeEvent<HTMLInputElement>, field: keyof EnrichedProduct) => {
        if (editingProduct) {
            setEditingProduct({ ...editingProduct, [field]: e.target.value });
        }
    };
    
    const handleSave = (productToSave: EnrichedProduct) => {
        updateProductInLibrary(productToSave);
        setLibrary(prev => prev.map(p => p.id === productToSave.id ? productToSave : p));
        setEditingProduct(null);
    };

    const handleDelete = (productId: string) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            deleteProductFromLibrary(productId);
            setLibrary(prev => prev.filter(p => p.id !== productId));
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Data Library</h1>
            <input
                type="text"
                placeholder="Search library..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-1/3 p-2 border border-gray-300 dark:border-gray-600 rounded-md mb-4 bg-white dark:bg-gray-700"
            />
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                            {ENRICHED_PRODUCT_COLUMNS.map(col => (
                                <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredLibrary.map(product => (
                            <tr key={product.id}>
                               <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {editingProduct?.id === product.id ? (
                                        <button onClick={() => handleSave(editingProduct)} className="text-indigo-600 hover:text-indigo-900">Save</button>
                                    ) : (
                                        <button onClick={() => setEditingProduct({ ...product })} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                    )}
                                    <button onClick={() => handleDelete(product.id)} className="ml-4 text-red-600 hover:text-red-900">Delete</button>
                                </td>
                                {ENRICHED_PRODUCT_COLUMNS.map(col => (
                                    <td key={`${product.id}-${col}`} className="px-6 py-4 whitespace-nowrap text-sm">
                                        {editingProduct?.id === product.id ? (
                                            <input
                                                type="text"
                                                value={editingProduct[col as keyof EnrichedProduct] as string || ''}
                                                onChange={(e) => handleUpdate(e, col as keyof EnrichedProduct)}
                                                className="w-48 bg-transparent border border-gray-300 dark:border-gray-600 rounded-md p-1"
                                            />
                                        ) : (
                                            <span className="text-gray-900 dark:text-gray-200">{product[col as keyof EnrichedProduct]}</span>
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
