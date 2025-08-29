
import { BaseProduct, EnrichedProduct } from '../types';

export const parseCSV = (fileContent: string): Promise<BaseProduct[]> => {
  return new Promise((resolve, reject) => {
    try {
      const rows = fileContent.trim().split('\n');
      if (rows.length < 2) {
        return reject(new Error('CSV file must have a header and at least one data row.'));
      }
      
      const header = rows[0].split(',').map(h => h.trim());
      const requiredHeaders = ['Name', 'Size', 'Shade'];
      const missingHeaders = requiredHeaders.filter(rh => !header.includes(rh));

      if (missingHeaders.length > 0) {
        return reject(new Error(`CSV is missing required headers: ${missingHeaders.join(', ')}`));
      }

      const products: BaseProduct[] = rows.slice(1).map((row, index) => {
        const values = row.split(',');
        const productData: any = { id: `product-${Date.now()}-${index}` };
        header.forEach((h, i) => {
          productData[h] = values[i]?.trim() || '';
        });
        return productData as BaseProduct;
      });
      
      resolve(products);
    } catch (error) {
      reject(new Error('Failed to parse CSV file.'));
    }
  });
};

const convertToCsvString = (data: any[], columns: string[]): string => {
  const header = columns.join(',');
  const rows = data.map(row => {
    return columns.map(col => {
      const value = row[col] || '';
      const stringValue = String(value);
      // Escape quotes and wrap in quotes if it contains commas or newlines
      if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  });
  return [header, ...rows].join('\n');
};

export const exportStandardCSV = (products: EnrichedProduct[]) => {
    const columns = Object.keys(products[0] || {}).filter(k => k !== 'id' && k !== 'status');
    const csvString = convertToCsvString(products, columns);
    downloadCSV(csvString, 'enriched-products-standard.csv');
};


export const exportWooCommerceCSV = (products: EnrichedProduct[]) => {
    const wooCommerceData = products.map(p => ({
        'ID': '',
        'Type': 'simple',
        'SKU': '',
        'Name': p.Name,
        'Published': '1',
        'Is featured?': '0',
        'Visibility in catalog': 'visible',
        'Short description': p['Short Description'],
        'Description': p['Detailed Description'],
        // Add more mappings as required
        'Regular price': '',
        'Categories': p['Product Category'],
        'Images': p.Image,
        // Example for custom attributes
        'Attribute 1 name': 'Brand',
        'Attribute 1 value(s)': p.Brand,
        'Attribute 1 visible': '1',
        'Attribute 1 global': '1',
        'Attribute 2 name': 'Size',
        'Attribute 2 value(s)': p.Size,
        'Attribute 2 visible': '1',
        'Attribute 2 global': '1',
        'Attribute 3 name': 'Shade',
        'Attribute 3 value(s)': p.Shade,
        'Attribute 3 visible': '1',
        'Attribute 3 global': '1',
    }));

    const columns = Object.keys(wooCommerceData[0]);
    const csvString = convertToCsvString(wooCommerceData, columns);
    downloadCSV(csvString, 'enriched-products-woocommerce.csv');
};


const downloadCSV = (csvString: string, filename: string) => {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};