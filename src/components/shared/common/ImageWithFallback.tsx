import React, { useState, useRef } from 'react';
import { Box, BoxProps } from '@mui/material';
import { getImageUrl } from '../../../utils/imageUtils';

interface ImageWithFallbackProps extends BoxProps {
  src: string;
  alt: string;
  type?: 'products' | 'categories' | 'offers';
  defaultImage?: string;
}

/**
 * A component that displays an image with fallback support for various file extensions
 * and a default placeholder if all attempts fail.
 */
export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  type = 'products',
  defaultImage = 'placeholder.jpg',
  ...boxProps
}) => {
  const errorCountRef = useRef(0);
  const [imgSrc, setImgSrc] = useState(() => {
    // Use getImageUrl to get the properly formatted image URL
    if (src.startsWith('http')) return src;
    return getImageUrl(src, type, defaultImage);
  });
  
  const handleError = () => {
    errorCountRef.current += 1;
    
    // Limit retry attempts to prevent infinite loops
    if (errorCountRef.current > 3) {
      // After several attempts, just use the default image
      setImgSrc(getImageUrl(undefined, type, defaultImage));
      return;
    }
    
    // Try different path formats and extensions
    if (imgSrc.endsWith('.jpg')) {
      setImgSrc(imgSrc.replace(/\.jpg$/, '.jpeg'));
    } else if (imgSrc.endsWith('.jpeg')) {
      setImgSrc(imgSrc.replace(/\.jpeg$/, '.jpg'));
    } else if (imgSrc.includes(`${type}/images`)) {
      // Fix incorrect path pattern
      setImgSrc(imgSrc.replace(`${type}/images`, `images/${type}`));
    } else if (imgSrc.includes('/products//images/categories/')) {
      // Fix the specific problematic pattern from the example
      setImgSrc(imgSrc.replace('/products//images/categories/', '/images/categories/'));
    } else {
      // If all attempts fail, use the default image
      setImgSrc(getImageUrl(undefined, type, defaultImage));
    }
  };
  
  return (
    <Box
      component="img"
      src={imgSrc}
      alt={alt}
      onError={handleError}
      {...boxProps}
    />
  );
};

export default ImageWithFallback; 