
import React, { useRef, useState } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface CameraViewProps {
  onCapture: (imageSrc: string) => void;
  onCancel: () => void;
}

const CameraView = ({ onCapture, onCancel }: CameraViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  React.useEffect(() => {
    // Start camera on component mount
    startCamera();

    // Clean up on unmount
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use the back camera
          aspectRatio: 16/9
        },
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreamActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      setIsStreamActive(false);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current && isStreamActive) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match the video aspect ratio
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current video frame to the canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL
        const photoData = canvas.toDataURL('image/jpeg');
        setCapturedImage(photoData);
        
        // Stop camera after taking photo
        stopCamera();
      }
    }
  };

  const usePhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  return (
    <div className="camera-view w-full">
      <AspectRatio ratio={16/9} className="relative overflow-hidden rounded-lg bg-black">
        {!capturedImage ? (
          // Live camera view
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
        ) : (
          // Captured photo view
          <img 
            src={capturedImage} 
            alt="Captured" 
            className="w-full h-full object-cover" 
          />
        )}
        
        {/* Hidden canvas for capturing photos */}
        <canvas ref={canvasRef} className="hidden" />
      </AspectRatio>

      <div className="flex justify-center mt-4 gap-4">
        {!capturedImage ? (
          // Controls for capturing
          <>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full w-12 h-12 bg-white/80 hover:bg-white"
              onClick={onCancel}
            >
              <X className="w-6 h-6" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full w-16 h-16 border-2 bg-white/80 hover:bg-white"
              onClick={takePhoto}
            >
              <div className="w-12 h-12 rounded-full border-2 border-gray-500" />
            </Button>
          </>
        ) : (
          // Controls for using or retaking photo
          <>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full w-12 h-12 bg-white/80 hover:bg-white"
              onClick={retakePhoto}
            >
              <X className="w-6 h-6" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full w-12 h-12 bg-green-500/80 hover:bg-green-500 text-white"
              onClick={usePhoto}
            >
              <Check className="w-6 h-6" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default CameraView;
