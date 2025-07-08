

import React, { useState, useEffect } from 'react';
import { Camera, Upload, Sprout, HelpCircle, Settings, Sun, Moon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import CameraView from './CameraView';
import PlantInfoCard from './PlantInfoCard';
import ThemeToggle from './ThemeToggle';
import OnlineStores from './store-locator/OnlineStores';
import SettingsDialog from './SettingsDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Capacitor } from '@capacitor/core';
import { useIsMobile } from '@/hooks/use-mobile';
import { plantService } from '@/services/plant-service';
import { soundService } from '@/services/sound-service';
import { settingsService } from '@/services/settings-service';
import { ImpactStyle } from '@capacitor/haptics';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useTheme } from './ThemeProvider';
import { scanLimitService } from '@/services/scan-limit-service';
import { supabase } from '@/integrations/supabase/client';

interface PlantInfo {
  name: string;
  scientificName?: string;
  health: number;
  waterNeeds: string;
  sunlight: string;
  temperature: string;
  diagnosis?: string;
  cure?: string;
  hasRottenLeaves?: boolean;
  isEdible?: boolean;
  toxicity?: string;
  warning?: string;
  category?: 'plant' | 'fruit' | 'berry' | 'fungi';
  nutritionalValue?: string;
  safeToTouch?: boolean;
  
  // Additional info fields
  soilType?: string;
  growthStage?: string;
  propagationMethod?: string;
  commonDiseases?: string;
  careInstructions?: string;
  seasonalChanges?: string;
  pruningNeeds?: string;
  fertilizationSchedule?: string;
  expectedLifespan?: string;
  nativeRegion?: string;
  indoorOrOutdoor?: string;
  companionPlants?: string;
  pests?: string;
}

