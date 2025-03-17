
import React, { useState, useEffect } from 'react';
import { Camera, Upload, Sprout, Moon, Sun } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Switch } from '@/components/ui/switch';
import CameraView from './CameraView';
import PlantInfoCard from './PlantInfoCard';

interface PlantInfo {
  name: string;
  health: number;
  waterNeeds: string;
  sunlight: string;
  temperature: string;
  diagnosis?: string;
  cure?: string;
  hasRottenLeaves?: boolean;
}

const PlantIdentifier = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [plantInfo, setPlantInfo] = useState<PlantInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Initialize dark mode from localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const { toast } = useToast();
  
  const apiKey = 'AIzaSyDskk1srl5d4hsWDhSvzZSVi1vezIkgaf8';

  useEffect(() => {
    // Update theme when dark mode state changes
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

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

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const identifyPlant = async () => {
    if (!selectedImage) {
      toast({
        title: "No image selected",
        description: "Please take or upload a photo of a plant first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const base64Image = selectedImage.split(',')[1];
      
      // Updated to use Gemini 2.0
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Identify this plant from the image. Analyze its health condition and check if it has any diseases or rotten leaves. You MUST respond with ONLY a valid JSON object containing these fields: name (common name), scientificName, health (as a percentage from 0-100 based on visible condition), waterNeeds, sunlight, temperature, hasRottenLeaves (boolean), diagnosis (if there are any issues), cure (treatment recommendations). If you cannot identify the plant, set name to null. No explanations, just the JSON."
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
            name: 'Unknown plant',
            health: 0,
            waterNeeds: 'Unknown',
            sunlight: 'Unknown',
            temperature: 'Unknown',
          });
          
          toast({
            title: "Plant not identified",
            description: "We couldn't identify this plant. Try taking a clearer picture.",
            variant: "destructive",
          });
        } else {
          setPlantInfo({
            name: plantData.name || 'Unknown plant',
            health: parseInt(plantData.health) || 70,
            waterNeeds: plantData.waterNeeds || 'Unknown',
            sunlight: plantData.sunlight || 'Unknown',
            temperature: plantData.temperature || 'Unknown',
            diagnosis: plantData.diagnosis,
            cure: plantData.cure,
            hasRottenLeaves: plantData.hasRottenLeaves || false,
          });
          
          toast({
            title: "Plant identified",
            description: `This appears to be a ${plantData.name || 'plant'}.`,
          });
          
          if (plantData.hasRottenLeaves) {
            toast({
              title: "Issue detected",
              description: "This plant has signs of disease or damage.",
              variant: "destructive",
            });
          }
        }
      } catch (jsonError) {
        console.error("Error parsing JSON from response:", jsonError);
        console.log("Raw text response:", textResponse);
        
        setPlantInfo({
          name: 'Unknown plant',
          health: 0,
          waterNeeds: 'Unknown',
          sunlight: 'Unknown',
          temperature: 'Unknown',
        });
        
        toast({
          title: "Plant not identified",
          description: "We couldn't identify this plant. Try taking a clearer picture.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error identifying plant:", error);
      toast({
        title: "Identification failed",
        description: "Unable to identify the plant. Please try again.",
        variant: "destructive",
      });
      
      setPlantInfo({
        name: 'Unknown plant',
        health: 0,
        waterNeeds: 'Unknown',
        sunlight: 'Unknown',
        temperature: 'Unknown',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-cream-50 to-cream-100'} p-4 flex flex-col items-center transition-colors duration-300`}>
      <div className="w-full max-w-md space-y-4">
        <div className="text-center space-y-2 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="subtle" className={`${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-cream-100'}`}>shrubAI</Badge>
            <div className="flex items-center space-x-2">
              <Sun className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-yellow-500'}`} />
              <Switch 
                checked={darkMode} 
                onCheckedChange={toggleDarkMode} 
                className={darkMode ? 'bg-gray-700' : ''}
              />
              <Moon className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-gray-400'}`} />
            </div>
          </div>
          <h1 className={`text-2xl font-light ${darkMode ? 'text-gray-100' : 'text-leaf-900'}`}>discover your plants</h1>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-leaf-600'}`}>take a photo or upload an image to identify your plant</p>
        </div>

        {showCamera ? (
          <CameraView
            onCapture={handleCameraCapture}
            onCancel={handleCameraCancel}
          />
        ) : (
          <Card className={`p-6 ${darkMode ? 'bg-gray-800/90 border-gray-700' : 'backdrop-blur-sm bg-white/80 border-leaf-200'} shadow-lg animate-scale-in transition-colors duration-300`}>
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
                  <AspectRatio ratio={16/9} className={`w-full rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-cream-50 border-leaf-200'} flex items-center justify-center border-2 border-dashed`}>
                    <Sprout className={`w-12 h-12 ${darkMode ? 'text-gray-500' : 'text-leaf-400'}`} />
                  </AspectRatio>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className={`flex-1 ${darkMode ? 'bg-gray-700/50 hover:bg-gray-700/80 text-gray-200 border-gray-600' : 'bg-white/50 hover:bg-white/80'} transition-all`}
                  onClick={() => setShowCamera(true)}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  camera
                </Button>
                <Button
                  variant="outline"
                  className={`flex-1 ${darkMode ? 'bg-gray-700/50 hover:bg-gray-700/80 text-gray-200 border-gray-600' : 'bg-white/50 hover:bg-white/80'} transition-all`}
                  onClick={() => document.getElementById('upload')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  upload
                </Button>
              </div>

              <Button 
                onClick={identifyPlant}
                disabled={isLoading || !selectedImage}
                className={`w-full ${darkMode ? 'bg-leaf-600 hover:bg-leaf-700' : 'bg-leaf-500 hover:bg-leaf-600'} text-white transition-colors`}
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
          <PlantInfoCard plantInfo={plantInfo} darkMode={darkMode} />
        )}
      </div>
    </div>
  );
};

export default PlantIdentifier;
