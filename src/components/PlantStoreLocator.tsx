
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, ExternalLink, Store, ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Store {
  name: string;
  vicinity: string;
  rating?: number;
  distance?: string;
  url?: string;
}

interface OnlineStore {
  name: string;
  url: string;
  price?: string;
  description?: string;
}

interface PlantStoreLocatorProps {
  plantName: string;
}

const PlantStoreLocator = ({ plantName }: PlantStoreLocatorProps) => {
  const [nearbyStores, setNearbyStores] = useState<Store[]>([]);
  const [onlineStores, setOnlineStores] = useState<OnlineStore[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
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

  return (
    <Card className="p-6 backdrop-blur-sm bg-white/80 border-leaf-200 shadow-lg animate-fade-in">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium text-leaf-900">Where to Find This Plant</h2>
          <Badge variant="subtle" className="bg-cream-100 text-leaf-700">
            {isLoading ? 'Searching...' : 'Results'}
          </Badge>
        </div>

        {error && (
          <div className="text-sm text-red-500 p-3 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="py-8 text-center text-leaf-600">
            <div className="animate-pulse flex flex-col items-center">
              <Store className="h-8 w-8 mb-2" />
              <p>Finding places to buy {plantName}...</p>
            </div>
          </div>
        )}

        {!isLoading && (
          <div className="space-y-4">
            {nearbyStores.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-leaf-800 flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-leaf-500" />
                  Nearby Stores
                </h3>
                <div className="space-y-2">
                  {nearbyStores.map((store, index) => (
                    <div key={index} className="p-3 bg-leaf-50 rounded-md">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium text-leaf-800">{store.name}</p>
                          <p className="text-sm text-leaf-600">{store.vicinity}</p>
                        </div>
                        {store.distance && (
                          <Badge variant="secondary" className="self-start">
                            {store.distance}
                          </Badge>
                        )}
                      </div>
                      {store.url && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2 text-xs"
                          onClick={() => window.open(store.url, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View on Maps
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isLoading && nearbyStores.length === 0 && (
              <div className="p-3 bg-leaf-50 rounded-md text-leaf-600 text-sm">
                No plant stores found nearby carrying {plantName}. Try checking online options below.
              </div>
            )}

            {onlineStores.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-leaf-800 flex items-center">
                  <ShoppingBag className="w-4 h-4 mr-2 text-leaf-500" />
                  Buy Online
                </h3>
                <div className="space-y-2">
                  {onlineStores.map((store, index) => (
                    <div key={index} className="p-3 bg-leaf-50 rounded-md">
                      <div className="flex justify-between">
                        <p className="font-medium text-leaf-800">{store.name}</p>
                        {store.price && (
                          <Badge variant="secondary" className="self-start">
                            {store.price}
                          </Badge>
                        )}
                      </div>
                      {store.description && (
                        <p className="text-sm text-leaf-600 mt-1">{store.description}</p>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 text-xs"
                        onClick={() => window.open(store.url, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Visit Store
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isLoading && onlineStores.length === 0 && (
              <div className="p-3 bg-leaf-50 rounded-md text-leaf-600 text-sm">
                Couldn't find online stores selling {plantName}. Try a generic search on plant retailers.
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default PlantStoreLocator;
