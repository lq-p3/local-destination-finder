import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, Check, Plus, AlertCircle, Compass, FileText, 
  Map as MapIcon, Image as ImageIcon, CheckCircle, Info, Clock, BadgeCent 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api';
import { createDestination } from '../api/destinationsApi';
import { Region, City, Destination } from '../types/models';
import L from 'leaflet';

export default function AddPlace() {
  const { t, language, dir } = useLanguage();
  const navigate = useNavigate();

  // Data states
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [submissions, setSubmissions] = useState<Destination[]>([]);
  const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit');

  // Form states
  const [selectedRegionId, setSelectedRegionId] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [category, setCategory] = useState('Nature');
  const [descEn, setDescEn] = useState('');
  const [descAr, setDescAr] = useState('');
  const [lat, setLat] = useState(24.7136);
  const [lng, setLng] = useState(46.6753);
  const [workingHoursEn, setWorkingHoursEn] = useState('09:00 AM - 05:00 PM');
  const [workingHoursAr, setWorkingHoursAr] = useState('09:00 ص - 05:00 م');
  const [entryFees, setEntryFees] = useState(0);
  const [priceLevel, setPriceLevel] = useState<'$' | '$$' | '$$$'>('$$');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [suitability, setSuitability] = useState({
    families: true,
    kids: true,
    elderly: true,
    disabled: true
  });
  const [servicesInput, setServicesInput] = useState('');
  const [image, setImage] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Map references
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    // Fetch regions & submissions
    api.regions.list().then(setRegions).catch(console.error);
    api.destinations.getMySubmissions().then(setSubmissions).catch(console.error);
  }, []);

  // Filter cities based on selected region
  useEffect(() => {
    if (!selectedRegionId) return;
    api.regions.get(selectedRegionId)
      .then(res => {
        setCities(res.cities);
        if (res.cities.length > 0) {
          setSelectedCityId(res.cities[0].id);
        }
      })
      .catch(console.error);
  }, [selectedRegionId]);

  // Leaflet Map Initialization
  useEffect(() => {
    if (activeTab !== 'submit' || !mapRef.current || mapInstance.current) return;

    // Default Riyadh
    const map = L.map(mapRef.current, {
      center: [24.7136, 46.6753],
      zoom: 6,
      attributionControl: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(map);

    const marker = L.marker([24.7136, 46.6753], { draggable: true }).addTo(map);
    markerRef.current = marker;

    marker.on('dragend', () => {
      const position = marker.getLatLng();
      setLat(Number(position.lat.toFixed(5)));
      setLng(Number(position.lng.toFixed(5)));
    });

    map.on('click', (e) => {
      marker.setLatLng(e.latlng);
      setLat(Number(e.latlng.lat.toFixed(5)));
      setLng(Number(e.latlng.lng.toFixed(5)));
    });

    mapInstance.current = map;

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markerRef.current = null;
      }
    };
  }, [activeTab]);

  // Fly to selected city on map
  useEffect(() => {
    if (!selectedCityId || !mapInstance.current) return;
    const city = cities.find(c => c.id === selectedCityId);
    if (city) {
      mapInstance.current.flyTo([city.coordinates.lat, city.coordinates.lng], 10);
      if (markerRef.current) {
        markerRef.current.setLatLng([city.coordinates.lat, city.coordinates.lng]);
        setLat(city.coordinates.lat);
        setLng(city.coordinates.lng);
      }
    }
  }, [selectedCityId, cities]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim() || !nameAr.trim() || !descEn.trim() || !descAr.trim()) {
      setErrorMsg(language === 'ar' ? 'الرجاء تعبئة كافة الحقول الرئيسية' : 'Please fill all primary fields.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const services = servicesInput.split(',').map(s => s.trim()).filter(Boolean);

    try {
      await createDestination({
        cityId: selectedCityId || 'riyadh',
        nameEn,
        nameAr,
        category,
        descriptionEn: descEn,
        descriptionAr: descAr,
        coordinates: { lat, lng },
        workingHoursEn,
        workingHoursAr,
        entryFees: Number(entryFees),
        priceLevel,
        contactInfo: { phone, email },
        servicesEn: services,
        servicesAr: services,
        suitability,
        image: image || undefined
      });

      setSuccess(true);
      // Refresh submissions
      api.destinations.getMySubmissions().then(setSubmissions);
      // Reset form
      setNameEn('');
      setNameAr('');
      setDescEn('');
      setDescAr('');
      setServicesInput('');
      setImage('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit destination.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'rejected': return 'bg-red-50 text-red-600 border-red-100';
      case 'edit_needed': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'pending': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const getStatusText = (status: string) => {
    if (language === 'ar') {
      switch (status) {
        case 'approved': return 'مقبول ونشر';
        case 'rejected': return 'مرفوض';
        case 'edit_needed': return 'يحتاج إلى تعديل';
        case 'pending': return 'قيد المراجعة';
        default: return 'مسودة';
      }
    } else {
      switch (status) {
        case 'approved': return 'Approved';
        case 'rejected': return 'Rejected';
        case 'edit_needed': return 'Needs Edit';
        case 'pending': return 'In Review';
        default: return 'Draft';
      }
    }
  };

  return (
    <div className="pt-24 px-6 max-w-7xl mx-auto min-h-screen pb-28" dir={dir}>
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-[10px] font-black text-secondary uppercase tracking-widest">{t('addPlace')}</span>
          <h1 className="text-3xl md:text-4xl font-black text-primary mt-1">
            {language === 'ar' ? 'مشاركة المستخدم' : 'User Contributions'}
          </h1>
        </div>
        
        {/* Toggle submissions dashboard tabs */}
        <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200 w-fit">
          <button
            onClick={() => setActiveTab('submit')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'submit' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {language === 'ar' ? 'إضافة مكان جديد' : 'Submit Place'}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'history' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {language === 'ar' ? 'طلباتي ومتابعتها' : 'My Requests'}
          </button>
        </div>
      </header>

      {/* Main Tab Panels */}
      <AnimatePresence mode="wait">
        {activeTab === 'submit' ? (
          <motion.div
            key="submit"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {success ? (
              <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-[32px] p-8 text-center flex flex-col items-center gap-4 shadow-md">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-primary">{language === 'ar' ? 'تم إرسال طلب الإضافة!' : 'Submitted Successfully!'}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                  {language === 'ar' 
                    ? 'لقد تم إرسال طلبك بنجاح للجنة المراجعة الإدارية. لقد حصلت على 50 نقطة شكر لمساهمتك!'
                    : 'Your contribution is submitted for administrative review. You have earned 50 points for your helpful contribution!'
                  }
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="w-full py-4 bg-primary text-white font-bold rounded-full shadow-md hover:scale-101 transition-transform border-none cursor-pointer"
                >
                  {language === 'ar' ? 'إضافة مكان آخر' : 'Add Another Place'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. Left Form Column */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[32px] p-6 md:p-8 shadow-sm flex flex-col gap-5">
                  <h2 className="text-lg font-black text-primary mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-secondary" />
                    {language === 'ar' ? 'معلومات الوجهة الأساسية' : 'Primary Destination Info'}
                  </h2>

                  {errorMsg && (
                    <div className="p-4 bg-red-50 border border-red-100 text-red-500 rounded-2xl text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {errorMsg}
                    </div>
                  )}

                  {/* Regional Dropdowns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{language === 'ar' ? 'المنطقة الكبرى' : 'Region'}</label>
                      <select
                        required
                        value={selectedRegionId}
                        onChange={(e) => setSelectedRegionId(e.target.value)}
                        className="h-12 px-4 rounded-xl border border-slate-200 text-sm outline-none bg-slate-50 focus:ring-2 focus:ring-secondary focus:bg-white"
                      >
                        <option value="">{language === 'ar' ? '-- اختر المنطقة --' : '-- Select Region --'}</option>
                        {regions.map(r => (
                          <option key={r.id} value={r.id}>{language === 'ar' ? r.nameAr : r.nameEn}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{language === 'ar' ? 'المدينة / المحافظة' : 'City'}</label>
                      <select
                        required
                        disabled={!selectedRegionId}
                        value={selectedCityId}
                        onChange={(e) => setSelectedCityId(e.target.value)}
                        className="h-12 px-4 rounded-xl border border-slate-200 text-sm outline-none bg-slate-50 focus:ring-2 focus:ring-secondary focus:bg-white disabled:opacity-50"
                      >
                        {cities.map(c => (
                          <option key={c.id} value={c.id}>{language === 'ar' ? c.nameAr : c.nameEn}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Names (AR/EN) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{language === 'ar' ? 'اسم المكان (عربي)' : 'Place Name (Arabic)'}</label>
                      <input
                        type="text"
                        required
                        value={nameAr}
                        onChange={(e) => setNameAr(e.target.value)}
                        placeholder="مثال: مطل السودة"
                        className="h-12 px-4 rounded-xl border border-slate-200 text-sm outline-none bg-slate-50 focus:ring-2 focus:ring-secondary focus:bg-white"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{language === 'ar' ? 'اسم المكان (إنجليزي)' : 'Place Name (English)'}</label>
                      <input
                        type="text"
                        required
                        value={nameEn}
                        onChange={(e) => setNameEn(e.target.value)}
                        placeholder="e.g. Soudah Viewpoint"
                        className="h-12 px-4 rounded-xl border border-slate-200 text-sm outline-none bg-slate-50 focus:ring-2 focus:ring-secondary focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Category Type */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{language === 'ar' ? 'نوع التصنيف' : 'Category Category'}</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="h-12 px-4 rounded-xl border border-slate-200 text-sm outline-none bg-slate-50 focus:ring-2 focus:ring-secondary focus:bg-white"
                    >
                      <option value="Nature">{language === 'ar' ? 'طبيعة وجبال' : 'Nature'}</option>
                      <option value="Historical">{language === 'ar' ? 'تاريخي وأثري' : 'Historical'}</option>
                      <option value="Events">{language === 'ar' ? 'فعاليات ومواسم' : 'Events'}</option>
                      <option value="Restaurants">{language === 'ar' ? 'مطاعم ومقاهي' : 'Restaurants'}</option>
                      <option value="Adventure">{language === 'ar' ? 'مغامرات وتخييم' : 'Adventure'}</option>
                    </select>
                  </div>

                  {/* Descriptions (AR/EN) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{language === 'ar' ? 'الوصف والتفاصيل (عربي)' : 'Description (Arabic)'}</label>
                    <textarea
                      required
                      rows={3}
                      value={descAr}
                      onChange={(e) => setDescAr(e.target.value)}
                      placeholder="اكتب وصفاً معبراً ومعلومات مفيدة حول المكان..."
                      className="p-4 rounded-xl border border-slate-200 text-sm outline-none bg-slate-50 focus:ring-2 focus:ring-secondary focus:bg-white resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{language === 'ar' ? 'الوصف والتفاصيل (إنجليزي)' : 'Description (English)'}</label>
                    <textarea
                      required
                      rows={3}
                      value={descEn}
                      onChange={(e) => setDescEn(e.target.value)}
                      placeholder="Write a descriptive information about this local destination..."
                      className="p-4 rounded-xl border border-slate-200 text-sm outline-none bg-slate-50 focus:ring-2 focus:ring-secondary focus:bg-white resize-none"
                    />
                  </div>

                  {/* Working Hours */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{language === 'ar' ? 'أوقات العمل (عربي)' : 'Working Hours (Arabic)'}</label>
                      <input
                        type="text"
                        value={workingHoursAr}
                        onChange={(e) => setWorkingHoursAr(e.target.value)}
                        placeholder="مثال: من ٤ م حتى ١٢ ص"
                        className="h-12 px-4 rounded-xl border border-slate-200 text-sm outline-none bg-slate-50 focus:ring-2 focus:ring-secondary"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{language === 'ar' ? 'أوقات العمل (إنجليزي)' : 'Working Hours (English)'}</label>
                      <input
                        type="text"
                        value={workingHoursEn}
                        onChange={(e) => setWorkingHoursEn(e.target.value)}
                        placeholder="e.g. 04:00 PM - 12:00 AM"
                        className="h-12 px-4 rounded-xl border border-slate-200 text-sm outline-none bg-slate-50 focus:ring-2 focus:ring-secondary"
                      />
                    </div>
                  </div>

                  {/* Image link */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-secondary" />
                      {language === 'ar' ? 'رابط صورة الغلاف' : 'Cover Image Link'}
                    </label>
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="h-12 px-4 rounded-xl border border-slate-200 text-sm outline-none bg-slate-50 focus:ring-2 focus:ring-secondary"
                    />
                  </div>

                  {/* Services tags input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5 text-secondary" />
                      {language === 'ar' ? 'الخدمات المتوفرة (مفصولة بفاصلة)' : 'Available Services (comma separated)'}</label>
                    <input
                      type="text"
                      value={servicesInput}
                      onChange={(e) => setServicesInput(e.target.value)}
                      placeholder={language === 'ar' ? 'مثال: دورات مياه، مقاهي، مواقف سيارات' : 'e.g. Restrooms, Cafes, Parking'}
                      className="h-12 px-4 rounded-xl border border-slate-200 text-sm outline-none bg-slate-50 focus:ring-2 focus:ring-secondary"
                    />
                  </div>
                </div>

                {/* 2. Right Form Column (Map details & suitability) */}
                <div className="flex flex-col gap-6">
                  {/* Geospatial selection */}
                  <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm flex flex-col gap-4">
                    <h2 className="text-md font-bold text-primary flex items-center gap-2">
                      <MapIcon className="w-5 h-5 text-secondary" />
                      {t('selectLocation')}
                    </h2>
                    
                    {/* Interactive Leaflet coordinates selector */}
                    <div className="h-44 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative z-0">
                      <div ref={mapRef} className="w-full h-full" />
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-bold">LATITUDE</span>
                        <span className="text-xs font-mono font-bold text-slate-800">{lat}</span>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-bold">LONGITUDE</span>
                        <span className="text-xs font-mono font-bold text-slate-800">{lng}</span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Level & Entry fees */}
                  <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm flex flex-col gap-4">
                    <h2 className="text-md font-bold text-primary flex items-center gap-2">
                      <BadgeCent className="w-5 h-5 text-secondary" />
                      {language === 'ar' ? 'التكاليف ورسوم الدخول' : 'Fees & Financials'}
                    </h2>
                    
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('entryFees')} (SAR)</label>
                      <input
                        type="number"
                        min="0"
                        value={entryFees}
                        onChange={(e) => setEntryFees(Number(e.target.value))}
                        className="h-11 px-3.5 rounded-xl border border-slate-200 text-sm outline-none bg-slate-50 focus:ring-2 focus:ring-secondary"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('priceLevel')}</label>
                      <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl">
                        {(['$', '$$', '$$$'] as const).map(p => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPriceLevel(p)}
                            className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              priceLevel === p ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            {p === '$' ? (language === 'ar' ? 'اقتصادي' : 'Budget') : p === '$$' ? (language === 'ar' ? 'متوسط' : 'Moderate') : (language === 'ar' ? 'فاخر' : 'Premium')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm flex flex-col gap-4">
                    <h2 className="text-md font-bold text-primary flex items-center gap-2">
                      <Info className="w-5 h-5 text-secondary" />
                      {t('contactInfo')}
                    </h2>

                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 block uppercase">{language === 'ar' ? 'رقم الهاتف' : 'Phone'}</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+966 50..."
                          className="h-11 px-3.5 rounded-xl border border-slate-200 text-sm outline-none bg-slate-50 focus:ring-2 focus:ring-secondary"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 block uppercase">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="info@place.sa"
                          className="h-11 px-3.5 rounded-xl border border-slate-200 text-sm outline-none bg-slate-50 focus:ring-2 focus:ring-secondary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Suitability checklist */}
                  <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm flex flex-col gap-4">
                    <h2 className="text-md font-bold text-primary flex items-center gap-2">
                      <Check className="w-5 h-5 text-secondary" />
                      {t('suitability')}
                    </h2>

                    <div className="flex flex-col gap-3">
                      {Object.entries({
                        families: t('suitFamilies'),
                        kids: t('suitKids'),
                        elderly: t('suitElderly'),
                        disabled: t('suitDisabled')
                      }).map(([key, label]) => (
                        <label key={key} className="flex items-center gap-3 cursor-pointer group text-xs text-slate-700 font-semibold select-none">
                          <input
                            type="checkbox"
                            checked={suitability[key as keyof typeof suitability]}
                            onChange={(e) => setSuitability(prev => ({ ...prev, [key]: e.target.checked }))}
                            className="w-4 h-4 rounded border-slate-350 text-secondary focus:ring-secondary"
                          />
                          <span className="group-hover:text-primary transition-colors">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-primary text-white rounded-full font-black text-sm shadow-xl hover:scale-[1.01] transition-all cursor-pointer border-none flex items-center justify-center gap-2"
                  >
                    {loading ? t('submitting') : t('submitReview')}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        ) : (
          /* Submissions history tracking panel */
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-6"
          >
            {submissions.length === 0 ? (
              <div className="text-center py-20 bg-white border border-slate-200 rounded-[32px] text-slate-400 font-bold shadow-sm">
                <Compass className="w-12 h-12 text-slate-200 mx-auto mb-3 animate-spin" style={{ animationDuration: '6s' }} />
                {language === 'ar' ? 'لم تقم بإضافة أي وجهات بعد.' : 'You have not submitted any destinations yet.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {submissions.map((sub) => {
                  const sName = language === 'ar' ? sub.nameAr : sub.nameEn;
                  const sDesc = language === 'ar' ? sub.descriptionAr : sub.descriptionEn;
                  return (
                    <div 
                      key={sub.id}
                      className="bg-white border border-slate-200 rounded-[30px] p-6 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-4 mb-3">
                          <h3 className="font-extrabold text-lg text-primary">{sName}</h3>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${getStatusColor(sub.status)}`}>
                            {getStatusText(sub.status)}
                          </span>
                        </div>
                        <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 mb-4">{sDesc}</p>
                      </div>

                      {sub.adminFeedback && (
                        <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4 text-xs text-amber-700 flex items-start gap-2.5 mb-4 leading-relaxed">
                          <Info className="w-4 h-4 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold block mb-0.5">{language === 'ar' ? 'ملاحظة المراجع الإداري:' : 'Admin Feedback:'}</span>
                            {sub.adminFeedback}
                          </div>
                        </div>
                      )}

                      <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {language === 'ar' ? 'فئة المكان: ' : 'Category: '} {sub.category}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
