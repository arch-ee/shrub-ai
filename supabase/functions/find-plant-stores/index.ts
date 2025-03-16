
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
    const searchTerms = [
      `${plantName} plant`,
      "plant nursery",
      "garden center",
      "plant shop",
      "florist",
    ];

    // Use the first search term for targeted results
    const radius = 5000; // 5km radius
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${encodeURIComponent(
      searchTerms[0]
    )}&key=${GOOGLE_MAPS_API_KEY}`;

    console.log("Making Places API request with URL:", placesUrl.replace(GOOGLE_MAPS_API_KEY, "API_KEY_REDACTED"));
    
    const placesResponse = await fetch(placesUrl);
    if (!placesResponse.ok) {
      console.error("Places API error:", await placesResponse.text());
      throw new Error(`Places API request failed: ${placesResponse.status}`);
    }
    
    const placesData = await placesResponse.json();
    console.log("Places API response status:", placesData.status);
    console.log("Places API results count:", placesData.results ? placesData.results.length : 0);

    // If no specific plant results, try more generic plant stores
    let nearbyStores = placesData.results || [];
    if (nearbyStores.length === 0 && searchTerms.length > 1) {
      console.log("No specific plant stores found, trying generic search");
      const genericPlacesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${encodeURIComponent(
        searchTerms[1]
      )}&key=${GOOGLE_MAPS_API_KEY}`;

      const genericResponse = await fetch(genericPlacesUrl);
      if (!genericResponse.ok) {
        console.error("Generic Places API error:", await genericResponse.text());
        throw new Error(`Generic Places API request failed: ${genericResponse.status}`);
      }
      
      const genericData = await genericResponse.json();
      console.log("Generic Places API response status:", genericData.status);
      console.log("Generic Places API results count:", genericData.results ? genericData.results.length : 0);
      
      nearbyStores = genericData.results || [];
    }

    // Format the nearby stores data
    const formattedStores = nearbyStores.slice(0, 5).map((place: any) => {
      // Calculate distance (this is approximate)
      const storeLat = place.geometry.location.lat;
      const storeLng = place.geometry.location.lng;
      const distance = calculateDistance(lat, lng, storeLat, storeLng);
      
      return {
        name: place.name,
        vicinity: place.vicinity,
        rating: place.rating,
        distance: `${distance.toFixed(1)} km`,
        url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.place_id}`,
      };
    });

    // Generate online store data
    const onlineStores = generateOnlineStores(plantName);

    console.log("Returning response with nearby stores:", formattedStores.length);
    console.log("Returning response with online stores:", onlineStores.length);
    
    return new Response(
      JSON.stringify({
        nearbyStores: formattedStores,
        onlineStores: onlineStores,
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

// Generate online store data
function generateOnlineStores(plantName: string): any[] {
  return [
    {
      name: "PlantWorld",
      url: `https://www.google.com/search?q=${encodeURIComponent(`buy ${plantName} plant online`)}`,
      price: "$15-30",
      description: `Various sizes of ${plantName} available with nationwide shipping.`,
    },
    {
      name: "GreenThumb Shop",
      url: `https://www.amazon.com/s?k=${encodeURIComponent(`${plantName} plant`)}`,
      price: "$20-45",
      description: "Free shipping on orders over $35. Healthy plants guaranteed.",
    },
    {
      name: "Etsy Plant Shops",
      url: `https://www.etsy.com/search?q=${encodeURIComponent(`${plantName} plant`)}`,
      price: "Varies",
      description: `Handpicked ${plantName} from independent growers and nurseries.`,
    },
  ];
}
