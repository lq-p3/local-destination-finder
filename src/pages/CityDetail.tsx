import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { PageContainer } from '../components/ui/PageContainer';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Skeleton, ErrorState } from '../components/ui/States';
import { MapPin, Star, Building, Utensils, Coffee, Calendar, Compass, Package as PackageIcon, ArrowRight, ArrowLeft } from 'lucide-react';
import { cities } from '../api';

export default function CityDetail() {
  const { id } = useParams<{ id: string }>();
  const { language, dir } = useLanguage();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const [activeTab, setActiveTab] = useState<'overview' | 'destinations' | 'hotels' | 'cafes' | 'events' | 'packages'>('overview');
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadCityHub() {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const result = await cities.getById(id);
        if (isMounted) setData(result);
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to load city details');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadCityHub();
    return () => { isMounted = false; };
  }, [id]);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <div className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-44 rounded-3xl" />
            <Skeleton className="h-44 rounded-3xl" />
            <Skeleton className="h-44 rounded-3xl" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error || !data) {
    return (
      <PageContainer>
        <ErrorState message={error || 'City not found'} onRetry={() => window.location.reload()} />
      </PageContainer>
    );
  }

  const { city, topDestinations = [], hotels = [], cafes = [], events = [], packages = [] } = data;
  const isAr = language === 'ar';

  return (
    <PageContainer className="space-y-8">
      {/* Back Button */}
      <Link to="/explore" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary transition-colors">
        <Arrow className="w-4 h-4 rotate-180" />
        <span>{isAr ? 'العودة لاستكشاف الوجهات' : 'Back to Explore'}</span>
      </Link>

      {/* Hero Banner */}
      <div className="relative rounded-[32px] overflow-hidden shadow-lg border border-slate-100 bg-slate-900 text-white min-h-[300px] flex items-end p-8">
        <img
          src={city.coverImage || 'https://images.unsplash.com/photo-1578898835027-2ad020afd173?auto=format&fit=crop&w=1600&q=80'}
          alt={isAr ? city.nameAr : city.nameEn}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white">
            <MapPin className="w-3.5 h-3.5 text-secondary" />
            <span>{isAr ? city.nameAr : city.nameEn}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">{isAr ? city.nameAr : city.nameEn}</h1>
          <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 leading-relaxed">
            {isAr ? city.descriptionAr : city.descriptionEn}
          </p>
        </div>
      </div>

      {/* Tourism Hub Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-2 hide-scrollbar">
        {[
          { id: 'overview', labelAr: 'نظرة عامة', labelEn: 'Overview', icon: Compass },
          { id: 'destinations', labelAr: 'الوجهات والمعالم', labelEn: 'Destinations', icon: MapPin },
          { id: 'hotels', labelAr: 'الفنادق والإقامة', labelEn: 'Hotels', icon: Building },
          { id: 'cafes', labelAr: 'المقاهي والمطاعم', labelEn: 'Cafés & Dining', icon: Coffee },
          { id: 'events', labelAr: 'الفعاليات', labelEn: 'Events', icon: Calendar },
          { id: 'packages', labelAr: 'البكجات السياحية', labelEn: 'Packages', icon: PackageIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer border-none ${
                isActive
                  ? 'bg-primary text-white shadow-md scale-105'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{isAr ? tab.labelAr : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-extrabold text-slate-900">{isAr ? 'عن المدينة' : 'About the City'}</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{isAr ? city.descriptionAr : city.descriptionEn}</p>
          </div>

          <SectionHeader title={isAr ? 'أبرز المعالم' : 'Top Highlights'} subtitle={isAr ? 'أماكن يُنصح بزيارتها' : 'Must-visit places'} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topDestinations.slice(0, 3).map((dest: any) => (
              <Link key={dest.id} to={`/destination/${dest.id}`} className="group bg-white border border-slate-200 rounded-3xl overflow-hidden hover:shadow-md transition">
                <img src={dest.image} alt={dest.nameAr} className="h-44 w-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-secondary">{isAr ? dest.nameAr : dest.nameEn}</h3>
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{dest.rating}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'destinations' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topDestinations.map((dest: any) => (
            <Link key={dest.id} to={`/destination/${dest.id}`} className="group bg-white border border-slate-200 rounded-3xl overflow-hidden hover:shadow-md transition">
              <img src={dest.image} alt={dest.nameAr} className="h-48 w-full object-cover group-hover:scale-105 transition duration-500" />
              <div className="p-4 space-y-2">
                <h3 className="font-bold text-slate-900 text-sm">{isAr ? dest.nameAr : dest.nameEn}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{isAr ? dest.descriptionAr : dest.descriptionEn}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {activeTab === 'hotels' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hotels.map((h: any) => (
            <div key={h.id} className="bg-white border border-slate-200 rounded-3xl p-5 flex gap-4 items-center">
              <Building className="w-10 h-10 text-secondary bg-secondary/10 p-2 rounded-2xl shrink-0" />
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-sm">{isAr ? h.nameAr : h.nameEn}</h3>
                <p className="text-xs text-slate-500">{isAr ? h.descriptionAr : h.descriptionEn}</p>
                <span className="inline-block text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{h.stars} {isAr ? 'نجوم' : 'Stars'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'cafes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cafes.map((c: any) => (
            <div key={c.id} className="bg-white border border-slate-200 rounded-3xl p-5 flex gap-4 items-center">
              <Coffee className="w-10 h-10 text-amber-600 bg-amber-50 p-2 rounded-2xl shrink-0" />
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-sm">{isAr ? c.nameAr : c.nameEn}</h3>
                <p className="text-xs text-slate-500">{c.openingHours}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
