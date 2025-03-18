
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Store } from 'lucide-react';
import { OnlineStore } from './store-locator/types';
import OnlineStores from './store-locator/OnlineStores';

interface PlantStoreLocatorProps {
  plantName: string;
}

const PlantStoreLocator = ({ plantName }: PlantStoreLocatorProps) => {
  const [onlineStores, setOnlineStores] = useState<OnlineStore[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Find online stores when we have plant name
    if (plantName && plantName !== 'Unknown plant') {
      findOnlineStores();
    }
  }, [plantName]);

  const findOnlineStores = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Finding online stores for:", plantName);
      
      // Generate online store links with search terms
      const onlineStoreData = [
        {
          name: "Amazon",
          url: `https://www.amazon.com/s?k=${encodeURIComponent(`${plantName} plant live`)}`,
          price: "Varies",
          description: `Find ${plantName} plants with fast shipping options.`,
          logo: "amazon"
        },
        {
          name: "Etsy",
          url: `https://www.etsy.com/search?q=${encodeURIComponent(`${plantName} plant`)}`,
          price: "Varies",
          description: `Handpicked ${plantName} from independent growers and nurseries.`,
          logo: "etsy"
        },
        {
          name: "Home Depot",
          url: `https://www.homedepot.com/s/${encodeURIComponent(`${plantName} plant`)}`,
          price: "$15-45",
          description: "Find plants online with in-store pickup options at your local Home Depot.",
          logo: "homedepot"
        },
        {
          name: "Walmart",
          url: `https://www.walmart.com/search?q=${encodeURIComponent(`${plantName} plant`)}`,
          price: "$10-30",
          description: "Affordable plants with delivery or pickup options.",
          logo: "walmart"
        },
        {
          name: "Lowe's",
          url: `https://www.lowes.com/search?searchTerm=${encodeURIComponent(`${plantName} plant`)}`,
          price: "$15-40",
          description: "Garden center with a variety of plant options and gardening supplies.",
          logo: "lowes"
        }
      ];
      
      setOnlineStores(onlineStoreData);
    } catch (err) {
      console.error('Error finding stores:', err);
      setError('Failed to find online stores. Please try again later.');
      toast({
        title: "Store lookup failed",
        description: "We couldn't find online stores for this item. Please try again later.",
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
    <Card className="p-6 backdrop-blur-sm bg-white/80 border-leaf-200 shadow-lg animate-fade-in dark:bg-gray-800/60 dark:border-gray-700 dark:text-cream-50">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium text-leaf-900 dark:text-cream-100">Where to Find {plantName}</h2>
          <Badge variant="subtle" className="bg-cream-100 text-leaf-700 dark:bg-gray-700 dark:text-cream-100">
            {isLoading ? 'Searching...' : 'Online'}
          </Badge>
        </div>

        {error && (
          <div className="text-sm text-red-500 p-3 bg-red-50 rounded-md dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="py-8 text-center text-leaf-600 dark:text-leaf-400">
            <div className="animate-pulse flex flex-col items-center">
              <Store className="h-8 w-8 mb-2" />
              <p>Finding places to buy {plantName}...</p>
            </div>
          </div>
        )}

        {!isLoading && (
          <div className="space-y-6">
            <OnlineStores stores={onlineStores} />
          </div>
        )}
      </div>
    </Card>
  );
};

export default PlantStoreLocator;
