import { useState, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Mail, Lock, ArrowRight, ArrowLeft, Sparkles, Shield, User, Building } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { t, dir, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const from = (location.state as any)?.from?.pathname || '/';

  const handleLoginSubmit = async (userEmail: string, userPass: string) => {
    setError('');
    try {
      await login({ email: userEmail, password: userPass });
      window.dispatchEvent(new Event('storage'));
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(dir === 'rtl' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Invalid email or password');
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError(dir === 'rtl' ? 'الرجاء إدخال البريد الإلكتروني وكلمة المرور' : 'Please enter email and password');
      return;
    }
    handleLoginSubmit(email.trim(), password.trim());
  };

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-[32px] p-8 flex flex-col gap-6 relative max-w-md mx-auto">
      <div className="text-center mb-2">
        <h1 className="text-3xl font-extrabold text-primary tracking-tight mb-2">{t('welcomeBack')}</h1>
        <p className="text-slate-500 font-medium text-xs">{t('loginToContinue')}</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-xs font-semibold p-3.5 rounded-2xl border border-red-100 text-center animate-shake">
          {error}
        </div>
      )}

      {/* Demo Accounts Quick Login Bar */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2 text-center">
        <p className="text-[11px] font-bold text-slate-600 flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          {language === 'ar' ? 'حسابات التجربة السريعة (Demo Login)' : 'Quick Demo Login Accounts'}
        </p>
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => handleLoginSubmit('sarah.travels@example.com', 'Pass@123456')}
            className="px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition shadow-2xs cursor-pointer flex flex-col items-center gap-1"
          >
            <User className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'ar' ? 'مسافر' : 'Traveler'}</span>
          </button>
          <button
            type="button"
            onClick={() => handleLoginSubmit('horizon.travels@example.com', 'Pass@123456')}
            className="px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition shadow-2xs cursor-pointer flex flex-col items-center gap-1"
          >
            <Building className="w-3.5 h-3.5 text-blue-600" />
            <span>{language === 'ar' ? 'مكتب سياحي' : 'Agency'}</span>
          </button>
          <button
            type="button"
            onClick={() => handleLoginSubmit('admin@ldf.com', 'Pass@123456')}
            className="px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 transition shadow-2xs cursor-pointer flex flex-col items-center gap-1"
          >
            <Shield className="w-3.5 h-3.5 text-purple-600" />
            <span>{language === 'ar' ? 'مدير' : 'Admin'}</span>
          </button>
        </div>
      </div>

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
            disabled={isLoading}
            className={`w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl text-sm ${dir === 'rtl' ? 'pr-12 pl-4' : 'pl-12 pr-4'} focus:ring-2 focus:ring-secondary focus:bg-white outline-none transition-all disabled:opacity-50`}
          />
        </div>

        <div className="relative">
          <div className={`absolute top-0 bottom-0 ${dir === 'rtl' ? 'right-4' : 'left-4'} flex items-center pointer-events-none text-slate-400`}>
            <Lock className="w-5 h-5" />
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            placeholder={t('password')}
            disabled={isLoading}
            className={`w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl text-sm ${dir === 'rtl' ? 'pr-12 pl-4' : 'pl-12 pr-4'} focus:ring-2 focus:ring-secondary focus:bg-white outline-none transition-all disabled:opacity-50`}
          />
        </div>

        <div className={`flex ${dir === 'rtl' ? 'justify-start' : 'justify-end'}`}>
          <Link to="/forgot-password" className="text-sm font-semibold text-secondary hover:text-primary transition-colors">
            {t('forgotPassword')}
          </Link>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full h-14 mt-2 bg-primary text-white rounded-full font-bold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer border-none disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              {t('login')}
              <Arrow className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      <div className="text-center mt-2">
        <span className="text-slate-500 text-sm font-medium">{t('noAccount')} </span>
        <Link to="/register" className="text-secondary font-bold text-sm hover:underline">
          {t('registerNow')}
        </Link>
      </div>
    </div>
  );
}
