import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { PlacesApiError } from '../services/placesApi';

interface Props {
  error: PlacesApiError;
  onRetry: () => void;
}

export default function PlacesErrorState({ error, onRetry }: Props) {
  const { language } = useLanguage();
  
  const isServiceDown = error.code === 'OSM_SERVICE_UNAVAILABLE';

  let title = language === 'ar' ? 'فشل تحميل البيانات' : 'Failed to Load Places';
  let message = language === 'ar' 
    ? 'حدث خطأ غير متوقع أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى.' 
    : 'An unexpected error occurred while communicating with the server. Please try again.';

  if (isServiceDown) {
    title = language === 'ar' ? 'خدمة الخرائط غير متاحة مؤقتاً' : 'Map Service Unavailable';
    message = language === 'ar'
      ? 'خدمة OpenStreetMap / Overpass غير متاحة مؤقتاً. يرجى إعادة المحاولة بعد قليل.'
      : 'OpenStreetMap / Overpass API is temporarily unavailable. Please retry in a few moments.';
  }

  return (
    <div className="w-full bg-red-50/50 border border-red-100 rounded-[28px] p-8 text-center flex flex-col items-center justify-center gap-3.5 my-3">
      <div className="w-12 h-12 bg-red-100/80 rounded-full flex items-center justify-center text-red-600 mb-1">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h4 className="font-extrabold text-slate-800 text-lg leading-tight">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm leading-relaxed font-light">{message}</p>
      
      <button
        onClick={onRetry}
        className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full shadow-sm transition-all hover:scale-[1.02] active:scale-95 border-none cursor-pointer"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>{language === 'ar' ? 'إعادة المحاولة' : 'Try Again'}</span>
      </button>
    </div>
  );
}
