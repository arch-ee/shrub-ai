
import React, { useState, useEffect } from 'react';
import { Camera, Upload, Sprout, Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AspectRatio } from '@/components/ui/aspect-ratio';
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
  const [scansRemaining, setScansRemaining] = useState(4);
  const [isPremium, setIsPremium] = useState(false);
  const { toast } = useToast();
  
  // Using the provided API key directly in the code
  const apiKey = 'AIzaSyDskk1srl5d4hsWDhSvzZSVi1vezIkgaf8';

  // Load scans remaining from localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('lastScanDate');
    const storedScans = localStorage.getItem('scansRemaining');
    const premium = localStorage.getItem('premium') === 'true';
    
    setIsPremium(premium);
    
    // Reset scans if it's a new day
    if (storedDate !== today) {
      localStorage.setItem('lastScanDate', today);
      localStorage.setItem('scansRemaining', '4');
      setScansRemaining(4);
    } else if (storedScans) {
      setScansRemaining(parseInt(storedScans));
    }
  }, []);

  // Save scans remaining to localStorage
  const updateScansRemaining = (scans: number) => {
    setScansRemaining(scans);
    localStorage.setItem('scansRemaining', scans.toString());
  };

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

  const handlePayment = () => {
    toast({
      title: "Payment feature coming soon",
      description: "This feature is currently being developed. Please try again later.",
    });
    
    // Mock implementation for demo purposes
    setIsPremium(true);
    localStorage.setItem('premium', 'true');
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

    // Check if the user has scans remaining or is premium
    if (!isPremium && scansRemaining <= 0) {
      toast({
        title: "scan limit reached",
        description: "you've used all your free scans for today. Upgrade to premium for unlimited scans.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Update scans remaining if not premium
      if (!isPremium) {
        updateScansRemaining(scansRemaining - 1);
      }
      
      // Extract base64 image data (remove data:image/jpeg;base64, prefix)
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
        
        if (plantData.name === null) {
          setPlantInfo({
            name: 'Unknown plant',
            health: 0,
            waterNeeds: 'Unknown',
            sunlight: 'Unknown',
            temperature: 'Unknown',
          });
          
          toast({
            title: "plant not identified",
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
            title: "plant identified",
            description: `This appears to be a ${plantData.name || 'plant'}.`,
          });
          
          // If the plant has rotten leaves, we should annotate the image
          if (plantData.hasRottenLeaves) {
            // In a real implementation, we would use image processing or ML to highlight the rotten areas
            // For now, we'll just display the information in the card
            toast({
              title: "issue detected",
              description: "This plant has signs of disease or damage.",
              variant: "destructive",
            });
          }
        }
      } catch (jsonError) {
        console.error("Error parsing JSON from response:", jsonError);
        console.log("Raw text response:", textResponse);
        
        // Set as unknown plant
        setPlantInfo({
          name: 'Unknown plant',
          health: 0,
          waterNeeds: 'Unknown',
          sunlight: 'Unknown',
          temperature: 'Unknown',
        });
        
        toast({
          title: "plant not identified",
          description: "We couldn't identify this plant. Try taking a clearer picture.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error identifying plant:", error);
      toast({
        title: "identification failed",
        description: "unable to identify the plant. please try again.",
        variant: "destructive",
      });
      
      // Set as unknown plant in case of error
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
    <div className="min-h-screen bg-gradient-to-b from-leaf-50 to-leaf-100 p-4 flex flex-col items-center">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center space-y-2 animate-fade-in">
          <Badge variant="secondary" className="mb-2">shrubAI</Badge>
          <h1 className="text-2xl font-light text-leaf-900">discover your plants</h1>
          <p className="text-sm text-leaf-600">take a photo or upload an image to identify your plant</p>
        </div>

        {!isPremium && (
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-sm text-amber-800 flex items-center justify-between">
            <div className="flex items-center">
              <div className="mr-2">{scansRemaining} free scans remaining today</div>
            </div>
            <Button variant="outline" size="sm" className="bg-amber-100 hover:bg-amber-200 border-amber-300" onClick={handlePayment}>
              <Lock className="w-3 h-3 mr-1" />
              Unlock Premium ($0.99)
            </Button>
          </div>
        )}

        {showCamera ? (
          <CameraView
            onCapture={handleCameraCapture}
            onCancel={handleCameraCancel}
          />
        ) : (
          <Card className="p-6 backdrop-blur-sm bg-white/80 border-leaf-200 shadow-lg animate-scale-in">
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
                  <AspectRatio ratio={16/9} className="w-full rounded-lg bg-leaf-50 flex items-center justify-center border-2 border-dashed border-leaf-200">
                    <Sprout className="w-12 h-12 text-leaf-400" />
                  </AspectRatio>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 bg-white/50 hover:bg-white/80 transition-all"
                  onClick={() => setShowCamera(true)}
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
                disabled={isLoading || !selectedImage || (!isPremium && scansRemaining <= 0)}
                className="w-full bg-leaf-500 hover:bg-leaf-600 text-white"
              >
                {isLoading ? "identifying..." : 
                 (!isPremium && scansRemaining <= 0) ? "no scans remaining" : "identify plant"}
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

        {plantInfo && <PlantInfoCard plantInfo={plantInfo} />}
      </div>
    </div>
  );
};

export default PlantIdentifier;
