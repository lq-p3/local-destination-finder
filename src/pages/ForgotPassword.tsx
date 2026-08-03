import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Mail, ArrowLeft, ArrowRight, KeyRound, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const { t, dir } = useLanguage();
  const ArrowBack = dir === 'rtl' ? ArrowRight : ArrowLeft;

  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError(dir === 'rtl' ? 'الرجاء إدخال البريد الإلكتروني' : 'Please enter your email');
      return;
    }
    setSuccess(true);
    setError('');
  };

  if (success) {
    return (
      <div className="bg-white border border-slate-200 shadow-sm rounded-[32px] p-8 flex flex-col gap-6 text-center">
        <div className="flex justify-center mb-2">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
            <CheckCircle className="w-8 h-8" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-primary tracking-tight mb-2">
            {dir === 'rtl' ? 'تم إرسال الرابط!' : 'Link Sent!'}
          </h1>
          <p className="text-slate-500 font-medium text-sm leading-relaxed">
            {dir === 'rtl' 
              ? `لقد أرسلنا تعليمات استعادة كلمة المرور إلى ${email}`
              : `We have sent password reset instructions to ${email}`
            }
          </p>
        </div>
        <Link to="/login" className="w-full h-14 mt-4 bg-primary text-white rounded-full font-bold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
          {t('backToLogin')}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-[32px] p-8 flex flex-col gap-6 relative">
      
      <div className="flex justify-center mb-2">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-secondary">
          <KeyRound className="w-8 h-8" />
        </div>
      </div>

      <div className="text-center mb-2">
        <h1 className="text-3xl font-extrabold text-primary tracking-tight mb-2">{t('resetPassword')}</h1>
        <p className="text-slate-500 font-medium">{t('resetPasswordDesc')}</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 text-xs font-semibold p-3.5 rounded-2xl border border-red-100 text-center">
          {error}
        </div>
      )}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="relative">
          <div className={`absolute top-0 bottom-0 ${dir === 'rtl' ? 'right-4' : 'left-4'} flex items-center pointer-events-none text-slate-400`}>
            <Mail className="w-5 h-5" />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            placeholder={t('email')}
            className={`w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl text-sm ${dir === 'rtl' ? 'pr-12 pl-4' : 'pl-12 pr-4'} focus:ring-2 focus:ring-secondary focus:bg-white outline-none transition-all`}
          />
        </div>

        <button type="submit" className="w-full h-14 mt-4 bg-primary text-white rounded-full font-bold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer border-none">
          {t('sendResetLink')}
        </button>
      </form>

      <div className="text-center mt-4">
        <Link to="/login" className="inline-flex items-center gap-2 text-slate-500 font-bold text-sm hover:text-primary transition-colors">
          <ArrowBack className="w-4 h-4" />
          {t('backToLogin')}
        </Link>
      </div>
    </div>
  );
}
