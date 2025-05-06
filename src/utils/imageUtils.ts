import { MEDIA_BASE_URL } from '../config';

/**
 * Returns a properly formatted URL for an image
 * 
 * @param imagePath The relative path to the image
 * @param type The type of image (products, categories, offers, etc.)
 * @param defaultImage Optional default image to use if imagePath is not provided
 * @returns Complete URL to the image
 */
export const getImageUrl = (
  imagePath?: string,
  type: 'products' | 'categories' | 'offers' = 'products',
  defaultImage: string = 'placeholder.jpg'
): string => {
  // If no image path is provided, return a placeholder
  if (!imagePath) {
    return `${MEDIA_BASE_URL}/images/${type}/${defaultImage}`;
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // Remove any leading slash
  let path = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;

  // Extract the filename from the path
  const filename = path.split('/').pop() || '';

  // If the path already includes /images/type/, extract just the filename
  const typePattern = new RegExp(`.*images/${type}/(.+)`);
  const match = path.match(typePattern);
  if (match) {
    return `${MEDIA_BASE_URL}/images/${type}/${match[1]}`;
  }

  // If it's just a filename, add the proper path
  if (!path.includes('/')) {
    return `${MEDIA_BASE_URL}/images/${type}/${path}`;
  }

  // For any other case, ensure we have the correct path structure
  return `${MEDIA_BASE_URL}/images/${type}/${filename}`;
}; 