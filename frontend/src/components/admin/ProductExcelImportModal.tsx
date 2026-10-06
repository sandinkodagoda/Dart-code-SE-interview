'use client';

import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  X,
  Loader2,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { Category, Brand, CreateProductInput } from '@/types';
import { Button } from '@/components/ui/Button';
import {
  parseProductsExcel,
  downloadProductImportTemplate,
} from '@/lib/utils/excel';

interface ProductExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  brands: Brand[];
  onImportComplete: () => void;
}

export function ProductExcelImportModal({
  isOpen,
  onClose,
  categories,
  brands,
  onImportComplete,
}: ProductExcelImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseResults, setParseResults] = useState<{
    validRows: { payload: CreateProductInput; original: any }[];
    errors: { row: number; sku: string; error: string }[];
  } | null>(null);

  // Import execution state
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);
  const [importSummary, setImportSummary] = useState<{ succeeded: number; failed: number } | null>(null);

  if (!isOpen) return null;

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setIsParsing(true);
    setParseResults(null);
    setImportSummary(null);

    try {
      const results = await parseProductsExcel(selectedFile, categories, brands);
      setParseResults(results);
    } catch (err: any) {
      alert('Failed to parse Excel file: ' + (err.message || 'Invalid format'));
    } finally {
      setIsParsing(false);
    }
  };

  const executeImport = async () => {
    if (!parseResults || parseResults.validRows.length === 0) return;

    setIsImporting(true);
    let succeeded = 0;
    let failed = 0;
    const total = parseResults.validRows.length;

    for (let i = 0; i < total; i++) {
      setImportProgress({ current: i + 1, total });
      const item = parseResults.validRows[i];
      try {
        await adminApi.createProduct(item.payload);
        succeeded++;
      } catch (err) {
        console.error(`Failed to import product ${item.payload.sku}:`, err);
        failed++;
      }
    }

    setIsImporting(false);
    setImportProgress(null);
    setImportSummary({ succeeded, failed });
    onImportComplete();
  };

  const handleReset = () => {
    setFile(null);
    setParseResults(null);
    setImportSummary(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          maxWidth: '720px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                Import Products from Excel
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.1rem' }}>
                Batch create electronic gadgets using standardized .xlsx spreadsheet
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              color: '#64748b',
              padding: '0.4rem',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Template Download Callout */}
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#eff6ff',
              borderRadius: '12px',
              border: '1px solid #bfdbfe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1e40af' }}>
                Need the exact Excel format?
              </div>
              <div style={{ fontSize: '0.75rem', color: '#3b82f6', marginTop: '0.2rem' }}>
                Download our dummy template with sample phones, laptops, and required column headers.
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadProductImportTemplate}
              leftIcon={<Download size={14} />}
              style={{ backgroundColor: '#ffffff', borderColor: '#93c5fd', color: '#1d4ed8' }}
            >
              Download Dummy Template (.xlsx)
            </Button>
          </div>

          {/* Import Complete State */}
          {importSummary ? (
            <div
              style={{
                textAlign: 'center',
                padding: '2.5rem 1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#dcfce7',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}
              >
                <CheckCircle size={32} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                Import Process Complete!
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Successfully imported <strong>{importSummary.succeeded}</strong> product(s).
                {importSummary.failed > 0 && ` (${importSummary.failed} failed)`}
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                <Button variant="secondary" onClick={handleReset}>
                  Import Another File
                </Button>
                <Button variant="primary" onClick={onClose}>
                  Done & View Catalog
                </Button>
              </div>
            </div>
          ) : !file ? (
            /* Upload dropzone */
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed #cbd5e1',
                backgroundColor: '#f8fafc',
                borderRadius: '16px',
                padding: '3rem 1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border-color 0.15s, background-color 0.15s',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileSelect(f);
                }}
              />
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem',
                }}
              >
                <Upload size={24} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>
                Click to browse or drop your .xlsx product sheet
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
                Supports standard Excel (.xlsx, .xls) up to 25MB
              </div>
            </div>
          ) : isParsing ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <Loader2 size={36} className="animate-spin text-blue-600 mx-auto" />
              <div style={{ fontWeight: 700, marginTop: '1rem', color: 'var(--color-text-primary)' }}>
                Validating & Parsing Spreadsheet...
              </div>
            </div>
          ) : parseResults ? (
            /* Parse Results View */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Stats Bar */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div
                  style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>Ready to Import</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#15803d' }}>
                    {parseResults.validRows.length} Products
                  </div>
                </div>

                {parseResults.errors.length > 0 && (
                  <div
                    style={{
                      flex: 1,
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', color: '#991b1b', fontWeight: 600 }}>Validation Errors</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#b91c1c' }}>
                      {parseResults.errors.length} Rows
                    </div>
                  </div>
                )}
              </div>

              {/* Error messages if any */}
              {parseResults.errors.length > 0 && (
                <div
                  style={{
                    backgroundColor: '#fff1f2',
                    border: '1px solid #fecdd3',
                    borderRadius: '10px',
                    padding: '0.75rem',
                    maxHeight: '120px',
                    overflowY: 'auto',
                    fontSize: '0.75rem',
                  }}
                >
                  <div style={{ fontWeight: 700, color: '#be123c', marginBottom: '0.25rem' }}>
                    Errors detected (these rows will be skipped):
                  </div>
                  {parseResults.errors.map((err, i) => (
                    <div key={i} style={{ color: '#9f1239', margin: '0.15rem 0' }}>
                      • Row {err.row} ({err.sku}): {err.error}
                    </div>
                  ))}
                </div>
              )}

              {/* Valid rows preview table */}
              {parseResults.validRows.length > 0 && (
                <div style={{ border: '1px solid var(--color-border)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ padding: '0.5rem 0.75rem', backgroundColor: '#f8fafc', borderBottom: '1px solid var(--color-border)', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                    Previewing First {Math.min(5, parseResults.validRows.length)} Products:
                  </div>
                  <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid var(--color-border)' }}>
                        <th style={{ padding: '0.5rem 0.75rem' }}>SKU</th>
                        <th style={{ padding: '0.5rem 0.75rem' }}>Name</th>
                        <th style={{ padding: '0.5rem 0.75rem' }}>Price</th>
                        <th style={{ padding: '0.5rem 0.75rem' }}>Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parseResults.validRows.slice(0, 5).map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'monospace', fontWeight: 600 }}>
                            {row.payload.sku}
                          </td>
                          <td style={{ padding: '0.5rem 0.75rem', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {row.payload.name}
                          </td>
                          <td style={{ padding: '0.5rem 0.75rem', fontWeight: 700 }}>
                            LKR {Number(row.payload.price).toLocaleString()}
                          </td>
                          <td style={{ padding: '0.5rem 0.75rem' }}>
                            {row.payload.stockQuantity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Progress bar when importing */}
              {isImporting && importProgress && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: '#2563eb', marginBottom: '0.25rem' }}>
                    <span>Importing Products to Catalog...</span>
                    <span>{importProgress.current} / {importProgress.total}</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        backgroundColor: '#2563eb',
                        width: `${(importProgress.current / importProgress.total) * 100}%`,
                        transition: 'width 0.2s ease',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f8fafc',
          }}
        >
          {parseResults && !importSummary ? (
            <Button variant="ghost" size="sm" onClick={handleReset} disabled={isImporting}>
              Choose Different File
            </Button>
          ) : (
            <div />
          )}

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="secondary" onClick={onClose} disabled={isImporting}>
              Cancel
            </Button>
            {parseResults && !importSummary && (
              <Button
                variant="primary"
                onClick={executeImport}
                disabled={isImporting || parseResults.validRows.length === 0}
                isLoading={isImporting}
                leftIcon={<Upload size={16} />}
              >
                Import {parseResults.validRows.length} Products
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
