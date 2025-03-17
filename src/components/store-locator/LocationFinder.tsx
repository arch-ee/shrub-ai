
import React from 'react';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocationFinderProps {
  plantName: string;
  userLocation: { lat: number; lng: number } | null;
  isLoading: boolean;
  onFind: () => void;
}

const LocationFinder: React.FC<LocationFinderProps> = ({ 
  plantName, 
  userLocation, 
  isLoading, 
  onFind 
}) => {
  return (
    <div className="p-4 bg-leaf-50 rounded-md text-center">
      <p className="text-leaf-700 mb-3">Using your location to find plants near you</p>
      <Button 
        onClick={onFind} 
        className="bg-leaf-600 hover:bg-leaf-700 text-white"
        disabled={!userLocation || isLoading}
      >
        <MapPin className="w-4 h-4 mr-2" />
        {isLoading ? 'Searching...' : `Find ${plantName} Near Me`}
      </Button>
    </div>
  );
};

export default LocationFinder;
