export interface NearbyPlace {
  id: string;
  osmId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  category: string;
  distanceKm: number;
  openingHours?: string;
  website?: string;
  phone?: string;
  cuisine?: string;
  wheelchair?: string;
  image?: string;
  // Legacy compatibility fields (mapped from OSM data)
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  primaryType?: string;
  openNow?: boolean;
  photoUrl?: string;
}

export interface PlaceDetails {
  id: string;
  osmId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  openingHours?: string;
  cuisine?: string;
  accessibility?: string;
  photos?: string[];
}

export interface PlacesApiError {
  code: string;
  message: string;
}

const BASE_URL = '/api/places';

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    let errData: any;
    try {
      errData = await response.json();
    } catch {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const apiErr: PlacesApiError = {
      code: errData.code || 'UNKNOWN_ERROR',
      message: errData.message || errData.error || `HTTP error! status: ${response.status}`
    };
    throw apiErr;
  }
  return response.json() as Promise<T>;
}

function mapPlaces(places: any[]): NearbyPlace[] {
  return places
    .filter(p => p && p.name && !p.name.includes('غير مسمى') && !p.name.toLowerCase().includes('unnamed'))
    .map(p => ({
      id: p.id || p.osmId || '',
      osmId: p.osmId || p.id || '',
      name: p.name || '',
      address: p.address || '',
      latitude: p.latitude || 0,
      longitude: p.longitude || 0,
      category: p.category || '',
      distanceKm: p.distanceKm || 0,
      openingHours: p.openingHours || '',
      website: p.website || '',
      phone: p.phone || '',
      cuisine: p.cuisine || '',
      wheelchair: p.wheelchair || '',
      image: p.image || '',
      photoUrl: p.image || '',
      primaryType: p.category || '',
    }));
}

export const placesApi = {
  getNearbyHotels: async (latitude: number, longitude: number, radius = 5000, language = 'ar', signal?: AbortSignal): Promise<NearbyPlace[]> => {
    const raw = await fetchJson<any[]>(
      `${BASE_URL}/nearby-hotels?latitude=${latitude}&longitude=${longitude}&radius=${radius}&language=${language}`,
      signal
    );
    return mapPlaces(raw);
  },

  getNearbyRestaurants: async (latitude: number, longitude: number, radius = 5000, language = 'ar', signal?: AbortSignal): Promise<NearbyPlace[]> => {
    const raw = await fetchJson<any[]>(
      `${BASE_URL}/nearby-restaurants?latitude=${latitude}&longitude=${longitude}&radius=${radius}&language=${language}`,
      signal
    );
    return mapPlaces(raw);
  },

  getNearbyCafes: async (latitude: number, longitude: number, radius = 5000, language = 'ar', signal?: AbortSignal): Promise<NearbyPlace[]> => {
    const raw = await fetchJson<any[]>(
      `${BASE_URL}/nearby-cafes?latitude=${latitude}&longitude=${longitude}&radius=${radius}&language=${language}`,
      signal
    );
    return mapPlaces(raw);
  },

  getPlaceDetails: (osmId: string, language = 'ar', signal?: AbortSignal): Promise<PlaceDetails> => {
    return fetchJson<PlaceDetails>(
      `${BASE_URL}/details/${encodeURIComponent(osmId)}?language=${language}`,
      signal
    );
  }
};
