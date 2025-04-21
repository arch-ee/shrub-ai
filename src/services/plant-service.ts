
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { v4 as uuidv4 } from 'uuid';

export interface SavedPlant {
  id: string;
  name: string;
  scientificName?: string;
  category: 'plant' | 'fruit' | 'berry' | 'fungi';
  image: string;
  waterNeeds: string; 
  wateringInterval: number; // in days
  lastWatered: Date;
  nextWateringDate: Date;
  sunlight: string;
  temperature: string;
  notes?: string;
  createdAt: Date;
}

class PlantService {
  private plants: SavedPlant[] = [];
  private storageKey = 'saved_plants';

  constructor() {
    this.loadPlantsFromStorage();
  }

  // Haptic feedback methods
  async triggerHaptic(style: ImpactStyle = ImpactStyle.Medium) {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style });
    }
  }

  async triggerHapticSuccess() {
    if (Capacitor.isNativePlatform()) {
      await Haptics.notification({ type: 'SUCCESS' });
    }
  }

  async triggerHapticWarning() {
    if (Capacitor.isNativePlatform()) {
      await Haptics.notification({ type: 'WARNING' });
    }
  }

  async triggerHapticError() {
    if (Capacitor.isNativePlatform()) {
      await Haptics.notification({ type: 'ERROR' });
    }
  }

  // Plant management methods
  private loadPlantsFromStorage() {
    try {
      const storedPlants = localStorage.getItem(this.storageKey);
      if (storedPlants) {
        const parsedPlants = JSON.parse(storedPlants) as SavedPlant[];
        // Convert string dates back to Date objects
        this.plants = parsedPlants.map(plant => ({
          ...plant,
          lastWatered: new Date(plant.lastWatered),
          nextWateringDate: new Date(plant.nextWateringDate),
          createdAt: new Date(plant.createdAt)
        }));
      }
    } catch (error) {
      console.error('Failed to load plants from storage', error);
    }
  }

  private savePlantsToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.plants));
    } catch (error) {
      console.error('Failed to save plants to storage', error);
    }
  }

  getAllPlants(): SavedPlant[] {
    return [...this.plants];
  }

  getPlantById(id: string): SavedPlant | undefined {
    return this.plants.find(plant => plant.id === id);
  }

  savePlant(plantData: Omit<SavedPlant, 'id' | 'createdAt'>): SavedPlant {
    const newPlant: SavedPlant = {
      id: uuidv4(),
      ...plantData,
      createdAt: new Date()
    };

    this.plants.push(newPlant);
    this.savePlantsToStorage();
    this.scheduleWateringNotification(newPlant);
    return newPlant;
  }

  updatePlant(id: string, plantData: Partial<SavedPlant>): SavedPlant | null {
    const index = this.plants.findIndex(plant => plant.id === id);
    if (index === -1) return null;

    this.plants[index] = { ...this.plants[index], ...plantData };
    
    // If watering interval changed, update the next watering date
    if (plantData.wateringInterval || plantData.lastWatered) {
      const lastWatered = plantData.lastWatered || this.plants[index].lastWatered;
      const interval = plantData.wateringInterval || this.plants[index].wateringInterval;
      
      const nextDate = new Date(lastWatered);
      nextDate.setDate(nextDate.getDate() + interval);
      this.plants[index].nextWateringDate = nextDate;
    }
    
    this.savePlantsToStorage();
    this.scheduleWateringNotification(this.plants[index]);
    return this.plants[index];
  }

  deletePlant(id: string): boolean {
    const index = this.plants.findIndex(plant => plant.id === id);
    if (index === -1) return false;
    
    this.plants.splice(index, 1);
    this.savePlantsToStorage();
    return true;
  }

  waterPlant(id: string): SavedPlant | null {
    const index = this.plants.findIndex(plant => plant.id === id);
    if (index === -1) return null;
    
    const now = new Date();
    this.plants[index].lastWatered = now;
    
    // Calculate next watering date
    const nextDate = new Date(now);
    nextDate.setDate(now.getDate() + this.plants[index].wateringInterval);
    this.plants[index].nextWateringDate = nextDate;
    
    this.savePlantsToStorage();
    this.scheduleWateringNotification(this.plants[index]);
    return this.plants[index];
  }
  
  getPlantsNeedingWater(): SavedPlant[] {
    const today = new Date();
    return this.plants.filter(plant => {
      return plant.nextWateringDate <= today;
    });
  }

  // Notification methods
  async scheduleWateringNotification(plant: SavedPlant) {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      // Request permission first
      const permissionStatus = await LocalNotifications.requestPermissions();
      if (permissionStatus.display !== 'granted') {
        console.log('Notification permission not granted');
        return;
      }
      
      const notificationId = parseInt(plant.id.replace(/\D/g, '').substring(0, 8), 10);
      
      const options: ScheduleOptions = {
        notifications: [
          {
            id: notificationId,
            title: `Time to water ${plant.name}!`,
            body: `Your ${plant.name} needs water today.`,
            schedule: { at: plant.nextWateringDate },
            actionTypeId: 'water',
            extra: { plantId: plant.id }
          }
        ]
      };
      
      await LocalNotifications.schedule(options);
      console.log(`Scheduled notification for ${plant.name} on ${plant.nextWateringDate}`);
    } catch (error) {
      console.error('Failed to schedule notification', error);
    }
  }

  async setupNotificationListeners(onNotificationClicked: (plantId: string) => void) {
    if (!Capacitor.isNativePlatform()) return;
    
    LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
      const plantId = notification.notification.extra.plantId;
      if (plantId) {
        onNotificationClicked(plantId);
      }
    });
  }

  calculateWateringInterval(waterNeeds: string): number {
    // Convert water needs description to days between waterings
    const lowWaterTerms = ['low', 'minimal', 'infrequent', 'drought', 'dry'];
    const mediumWaterTerms = ['moderate', 'average', 'medium', 'regular'];
    const highWaterTerms = ['high', 'frequent', 'moist', 'wet', 'constant'];
    
    const lowerWaterNeeds = waterNeeds.toLowerCase();
    
    if (lowWaterTerms.some(term => lowerWaterNeeds.includes(term))) {
      return 14; // Water every 2 weeks
    }
    if (mediumWaterTerms.some(term => lowerWaterNeeds.includes(term))) {
      return 7; // Water every week
    }
    if (highWaterTerms.some(term => lowerWaterNeeds.includes(term))) {
      return 3; // Water every 3 days
    }
    
    return 7; // Default to weekly
  }
}

export const plantService = new PlantService();
