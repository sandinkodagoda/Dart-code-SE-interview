import React from 'react';

interface PriceProps {
  amount: number;
  compareAtAmount?: number | null;
  currency?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Price: React.FC<PriceProps> = ({
  amount,
  compareAtAmount,
  currency = 'LKR',
  size = 'md',
  className = '',
}) => {
  const formatNumber = (val: number) => {
    return Number(val).toLocaleString('en-LK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const sizeStyles: Record<string, { current: string; compare: string }> = {
    sm: { current: '0.9rem', compare: '0.75rem' },
    md: { current: '1.1rem', compare: '0.85rem' },
    lg: { current: '1.4rem', compare: '1rem' },
    xl: { current: '1.85rem', compare: '1.15rem' },
  };

  const discountPercent =
    compareAtAmount && compareAtAmount > amount
      ? Math.round(((compareAtAmount - amount) / compareAtAmount) * 100)
      : null;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: '0.5rem',
        flexWrap: 'wrap',
      }}
      className={className}
    >
      <span
        style={{
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          fontSize: sizeStyles[size].current,
          letterSpacing: '-0.02em',
        }}
      >
        <span style={{ fontSize: '0.8em', color: 'var(--color-primary)', marginRight: '3px' }}>
          {currency}
        </span>
        {formatNumber(amount)}
      </span>

      {compareAtAmount && compareAtAmount > amount && (
        <>
          <span
            style={{
              textDecoration: 'line-through',
              color: 'var(--color-text-muted)',
              fontSize: sizeStyles[size].compare,
            }}
          >
            {currency} {formatNumber(compareAtAmount)}
          </span>

          {discountPercent && (
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--color-danger)',
                backgroundColor: 'var(--color-danger-bg)',
                padding: '0.15rem 0.4rem',
                borderRadius: '4px',
              }}
            >
              -{discountPercent}%
            </span>
          )}
        </>
      )}
    </div>
  );
};
