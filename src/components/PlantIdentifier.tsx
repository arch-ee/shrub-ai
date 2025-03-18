
import React, { useState } from 'react';
import { Camera, Upload, Sprout, Leaf, Apple, Cherry } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import CameraView from './CameraView';
import PlantInfoCard from './PlantInfoCard';
import ThemeToggle from './ThemeToggle';

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
  category?: 'plant' | 'fruit' | 'berry' | 'fungi';
  nutritionalValue?: string;
  safeToTouch?: boolean;
}

const PlantIdentifier = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [plantInfo, setPlantInfo] = useState<PlantInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'plant' | 'fruit' | 'berry' | 'fungi'>('plant');
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

  const getCategoryPrompt = () => {
    switch (activeCategory) {
      case 'plant':
        return "Identify this plant from the image. Analyze its health condition. Indicate if it's edible or harmful/poisonous. You MUST respond with ONLY a valid JSON object containing these fields: name (common name), scientificName, health (as a percentage from 0-100 based on visible condition), waterNeeds, sunlight, temperature, hasRottenLeaves (boolean), diagnosis (if there are any issues), cure (treatment recommendations), isEdible (boolean), toxicity (none, mild, moderate, severe), warning (symptoms or harm if consumed or touched), category (set to 'plant'), safeToTouch (boolean). If you cannot identify the plant, set name to null. No explanations, just the JSON.";
      case 'fruit':
        return "Identify this fruit from the image. Analyze its ripeness. Indicate if it's edible or harmful/poisonous. You MUST respond with ONLY a valid JSON object containing these fields: name (common name), scientificName, health (as a percentage from 0-100 based on visible ripeness/freshness), isEdible (boolean), toxicity (none, mild, moderate, severe), warning (symptoms or harm if consumed), nutritionalValue (brief description of nutrients), category (set to 'fruit'), safeToTouch (boolean). If you cannot identify the fruit, set name to null. No explanations, just the JSON.";
      case 'berry':
        return "Identify this berry from the image. Analyze if it's ripe/fresh. Indicate if it's edible or harmful/poisonous. You MUST respond with ONLY a valid JSON object containing these fields: name (common name), scientificName, health (as a percentage from 0-100 based on visible ripeness/freshness), isEdible (boolean), toxicity (none, mild, moderate, severe), warning (symptoms or harm if consumed), nutritionalValue (brief description of nutrients), category (set to 'berry'), safeToTouch (boolean). If you cannot identify the berry, set name to null. No explanations, just the JSON.";
      case 'fungi':
        return "Identify this mushroom or fungi from the image. Analyze its condition. Indicate if it's edible or harmful/poisonous. IMPORTANT: Be extremely conservative with edibility claims. When in doubt, mark as not edible. You MUST respond with ONLY a valid JSON object containing these fields: name (common name), scientificName, health (as a percentage from 0-100 based on visible condition), isEdible (boolean), toxicity (none, mild, moderate, severe), warning (symptoms or harm if consumed), nutritionalValue (if edible), category (set to 'fungi'), safeToTouch (boolean). Add an additional warning about the dangers of misidentifying fungi. If you cannot identify the fungi with 100% certainty, set name to null and isEdible to false. No explanations, just the JSON.";
      default:
        return "Identify this plant, fruit, berry or fungi from the image. Analyze its health condition. Indicate if it's edible or harmful/poisonous. You MUST respond with ONLY a valid JSON object containing these fields: name (common name), scientificName, health (as a percentage from 0-100 based on visible condition), waterNeeds, sunlight, temperature, hasRottenLeaves (boolean), diagnosis (if there are any issues), cure (treatment recommendations), isEdible (boolean), toxicity (none, mild, moderate, severe), warning (symptoms or harm if consumed or touched). If you cannot identify the item, set name to null. No explanations, just the JSON.";
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
            name: `Unknown ${activeCategory}`,
            health: 0,
            waterNeeds: 'Unknown',
            sunlight: 'Unknown',
            temperature: 'Unknown',
            isEdible: false,
            toxicity: 'Unknown',
            category: activeCategory,
            safeToTouch: false
          });
          
          toast({
            title: `${activeCategory} not identified`,
            description: `We couldn't identify this ${activeCategory}. Try taking a clearer picture.`,
            variant: "destructive",
          });
        } else {
          setPlantInfo({
            name: plantData.name || `Unknown ${activeCategory}`,
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
            category: activeCategory,
            nutritionalValue: plantData.nutritionalValue,
            safeToTouch: plantData.safeToTouch !== undefined ? plantData.safeToTouch : true
          });
          
          toast({
            title: `${activeCategory} identified`,
            description: `This appears to be a ${plantData.name || activeCategory}.`,
          });
          
          if (activeCategory === 'plant' && plantData.hasRottenLeaves) {
            toast({
              title: "issue detected",
              description: "This plant has signs of disease or damage.",
              variant: "destructive",
            });
          }
          
          if (plantData.toxicity && plantData.toxicity !== 'none') {
            toast({
              title: "caution required",
              description: `This ${activeCategory} has ${plantData.toxicity} toxicity.`,
              variant: "destructive",
            });
          }

          if (activeCategory === 'fungi' && (plantData.isEdible === true)) {
            toast({
              title: "fungi identification disclaimer",
              description: "Never consume any fungi based solely on AI identification. Always consult with an expert.",
              variant: "destructive",
            });
          }
        }
      } catch (jsonError) {
        console.error("Error parsing JSON from response:", jsonError);
        console.log("Raw text response:", textResponse);
        
        setPlantInfo({
          name: `Unknown ${activeCategory}`,
          health: 0,
          waterNeeds: 'Unknown',
          sunlight: 'Unknown',
          temperature: 'Unknown',
          isEdible: false,
          toxicity: 'Unknown',
          category: activeCategory,
          safeToTouch: false
        });
        
        toast({
          title: `${activeCategory} not identified`,
          description: `We couldn't identify this ${activeCategory}. Try taking a clearer picture.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error identifying item:", error);
      toast({
        title: "identification failed",
        description: "unable to identify. please try again.",
        variant: "destructive",
      });
      
      setPlantInfo({
        name: `Unknown ${activeCategory}`,
        health: 0,
        waterNeeds: 'Unknown',
        sunlight: 'Unknown',
        temperature: 'Unknown',
        isEdible: false,
        toxicity: 'Unknown',
        category: activeCategory,
        safeToTouch: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = () => {
    switch (activeCategory) {
      case 'plant':
        return <Sprout className="w-12 h-12 text-leaf-400 dark:text-leaf-300" />;
      case 'fruit':
        return <Apple className="w-12 h-12 text-leaf-400 dark:text-leaf-300" />;
      case 'berry':
        return <Cherry className="w-12 h-12 text-leaf-400 dark:text-leaf-300" />;
      case 'fungi':
        return <Leaf className="w-12 h-12 text-leaf-400 dark:text-leaf-300" />;
      default:
        return <Sprout className="w-12 h-12 text-leaf-400 dark:text-leaf-300" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-cream-100 dark:from-gray-900 dark:to-gray-800 p-4 flex flex-col items-center transition-colors duration-300">
      <ThemeToggle />
      <div className="w-full max-w-md space-y-4">
        <div className="text-center space-y-2 animate-fade-in">
          <Badge variant="subtle" className="mb-2 bg-cream-100 dark:bg-gray-800 dark:text-cream-100">shrubAI</Badge>
          <h1 className="text-2xl font-light text-leaf-900 dark:text-cream-100">discover your plants</h1>
          <p className="text-sm text-leaf-600 dark:text-cream-200">take a photo or upload an image to identify your plant</p>
        </div>

        <Tabs defaultValue="plant" className="w-full" onValueChange={(value) => setActiveCategory(value as 'plant' | 'fruit' | 'berry' | 'fungi')}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="plant">Plants</TabsTrigger>
            <TabsTrigger value="fruit">Fruits</TabsTrigger>
            <TabsTrigger value="berry">Berries</TabsTrigger>
            <TabsTrigger value="fungi">Fungi</TabsTrigger>
          </TabsList>

          <TabsContent value="plant" className="mt-0">
            {showCamera ? (
              <CameraView
                onCapture={handleCameraCapture}
                onCancel={handleCameraCancel}
              />
            ) : (
              <Card className="p-6 backdrop-blur-sm bg-white/80 border-leaf-200 shadow-lg animate-scale-in dark:bg-gray-800/60 dark:border-gray-700 dark:shadow-gray-900/30">
                <div className="space-y-4">
                  <div className="flex justify-center">
                    {selectedImage ? (
                      <AspectRatio ratio={16/9} className="relative w-full rounded-lg overflow-hidden">
                        <img
                          src={selectedImage}
                          alt="Selected plant"
                          className="w-full h-full object-cover"
                        />
                      </AspectRatio>
                    ) : (
                      <AspectRatio ratio={16/9} className="w-full rounded-lg bg-cream-50 dark:bg-gray-700 flex items-center justify-center border-2 border-dashed border-leaf-200 dark:border-gray-600">
                        {getCategoryIcon()}
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
                    {isLoading ? "identifying..." : `identify ${activeCategory}`}
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
          </TabsContent>

          <TabsContent value="fruit" className="mt-0">
            {/* Reuse the UI for fruit tab */}
            {showCamera ? (
              <CameraView
                onCapture={handleCameraCapture}
                onCancel={handleCameraCancel}
              />
            ) : (
              <Card className="p-6 backdrop-blur-sm bg-white/80 border-leaf-200 shadow-lg animate-scale-in dark:bg-gray-800/60 dark:border-gray-700 dark:shadow-gray-900/30">
                <div className="space-y-4">
                  <div className="flex justify-center">
                    {selectedImage ? (
                      <AspectRatio ratio={16/9} className="relative w-full rounded-lg overflow-hidden">
                        <img
                          src={selectedImage}
                          alt="Selected fruit"
                          className="w-full h-full object-cover"
                        />
                      </AspectRatio>
                    ) : (
                      <AspectRatio ratio={16/9} className="w-full rounded-lg bg-cream-50 dark:bg-gray-700 flex items-center justify-center border-2 border-dashed border-leaf-200 dark:border-gray-600">
                        {getCategoryIcon()}
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
                    {isLoading ? "identifying..." : `identify ${activeCategory}`}
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
          </TabsContent>

          <TabsContent value="berry" className="mt-0">
            {/* Reuse the UI for berry tab */}
            {showCamera ? (
              <CameraView
                onCapture={handleCameraCapture}
                onCancel={handleCameraCancel}
              />
            ) : (
              <Card className="p-6 backdrop-blur-sm bg-white/80 border-leaf-200 shadow-lg animate-scale-in dark:bg-gray-800/60 dark:border-gray-700 dark:shadow-gray-900/30">
                <div className="space-y-4">
                  <div className="flex justify-center">
                    {selectedImage ? (
                      <AspectRatio ratio={16/9} className="relative w-full rounded-lg overflow-hidden">
                        <img
                          src={selectedImage}
                          alt="Selected berry"
                          className="w-full h-full object-cover"
                        />
                      </AspectRatio>
                    ) : (
                      <AspectRatio ratio={16/9} className="w-full rounded-lg bg-cream-50 dark:bg-gray-700 flex items-center justify-center border-2 border-dashed border-leaf-200 dark:border-gray-600">
                        {getCategoryIcon()}
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
                    {isLoading ? "identifying..." : `identify ${activeCategory}`}
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
          </TabsContent>

          <TabsContent value="fungi" className="mt-0">
            {/* Reuse the UI for fungi tab */}
            {showCamera ? (
              <CameraView
                onCapture={handleCameraCapture}
                onCancel={handleCameraCancel}
              />
            ) : (
              <Card className="p-6 backdrop-blur-sm bg-white/80 border-leaf-200 shadow-lg animate-scale-in dark:bg-gray-800/60 dark:border-gray-700 dark:shadow-gray-900/30">
                <div className="space-y-4">
                  <div className="flex justify-center">
                    {selectedImage ? (
                      <AspectRatio ratio={16/9} className="relative w-full rounded-lg overflow-hidden">
                        <img
                          src={selectedImage}
                          alt="Selected fungi"
                          className="w-full h-full object-cover"
                        />
                      </AspectRatio>
                    ) : (
                      <AspectRatio ratio={16/9} className="w-full rounded-lg bg-cream-50 dark:bg-gray-700 flex items-center justify-center border-2 border-dashed border-leaf-200 dark:border-gray-600">
                        {getCategoryIcon()}
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
                    {isLoading ? "identifying..." : `identify ${activeCategory}`}
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
          </TabsContent>
        </Tabs>

        {plantInfo && <PlantInfoCard plantInfo={plantInfo} />}
      </div>
    </div>
  );
};

export default PlantIdentifier;
