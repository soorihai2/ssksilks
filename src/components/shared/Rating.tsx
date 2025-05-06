import React from 'react';
import { Star, StarHalf, StarOutline } from '@mui/icons-material';

interface RatingProps {
  value: number;
  max?: number;
  className?: string;
}

export const Rating: React.FC<RatingProps> = ({ 
  value, 
  max = 5,
  className = ''
}) => {
  const stars = [];
  const fullStars = Math.floor(value);
  const hasHalfStar = value % 1 >= 0.5;
  const emptyStars = max - fullStars - (hasHalfStar ? 1 : 0);

  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star 
        key={`full-${i}`} 
        className="text-yellow-400" 
        fontSize="small"
      />
    );
  }

  // Add half star if needed
  if (hasHalfStar) {
    stars.push(
      <StarHalf 
        key="half" 
        className="text-yellow-400" 
        fontSize="small"
      />
    );
  }

  // Add empty stars
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <StarOutline 
        key={`empty-${i}`} 
        className="text-yellow-400" 
        fontSize="small"
      />
    );
  }

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {stars}
      <span className="ml-1 text-sm text-gray-600">
        {value.toFixed(1)}
      </span>
    </div>
  );
}; 