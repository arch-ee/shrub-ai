
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from './ThemeProvider';
import { soundService } from '@/services/sound-service';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  
  const handleToggle = () => {
    // Play sound and haptic feedback
    soundService.playClickSound();
    // Toggle theme
    toggleTheme();
  };
  
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggle}
      className="rounded-full w-10 h-10 bg-white/10 backdrop-blur-md border-white/20 dark:bg-gray-800/30 dark:border-gray-700/30 fixed top-4 right-4 z-50"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5 text-leaf-600" />
      ) : (
        <Sun className="h-5 w-5 text-cream-300" />
      )}
    </Button>
  );
};

export default ThemeToggle;
