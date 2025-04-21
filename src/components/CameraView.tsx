import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, ArrowLeft, FlipHorizontal } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { plantService } from '@/services/plant-service';
import { soundService } from '@/services/sound-service';
import { ImpactStyle } from '@capacitor/haptics';
import CameraOverlay from './CameraOverlay';

interface CameraViewProps {
  onCapture: (imageSrc: string) => void;
  onCancel: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isCapturing, setIsCapturing] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const enableCamera = async () => {
      try {
        const constraints = {
          video: {
            facingMode: facingMode,
            width: { ideal: isMobile ? 1280 : 1920 },
            height: { ideal: isMobile ? 720 : 1080 }
          }
        };

        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(mediaStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play();
        }
        
        setHasPermission(true);
      } catch (err) {
        console.error("Error accessing camera:", err);
        setHasPermission(false);
      }
    };

    enableCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode, isMobile]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return;
    
    setIsCapturing(true);
    plantService.triggerHaptic(ImpactStyle.Medium);
    soundService.playClick();
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.9);
      onCapture(imageData);
    }
    
    setIsCapturing(false);
  };

  const toggleCamera = async () => {
    plantService.triggerHaptic(ImpactStyle.Light);
    soundService.playClickSoft();
    setFacingMode(facingMode === 'environment' ? 'user' : 'environment');
  };

  if (hasPermission === false) {
    return (
      <Card className="p-6 text-center">
        <h3 className="text-lg font-medium mb-4">Camera Access Required</h3>
        <p className="mb-4">Please allow camera access to use this feature.</p>
        <Button onClick={onCancel}>Go Back</Button>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden bg-black">
      <div className="aspect-ratio-4/3 relative">
        <video 
          ref={videoRef} 
          className="w-full h-full object-cover"
          autoPlay 
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="hidden" />
        <CameraOverlay />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent backdrop-blur-sm">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 rounded-full transition-colors"
            onClick={() => {
              plantService.triggerHaptic();
              soundService.playClickSoft();
              onCancel();
            }}
          >
            <ArrowLeft size={24} />
          </Button>
          
          <Button
            disabled={isCapturing}
            className="bg-white hover:bg-white/90 rounded-full h-16 w-16 p-0 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
            onClick={handleCapture}
          >
            <Camera className="h-8 w-8 text-black" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 rounded-full transition-colors"
            onClick={toggleCamera}
          >
            <FlipHorizontal size={24} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CameraView;
