
import React from 'react';

const CameraOverlay = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Corner markers */}
      <div className="absolute top-8 left-8 w-12 h-12 border-l-2 border-t-2 border-white/80"></div>
      <div className="absolute top-8 right-8 w-12 h-12 border-r-2 border-t-2 border-white/80"></div>
      <div className="absolute bottom-8 left-8 w-12 h-12 border-l-2 border-b-2 border-white/80"></div>
      <div className="absolute bottom-8 right-8 w-12 h-12 border-r-2 border-b-2 border-white/80"></div>
      
      {/* Center guide text */}
      <div className="absolute bottom-20 left-0 right-0 text-center">
        <p className="text-white/80 text-sm bg-black/20 inline-block px-4 py-2 rounded-full backdrop-blur-sm">
          Center your plant in the frame
        </p>
      </div>
    </div>
  );
};

export default CameraOverlay;
