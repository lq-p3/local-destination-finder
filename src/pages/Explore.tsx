import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, MapPin, Star, Filter, Grid, Map as MapIcon, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api';
import { PageContainer } from '../components/ui/PageContainer';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Badge } from '../components/ui/ButtonsAndBadges';
import { DestinationCardSkeleton, EmptyState } from '../components/ui/States';
import PlaceCard from '../components/PlaceCard';

export default function Explore() {
  const { language, dir } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedRegion, setSelectedRegion] = useState(searchParams.get('region') || 'all');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [minRating, setMinRating] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const [destinations, setDestinations] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Debounced search term
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.destinations.list(),
      api.regions.list()
    ])
      .then(([dests, regs]) => {
        setDestinations(Array.isArray(dests) ? dests : (dests?.items || []));
        setRegions(Array.isArray(regs) ? regs : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    { id: 'all', labelAr: 'الكل', labelEn: 'All' },
    { id: 'Heritage', labelAr: 'تراث وتاريخ', labelEn: 'Heritage' },
    { id: 'Nature', labelAr: 'طبيعة وجبال', labelEn: 'Nature' },
    { id: 'Adventure', labelAr: 'مغامرة واستكشاف', labelEn: 'Adventure' },
    { id: 'Coastal', labelAr: 'شواطئ وبحر', labelEn: 'Coastal' }
  ];

  const filteredDestinations = destinations.filter(item => {
    const nameMatch = !debouncedSearch || 
      (language === 'ar' ? item.nameAr || item.name : item.nameEn || item.name).toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (language === 'ar' ? item.descriptionAr || '' : item.descriptionEn || '').toLowerCase().includes(debouncedSearch.toLowerCase());

    const regionMatch = selectedRegion === 'all' || item.regionId === selectedRegion;
    const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory;
    const ratingMatch = (item.rating || 0) >= minRating;

    return nameMatch && regionMatch && categoryMatch && ratingMatch;
  });

  return (
    <PageContainer dir={dir}>
      <SectionHeader
        title={language === 'ar' ? 'استكشف وجهات المملكة' : 'Explore Saudi Destinations'}
        subtitle={language === 'ar' ? 'ابحث عن وجهات تفاعلية، شواطئ، معالم تاريخية، ورحلات طبيعية' : 'Discover interactive spots, coastal beaches, heritage, and nature trails'}
        icon={<Sparkles className="w-7 h-7 text-emerald-500" />}
        action={
          <div className="flex bg-slate-200/80 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              <Grid className="w-4 h-4" />
              {language === 'ar' ? 'شبكة' : 'Grid'}
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'map' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              <MapIcon className="w-4 h-4" />
              {language === 'ar' ? 'الخريطة' : 'Map'}
            </button>
          </div>
        }
      />

      {/* Filter & Search Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-8 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute right-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'ar' ? 'ابحث باسم الوجهة، المدينة، أو نوع النشاط...' : 'Search by destination, city, or activity...'}
              className="w-full pl-4 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
          </div>

          {/* Region Selector */}
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="all">{language === 'ar' ? 'جميع المناطق (13)' : 'All Regions (13)'}</option>
            {regions.map(r => (
              <option key={r.id} value={r.id}>
                {language === 'ar' ? r.nameAr : r.nameEn}
              </option>
            ))}
          </select>

          {/* Rating Selector */}
          <select
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value={0}>{language === 'ar' ? 'جميع التقييمات' : 'All Ratings'}</option>
            <option value={4}>{language === 'ar' ? '★ 4.0 أو أعلى' : '★ 4.0 & above'}</option>
            <option value={4.5}>{language === 'ar' ? '★ 4.5 أو أعلى' : '★ 4.5 & above'}</option>
          </select>
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 hide-scrollbar">
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === c.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {language === 'ar' ? c.labelAr : c.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content View */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DestinationCardSkeleton />
          <DestinationCardSkeleton />
          <DestinationCardSkeleton />
        </div>
      ) : filteredDestinations.length === 0 ? (
        <EmptyState
          title={language === 'ar' ? 'لم نثمل على وجهات مطابقة' : 'No matching destinations found'}
          description={language === 'ar' ? 'جرب البحث بكلمات مختلفة أو إعادة ضبط الفلاتر المحددة.' : 'Try adjusting your search terms or filter preferences.'}
          action={
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedRegion('all');
                setSelectedCategory('all');
                setMinRating(0);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              {language === 'ar' ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
            </button>
          }
        />
      ) : viewMode === 'map' ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm h-[600px] flex flex-col justify-center items-center text-center">
          <MapIcon className="w-12 h-12 text-slate-400 mb-3 animate-bounce" />
          <h3 className="text-lg font-bold text-slate-800">
            {language === 'ar' ? `عرض الخريطة الفاعلة (${filteredDestinations.length} موقع)` : `Interactive Map View (${filteredDestinations.length} spots)`}
          </h3>
          <p className="text-sm text-slate-500 mb-4 max-w-md">
            {language === 'ar' ? 'استكشف الوجهات الجغرافية المحددة مباشرة على الخريطة.' : 'Explore geocoded destination spots directly on the map.'}
          </p>
          <Link
            to="/map"
            className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-medium text-xs shadow-lg hover:bg-emerald-500 transition"
          >
            {language === 'ar' ? 'الانتقال إلى خريطة المملكة الكاملة' : 'Open Full Saudi Map'}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map(dest => (
            <Link
              key={dest.id}
              to={`/destination/${dest.id}`}
              className="group bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative h-52 overflow-hidden bg-slate-900">
                <img
                  src={dest.image || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80'}
                  alt={language === 'ar' ? dest.nameAr || dest.name : dest.nameEn || dest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3">
                  <Badge variant="emerald" className="backdrop-blur-md bg-white/90 text-slate-900 border-none shadow-sm">
                    {dest.category || 'Destination'}
                  </Badge>
                </div>
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-semibold mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{dest.cityId}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white leading-snug line-clamp-1">
                    {language === 'ar' ? dest.nameAr || dest.name : dest.nameEn || dest.name}
                  </h3>
                </div>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {language === 'ar' ? dest.descriptionAr || dest.description : dest.descriptionEn || dest.description}
                </p>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{dest.rating || 4.8}</span>
                    <span className="text-slate-400 font-normal">({dest.reviewsCount || 45})</span>
                  </div>
                  <span className="text-emerald-600 font-bold group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition">
                    {language === 'ar' ? 'عرض التفاصيل ←' : 'View Details →'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
