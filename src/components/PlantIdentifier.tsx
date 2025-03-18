
import React, { useState } from 'react';
import { Camera, Upload, Sprout, Mushroom, Apple } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import CameraView from './CameraView';
import PlantInfoCard from './PlantInfoCard';
import PlantStoreLocator from './PlantStoreLocator';
import ThemeToggle from './ThemeToggle';
import SplashText from './SplashText';

interface PlantInfo {
  name: string;
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
  category?: string;
  harmfulTouch?: boolean;
  touchWarning?: string;
}

const PlantIdentifier = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [plantInfo, setPlantInfo] = useState<PlantInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [activeTab, setActiveTab] = useState("plants");
  const { toast } = useToast();
  
  const apiKey = 'AIzaSyDskk1srl5d4hsWDhSvzZSVi1vezIkgaf8';

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (imageSrc: string) => {
    setSelectedImage(imageSrc);
    setShowCamera(false);
  };

  const handleCameraCancel = () => {
    setShowCamera(false);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const getPromptForCategory = () => {
    const basePrompt = "Identify this specimen from the image. Analyze its health condition. ";
    
    switch (activeTab) {
      case "plants":
        return basePrompt + "Focus on identifying plants, leaves, and houseplants. Indicate if it's harmful/poisonous. You MUST respond with ONLY a valid JSON object.";
      case "fungi":
        return basePrompt + "Focus on identifying fungi and mushrooms. Indicate if it's edible or poisonous. Include a strong warning about mushroom identification risks. You MUST respond with ONLY a valid JSON object.";
      case "fruit":
        return basePrompt + "Focus on identifying fruits and berries. Indicate if it's edible or poisonous. You MUST respond with ONLY a valid JSON object.";
      case "edible":
        return basePrompt + "Focus on identifying edible plants and herbs. Assess if this is safe to consume and any preparation notes. You MUST respond with ONLY a valid JSON object.";
      default:
        return basePrompt + "You MUST respond with ONLY a valid JSON object.";
    }
  };

  const getTabIconAndTitle = () => {
    switch (activeTab) {
      case "plants":
        return { icon: <Sprout className="w-4 h-4 mr-2" />, title: "plants" };
      case "fungi":
        return { icon: <Mushroom className="w-4 h-4 mr-2" />, title: "fungi" };
      case "fruit":
        return { icon: <Apple className="w-4 h-4 mr-2" />, title: "fruits & berries" };
      case "edible":
        return { icon: <Sprout className="w-4 h-4 mr-2" />, title: "edible plants" };
      default:
        return { icon: <Sprout className="w-4 h-4 mr-2" />, title: "identify" };
    }
  };

  const identifyPlant = async () => {
    if (!selectedImage) {
      toast({
        title: "no image selected",
        description: "please take or upload a photo first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const base64Image = selectedImage.split(',')[1];
      const promptText = getPromptForCategory();
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Identify this plant, berry, fruit, fungi, or leaf from the image. Analyze its health condition. Indicate if it's edible or harmful/poisonous. You MUST respond with ONLY a valid JSON object containing these fields: name (common name), scientificName, category (one of: plant, berry, fruit, fungi, leaf), health (as a percentage from 0-100 based on visible condition), waterNeeds, sunlight, temperature, hasRottenLeaves (boolean), diagnosis (if there are any issues), cure (treatment recommendations), isEdible (boolean), toxicity (none, mild, moderate, severe), warning (symptoms or harm if consumed), harmfulTouch (boolean - true if it can cause irritation or harm from touching, like poison ivy), touchWarning (description of potential touch-related hazards or irritation). If you cannot identify the specimen, set name to null. No explanations, just the JSON."
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
            maxOutputTokens: 1024,
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
            name: 'Unknown specimen',
            health: 0,
            waterNeeds: 'Unknown',
            sunlight: 'Unknown',
            temperature: 'Unknown',
            isEdible: false,
            toxicity: 'Unknown',
            category: 'Unknown',
            harmfulTouch: false,
          });
          
          toast({
            title: "item not identified",
            description: "We couldn't identify this. Try taking a clearer picture.",
            variant: "destructive",
          });
        } else {
          setPlantInfo({
            name: plantData.name || 'Unknown specimen',
            category: plantData.category || 'plant',
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
            harmfulTouch: plantData.harmfulTouch || false,
            touchWarning: plantData.touchWarning,
          });
          
          toast({
            title: `${plantData.category || 'item'} identified`,
            description: `This appears to be a ${plantData.name || 'specimen'}.`,
          });
          
          if (plantData.hasRottenLeaves) {
            toast({
              title: "issue detected",
              description: "This specimen has signs of disease or damage.",
              variant: "destructive",
            });
          }
          
          if (plantData.toxicity && plantData.toxicity !== 'none') {
            toast({
              title: "caution required",
              description: `This has ${plantData.toxicity} toxicity.`,
              variant: "destructive",
            });
          }

          if (plantData.harmfulTouch) {
            toast({
              title: "harmful to touch",
              description: plantData.touchWarning || "This may cause irritation if touched.",
              variant: "destructive",
            });
          }
          
          if (plantData.category?.toLowerCase() === 'fungi' || plantData.category?.toLowerCase() === 'mushroom') {
            toast({
              title: "fungi warning",
              description: "Visual identification of fungi can be extremely unreliable. Never consume wild mushrooms without expert confirmation.",
              variant: "destructive",
            });
          }
        }
      } catch (jsonError) {
        console.error("Error parsing JSON from response:", jsonError);
        console.log("Raw text response:", textResponse);
        
        setPlantInfo({
          name: 'Unknown specimen',
          health: 0,
          waterNeeds: 'Unknown',
          sunlight: 'Unknown',
          temperature: 'Unknown',
          isEdible: false,
          toxicity: 'Unknown',
          category: 'Unknown',
          harmfulTouch: false,
        });
        
        toast({
          title: "item not identified",
          description: "We couldn't identify this. Try taking a clearer picture.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error identifying plant:", error);
      toast({
        title: "identification failed",
        description: "unable to identify. please try again.",
        variant: "destructive",
      });
      
      setPlantInfo({
        name: 'Unknown specimen',
        health: 0,
        waterNeeds: 'Unknown',
        sunlight: 'Unknown',
        temperature: 'Unknown',
        isEdible: false,
        toxicity: 'Unknown',
        category: 'Unknown',
        harmfulTouch: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const { icon, title } = getTabIconAndTitle();

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-cream-100 dark:from-gray-900 dark:to-gray-800 p-4 flex flex-col items-center transition-colors duration-300">
      <ThemeToggle />
      <div className="w-full max-w-md space-y-4">
        <motion.div 
          className="text-center space-y-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <Badge variant="subtle" className="mb-2 bg-cream-100 dark:bg-gray-800 dark:text-cream-100">shrubAI</Badge>
          <SplashText />
        </motion.div>

        <Tabs 
          defaultValue="plants" 
          value={activeTab} 
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 mb-4 bg-cream-100 dark:bg-gray-800">
            <TabsTrigger value="plants" className="data-[state=active]:bg-leaf-100 dark:data-[state=active]:bg-leaf-900/30">
              <Sprout className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Plants</span>
            </TabsTrigger>
            <TabsTrigger value="fungi" className="data-[state=active]:bg-leaf-100 dark:data-[state=active]:bg-leaf-900/30">
              <Mushroom className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Fungi</span>
            </TabsTrigger>
            <TabsTrigger value="fruit" className="data-[state=active]:bg-leaf-100 dark:data-[state=active]:bg-leaf-900/30">
              <Apple className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Fruits</span>
            </TabsTrigger>
            <TabsTrigger value="edible" className="data-[state=active]:bg-leaf-100 dark:data-[state=active]:bg-leaf-900/30">
              <span className="text-sm mr-1">🌿</span>
              <span className="hidden sm:inline">Edible</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {showCamera ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <CameraView
                  onCapture={handleCameraCapture}
                  onCancel={handleCameraCancel}
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6 backdrop-blur-sm bg-white/80 border-leaf-200 shadow-lg dark:bg-gray-800/60 dark:border-gray-700 dark:shadow-gray-900/30">
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      {selectedImage ? (
                        <motion.div 
                          className="w-full"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <AspectRatio ratio={16/9} className="relative w-full rounded-lg overflow-hidden">
                            <img
                              src={selectedImage}
                              alt="Selected plant"
                              className="w-full h-full object-cover"
                            />
                          </AspectRatio>
                        </motion.div>
                      ) : (
                        <AspectRatio ratio={16/9} className="w-full rounded-lg bg-cream-50 dark:bg-gray-700 flex items-center justify-center border-2 border-dashed border-leaf-200 dark:border-gray-600">
                          {icon}
                          <span className="text-leaf-400 dark:text-leaf-300 ml-2">{title}</span>
                        </AspectRatio>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 bg-white/50 hover:bg-white/80 transition-all dark:bg-gray-700/50 dark:hover:bg-gray-700/80 dark:text-cream-100 dark:border-gray-600"
                        onClick={() => setShowCamera(true)}
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        camera
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 bg-white/50 hover:bg-white/80 transition-all dark:bg-gray-700/50 dark:hover:bg-gray-700/80 dark:text-cream-100 dark:border-gray-600"
                        onClick={() => document.getElementById('upload')?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        upload
                      </Button>
                    </div>

                    <Button 
                      onClick={identifyPlant}
                      disabled={isLoading || !selectedImage}
                      className="w-full bg-leaf-500 hover:bg-leaf-600 text-white dark:bg-leaf-600 dark:hover:bg-leaf-700"
                    >
                      {isLoading ? "identifying..." : `identify ${title}`}
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
              </motion.div>
            )}
          </TabsContent>
        </Tabs>

        {plantInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
          >
            <PlantInfoCard plantInfo={plantInfo} />
          </motion.div>
        )}
        
        {plantInfo && plantInfo.name && plantInfo.name !== 'Unknown specimen' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.2 }}
          >
            <PlantStoreLocator plantName={plantInfo.name} />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PlantIdentifier;
