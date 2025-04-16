
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

class SoundService {
  private clickSound: HTMLAudioElement | null = null;
  
  constructor() {
    if (typeof window !== 'undefined') {
      this.clickSound = new Audio('/sounds/click.mp3');
      // Preload the sound
      this.clickSound.load();
    }
  }

  async playClickSound() {
    try {
      // Play sound if available
      if (this.clickSound) {
        // Reset the sound to the beginning if it's already playing
        this.clickSound.currentTime = 0;
        await this.clickSound.play();
      }
      
      // Trigger haptic feedback on mobile devices
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Medium });
      }
    } catch (error) {
      console.error('Error playing sound:', error);
      // Still try haptic even if sound fails
      if (Capacitor.isNativePlatform()) {
        try {
          await Haptics.impact({ style: ImpactStyle.Medium });
        } catch (hapticError) {
          console.error('Haptic feedback error:', hapticError);
        }
      }
    }
  }
  
  async playSuccessSound() {
    if (Capacitor.isNativePlatform()) {
      await Haptics.notification({ type: NotificationType.Success });
    }
  }
  
  async playErrorSound() {
    if (Capacitor.isNativePlatform()) {
      await Haptics.notification({ type: NotificationType.Error });
    }
  }
}

export const soundService = new SoundService();

