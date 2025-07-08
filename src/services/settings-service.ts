export interface AppSettings {
  textSize: 'small' | 'medium' | 'large';
  showShoppingOptions: boolean;
  cameraZoomLevel: number;
}

class SettingsService {
  private settings: AppSettings = {
    textSize: 'medium',
    showShoppingOptions: true,
    cameraZoomLevel: 1
  };
  
  private storageKey = 'app_settings';

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.settings = { ...this.settings, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  private saveSettings() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  private applyTextSize() {
    const root = document.documentElement;
    root.classList.remove('text-size-small', 'text-size-medium', 'text-size-large');
    root.classList.add(`text-size-${this.settings.textSize}`);
  }

  getSettings(): AppSettings {
    return { ...this.settings };
  }

  updateSettings(newSettings: Partial<AppSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    
    // Apply text size immediately if it changed
    if (newSettings.textSize) {
      this.applyTextSize();
    }
  }

  getTextSize(): 'small' | 'medium' | 'large' {
    return this.settings.textSize;
  }

  setTextSize(size: 'small' | 'medium' | 'large') {
    this.updateSettings({ textSize: size });
  }

  getShowShoppingOptions(): boolean {
    return this.settings.showShoppingOptions;
  }

  setShowShoppingOptions(show: boolean) {
    this.updateSettings({ showShoppingOptions: show });
  }

  getCameraZoomLevel(): number {
    return this.settings.cameraZoomLevel;
  }

  setCameraZoomLevel(zoom: number) {
    this.updateSettings({ cameraZoomLevel: Math.max(1, Math.min(5, zoom)) });
  }
}

export const settingsService = new SettingsService();