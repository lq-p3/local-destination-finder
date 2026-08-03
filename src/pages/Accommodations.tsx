import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Hotel, MapPin, Star, Calendar, Users, ShieldCheck, 
  Search, ArrowRight, ArrowLeft, Coffee, Navigation, Wind 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { placesApi, NearbyPlace, PlacesApiError } from '../services/placesApi';
import PlaceCard from '../components/PlaceCard';
import PlaceCardSkeleton from '../components/PlaceCardSkeleton';
import PlacesErrorState from '../components/PlacesErrorState';
import PlacesEmptyState from '../components/PlacesEmptyState';
import PlaceDetailsModal from '../components/PlaceDetailsModal';
import { AnimatePresence } from 'motion/react';

export default function Accommodations() {
  const { t, language, dir } = useLanguage();
  const navigate = useNavigate();

  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<NearbyPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PlacesApiError | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  // Search filter states
  const [cityId, setCityId] = useState('');
  const [type, setType] = useState('');
  const [maxPrice, setMaxPrice] = useState(1500);
  const [rating, setRating] = useState('');

  const getCityCoords = (city: string) => {
    switch (city) {
      case 'riyadh': return { lat: 24.7136, lng: 46.6753 };
      case 'jeddah': return { lat: 21.5433, lng: 39.1728 };
      case 'alula': return { lat: 26.6083, lng: 37.9186 };
      case 'abha': return { lat: 18.2164, lng: 42.5053 };
      case 'taif': return { lat: 21.2639, lng: 40.4072 };
      case 'neom': return { lat: 28.2831, lng: 35.6312 };
      default: return { lat: 24.7136, lng: 46.6753 };
    }
  };

  const loadLodgings = () => {
    setLoading(true);
    setError(null);

    const coords = getCityCoords(cityId);

    placesApi.getNearbyHotels(coords.lat, coords.lng, 25000, language)
      .then(res => {
        setPlaces(res || []);
      })
      .catch(err => {
        setError(err as PlacesApiError);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLodgings();
  }, [cityId, language]);

  useEffect(() => {
    let result = [...places];

    if (type) {
      result = result.filter(p => {
        const pType = (p.primaryType || '').toLowerCase();
        if (type === 'hotel') return pType.includes('hotel') || pType.includes('lodging') || pType === '';
        if (type === 'resort') return pType.includes('resort');
        if (type === 'chalet') return pType.includes('chalet') || pType.includes('cabin');
        if (type === 'cabin') return pType.includes('cabin') || pType.includes('cottage');
        return true;
      });
    }

    if (rating) {
      const minRating = Number(rating);
      result = result.filter(p => p.rating !== undefined && p.rating >= minRating);
    }

    result = result.filter(p => {
      if (!p.priceLevel) return true;
      const priceStr = p.priceLevel;
      if (priceStr === 'PRICE_LEVEL_VERY_EXPENSIVE' || priceStr === '$$$$') return maxPrice >= 1800;
      if (priceStr === 'PRICE_LEVEL_EXPENSIVE' || priceStr === '$$$') return maxPrice >= 800;
      if (priceStr === 'PRICE_LEVEL_MODERATE' || priceStr === '$$') return maxPrice >= 300;
      return true;
    });

    setFilteredPlaces(result);
  }, [places, type, maxPrice, rating]);

  return (
    <div className="pt-24 px-6 max-w-7xl mx-auto min-h-screen pb-28" dir={dir}>
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-primary flex items-center gap-2">
          <Hotel className="w-8 h-8 text-secondary shrink-0" />
          {t('lodgings')}
        </h1>
        <p className="text-slate-500 text-sm mt-1.5 font-light">
          {language === 'ar'
            ? 'احجز غرف الفنادق الفاخرة، المنتجعات الصحراوية، الشاليهات العائلية والنزل التراثية.'
            : 'Reserve premium hotel rooms, desert resorts, local chalets, and heritage rural inns.'
          }
        </p>
      </header>

      {/* Filters Sidebar/Header Row */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-5 mb-8 flex flex-col lg:flex-row gap-4 items-center justify-between">
        
        {/* City Filter */}
        <div className="w-full lg:w-48 flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{language === 'ar' ? 'المدينة' : 'City'}</label>
          <select
            value={cityId}
            onChange={e => setCityId(e.target.value)}
            className="h-11 px-3 border border-slate-150 rounded-xl text-xs bg-slate-50 font-bold outline-none"
          >
            <option value="">{language === 'ar' ? 'جميع المدن' : 'All Cities'}</option>
            <option value="riyadh">{language === 'ar' ? 'الرياض' : 'Riyadh'}</option>
            <option value="alula">{language === 'ar' ? 'العلا' : 'AlUla'}</option>
            <option value="abha">{language === 'ar' ? 'أبها' : 'Abha'}</option>
            <option value="jeddah">{language === 'ar' ? 'جدة' : 'Jeddah'}</option>
          </select>
        </div>

        {/* Accommodation Type */}
        <div className="w-full lg:w-48 flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{language === 'ar' ? 'نوع الإقامة' : 'Lodging Type'}</label>
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="h-11 px-3 border border-slate-150 rounded-xl text-xs bg-slate-50 font-bold outline-none"
          >
            <option value="">{language === 'ar' ? 'جميع الأنواع' : 'All Types'}</option>
            <option value="hotel">{language === 'ar' ? 'فندق' : 'Hotel'}</option>
            <option value="resort">{language === 'ar' ? 'منتجع' : 'Resort'}</option>
            <option value="chalet">{language === 'ar' ? 'شاليه' : 'Chalet'}</option>
            <option value="cabin">{language === 'ar' ? 'كوخ' : 'Cabin'}</option>
          </select>
        </div>

        {/* Price slider filter */}
        <div className="w-full lg:w-60 flex flex-col gap-1">
          <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-wider">
            <span>{language === 'ar' ? 'أقصى سعر لليلة' : 'Max Price per Night'}</span>
            <span className="text-secondary font-black">{maxPrice} SAR</span>
          </div>
          <input 
            type="range" 
            min="100" 
            max="3000" 
            value={maxPrice} 
            onChange={e => setMaxPrice(Number(e.target.value))}
            className="w-full accent-secondary mt-1.5"
          />
        </div>

        {/* Rating filter */}
        <div className="w-full lg:w-44 flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{t('rating')}</label>
          <select
            value={rating}
            onChange={e => setRating(e.target.value)}
            className="h-11 px-3 border border-slate-150 rounded-xl text-xs bg-slate-50 font-bold outline-none"
          >
            <option value="">{language === 'ar' ? 'أي تقييم' : 'Any rating'}</option>
            <option value="4.5">4.5+ {language === 'ar' ? 'نجوم' : 'stars'}</option>
            <option value="4.8">4.8+ {language === 'ar' ? 'نجوم' : 'stars'}</option>
          </select>
        </div>

      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <PlaceCardSkeleton />
          <PlaceCardSkeleton />
          <PlaceCardSkeleton />
        </div>
      ) : error ? (
        <PlacesErrorState error={error} onRetry={loadLodgings} />
      ) : filteredPlaces.length === 0 ? (
        <PlacesEmptyState type="hotels" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPlaces.map(hotel => (
            <PlaceCard 
              key={hotel.osmId} 
              place={hotel} 
              type="hotels" 
              onViewDetails={setSelectedPlaceId} 
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedPlaceId && (
          <PlaceDetailsModal 
            placeId={selectedPlaceId} 
            onClose={() => setSelectedPlaceId(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
