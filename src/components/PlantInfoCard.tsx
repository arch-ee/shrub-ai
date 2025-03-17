
import React from 'react';
import { Heart, Droplet, Sun, ThermometerSun } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

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

interface PlantInfoCardProps {
  plantInfo: PlantInfo;
}

const PlantInfoCard = ({ plantInfo }: PlantInfoCardProps) => {
  const getHealthDescription = (health: number) => {
    if (health >= 90) return 'Very healthy 🌿';
    if (health >= 70) return 'Healthy 🌱';
    if (health >= 50) return 'Needs some care 🍃';
    return 'Needs immediate attention 🥀';
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

  const isUnknown = plantInfo.name === 'Unknown plant';

  return (
    <Card className="p-6 backdrop-blur-sm bg-white/80 border-leaf-200 shadow-lg animate-fade-in">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium text-leaf-900">
            {isUnknown ? "Unknown Plant 🌱" : plantInfo.name}
          </h2>
          {!isUnknown && (
            <span className="text-2xl">
              {plantInfo.health >= 70 ? '🌿' : plantInfo.health >= 50 ? '🌱' : '🥀'}
            </span>
          )}
        </div>

        <div className="space-y-3">
          {isUnknown ? (
            <div className="text-sm text-leaf-600 italic">
              We couldn't identify this plant. Try taking a clearer picture or from a different angle.
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm text-leaf-600">
                  <div className="flex items-center">
                    <Heart className="w-4 h-4 mr-2 text-leaf-500" />
                    <span>{getHealthDescription(plantInfo.health)}</span>
                  </div>
                  <span className="font-medium">{plantInfo.health}%</span>
                </div>
                <Progress value={plantInfo.health} className="h-2 bg-leaf-100" />
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
              
              {(plantInfo.diagnosis || plantInfo.hasRottenLeaves) && (
                <div className="mt-4 p-3 bg-red-50 rounded-md border border-red-100">
                  <h3 className="font-medium text-red-700 mb-1">Diagnosis 🔍</h3>
                  <p className="text-sm text-red-600">
                    {plantInfo.diagnosis || (plantInfo.hasRottenLeaves ? 'This plant has signs of rotten leaves' : '')}
                  </p>
                  
                  {plantInfo.cure && (
                    <div className="mt-2">
                      <h3 className="font-medium text-green-700 mb-1">Treatment 💊</h3>
                      <p className="text-sm text-green-600">{plantInfo.cure}</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default PlantInfoCard;
