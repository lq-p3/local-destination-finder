import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Star, Globe, MapPin, Award, CheckCircle, Calendar, 
  Clock, MessageSquare, X, Filter, Navigation, ShieldCheck, Heart,
  Compass, Target, GraduationCap, Languages
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TravelGuide } from '../types/models';

export default function GuidesPage() {
  const { t, language, dir } = useLanguage();
  
  const [guides, setGuides] = useState<TravelGuide[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<TravelGuide | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [langFilter, setLangFilter] = useState('');
  const [availableOnly, setAvailableOnly] = useState(true);

  // Booking states
  const [bookingDate, setBookingDate] = useState('');
  const [bookingHours, setBookingHours] = useState(4);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Map elements
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const circlesRef = useRef<L.Circle[]>([]);

  const loadGuides = () => {
    setLoading(true);
    api.guides.list({
      city: searchQuery,
      specialty,
      price: maxPrice,
      language: langFilter,
      availableOnly
    }).then(res => {
      setGuides(res);
    }).catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadGuides();
  }, [searchQuery, specialty, maxPrice, langFilter, availableOnly]);

  // Leaflet Map Initialization
  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([24.7136, 46.6753], 6); // Riyadh Center

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(mapInstance.current);

      L.control.zoom({
        position: dir === 'rtl' ? 'topleft' : 'topright'
      }).addTo(mapInstance.current);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [dir]);

  // Refresh Markers on guides update
  useEffect(() => {
    if (!mapInstance.current) return;

    // Clear old markers & circles
    markersRef.current.forEach(m => m.remove());
    circlesRef.current.forEach(c => c.remove());
    markersRef.current = [];
    circlesRef.current = [];

    // Filter available guides to display on map
    const activeGuides = guides.filter(g => g.availability === 'available');

    activeGuides.forEach(g => {
      const { lat, lng } = g.approximateLocation;

      // Custom marker icon showing Guide icon/compass
      const guideIcon = L.divIcon({
        className: 'custom-guide-marker',
        html: `<div class="w-8 h-8 rounded-full bg-secondary text-white border-2 border-white flex items-center justify-center shadow-md hover:scale-110 transition-transform"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-compass"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([lat, lng], { icon: guideIcon })
        .addTo(mapInstance.current!)
        .on('click', () => setSelectedGuide(g));

      // 2km Privacy Circle overlay representing approximate geocoding location
      const circle = L.circle([lat, lng], {
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.15,
        radius: 1200 // 1.2km approximate boundary
      }).addTo(mapInstance.current!);

      markersRef.current.push(marker);
      circlesRef.current.push(circle);
    });

    // Auto-fit map boundaries if we have active markers
    if (activeGuides.length > 0 && mapInstance.current) {
      const group = L.featureGroup(markersRef.current);
      mapInstance.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [guides]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuide || !bookingDate) return;

    try {
      await api.bookings.create({
        type: 'guide',
        itemId: selectedGuide.id,
        startDate: bookingDate,
        travelersCount: 1
      });
      setBookingSuccess(true);
      setBookingDate('');
    } catch (err) {
      console.error(err);
    }
  };

  const toggleAvailability = async (newVal: 'available' | 'offline') => {
    if (!selectedGuide) return;
    try {
      const updated = await api.guides.updateProfile({ availability: newVal });
      setSelectedGuide(prev => prev ? { ...prev, availability: updated.availability } : null);
      loadGuides();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="pt-20 h-screen flex flex-col md:flex-row bg-slate-50 overflow-hidden" dir={dir}>
      {/* Search Sidebar */}
      <div className="w-full md:w-[380px] bg-white border-r border-slate-200 flex flex-col h-full z-10 shadow-sm shrink-0">
        
        {/* Filters Area */}
        <div className="p-5 border-b border-slate-100 flex flex-col gap-3">
          <h2 className="text-xl font-black text-primary flex items-center gap-1.5">
            <Globe className="w-6 h-6 text-secondary" />
            {t('tourGuides')}
          </h2>

          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('searchGuides')}
              className="w-full h-11 pr-10 pl-4 border border-slate-200 rounded-xl text-xs bg-slate-50 outline-none focus:ring-2 focus:ring-secondary"
            />
            <Search className="absolute right-3.5 top-3 w-5 h-5 text-slate-400" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select
              value={langFilter}
              onChange={e => setLangFilter(e.target.value)}
              className="h-10 px-3 border border-slate-200 rounded-xl text-[11px] bg-slate-50 font-bold outline-none"
            >
              <option value="">{language === 'ar' ? 'جميع اللغات' : 'All Languages'}</option>
              <option value="Arabic">{language === 'ar' ? 'العربية' : 'Arabic'}</option>
              <option value="English">{language === 'ar' ? 'الإنجليزية' : 'English'}</option>
            </select>

            <select
              value={specialty}
              onChange={e => setSpecialty(e.target.value)}
              className="h-10 px-3 border border-slate-200 rounded-xl text-[11px] bg-slate-50 font-bold outline-none"
            >
              <option value="">{language === 'ar' ? 'جميع التخصصات' : 'All Specialties'}</option>
              <option value="Historical">{language === 'ar' ? 'آثار وتاريخ' : 'Historical'}</option>
              <option value="Hiking">{language === 'ar' ? 'مسارات جبلية' : 'Hiking'}</option>
            </select>
          </div>

          {/* Pricing slider filter */}
          <div className="flex flex-col gap-1.5 mt-1.5">
            <div className="flex justify-between text-[10px] font-bold text-slate-500">
              <span>{language === 'ar' ? 'أقصى سعر للساعة' : 'Max Hourly Rate'}</span>
              <span className="text-secondary">{maxPrice} SAR</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="500" 
              value={maxPrice} 
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-full accent-secondary"
            />
          </div>

          <label className="flex items-center gap-2 mt-1 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={e => setAvailableOnly(e.target.checked)}
              className="w-4 h-4 rounded text-secondary focus:ring-secondary cursor-pointer"
            />
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shrink-0"></span>
              <span>{language === 'ar' ? 'المتاحون الآن فقط' : 'Available Now Only'}</span>
            </span>
          </label>
        </div>

        {/* Guides Catalog List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : guides.length === 0 ? (
            <div className="text-center py-10 text-slate-400 font-bold text-xs">
              {language === 'ar' ? 'لا يوجد مرشدين يطابقون خيارات التصفية.' : 'No tourist guides match current filters.'}
            </div>
          ) : (
            guides.map(g => (
              <div
                key={g.id}
                onClick={() => setSelectedGuide(g)}
                className={`p-4 bg-white border rounded-2xl shadow-sm cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md flex gap-4 ${
                  selectedGuide?.id === g.id ? 'border-secondary ring-1 ring-secondary' : 'border-slate-200'
                }`}
              >
                <div className="w-14 h-14 rounded-full border border-slate-200 overflow-hidden shrink-0">
                  <img src={g.avatar} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-sm text-slate-800 truncate">{language === 'ar' ? g.nameAr : g.nameEn}</h3>
                    {g.isVerified && <CheckCircle className="w-4 h-4 text-secondary shrink-0" />}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 block mt-0.5 line-clamp-1">
                    {language === 'ar' ? g.specialtiesAr.join('، ') : g.specialtiesEn.join(', ')}
                  </span>
                  
                  <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-100">
                    <span className="text-[10px] font-extrabold text-secondary">{g.pricePerHour} SAR / {t('hour') || 'hour'}</span>
                    <span className="text-[10px] font-bold text-amber-500 flex items-center gap-0.5">
                      <Star className="w-3.5 h-3.5 fill-current" /> {g.rating}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Geolocation map viewport */}
      <div className="flex-1 h-full relative">
        <div ref={mapRef} className="w-full h-full" />
      </div>

      {/* Guide Details Overlay Slider Sheet */}
      <AnimatePresence>
        {selectedGuide && (
          <div className="fixed inset-0 z-[2000] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setSelectedGuide(null); setBookingSuccess(false); }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: dir === 'rtl' ? -380 : 380 }}
              animate={{ x: 0 }}
              exit={{ x: dir === 'rtl' ? -380 : 380 }}
              className="w-full max-w-[420px] bg-white h-full relative z-10 shadow-2xl flex flex-col p-6 overflow-y-auto hide-scrollbar"
            >
              <button
                onClick={() => { setSelectedGuide(null); setBookingSuccess(false); }}
                className="absolute top-6 left-6 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border-none cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>

              <div className="flex flex-col items-center mt-8 text-center pb-6 border-b border-slate-100">
                <div className="w-20 h-20 rounded-full border-4 border-slate-100 overflow-hidden shadow-md mb-3">
                  <img src={selectedGuide.avatar} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-lg text-slate-800">{language === 'ar' ? selectedGuide.nameAr : selectedGuide.nameEn}</h3>
                  {selectedGuide.isVerified && <CheckCircle className="w-4.5 h-4.5 text-secondary" />}
                </div>
                <span className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{selectedGuide.licenseNumber}</span>

                <div className="flex gap-2 mt-4">
                  <span className={`text-[10px] font-black px-3.5 py-1.5 rounded-full border flex items-center gap-1 ${
                    selectedGuide.availability === 'available' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-500 border-red-100'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${selectedGuide.availability === 'available' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    {selectedGuide.availability === 'available' ? (language === 'ar' ? 'متاح الآن' : 'Available') : (language === 'ar' ? 'مشغول' : 'Busy')}
                  </span>
                  
                  {/* Rating display */}
                  <span className="text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-100 px-3.5 py-1.5 rounded-full flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current" /> {selectedGuide.rating} ({selectedGuide.reviewsCount} {language === 'ar' ? 'تقييم' : 'reviews'})
                  </span>
                </div>
              </div>

              {/* Guide Profile details */}
              <div className="py-6 flex flex-col gap-5 border-b border-slate-100">
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{language === 'ar' ? 'الخبرة واللغات' : 'Experience & Languages'}</span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[10px] font-bold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg text-slate-650 flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                      <span>{selectedGuide.yearsOfExperience} {language === 'ar' ? 'سنوات خبرة' : 'years experience'}</span>
                    </span>
                    {(language === 'ar' ? selectedGuide.languagesAr : selectedGuide.languagesEn).map((lang, i) => (
                      <span key={i} className="text-[10px] font-bold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg text-slate-650 flex items-center gap-1">
                        <Languages className="w-3.5 h-3.5 text-slate-500" />
                        <span>{lang}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{language === 'ar' ? 'التخصصات والجولات' : 'Specialties'}</span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(language === 'ar' ? selectedGuide.specialtiesAr : selectedGuide.specialtiesEn).map((spec, i) => (
                      <span key={i} className="text-[10px] font-bold bg-blue-50 border border-blue-150 px-2 py-0.5 rounded-lg text-secondary flex items-center gap-1">
                        <Target className="w-3.5 h-3.5 text-secondary" />
                        <span>{spec}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{language === 'ar' ? 'نبذة تعريفية' : 'About Guide'}</span>
                  <p className="text-slate-600 text-xs leading-relaxed mt-2 font-light">
                    {language === 'ar' 
                      ? 'مرشد سياحي مؤهل ومرخص من وزارة السياحة لتنظيم المسارات الجبلية والتعريف بالآثار.' 
                      : 'Certified local tourist guide authorized to escort museum walks and coordination.'
                    }
                  </p>
                </div>
              </div>

              {/* Booking Scheduler form */}
              <div className="py-6">
                <h4 className="font-extrabold text-sm text-slate-800 mb-3.5 flex items-center gap-1.5">
                  <Calendar className="w-5 h-5 text-secondary" />
                  {language === 'ar' ? 'جدولة حجز مع المرشد' : 'Schedule Booking'}
                </h4>

                {bookingSuccess ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-center text-emerald-600 font-bold text-xs flex flex-col items-center gap-2">
                    <CheckCircle className="w-8 h-8" />
                    <span>{language === 'ar' ? 'تم إرسال طلب الحجز بنجاح!' : 'Booking request submitted successfully!'}</span>
                  </div>
                ) : (
                  <form onSubmit={handleBookingSubmit} className="flex flex-col gap-3.5">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-500">{language === 'ar' ? 'تاريخ الجولة' : 'Tour Date'}</label>
                      <input 
                        type="date" 
                        required 
                        value={bookingDate} 
                        onChange={e => setBookingDate(e.target.value)} 
                        className="h-11 px-3 border border-slate-200 rounded-xl text-xs bg-slate-50 outline-none focus:ring-2 focus:ring-secondary" 
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-500">{language === 'ar' ? 'عدد الساعات المجدولة' : 'Scheduled Hours'}</label>
                      <select 
                        value={bookingHours} 
                        onChange={e => setBookingHours(Number(e.target.value))} 
                        className="h-11 px-3 border border-slate-200 rounded-xl text-xs bg-slate-50 outline-none"
                      >
                        <option value="2">2 {language === 'ar' ? 'ساعات' : 'hours'}</option>
                        <option value="4">4 {language === 'ar' ? 'ساعات (نصف يوم)' : 'hours (half day)'}</option>
                        <option value="8">8 {language === 'ar' ? 'ساعات (يوم كامل)' : 'hours (full day)'}</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full h-12 bg-primary text-white font-bold text-xs rounded-xl shadow-md hover:scale-[1.01] transition-transform mt-2 border-none cursor-pointer"
                    >
                      {language === 'ar' ? 'طلب حجز مرشد' : 'Request Guide reservation'}
                    </button>
                  </form>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
