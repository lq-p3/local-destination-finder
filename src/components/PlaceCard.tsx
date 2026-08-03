import React from 'react';
import { Star, MapPin, Navigation } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { NearbyPlace } from '../services/placesApi';

interface Props {
  key?: string | number;
  place: NearbyPlace;
  type: 'hotels' | 'restaurants' | 'cafes';
  onViewDetails: (placeId: string) => void;
}

const HOTEL_IMAGES = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80'
];

const RESTAURANT_IMAGES = [
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=600&q=80'
];

const CAFE_IMAGES = [
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=600&q=80'
];

function getHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export default function PlaceCard({ place, type, onViewDetails }: Props) {
  const { language } = useLanguage();

  const handleOpenMaps = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://www.openstreetmap.org/?mlat=${place.latitude}&mlon=${place.longitude}#map=17/${place.latitude}/${place.longitude}`, '_blank', 'noopener,noreferrer');
  };

  const getSmartImage = () => {
    const name = (place.name || '').toLowerCase();

    // 1. Specific Brand & Property Types (Arabic & English)
    if (name.includes('radisson') || name.includes('راديسون')) {
      return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
    }
    if (name.includes('holiday') || name.includes('هولدى') || name.includes('هوليدي')) {
      return 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80';
    }
    if (name.includes('sheraton') || name.includes('شيراتون') || name.includes('four points') || name.includes('4 points')) {
      return 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80';
    }
    if (name.includes('hilton') || name.includes('هيلتون')) {
      return 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80';
    }
    if (name.includes('marriott') || name.includes('ماريوت')) {
      return 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80';
    }
    if (name.includes('four seasons') || name.includes('سيزونز')) {
      return 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80';
    }
    if (name.includes('ritz') || name.includes('ريتز')) {
      return 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80';
    }
    if (name.includes('chalet') || name.includes('شاليه') || name.includes('sala') || name.includes('منتجع') || name.includes('resort')) {
      return 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80';
    }
    if (name.includes('compound') || name.includes('compund') || name.includes('مجمع') || name.includes('كمبوند') || name.includes('درر')) {
      return 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80';
    }
    if (name.includes('macsoora') || name.includes('مقصورة') || name.includes('قصر') || name.includes('palace')) {
      return 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80';
    }
    if (name.includes('novotel') || name.includes('نوفوتيل')) {
      return 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80';
    }
    if (name.includes('boudl') || name.includes('بودل') || name.includes('شقق') || name.includes('أجنحة') || name.includes('rest inn')) {
      return 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80';
    }

    // 2. Direct image from backend if not fallback
    if (place.image && !place.image.includes('photo-1566073771259-6a8506099945')) {
      return place.image;
    }
    if (place.photoUrl && !place.photoUrl.includes('photo-1566073771259-6a8506099945')) {
      return place.photoUrl;
    }

    // 3. Fallback hash-based image
    const seed = place.id || place.osmId || place.name || 'default';
    const hash = getHash(seed);
    if (type === 'hotels') {
      return HOTEL_IMAGES[hash % HOTEL_IMAGES.length];
    } else if (type === 'restaurants') {
      return RESTAURANT_IMAGES[hash % RESTAURANT_IMAGES.length];
    } else {
      return CAFE_IMAGES[hash % CAFE_IMAGES.length];
    }
  };

  return (
    <div 
      onClick={() => onViewDetails(place.osmId)}
      className="bg-white border border-slate-200 hover:border-slate-300 rounded-[28px] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between p-4 cursor-pointer h-full group"
    >
      <div className="flex flex-col gap-3">
        {/* Photo Image */}
        <div className="relative h-40 w-full rounded-[20px] overflow-hidden bg-slate-100 shrink-0">
          <img 
            src={getSmartImage()} 
            alt={place.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {place.openNow !== undefined && (
            <span className={`absolute top-3 left-3 px-2 py-1 rounded-full text-[9px] font-black ${
              place.openNow 
                ? 'bg-emerald-500/95 text-white' 
                : 'bg-red-500/95 text-white'
            }`}>
              {place.openNow 
                ? (language === 'ar' ? 'مفتوح' : 'Open') 
                : (language === 'ar' ? 'مغلق' : 'Closed')}
            </span>
          )}
        </div>

        {/* Place Info */}
        <div className="flex flex-col gap-1 px-1">
          <h4 className="font-extrabold text-slate-800 text-sm leading-snug line-clamp-1 group-hover:text-primary transition-colors">
            {place.name}
          </h4>
          
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold">
            <span className="capitalize">{place.primaryType || (type === 'hotels' ? 'Hotel' : type === 'restaurants' ? 'Restaurant' : 'Cafe')}</span>
            <span>•</span>
            <span>{place.distanceKm} {language === 'ar' ? 'كم' : 'km'}</span>
          </div>

          <div className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mt-1 font-light flex gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>{place.address}</span>
          </div>
        </div>
      </div>

      {/* Footer Details */}
      <div className="flex flex-col gap-3 mt-4 pt-3 border-t border-slate-100 shrink-0">
        <div className="flex justify-between items-center px-1">
          {place.rating ? (
            <div className="flex items-center text-xs font-black text-amber-500 gap-0.5">
              <Star className="w-3.5 h-3.5 fill-current shrink-0" />
              <span>{place.rating}</span>
              <span className="text-[10px] text-slate-400 font-normal">({place.userRatingCount})</span>
            </div>
          ) : (
            <div className="text-[10px] text-slate-400">
              {language === 'ar' ? 'لا يوجد تقييم' : 'No ratings'}
            </div>
          )}

          {place.priceLevel && (
            <span className="text-[10px] text-slate-400 font-bold">
              {place.priceLevel === 'PRICE_LEVEL_VERY_EXPENSIVE' ? '$$$$' :
               place.priceLevel === 'PRICE_LEVEL_EXPENSIVE' ? '$$$' :
               place.priceLevel === 'PRICE_LEVEL_MODERATE' ? '$$' : '$'}
            </span>
          )}
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-2 gap-2 mt-1">
          <button
            onClick={handleOpenMaps}
            className="flex items-center justify-center gap-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold transition-all border border-slate-200 cursor-pointer"
          >
            <Navigation className="w-3 h-3 text-secondary shrink-0" />
            <span>{language === 'ar' ? 'الخريطة' : 'Maps'}</span>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(place.osmId);
            }}
            className="flex items-center justify-center py-2 bg-primary hover:bg-primary/90 text-white rounded-full text-[10px] font-bold transition-all shadow-sm cursor-pointer border-none"
          >
            <span>{language === 'ar' ? 'التفاصيل' : 'Details'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
