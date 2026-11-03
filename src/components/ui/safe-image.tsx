import React from 'react';

export interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  hideOnError?: boolean;
}

const DEFAULT_FALLBACK = '/logo.png';

/**
 * Shared image component with standardized lazy loading and single-point error fallback.
 */
export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  fallbackSrc = DEFAULT_FALLBACK,
  hideOnError = false,
  loading = 'lazy',
  decoding = 'async',
  onError,
  ...props
}) => {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const el = e.currentTarget;
    if (hideOnError) {
      el.style.display = 'none';
    } else if (!el.src.endsWith(fallbackSrc)) {
      el.src = fallbackSrc;
    }
    onError?.(e);
  };

  return (
    <img
      src={src || fallbackSrc}
      loading={loading}
      decoding={decoding}
      onError={handleError}
      {...props}
    />
  );
};
