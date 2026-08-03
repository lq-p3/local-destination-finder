import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { placesApi, NearbyPlace, PlacesApiError } from '../services/placesApi';
import PlaceCard from './PlaceCard';
import PlaceCardSkeleton from './PlaceCardSkeleton';
import PlacesErrorState from './PlacesErrorState';
import PlacesEmptyState from './PlacesEmptyState';
import { SlidersHorizontal } from 'lucide-react';

interface Props {
  latitude: number;
  longitude: number;
  type: 'hotels' | 'restaurants' | 'cafes';
  onViewDetails: (placeId: string) => void;
}

export default function NearbyPlacesSection({ latitude, longitude, type, onViewDetails }: Props) {
  const { language } = useLanguage();
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<NearbyPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PlacesApiError | null>(null);

  // Filters State
  const [showFilters, setShowFilters] = useState(false);
  const [maxDistance, setMaxDistance] = useState<number>(15); // default 15km
  const [minRating, setMinRating] = useState<number>(0);
  const [openOnly, setOpenOnly] = useState<boolean>(false);
  const [priceLevel, setPriceLevel] = useState<string>('ALL');

  const fetchPlaces = () => {
    setLoading(true);
    setError(null);

    const apiCall = 
      type === 'hotels' ? placesApi.getNearbyHotels :
      type === 'restaurants' ? placesApi.getNearbyRestaurants :
      placesApi.getNearbyCafes;

    apiCall(latitude, longitude, 50000, language)
      .then(res => {
        setPlaces(res || []);
      })
      .catch(err => {
        setError(err as PlacesApiError);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPlaces();
  }, [latitude, longitude, type, language]);

  // Apply filters locally
  useEffect(() => {
    let result = [...places];

    result = result.filter(p => p.distanceKm <= maxDistance);

    if (minRating > 0) {
      result = result.filter(p => p.rating !== undefined && p.rating >= minRating);
    }

    if (openOnly) {
      result = result.filter(p => p.openNow === true);
    }

    if (priceLevel !== 'ALL') {
      result = result.filter(p => {
        if (!p.priceLevel) return false;
        if (priceLevel === 'PRICE_LEVEL_INEXPENSIVE') return p.priceLevel === 'PRICE_LEVEL_INEXPENSIVE' || p.priceLevel === '$';
        if (priceLevel === 'PRICE_LEVEL_MODERATE') return p.priceLevel === 'PRICE_LEVEL_MODERATE' || p.priceLevel === '$$';
        if (priceLevel === 'PRICE_LEVEL_EXPENSIVE') return p.priceLevel === 'PRICE_LEVEL_EXPENSIVE' || p.priceLevel === '$$$';
        if (priceLevel === 'PRICE_LEVEL_VERY_EXPENSIVE') return p.priceLevel === 'PRICE_LEVEL_VERY_EXPENSIVE' || p.priceLevel === '$$$$';
        return true;
      });
    }

    setFilteredPlaces(result);
  }, [places, maxDistance, minRating, openOnly, priceLevel]);

  const getSectionTitle = () => {
    if (type === 'hotels') {
      return language === 'ar' ? 'فنادق قريبة' : 'Nearby Hotels';
    } else if (type === 'restaurants') {
      return language === 'ar' ? 'مطاعم قريبة' : 'Nearby Restaurants';
    } else {
      return language === 'ar' ? 'مقاهي قريبة' : 'Nearby Cafes';
    }
  };

  return (
    <div className="flex flex-col gap-4 mb-12">
      {/* Title block with filters toggle */}
      <div className="flex justify-between items-center px-2">
        <div className="flex items-baseline gap-2">
          <h4 className="text-lg font-extrabold text-primary tracking-tight">
            {getSectionTitle()}
          </h4>
          {!loading && !error && filteredPlaces.length > 0 && (
            <span className="text-xs text-slate-400 font-bold">({filteredPlaces.length})</span>
          )}
        </div>

        {!loading && !error && places.length > 0 && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-xs font-bold transition-all border-none cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'تصفية' : 'Filters'}</span>
          </button>
        )}
      </div>

      {/* Expanded Filters Panel */}
      {showFilters && !loading && !error && places.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-[24px] p-5 flex flex-col md:flex-row gap-5 items-stretch md:items-center">
          {/* Distance Filter */}
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {language === 'ar' ? `المسافة القصوى: ${maxDistance} كم` : `Max Distance: ${maxDistance} km`}
            </label>
            <input 
              type="range" 
              min="1" 
              max="50" 
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="w-full accent-secondary"
            />
          </div>

          {/* Rating Filter */}
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {language === 'ar' ? 'التقييم الأدنى' : 'Min Rating'}
            </label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-full px-3 py-1.5 text-xs text-slate-700 font-bold outline-none cursor-pointer"
            >
              <option value="0">{language === 'ar' ? 'الكل' : 'Any'}</option>
              <option value="4">4.0+ ★</option>
              <option value="4.5">4.5+ ★</option>
            </select>
          </div>

          {/* Price level Filter */}
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {language === 'ar' ? 'مستوى الأسعار' : 'Price Level'}
            </label>
            <select
              value={priceLevel}
              onChange={(e) => setPriceLevel(e.target.value)}
              className="bg-white border border-slate-200 rounded-full px-3 py-1.5 text-xs text-slate-700 font-bold outline-none cursor-pointer"
            >
              <option value="ALL">{language === 'ar' ? 'الكل' : 'Any'}</option>
              <option value="PRICE_LEVEL_INEXPENSIVE">$</option>
              <option value="PRICE_LEVEL_MODERATE">$$</option>
              <option value="PRICE_LEVEL_EXPENSIVE">$$$</option>
              <option value="PRICE_LEVEL_VERY_EXPENSIVE">$$$$</option>
            </select>
          </div>

          {/* Open Now Toggle */}
          <div className="flex items-center gap-2 md:mt-4">
            <input 
              type="checkbox" 
              id={`open-only-${type}`}
              checked={openOnly}
              onChange={(e) => setOpenOnly(e.target.checked)}
              className="w-4 h-4 rounded text-secondary focus:ring-secondary accent-secondary cursor-pointer"
            />
            <label htmlFor={`open-only-${type}`} className="text-xs text-slate-600 font-bold select-none cursor-pointer">
              {language === 'ar' ? 'مفتوح الآن فقط' : 'Open now only'}
            </label>
          </div>
        </div>
      )}

      {/* Main Grid display area */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <PlaceCardSkeleton />
          <PlaceCardSkeleton />
          <PlaceCardSkeleton />
        </div>
      ) : error ? (
        <PlacesErrorState error={error} onRetry={fetchPlaces} />
      ) : filteredPlaces.length === 0 ? (
        <PlacesEmptyState type={type} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredPlaces.slice(0, 6).map((place) => (
            <PlaceCard 
              key={place.osmId} 
              place={place} 
              type={type} 
              onViewDetails={onViewDetails} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
