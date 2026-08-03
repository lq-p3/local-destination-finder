import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  X, Star, MapPin, Phone, Globe, Clock, 
  ExternalLink, RefreshCw, Accessibility, Utensils 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { placesApi, PlaceDetails, PlacesApiError } from '../services/placesApi';

interface Props {
  placeId: string;
  onClose: () => void;
}

export default function PlaceDetailsModal({ placeId, onClose }: Props) {
  const { language, dir } = useLanguage();
  const [details, setDetails] = useState<PlaceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PlacesApiError | null>(null);
  const [currentPhoto, setCurrentPhoto] = useState(0);

  const fetchDetails = () => {
    setLoading(true);
    setError(null);
    placesApi.getPlaceDetails(placeId, language)
      .then(setDetails)
      .catch(err => {
        setError(err as PlacesApiError);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDetails();
  }, [placeId, language]);

  const getOsmUrl = () => {
    if (!details) return '';
    return `https://www.openstreetmap.org/?mlat=${details.latitude}&mlon=${details.longitude}#map=17/${details.latitude}/${details.longitude}`;
  };

  return (
    <div className="fixed inset-0 z-[2500] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden relative z-10 border border-slate-100 max-h-[85vh] flex flex-col"
        dir={dir}
      >
        {/* Header with Close */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 shrink-0">
          <h3 className="text-lg font-black text-primary">
            {language === 'ar' ? 'تفاصيل المعلم' : 'Place Details'}
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Container (Scrollable) */}
        <div className="overflow-y-auto p-6 flex-1 flex flex-col gap-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-slate-400 font-bold">
                {language === 'ar' ? 'جاري تحميل التفاصيل...' : 'Loading details...'}
              </span>
            </div>
          ) : error ? (
            <div className="py-12 text-center flex flex-col items-center justify-center gap-3">
              <span className="text-xs text-red-500 font-bold">
                {language === 'ar' ? 'فشل تحميل تفاصيل المعلم.' : 'Failed to load details.'}
              </span>
              <button 
                onClick={fetchDetails}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-full transition-all cursor-pointer border-none"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'إعادة المحاولة' : 'Retry'}</span>
              </button>
            </div>
          ) : details ? (
            <>
              {/* Photo Slideshow if available */}
              {details.photos && details.photos.length > 0 && (
                <div className="relative h-64 w-full rounded-[24px] overflow-hidden shadow-inner bg-slate-100 shrink-0">
                  <img 
                    src={details.photos[currentPhoto]} 
                    alt={details.name} 
                    className="w-full h-full object-cover"
                  />
                  
                  {details.photos.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/35 px-3 py-1.5 rounded-full backdrop-blur-md">
                      {details.photos.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPhoto(i)}
                          className={`w-2 h-2 rounded-full transition-all ${i === currentPhoto ? 'bg-white scale-110' : 'bg-white/40'}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Title & Category */}
              <div className="flex flex-col gap-1 px-1">
                <h2 className="text-2xl font-black text-primary leading-tight">
                  {details.name}
                </h2>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                    OSM
                  </span>
                </div>
              </div>

              {/* Basic Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Address */}
                {details.address && (
                  <div className="flex gap-3 bg-slate-50 p-4 rounded-[20px] border border-slate-100">
                    <MapPin className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {language === 'ar' ? 'العنوان' : 'Address'}
                      </span>
                      <span className="text-xs text-slate-700 leading-relaxed font-semibold">{details.address}</span>
                    </div>
                  </div>
                )}

                {/* Phone */}
                {details.phone && (
                  <a 
                    href={`tel:${details.phone}`}
                    className="flex gap-3 bg-slate-50 p-4 rounded-[20px] border border-slate-100 hover:bg-slate-100 transition-colors"
                  >
                    <Phone className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {language === 'ar' ? 'الهاتف' : 'Phone'}
                      </span>
                      <span className="text-xs text-slate-700 font-bold">{details.phone}</span>
                    </div>
                  </a>
                )}
              </div>

              {/* Opening Hours */}
              {details.openingHours && (
                <div className="flex flex-col gap-3 bg-slate-50 p-5 rounded-[24px] border border-slate-100">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <Clock className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>{language === 'ar' ? 'أوقات العمل' : 'Opening Hours'}</span>
                  </div>
                  <div className="text-xs text-slate-600 leading-relaxed mt-1 border-t border-slate-200/60 pt-2.5">
                    {details.openingHours}
                  </div>
                </div>
              )}

              {/* Cuisine */}
              {details.cuisine && (
                <div className="flex gap-3 bg-amber-50/50 border border-amber-100/50 p-4 rounded-[20px] items-start">
                  <Utensils className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                      {language === 'ar' ? 'نوع المطبخ' : 'Cuisine'}
                    </span>
                    <span className="text-xs text-slate-700 leading-relaxed font-semibold capitalize">
                      {details.cuisine}
                    </span>
                  </div>
                </div>
              )}

              {/* Accessibility */}
              {details.accessibility && (
                <div className="flex gap-3 bg-blue-50/40 border border-blue-100/50 p-4 rounded-[20px] items-start">
                  <Accessibility className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                      {language === 'ar' ? 'إمكانية الوصول' : 'Accessibility'}
                    </span>
                    <span className="text-xs text-slate-700 leading-relaxed font-semibold capitalize">
                      {details.accessibility}
                    </span>
                  </div>
                </div>
              )}

              {/* External Buttons Footer */}
              <div className="flex flex-wrap gap-3 items-center justify-end mt-4 pt-4 border-t border-slate-100 shrink-0">
                {details.website && (
                  <a 
                    href={details.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-250 text-xs font-bold rounded-full transition-all cursor-pointer"
                  >
                    <Globe className="w-4 h-4 shrink-0" />
                    <span>{language === 'ar' ? 'الموقع الإلكتروني' : 'Website'}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                  </a>
                )}

                <a 
                  href={getOsmUrl()} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-secondary to-blue-600 text-white text-xs font-bold rounded-full shadow-md hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>{language === 'ar' ? 'عرض على الخريطة' : 'View on Map'}</span>
                  <ExternalLink className="w-3 h-3 text-white/80 shrink-0" />
                </a>
              </div>
            </>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
