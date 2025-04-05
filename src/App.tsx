
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Keyboard } from "@capacitor/keyboard";
import { pushNotificationService } from "@/services/push-notification-service";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PlantTrivia from "./pages/PlantTrivia";

// Initialize the query client outside of the component
const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const initializeNativeFeatures = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          // Hide splash screen after app is ready
          await SplashScreen.hide();
          
          // Set status bar style - fixed to use the correct enum value
          await StatusBar.setStyle({ style: Style.Dark });
          
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
          
          // Handle keyboard events
          Keyboard.addListener('keyboardWillShow', () => {
            console.log('Keyboard will show');
          });
          
          Keyboard.addListener('keyboardDidHide', () => {
            console.log('Keyboard did hide');
          });
        } catch (error) {
          console.error("Error initializing native features:", error);
        }
      }
    };

    initializeNativeFeatures();
    
    // Cleanup listeners when component unmounts
    return () => {
      if (Capacitor.isNativePlatform()) {
        pushNotificationService.removeAllListeners();
        Keyboard.removeAllListeners();
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
              <Route path="/trivia" element={<PlantTrivia />} />
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
