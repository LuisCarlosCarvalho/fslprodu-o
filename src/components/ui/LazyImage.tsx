import { useState, ImgHTMLAttributes } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  wrapperClassName?: string;
}

export function LazyImage({ src, alt, className = '', wrapperClassName = '', ...props }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Fallback to Skeleton if image fails to load or is still loading
  return (
    <div className={`relative overflow-hidden bg-gray-100 ${wrapperClassName}`}>
      {(!isLoaded || hasError) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <ImageIcon className="text-gray-300 w-1/3 h-1/3" />
        </div>
      )}
      
      {!hasError && src && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`
            w-full h-full object-cover transition-opacity duration-500
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
            ${className}
          `}
          {...props}
        />
      )}
    </div>
  );
}
