
import React, { useRef, useEffect } from 'react';
import { ShoppingBag, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (container) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  if (stores.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-leaf-800 flex items-center dark:text-cream-100">
        <ShoppingBag className="w-4 h-4 mr-2 text-leaf-500 dark:text-leaf-400" />
        Buy Online
      </h3>
      
      <div 
        ref={scrollContainerRef}
        className="flex pb-4 space-x-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ 
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x mandatory',
          paddingBottom: '20px'
        }}
      >
        {stores.map((store, index) => (
          <motion.div
            key={index}
            className="flex-shrink-0 w-full snap-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 20,
              delay: index * 0.1 
            }}
          >
            <Card 
              className="p-4 backdrop-blur-sm bg-white/90 border-leaf-200 shadow-sm hover:shadow-md transition-all h-full flex flex-col dark:bg-gray-800/80 dark:border-gray-700"
              style={{ cursor: 'pointer' }}
            >
              <div className="flex justify-between items-start">
                <p className="font-medium text-leaf-800 dark:text-cream-100">{store.name}</p>
                {store.price && (
                  <Badge variant="outline" className="bg-cream-50 dark:bg-gray-700 dark:text-cream-200">
                    {store.price}
                  </Badge>
                )}
              </div>
              {store.description && (
                <p className="text-sm text-leaf-600 mt-2 mb-3 dark:text-cream-300">{store.description}</p>
              )}
              <div className="mt-auto pt-3">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="w-full bg-leaf-600 hover:bg-leaf-700 text-white group dark:bg-leaf-700 dark:hover:bg-leaf-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(store.url, '_blank');
                  }}
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5 transition-transform group-hover:translate-x-0.5" />
                  Shop on {store.name}
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default OnlineStores;
