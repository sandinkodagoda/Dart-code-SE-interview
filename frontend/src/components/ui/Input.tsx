import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, icon, className = '', id, style, ...props }, ref) => {
    const iconNode = leftIcon || icon;
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '100%' }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
            }}
          >
            {label}
            {props.required && <span style={{ color: 'var(--color-danger)', marginLeft: '2px' }}>*</span>}
          </label>
        )}

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {iconNode && (
            <span
              style={{
                position: 'absolute',
                left: '0.85rem',
                color: 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
              }}
            >
              {iconNode}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            style={{
              width: '100%',
              padding: iconNode ? '0.625rem 0.875rem 0.625rem 2.5rem' : '0.625rem 0.875rem',
              fontSize: '0.9375rem',
              borderRadius: '8px',
              border: `1.5px solid ${error ? 'var(--color-danger)' : 'var(--color-border)'}`,
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              outline: 'none',
              transition: 'border-color 0.15s ease',
              ...style,
            }}
            className={className}
            {...props}
          />
        </div>

        {error && (
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-danger)', fontWeight: 500 }}>
            {error}
          </span>
        )}

        {!error && helperText && (
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            {helperText}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
