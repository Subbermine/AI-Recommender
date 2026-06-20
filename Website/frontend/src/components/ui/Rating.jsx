import React, { useState } from 'react';
import { Star } from 'lucide-react';

const Rating = ({
  rating,
  numReviews,
  interactive = false,
  onChange,
  size = 4,
}) => {
  const [hoverRating, setHoverRating] = useState(null);

  const handleClick = (value) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (interactive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(null);
    }
  };

  const displayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center" onMouseLeave={handleMouseLeave}>
        {[1, 2, 3, 4, 5].map((starValue) => {
          let fillClass = 'text-brand-navy/60';
          if (starValue <= displayRating) {
            fillClass = 'text-brand-brown fill-amber-400';
          } else if (starValue - 0.5 <= displayRating) {
            fillClass = 'text-brand-brown fill-amber-400 opacity-60';
          }

          return (
            <button
              key={starValue}
              type="button"
              disabled={!interactive}
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''} focus:outline-none`}
            >
              <Star className={`w-${size} h-${size} ${fillClass}`} />
            </button>
          );
        })}
      </div>
      
      {numReviews !== undefined && (
        <span className="text-xs text-brand-navy/60 ml-1 font-bold">
          ({numReviews} {numReviews === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
};

export default Rating;

