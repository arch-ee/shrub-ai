
import { Capacitor } from '@capacitor/core';

class SoundService {
  private clickSound: HTMLAudioElement | null = null;
  private clickSoftSound: HTMLAudioElement | null = null;
  private successSound: HTMLAudioElement | null = null;
  private errorSound: HTMLAudioElement | null = null;
  private isSoundEnabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this.clickSound = new Audio('/sounds/click.mp3');
      this.clickSoftSound = new Audio('/sounds/click-soft.mp3');
      this.successSound = new Audio('/sounds/success.mp3');
      this.errorSound = new Audio('/sounds/error.mp3');
      
      // Preload sounds
      this.clickSound.load();
      this.clickSoftSound.load();
      this.successSound.load();
      this.errorSound.load();
    }
  }

  toggleSound(enabled?: boolean): boolean {
    if (enabled !== undefined) {
      this.isSoundEnabled = enabled;
    } else {
      this.isSoundEnabled = !this.isSoundEnabled;
    }
    return this.isSoundEnabled;
  }

  isSoundOn(): boolean {
    return this.isSoundEnabled;
  }

  playClick() {
    if (!this.isSoundEnabled || !this.clickSound) return;
    this.clickSound.currentTime = 0;
    this.clickSound.play().catch(e => console.error("Error playing click sound:", e));
  }

  playClickSoft() {
    if (!this.isSoundEnabled || !this.clickSoftSound) return;
    this.clickSoftSound.currentTime = 0;
    this.clickSoftSound.play().catch(e => console.error("Error playing soft click sound:", e));
  }

  playSuccess() {
    if (!this.isSoundEnabled || !this.successSound) return;
    this.successSound.currentTime = 0;
    this.successSound.play().catch(e => console.error("Error playing success sound:", e));
  }

  playError() {
    if (!this.isSoundEnabled || !this.errorSound) return;
    this.errorSound.currentTime = 0;
    this.errorSound.play().catch(e => console.error("Error playing error sound:", e));
  }
}

export const soundService = new SoundService();
