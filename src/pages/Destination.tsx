import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, ChevronRight, Heart, Star, MapPin, Calendar, 
  Compass, Coffee, Hotel, X, CheckCircle, Users, Edit, AlertTriangle, Upload, MessageSquare 
} from 'lucide-react';
import { destinations } from '../data';
import TripProgress from '../components/TripProgress';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api';
import { getDestinationById, getDestinationReviews, createDestinationReview } from '../api/destinationsApi';
import { mapDestinationApiToDestination } from '../mappers/destinationMapper';
import { Review } from '../../server/types';
import NearbyPlacesSection from '../components/NearbyPlacesSection';
import PlaceDetailsModal from '../components/PlaceDetailsModal';

export default function Destination() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language, dir } = useLanguage();
  
  // Find destination from local mock data first
  const localDest = destinations.find(d => d.id === id);
  const [dest, setDest] = useState<any>(localDest || null);
  const [reviews, setReviews] = useState<Review[]>([]);

  const [liked, setLiked] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('liked-places');
    return saved ? JSON.parse(saved) : {};
  });

  // Modal states
  const [showPlannerModal, setShowPlannerModal] = useState(false);
  const [plannerSuccess, setPlannerSuccess] = useState(false);
  const [tripDate, setTripDate] = useState('');
  const [travelers, setTravelers] = useState('1');

  // Interactive contribution modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProposal, setEditProposal] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Incorrect details');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoSuccess, setPhotoSuccess] = useState(false);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewCleanliness, setReviewCleanliness] = useState(5);
  const [reviewSafety, setReviewSafety] = useState(5);
  const [reviewPrice, setReviewPrice] = useState(5);
  const [reviewService, setReviewService] = useState(5);
  const [reviewCrowding, setReviewCrowding] = useState(3);

  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [inCompare, setInCompare] = useState(false);

  useEffect(() => {
    if (!id) return;
    // Load fresh details from ASP.NET Core API
    getDestinationById(id)
      .then(apiData => setDest(mapDestinationApiToDestination(apiData)))
      .catch(() => {
        if (localDest) setDest(localDest);
      });

    // Load reviews from ASP.NET Core API
    getDestinationReviews(id)
      .then(res => setReviews(res.items.map((r: any) => ({
        id: r.id,
        userId: r.userId,
        userName: r.userName,
        itemId: r.destinationId,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt
      }))))
      .catch(console.error);

    // Load comparisons
    api.comparisons.get()
      .then(res => {
        setCompareIds(res.itemIds);
        setInCompare(res.itemIds.includes(id));
      })
      .catch(console.error);
  }, [id]);

  useEffect(() => {
    localStorage.setItem('liked-places', JSON.stringify(liked));
  }, [liked]);

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!dest) return;
    setLiked(prev => ({ ...prev, [dest.id]: !prev[dest.id] }));
  };

  const handleToggleCompare = async () => {
    if (!id) return;
    try {
      if (inCompare) {
        const updated = await api.comparisons.remove(id);
        setCompareIds(updated.itemIds);
        setInCompare(false);
      } else {
        if (compareIds.length >= 3) {
          alert(language === 'ar' ? 'يمكنك مقارنة ٣ خيارات كحد أقصى' : 'You can compare up to 3 options maximum.');
          return;
        }
        const updated = await api.comparisons.add(id);
        setCompareIds(updated.itemIds);
        setInCompare(true);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPlannerSuccess(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !editProposal.trim()) return;
    try {
      await api.destinations.suggestEdit(id, { descriptionEn: editProposal });
      setEditSuccess(true);
      setEditProposal('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await api.destinations.report(id, reportReason, reportDetails);
      setReportSuccess(true);
      setReportDetails('');
    } catch (err) {
      console.error(err);
    }
  };

  const handlePhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !photoUrl.trim()) return;
    try {
      setDest((prev: any) => ({ ...prev, gallery: [...(prev.gallery || []), photoUrl] }));
      setPhotoSuccess(true);
      setPhotoUrl('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !reviewComment.trim()) return;
    try {
      const res = await createDestinationReview(id, {
        rating: reviewRating,
        comment: reviewComment
      });
      // Refresh reviews list
      const updatedReviewsRes = await getDestinationReviews(id);
      setReviews(updatedReviewsRes.items.map((r: any) => ({
        id: r.id,
        userId: r.userId,
        userName: r.userName,
        itemId: r.destinationId,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt
      })));
      setShowReviewModal(false);
      setReviewComment('');
      
      // Refresh destination data
      const updatedDest = await getDestinationById(id);
      setDest(mapDestinationApiToDestination(updatedDest));
    } catch (err: any) {
      console.error('Failed to submit review:', err);
      alert(err.message || (language === 'ar' ? 'حدث خطأ أثناء إضافة المراجعة' : 'Failed to submit review'));
    }
  };

  const closePlanner = () => {
    setShowPlannerModal(false);
    setPlannerSuccess(false);
    setTripDate('');
    setTravelers('1');
    window.dispatchEvent(new Event('storage'));
  };

  if (!dest) return <div className="pt-24 text-center font-bold text-slate-800">{t('destNotFound')}</div>;

  const BackIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;
  const isLiked = liked[dest.id] || false;
  
  const nameText = language === 'ar' ? dest.nameAr || dest.name : dest.nameEn || dest.name;
  const descriptionText = language === 'ar' ? dest.descriptionAr || dest.description : dest.descriptionEn || dest.description;
  const distanceText = language === 'ar' ? dest.distanceAr || dest.distance : dest.distanceEn || dest.distance;
  const categoryText = language === 'ar' ? t(dest.category.toLowerCase()) : dest.category;

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <div className="relative h-[60vh] w-full rounded-b-[40px] overflow-hidden shadow-lg">
        <img 
          src={dest.image} 
          alt={nameText} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10 pt-20">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-primary shadow-sm hover:scale-105 transition-transform cursor-pointer border-none"
          >
            <BackIcon className="w-6 h-6" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleToggleCompare}
              className={`w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm hover:scale-105 transition-transform cursor-pointer border-none ${
                inCompare ? 'text-secondary' : 'text-slate-650'
              }`}
            >
              <Columns className="w-5 h-5" />
            </button>
            <button 
              onClick={toggleLike}
              className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-primary shadow-sm hover:scale-105 transition-transform cursor-pointer border-none"
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
            </button>
          </div>
        </div>

        <div className={`absolute bottom-10 ${dir === 'rtl' ? 'right-6 text-right' : 'left-6 text-left'} right-6 z-10 text-white`}>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-3 border border-white/30">
              {categoryText}
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-2">{nameText}</h1>
            <div className="flex items-center gap-3 text-slate-200">
              <span className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-md backdrop-blur-sm text-sm font-bold">
                <Star className="w-4 h-4 fill-highlight text-highlight" /> {dest.rating}
              </span>
              <span className="text-sm font-medium">{dest.reviews || reviews.length} {t('reviews')}</span>
              {distanceText && (
                <span className="text-sm font-medium flex items-center gap-1"><MapPin className="w-4 h-4"/> {distanceText}</span>
              )}
            </div>
        </div>
      </div>

      <div className="px-6 py-8 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-8">
          {/* Main Description */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[32px] p-6 md:p-8 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-primary mb-3">{t('about')}</h2>
              <p className="text-slate-600 leading-relaxed font-light text-sm">
                {descriptionText}
              </p>
            </div>

            {dest.gallery && dest.gallery.length > 0 && (
              <div>
                <h2 className="text-xl font-bold tracking-tight text-primary mb-3">{t('gallery')}</h2>
                <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                  {dest.gallery.map((img: string, i: number) => (
                    <img 
                      key={i} 
                      src={img} 
                      alt={`${nameText} ${i}`} 
                      className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover shrink-0 shadow-sm border border-slate-200"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions Side panel */}
          <div className="bg-slate-900 text-white rounded-[32px] p-6 shadow-xl border border-slate-800 flex flex-col gap-4.5">
            <h3 className="font-extrabold text-sm text-slate-100 uppercase pb-2.5 border-b border-white/10 tracking-widest">{language === 'ar' ? 'مساهمة المجتمع' : 'Community Actions'}</h3>
            
            <button
              onClick={() => { setShowEditModal(true); setEditSuccess(false); }}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-white/15 cursor-pointer"
            >
              <Edit className="w-4.5 h-4.5 text-secondary" />
              {t('suggestEdit')}
            </button>

            <button
              onClick={() => { setShowReportModal(true); setReportSuccess(false); }}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-white/15 cursor-pointer"
            >
              <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />
              {t('reportWrong')}
            </button>

            <button
              onClick={() => { setShowPhotoModal(true); setPhotoSuccess(false); }}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-white/15 cursor-pointer"
            >
              <Upload className="w-4.5 h-4.5 text-emerald-400" />
              {language === 'ar' ? 'رفع صور حقيقية للمكان' : 'Upload Real Photos'}
            </button>
          </div>
        </div>

        {id && <TripProgress destinationId={id} />}

        {/* 5-Dimensions Reviews Section */}
        <div className="bg-white border border-slate-200 rounded-[32px] p-6 md:p-8 mb-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold tracking-tight text-primary flex items-center gap-2">
              <MessageSquare className="w-5.5 h-5.5 text-secondary" />
              {language === 'ar' ? 'التقييمات وآراء الزوار' : 'Visitor Reviews'}
            </h3>
            <button
              onClick={() => setShowReviewModal(true)}
              className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-sm hover:scale-[1.01] transition-transform border-none cursor-pointer"
            >
              {language === 'ar' ? 'اكتب تقييماً' : 'Write Review'}
            </button>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-10 text-slate-450 font-bold text-xs">
              {language === 'ar' ? 'لا توجد تقييمات بعد لهذا المكان. كن أول من يكتب تقييماً!' : 'No reviews written yet. Be the first to share your experience!'}
            </div>
          ) : (
            <div className="flex flex-col gap-6 divide-y divide-slate-100">
              {reviews.map((rev) => (
                <div key={rev.id} className="pt-5 first:pt-0">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <div>
                      <span className="font-extrabold text-slate-800 text-sm block">{rev.userName}</span>
                      <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full shrink-0">
                      <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                      {rev.rating}
                    </div>
                  </div>

                  <p className="text-slate-600 text-xs leading-relaxed font-light mb-3">{rev.comment}</p>
                  
                  {/* Detailed dimensions display */}
                  <div className="flex flex-wrap gap-2.5">
                    {rev.cleanlinessRating && (
                      <span className="text-[9px] font-bold bg-slate-50 border border-slate-150 px-2 py-0.5 rounded-lg text-slate-550">
                        {t('cleanliness')}: {rev.cleanlinessRating}/5
                      </span>
                    )}
                    {rev.safetyRating && (
                      <span className="text-[9px] font-bold bg-slate-50 border border-slate-150 px-2 py-0.5 rounded-lg text-slate-550">
                        {t('safety')}: {rev.safetyRating}/5
                      </span>
                    )}
                    {rev.priceRating && (
                      <span className="text-[9px] font-bold bg-slate-50 border border-slate-150 px-2 py-0.5 rounded-lg text-slate-550">
                        {t('price')}: {rev.priceRating}/5
                      </span>
                    )}
                    {rev.serviceRating && (
                      <span className="text-[9px] font-bold bg-slate-50 border border-slate-150 px-2 py-0.5 rounded-lg text-slate-550">
                        {t('service')}: {rev.serviceRating}/5
                      </span>
                    )}
                    {rev.crowdRating && (
                      <span className="text-[9px] font-bold bg-slate-50 border border-slate-150 px-2 py-0.5 rounded-lg text-slate-550">
                        {t('crowding')}: {rev.crowdRating}/5
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Explore Services section */}
        <h3 className="text-xl font-bold text-primary mb-4 px-2 tracking-tight">
          {language === 'ar' ? `استكشف خدمات ${nameText}` : `Explore services in ${nameText}`}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Hotel, label: t('hotels'), color: 'bg-blue-100 text-secondary' },
            { icon: Coffee, label: t('restaurants'), color: 'bg-amber-100 text-highlight' },
            { icon: Compass, label: t('tours'), color: 'bg-emerald-100 text-accent' },
            { icon: Calendar, label: t('events'), color: 'bg-purple-100 text-purple-600' },
          ].map((item, i) => (
            <motion.button 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * i }}
              className="bg-white border border-slate-200 rounded-[24px] p-4 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center`}>
                <item.icon className="w-6 h-6" />
              </div>
              <span className="font-bold text-sm text-slate-700">{item.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Nearby Places Sections */}
        {(() => {
          const coords = (() => {
            if (dest?.latitude && dest?.longitude) {
              return { lat: dest.latitude, lng: dest.longitude };
            }
            const name = (dest?.nameEn || dest?.name || '').toLowerCase();
            if (name.includes('riyadh') || name.includes('الرياض') || id === 'riyadh') return { lat: 24.7136, lng: 46.6753 };
            if (name.includes('jeddah') || name.includes('جدة') || id === 'jeddah') return { lat: 21.5433, lng: 39.1728 };
            if (name.includes('alula') || name.includes('العلا') || id === 'alula') return { lat: 26.6083, lng: 37.9186 };
            if (name.includes('abha') || name.includes('أبها') || id === 'abha') return { lat: 18.2164, lng: 42.5053 };
            if (name.includes('taif') || name.includes('الطائف') || id === 'taif') return { lat: 21.2639, lng: 40.4072 };
            if (name.includes('neom') || name.includes('نيوم') || id === 'neom') return { lat: 28.2831, lng: 35.6312 };
            return { lat: 24.7136, lng: 46.6753 };
          })();

          return (
            <div className="flex flex-col gap-8 mb-20 mt-4 border-t border-slate-100 pt-8">
              <NearbyPlacesSection 
                latitude={coords.lat} 
                longitude={coords.lng} 
                type="hotels" 
                onViewDetails={setSelectedPlaceId} 
              />
              <NearbyPlacesSection 
                latitude={coords.lat} 
                longitude={coords.lng} 
                type="restaurants" 
                onViewDetails={setSelectedPlaceId} 
              />
              <NearbyPlacesSection 
                latitude={coords.lat} 
                longitude={coords.lng} 
                type="cafes" 
                onViewDetails={setSelectedPlaceId} 
              />
            </div>
          );
        })()}
      </div>
      
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40">
        <motion.button 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onClick={() => setShowPlannerModal(true)}
          className="bg-primary text-white px-10 py-4 rounded-full font-bold shadow-xl flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer border-none"
        >
          {t('planTrip')}
        </motion.button>
      </div>

      {/* Plan Trip Modal Dialog */}
      <AnimatePresence>
        {showPlannerModal && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePlanner}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden relative z-10 border border-slate-100"
            >
              {plannerSuccess ? (
                <div className="p-8 text-center flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-2">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-primary">{t('tripPlanSuccess')}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4">
                    {t('tripPlanSuccessDesc')}
                  </p>
                  <button 
                    onClick={closePlanner}
                    className="w-full py-4 bg-primary text-white font-bold rounded-full shadow-md hover:bg-opacity-95 transition-all cursor-pointer border-none"
                  >
                    {t('ok')}
                  </button>
                </div>
              ) : (
                <div className="p-6 flex flex-col gap-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{t('planTrip')}</span>
                      <h3 className="text-2xl font-black text-primary">{nameText}</h3>
                    </div>
                    <button 
                      onClick={closePlanner}
                      className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer border-none"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handlePlanSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-secondary" />
                        {language === 'ar' ? 'تاريخ السفر' : 'Travel Date'}
                      </label>
                      <input 
                        type="date"
                        required
                        value={tripDate}
                        onChange={(e) => setTripDate(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-secondary focus:border-transparent outline-none bg-slate-50"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-secondary" />
                        {language === 'ar' ? 'عدد المسافرين' : 'Travelers'}
                      </label>
                      <select
                        value={travelers}
                        onChange={(e) => setTravelers(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-secondary focus:border-transparent outline-none bg-slate-50"
                      >
                        <option value="1">1 {language === 'ar' ? 'مسافر' : 'Traveler'}</option>
                        <option value="2">2 {language === 'ar' ? 'مسافران' : 'Travelers'}</option>
                        <option value="3">3 {language === 'ar' ? 'مسافرين' : 'Travelers'}</option>
                        <option value="4+">4+ {language === 'ar' ? 'عائلة / مجموعة' : 'Family / Group'}</option>
                      </select>
                    </div>

                    <button 
                      type="submit"
                      className="w-full h-14 bg-primary text-white font-bold rounded-full shadow-md hover:shadow-lg hover:scale-[1.01] transition-all mt-2 cursor-pointer border-none"
                    >
                      {t('planTrip')}
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Suggest Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEditModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden relative z-10 p-6 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-black text-primary">{t('suggestEdit')}</h3>
                <button onClick={() => setShowEditModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border-none cursor-pointer"><X className="w-4 h-4" /></button>
              </div>
              {editSuccess ? (
                <div className="text-center py-4 text-emerald-600 font-bold flex flex-col items-center gap-2">
                  <CheckCircle className="w-10 h-10" />
                  <span>{language === 'ar' ? 'تم إرسال اقتراح التعديل بنجاح!' : 'Edit proposal submitted!'}</span>
                </div>
              ) : (
                <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
                  <label className="text-xs font-bold text-slate-500">{language === 'ar' ? 'التعديلات المقترحة' : 'Correction details'}</label>
                  <textarea required rows={4} value={editProposal} onChange={(e) => setEditProposal(e.target.value)} placeholder={language === 'ar' ? 'اكتب التفاصيل الصحيحة للمكان هنا...' : 'Explain the correct details or operating hours...'} className="w-full p-4 rounded-xl border border-slate-200 text-sm outline-none bg-slate-50 focus:ring-2 focus:ring-secondary resize-none" />
                  <button type="submit" className="w-full h-12 bg-primary text-white font-bold rounded-xl border-none cursor-pointer">{language === 'ar' ? 'إرسال التعديل' : 'Submit Proposal'}</button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowReportModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden relative z-10 p-6 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-black text-primary">{t('reportWrong')}</h3>
                <button onClick={() => setShowReportModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border-none cursor-pointer"><X className="w-4 h-4" /></button>
              </div>
              {reportSuccess ? (
                <div className="text-center py-4 text-emerald-600 font-bold flex flex-col items-center gap-2">
                  <CheckCircle className="w-10 h-10" />
                  <span>{language === 'ar' ? 'تم الإبلاغ بنجاح! شكراً لك.' : 'Report sent successfully!'}</span>
                </div>
              ) : (
                <form onSubmit={handleReportSubmit} className="flex flex-col gap-4">
                  <label className="text-xs font-bold text-slate-500">{language === 'ar' ? 'سبب الإبلاغ' : 'Reason for report'}</label>
                  <select value={reportReason} onChange={(e) => setReportReason(e.target.value)} className="h-11 px-3.5 rounded-xl border border-slate-200 text-xs outline-none bg-slate-50">
                    <option value="Closed permanently">{language === 'ar' ? 'مغلق نهائياً' : 'Closed permanently'}</option>
                    <option value="Incorrect details">{language === 'ar' ? 'معلومات خاطئة' : 'Incorrect details'}</option>
                    <option value="Wrong coordinates">{language === 'ar' ? 'موقع خاطئ على الخريطة' : 'Wrong coordinates'}</option>
                  </select>
                  <textarea rows={3} value={reportDetails} onChange={(e) => setReportDetails(e.target.value)} placeholder={language === 'ar' ? 'تفاصيل إضافية...' : 'Any extra details...'} className="w-full p-4 rounded-xl border border-slate-200 text-sm outline-none bg-slate-50 focus:ring-2 focus:ring-secondary resize-none" />
                  <button type="submit" className="w-full h-12 bg-primary text-white font-bold rounded-xl border-none cursor-pointer">{language === 'ar' ? 'إرسال الإبلاغ' : 'Submit Report'}</button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Photo Upload Modal */}
      <AnimatePresence>
        {showPhotoModal && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPhotoModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden relative z-10 p-6 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-black text-primary">{language === 'ar' ? 'رفع صور حقيقية' : 'Upload Photos'}</h3>
                <button onClick={() => setShowPhotoModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border-none cursor-pointer"><X className="w-4 h-4" /></button>
              </div>
              {photoSuccess ? (
                <div className="text-center py-4 text-emerald-600 font-bold flex flex-col items-center gap-2">
                  <CheckCircle className="w-10 h-10" />
                  <span>{language === 'ar' ? 'تمت إضافة الصورة لمعرض الصور!' : 'Photo added to gallery!'}</span>
                </div>
              ) : (
                <form onSubmit={handlePhotoSubmit} className="flex flex-col gap-4">
                  <label className="text-xs font-bold text-slate-500">{language === 'ar' ? 'رابط الصورة' : 'Photo URL'}</label>
                  <input type="url" required value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://images.unsplash.com/..." className="h-12 px-4 rounded-xl border border-slate-200 text-sm outline-none bg-slate-50 focus:ring-2 focus:ring-secondary" />
                  <button type="submit" className="w-full h-12 bg-primary text-white font-bold rounded-xl border-none cursor-pointer">{language === 'ar' ? 'إضافة الصورة' : 'Submit Photo'}</button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5-Dimensional Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowReviewModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden relative z-10 p-6 flex flex-col gap-4 max-h-[85vh] overflow-y-auto hide-scrollbar">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-black text-primary">{language === 'ar' ? 'كتابة تقييم خماسي الأبعاد' : 'Write 5-D Review'}</h3>
                <button onClick={() => setShowReviewModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border-none cursor-pointer"><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
                
                {/* Total Rating */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('rating')}</label>
                  <select value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))} className="h-10 px-3 rounded-xl border border-slate-200 text-xs">
                    {[5, 4, 3, 2, 1].map(v => <option key={v} value={v}>{v} {language === 'ar' ? 'نجوم' : 'stars'}</option>)}
                  </select>
                </div>

                {/* 1. Cleanliness */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>{t('cleanliness')} (النظافة)</span>
                    <span>{reviewCleanliness}/5</span>
                  </div>
                  <input type="range" min="1" max="5" value={reviewCleanliness} onChange={(e) => setReviewCleanliness(Number(e.target.value))} className="w-full accent-secondary" />
                </div>

                {/* 2. Safety */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>{t('safety')} (الأمان)</span>
                    <span>{reviewSafety}/5</span>
                  </div>
                  <input type="range" min="1" max="5" value={reviewSafety} onChange={(e) => setReviewSafety(Number(e.target.value))} className="w-full accent-secondary" />
                </div>

                {/* 3. Price */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>{t('price')} (مستوى الأسعار)</span>
                    <span>{reviewPrice}/5</span>
                  </div>
                  <input type="range" min="1" max="5" value={reviewPrice} onChange={(e) => setReviewPrice(Number(e.target.value))} className="w-full accent-secondary" />
                </div>

                {/* 4. Service */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>{t('service')} (مستوى الخدمات)</span>
                    <span>{reviewService}/5</span>
                  </div>
                  <input type="range" min="1" max="5" value={reviewService} onChange={(e) => setReviewService(Number(e.target.value))} className="w-full accent-secondary" />
                </div>

                {/* 5. Crowding */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>{t('crowding')} (مستوى الازدحام)</span>
                    <span>{reviewCrowding}/5</span>
                  </div>
                  <input type="range" min="1" max="5" value={reviewCrowding} onChange={(e) => setReviewCrowding(Number(e.target.value))} className="w-full accent-secondary" />
                </div>

                {/* Comment */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">{language === 'ar' ? 'التعليق والملحوظات' : 'Review comment'}</label>
                  <textarea required rows={3} value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder={language === 'ar' ? 'اكتب تجربتك بالتفصيل هنا...' : 'Write your comment here...'} className="w-full p-3.5 rounded-xl border border-slate-200 text-xs outline-none bg-slate-50 resize-none focus:ring-2 focus:ring-secondary" />
                </div>

                <button type="submit" className="w-full h-12 bg-primary text-white font-bold rounded-xl border-none cursor-pointer">{language === 'ar' ? 'نشر التقييم' : 'Publish Review'}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
const Columns = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>
);
export { Columns };

