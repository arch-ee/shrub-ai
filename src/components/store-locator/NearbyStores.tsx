
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, ExternalLink, Star, Phone, Navigation } from 'lucide-react';

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

interface NearbyStoresProps {
  stores: NearbyStore[];
  noStoresMessage: React.ReactNode;
}

const getStoreIcon = (storeName: string) => {
  const storeName_lower = storeName.toLowerCase();
  if (storeName_lower.includes('home depot')) return '🏠';
  if (storeName_lower.includes('lowes') || storeName_lower.includes('lowe\'s')) return '🔨';
  if (storeName_lower.includes('walmart')) return '🛒';
  if (storeName_lower.includes('nursery') || storeName_lower.includes('garden')) return '🌱';
  if (storeName_lower.includes('florist')) return '💐';
  return '🪴';
}

const NearbyStores: React.FC<NearbyStoresProps> = ({ stores, noStoresMessage }) => {
  if (stores.length === 0) {
    return (
      <div className="p-4 bg-leaf-50 rounded-md text-leaf-600">
        {noStoresMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-leaf-800 flex items-center">
        <MapPin className="w-4 h-4 mr-2 text-leaf-500" />
        Nearby Stores
      </h3>
      <ScrollArea className="w-full">
        <div className="flex pb-4 space-x-4">
          {stores.map((store, index) => (
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
  );
};

export default NearbyStores;
