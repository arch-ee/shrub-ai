
import React, { useRef, useState, useEffect } from 'react';
import { Check, X, FlipHorizontal, ZoomIn, ZoomOut, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Slider } from '@/components/ui/slider';
import { plantService } from '@/services/plant-service';
import { soundService } from '@/services/sound-service';
import { useIsMobile } from '@/hooks/use-mobile';
import { ImpactStyle } from '@capacitor/haptics';

interface CameraViewProps {
  onCapture: (imageSrc: string) => void;
  onCancel: () => void;
}

const CameraView = ({ onCapture, onCancel }: CameraViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [maxZoom, setMaxZoom] = useState(3);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | undefined>(undefined);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    // Check for available cameras
    checkCameraCapabilities();
    
    // Start camera on component mount
    startCamera();

    // Clean up on unmount
    return () => {
      stopCamera();
    };
  }, []);
  
  const checkCameraCapabilities = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setAvailableDevices(videoDevices);
      setHasMultipleCameras(videoDevices.length > 1);
    } catch (err) {
      console.error("Error checking camera capabilities:", err);
    }
  };

  const startCamera = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: cameraFacing,
          aspectRatio: isMobile ? 3/4 : 16/9,
          deviceId: currentDeviceId ? { exact: currentDeviceId } : undefined
        },
        audio: false,
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreamActive(true);
        
        // Check for zoom capabilities
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          const capabilities = videoTrack.getCapabilities();
          if (capabilities.zoom) {
            setMaxZoom(capabilities.zoom.max || 3);
          }
        }
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      // If facing mode fails (e.g., no back camera), try the other mode
      if (cameraFacing === 'environment') {
        setCameraFacing('user');
        setTimeout(() => startCamera(), 100);
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      setIsStreamActive(false);
    }
  };

  const switchCamera = async () => {
    await stopCamera();
    
    // Toggle between front and back cameras
    setCameraFacing(prev => prev === 'environment' ? 'user' : 'environment');
    
    // Small delay to ensure camera is properly stopped before restarting
    setTimeout(() => {
      startCamera();
      plantService.triggerHaptic(ImpactStyle.Medium);
      soundService.playClick();
    }, 300);
  };
  
  const handleZoomChange = async (value: number[]) => {
    setZoomLevel(value[0]);
    
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const videoTrack = stream.getVideoTracks()[0];
      
      if (videoTrack && 'applyConstraints' in videoTrack) {
        try {
          await videoTrack.applyConstraints({
            advanced: [{ zoom: value[0] }]
          });
          plantService.triggerHaptic(ImpactStyle.Light);
        } catch (error) {
          console.error("Zoom not supported on this device:", error);
        }
      }
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current && isStreamActive) {
      plantService.triggerHaptic(ImpactStyle.Medium);
      soundService.playClick();
      
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
        const photoData = canvas.toDataURL('image/jpeg', 0.95); // Higher quality
        setCapturedImage(photoData);
        
        // Stop camera after taking photo
        stopCamera();
      }
    }
  };

  const usePhoto = () => {
    if (capturedImage) {
      plantService.triggerHaptic(ImpactStyle.Medium);
      soundService.playSuccess();
      onCapture(capturedImage);
    }
  };

  const retakePhoto = () => {
    plantService.triggerHaptic(ImpactStyle.Light);
    soundService.playClickSoft();
    setCapturedImage(null);
    startCamera();
  };

  return (
    <div className="camera-view w-full">
      <AspectRatio ratio={isMobile ? 3/4 : 16/9} className="relative overflow-hidden rounded-lg bg-black">
        {!capturedImage ? (
          // Live camera view
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover transform"
              style={{ transform: cameraFacing === 'user' ? 'scaleX(-1)' : 'none' }}
            />
            
            {/* Camera controls overlay */}
            <div className="absolute inset-0 flex flex-col justify-between p-3">
              <div className="flex justify-end space-x-2">
                {hasMultipleCameras && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm border-white/20 text-white"
                    onClick={switchCamera}
                  >
                    <FlipHorizontal className="h-5 w-5" />
                  </Button>
                )}
              </div>
              
              {/* Zoom control */}
              <div className="w-4/5 mx-auto bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-3">
                <ZoomOut className="h-4 w-4 text-white" />
                <Slider 
                  value={[zoomLevel]}
                  min={1}
                  max={maxZoom}
                  step={0.1}
                  onValueChange={handleZoomChange}
                  className="flex-grow"
                />
                <ZoomIn className="h-4 w-4 text-white" />
                <span className="text-white text-xs font-medium ml-2">{zoomLevel.toFixed(1)}x</span>
              </div>
            </div>
          </>
        ) : (
          // Captured photo view
          <img 
            src={capturedImage} 
            alt="Captured" 
            className="w-full h-full object-cover" 
            style={{ transform: cameraFacing === 'user' ? 'scaleX(-1)' : 'none' }}
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
              onClick={() => {
                plantService.triggerHaptic(ImpactStyle.Light);
                soundService.playClickSoft();
                onCancel();
              }}
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
              <RefreshCcw className="w-6 h-6" />
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
