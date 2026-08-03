import React, { useState } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackUrl?: string;
}

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1578898835027-2ad020afd173?auto=format&fit=crop&w=800&q=80';

export function SafeImage({ src, alt, className, fallbackUrl = DEFAULT_FALLBACK, ...props }: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(() => {
    if (!src || typeof src !== 'string' || src.trim() === '') {
      return fallbackUrl;
    }
    return src;
  });

  const handleError = () => {
    if (imgSrc !== fallbackUrl) {
      setImgSrc(fallbackUrl);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt || 'Local Destination'}
      className={className}
      onError={handleError}
      loading="lazy"
      {...props}
    />
  );
}
