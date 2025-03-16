
import React from 'react';
import { ShoppingBag, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

interface OnlineStore {
  name: string;
  url: string;
  price?: string;
  description?: string;
  logo?: string;
}

interface OnlineStoresProps {
  stores: OnlineStore[];
}

const OnlineStores: React.FC<OnlineStoresProps> = ({ stores }) => {
  if (stores.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-leaf-800 flex items-center">
        <ShoppingBag className="w-4 h-4 mr-2 text-leaf-500" />
        Buy Online
      </h3>
      <Carousel className="w-full">
        <CarouselContent>
          {stores.map((store, index) => (
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
  );
};

export default OnlineStores;
