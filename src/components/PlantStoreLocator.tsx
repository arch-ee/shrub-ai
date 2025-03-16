
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, ExternalLink, Store, ShoppingBag, Star, Phone, Navigation, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

interface NearbyStore {
  name: string;
  vicinity: string;
  rating?: number | string;
  distance?: string;
  mapUrl?: string;
  website?: string;
  phone?: string;
  placeId?: string;
  types?: string[];
  open_now?: boolean;
  location?: {
    lat: number;
    lng: number;
  };
}

interface OnlineStore {
  name: string;
  url: string;
  price?: string;
  description?: string;
  logo?: string;
}

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

  const getStoreIcon = (storeName: string) => {
    const storeName_lower = storeName.toLowerCase();
    if (storeName_lower.includes('home depot')) return '🏠';
    if (storeName_lower.includes('lowes') || storeName_lower.includes('lowe\'s')) return '🔨';
    if (storeName_lower.includes('walmart')) return '🛒';
    if (storeName_lower.includes('nursery') || storeName_lower.includes('garden')) return '🌱';
    if (storeName_lower.includes('florist')) return '💐';
    return '🪴';
  }

  if (!plantName || plantName === 'Unknown plant') {
    return null;
  }

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
          <div className="p-4 bg-leaf-50 rounded-md text-center">
            <p className="text-leaf-700 mb-3">Using your location to find plants near you</p>
            <Button 
              onClick={findStores} 
              className="bg-leaf-600 hover:bg-leaf-700 text-white"
              disabled={!userLocation}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Find {plantName} Near Me
            </Button>
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

        {hasSearched && !isLoading && (
          <div className="space-y-6">
            {nearbyStores.length > 0 ? (
              <div className="space-y-3">
                <h3 className="font-medium text-leaf-800 flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-leaf-500" />
                  Nearby Stores
                </h3>
                <ScrollArea className="w-full">
                  <div className="flex pb-4 space-x-4">
                    {nearbyStores.map((store, index) => (
                      <div 
                        key={index} 
                        className="flex-shrink-0 w-64 p-4 bg-leaf-50 rounded-md shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <span className="text-xl mr-2">{getStoreIcon(store.name)}</span>
                            <div>
                              <p className="font-medium text-leaf-800">{store.name}</p>
                              <p className="text-sm text-leaf-600 mt-1">{store.vicinity}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-cream-50">
                            {store.distance}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center text-sm text-leaf-600 mt-2 mb-3">
                          {store.rating && (
                            <div className="flex items-center mr-3">
                              <Star className="w-3 h-3 mr-1 text-amber-500" />
                              <span>{store.rating}</span>
                            </div>
                          )}
                          {store.open_now !== undefined && (
                            <span className={store.open_now ? "text-green-600" : "text-red-500"}>
                              {store.open_now ? "Open Now" : "Closed"}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs flex items-center gap-1 text-leaf-800"
                            onClick={() => window.open(store.mapUrl, '_blank')}
                          >
                            <Navigation className="w-3 h-3" />
                            Directions
                          </Button>
                          
                          {store.website && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs flex items-center gap-1 text-leaf-800"
                              onClick={() => window.open(store.website, '_blank')}
                            >
                              <ExternalLink className="w-3 h-3" />
                              Website
                            </Button>
                          )}
                          
                          {store.phone && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs flex items-center gap-1 text-leaf-800"
                              onClick={() => window.open(`tel:${store.phone}`, '_blank')}
                            >
                              <Phone className="w-3 h-3" />
                              Call
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="p-4 bg-leaf-50 rounded-md text-leaf-600">
                <p className="mb-2">No plant stores found nearby carrying {plantName}.</p>
                <p className="text-sm">Try checking online options below or visit general garden centers like Home Depot, Lowe's, or local nurseries.</p>
              </div>
            )}

            <Separator className="my-4" />

            {onlineStores.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-leaf-800 flex items-center">
                  <ShoppingBag className="w-4 h-4 mr-2 text-leaf-500" />
                  Buy Online
                </h3>
                <Carousel className="w-full">
                  <CarouselContent>
                    {onlineStores.map((store, index) => (
                      <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                        <div 
                          className="p-4 bg-leaf-50 rounded-md shadow-sm hover:shadow-md transition-shadow h-full flex flex-col"
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="flex justify-between items-start">
                            <p className="font-medium text-leaf-800">{store.name}</p>
                            {store.price && (
                              <Badge variant="outline" className="bg-cream-50">
                                {store.price}
                              </Badge>
                            )}
                          </div>
                          {store.description && (
                            <p className="text-sm text-leaf-600 mt-2 mb-3">{store.description}</p>
                          )}
                          <div className="mt-auto pt-3">
                            <Button 
                              variant="default" 
                              size="sm" 
                              className="w-full bg-leaf-600 hover:bg-leaf-700 text-white flex items-center justify-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(store.url, '_blank');
                              }}
                            >
                              <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                              Shop on {store.name}
                            </Button>
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default PlantStoreLocator;
