import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  style,
}) => {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    fontWeight: 600,
    borderRadius: '9999px',
    lineHeight: 1,
    whiteSpace: 'nowrap',
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '0.25rem 0.5rem', fontSize: '0.75rem' },
    md: { padding: '0.35rem 0.75rem', fontSize: '0.8125rem' },
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: 'var(--color-primary-light)',
      color: 'var(--color-primary-dark)',
      border: '1px solid #bfdbfe',
    },
    success: {
      backgroundColor: 'var(--color-success-bg)',
      color: '#065f46',
      border: '1px solid #a7f3d0',
    },
    warning: {
      backgroundColor: 'var(--color-warning-bg)',
      color: '#92400e',
      border: '1px solid #fde68a',
    },
    danger: {
      backgroundColor: 'var(--color-danger-bg)',
      color: '#991b1b',
      border: '1px solid #fecaca',
    },
    info: {
      backgroundColor: 'var(--color-info-bg)',
      color: '#075985',
      border: '1px solid #bae6fd',
    },
    neutral: {
      backgroundColor: 'var(--color-surface-secondary)',
      color: 'var(--color-text-secondary)',
      border: '1px solid var(--color-border)',
    },
  };

  return (
    <span
      style={{
        ...baseStyles,
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
      }}
      className={className}
    >
      {children}
    </span>
  );
};
