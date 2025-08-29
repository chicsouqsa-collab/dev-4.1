
import { EnrichedProduct } from '../types';

const DB_KEY = 'productDataLibrary';

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
