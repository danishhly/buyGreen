import React from 'react';

// A single star whichcan be full or empty

const Star = ({ full }) => {
    if(full) {
        return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-500">
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z" clipRule="evenodd" />
      </svg>
    );
    }
    return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-300">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.31h5.513c.491 0 .711.658.308.97l-4.5 3.633a.563.563 0 00-.184.65l2.062 5.176a.563.563 0 01-.84.61l-4.72-3.57a.563.563 0 00-.652 0l-4.72 3.57a.563.563 0 01-.84-.61l2.062-5.176a.563.563 0 00-.184-.65l-4.5-3.633a.563.563 0 01.308-.97h5.513a.563.563 0 00.475-.31l2.125-5.111z" />
    </svg>
  )};

  //the main component that render main stars
  const StarRating = ({ rating }) => {
    return(
        <div className ="flex items-center">
            {[1, 2, 3, 4, 5].map((value) => (
                <Star key={value} full ={value <= rating}/>
            ))}
        </div>
    )
  }
 
  export default StarRating;