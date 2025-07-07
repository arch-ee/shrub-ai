import React from 'react';
import { ShoppingBag, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
  if (stores.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-leaf-800 flex items-center dark:text-cream-100">
        <ShoppingBag className="w-4 h-4 mr-2 text-leaf-500 dark:text-leaf-400" />
        Buy Online
      </h3>
      <ScrollArea className="w-full max-h-96">
        <div className="space-y-3 pr-4">
          {stores.map((store, index) => (
            <div 
              key={index} 
              className="p-4 bg-leaf-50 rounded-md shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800/60 dark:border-gray-700 cursor-pointer"
              onClick={() => window.open(store.url, '_blank')}
            >
              <div className="flex justify-between items-start mb-2">
                <p className="font-medium text-leaf-800 dark:text-cream-100">{store.name}</p>
                {store.price && (
                  <Badge variant="outline" className="bg-cream-50 dark:bg-gray-700">
                    {store.price}
                  </Badge>
                )}
              </div>
              {store.description && (
                <p className="text-sm text-leaf-600 mb-3 dark:text-cream-200">{store.description}</p>
              )}
              <Button 
                variant="default" 
                size="sm" 
                className="w-full bg-leaf-600 hover:bg-leaf-700 text-white flex items-center justify-center dark:bg-leaf-700 dark:hover:bg-leaf-800"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(store.url, '_blank');
                }}
              >
                <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                Shop on {store.name}
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default OnlineStores;