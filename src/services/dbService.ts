
import { EnrichedProduct, HistoryBatch, StandardizedValues } from '../types';
import { STANDARDIZABLE_FIELDS } from '../constants';

const DB_KEY = 'productDataLibrary';
const HISTORY_KEY = 'productEnrichmentHistory';
const STANDARDIZED_VALUES_KEY = 'standardizedValues';

// --- Data Library ---

const getLibrary = (): EnrichedProduct[] => {
  try {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to parse data library from localStorage', error);
    return [];
  }
};

const saveLibrary = (library: EnrichedProduct[]) => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(library));
  } catch (error) {
    console.error('Failed to save data library to localStorage', error);
  }
};

export const findProductInLibrary = (name: string, brand?: string, size?: string, shade?: string): EnrichedProduct | null => {
  const library = getLibrary();
  return library.find(p => 
    p.Name.toLowerCase() === name.toLowerCase() &&
    p.Brand?.toLowerCase() === brand?.toLowerCase() &&
    p.Size === size &&
    p.Shade === shade
  ) || null;
};

export const saveProductsToLibrary = (products: EnrichedProduct[]) => {
  const library = getLibrary();
  const newLibrary = [...library];
  
  products.forEach(newProduct => {
    const index = newLibrary.findIndex(p => p.id === newProduct.id);
    if (index > -1) {
      newLibrary[index] = newProduct;
    } else {
      newLibrary.push(newProduct);
    }
  });

  saveLibrary(newLibrary);
};

export const getFullLibrary = (): EnrichedProduct[] => {
  return getLibrary();
};

export const updateProductInLibrary = (updatedProduct: EnrichedProduct) => {
  const library = getLibrary();
  const index = library.findIndex(p => p.id === updatedProduct.id);
  if (index > -1) {
    library[index] = updatedProduct;
    saveLibrary(library);
  }
};

export const deleteProductFromLibrary = (productId: string) => {
  let library = getLibrary();
  library = library.filter(p => p.id !== productId);
  saveLibrary(library);
};


// --- History Service ---

export const getHistory = (): HistoryBatch[] => {
    try {
        const data = localStorage.getItem(HISTORY_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Failed to parse history from localStorage', error);
        return [];
    }
};

export const saveBatchToHistory = (batch: HistoryBatch) => {
    try {
        const history = getHistory();
        history.unshift(batch); // Add new batch to the beginning
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
        console.error('Failed to save history to localStorage', error);
    }
};

export const clearHistory = () => {
    try {
        localStorage.removeItem(HISTORY_KEY);
    } catch (error) {
        console.error('Failed to clear history from localStorage', error);
    }
};


// --- Standardized Values Service ---

export const getStandardizedValues = (): StandardizedValues => {
    try {
        const data = localStorage.getItem(STANDARDIZED_VALUES_KEY);
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error('Failed to parse standardized values from localStorage', error);
        return {};
    }
};

export const updateStandardizedValues = (products: EnrichedProduct[]) => {
    try {
        const currentValues = getStandardizedValues();
        let updated = false;

        products.forEach(product => {
            STANDARDIZABLE_FIELDS.forEach(field => {
                const value = product[field];
                if (value && typeof value === 'string' && value.toLowerCase() !== 'n/a') {
                    if (!currentValues[field]) {
                        currentValues[field] = [];
                    }
                    if (!currentValues[field].includes(value)) {
                        currentValues[field].push(value);
                        currentValues[field].sort();
                        updated = true;
                    }
                }
            });
        });

        if (updated) {
            localStorage.setItem(STANDARDIZED_VALUES_KEY, JSON.stringify(currentValues));
        }
    } catch (error) {
        console.error('Failed to update standardized values in localStorage', error);
    }
};