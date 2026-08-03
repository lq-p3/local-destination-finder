import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Unauthorized() {
  const { language, dir } = useLanguage();
  const BackIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen pt-28 pb-20 px-6 max-w-xl mx-auto text-center flex flex-col items-center justify-center gap-4" dir={dir}>
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-2">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-black text-slate-900">
        {language === 'ar' ? 'غير مصرح بالوصول' : 'Access Denied'}
      </h1>
      <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
        {language === 'ar' 
          ? 'عذراً، ليس لديك الصلاحية الكافية للوصول إلى هذه الصفحة. يرجى التواصل مع المسؤول أو تسجيل الدخول بحساب صاحب صلاحية.' 
          : 'Sorry, you do not have permission to access this page. Please contact an admin or log in with an authorized account.'}
      </p>
      <Link 
        to="/" 
        className="mt-3 inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-xs font-bold rounded-full shadow-md hover:bg-slate-800 transition-all border-none"
      >
        <span>{language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}</span>
        <BackIcon className="w-4 h-4" />
      </Link>
    </div>
  );
}
