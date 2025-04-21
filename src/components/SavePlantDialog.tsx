
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { plantService } from '@/services/plant-service';
import { soundService } from '@/services/sound-service';
import { useToast } from '@/hooks/use-toast';

interface PlantInfo {
  name: string;
  scientificName?: string;
  health: number;
  waterNeeds: string;
  sunlight: string;
  temperature: string;
  category?: 'plant' | 'fruit' | 'berry' | 'fungi';
}

interface SavePlantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plantInfo: PlantInfo | null;
  plantImage: string | null;
}

const SavePlantDialog = ({ open, onOpenChange, plantInfo, plantImage }: SavePlantDialogProps) => {
  const [plantName, setPlantName] = useState(plantInfo?.name || '');
  const [wateringInterval, setWateringInterval] = useState(7); // Default: weekly
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  // Reset form when dialog opens with new plant
  React.useEffect(() => {
    if (open && plantInfo) {
      setPlantName(plantInfo.name);
      const suggestedInterval = plantService.calculateWateringInterval(plantInfo.waterNeeds);
      setWateringInterval(suggestedInterval);
      setNotes('');
    }
  }, [open, plantInfo]);

  const handleSave = () => {
    if (!plantInfo || !plantImage) {
      toast({
        title: "Missing information",
        description: "Cannot save plant without identification or image",
        variant: "destructive",
      });
      plantService.triggerHapticError();
      return;
    }

    if (!plantName.trim()) {
      toast({
        title: "Name required",
        description: "Please give your plant a name",
        variant: "destructive",
      });
      plantService.triggerHapticError();
      return;
    }

    try {
      const now = new Date();
      const nextWatering = new Date();
      nextWatering.setDate(now.getDate() + wateringInterval);

      const savedPlant = plantService.savePlant({
        name: plantName,
        scientificName: plantInfo.scientificName,
        category: plantInfo.category || 'plant',
        image: plantImage,
        waterNeeds: plantInfo.waterNeeds,
        wateringInterval: wateringInterval,
        lastWatered: now,
        nextWateringDate: nextWatering,
        sunlight: plantInfo.sunlight,
        temperature: plantInfo.temperature,
        notes: notes
      });

      plantService.triggerHapticSuccess();
      soundService.playSuccess();
      
      toast({
        title: "Plant saved!",
        description: `${plantName} has been added to your collection`
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error saving plant:', error);
      plantService.triggerHapticError();
      toast({
        title: "Failed to save",
        description: "An error occurred while saving your plant",
        variant: "destructive",
      });
    }
  };

  const getIntervalLabel = (days: number) => {
    if (days === 1) return "Daily";
    if (days <= 7) return `Every ${days} days`;
    if (days === 7) return "Weekly";
    if (days === 14) return "Every 2 weeks";
    if (days === 21) return "Every 3 weeks";
    if (days === 28) return "Monthly";
    return `Every ${days} days`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Plant</DialogTitle>
          <DialogDescription>
            Save this plant to your collection and set up watering reminders
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {plantImage && (
            <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-leaf-300">
              <img 
                src={plantImage} 
                alt="Plant" 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name">Plant Name</Label>
            <Input
              id="name"
              value={plantName}
              onChange={(e) => setPlantName(e.target.value)}
              placeholder="My lovely plant"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="watering">Watering Schedule</Label>
              <span className="text-sm text-muted-foreground">{getIntervalLabel(wateringInterval)}</span>
            </div>
            <Slider
              id="watering"
              min={1}
              max={28}
              step={1}
              value={[wateringInterval]}
              onValueChange={(vals) => setWateringInterval(vals[0])}
              className="py-4"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special care instructions..."
            />
          </div>
        </div>
        
        <DialogFooter className="flex space-x-2 justify-end">
          <Button 
            variant="outline" 
            onClick={() => {
              plantService.triggerHaptic(ImpactStyle.Light);
              soundService.playClickSoft();
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              plantService.triggerHaptic();
              soundService.playClick();
              handleSave();
            }}
            className="bg-leaf-500 hover:bg-leaf-600 text-white"
          >
            Save Plant
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SavePlantDialog;
