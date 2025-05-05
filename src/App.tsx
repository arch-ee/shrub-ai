
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Keyboard } from "@capacitor/keyboard";
import { LocalNotifications } from "@capacitor/local-notifications";
import { pushNotificationService } from "@/services/push-notification-service";
import { plantService } from "@/services/plant-service";
import { soundService } from "@/services/sound-service";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Initialize the query client outside of the component
const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const initializeNativeFeatures = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          console.log("Running on native platform:", Capacitor.getPlatform());
          
          // Hide splash screen after app is ready
          await SplashScreen.hide();
          
          // Set status bar style
          await StatusBar.setStyle({ style: Style.Dark });
          if (Capacitor.getPlatform() === 'android') {
            StatusBar.setBackgroundColor({ color: '#f8fafc' });
          }
          
          // Initialize push notifications
          await pushNotificationService.register();
          pushNotificationService.addListeners(
            // Token received 
            (token) => console.log("Push token received:", token.value),
            // Notification received
            (notification) => console.log("Notification received:", notification),
            // Action performed
            (notification) => console.log("Action performed:", notification)
          );
          
          // Setup local notifications
          const notifPermission = await LocalNotifications.requestPermissions();
          console.log("Local notification permission:", notifPermission.display);
          
          // Register action types for notifications
          await LocalNotifications.registerActionTypes({
            types: [
              {
                id: 'water',
                actions: [
                  {
                    id: 'water-now',
                    title: 'Water now',
                  },
                  {
                    id: 'remind-later',
                    title: 'Remind me later',
                    input: true,
                  }
                ]
              }
            ]
          });
          
          // Handle keyboard events
          Keyboard.addListener('keyboardWillShow', () => {
            console.log('Keyboard will show');
          });
          
          Keyboard.addListener('keyboardDidHide', () => {
            console.log('Keyboard did hide');
          });
          
          // Test local notification
          setTimeout(() => {
            pushNotificationService.sendLocalTestNotification(
              "Welcome to PlantApp", 
              "Your plant identification app is ready to use!"
            );
          }, 5000);
          
        } catch (error) {
          console.error("Error initializing native features:", error);
        }
      } else {
        console.log("Running in browser environment");
      }
    };

    initializeNativeFeatures();
    
    // Create sample sound files folder
    const setupSampleSounds = () => {
      console.log("Sound service initialized");
    };
    
    setupSampleSounds();
    
    // Cleanup listeners when component unmounts
    return () => {
      if (Capacitor.isNativePlatform()) {
        pushNotificationService.removeAllListeners();
        Keyboard.removeAllListeners();
        LocalNotifications.removeAllListeners();
      }
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* Redirect /trivia to home page */}
              <Route path="/trivia" element={<Navigate to="/" replace />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
