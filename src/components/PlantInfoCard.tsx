
import React from 'react';
import { Heart, Droplet, Sun, ThermometerSun, AlertTriangle, Check, X, Apple } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface PlantInfo {
  name: string;
  scientificName?: string;
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
  // Advanced mode fields
  soilType?: string;
  growthStage?: string;
  propagationMethod?: string;
  commonDiseases?: string;
  careInstructions?: string;
  seasonalChanges?: string;
  pruningNeeds?: string;
  fertilizationSchedule?: string;
  expectedLifespan?: string;
  nativeRegion?: string;
  indoorOrOutdoor?: string;
  companionPlants?: string;
  pests?: string;
}

interface PlantInfoCardProps {
  plantInfo: PlantInfo;
  isAdvancedMode?: boolean;
}

const PlantInfoCard = ({ plantInfo, isAdvancedMode = false }: PlantInfoCardProps) => {
  const getHealthDescription = (health: number, category?: string) => {
    if (category === 'fruit' || category === 'berry') {
      if (health >= 90) return 'Perfect ripeness 🍎';
      if (health >= 70) return 'Good condition 🍏';
      if (health >= 50) return 'Eat soon 🥭';
      return 'Past prime 🥝';
    } else if (category === 'fungi') {
      if (health >= 90) return 'Fresh specimen 🍄';
      if (health >= 70) return 'Good condition 🍄';
      if (health >= 50) return 'Still usable 🍄';
      return 'Poor condition 🍄';
    } else {
      if (health >= 90) return 'Very healthy 🌿';
      if (health >= 70) return 'Healthy 🌱';
      if (health >= 50) return 'Needs some care 🍃';
      return 'Needs immediate attention 🥀';
    }
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

  const getHealthColor = (health: number) => {
    if (health >= 90) return 'bg-green-500';
    if (health >= 70) return 'bg-green-400';
    if (health >= 50) return 'bg-yellow-500';
    if (health >= 30) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const isUnknown = plantInfo.name.includes('Unknown');
  const isFungi = plantInfo.category === 'fungi';
  const isFruit = plantInfo.category === 'fruit';
  const isBerry = plantInfo.category === 'berry';
  const isPlant = plantInfo.category === 'plant' || !plantInfo.category;
  
  const getCardTitle = () => {
    if (isUnknown) {
      if (isFungi) return "Unknown Fungi 🍄";
      if (isFruit) return "Unknown Fruit 🍎";
      if (isBerry) return "Unknown Berry 🍒";
      return "Unknown Plant 🌱";
    }
    return plantInfo.name;
  };

  const renderAdvancedInfo = () => {
    if (!isAdvancedMode || isUnknown) return null;
    
    const advancedFields = [
      { label: 'Scientific Name', value: plantInfo.scientificName, emoji: '🔬' },
      { label: 'Soil Type', value: plantInfo.soilType, emoji: '🏞️' },
      { label: 'Growth Stage', value: plantInfo.growthStage, emoji: '📏' },
      { label: 'Propagation', value: plantInfo.propagationMethod, emoji: '🌱' },
      { label: 'Common Diseases', value: plantInfo.commonDiseases, emoji: '🦠' },
      { label: 'Care Instructions', value: plantInfo.careInstructions, emoji: '📝' },
      { label: 'Seasonal Changes', value: plantInfo.seasonalChanges, emoji: '🍂' },
      { label: 'Pruning Needs', value: plantInfo.pruningNeeds, emoji: '✂️' },
      { label: 'Fertilization', value: plantInfo.fertilizationSchedule, emoji: '💩' },
      { label: 'Lifespan', value: plantInfo.expectedLifespan, emoji: '⏳' },
      { label: 'Native Region', value: plantInfo.nativeRegion, emoji: '🌍' },
      { label: 'Best Environment', value: plantInfo.indoorOrOutdoor, emoji: '🏡' },
      { label: 'Companion Plants', value: plantInfo.companionPlants, emoji: '👯' },
      { label: 'Common Pests', value: plantInfo.pests, emoji: '🐛' }
    ];
    
    const availableFields = advancedFields.filter(field => field.value);
    
    if (availableFields.length === 0) return null;
    
    return (
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="font-medium text-leaf-800 dark:text-leaf-300 mb-3">Advanced Information</h3>
        <div className="space-y-3">
          {availableFields.map((field, index) => (
            <div key={index} className="flex items-start">
              <span className="mr-2">{field.emoji}</span>
              <div>
                <span className="font-medium text-sm">{field.label}:</span>{' '}
                <span className="text-sm text-leaf-600 dark:text-leaf-200">{field.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="p-6 backdrop-blur-sm bg-white/80 border-leaf-200 shadow-lg animate-fade-in dark:bg-gray-800/60 dark:border-gray-700 dark:text-cream-50">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-medium text-leaf-900 dark:text-cream-100">
              {getCardTitle()}
            </h2>
            {plantInfo.scientificName && (
              <p className="text-sm italic text-gray-600 dark:text-gray-400">
                {plantInfo.scientificName}
              </p>
            )}
          </div>
          {!isUnknown && (
            <span className="text-2xl">
              {isFungi ? '🍄' : 
               isFruit ? '🍎' : 
               isBerry ? '🍒' :
               (plantInfo.health >= 70 ? '🌿' : plantInfo.health >= 50 ? '🌱' : '🥀')}
            </span>
          )}
        </div>

        <div className="space-y-3">
          {isUnknown ? (
            <div className="text-sm text-leaf-600 dark:text-cream-300 italic">
              We couldn't identify this {plantInfo.category || 'plant'}. Try taking a clearer picture or from a different angle.
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm text-leaf-600 dark:text-cream-300">
                  <div className="flex items-center">
                    <Heart className="w-4 h-4 mr-2 text-leaf-500 dark:text-leaf-400" />
                    <span>{getHealthDescription(plantInfo.health, plantInfo.category)}</span>
                  </div>
                  <span className="font-medium">{plantInfo.health}%</span>
                </div>
                <Progress 
                  value={plantInfo.health} 
                  className="h-2 bg-leaf-100 dark:bg-leaf-900" 
                  style={{
                    "--progress-background": getHealthColor(plantInfo.health)
                  } as React.CSSProperties}
                />
              </div>
              
              {/* Display plant-specific information for plants only */}
              {isPlant && (
                <>
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
                </>
              )}

              {/* Display nutritional info for fruits and berries */}
              {(isFruit || isBerry) && plantInfo.nutritionalValue && (
                <div className="flex items-center text-sm text-leaf-600 dark:text-cream-300">
                  <Apple className="w-4 h-4 mr-2 text-leaf-500 dark:text-leaf-400" />
                  <span>nutritional value: {plantInfo.nutritionalValue}</span>
                </div>
              )}
              
              {/* Safe to touch indicator */}
              <div className="flex items-center text-sm text-leaf-600 dark:text-cream-300">
                {plantInfo.safeToTouch ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-green-500" />
                    <span>Safe to touch</span>
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 mr-2 text-red-500" />
                    <span>Not safe to touch</span>
                  </>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3">
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
              </div>
              
              {(plantInfo.diagnosis || plantInfo.hasRottenLeaves) && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-100 dark:border-red-800/30">
                  <h3 className="font-medium text-red-700 dark:text-red-300 mb-1">Diagnosis 🔍</h3>
                  <p className="text-sm text-red-600 dark:text-red-200">
                    {plantInfo.diagnosis || (plantInfo.hasRottenLeaves ? 'This plant has signs of rotten leaves' : '')}
                  </p>
                  
                  {plantInfo.cure && (
                    <div className="mt-2">
                      <h3 className="font-medium text-green-700 dark:text-green-300 mb-1">Treatment 💊</h3>
                      <p className="text-sm text-green-600 dark:text-green-200">{plantInfo.cure}</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Show fungi disclaimer */}
              {isFungi && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-100 dark:border-red-800/30">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-red-700 dark:text-red-300 mb-1">Fungi Disclaimer</h3>
                      <p className="text-sm text-red-600 dark:text-red-200">
                        Never consume any fungi based solely on AI identification. Many poisonous mushrooms look similar to edible ones. Always consult with a mycology expert before consuming any wild fungi.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {plantInfo.warning && (
                <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-100 dark:border-yellow-800/30">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-yellow-700 dark:text-yellow-300 mb-1">Warning</h3>
                      <p className="text-sm text-yellow-600 dark:text-yellow-200">{plantInfo.warning}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Advanced information section */}
              {renderAdvancedInfo()}
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default PlantInfoCard;
