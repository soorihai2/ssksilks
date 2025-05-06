import { getImageUrl } from '../../../utils/imageUtils';
import { API_BASE_URL } from '../../../config';

const getImageUrl = (imagePath?: string) => {
  if (!imagePath) {
    return `${API_BASE_URL}/images/products/placeholder.jpg`;
  }
  const cleanPath = imagePath.replace(/^\/images\/products\//, '');
  return `${API_BASE_URL}/images/products/${cleanPath}`;
};

// Fix the image loading by adding an onError handler
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  const currentSrc = img.src;
  
  // If current extension is .jpeg, try .jpg
  if (currentSrc.endsWith('.jpeg')) {
    img.src = currentSrc.replace(/\.jpeg$/, '.jpg');
  } 
  // If current extension is .jpg, try .jpeg
  else if (currentSrc.endsWith('.jpg')) {
    img.src = currentSrc.replace(/\.jpg$/, '.jpeg');
  }
  // If the alternate extension also fails, use placeholder
  img.onerror = () => {
    img.src = `${API_BASE_URL}/images/products/placeholder.jpg`;
    // Remove this handler to prevent infinite loop
    img.onerror = null;
  };
};

// Add the onError handler to image elements where getImageUrl is used 