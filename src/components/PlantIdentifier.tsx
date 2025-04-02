import React, { useState, useEffect } from 'react';
import { Camera, Upload, Sprout, HelpCircle, MessageCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import CameraView from './CameraView';
import PlantInfoCard from './PlantInfoCard';
import ThemeToggle from './ThemeToggle';
import OnlineStores from './store-locator/OnlineStores';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import AIAssistant from './AIAssistant';

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

const SPLASH_TEXTS = [
  "identify your plants. no fuss.",
  "your pocket botanist",
  "plant wisdom in your pocket",
  "leafy knowledge at your fingertips",
  "unlock nature's secrets",
  "helping you grow smarter",
  "what's that plant? we know!",
  "turning brown thumbs green",
  "nature's encyclopedia",
  "the plant whisperer",
  "botanical brilliance",
  "from seed to knowledge",
  "plants decoded",
  "nature's mysteries solved",
  "botanical detective",
  "plant recognition made easy",
  "photosynthesis and chill",
  "root for knowledge",
  "cultivating curiosity",
  "leaf it to us"
];

const PlantIdentifier = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [plantInfo, setPlantInfo] = useState<PlantInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [splashText, setSplashText] = useState('');
  const [showDocs, setShowDocs] = useState(false);
  const [showAgent, setShowAgent] = useState(false);
  const { toast } = useToast();
  
  const deepseekApiKey = 'sk-358c16c6b9e3486e8f38920a8db94c96';
  const apiKey = 'AIzaSyDskk1srl5d4hsWDhSvzZSVi1vezIkgaf8';
  
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * SPLASH_TEXTS.length);
    setSplashText(SPLASH_TEXTS[randomIndex]);
  }, []);

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
    return "Identify this plant, fruit, berry or fungi from the image. Analyze its health condition. Indicate if it's edible or harmful/poisonous. You MUST respond with ONLY a valid JSON object containing these fields: name (common name), scientificName, health (as a percentage from 0-100 based on visible condition), waterNeeds, sunlight, temperature, hasRottenLeaves (boolean), diagnosis (if there are any issues), cure (treatment recommendations), isEdible (boolean), toxicity (none, mild, moderate, severe), warning (symptoms or harm if consumed or touched), category (one of: 'plant', 'fruit', 'berry', 'fungi'), nutritionalValue (if edible), safeToTouch (boolean). If you cannot identify the item, set name to null. No explanations, just the JSON.";
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
        } else {
          const category = plantData.category || 'plant';
          
          setPlantInfo({
            name: plantData.name || "Unknown plant",
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
            safeToTouch: plantData.safeToTouch !== undefined ? plantData.safeToTouch : true
          });
          
          toast({
            title: `${category} identified`,
            description: `This appears to be a ${plantData.name}.`,
          });
          
          if (category === 'plant' && plantData.hasRottenLeaves) {
            toast({
              title: "issue detected",
              description: "This plant has signs of disease or damage.",
              variant: "destructive",
            });
          }
          
          if (plantData.toxicity && plantData.toxicity !== 'none') {
            toast({
              title: "caution required",
              description: `This ${category} has ${plantData.toxicity} toxicity.`,
              variant: "destructive",
            });
          }

          if (category === 'fungi' && (plantData.isEdible === true)) {
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
    } finally {
      setIsLoading(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-cream-100 dark:from-gray-900 dark:to-gray-800 p-4 flex flex-col items-center transition-colors duration-300">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-md space-y-4">
        <div className="text-center space-y-2 animate-fade-in">
          <Badge variant="subtle" className="mb-2 bg-cream-100 dark:bg-gray-800 dark:text-cream-100">shrubAI</Badge>
          <h1 className="text-2xl font-light text-leaf-900 dark:text-cream-100">{splashText}</h1>
        </div>

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
                    <Sprout className="w-12 h-12 text-leaf-400 dark:text-leaf-300" />
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
            {plantInfo.name && plantInfo.name !== "Unknown plant" && (
              <OnlineStores stores={generateOnlineStores(plantInfo.name)} />
            )}
          </>
        )}
      </div>
      
      <div className="fixed bottom-4 left-4 flex flex-col gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          className="bg-white/50 hover:bg-white/80 dark:bg-gray-800/50 dark:hover:bg-gray-800/80 rounded-full shadow-md"
          onClick={() => setShowDocs(true)}
        >
          <HelpCircle className="h-5 w-5 text-leaf-600 dark:text-leaf-400" />
          <span className="sr-only">Documentation</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="icon" 
          className="bg-white/50 hover:bg-white/80 dark:bg-gray-800/50 dark:hover:bg-gray-800/80 rounded-full shadow-md"
          onClick={() => setShowAgent(true)}
        >
          <MessageCircle className="h-5 w-5 text-leaf-600 dark:text-leaf-400" />
          <span className="sr-only">AI Assistant</span>
        </Button>
      </div>
      
      <Dialog open={showDocs} onOpenChange={setShowDocs}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>shrubAI Documentation</DialogTitle>
            <DialogDescription>
              How to use the plant identification app
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium mb-1">Taking a Photo</h3>
              <p>Click the camera button to use your device's camera to take a clear picture of your plant.</p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Uploading an Image</h3>
              <p>Click the upload button to select an image from your device's storage.</p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Identification</h3>
              <p>After selecting an image, click "identify plant" to analyze it. The app will identify the plant and provide information about it.</p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Plant Information</h3>
              <p>The app will show details about the plant, including its name, care requirements, and whether it's safe or toxic.</p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Where to Buy</h3>
              <p>For identified plants, you'll see online stores where you can purchase them.</p>
            </div>
            <div>
              <h3 className="font-medium mb-1">AI Assistant</h3>
              <p>Click the chat button at the bottom-left to chat with our AI assistant. You can upload photos directly to the chat to get more detailed information.</p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Disclaimers</h3>
              <p>Never rely solely on AI for identifying edible or toxic plants. Always consult with experts before consuming any plant or fungi.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <AIAssistant 
        open={showAgent} 
        onOpenChange={setShowAgent} 
        apiKey={deepseekApiKey}
        selectedImage={showAgent && selectedImage ? selectedImage : null}
      />
    </div>
  );
};

export default PlantIdentifier;
