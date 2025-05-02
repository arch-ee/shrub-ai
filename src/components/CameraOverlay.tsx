
import React, { useState, useEffect } from 'react';

interface CameraOverlayProps {
  diagnosisStatus?: 'good' | 'warning' | 'bad' | null;
}

const CameraOverlay = ({ diagnosisStatus = null }: CameraOverlayProps) => {
  const [tips, setTips] = useState<string[]>([
    "Center the plant in frame",
    "Focus on leaves for better identification",
    "Ensure good lighting",
    "Capture whole plant if possible"
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
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Corner markers */}
      <div className={`absolute top-8 left-8 w-12 h-12 border-l-2 border-t-2 ${getBorderColor()} transition-colors duration-300`}></div>
      <div className={`absolute top-8 right-8 w-12 h-12 border-r-2 border-t-2 ${getBorderColor()} transition-colors duration-300`}></div>
      <div className={`absolute bottom-8 left-8 w-12 h-12 border-l-2 border-b-2 ${getBorderColor()} transition-colors duration-300`}></div>
      <div className={`absolute bottom-8 right-8 w-12 h-12 border-r-2 border-b-2 ${getBorderColor()} transition-colors duration-300`}></div>
      
      {/* Center guide text */}
      <div className="absolute bottom-20 left-0 right-0 text-center">
        <p className="text-white/90 text-sm bg-black/30 inline-block px-4 py-2 rounded-full backdrop-blur-sm">
          {tips[currentTip]}
        </p>
      </div>
      
      {/* Status indicator */}
      {diagnosisStatus && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-center">
          <div className={`px-4 py-1 rounded-full inline-block ${
            diagnosisStatus === 'good' ? 'bg-green-500/70' : 
            diagnosisStatus === 'warning' ? 'bg-yellow-500/70' : 
            'bg-red-500/70'
          }`}>
            <p className="text-white font-medium text-sm">
              {diagnosisStatus === 'good' ? 'Good Frame' : 
               diagnosisStatus === 'warning' ? 'Adjust Position' : 
               'Poor Lighting'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraOverlay;
