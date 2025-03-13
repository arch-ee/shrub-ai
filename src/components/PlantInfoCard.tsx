
import React from 'react';
import { Heart, Droplet, Sun, ThermometerSun } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface PlantInfo {
  name: string;
  health: number;
  waterNeeds: string;
  sunlight: string;
  temperature: string;
}

interface PlantInfoCardProps {
  plantInfo: PlantInfo;
}

const PlantInfoCard = ({ plantInfo }: PlantInfoCardProps) => {
  const getHealthEmoji = (health: number) => {
    if (health >= 90) return '🌿';
    if (health >= 70) return '🌱';
    if (health >= 50) return '🍃';
    return '🥀';
  };

  const getWaterEmoji = (waterNeeds: string) => {
    const lowWaterTerms = ['low', 'minimal', 'infrequent', 'drought', 'dry'];
    const mediumWaterTerms = ['moderate', 'average', 'medium', 'regular'];
    const highWaterTerms = ['high', 'frequent', 'moist', 'wet', 'constant'];
    
    const lowerWaterNeeds = waterNeeds.toLowerCase();
    
    if (lowWaterTerms.some(term => lowerWaterNeeds.includes(term))) return '💧';
    if (mediumWaterTerms.some(term => lowerWaterNeeds.includes(term))) return '💧💧';
    if (highWaterTerms.some(term => lowerWaterNeeds.includes(term))) return '💧💧💧';
    
    return '💧';
  };

  const getSunlightEmoji = (sunlight: string) => {
    const lowSunTerms = ['low', 'shade', 'indirect', 'partial', 'filtered'];
    const mediumSunTerms = ['moderate', 'medium', 'dappled', 'part sun'];
    const highSunTerms = ['full', 'direct', 'bright', 'high'];
    
    const lowerSunlight = sunlight.toLowerCase();
    
    if (lowSunTerms.some(term => lowerSunlight.includes(term))) return '🌤️';
    if (mediumSunTerms.some(term => lowerSunlight.includes(term))) return '⛅';
    if (highSunTerms.some(term => lowerSunlight.includes(term))) return '☀️';
    
    return '⛅';
  };

  const getTemperatureEmoji = (temperature: string) => {
    const coolTerms = ['cool', 'cold', 'chilly', 'low'];
    const warmTerms = ['warm', 'hot', 'high', 'tropical'];
    
    const lowerTemperature = temperature.toLowerCase();
    
    if (coolTerms.some(term => lowerTemperature.includes(term))) return '❄️';
    if (warmTerms.some(term => lowerTemperature.includes(term))) return '🔥';
    
    return '🌡️';
  };

  return (
    <Card className="p-6 backdrop-blur-sm bg-white/80 border-leaf-200 shadow-lg animate-fade-in">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium text-leaf-900">{plantInfo.name}</h2>
          <span className="text-2xl">{getHealthEmoji(plantInfo.health)}</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-sm text-leaf-600">
            <Heart className="w-4 h-4 mr-2 text-leaf-500" />
            <span>health: {plantInfo.health}% {getHealthEmoji(plantInfo.health)}</span>
          </div>
          <div className="flex items-center text-sm text-leaf-600">
            <Droplet className="w-4 h-4 mr-2 text-leaf-500" />
            <span>water needs: {plantInfo.waterNeeds} {getWaterEmoji(plantInfo.waterNeeds)}</span>
          </div>
          <div className="flex items-center text-sm text-leaf-600">
            <Sun className="w-4 h-4 mr-2 text-leaf-500" />
            <span>sunlight: {plantInfo.sunlight} {getSunlightEmoji(plantInfo.sunlight)}</span>
          </div>
          <div className="flex items-center text-sm text-leaf-600">
            <ThermometerSun className="w-4 h-4 mr-2 text-leaf-500" />
            <span>temperature: {plantInfo.temperature} {getTemperatureEmoji(plantInfo.temperature)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PlantInfoCard;
