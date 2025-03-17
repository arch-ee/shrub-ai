import React from 'react';
import { Heart, Droplet, Sun, ThermometerSun, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
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
  edibleParts?: string;
  warningSymptoms?: string;
  isFungus?: boolean;
}

interface PlantInfoCardProps {
  plantInfo: PlantInfo;
  darkMode: boolean;
}

const PlantInfoCard = ({ plantInfo, darkMode }: PlantInfoCardProps) => {
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

  const getToxicityBadge = (toxicity: string | undefined) => {
    if (!toxicity || toxicity === 'Unknown') return null;
    
    switch(toxicity.toLowerCase()) {
      case 'none':
        return <Badge className="bg-green-500">Safe</Badge>;
      case 'mild':
        return <Badge className="bg-yellow-500">Mild Toxicity</Badge>;
      case 'moderate':
        return <Badge className="bg-orange-500">Moderate Toxicity</Badge>;
      case 'severe':
        return <Badge className="bg-red-500">Severe Toxicity</Badge>;
      default:
        return <Badge className="bg-gray-500">{toxicity}</Badge>;
    }
  };

  const isUnknown = plantInfo.name === 'Unknown plant';

  return (
    <Card className={`p-6 ${darkMode ? 'bg-gray-800/90 border-gray-700' : 'backdrop-blur-sm bg-white/80 border-leaf-200'} shadow-lg animate-fade-in transition-colors duration-300`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-xl font-medium ${darkMode ? 'text-gray-100' : 'text-leaf-900'}`}>
              {isUnknown ? "Unknown Plant 🌱" : plantInfo.name}
            </h2>
            <div className="flex gap-2 mt-1">
              {plantInfo.isFungus && (
                <Badge variant="outline" className={darkMode ? 'border-purple-400 text-purple-300' : 'border-purple-500 text-purple-700'}>
                  Fungus
                </Badge>
              )}
              {getToxicityBadge(plantInfo.toxicity)}
            </div>
          </div>
          {!isUnknown && (
            <span className="text-2xl">
              {plantInfo.health >= 70 ? '🌿' : plantInfo.health >= 50 ? '🌱' : '🥀'}
            </span>
          )}
        </div>

        <div className="space-y-3">
          {isUnknown ? (
            <div className={`text-sm italic ${darkMode ? 'text-gray-400' : 'text-leaf-600'}`}>
              We couldn't identify this. Try taking a clearer picture or from a different angle.
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <Heart className={`w-4 h-4 mr-2 ${darkMode ? 'text-leaf-400' : 'text-leaf-500'}`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-leaf-600'}>{getHealthDescription(plantInfo.health)}</span>
                  </div>
                  <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-leaf-600'}`}>{plantInfo.health}%</span>
                </div>
                <Progress value={plantInfo.health} className={`h-2 ${darkMode ? 'bg-gray-700' : 'bg-leaf-100'}`} />
              </div>
              
              <div className={`flex items-center justify-between text-sm ${darkMode ? 'text-gray-300' : 'text-leaf-600'}`}>
                {plantInfo.isEdible ? (
                  <div className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                    <span>edible</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <XCircle className="w-4 h-4 mr-2 text-red-500" />
                    <span>not edible</span>
                  </div>
                )}
              </div>
              
              {plantInfo.edibleParts && plantInfo.edibleParts !== 'None' && (
                <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-leaf-600'}`}>
                  <span className="font-medium">edible parts:</span> {plantInfo.edibleParts}
                </div>
              )}
              
              <div className={`flex items-center text-sm ${darkMode ? 'text-gray-300' : 'text-leaf-600'}`}>
                <Droplet className={`w-4 h-4 mr-2 ${darkMode ? 'text-leaf-400' : 'text-leaf-500'}`} />
                <span>water needs: {plantInfo.waterNeeds} {getWaterEmoji(plantInfo.waterNeeds)}</span>
              </div>
              <div className={`flex items-center text-sm ${darkMode ? 'text-gray-300' : 'text-leaf-600'}`}>
                <Sun className={`w-4 h-4 mr-2 ${darkMode ? 'text-leaf-400' : 'text-leaf-500'}`} />
                <span>sunlight: {plantInfo.sunlight} {getSunlightEmoji(plantInfo.sunlight)}</span>
              </div>
              <div className={`flex items-center text-sm ${darkMode ? 'text-gray-300' : 'text-leaf-600'}`}>
                <ThermometerSun className={`w-4 h-4 mr-2 ${darkMode ? 'text-leaf-400' : 'text-leaf-500'}`} />
                <span>temperature: {plantInfo.temperature} {getTemperatureEmoji(plantInfo.temperature)}</span>
              </div>
              
              {(plantInfo.toxicity && plantInfo.toxicity !== 'none' && plantInfo.toxicity !== 'Unknown') && (
                <div className={`mt-4 p-3 ${darkMode ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-100'} rounded-md border`}>
                  <h3 className={`font-medium flex items-center ${darkMode ? 'text-red-300' : 'text-red-700'} mb-1`}>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Warning
                  </h3>
                  {plantInfo.warningSymptoms && (
                    <p className={`text-sm ${darkMode ? 'text-red-200' : 'text-red-600'}`}>
                      {plantInfo.warningSymptoms}
                    </p>
                  )}
                </div>
              )}
              
              {(plantInfo.diagnosis || plantInfo.hasRottenLeaves) && (
                <div className={`mt-4 p-3 ${darkMode ? 'bg-amber-900/30 border-amber-800' : 'bg-amber-50 border-amber-100'} rounded-md border`}>
                  <h3 className={`font-medium ${darkMode ? 'text-amber-300' : 'text-amber-700'} mb-1`}>Diagnosis 🔍</h3>
                  <p className={`text-sm ${darkMode ? 'text-amber-200' : 'text-amber-600'}`}>
                    {plantInfo.diagnosis || (plantInfo.hasRottenLeaves ? 'This plant has signs of rotten leaves' : '')}
                  </p>
                  
                  {plantInfo.cure && (
                    <div className="mt-2">
                      <h3 className={`font-medium ${darkMode ? 'text-green-300' : 'text-green-700'} mb-1`}>Treatment 💊</h3>
                      <p className={`text-sm ${darkMode ? 'text-green-200' : 'text-green-600'}`}>{plantInfo.cure}</p>
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
