import { Inbox } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  type: 'hotels' | 'restaurants' | 'cafes';
}

export default function PlacesEmptyState({ type }: Props) {
  const { language } = useLanguage();

  let message = '';
  if (type === 'hotels') {
    message = language === 'ar' ? 'لا توجد فنادق قريبة متاحة حول هذه الوجهة.' : 'No nearby hotels available around this destination.';
  } else if (type === 'restaurants') {
    message = language === 'ar' ? 'لا توجد مطاعم قريبة متاحة حول هذه الوجهة.' : 'No nearby restaurants available around this destination.';
  } else {
    message = language === 'ar' ? 'لا توجد مقاهي قريبة متاحة حول هذه الوجهة.' : 'No nearby cafes available around this destination.';
  }

  return (
    <div className="w-full bg-slate-50/50 border border-slate-100 rounded-[28px] p-10 text-center flex flex-col items-center justify-center gap-3 my-3">
      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-1">
        <Inbox className="w-5 h-5" />
      </div>
      <p className="text-xs text-slate-500 font-medium leading-relaxed">{message}</p>
    </div>
  );
}
