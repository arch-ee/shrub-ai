
import React, { useState } from 'react';
import { Camera, Upload, Sprout, Heart, Droplet, Sun, ThermometerSun } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface PlantInfo {
  name: string;
  health: number;
  waterNeeds: string;
  sunlight: string;
  temperature: string;
}

const PlantIdentifier = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [plantInfo, setPlantInfo] = useState<PlantInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

            <Input
              type="text"
              placeholder="enter your gemini api key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-white/50"
            />

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
