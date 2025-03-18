
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Store } from 'lucide-react';
import { NearbyStore, OnlineStore } from './store-locator/types';
import NearbyStores from './store-locator/NearbyStores';
import OnlineStores from './store-locator/OnlineStores';
import LocationFinder from './store-locator/LocationFinder';

interface PlantStoreLocatorProps {
  plantName: string;
}

const PlantStoreLocator = ({ plantName }: PlantStoreLocatorProps) => {
  const [nearbyStores, setNearbyStores] = useState<NearbyStore[]>([]);
  const [onlineStores, setOnlineStores] = useState<OnlineStore[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (locationError) => {
          console.error("Geolocation error:", locationError);
          setError("Unable to retrieve your location. Please enable location services.");
          toast({
            title: "Location error",
            description: "Unable to retrieve your location. Please enable location services in your browser.",
            variant: "destructive",
          });
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      toast({
        title: "Browser not supported",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    // Find stores when we have both the user location and plant name
    if (userLocation && plantName && plantName !== 'Unknown plant') {
      findStores();
    }
  }, [userLocation, plantName]);

  const findStores = async () => {
    if (!userLocation) return;
    
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    
    try {
      console.log("Calling find-plant-stores function with:", {
        plantName,
        lat: userLocation.lat,
        lng: userLocation.lng
      });
      
      // Call Supabase Edge Function to find nearby stores
      const { data, error: functionError } = await supabase.functions.invoke('find-plant-stores', {
        body: {
          lat: userLocation.lat,
          lng: userLocation.lng,
          plantName: plantName
        }
      });
      
      if (functionError) {
        console.error('Error from edge function:', functionError);
        throw new Error(functionError.message);
      }
      
      console.log("Edge function response:", data);
      
      if (data) {
        if (data.nearbyStores) {
          setNearbyStores(data.nearbyStores);
        }
        
        if (data.onlineStores) {
          setOnlineStores(data.onlineStores);
        }
      }
    } catch (err) {
      console.error('Error finding stores:', err);
      setError('Failed to find plant stores. Please try again later.');
      toast({
        title: "Store lookup failed",
        description: "We couldn't find plant stores near you. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!plantName || plantName === 'Unknown plant') {
    return null;
  }

  const noStoresMessage = (
    <>
      <p className="mb-2">No plant stores found nearby carrying {plantName}.</p>
      <p className="text-sm">Try checking online options below or visit general garden centers like Home Depot, Lowe's, or local nurseries.</p>
    </>
  );

  return (
    <Card className="p-6 backdrop-blur-sm bg-white/80 border-leaf-200 shadow-lg animate-fade-in">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium text-leaf-900">Where to Find {plantName}</h2>
          <Badge variant="subtle" className="bg-cream-100 text-leaf-700">
            {isLoading ? 'Searching...' : 'Results'}
          </Badge>
        </div>

        {error && (
          <div className="text-sm text-red-500 p-3 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        {!hasSearched && !isLoading && (
          <LocationFinder 
            plantName={plantName}
            userLocation={userLocation}
            isLoading={isLoading}
            onFind={findStores}
          />
        )}

        {isLoading && (
          <div className="py-8 text-center text-leaf-600">
            <div className="animate-pulse flex flex-col items-center">
              <Store className="h-8 w-8 mb-2" />
              <p>Finding places to buy {plantName}...</p>
            </div>
          </div>
        )}

        {hasSearched && !isLoading && (
          <div className="space-y-6">
            <NearbyStores 
              stores={nearbyStores} 
              noStoresMessage={noStoresMessage}
            />

            {nearbyStores.length > 0 && onlineStores.length > 0 && (
              <Separator className="my-4" />
            )}

            <OnlineStores stores={onlineStores} />
          </div>
        )}
      </div>
    </Card>
  );
};

export default PlantStoreLocator;