const PlantIdentifier = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [plantInfo, setPlantInfo] = useState<PlantInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [remainingScans, setRemainingScans] = useState(10);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  
  const geminiApiKey = 'AIzaSyDskk1srl5d4hsWDhSvzZSVi1vezIkgaf8';
  
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      LocalNotifications.requestPermissions();
    }
    
    // Check authentication and scan limits
    checkAuthAndLimits();
    
    // Apply saved text size
    const textSize = settingsService.getTextSize();
    const root = document.documentElement;
    root.classList.remove('text-size-small', 'text-size-medium', 'text-size-large');
    root.classList.add(`text-size-${textSize}`);
  }, []);

  const checkAuthAndLimits = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      setIsAuthenticated(true);
      const { remainingScans } = await scanLimitService.canUserScan();
      setRemainingScans(remainingScans);
    } else {
      // Sign in anonymously for tracking
      const { data, error } = await supabase.auth.signInAnonymously();
      if (!error && data.user) {
        setIsAuthenticated(true);
        const { remainingScans } = await scanLimitService.canUserScan();
        setRemainingScans(remainingScans);
      }
    }
  };
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        plantService.triggerHaptic(ImpactStyle.Light);
        soundService.playClick();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (imageSrc: string) => {
    setSelectedImage(imageSrc);
    setShowCamera(false);
    plantService.triggerHaptic(ImpactStyle.Light);
    soundService.playClick();
  };
  
  const handleAutoCaptureAndIdentify = (imageSrc: string) => {
    // Set the image first
    setSelectedImage(imageSrc);
    // Then start the identification process
    identifyPlantWithImage(imageSrc);
  };

  const handleCameraCancel = () => {
    setShowCamera(false);
    plantService.triggerHaptic(ImpactStyle.Light);
    soundService.playClickSoft();
  };

  const getCategoryPrompt = () => {
    return "Identify this plant, fruit, berry or fungi from the image. Analyze its health condition in detail. Indicate if it's edible or harmful/poisonous. You MUST respond with ONLY a valid JSON object containing these fields: name (common name), scientificName, health (as a percentage from 0-100 based on visible condition), waterNeeds, sunlight, temperature, hasRottenLeaves (boolean), diagnosis (if there are any issues), cure (treatment recommendations), isEdible (boolean), toxicity (none, mild, moderate, severe), warning (symptoms or harm if consumed or touched), category (one of: 'plant', 'fruit', 'berry', 'fungi'), nutritionalValue (if edible), safeToTouch (boolean), soilType, growthStage, propagationMethod, commonDiseases, careInstructions, seasonalChanges, pruningNeeds, fertilizationSchedule, expectedLifespan, nativeRegion, indoorOrOutdoor, companionPlants, pests. Add as much detail as possible for all fields. If you cannot identify the item, set name to null. No explanations, just the JSON.";
  };

  const shouldShowToxicityNotification = (plantData: any): boolean => {
    const commonHouseplants = [
      'money plant', 'pothos', 'snake plant', 'zz plant', 'spider plant',
      'peace lily', 'fiddle leaf fig', 'monstera', 'philodendron',
      'rubber plant', 'dracaena', 'palm', 'succulent', 'cactus',
      'aloe vera', 'jade plant', 'boston fern', 'chinese evergreen',
      'prayer plant', 'african violet', 'orchid'
    ];
    
    const isCommonHouseplant = commonHouseplants.some(plant => 
      plantData.name.toLowerCase().includes(plant.toLowerCase())
    );
    
    return (
      plantData.toxicity && 
      plantData.toxicity !== 'none' && 
      plantData.toxicity !== 'unknown' && 
      !isCommonHouseplant
    );
  };

  const identifyPlantWithImage = async (imageSrc: string) => {
    if (!imageSrc) {
      toast({
        title: "no image selected",
        description: "please take or upload a photo first",
        variant: "destructive",
      });
      plantService.triggerHaptic(ImpactStyle.Medium);
      return;
    }

    // Check scan limits
    const { canScan, remainingScans: remaining } = await scanLimitService.canUserScan();
    
    if (!canScan) {
      toast({
        title: "Daily limit reached",
        description: "You've used all 10 identifications for today. Limit resets at 12 AM PDT.",
        variant: "destructive",
      });
      plantService.triggerHaptic(ImpactStyle.Heavy);
      return;
    }
    setIsLoading(true);
    plantService.triggerHaptic(ImpactStyle.Light);
    
    try {
      // Increment scan count
      await scanLimitService.incrementScanCount();
      setRemainingScans(remaining - 1);
      
      const base64Image = imageSrc.split(',')[1];
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: getCategoryPrompt()
                },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: base64Image
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            topK: 32,
            topP: 1,
            maxOutputTokens: 4096,
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response from API');
      }
      
      const textResponse = data.candidates[0].content.parts[0].text;
      console.log("Raw API response:", textResponse);
      
      try {
        const jsonMatch = textResponse.match(/```json\n([\s\S]*?)\n```/) || 
                        textResponse.match(/```\n([\s\S]*?)\n```/) || 
                        [null, textResponse];
        
        const jsonString = jsonMatch[1] || textResponse;
        const plantData = JSON.parse(jsonString);
        
        if (plantData.name === null) {
          setPlantInfo({
            name: "Unknown plant",
            health: 0,
            waterNeeds: 'Unknown',
            sunlight: 'Unknown',
            temperature: 'Unknown',
            isEdible: false,
            toxicity: 'Unknown',
            category: 'plant',
            safeToTouch: false
          });
          
          toast({
            title: "plant not identified",
            description: "We couldn't identify this plant. Try taking a clearer picture.",
            variant: "destructive",
          });
          plantService.triggerHaptic(ImpactStyle.Heavy);
        } else {
          const category = plantData.category || 'plant';
          
          setPlantInfo({
            name: plantData.name || "Unknown plant",
            scientificName: plantData.scientificName,
            health: parseInt(plantData.health) || 70,
            waterNeeds: plantData.waterNeeds || 'Unknown',
            sunlight: plantData.sunlight || 'Unknown',
            temperature: plantData.temperature || 'Unknown',
            diagnosis: plantData.diagnosis,
            cure: plantData.cure,
            hasRottenLeaves: plantData.hasRottenLeaves || false,
            isEdible: plantData.isEdible || false,
            toxicity: plantData.toxicity || 'Unknown',
            warning: plantData.warning,
            category: category,
            nutritionalValue: plantData.nutritionalValue,
            safeToTouch: plantData.safeToTouch !== undefined ? plantData.safeToTouch : true,
            // Additional detailed info fields
            soilType: plantData.soilType,
            growthStage: plantData.growthStage,
            propagationMethod: plantData.propagationMethod,
            commonDiseases: plantData.commonDiseases,
            careInstructions: plantData.careInstructions,
            seasonalChanges: plantData.seasonalChanges,
            pruningNeeds: plantData.pruningNeeds,
            fertilizationSchedule: plantData.fertilizationSchedule,
            expectedLifespan: plantData.expectedLifespan,
            nativeRegion: plantData.nativeRegion,
            indoorOrOutdoor: plantData.indoorOrOutdoor,
            companionPlants: plantData.companionPlants,
            pests: plantData.pests,
          });
          
          toast({
            title: `${category} identified`,
            description: `This appears to be a ${plantData.name}.`,
          });
          plantService.triggerHaptic(ImpactStyle.Medium);
          
          if (category === 'plant' && plantData.hasRottenLeaves && plantData.health < 50) {
            toast({
              title: "issue detected",
              description: "This plant has signs of disease or damage.",
              variant: "destructive",
            });
            plantService.triggerHaptic(ImpactStyle.Heavy);
          }
          
          if (shouldShowToxicityNotification(plantData)) {
            toast({
              title: "caution required",
              description: `This ${category} has ${plantData.toxicity} toxicity.`,
              variant: "destructive",
            });
            plantService.triggerHaptic(ImpactStyle.Heavy);
          }

          if (category === 'fungi' && (plantData.isEdible === true)) {
            toast({
              title: "fungi identification disclaimer",
              description: "Never consume any fungi based solely on AI identification. Always consult with an expert.",
              variant: "destructive",
            });
            plantService.triggerHaptic(ImpactStyle.Heavy);
          }
        }
      } catch (jsonError) {
        console.error("Error parsing JSON from response:", jsonError);
        console.log("Raw text response:", textResponse);
        
        setPlantInfo({
          name: "Unknown plant",
          health: 0,
          waterNeeds: 'Unknown',
          sunlight: 'Unknown',
          temperature: 'Unknown',
          isEdible: false,
          toxicity: 'Unknown',
          category: 'plant',
          safeToTouch: false
        });
        
        toast({
          title: "plant not identified",
          description: "We couldn't identify this plant. Try taking a clearer picture.",
          variant: "destructive",
        });
        plantService.triggerHaptic(ImpactStyle.Heavy);
      }
    } catch (error) {
      console.error("Error identifying item:", error);
      toast({
        title: "identification failed",
        description: "unable to identify. please try again.",
        variant: "destructive",
      });
      
      setPlantInfo({
        name: "Unknown plant",
        health: 0,
        waterNeeds: 'Unknown',
        sunlight: 'Unknown',
        temperature: 'Unknown',
        isEdible: false,
        toxicity: 'Unknown',
        category: 'plant',
        safeToTouch: false
      });
      
      plantService.triggerHaptic(ImpactStyle.Heavy);
    } finally {
      setIsLoading(false);
      setShowCamera(false); // Make sure camera is closed after identification
    }
  };

  const identifyPlant = () => {
    if (selectedImage) {
      identifyPlantWithImage(selectedImage);
    } else {
      toast({
        title: "no image selected",
        description: "please take or upload a photo first",
        variant: "destructive",
      });
      plantService.triggerHaptic(ImpactStyle.Medium);
    }
  };

  const generateOnlineStores = (plantName: string) => {
    if (!plantName || plantName === "Unknown plant") return [];
    
    return [
      {
        name: "Amazon",
        url: `https://www.amazon.com/s?k=${encodeURIComponent(`${plantName} plant live`)}`,
        price: "Varies",
        description: `Find ${plantName} plants with fast shipping options.`
      },
      {
        name: "Etsy",
        url: `https://www.etsy.com/search?q=${encodeURIComponent(`${plantName} plant`)}`,
        price: "Varies",
        description: `Handpicked ${plantName} from independent growers and nurseries.`
      },
      {
        name: "Home Depot",
        url: `https://www.homedepot.com/s/${encodeURIComponent(`${plantName} plant`)}`,
        price: "$15-45",
        description: "Find plants online with in-store pickup options at your local Home Depot."
      },
      {
        name: "Walmart",
        url: `https://www.walmart.com/search?q=${encodeURIComponent(`${plantName} plant`)}`,
        price: "$10-30",
        description: "Affordable plants with delivery or pickup options."
      },
      {
        name: "Lowe's",
        url: `https://www.lowes.com/search?searchTerm=${encodeURIComponent(`${plantName} plant`)}`,
        price: "$15-40",
        description: "Garden center with a variety of plant options and gardening supplies."
      }
    ];
  };

  const showShoppingOptions = settingsService.getShowShoppingOptions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-cream-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center transition-colors duration-300 relative overflow-hidden p-8" style={{ minHeight: '100vh' }}>
      
      {/* Fixed button group positioned at bottom left */}
      <div className="fixed left-8 bottom-8 z-50 flex flex-col gap-1">
        <Button 
          variant="outline" 
          size="icon" 
          className="bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 rounded-full shadow-lg h-10 w-10 border-2 border-leaf-200 dark:border-gray-600"
          onClick={() => {
            setShowSettings(true);
            plantService.triggerHaptic();
          }}
        >
          <Settings className="h-5 w-5 text-leaf-600 dark:text-leaf-400" />
          <span className="sr-only">Settings</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="icon" 
          className="bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 rounded-full shadow-lg h-10 w-10 border-2 border-leaf-200 dark:border-gray-600"
          onClick={() => {
            toggleTheme();
            plantService.triggerHaptic();
          }}
        >
          <Sun className="h-5 w-5 text-leaf-600 dark:text-leaf-400 dark:hidden" />
          <Moon className="h-5 w-5 text-leaf-600 dark:text-leaf-400 hidden dark:block" />
          <span className="sr-only">Toggle theme</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="icon" 
          className="bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 rounded-full shadow-lg h-10 w-10 border-2 border-leaf-200 dark:border-gray-600"
          onClick={() => {
            setShowDocs(true);
            plantService.triggerHaptic();
          }}
        >
          <HelpCircle className="h-5 w-5 text-leaf-600 dark:text-leaf-400" />
          <span className="sr-only">Documentation</span>
        </Button>
      </div>

      {/* Main content area - centered vertically on launch, extends to bottom */}
      <div className="w-full max-w-md space-y-6 flex-1 flex flex-col justify-center" style={{ paddingBottom: '8rem' }}>
        <div className="text-center space-y-2 animate-fade-in">
          <h1 className="text-3xl font-medium text-leaf-900 dark:text-cream-100">your pocket botanist.</h1>
          {isAuthenticated && (
            <p className="text-sm text-leaf-600 dark:text-leaf-400">
              {remainingScans} identifications remaining today
            </p>
          )}
        </div>
        
        <div className="space-y-6">
          {showCamera ? (
            <CameraView
              onCapture={handleCameraCapture}
              onCancel={handleCameraCancel}
              onAutoIdentify={handleAutoCaptureAndIdentify}
            />
          ) : (
            <Card className="p-8 backdrop-blur-0 bg-white/100 border-leaf-100 shadow-lg animate-scale-in dark:bg-gray-800 dark:border-gray-700 dark:shadow-gray-900/30">
              <div className="space-y-6">
                <div className="flex justify-center">
                  {selectedImage ? (
                    <div className="aspect-[3/4] relative w-full rounded-lg overflow-hidden">
                      <img
                        src={selectedImage}
                        alt="Selected plant"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[3/4] w-full rounded-lg bg-cream-50 dark:bg-gray-700 flex items-center justify-center border-2 border-dashed border-leaf-200 dark:border-gray-600">
                      <Sprout className="w-16 h-16 text-leaf-400 dark:text-leaf-300" />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 no-margin">
                  <Button
                    variant="outline"
                    className="flex-1 bg-white hover:bg-white/80 transition-all dark:bg-gray-700/50 dark:hover:bg-gray-700/80 dark:text-cream-100 dark:border-gray-600 min-h-[48px] text-lg"
                    onClick={() => {
                      setShowCamera(true);
                      plantService.triggerHaptic();
                    }}
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    camera
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 bg-white hover:bg-white/80 transition-all dark:bg-gray-700/50 dark:hover:bg-gray-700/80 dark:text-cream-100 dark:border-gray-600 min-h-[48px] text-lg"
                    onClick={() => {
                      document.getElementById('upload')?.click();
                      plantService.triggerHaptic();
                    }}
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    upload
                  </Button>
                </div>

                <Button 
                  onClick={identifyPlant}
                  disabled={isLoading || !selectedImage}
                  className="w-full bg-leaf-500 hover:bg-leaf-600 text-white dark:bg-leaf-600 dark:hover:bg-leaf-700 min-h-[48px] text-lg no-margin"
                >
                  {isLoading ? "identifying..." : "identify plant"}
                </Button>

                <input
                  type="file"
                  id="upload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </Card>
          )}

          {plantInfo && (
            <>
              <PlantInfoCard plantInfo={plantInfo} />
              
              {showShoppingOptions && plantInfo.name && plantInfo.name !== "Unknown plant" && (
                <OnlineStores stores={generateOnlineStores(plantInfo.name)} />
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Fine print disclaimer */}
      <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 z-40">
        <p className="text-gray-900 dark:text-gray-100 opacity-40 text-center px-4" style={{ fontSize: '10px' }}>
          Information may be false, always verify with a trusted source.
        </p>
      </div>
      
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
      
      <Dialog open={showDocs} onOpenChange={setShowDocs}>
        <DialogContent className="max-w-md h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Plant Identification Help</DialogTitle>
            <DialogDescription>
              How to use your pocket botanist
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-medium mb-1">Taking a Photo</h3>
                <p>Click the camera button to use your device's camera. The app supports up to 4K resolution and 5x zoom. Use the zoom controls or mouse wheel to adjust.</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Camera Frame Colors</h3>
                <p>The frame borders change color to help you take better photos:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li><span className="text-green-500 font-medium">Green</span> - Good lighting and framing</li>
                  <li><span className="text-yellow-500 font-medium">Yellow</span> - Adjust position for better results</li>
                  <li><span className="text-red-500 font-medium">Red</span> - Poor lighting or framing</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-1">Uploading an Image</h3>
                <p>Click the upload button to select an image from your device's storage.</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Identification</h3>
                <p>After selecting an image, click "identify plant" to analyze it. The app will identify the plant and provide detailed information about it.</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Plant Information</h3>
                <p>The app will show details about the plant, including its name, care requirements, and whether it's safe or toxic.</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Settings</h3>
                <p>Use the settings button to customize text size, shopping options and camera zoom.</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Shopping Options</h3>
                <p>When enabled in settings, the app will show online stores where you can purchase identified plants.</p>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlantIdentifier;

