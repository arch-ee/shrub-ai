
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
      "Home Depot",
      "Lowes",
      "GardenWorks",
      "plant store"
    ];

    // Use the first search term for targeted results
    const radius = 15000; // 15km radius for better coverage
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

    // If no specific plant results, try garden centers and home improvement stores
    let nearbyStores = placesData.results || [];
    
    // If less than 3 stores found, try with a more generic term
    if (nearbyStores.length < 3) {
      console.log("Not enough specific plant stores found, trying garden centers");
      
      const genericTerms = ["garden center", "Home Depot", "Lowes", "GardenWorks", "nursery"];
      
      for (const term of genericTerms) {
        if (nearbyStores.length >= 5) break; // Stop if we have enough stores
        
        const genericPlacesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${encodeURIComponent(term)}&key=${GOOGLE_MAPS_API_KEY}`;

        const genericResponse = await fetch(genericPlacesUrl);
        if (!genericResponse.ok) {
          console.error(`Generic Places API error for ${term}:`, await genericResponse.text());
          continue;
        }
        
        const genericData = await genericResponse.json();
        console.log(`Generic Places API (${term}) response status:`, genericData.status);
        console.log(`Generic Places API (${term}) results count:`, genericData.results ? genericData.results.length : 0);
        
        // Add new stores, avoiding duplicates
        const existingPlaceIds = new Set(nearbyStores.map((store: any) => store.place_id));
        const newStores = (genericData.results || []).filter((store: any) => !existingPlaceIds.has(store.place_id));
        
        nearbyStores = [...nearbyStores, ...newStores];
      }
    }

    // Format the nearby stores data
    const formattedStores = nearbyStores.slice(0, 8).map((place: any) => {
      // Calculate distance (this is approximate)
      const storeLat = place.geometry.location.lat;
      const storeLng = place.geometry.location.lng;
      const distance = calculateDistance(lat, lng, storeLat, storeLng);
      
      // Get place details including website if available
      let websiteUrl = null;
      if (place.website) {
        websiteUrl = place.website;
      }
      
      // Use a direct maps URL for directions
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.name)}&destination_place_id=${place.place_id}`;
      
      return {
        name: place.name,
        vicinity: place.vicinity,
        rating: place.rating || "No rating",
        distance: `${distance.toFixed(1)} km`,
        mapUrl: mapsUrl,
        website: websiteUrl,
        phone: place.formatted_phone_number || null,
        placeId: place.place_id,
        types: place.types || [],
        open_now: place.opening_hours?.open_now,
      };
    });

    // Sort stores by distance
    formattedStores.sort((a: any, b: any) => {
      return parseFloat(a.distance) - parseFloat(b.distance);
    });

    // Generate online store data with direct search links
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

// Generate online store data with direct search links
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
