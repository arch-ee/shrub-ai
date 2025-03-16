
export interface NearbyStore {
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

export interface OnlineStore {
  name: string;
  url: string;
  price?: string;
  description?: string;
  logo?: string;
}
