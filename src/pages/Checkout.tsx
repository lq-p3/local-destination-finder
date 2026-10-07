import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  DollarSign, Check, X, ShieldCheck, Ticket, Award, 
  ArrowLeft, CheckCircle, CreditCard, Sparkles 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api';
import { checkoutBooking } from '../api/bookingsApi';
import { createPaymentIntent, confirmDevelopmentPayment } from '../api/paymentsApi';
import { User } from '../types/models';

export default function Checkout() {
  const { t, language, dir } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  // Load router state parameters or fallback to mock defaults
  const state = location.state || {};
  const basePrice = Number(state.basePrice) || 1200;
  const bookingId = state.bookingId || 'mock_bkg_129402';
  const itemName = state.itemName || (language === 'ar' ? 'رحلة البكج السياحي المختار' : 'Selected Tour Package Reservation');

  const [user, setUser] = useState<User | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [pointsRedeem, setPointsRedeem] = useState(0);

  // Calculations states
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    api.auth.me()
      .then(setUser)
      .catch(console.error);
  }, []);

  const handleApplyCoupon = () => {
    if (couponCode === 'LDF2026') {
      setCouponApplied(true);
    } else {
      alert(language === 'ar' ? 'كوبون خصم غير صالح!' : 'Invalid promo code!');
    }
  };

  const handleClearCoupon = () => {
    setCouponCode('');
    setCouponApplied(false);
  };

  // Live calculations preview
  const couponDiscount = couponApplied ? Math.round(basePrice * 0.10) : 0;
  const pointsDiscount = Math.round(pointsRedeem / 10);
  const totalDiscount = couponDiscount + pointsDiscount;
  const discountedPrice = Math.max(0, basePrice - totalDiscount);
  const taxes = Math.round(discountedPrice * 0.15);
  const totalPrice = discountedPrice + taxes;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const realBookingId = bookingId.startsWith('mock') ? undefined : bookingId;
      const res = await checkoutBooking({
        basePrice,
        couponCode: couponApplied ? 'LDF2026' : undefined,
        pointsToRedeem: pointsRedeem > 0 ? pointsRedeem : undefined,
        bookingId: realBookingId
      });

      if (realBookingId) {
        const intent = await createPaymentIntent(realBookingId);
        await confirmDevelopmentPayment(intent.paymentId);
      }

      setResult(res);
      setCheckoutSuccess(true);
    } catch (err: any) {
      alert(err.message || 'Checkout failed.');
    }
  };

  return (
    <div className="pt-24 px-6 max-w-4xl mx-auto min-h-screen pb-28" dir={dir}>
      <header className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-xs font-bold text-secondary hover:underline flex items-center gap-1 mb-2 border-none bg-transparent cursor-pointer"
        >
          {dir === 'rtl' ? <ArrowLeft className="w-4 h-4 rotate-180" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{language === 'ar' ? 'العودة' : 'Back'}</span>
        </button>
        <h1 className="text-3xl font-black text-primary flex items-center gap-2">
          <CreditCard className="w-8 h-8 text-secondary shrink-0" />
          {language === 'ar' ? 'إتمام الدفع الآمن' : 'Secure Checkout'}
        </h1>
        <p className="text-slate-500 text-xs font-light mt-1.5">
          {language === 'ar'
            ? 'تطبيق كوبونات التخفيض، خصم نقاط المحفظة، وتأكيد حجز التذكرة الإلكترونية.'
            : 'Apply coupons, redeem loyalty points, and purchase your ticket.'
          }
        </p>
      </header>

      {checkoutSuccess ? (
        /* Checkout Success Screen */
        <div className="bg-white border border-slate-200 shadow-sm rounded-[32px] p-8 text-center flex flex-col items-center gap-5 max-w-md mx-auto">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black text-primary">{language === 'ar' ? 'تم الدفع بنجاح!' : 'Payment Completed!'}</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            {language === 'ar'
              ? `تم تأكيد حجزك لـ "${itemName}". تم خصم المبلغ وإنشاء كود التذكرة الفعال.`
              : `Your ticket for "${itemName}" has been successfully booked.`
            }
          </p>

          <div className="w-full bg-slate-50 border border-slate-150 rounded-2xl p-4.5 text-xs text-slate-650 space-y-2 text-right dir-ltr:text-left">
            <span className="font-extrabold text-[9px] text-slate-400 uppercase tracking-widest block pb-1 border-b border-slate-200">{language === 'ar' ? 'تفاصيل الفاتورة والنقاط' : 'Invoice details'}</span>
            <div className="flex justify-between">
              <span>{language === 'ar' ? 'المبلغ الإجمالي المدفوع' : 'Total Amount Paid'}</span>
              <span className="font-black text-secondary">{result?.totalPrice} SAR</span>
            </div>
            <div className="flex justify-between">
              <span>{language === 'ar' ? 'النقاط المكتسبة من العملية' : 'Points Earned'}</span>
              <span className="font-black text-secondary">+{result?.pointsEarned} {t('points')}</span>
            </div>
            <div className="flex justify-between">
              <span>{language === 'ar' ? 'رصيد نقاط محفظتك الجديد' : 'New Points Balance'}</span>
              <span className="font-black text-slate-700">{result?.newUserPoints} {t('points')}</span>
            </div>
          </div>

          <div className="flex gap-3.5 w-full mt-2">
            <button
              onClick={() => navigate('/bookings')}
              className="flex-1 py-3.5 bg-primary text-white font-bold text-xs rounded-xl shadow-md border-none cursor-pointer"
            >
              {language === 'ar' ? 'الذهاب لحجوزاتي' : 'View Tickets'}
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-3.5 bg-slate-100 text-slate-750 font-bold text-xs rounded-xl border border-slate-250 cursor-pointer"
            >
              {language === 'ar' ? 'الرئيسية' : 'Go Home'}
            </button>
          </div>
        </div>
      ) : (
        /* Checkout Form & Invoice calculations */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Coupon and Loyalty points selections */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Reservation Summary */}
            <div className="bg-white border border-slate-200 rounded-[28px] p-5.5 shadow-sm">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{language === 'ar' ? 'ملخص الخدمة المحددة' : 'Selected Item'}</span>
              <h3 className="font-extrabold text-slate-800 text-sm mt-1">{itemName}</h3>
              <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">ID: {bookingId}</span>
            </div>

            {/* Coupon Promo code input */}
            <div className="bg-white border border-slate-200 rounded-[28px] p-6 shadow-sm flex flex-col gap-3">
              <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                <Ticket className="w-5 h-5 text-secondary" />
                {language === 'ar' ? 'كوبون الخصم' : 'Apply Promo Code'}
              </h3>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  disabled={couponApplied}
                  placeholder={language === 'ar' ? 'أدخل الكود (مثال: LDF2026)' : 'Enter Code (e.g. LDF2026)'}
                  className="flex-1 h-11 px-3.5 border border-slate-200 rounded-xl text-xs bg-slate-50 outline-none uppercase font-bold disabled:opacity-60"
                />
                {couponApplied ? (
                  <button
                    onClick={handleClearCoupon}
                    className="px-4 bg-red-50 text-red-500 border border-red-100 rounded-xl font-bold text-xs cursor-pointer"
                  >
                    {language === 'ar' ? 'حذف' : 'Remove'}
                  </button>
                ) : (
                  <button
                    onClick={handleApplyCoupon}
                    className="px-4.5 bg-primary text-white font-bold text-xs rounded-xl shadow-sm border-none cursor-pointer"
                  >
                    {language === 'ar' ? 'تطبيق' : 'Apply'}
                  </button>
                )}
              </div>
              {couponApplied && (
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'تم تطبيق خصم 10% بنجاح!' : '10% Coupon applied successfully!'}</span>
                </span>
              )}
            </div>

            {/* Loyalty points discount slider */}
            {user && user.points > 0 && (
              <div className="bg-white border border-slate-200 rounded-[28px] p-6 shadow-sm flex flex-col gap-3">
                <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <Award className="w-5 h-5 text-secondary animate-pulse" />
                  {language === 'ar' ? 'استخدام نقاط الولاء' : 'Redeem Points'}
                </h3>
                <span className="text-[10px] font-semibold text-slate-450 block">
                  {language === 'ar'
                    ? `رصيد نقاطك الحالي: ${user.points} نقطة. (كل 100 نقطة توفر خصم بقيمة 10 ريال).`
                    : `Available Points: ${user.points} points. (Redeem 100 points for 10 SAR discount).`
                  }
                </span>

                <div className="flex flex-col gap-2 mt-2">
                  <input
                    type="range"
                    min="0"
                    max={Math.min(user.points, 1000)} // max 1000 points redeem
                    step="100"
                    value={pointsRedeem}
                    onChange={e => setPointsRedeem(Number(e.target.value))}
                    className="w-full accent-secondary"
                  />
                  <div className="flex justify-between text-[11px] font-black text-slate-700">
                    <span>{language === 'ar' ? 'النقاط المستردة:' : 'Points to Redeem:'} {pointsRedeem}</span>
                    <span className="text-secondary">-{pointsDiscount} SAR</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Pricing Invoice totals box */}
          <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm flex flex-col gap-6">
            <h3 className="font-extrabold text-sm text-slate-800 border-b border-slate-100 pb-2.5">{t('invoice') || 'Receipt'}</h3>

            <div className="space-y-3 text-xs font-semibold text-slate-650">
              <div className="flex justify-between">
                <span>{language === 'ar' ? 'السعر الأساسي' : 'Base Price'}</span>
                <span>{basePrice} SAR</span>
              </div>
              
              {couponApplied && (
                <div className="flex justify-between text-emerald-600">
                  <span>{language === 'ar' ? 'خصم الكوبون (10%)' : 'Coupon Discount (10%)'}</span>
                  <span>-{couponDiscount} SAR</span>
                </div>
              )}

              {pointsRedeem > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>{language === 'ar' ? 'خصم نقاط المحفظة' : 'Points Discount'}</span>
                  <span>-{pointsDiscount} SAR</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>{language === 'ar' ? 'ضريبة القيمة المضافة (15%)' : 'VAT (15%)'}</span>
                <span>{taxes} SAR</span>
              </div>

              <div className="flex justify-between font-black text-secondary text-base pt-3 border-t border-slate-100">
                <span>{language === 'ar' ? 'الإجمالي الكلي' : 'Total Price'}</span>
                <span>{totalPrice} SAR</span>
              </div>
            </div>

            <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-2xl text-[10px] text-slate-600 leading-relaxed font-semibold flex items-start gap-2 select-none">
              <Sparkles className="w-4.5 h-4.5 text-secondary shrink-0 mt-0.5" />
              <span>
                {language === 'ar'
                  ? `ستكسب +${Math.round(totalPrice * 0.10)} نقطة ولاء من هذه العملية لإضافتها لمحفظتك.`
                  : `You will receive +${Math.round(totalPrice * 0.10)} loyalty points from this purchase.`
                }
              </span>
            </div>

            <form onSubmit={handleCheckoutSubmit}>
              <button
                type="submit"
                className="w-full h-14 bg-primary text-white font-bold text-xs rounded-full shadow-md hover:scale-[1.01] transition-transform border-none cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-5 h-5 text-secondary" />
                {language === 'ar' ? 'دفع وتأكيد الحجز' : 'Pay & Confirm Reservation'}
              </button>
            </form>
          </div>

        </div>
      )}
    </div>
  );
}
