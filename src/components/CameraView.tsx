import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, ArrowLeft, FlipHorizontal, ZoomIn, ZoomOut } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { plantService } from '@/services/plant-service';
import { soundService } from '@/services/sound-service';
import { settingsService } from '@/services/settings-service';
import { ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import CameraOverlay from './CameraOverlay';

interface CameraViewProps {
  onCapture: (imageSrc: string) => void;
  onCancel: () => void;
  onAutoIdentify: (imageSrc: string) => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, onCancel, onAutoIdentify }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isCapturing, setIsCapturing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(settingsService.getCameraZoomLevel());
  const [maxZoom, setMaxZoom] = useState(5);
  const [diagnosisStatus, setDiagnosisStatus] = useState<'good' | 'warning' | 'bad' | null>(null);
  const isMobile = useIsMobile();
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    const enableCamera = async () => {
      try {
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: facingMode,
            width: { ideal: 3840 },    // 4K
            height: { ideal: 2160 },   // 4K
          }
        };

        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(mediaStream);
        
        // Get camera track and available capabilities
        const videoTrack = mediaStream.getVideoTracks()[0];
        if (videoTrack) {
          const capabilities = videoTrack.getCapabilities();
          // Check if zoom is available
          if (capabilities && 'zoom' in capabilities) {
            if (capabilities.zoom && typeof capabilities.zoom === 'object' && 'max' in capabilities.zoom) {
              setMaxZoom(capabilities.zoom.max as number || 5);
            }
          }
        }
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play();
          
          // Apply initial zoom level
          applyZoom(zoomLevel);
          
          // Start simulating frame quality analysis
          startFrameAnalysis();
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
  }, [facingMode]);

  const applyZoom = async (zoom: number) => {
    if (!stream) return;
    
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack && videoTrack.applyConstraints) {
      try {
        await videoTrack.applyConstraints({
          advanced: [{ zoom: zoom } as any]
        });
      } catch (err) {
        console.warn("Couldn't apply zoom constraint:", err);
        // Fallback: apply CSS transform zoom
        if (videoRef.current) {
          videoRef.current.style.transform = `scale(${zoom})`;
        }
      }
    } else if (videoRef.current) {
      // Fallback: apply CSS transform zoom
      videoRef.current.style.transform = `scale(${zoom})`;
    }
  };

  const startFrameAnalysis = () => {
    // This simulates analyzing camera frame quality
    const interval = setInterval(() => {
      const statuses: ('good' | 'warning' | 'bad')[] = ['good', 'warning', 'bad'];
      // For demo, we'll randomly change states with a bias toward "good"
      const randomVal = Math.random();
      if (randomVal > 0.7) {
        setDiagnosisStatus(statuses[Math.floor(Math.random() * 3)]);
      } else {
        setDiagnosisStatus('good');
      }
    }, 2000);

    return () => clearInterval(interval);
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return;
    
    setIsCapturing(true);
    
    if (isNative) {
      plantService.triggerHaptic(ImpactStyle.Medium);
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.95); // Higher quality
      onCapture(imageData);
      onAutoIdentify(imageData); // Auto-identify the plant right away
    }
    
    setIsCapturing(false);
  };

  const toggleCamera = async () => {
    if (isNative) {
      plantService.triggerHaptic(ImpactStyle.Light);
    }
    setFacingMode(facingMode === 'environment' ? 'user' : 'environment');
  };
  
  const adjustZoom = (direction: 'in' | 'out') => {
    if (isNative) {
      plantService.triggerHaptic(ImpactStyle.Light);
    }
    
    const step = 0.25;
    let newZoom = zoomLevel;
    
    if (direction === 'in' && zoomLevel < maxZoom) {
      newZoom = Math.min(maxZoom, zoomLevel + step);
    } else if (direction === 'out' && zoomLevel > 1) {
      newZoom = Math.max(1, zoomLevel - step);
    }
    
    setZoomLevel(newZoom);
    settingsService.setCameraZoomLevel(newZoom);
    applyZoom(newZoom);
  };

  const handleZoomWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const direction = e.deltaY < 0 ? 'in' : 'out';
    adjustZoom(direction);
  };

  if (hasPermission === false) {
    return (
      <Card className="p-6 text-center">
        <h3 className="text-lg font-medium mb-4">Camera Access Required</h3>
        <p className="mb-4">Please allow camera access to use this feature.</p>
        <Button onClick={onCancel} className="min-h-[37px] mt-[1cm] mb-[1cm]">Go Back</Button>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden bg-black">
      <div className="aspect-[3/4] relative">
        <video 
          ref={videoRef} 
          className="w-full h-full object-cover"
          autoPlay 
          playsInline
          muted
          onWheel={handleZoomWheel}
        />
        <canvas ref={canvasRef} className="hidden" />
        <CameraOverlay diagnosisStatus={diagnosisStatus} showTips={false} />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent" style={{ paddingBottom: '1cm', paddingTop: '1cm' }}>
        <div className="flex justify-between items-center max-w-md mx-auto">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 rounded-full transition-colors min-h-[37px] min-w-[37px]"
            onClick={() => {
              if (isNative) {
                plantService.triggerHaptic();
              }
              onCancel();
            }}
          >
            <ArrowLeft size={24} />
          </Button>
          
          <div className="flex flex-col items-center">
            <div className="flex mb-3 gap-3">
              <Button 
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 rounded-full h-8 w-8 transition-colors min-h-[37px] min-w-[37px]"
                onClick={() => adjustZoom('out')}
              >
                <ZoomOut size={18} />
              </Button>
              <div className="text-white text-xs font-medium bg-black/40 rounded-full px-2 py-1 min-w-[60px] text-center min-h-[37px] flex items-center justify-center">
                {zoomLevel.toFixed(1)}x
              </div>
              <Button 
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 rounded-full h-8 w-8 transition-colors min-h-[37px] min-w-[37px]"
                onClick={() => adjustZoom('in')}
              >
                <ZoomIn size={18} />
              </Button>
            </div>
            
            <Button
              disabled={isCapturing}
              className="bg-white hover:bg-white/90 rounded-full h-16 w-16 p-0 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 min-h-[37px] min-w-[37px]"
              onClick={handleCapture}
            >
              <Camera className="h-8 w-8 text-black" />
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 rounded-full transition-colors min-h-[37px] min-w-[37px]"
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