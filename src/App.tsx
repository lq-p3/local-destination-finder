import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AuthLayout from './components/AuthLayout';
import Home from './pages/Home';
import Destination from './pages/Destination';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Regions from './pages/Regions';
import RegionDetail from './pages/RegionDetail';
import Packages from './pages/Packages';
import Accommodations from './pages/Accommodations';
import AccommodationDetail from './pages/AccommodationDetail';
import Unauthorized from './pages/Unauthorized';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AppErrorBoundary } from './components/AppErrorBoundary';

// Lazy-loaded route components for optimized initial bundle
const Explore = lazy(() => import('./pages/Explore'));
const Trips = lazy(() => import('./pages/Trips'));
const AdminModeration = lazy(() => import('./pages/AdminModeration'));
const AiPlanner = lazy(() => import('./pages/AiPlanner'));
const MapPage = lazy(() => import('./pages/MapPage'));
const Profile = lazy(() => import('./pages/Profile'));
const GuidesPage = lazy(() => import('./pages/GuidesPage'));
const AddPlace = lazy(() => import('./pages/AddPlace'));
const Wishlists = lazy(() => import('./pages/Wishlists'));
const CustomPackage = lazy(() => import('./pages/CustomPackage'));
const Compare = lazy(() => import('./pages/Compare'));
const OfficeDashboard = lazy(() => import('./pages/OfficeDashboard'));
const Bookings = lazy(() => import('./pages/Bookings'));
const Quotes = lazy(() => import('./pages/Quotes'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Chats = lazy(() => import('./pages/Chats'));
const CityDetail = lazy(() => import('./pages/CityDetail'));
const AdminCms = lazy(() => import('./pages/AdminCms'));

function RouteLoadingFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <AppErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <Suspense fallback={<RouteLoadingFallback />}>
              <Routes>
                {/* Auth Routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                </Route>

                {/* Main App Routes */}
                <Route element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="explore" element={<Explore />} />
                  <Route path="destination/:id" element={<Destination />} />
                  <Route path="regions" element={<Regions />} />
                  <Route path="region/:id" element={<RegionDetail />} />
                  <Route path="city/:id" element={<CityDetail />} />
                  <Route path="packages" element={<Packages />} />
                  <Route path="custom-package" element={<CustomPackage />} />
                  <Route path="accommodations" element={<Accommodations />} />
                  <Route path="accommodation/:id" element={<AccommodationDetail />} />
                  <Route path="unauthorized" element={<Unauthorized />} />
                  
                  {/* Protected Routes for logged in travelers */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="trips" element={<Trips />} />
                    <Route path="ai-planner" element={<AiPlanner />} />
                    <Route path="map" element={<MapPage />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="guides" element={<GuidesPage />} />
                    <Route path="add-place" element={<AddPlace />} />
                    <Route path="wishlists" element={<Wishlists />} />
                    <Route path="compare" element={<Compare />} />
                    <Route path="bookings" element={<Bookings />} />
                    <Route path="quotes" element={<Quotes />} />
                    <Route path="checkout" element={<Checkout />} />
                    <Route path="chats" element={<Chats />} />
                  </Route>

                  {/* Protected Route for TravelOffice & Admin */}
                  <Route element={<ProtectedRoute allowedRoles={['office', 'admin', 'provider']} />}>
                    <Route path="office-dashboard" element={<OfficeDashboard />} />
                    <Route path="admin/moderation" element={<AdminModeration />} />
                    <Route path="admin/cms" element={<AdminCms />} />
                  </Route>
                </Route>
                
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </AppErrorBoundary>
  );
}
