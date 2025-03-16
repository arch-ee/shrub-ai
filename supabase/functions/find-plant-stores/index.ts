
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GOOGLE_MAPS_API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY");

interface RequestData {
  plantName: string;
  lat: number;
  lng: number;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check for proper request method
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get API key from environment
    if (!GOOGLE_MAPS_API_KEY) {
      console.error("Google Maps API key not configured");
      return new Response(
        JSON.stringify({ error: "Google Maps API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request data
    const { plantName, lat, lng } = await req.json() as RequestData;
    console.log("Request data:", { plantName, lat, lng });

    if (!plantName || lat === undefined || lng === undefined) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Find nearby places that might sell plants
    // Use search types in parallel to maximize chances of finding relevant stores
    const searchTypes = [
      { type: "specific", term: `${plantName} plant` },
      { type: "general", term: "plant nursery" },
      { type: "general", term: "garden center" },
      { type: "general", term: "plant shop" },
      { type: "store", term: "Home Depot" },
      { type: "store", term: "Lowes" },
      { type: "store", term: "garden store" },
    ];
    
    // Increase radius for better coverage
    const radius = 20000; // 20km radius
    let allStores: any[] = [];
    const placesPromises = [];
    
    // Make multiple searches in parallel
    for (const search of searchTypes) {
      const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${encodeURIComponent(search.term)}&key=${GOOGLE_MAPS_API_KEY}`;
      
      placesPromises.push(
        fetch(placesUrl)
          .then(response => {
            if (!response.ok) {
              console.error(`Places API error for ${search.term}:`, response.status);
              return { results: [] };
            }
            return response.json();
          })
          .then(data => {
            console.log(`${search.type} search for "${search.term}" found ${data.results?.length || 0} results`);
            return data.results || [];
          })
          .catch(error => {
            console.error(`Error in ${search.type} search for "${search.term}":`, error);
            return [];
          })
      );
    }
    
    // Collect all search results
    const searchResults = await Promise.all(placesPromises);
    
    // Combine results while avoiding duplicates
    const seenPlaceIds = new Set();
    for (const results of searchResults) {
      for (const place of results) {
        if (!seenPlaceIds.has(place.place_id)) {
          seenPlaceIds.add(place.place_id);
          allStores.push(place);
        }
      }
    }
    
    console.log(`Total unique stores found: ${allStores.length}`);
    
    // Get additional details for each place to get more information
    const detailedStores = [];
    const detailsPromises = [];
    
    // Get details for up to 8 stores to avoid too many API calls
    const storesToDetail = allStores.slice(0, 8);
    
    for (const store of storesToDetail) {
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${store.place_id}&fields=name,formatted_address,rating,website,formatted_phone_number,opening_hours,geometry&key=${GOOGLE_MAPS_API_KEY}`;
      
      detailsPromises.push(
        fetch(detailsUrl)
          .then(response => {
            if (!response.ok) {
              console.error(`Place Details API error for ${store.name}:`, response.status);
              return { result: store };
            }
            return response.json();
          })
          .then(data => {
            // Merge the details with the original store data
            return { ...store, ...data.result };
          })
          .catch(error => {
            console.error(`Error getting details for ${store.name}:`, error);
            return store;
          })
      );
    }
    
    const detailedResults = await Promise.all(detailsPromises);
    detailedStores.push(...detailedResults);
    
    // Format the nearby stores data
    const formattedStores = detailedStores.map((place: any) => {
      // Calculate distance
      const storeLat = place.geometry.location.lat;
      const storeLng = place.geometry.location.lng;
      const distance = calculateDistance(lat, lng, storeLat, storeLng);
      
      // Direct maps URL for directions
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.name)}&destination_place_id=${place.place_id}`;
      
      return {
        name: place.name,
        vicinity: place.vicinity || place.formatted_address,
        rating: place.rating || null,
        distance: `${distance.toFixed(1)} km`,
        mapUrl: mapsUrl,
        website: place.website || null,
        phone: place.formatted_phone_number || null,
        placeId: place.place_id,
        types: place.types || [],
        open_now: place.opening_hours?.open_now,
        location: {
          lat: storeLat,
          lng: storeLng
        }
      };
    });

    // Sort stores by distance
    formattedStores.sort((a: any, b: any) => {
      return parseFloat(a.distance) - parseFloat(b.distance);
    });

    // Generate online store data with logos and improved formatting
    const onlineStores = generateOnlineStores(plantName);

    console.log("Returning response with nearby stores:", formattedStores.length);
    console.log("Returning response with online stores:", onlineStores.length);
    
    return new Response(
      JSON.stringify({
        nearbyStores: formattedStores,
        onlineStores: onlineStores,
        userLocation: { lat, lng }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: "Internal server error", message: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Calculate distance between two points using the Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Generate online store data with direct search links and logos
function generateOnlineStores(plantName: string): any[] {
  return [
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
}
