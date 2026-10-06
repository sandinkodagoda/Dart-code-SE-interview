import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, children, className = '', id, style, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '100%' }}>
        {label && (
          <label
            htmlFor={selectId}
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

        <select
          ref={ref}
          id={selectId}
          style={{
            width: '100%',
            padding: '0.625rem 0.875rem',
            fontSize: '0.9375rem',
            borderRadius: '8px',
            border: `1.5px solid ${error ? 'var(--color-danger)' : 'var(--color-border)'}`,
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            outline: 'none',
            ...style,
          }}
          className={className}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        {error && (
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-danger)', fontWeight: 500 }}>
            {error}
          </span>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';
