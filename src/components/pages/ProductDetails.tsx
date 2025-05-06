import { getImageUrl } from '../../utils/imageUtils';
import { MEDIA_BASE_URL } from '../../config';

const getImageUrl = (imagePath?: string) => {
  if (!imagePath) {
    return `${MEDIA_BASE_URL}/images/products/placeholder.jpg`;
  }
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  const cleanPath = imagePath.replace(/^\/images\/products\//, '');
  return `${MEDIA_BASE_URL}/images/products/${cleanPath}`;
}; 