import { 
  User, Region, City, Destination, Package, 
  FavoriteList, Comparison, Notification, Review, DestinationStatus 
} from '../server/types';
import { apiRequest } from './api/apiClient';

// Forward all API calls to ASP.NET Core backend with JWT Bearer token
async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  return apiRequest<T>(path, options);
}

export const api = {
  // Authentication
  auth: {
    me: () => apiFetch<User>('/api/auth/me'),
    login: (email: string, passwordHash: string) => 
      apiFetch<User>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: passwordHash })
      }),
    register: (name: string, email: string, passwordHash: string, role: string) =>
      apiFetch<User>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password: passwordHash, role })
      }),
    switchRole: (role: string) =>
      apiFetch<{ success: boolean; role: string }>('/api/auth/switch-role', {
        method: 'POST',
        body: JSON.stringify({ role })
      })
  },

  // Regions & Cities
  regions: {
    list: () => apiFetch<Region[]>('/api/regions'),
    get: (id: string) => apiFetch<{ region: Region; cities: City[] }>(`/api/regions/${id}`)
  },
  cities: {
    getAll: () => apiFetch<any[]>('/api/cities'),
    get: (id: string) => apiFetch<{ city: City; destinations: Destination[] }>(`/api/cities/${id}`),
    getById: (id: string) => apiFetch<any>(`/api/cities/${id}`)
  },

  // Destinations & Submissions
  destinations: {
    list: () => apiFetch<any>('/api/destinations').then((res: any) => Array.isArray(res) ? res : (res?.items || [])),
    get: (id: string) => apiFetch<Destination>(`/api/destinations/${id}`),
    submit: (place: Partial<Destination>) => 
      apiFetch<{ success: boolean; destination: Destination }>('/api/destinations/submit', {
        method: 'POST',
        body: JSON.stringify(place)
      }),
    suggestEdit: (id: string, proposedChanges: Partial<Destination>) =>
      apiFetch<{ success: boolean }>(`/api/destinations/${id}/edit-proposal`, {
        method: 'POST',
        body: JSON.stringify(proposedChanges)
      }),
    report: (id: string, reason: string, details: string) =>
      apiFetch<{ success: boolean }>(`/api/destinations/${id}/report`, {
        method: 'POST',
        body: JSON.stringify({ reason, details })
      }),
    getMySubmissions: () => apiFetch<Destination[]>('/api/my-submissions'),
    getPending: () => apiFetch<Destination[]>('/api/destinations/admin/pending'),
    approve: (id: string) => apiFetch<{ success: boolean }>(`/api/destinations/${id}/approve`, { method: 'POST' }),
    reject: (id: string, reason?: string) => apiFetch<{ success: boolean }>(`/api/destinations/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    }),
    getReviews: (id: string) => apiFetch<Review[]>(`/api/destinations/${id}/reviews`),
    submitReview: (id: string, review: {
      rating: number;
      comment: string;
      cleanliness: number;
      safety: number;
      price: number;
      service: number;
      crowding: number;
    }) => apiFetch<Review>(`/api/destinations/${id}/reviews`, {
      method: 'POST',
      body: JSON.stringify(review)
    })
  },

  // Admin Review Portal
  admin: {
    getPendingSubmissions: () => apiFetch<Destination[]>('/api/admin/pending-submissions'),
    reviewSubmission: (id: string, status: DestinationStatus, adminFeedback?: string) =>
      apiFetch<{ success: boolean }>(`/api/admin/submissions/${id}/review`, {
        method: 'POST',
        body: JSON.stringify({ status, adminFeedback })
      })
  },

  // Favorite Lists
  favoriteLists: {
    list: () => apiFetch<FavoriteList[]>('/api/favorite-lists'),
    create: (name: string, isPublic: boolean) =>
      apiFetch<FavoriteList>('/api/favorite-lists/create', {
        method: 'POST',
        body: JSON.stringify({ name, isPublic })
      }),
    delete: (id: string) => 
      apiFetch<{ success: boolean }>(`/api/favorite-lists/${id}`, {
        method: 'DELETE'
      }),
    addItem: (listId: string, type: string, itemId: string) =>
      apiFetch<FavoriteList>(`/api/favorite-lists/${listId}/add`, {
        method: 'POST',
        body: JSON.stringify({ type, itemId })
      }),
    removeItem: (listId: string, type: string, itemId: string) =>
      apiFetch<FavoriteList>(`/api/favorite-lists/${listId}/remove`, {
        method: 'POST',
        body: JSON.stringify({ type, itemId })
      }),
    invite: (listId: string, email: string) =>
      apiFetch<{ success: boolean; invitees: string[] }>(`/api/favorite-lists/${listId}/invite`, {
        method: 'POST',
        body: JSON.stringify({ email })
      }),
    vote: (listId: string, itemId: string) =>
      apiFetch<FavoriteList>(`/api/favorite-lists/${listId}/vote`, {
        method: 'POST',
        body: JSON.stringify({ itemId })
      })
  },

  // Packages & Trip Designer
  packages: {
    list: (params?: any) => apiFetch<Package[]>('/api/packages'),
    get: (id: string) => apiFetch<Package>(`/api/packages/${id}`),
    saveCustom: (customConfig: any) =>
      apiFetch<{ success: boolean; package: Package }>('/api/packages/custom/save', {
        method: 'POST',
        body: JSON.stringify(customConfig)
      })
  },


  // Comparisons
  comparisons: {
    get: () => apiFetch<Comparison>('/api/comparisons'),
    add: (itemId: string) =>
      apiFetch<Comparison>('/api/comparisons/add', {
        method: 'POST',
        body: JSON.stringify({ itemId })
      }),
    remove: (itemId: string) =>
      apiFetch<Comparison>('/api/comparisons/remove', {
        method: 'POST',
        body: JSON.stringify({ itemId })
      })
  },

  // Notifications
  notifications: {
    list: () => apiFetch<Notification[]>('/api/notifications'),
    markRead: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/notifications/${id}/read`, {
        method: 'PUT'
      }),
    markAllRead: () =>
      apiFetch<{ success: boolean }>('/api/notifications/read-all', {
        method: 'PUT'
      }),
    delete: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/notifications/${id}`, {
        method: 'DELETE'
      }),
    saveSettings: (settings: any) =>
      apiFetch<{ success: boolean }>('/api/notifications/settings', {
        method: 'POST',
        body: JSON.stringify({ settings })
      })
  },

  // Offices
  offices: {
    list: () => apiFetch<any[]>('/api/offices'),
    get: (id: string) => apiFetch<any>(`/api/offices/${id}`),
    createPackage: (pkg: any) =>
      apiFetch<{ success: boolean; package: any }>('/api/offices/packages', {
        method: 'POST',
        body: JSON.stringify(pkg)
      }),
    updatePackage: (id: string, pkg: any) =>
      apiFetch<{ success: boolean; package: any }>(`/api/offices/packages/${id}`, {
        method: 'PUT',
        body: JSON.stringify(pkg)
      }),
    deletePackage: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/offices/packages/${id}`, {
        method: 'DELETE'
      }),
    getBookings: () => apiFetch<any[]>('/api/offices/bookings'),
    bookingAction: (id: string, action: 'confirmed' | 'rejected') =>
      apiFetch<{ success: boolean; booking: any }>(`/api/offices/bookings/${id}/action`, {
        method: 'POST',
        body: JSON.stringify({ action })
      }),
    getStats: () => apiFetch<any>('/api/offices/stats')
  },

  // Guides
  guides: {
    list: (filters: { city?: string; specialty?: string; price?: number; language?: string; availableOnly?: boolean }) => {
      const params = new URLSearchParams();
      if (filters.city) params.set('city', filters.city);
      if (filters.specialty) params.set('specialty', filters.specialty);
      if (filters.price) params.set('price', String(filters.price));
      if (filters.language) params.set('language', filters.language);
      if (filters.availableOnly) params.set('availableOnly', 'true');
      return apiFetch<any[]>(`/api/guides?${params.toString()}`);
    },
    get: (id: string) => apiFetch<any>(`/api/guides/${id}`),
    updateProfile: (profile: any) =>
      apiFetch<any>('/api/guides/my-profile', {
        method: 'PUT',
        body: JSON.stringify(profile)
      })
  },

  // Accommodations
  accommodations: {
    list: (filters: { city?: string; type?: string; price?: number; rating?: number }) => {
      const params = new URLSearchParams();
      if (filters.city) params.set('city', filters.city);
      if (filters.type) params.set('type', filters.type);
      if (filters.price) params.set('price', String(filters.price));
      if (filters.rating) params.set('rating', String(filters.rating));
      return apiFetch<any[]>(`/api/accommodations?${params.toString()}`);
    },
    get: (id: string) => apiFetch<any>(`/api/accommodations/${id}`)
  },

  // Bookings
  bookings: {
    list: () => apiFetch<any[]>('/api/bookings'),
    get: (id: string) => apiFetch<any>(`/api/bookings/${id}`),
    create: (bookingData: { type: 'accommodation' | 'guide' | 'package'; itemId: string; startDate: string; endDate?: string; roomId?: string; travelersCount?: number }) =>
      apiFetch<{ success: boolean; booking: any }>('/api/bookings/create', {
        method: 'POST',
        body: JSON.stringify(bookingData)
      }),
    cancel: (id: string) =>
      apiFetch<{ success: boolean; booking: any }>(`/api/bookings/${id}/cancel`, {
        method: 'POST'
      }),
    complete: (id: string) =>
      apiFetch<{ success: boolean; booking: any }>(`/api/bookings/${id}/complete`, {
        method: 'POST'
      }),
    submitReview: (id: string, review: { rating: number; comment: string; cleanliness: number; safety: number; price: number; service: number; crowding: number }) =>
      apiFetch<{ success: boolean; review: any }>(`/api/bookings/${id}/review`, {
        method: 'POST',
        body: JSON.stringify(review)
      }),
    checkout: (checkoutData: { basePrice: number; couponCode?: string; pointsToRedeem?: number; bookingId?: string }) =>
      apiFetch<{ success: boolean; totalPrice: number; discount: number; pointsEarned: number; newUserPoints: number }>('/api/bookings/checkout', {
        method: 'POST',
        body: JSON.stringify(checkoutData)
      })
  },

  // Quotes Requests
  quotes: {
    createRequest: (req: any) =>
      apiFetch<{ success: boolean; request: any }>('/api/quotes/request', {
        method: 'POST',
        body: JSON.stringify(req)
      }),
    listRequests: () => apiFetch<any[]>('/api/quotes/requests'),
    listMyRequests: () => apiFetch<any[]>('/api/quotes/my-requests'),
    submitProposal: (requestId: string, proposal: any) =>
      apiFetch<{ success: boolean; proposal: any }>(`/api/quotes/${requestId}/proposal`, {
        method: 'POST',
        body: JSON.stringify(proposal)
      }),
    acceptProposal: (proposalId: string) =>
      apiFetch<{ success: boolean; booking: any }>(`/api/quotes/proposals/${proposalId}/accept`, {
        method: 'POST'
      })
  },

  // Instant messaging chats
  chats: {
    listSessions: () => apiFetch<any[]>('/api/chats'),
    getSession: (id: string) => apiFetch<any>(`/api/chats/${id}`),
    sendMessage: (id: string, msg: { text: string; imageUrl?: string; location?: { lat: number; lng: number } }) =>
      apiFetch<any>(`/api/chats/${id}/send`, {
        method: 'POST',
        body: JSON.stringify(msg)
      })
  },

  // AI custom itinerary
  chat: {
    getPlannerItinerary: (params: { cities: string[]; budget: string; daysCount: number; interests: string[]; tripType: string; transport: string; accommodation: string }) =>
      apiFetch<{ success: boolean; itinerary: any }>('/api/chat/planner', {
        method: 'POST',
        body: JSON.stringify(params)
      })
  },

  trips: {
    getMyTrips: () => apiFetch<any[]>('/api/trips'),
    getById: (id: string) => apiFetch<any>(`/api/trips/${id}`),
    create: (data: any) => apiFetch<any>('/api/trips', { method: 'POST', body: JSON.stringify(data) }),
    addItem: (id: string, item: any) => apiFetch<any>(`/api/trips/${id}/items`, { method: 'POST', body: JSON.stringify(item) })
  },

  search: {
    query: (q: string) => apiFetch<any>(`/api/search?q=${encodeURIComponent(q)}`),
    places: (regionId?: string, cityId?: string) => apiFetch<any[]>(`/api/search/places?regionId=${regionId || ''}&cityId=${cityId || ''}`)
  }
};

export const destinations = api.destinations;
export const cities = api.cities;
export const trips = api.trips;
export const search = api.search;
