
import React, { useState, useEffect } from 'react';

interface CameraOverlayProps {
  diagnosisStatus?: 'good' | 'warning' | 'bad' | null;
  showTips?: boolean;
}

const CameraOverlay = ({ diagnosisStatus = null, showTips = true }: CameraOverlayProps) => {
  const [tips, setTips] = useState<string[]>([
    "Center the plant in frame",
    "Focus on leaves for better identification",
    "Ensure good lighting",
    "Capture whole plant if possible",
    "Zoom in for more detailed leaf analysis",
    "Avoid shadows across the plant"
  ]);
  const [currentTip, setCurrentTip] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [tips.length]);

  const getBorderColor = () => {
    switch(diagnosisStatus) {
      case 'good': return 'border-green-500';
      case 'warning': return 'border-yellow-500';
      case 'bad': return 'border-red-500';
      default: return 'border-white/80';
    }
  };
  
  const getStatusText = () => {
    switch(diagnosisStatus) {
      case 'good': return 'Good Frame';
      case 'warning': return 'Adjust Position';
      case 'bad': return 'Poor Lighting';
      default: return '';
    }
  };
  
  const getStatusBackground = () => {
    switch(diagnosisStatus) {
      case 'good': return 'bg-green-500/70';
      case 'warning': return 'bg-yellow-500/70';
      case 'bad': return 'bg-red-500/70';
      default: return '';
    }
  };
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Corner markers - made larger */}
      <div className={`absolute top-6 left-6 w-16 h-16 border-l-3 border-t-3 ${getBorderColor()} transition-colors duration-300`}></div>
      <div className={`absolute top-6 right-6 w-16 h-16 border-r-3 border-t-3 ${getBorderColor()} transition-colors duration-300`}></div>
      <div className={`absolute bottom-6 left-6 w-16 h-16 border-l-3 border-b-3 ${getBorderColor()} transition-colors duration-300`}></div>
      <div className={`absolute bottom-6 right-6 w-16 h-16 border-r-3 border-b-3 ${getBorderColor()} transition-colors duration-300`}></div>
      
      {/* Center guide text - only show if showTips is true */}
      {showTips && (
        <div className="absolute bottom-24 left-0 right-0 text-center">
          <p className="text-white/90 text-sm bg-black/40 inline-block px-6 py-2.5 rounded-full backdrop-blur-sm">
            {tips[currentTip]}
          </p>
        </div>
      )}
      
      {/* Status indicator */}
      {diagnosisStatus && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-center">
          <div className={`px-6 py-2 rounded-full inline-block ${getStatusBackground()}`}>
            <p className="text-white font-medium">
              {getStatusText()}
            </p>
          </div>
        </div>
      )}
      
      {/* Additional diagnosis info - only show if showTips is true */}
      {diagnosisStatus && showTips && (
        <div className="absolute bottom-16 left-0 right-0 flex justify-center">
          <div className={`px-4 py-1.5 rounded inline-block bg-black/50 backdrop-blur-sm`}>
            <p className="text-white text-xs">
              {diagnosisStatus === 'good' 
                ? 'Perfect lighting and framing' 
                : diagnosisStatus === 'warning' 
                ? 'Try to center the plant more' 
                : 'Increase lighting or move to brighter area'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraOverlay;
