import * as XLSX from 'xlsx';
import { Product, Category, Brand, CreateProductInput } from '@/types';

export interface ExcelProductRow {
  SKU: string;
  Name: string;
  Slug?: string;
  Category: string;
  Brand: string;
  Price: number | string;
  CompareAtPrice?: number | string;
  StockQuantity?: number | string;
  Warranty?: string;
  IsFeatured?: boolean | string;
  IsActive?: boolean | string;
  ImageUrl?: string;
  Description: string;
}

/**
 * Export current product catalog to a styled Excel (.xlsx) file.
 */
export function exportProductsToExcel(products: Product[]) {
  const data = products.map((p) => ({
    SKU: p.sku,
    Name: p.name,
    Slug: p.slug,
    Category: p.category?.name || 'Unassigned',
    Brand: p.brand?.name || 'Unassigned',
    'Price (LKR)': Number(p.price),
    'Compare At Price (LKR)': p.compareAtPrice ? Number(p.compareAtPrice) : '',
    'Stock Quantity': p.stockQuantity,
    Warranty: p.warranty || 'N/A',
    'Is Featured': p.isFeatured ? 'Yes' : 'No',
    'Is Active': p.isActive ? 'Yes' : 'No',
    'Image URL': p.primaryImage?.imageUrl || p.images?.[0]?.imageUrl || '',
    Description: p.description || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Auto-size columns
  const colWidths = [
    { wch: 18 }, // SKU
    { wch: 35 }, // Name
    { wch: 32 }, // Slug
    { wch: 18 }, // Category
    { wch: 18 }, // Brand
    { wch: 14 }, // Price
    { wch: 22 }, // Compare At Price
    { wch: 16 }, // Stock
    { wch: 25 }, // Warranty
    { wch: 12 }, // Featured
    { wch: 12 }, // Active
    { wch: 45 }, // Image URL
    { wch: 50 }, // Description
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `Nexora_Products_${dateStr}.xlsx`);
}

/**
 * Generate and download a dummy template Excel file for importing products.
 */
export function downloadProductImportTemplate() {
  const dummyData: ExcelProductRow[] = [
    {
      SKU: 'APL-IP15PM-256',
      Name: 'Apple iPhone 15 Pro Max 256GB Titanium',
      Slug: 'apple-iphone-15-pro-max-256gb-titanium',
      Category: 'Mobile Phones',
      Brand: 'Apple',
      Price: 489000,
      CompareAtPrice: 520000,
      StockQuantity: 15,
      Warranty: '1 Year AppleCare Warranty',
      IsFeatured: true,
      IsActive: true,
      ImageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
      Description: 'Forged in aerospace-grade titanium with Apple A17 Pro chip and 48MP camera system.',
    },
    {
      SKU: 'SNY-WH1000XM5-BLK',
      Name: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
      Slug: 'sony-wh-1000xm5-wireless-headphones-black',
      Category: 'Audio',
      Brand: 'Sony',
      Price: 95000,
      CompareAtPrice: 110000,
      StockQuantity: 20,
      Warranty: '1 Year Official Sony Warranty',
      IsFeatured: true,
      IsActive: true,
      ImageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      Description: 'Industry-leading noise cancellation optimized with two processors and 8 microphones.',
    },
    {
      SKU: 'DEL-XPS16-4K-01',
      Name: 'Dell XPS 16 OLED Laptop Intel Core Ultra 9',
      Slug: 'dell-xps-16-oled-intel-ultra-9',
      Category: 'Laptops',
      Brand: 'Dell',
      Price: 850000,
      CompareAtPrice: 920000,
      StockQuantity: 8,
      Warranty: '2 Years Dell ProSupport',
      IsFeatured: false,
      IsActive: true,
      ImageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800',
      Description: 'Cutting-edge OLED InfinityEdge display powered by Intel Core Ultra 9 and RTX 4070 graphics.',
    },
  ];

  const instructions = [
    { Field: 'SKU', Required: 'YES', Description: 'Unique Stock Keeping Unit (e.g. APL-IP15PM-256)' },
    { Field: 'Name', Required: 'YES', Description: 'Full product name' },
    { Field: 'Category', Required: 'YES', Description: 'Category name (must match existing category name or slug)' },
    { Field: 'Brand', Required: 'YES', Description: 'Brand name (must match existing brand name or slug)' },
    { Field: 'Price', Required: 'YES', Description: 'Numeric price in LKR (e.g. 95000)' },
    { Field: 'CompareAtPrice', Required: 'NO', Description: 'Original price for showing discount (e.g. 110000)' },
    { Field: 'StockQuantity', Required: 'NO', Description: 'Initial stock amount (default: 10)' },
    { Field: 'Warranty', Required: 'NO', Description: 'Warranty description (e.g. 1 Year Official)' },
    { Field: 'IsFeatured', Required: 'NO', Description: 'TRUE or FALSE (default: FALSE)' },
    { Field: 'IsActive', Required: 'NO', Description: 'TRUE or FALSE (default: TRUE)' },
    { Field: 'ImageUrl', Required: 'NO', Description: 'Product image (1:1 aspect ratio square recommended)' },
    { Field: 'Description', Required: 'YES', Description: 'Product specifications and details' },
  ];

  const workbook = XLSX.utils.book_new();

  const dataSheet = XLSX.utils.json_to_sheet(dummyData);
  dataSheet['!cols'] = [
    { wch: 18 }, { wch: 40 }, { wch: 35 }, { wch: 18 }, { wch: 15 },
    { wch: 14 }, { wch: 18 }, { wch: 15 }, { wch: 25 }, { wch: 12 },
    { wch: 12 }, { wch: 45 }, { wch: 50 },
  ];
  XLSX.utils.book_append_sheet(workbook, dataSheet, 'Products');

  const instructionsSheet = XLSX.utils.json_to_sheet(instructions);
  instructionsSheet['!cols'] = [{ wch: 18 }, { wch: 12 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Import Guide');

  XLSX.writeFile(workbook, 'products_import_template.xlsx');
}

/**
 * Parse an uploaded .xlsx file and prepare items for import.
 */
export async function parseProductsExcel(
  file: File,
  categories: Category[],
  brands: Brand[],
): Promise<{
  validRows: { payload: CreateProductInput; original: any }[];
  errors: { row: number; sku: string; error: string }[];
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary' });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet);

        const validRows: { payload: CreateProductInput; original: any }[] = [];
        const errors: { row: number; sku: string; error: string }[] = [];

        // Build category & brand lookup maps (case-insensitive)
        const categoryMap = new Map<string, string>();
        categories.forEach((c) => {
          categoryMap.set(c.name.toLowerCase().trim(), c.id);
          categoryMap.set(c.slug.toLowerCase().trim(), c.id);
        });

        const brandMap = new Map<string, string>();
        brands.forEach((b) => {
          brandMap.set(b.name.toLowerCase().trim(), b.id);
          brandMap.set(b.slug.toLowerCase().trim(), b.id);
        });

        rawJson.forEach((row, index) => {
          const rowNum = index + 2; // +1 for 0-index, +1 for header row
          const sku = String(row.SKU || row.sku || '').trim();
          const name = String(row.Name || row.name || '').trim();
          const categoryName = String(row.Category || row.category || '').trim();
          const brandName = String(row.Brand || row.brand || '').trim();
          const rawPrice = row.Price !== undefined ? row.Price : row.price;
          const price = typeof rawPrice === 'number' ? rawPrice : parseFloat(String(rawPrice || '').replace(/[^0-9.]/g, ''));
          const description = String(row.Description || row.description || name).trim();

          if (!sku) {
            errors.push({ row: rowNum, sku: 'Unknown', error: 'Missing required SKU' });
            return;
          }
          if (!name) {
            errors.push({ row: rowNum, sku, error: 'Missing required Product Name' });
            return;
          }
          if (isNaN(price) || price <= 0) {
            errors.push({ row: rowNum, sku, error: `Invalid Price: "${rawPrice}"` });
            return;
          }

          // Match category
          const categoryId = categoryMap.get(categoryName.toLowerCase());
          if (!categoryId) {
            errors.push({
              row: rowNum,
              sku,
              error: `Category "${categoryName}" not found. Available: ${categories.map((c) => c.name).join(', ')}`,
            });
            return;
          }

          // Match brand
          const brandId = brandMap.get(brandName.toLowerCase());
          if (!brandId) {
            errors.push({
              row: rowNum,
              sku,
              error: `Brand "${brandName}" not found. Available: ${brands.map((b) => b.name).join(', ')}`,
            });
            return;
          }

          const rawComparePrice = row.CompareAtPrice ?? row.compareAtPrice;
          const compareAtPrice = rawComparePrice ? parseFloat(String(rawComparePrice)) : undefined;

          const rawStock = row.StockQuantity ?? row.stockQuantity ?? row.Stock ?? row.stock ?? 10;
          const stockQuantity = parseInt(String(rawStock), 10) || 0;

          const rawFeatured = String(row.IsFeatured ?? row.isFeatured ?? '').toLowerCase();
          const isFeatured = rawFeatured === 'true' || rawFeatured === 'yes' || rawFeatured === '1';

          const rawActive = String(row.IsActive ?? row.isActive ?? 'true').toLowerCase();
          const isActive = rawActive !== 'false' && rawActive !== 'no' && rawActive !== '0';

          const imageUrl = String(row.ImageUrl || row.imageUrl || '').trim();

          const payload: CreateProductInput = {
            name,
            sku,
            slug: row.Slug ? String(row.Slug).trim() : undefined,
            description,
            categoryId,
            brandId,
            price,
            compareAtPrice: compareAtPrice && compareAtPrice > 0 ? compareAtPrice : undefined,
            stockQuantity,
            warranty: row.Warranty ? String(row.Warranty).trim() : undefined,
            isFeatured,
            isActive,
            images: imageUrl
              ? [
                  {
                    imageUrl,
                    isPrimary: true,
                    displayOrder: 0,
                  },
                ]
              : undefined,
          };

          validRows.push({ payload, original: row });
        });

        resolve({ validRows, errors });
      } catch (err: any) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
}
