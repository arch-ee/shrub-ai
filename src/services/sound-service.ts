class SoundService {
  private isSoundEnabled: boolean = false; // Disabled by default

  constructor() {
    // No audio files loaded - sounds are disabled
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
    // Sound disabled - no action
  }

  playClickSoft() {
    // Sound disabled - no action
  }

  playSuccess() {
    // Sound disabled - no action
  }

  playError() {
    // Sound disabled - no action
  }
}

export const soundService = new SoundService();