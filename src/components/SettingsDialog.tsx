import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { settingsService, AppSettings } from '@/services/settings-service';
import { plantService } from '@/services/plant-service';
import { soundService } from '@/services/sound-service';
import { ImpactStyle } from '@capacitor/haptics';
import { Type, ShoppingBag, Camera } from 'lucide-react';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const [settings, setSettings] = useState<AppSettings>(settingsService.getSettings());

  useEffect(() => {
    if (open) {
      setSettings(settingsService.getSettings());
    }
  }, [open]);

  const handleTextSizeChange = (size: 'small' | 'medium' | 'large') => {
    const newSettings = { ...settings, textSize: size };
    setSettings(newSettings);
    settingsService.setTextSize(size);
    plantService.triggerHaptic(ImpactStyle.Light);
  };

  const handleShoppingOptionsChange = (show: boolean) => {
    const newSettings = { ...settings, showShoppingOptions: show };
    setSettings(newSettings);
    settingsService.setShowShoppingOptions(show);
    plantService.triggerHaptic(ImpactStyle.Light);
  };

  const handleCameraZoomChange = (zoom: number[]) => {
    const zoomLevel = zoom[0];
    const newSettings = { ...settings, cameraZoomLevel: zoomLevel };
    setSettings(newSettings);
    settingsService.setCameraZoomLevel(zoomLevel);
    plantService.triggerHaptic(ImpactStyle.Light);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md h-[80vh] flex flex-col" style={{ marginTop: '1cm', marginBottom: '1cm' }}>
        <DialogHeader className="pb-4">
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize your app experience
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Text Size Settings */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4 text-leaf-600 dark:text-leaf-400" />
                <Label className="text-base font-medium">Text Size</Label>
              </div>
              <Select value={settings.textSize} onValueChange={handleTextSizeChange}>
                <SelectTrigger className="w-full min-h-[48px]">
                  <SelectValue placeholder="Select text size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small (12px)</SelectItem>
                  <SelectItem value="medium">Medium (16px)</SelectItem>
                  <SelectItem value="large">Large (20px)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Adjust the text size throughout the app
              </p>
            </div>

            <Separator />

            {/* Shopping Options Settings */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-leaf-600 dark:text-leaf-400" />
                <Label className="text-base font-medium">Shopping Options</Label>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="shopping-toggle">Show shopping suggestions</Label>
                  <p className="text-sm text-muted-foreground">
                    Display where to buy identified plants
                  </p>
                </div>
                <Switch
                  id="shopping-toggle"
                  checked={settings.showShoppingOptions}
                  onCheckedChange={handleShoppingOptionsChange}
                />
              </div>
            </div>

            <Separator />

            {/* Camera Zoom Settings */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-leaf-600 dark:text-leaf-400" />
                <Label className="text-base font-medium">Camera Zoom</Label>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="zoom-slider">Default zoom level</Label>
                  <span className="text-sm font-medium bg-leaf-100 dark:bg-leaf-900/30 px-2 py-1 rounded">
                    {settings.cameraZoomLevel.toFixed(1)}x
                  </span>
                </div>
                <Slider
                  id="zoom-slider"
                  min={1}
                  max={5}
                  step={0.25}
                  value={[settings.cameraZoomLevel]}
                  onValueChange={handleCameraZoomChange}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  Set the default zoom level when opening the camera
                </p>
              </div>
            </div>

            <Separator />

            {/* App Info */}
            <div className="space-y-3">
              <Label className="text-base font-medium">About</Label>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>shrubAI</strong> - Your pocket botanist</p>
                <p>Version 1.0.0</p>
                <p>Powered by AI plant identification</p>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="pt-4 border-t" style={{ paddingBottom: '1cm' }}>
          <Button 
            onClick={() => {
              plantService.triggerHaptic(ImpactStyle.Light);
              onOpenChange(false);
            }}
            className="w-full bg-leaf-500 hover:bg-leaf-600 text-white min-h-[48px]"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;