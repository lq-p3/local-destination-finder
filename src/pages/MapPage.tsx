import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Coffee, Hotel, Mountain, Landmark, Star, Compass, Navigation, Plus, Minus, Eye } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { destinations as staticDestinations } from '../data';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../api';

export default function MapPage() {
  const { t, language, dir } = useLanguage();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>('riyadh_masmak');
  const [showRoute, setShowRoute] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const routeLineRef = useRef<L.Polyline | null>(null);

  const filters = [
    { name: 'All', key: 'All', icon: MapPin },
    { name: 'Hotels', key: 'Hotels', icon: Hotel },
    { name: 'Restaurants', key: 'Restaurants', icon: Coffee },
    { name: 'Nature', key: 'Nature', icon: Mountain },
    { name: 'Historical', key: 'Historical', icon: Landmark },
  ];

  useEffect(() => {
    setLoading(true);
    api.destinations.list()
      .then((res: any) => {
        const list = Array.isArray(res) ? res : (res?.items || []);
        setDestinations(list);
        if (list.length > 0) {
          const hasRiyadh = list.some((d: any) => d.id === 'riyadh_masmak');
          setSelectedPlaceId(hasRiyadh ? 'riyadh_masmak' : list[0].id);
        }
      })
      .catch(err => {
        console.error("Failed to load map destinations", err);
        setDestinations(staticDestinations);
        setSelectedPlaceId('riyadh');
      })
      .finally(() => setLoading(false));
  }, []);

  // Merge geographic layout with dynamic details from backend db
  const places = useMemo(() => {
    const safeList = Array.isArray(destinations) ? destinations : [];
    return safeList.map(d => {
      const isStatic = !d.coordinates || (!d.coordinates.lat && d.coordinates.lat !== 0);
      const lat = isStatic ? 24.7136 : d.coordinates.lat;
      const lng = isStatic ? 46.6753 : d.coordinates.lng;
      return {
        id: d.id,
        lat,
        lng,
        type: d.category,
        name: language === 'ar' ? d.nameAr : d.nameEn,
        description: language === 'ar' ? d.descriptionAr : d.descriptionEn,
        rating: d.rating || 4.5,
        reviews: d.reviews || 100,
        distance: language === 'ar' ? d.distanceAr : d.distanceEn,
        image: d.image || '',
        category: d.category || '',
      };
    });
  }, [destinations, language]);

  // Filter based on category select and search input
  const filteredPlaces = useMemo(() => {
    return places.filter(place => {
      let matchesFilter = activeFilter === 'All';
      if (activeFilter === 'Nature') {
        matchesFilter = ['Nature', 'Mountains', 'Adventure'].includes(place.category);
      } else if (activeFilter === 'Hotels') {
        matchesFilter = place.category === 'Hotels';
      } else if (activeFilter === 'Restaurants') {
        matchesFilter = place.category === 'Restaurants';
      } else if (activeFilter === 'Historical') {
        matchesFilter = place.category === 'Historical' || place.category === 'Museums';
      }
      
      const matchesSearch = (place.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [places, activeFilter, searchQuery]);

  const selectedPlace = useMemo(() => {
    return places.find(p => p.id === selectedPlaceId) || null;
  }, [places, selectedPlaceId]);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Center map around Saudi Arabia
    const map = L.map(mapRef.current, {
      center: [24.0, 45.0],
      zoom: 6,
      zoomControl: false, // Use our own custom styled zoom buttons
      attributionControl: false
    });

    // Dark-themed tiles to match the modern UI
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    mapInstance.current = map;

    // Trigger a resize verification to make sure the map renders fully
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Sync Markers
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // Clear existing markers
    for (const key in markersRef.current) {
      markersRef.current[key].remove();
    }
    markersRef.current = {};

    filteredPlaces.forEach(place => {
      const isSelected = place.id === selectedPlaceId;

      const iconHtml = `
        <div class="relative flex items-center justify-center">
          ${isSelected ? `<span class="absolute inline-flex h-12 w-12 rounded-full opacity-75 animate-ping bg-blue-500/40"></span>` : ''}
          <div class="w-9 h-9 rounded-full flex items-center justify-center shadow-2xl border-2 transition-all duration-300 ${
            isSelected 
              ? 'bg-blue-500 text-white border-white scale-110' 
              : 'bg-white text-slate-800 border-slate-200 hover:scale-110'
          }">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: '',
        iconSize: [48, 48],
        iconAnchor: [24, 24]
      });

      const marker = L.marker([place.lat, place.lng], { icon: customIcon })
        .addTo(map)
        .on('click', () => {
          setSelectedPlaceId(place.id);
          setShowRoute(false);
        });

      // Bind tooltip for hover city name
      marker.bindTooltip(place.name, {
        permanent: false,
        direction: 'top',
        offset: [0, -10],
        className: 'bg-slate-900/90 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-lg border border-slate-700 backdrop-blur-md'
      });

      markersRef.current[place.id] = marker;
    });
  }, [filteredPlaces, selectedPlaceId]);

  // Smooth Fly-to camera navigation
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !selectedPlaceId) return;

    const place = places.find(p => p.id === selectedPlaceId);
    if (place) {
      map.flyTo([place.lat, place.lng], 7, {
        animate: true,
        duration: 1.2
      });
    }
  }, [selectedPlaceId, places]);

  // Sync Route Polyline
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }

    if (showRoute && selectedPlace) {
      const riyadh = places.find(p => p.id === 'riyadh');
      if (riyadh && selectedPlace.id !== 'riyadh') {
        const routeLine = L.polyline(
          [[riyadh.lat, riyadh.lng], [selectedPlace.lat, selectedPlace.lng]],
          {
            color: '#3b82f6',
            weight: 4,
            dashArray: '8, 12',
            opacity: 0.9
          }
        ).addTo(map);

        routeLineRef.current = routeLine;

        // Auto fit bounds to encompass both markers
        const bounds = L.latLngBounds([
          [riyadh.lat, riyadh.lng],
          [selectedPlace.lat, selectedPlace.lng]
        ]);
        map.fitBounds(bounds, { padding: [80, 80] });
      }
    }
  }, [showRoute, selectedPlace, places]);

  const handleZoomIn = () => {
    if (mapInstance.current) {
      mapInstance.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstance.current) {
      mapInstance.current.zoomOut();
    }
  };

  const handleReset = () => {
    if (mapInstance.current) {
      mapInstance.current.setView([24.0, 45.0], 6);
      setSelectedPlaceId('riyadh');
      setShowRoute(false);
    }
  };

  return (
    <div className="relative h-[100dvh] w-full bg-slate-950 overflow-hidden flex flex-col md:flex-row" dir={dir}>
      {/* 1. Real Interactive Map Area */}
      <div className="flex-1 relative h-full w-full overflow-hidden select-none">
        <div ref={mapRef} className="absolute inset-0 h-full w-full z-0" />

        {/* 2. Top Floating Filters & Search */}
        <div className="absolute top-24 left-6 right-6 z-[1001] flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between pointer-events-none">
          <div className="bg-slate-900/90 backdrop-blur-md p-1.5 rounded-full border border-slate-800 shadow-xl flex items-center gap-2 max-w-sm w-full pointer-events-auto">
            <Search className="w-4 h-4 text-slate-400 ml-3 shrink-0" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchOnMap')} 
              className="flex-1 bg-transparent border-none outline-none px-2 py-1.5 text-xs text-white placeholder-slate-500 font-medium"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto hide-scrollbar bg-slate-900/90 backdrop-blur-md p-1 rounded-full border border-slate-800 shadow-xl pointer-events-auto">
            {filters.map((filter) => {
              const Icon = filter.icon;
              const isSelected = activeFilter === filter.key;
              return (
                <button
                  key={filter.key}
                  onClick={() => {
                    setActiveFilter(filter.key);
                    setSelectedPlaceId(null);
                    setShowRoute(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-xs font-bold transition-all cursor-pointer ${
                    isSelected ? 'bg-secondary text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{filter.name === 'All' ? t('all') : t(filter.name.toLowerCase())}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Floating Map Controls */}
        <div className={`absolute bottom-28 ${dir === 'rtl' ? 'left-6' : 'right-6'} z-[1001] flex flex-col gap-2`}>
          <button onClick={handleZoomIn} className="w-10 h-10 rounded-full bg-slate-900/95 backdrop-blur-md border border-slate-800 flex items-center justify-center text-white hover:bg-slate-800 transition-colors shadow-lg cursor-pointer">
            <Plus className="w-5 h-5" />
          </button>
          <button onClick={handleZoomOut} className="w-10 h-10 rounded-full bg-slate-900/95 backdrop-blur-md border border-slate-800 flex items-center justify-center text-white hover:bg-slate-800 transition-colors shadow-lg cursor-pointer">
            <Minus className="w-5 h-5" />
          </button>
          <button onClick={handleReset} className="w-10 h-10 rounded-full bg-slate-900/95 backdrop-blur-md border border-slate-800 flex items-center justify-center text-white hover:bg-slate-800 transition-colors shadow-lg text-xs font-black cursor-pointer">
            RESET
          </button>
        </div>
      </div>

      {/* 4. Side Detail Info panel */}
      <div className="w-full md:w-[380px] bg-slate-900/95 backdrop-blur-md border-t md:border-t-0 md:border-l border-slate-800 z-[1002] flex flex-col shadow-2xl relative md:h-full justify-end md:justify-start pt-4 md:pt-24 pb-28 md:pb-6">
        <AnimatePresence mode="wait">
          {selectedPlace ? (
            <motion.div
              key={selectedPlace.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.4 }}
              className="p-6 flex flex-col gap-5 h-full overflow-y-auto hide-scrollbar"
            >
              {/* Cover Photo */}
              <div className="relative h-44 rounded-2xl overflow-hidden shrink-0 shadow-lg border border-slate-800">
                <img 
                  src={selectedPlace.image} 
                  alt={selectedPlace.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                <span className="absolute top-3 left-3 bg-secondary/80 backdrop-blur-sm text-[10px] font-black uppercase text-white px-2.5 py-1 rounded-full border border-white/10 tracking-widest">
                  {selectedPlace.category}
                </span>
              </div>

              {/* Title & Info */}
              <div>
                <h2 className="text-2xl font-black text-white leading-tight">{selectedPlace.name}</h2>
                <div className="flex items-center gap-3 mt-2 text-slate-400 text-xs font-medium">
                  <span className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {selectedPlace.rating}
                  </span>
                  <span>{selectedPlace.reviews} {t('reviews')}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-slate-400 text-xs leading-relaxed font-normal">
                {selectedPlace.description}
              </p>

              {/* Route distance indicator */}
              <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold uppercase tracking-wider">{language === 'ar' ? 'المسافة المقدرة' : 'Est. Distance'}</span>
                <span className="font-extrabold text-white bg-slate-850 px-2.5 py-1 rounded-lg border border-slate-850">
                  {selectedPlace.distance}
                </span>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2.5 mt-auto pt-4 border-t border-slate-800 shrink-0">
                <button
                  onClick={() => setShowRoute(true)}
                  className="w-full h-12 bg-secondary text-white rounded-full font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2 hover:scale-[1.01] transition-all cursor-pointer border-none"
                >
                  <Navigation className="w-4 h-4" />
                  {language === 'ar' ? 'عرض المسار' : 'Get Directions'}
                </button>
                <button
                  onClick={() => navigate(`/destination/${selectedPlace.id}`)}
                  className="w-full h-12 bg-slate-800 text-white rounded-full font-bold hover:bg-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-700"
                >
                  <Eye className="w-4 h-4" />
                  {language === 'ar' ? 'عرض تفاصيل الوجهة' : 'View Destination'}
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="p-8 text-center text-slate-500 h-full flex flex-col justify-center items-center gap-3">
              <Compass className="w-12 h-12 text-slate-700 animate-pulse" />
              <p className="text-xs font-bold uppercase tracking-widest">
                {language === 'ar' ? 'اختر نقطة على الخريطة' : 'Select a spot on map'}
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
