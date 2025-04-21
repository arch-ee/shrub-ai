
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Droplet, Trash2, CheckCircle } from 'lucide-react';
import { plantService, SavedPlant } from '@/services/plant-service';
import { soundService } from '@/services/sound-service';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, isToday, isTomorrow, addDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ImpactStyle } from '@capacitor/haptics';

const MyPlants = () => {
  const [plants, setPlants] = useState<SavedPlant[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load plants on component mount
    loadPlants();
  }, []);

  const loadPlants = () => {
    const savedPlants = plantService.getAllPlants();
    setPlants(savedPlants);
  };

  const handleWaterPlant = (plantId: string) => {
    const updatedPlant = plantService.waterPlant(plantId);
    if (updatedPlant) {
      plantService.triggerHapticSuccess();
      soundService.playSuccess();
      toast({
        title: "Plant watered!",
        description: `${updatedPlant.name} has been watered.`
      });
      loadPlants(); // Refresh plant list
    }
  };

  const handleDeletePlant = (plantId: string, plantName: string) => {
    if (confirm(`Are you sure you want to delete ${plantName}?`)) {
      const deleted = plantService.deletePlant(plantId);
      if (deleted) {
        plantService.triggerHaptic();
        soundService.playClickSoft();
        toast({
          title: "Plant deleted",
          description: `${plantName} has been removed from your collection.`
        });
        loadPlants(); // Refresh plant list
      }
    }
  };

  const formatNextWatering = (date: Date) => {
    if (isToday(date)) {
      return 'Today!';
    } else if (isTomorrow(date)) {
      return 'Tomorrow';
    } else if (date < new Date()) {
      return 'Overdue!';
    } else {
      return format(date, 'MMM d');
    }
  };

  const getWateringStatus = (date: Date) => {
    if (date < new Date()) {
      return 'overdue';
    } else if (isToday(date)) {
      return 'today';
    } else if (date <= addDays(new Date(), 2)) {
      return 'soon';
    } else {
      return 'ok';
    }
  };

  const getWateringStatusColor = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'today':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'soon':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    }
  };

  if (plants.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-2">No plants saved yet</p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Identify a plant and save it to your collection to see it here
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">My Plants ({plants.length})</h3>
      <ScrollArea className="h-[340px] rounded-md border">
        <div className="p-4 space-y-4">
          {plants.map((plant) => {
            const wateringStatus = getWateringStatus(plant.nextWateringDate);
            return (
              <Card key={plant.id} className="p-3 flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-3 flex-shrink-0">
                  <img 
                    src={plant.image} 
                    alt={plant.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-grow min-w-0">
                  <div className="flex flex-wrap items-start justify-between">
                    <h4 className="font-medium text-leaf-800 dark:text-leaf-300 truncate mr-2">
                      {plant.name}
                    </h4>
                    <Badge className={getWateringStatusColor(wateringStatus)}>
                      {formatNextWatering(plant.nextWateringDate)}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {plant.waterNeeds} water • {plant.sunlight} sunlight
                  </p>
                </div>
                
                <div className="flex ml-2 space-x-1">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => {
                      plantService.triggerHaptic(ImpactStyle.Light);
                      soundService.playClick();
                      handleWaterPlant(plant.id);
                    }}
                    className="text-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30"
                    title="Water plant"
                  >
                    <Droplet size={18} />
                  </Button>
                  
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => {
                      plantService.triggerHaptic(ImpactStyle.Medium);
                      soundService.playClickSoft();
                      handleDeletePlant(plant.id, plant.name);
                    }}
                    className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
                    title="Delete plant"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MyPlants;
