'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';

interface ImageUploadInputProps {
  value: string;
  onChange: (url: string) => void;
  folder?: 'products' | 'categories' | 'general';
  isSquare?: boolean;
  label?: string;
  hint?: string;
}

export function ImageUploadInput({
  value,
  onChange,
  folder = 'general',
  isSquare = false,
  label = 'Image',
  hint,
}: ImageUploadInputProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPEG, PNG, WebP, etc.)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const result = await adminApi.uploadImage(file, folder, isSquare);
      // Use the full URL if local server, or relative url
      const finalUrl = result.fullUrl || result.url;
      onChange(finalUrl);
    } catch (err: any) {
      setUploadError(err.response?.data?.message || err.message || 'Failed to upload and convert image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {label}
        </label>
        {isSquare && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#2563eb',
              backgroundColor: '#eff6ff',
              padding: '0.15rem 0.5rem',
              borderRadius: '9999px',
              border: '1px solid #bfdbfe',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            ★ 1:1 Ratio Required (Square)
          </span>
        )}
      </div>

      {isSquare && (
        <div
          style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #dbeafe',
            borderRadius: '8px',
            padding: '0.5rem 0.75rem',
            fontSize: '0.75rem',
            color: '#1e40af',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span style={{ fontSize: '1rem' }}>📐</span>
          <span>
            <strong>Requirement:</strong> Product image needs <strong>1:1 ratio</strong> (square format, recommended <strong>800×800 px</strong>). Automatically converted to high-performance <strong>WebP</strong>.
          </span>
        </div>
      )}

      {/* Preview Card if image is set */}
      {value ? (
        <div
          style={{
            position: 'relative',
            borderRadius: '12px',
            border: '1px solid var(--color-border)',
            padding: '0.75rem',
            backgroundColor: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: isSquare ? '72px' : '90px',
              height: isSquare ? '72px' : '60px',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: '#e2e8f0',
              flexShrink: 0,
              border: '1px solid #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={value}
              alt="Uploaded preview"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {value.split('/').pop()}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  backgroundColor: '#dcfce7',
                  color: '#166534',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '4px',
                }}
              >
                WEBP SAVED
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Backend /uploads/{folder}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onChange('')}
            title="Remove image"
            style={{
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              border: 'none',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        /* Upload Area */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? '#2563eb' : '#cbd5e1'}`,
            backgroundColor: isDragging ? '#eff6ff' : '#f8fafc',
            borderRadius: '12px',
            padding: '1.25rem',
            textAlign: 'center',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            transition: 'border-color 0.15s, background-color 0.15s',
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />

          {isUploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0' }}>
              <Loader2 size={24} className="animate-spin text-blue-600" />
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#2563eb' }}>
                Converting to WebP & Saving to Backend...
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Upload size={18} />
              </div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Drag & drop image here or <span style={{ color: '#2563eb', textDecoration: 'underline' }}>browse</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Auto-converts to WebP {isSquare ? '• 1:1 Aspect Ratio Recommended' : ''} • Max 10MB
              </div>
            </div>
          )}
        </div>
      )}

      {uploadError && (
        <div style={{ fontSize: '0.75rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <AlertCircle size={14} />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Manual URL Input Option */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem' }}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or paste external/custom image URL..."
          style={{
            flex: 1,
            fontSize: '0.75rem',
            padding: '0.45rem 0.65rem',
            borderRadius: '6px',
            border: '1px solid var(--color-border)',
            backgroundColor: '#ffffff',
            color: 'var(--color-text-secondary)',
          }}
        />
      </div>

      {hint && !isSquare && (
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{hint}</div>
      )}
    </div>
  );
}
