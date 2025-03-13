
import React, { useState } from 'react';
import { Camera, Upload, Sprout, Heart, Droplet, Sun, ThermometerSun } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface PlantInfo {
  name: string;
  health: number;
  waterNeeds: string;
  sunlight: string;
  temperature: string;
}

const PlantIdentifier = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [plantInfo, setPlantInfo] = useState<PlantInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Using the provided API key directly in the code
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

  const identifyPlant = async () => {
    if (!selectedImage) {
      toast({
        title: "no image selected",
        description: "please take or upload a photo of a plant first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Extract base64 image data (remove data:image/jpeg;base64, prefix)
      const base64Image = selectedImage.split(',')[1];
      
      // Updated to use gemini-1.5-flash model instead of the deprecated gemini-pro-vision
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
                  text: "Identify this plant from the image. You MUST respond with ONLY a valid JSON object containing these fields: name (common name), scientificName, health (as a percentage from 0-100 based on visible condition), waterNeeds, sunlight, temperature. No explanations, just the JSON."
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
      
      // Extract the text response
      const textResponse = data.candidates[0].content.parts[0].text;
      console.log("Raw API response:", textResponse);
      
      // Try to parse JSON from the response
      try {
        // Find JSON in the response (it might be surrounded by markdown code blocks)
        const jsonMatch = textResponse.match(/```json\n([\s\S]*?)\n```/) || 
                         textResponse.match(/```\n([\s\S]*?)\n```/) || 
                         [null, textResponse];
        
        const jsonString = jsonMatch[1] || textResponse;
        const plantData = JSON.parse(jsonString);
        
        setPlantInfo({
          name: plantData.name || 'Unknown plant',
          health: parseInt(plantData.health) || 70,
          waterNeeds: plantData.waterNeeds || 'Unknown',
          sunlight: plantData.sunlight || 'Unknown',
          temperature: plantData.temperature || 'Unknown',
        });
        
        toast({
          title: "plant identified",
          description: `This appears to be a ${plantData.name || 'plant'}.`,
        });
      } catch (jsonError) {
        console.error("Error parsing JSON from response:", jsonError);
        console.log("Raw text response:", textResponse);
        
        // Fallback: extract information using regex if JSON parsing fails
        const name = textResponse.match(/name:?\s*["']?([^"'\n]+)["']?/i)?.[1] || 'Unknown plant';
        const health = parseInt(textResponse.match(/health:?\s*["']?(\d+)["']?/i)?.[1] || '70');
        const waterNeeds = textResponse.match(/waterNeeds:?\s*["']?([^"'\n]+)["']?/i)?.[1] || 'Unknown';
        const sunlight = textResponse.match(/sunlight:?\s*["']?([^"'\n]+)["']?/i)?.[1] || 'Unknown';
        const temperature = textResponse.match(/temperature:?\s*["']?([^"'\n]+)["']?/i)?.[1] || 'Unknown';
        
        setPlantInfo({
          name,
          health,
          waterNeeds,
          sunlight,
          temperature,
        });
        
        toast({
          title: "plant identified",
          description: `This appears to be a ${name}.`,
        });
      }
    } catch (error) {
      console.error("Error identifying plant:", error);
      toast({
        title: "identification failed",
        description: "unable to identify the plant. please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getHealthEmoji = (health: number) => {
    if (health >= 90) return '🌿';
    if (health >= 70) return '🌱';
    if (health >= 50) return '🍃';
    return '🥀';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-leaf-50 to-leaf-100 p-4 flex flex-col items-center">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center space-y-2 animate-fade-in">
          <Badge variant="secondary" className="mb-2">plant identifier</Badge>
          <h1 className="text-2xl font-light text-leaf-900">discover your plants</h1>
          <p className="text-sm text-leaf-600">take a photo or upload an image to identify your plant</p>
        </div>

        <Card className="p-6 backdrop-blur-sm bg-white/80 border-leaf-200 shadow-lg animate-scale-in">
          <div className="space-y-4">
            <div className="flex justify-center">
              {selectedImage ? (
                <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                  <img
                    src={selectedImage}
                    alt="Selected plant"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full aspect-square rounded-lg bg-leaf-50 flex items-center justify-center border-2 border-dashed border-leaf-200">
                  <Sprout className="w-12 h-12 text-leaf-400" />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 bg-white/50 hover:bg-white/80 transition-all"
                onClick={() => document.getElementById('camera')?.click()}
              >
                <Camera className="w-4 h-4 mr-2" />
                camera
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-white/50 hover:bg-white/80 transition-all"
                onClick={() => document.getElementById('upload')?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                upload
              </Button>
            </div>

            <Button 
              onClick={identifyPlant}
              disabled={isLoading || !selectedImage}
              className="w-full bg-leaf-500 hover:bg-leaf-600 text-white"
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
            <input
              type="file"
              id="camera"
              accept="image/*"
              capture="environment"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </Card>

        {plantInfo && (
          <Card className="p-6 backdrop-blur-sm bg-white/80 border-leaf-200 shadow-lg animate-fade-in">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-medium text-leaf-900">{plantInfo.name}</h2>
                <span className="text-2xl">{getHealthEmoji(plantInfo.health)}</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-leaf-600">
                  <Heart className="w-4 h-4 mr-2 text-leaf-500" />
                  <span>health: {plantInfo.health}%</span>
                </div>
                <div className="flex items-center text-sm text-leaf-600">
                  <Droplet className="w-4 h-4 mr-2 text-leaf-500" />
                  <span>water needs: {plantInfo.waterNeeds}</span>
                </div>
                <div className="flex items-center text-sm text-leaf-600">
                  <Sun className="w-4 h-4 mr-2 text-leaf-500" />
                  <span>sunlight: {plantInfo.sunlight}</span>
                </div>
                <div className="flex items-center text-sm text-leaf-600">
                  <ThermometerSun className="w-4 h-4 mr-2 text-leaf-500" />
                  <span>temperature: {plantInfo.temperature}</span>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PlantIdentifier;
