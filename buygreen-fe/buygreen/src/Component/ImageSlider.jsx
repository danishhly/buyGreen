import React, { useState } from 'react';

// Define a simple arrow icon for the buttons
const ArrowIcon = ({ direction = 'left' }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className={`w-6 h-6 ${direction === 'right' ? 'transform rotate-180' : ''}`}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);


const ImageSlider = ({ images = [] }) => {
  // 1. Add state to track the current image index
  const [currentIndex, setCurrentIndex] = useState(0);

  // 2. Create functions to go to the previous or next slide
  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === images.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  // 3. Function to go to a specific slide (for the dots)
  const goToSlide = (slideIndex) => {
    setCurrentIndex(slideIndex);
  };

  // 4. Return the JSX for the slider
  return (
    <div className="h-full w-full relative group">
      {/* The main image */}
      <div 
        style={{ backgroundImage: `url(${images[currentIndex]})` }} 
        className="w-full h-full rounded-lg bg-center bg-cover duration-500"
      >
        {/* Preload next image for smoother transitions */}
        {images[currentIndex + 1] && (
          <img 
            src={images[currentIndex + 1]} 
            alt="" 
            className="hidden" 
            loading="lazy"
            decoding="async"
          />
        )}
      </div>
      
      {/* Left Arrow Button */}
      <button 
        onClick={goToPrevious} 
        className="hidden group-hover:block absolute top-1/2 -translate-y-1/2 left-2 text-white bg-black/30 rounded-full p-2"
      >
        <ArrowIcon direction="left" />
      </button>
      
      {/* Right Arrow Button */}
      <button 
        onClick={goToNext} 
        className="hidden group-hover:block absolute top-1/2 -translate-y-1/2 right-2 text-white bg-black/30 rounded-full p-2"
      >
        <ArrowIcon direction="right" />
      </button>

      {/* Dot Indicators */}
      <div className="flex justify-center py-2 absolute bottom-2 left-0 right-0">
        {images.map((_, slideIndex) => (
          <button
            key={slideIndex}
            onClick={() => goToSlide(slideIndex)}
            className={`mx-1 w-3 h-3 rounded-full ${
              currentIndex === slideIndex ? 'bg-white' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${slideIndex + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;