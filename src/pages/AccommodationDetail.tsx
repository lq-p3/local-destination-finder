import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Hotel, MapPin, Star, ChevronLeft, ChevronRight, Heart, 
  ShieldCheck, Coffee, Navigation, Wind, Users, CheckCircle, X, Calendar 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api';
import { Accommodation, RoomOption } from '../types/models';

export default function AccommodationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language, dir } = useLanguage();

  const [hotel, setHotel] = useState<Accommodation | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('liked-accommodations');
    return saved ? JSON.parse(saved) : {};
  });

  // Booking states
  const [selectedRoom, setSelectedRoom] = useState<RoomOption | null>(null);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.accommodations.get(id)
      .then(setHotel)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!hotel) return;
    const updated = { ...liked, [hotel.id]: !liked[hotel.id] };
    setLiked(updated);
    localStorage.setItem('liked-accommodations', JSON.stringify(updated));
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotel || !selectedRoom || !checkInDate || !checkOutDate) return;

    try {
      await api.bookings.create({
        type: 'accommodation',
        itemId: hotel.id,
        roomId: selectedRoom.id,
        startDate: checkInDate,
        endDate: checkOutDate
      });
      setBookingSuccess(true);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-40">
        <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (!hotel) {
    return <div className="pt-24 text-center font-bold text-slate-800">{t('destNotFound')}</div>;
  }

  const BackIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;
  const isLiked = liked[hotel.id] || false;
  const name = language === 'ar' ? hotel.nameAr : hotel.nameEn;
  const desc = language === 'ar' ? hotel.descriptionAr : hotel.descriptionEn;

  return (
    <div className="min-h-screen bg-slate-50" dir={dir}>
      {/* Cover Image Header */}
      <div className="relative h-[55vh] w-full rounded-b-[40px] overflow-hidden shadow-sm">
        <img 
          src={hotel.images[0]} 
          alt={name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"></div>

        <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10 pt-20">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/95 flex items-center justify-center text-primary shadow-sm hover:scale-105 transition-transform cursor-pointer border-none"
          >
            <BackIcon className="w-6 h-6" />
          </button>
          <button 
            onClick={toggleLike}
            className="w-10 h-10 rounded-full bg-white/95 flex items-center justify-center text-primary shadow-sm hover:scale-105 transition-transform cursor-pointer border-none"
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
          </button>
        </div>

        <div className={`absolute bottom-8 ${dir === 'rtl' ? 'right-6 text-right' : 'left-6 text-left'} right-6 z-10 text-white`}>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-3 border border-white/30">
              <Hotel className="w-3.5 h-3.5" />
              <span>{hotel.type.toUpperCase()}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-2">{name}</h1>
            <div className="flex items-center gap-3 text-slate-200">
              <span className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-md text-sm font-bold">
                <Star className="w-4 h-4 fill-highlight text-highlight" /> {hotel.rating}
              </span>
              <span className="text-sm font-medium">{hotel.reviewsCount} {t('reviews')}</span>
              <span className="text-sm font-medium flex items-center gap-1"><MapPin className="w-4 h-4"/> {hotel.cityId}</span>
            </div>
        </div>
      </div>

      <div className="px-6 py-8 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* About Accommodation Card */}
          <div className="bg-white border border-slate-200 rounded-[32px] p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold tracking-tight text-primary mb-3.5">{t('about')}</h2>
            <p className="text-slate-600 leading-relaxed font-light text-sm">
              {desc}
            </p>

            <h3 className="text-sm font-extrabold text-slate-800 mt-6 mb-3">{language === 'ar' ? 'المرافق والخدمات' : 'Amenities & Facilities'}</h3>
            <div className="grid grid-cols-2 gap-3.5">
              {(language === 'ar' ? hotel.facilitiesAr : hotel.facilitiesEn).map((fac, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs text-slate-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-secondary shrink-0"></span>
                  <span>{fac}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rooms Options list */}
          <div className="bg-white border border-slate-200 rounded-[32px] p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold tracking-tight text-primary mb-5">{t('rooms')}</h2>
            <div className="divide-y divide-slate-100 space-y-5">
              {hotel.rooms.map((room, i) => {
                const roomName = language === 'ar' ? room.nameAr : room.nameEn;
                return (
                  <div key={room.id} className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${i > 0 ? 'pt-5' : ''}`}>
                    <div className="space-y-1.5">
                      <h4 className="font-extrabold text-slate-800 text-sm">{roomName}</h4>
                      <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {room.capacityAdults} {language === 'ar' ? 'بالغين' : 'Adults'}</span>
                        <span>•</span>
                        <span>{room.capacityKids} {language === 'ar' ? 'أطفال' : 'Kids'}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(language === 'ar' ? room.facilitiesAr : room.facilitiesEn).map((f, idx) => (
                          <span key={idx} className="text-[9px] bg-slate-50 border border-slate-150 rounded px-1.5 py-0.5 text-slate-500 font-semibold">{f}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-5">
                      <div className="text-right">
                        <span className="text-base font-black text-secondary">{room.pricePerNight} SAR</span>
                        <span className="text-[10px] text-slate-400 font-bold block">{language === 'ar' ? 'لكل ليلة' : 'per night'}</span>
                      </div>
                      <button
                        onClick={() => { setSelectedRoom(room); setBookingSuccess(false); }}
                        className="px-4.5 py-3.5 bg-primary text-white font-bold text-xs rounded-xl shadow-sm hover:scale-[1.02] transition-transform border-none cursor-pointer"
                      >
                        {t('bookNow')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Side Policies Box */}
        <div className="bg-slate-900 text-white rounded-[32px] p-6 shadow-xl border border-slate-800 space-y-5">
          <h3 className="font-extrabold text-sm text-slate-100 uppercase pb-2.5 border-b border-white/10 tracking-widest">{language === 'ar' ? 'تعليمات الإقامة' : 'Policies'}</h3>
          
          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">{language === 'ar' ? 'تسجيل الدخول' : 'Check-In'}</span>
            <p className="text-xs text-slate-350 mt-1 leading-relaxed">{language === 'ar' ? hotel.checkInPolicyAr : hotel.checkInPolicyEn}</p>
          </div>

          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">{language === 'ar' ? 'تسجيل المغادرة' : 'Check-Out'}</span>
            <p className="text-xs text-slate-350 mt-1 leading-relaxed">{language === 'ar' ? hotel.checkOutPolicyAr : hotel.checkOutPolicyEn}</p>
          </div>

          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">{language === 'ar' ? 'سياسة الإلغاء وحجز الغرفة' : 'Cancellation terms'}</span>
            <p className="text-xs text-slate-350 mt-1 leading-relaxed">{language === 'ar' ? hotel.cancellationPolicyAr : hotel.cancellationPolicyEn}</p>
          </div>
        </div>

      </div>

      {/* Booking Calendar Date Selector Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div onClick={() => setSelectedRoom(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <div className="bg-white border border-slate-200 shadow-2xl rounded-[32px] p-6 max-w-md w-full relative z-10 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{language === 'ar' ? 'اختيار التواريخ' : 'Reserve Room'}</span>
                <h3 className="text-lg font-black text-primary truncate max-w-[280px]">{language === 'ar' ? selectedRoom.nameAr : selectedRoom.nameEn}</h3>
              </div>
              <button
                onClick={() => setSelectedRoom(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border-none cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {bookingSuccess ? (
              <div className="p-6 text-center flex flex-col items-center gap-4">
                <CheckCircle className="w-12 h-12 text-emerald-500" />
                <h4 className="font-extrabold text-sm text-slate-800">{language === 'ar' ? 'تم الحجز بنجاح!' : 'Booking Request Confirmed!'}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {language === 'ar' 
                    ? 'لقد تم حفظ حجز الفندق الخاص بك بنجاح. يمكنك مراجعة الفاتورة في حسابك.' 
                    : 'Your hotel room booking request is recorded. Inspect your invoice in My Bookings.'
                  }
                </p>
                <button
                  onClick={() => { setSelectedRoom(null); navigate('/bookings'); }}
                  className="w-full py-3 bg-primary text-white font-bold text-xs rounded-xl shadow-md border-none cursor-pointer"
                >
                  {language === 'ar' ? 'الذهاب لحجوزاتي' : 'View My Bookings'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500">{language === 'ar' ? 'تاريخ الدخول' : 'Check-In Date'}</label>
                  <input 
                    type="date" 
                    required 
                    value={checkInDate} 
                    onChange={e => setCheckInDate(e.target.value)} 
                    className="h-11 px-3 border border-slate-200 rounded-xl text-xs bg-slate-50 outline-none" 
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500">{language === 'ar' ? 'تاريخ الخروج' : 'Check-Out Date'}</label>
                  <input 
                    type="date" 
                    required 
                    value={checkOutDate} 
                    onChange={e => setCheckOutDate(e.target.value)} 
                    className="h-11 px-3 border border-slate-200 rounded-xl text-xs bg-slate-50 outline-none" 
                  />
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>{language === 'ar' ? 'المبلغ التقديري لليلة' : 'Estimated price/night'}</span>
                  <span className="text-secondary font-black">{selectedRoom.pricePerNight} SAR</span>
                </div>

                <button
                  type="submit"
                  className="w-full h-12 bg-primary text-white font-bold text-xs rounded-xl shadow-md hover:scale-[1.01] transition-transform mt-2 border-none cursor-pointer"
                >
                  {language === 'ar' ? 'تأكيد وحجز الغرفة' : 'Confirm reservation request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
