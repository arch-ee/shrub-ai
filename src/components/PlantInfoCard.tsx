
import React from 'react';
import { Heart, Droplet, Sun, ThermometerSun, AlertTriangle, Skull, HandMetal } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

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

  const getToxicityColor = (toxicity: string = 'Unknown') => {
    const lowerToxicity = toxicity.toLowerCase();
    
    if (lowerToxicity === 'none') return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    if (lowerToxicity === 'mild') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    if (lowerToxicity === 'moderate') return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    if (lowerToxicity === 'severe') return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getCategoryEmoji = (category: string = 'plant') => {
    const lowerCategory = category.toLowerCase();
    
    if (lowerCategory === 'plant') return '🌿';
    if (lowerCategory === 'berry') return '🍓';
    if (lowerCategory === 'fruit') return '🍎';
    if (lowerCategory === 'fungi' || lowerCategory === 'mushroom') return '🍄';
    if (lowerCategory === 'leaf') return '🍃';
    
    return '🌱';
  };

  const getHealthStatusColor = (health: number) => {
    if (health >= 90) return 'bg-green-500';
    if (health >= 70) return 'bg-green-400';
    if (health >= 50) return 'bg-yellow-400';
    if (health >= 30) return 'bg-orange-400';
    return 'bg-red-500';
  };

  const getHealthCardColor = (health: number) => {
    if (health >= 90) return 'bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-800/30';
    if (health >= 70) return 'bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-800/30';
    if (health >= 50) return 'bg-yellow-50 border-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-800/30';
    if (health >= 30) return 'bg-orange-50 border-orange-100 dark:bg-orange-900/20 dark:border-orange-800/30';
    return 'bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-800/30';
  };

  const isUnknown = plantInfo.name === 'Unknown specimen' || plantInfo.name === 'Unknown plant';
  const isFungi = plantInfo.category?.toLowerCase() === 'fungi' || plantInfo.category?.toLowerCase() === 'mushroom';

  return (
    <Card className="p-6 backdrop-blur-sm bg-white/80 border-leaf-200 shadow-lg animate-fade-in dark:bg-gray-800/60 dark:border-gray-700 dark:text-cream-50">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium text-leaf-900 dark:text-cream-100">
            {isUnknown ? "Unknown Specimen 🌱" : plantInfo.name}
          </h2>
          {!isUnknown && (
            <span className="text-2xl">
              {getCategoryEmoji(plantInfo.category)}
            </span>
          )}
        </div>

        <div className="space-y-3">
          {isUnknown ? (
            <div className="text-sm text-leaf-600 dark:text-cream-300 italic">
              We couldn't identify this. Try taking a clearer picture or from a different angle.
            </div>
          ) : (
            <>
              {plantInfo.category && (
                <div className="text-sm text-leaf-600 dark:text-cream-300 italic">
                  Category: {plantInfo.category}
                </div>
              )}
              
              <div className={`space-y-1 p-3 rounded-md ${getHealthCardColor(plantInfo.health)}`}>
                <div className="flex items-center justify-between text-sm text-leaf-600 dark:text-cream-300">
                  <div className="flex items-center">
                    <Heart className="w-4 h-4 mr-2 text-leaf-500 dark:text-leaf-400" />
                    <span>{getHealthDescription(plantInfo.health)}</span>
                  </div>
                  <span className="font-medium">{plantInfo.health}%</span>
                </div>
                <Progress 
                  value={plantInfo.health} 
                  className={`h-2 bg-leaf-100 dark:bg-leaf-900`} 
                  indicatorClassName={getHealthStatusColor(plantInfo.health)}
                />
              </div>
              
              <div className="flex items-center text-sm text-leaf-600 dark:text-cream-300">
                <Droplet className="w-4 h-4 mr-2 text-leaf-500 dark:text-leaf-400" />
                <span>water needs: {plantInfo.waterNeeds} {getWaterEmoji(plantInfo.waterNeeds)}</span>
              </div>
              
              <div className="flex items-center text-sm text-leaf-600 dark:text-cream-300">
                <Sun className="w-4 h-4 mr-2 text-leaf-500 dark:text-leaf-400" />
                <span>sunlight: {plantInfo.sunlight} {getSunlightEmoji(plantInfo.sunlight)}</span>
              </div>
              
              <div className="flex items-center text-sm text-leaf-600 dark:text-cream-300">
                <ThermometerSun className="w-4 h-4 mr-2 text-leaf-500 dark:text-leaf-400" />
                <span>temperature: {plantInfo.temperature} {getTemperatureEmoji(plantInfo.temperature)}</span>
              </div>
              
              {/* Safety Information Section */}
              <div className="mt-4 p-4 bg-cream-50 rounded-md border border-cream-200 dark:bg-gray-700/50 dark:border-gray-600">
                <h3 className="font-medium text-leaf-900 dark:text-cream-100 mb-3">Safety Information</h3>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {plantInfo.isEdible !== undefined && (
                    <Badge 
                      className={plantInfo.isEdible 
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" 
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      }
                    >
                      {plantInfo.isEdible ? 'Edible ✓' : 'Not Edible ✗'}
                    </Badge>
                  )}
                  
                  {plantInfo.toxicity && plantInfo.toxicity !== 'Unknown' && (
                    <Badge className={getToxicityColor(plantInfo.toxicity)}>
                      Toxicity: {plantInfo.toxicity}
                    </Badge>
                  )}
                  
                  {plantInfo.harmfulTouch && (
                    <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                      Harmful to Touch ⚠️
                    </Badge>
                  )}
                </div>
                
                {/* Fungi Disclaimer */}
                {isFungi && (
                  <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-100 dark:border-red-800/30">
                    <div className="flex items-start">
                      <AlertTriangle className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-red-700 dark:text-red-300 mb-1">Mushroom Warning</h3>
                        <p className="text-sm text-red-600 dark:text-red-200">
                          Visual identification of fungi can be extremely unreliable. Many toxic mushrooms closely resemble edible varieties. Never consume wild mushrooms based solely on app identification. Consult with a professional mycologist.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Warning Containers */}
                {plantInfo.warning && (
                  <div className="mb-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-100 dark:border-yellow-800/30">
                    <div className="flex items-start">
                      <Skull className="w-5 h-5 text-yellow-500 mr-2 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-yellow-700 dark:text-yellow-300 mb-1">If Consumed</h3>
                        <p className="text-sm text-yellow-600 dark:text-yellow-200">{plantInfo.warning}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {plantInfo.touchWarning && (
                  <div className="mb-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-md border border-orange-100 dark:border-orange-800/30">
                    <div className="flex items-start">
                      <HandMetal className="w-5 h-5 text-orange-500 mr-2 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-orange-700 dark:text-orange-300 mb-1">If Touched</h3>
                        <p className="text-sm text-orange-600 dark:text-orange-200">{plantInfo.touchWarning}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-leaf-500 dark:text-leaf-300 mt-2">
                  ⚠️ This information is provided as guidance only. In case of ingestion of a potentially harmful substance, contact poison control immediately.
                </p>
              </div>
              
              {(plantInfo.diagnosis || plantInfo.hasRottenLeaves) && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-100 dark:border-red-800/30">
                  <h3 className="font-medium text-red-700 dark:text-red-300 mb-1">Diagnosis 🔍</h3>
                  <p className="text-sm text-red-600 dark:text-red-200">
                    {plantInfo.diagnosis || (plantInfo.hasRottenLeaves ? 'This has signs of rotten leaves' : '')}
                  </p>
                  
                  {plantInfo.cure && (
                    <div className="mt-2">
                      <h3 className="font-medium text-green-700 dark:text-green-300 mb-1">Treatment 💊</h3>
                      <p className="text-sm text-green-600 dark:text-green-200">{plantInfo.cure}</p>
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
