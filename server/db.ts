import fs from 'fs';
import path from 'path';
import { 
  User, Region, City, Destination, Package, 
  FavoriteList, Comparison, Notification, Review, Booking, DestinationEdit, DestinationReport,
  TravelOffice, TravelGuide, Accommodation,
  QuoteRequest, QuoteProposal, ChatSession
} from './types';

const DATA_DIR = path.join(process.cwd(), 'server', 'data');

// Helper to ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Generic file reading/writing helpers
function readJSONFile<T>(filename: string, defaultValue: T): T {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf-8');
    return defaultValue;
  }
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return defaultValue;
  }
}

function writeJSONFile<T>(filename: string, data: T): void {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
  }
}

// Database accessors
export const db = {
  getUsers: () => readJSONFile<User[]>('users.json', []),
  saveUsers: (users: User[]) => writeJSONFile<User[]>('users.json', users),

  getRegions: () => readJSONFile<Region[]>('regions.json', []),
  saveRegions: (regions: Region[]) => writeJSONFile<Region[]>('regions.json', regions),

  getCities: () => readJSONFile<City[]>('cities.json', []),
  saveCities: (cities: City[]) => writeJSONFile<City[]>('cities.json', cities),

  getDestinations: () => readJSONFile<Destination[]>('destinations.json', []),
  saveDestinations: (destinations: Destination[]) => writeJSONFile<Destination[]>('destinations.json', destinations),

  getDestinationEdits: () => readJSONFile<DestinationEdit[]>('destination_edits.json', []),
  saveDestinationEdits: (edits: DestinationEdit[]) => writeJSONFile<DestinationEdit[]>('destination_edits.json', edits),

  getDestinationReports: () => readJSONFile<DestinationReport[]>('destination_reports.json', []),
  saveDestinationReports: (reports: DestinationReport[]) => writeJSONFile<DestinationReport[]>('destination_reports.json', reports),

  getPackages: () => readJSONFile<Package[]>('packages.json', []),
  savePackages: (packages: Package[]) => writeJSONFile<Package[]>('packages.json', packages),

  getFavoriteLists: () => readJSONFile<FavoriteList[]>('favorite_lists.json', []),
  saveFavoriteLists: (lists: FavoriteList[]) => writeJSONFile<FavoriteList[]>('favorite_lists.json', lists),

  getComparisons: () => readJSONFile<Comparison[]>('comparisons.json', []),
  saveComparisons: (comparisons: Comparison[]) => writeJSONFile<Comparison[]>('comparisons.json', comparisons),

  getNotifications: () => readJSONFile<Notification[]>('notifications.json', []),
  saveNotifications: (notifications: Notification[]) => writeJSONFile<Notification[]>('notifications.json', notifications),

  getBookings: () => readJSONFile<Booking[]>('bookings.json', []),
  saveBookings: (bookings: Booking[]) => writeJSONFile<Booking[]>('bookings.json', bookings),

  getReviews: () => readJSONFile<Review[]>('reviews.json', []),
  saveReviews: (reviews: Review[]) => writeJSONFile<Review[]>('reviews.json', reviews),

  getOffices: () => readJSONFile<TravelOffice[]>('offices.json', []),
  saveOffices: (offices: TravelOffice[]) => writeJSONFile<TravelOffice[]>('offices.json', offices),

  getGuides: () => readJSONFile<TravelGuide[]>('guides.json', []),
  saveGuides: (guides: TravelGuide[]) => writeJSONFile<TravelGuide[]>('guides.json', guides),

  getAccommodations: () => readJSONFile<Accommodation[]>('accommodations.json', []),
  saveAccommodations: (accommodations: Accommodation[]) => writeJSONFile<Accommodation[]>('accommodations.json', accommodations),

  getQuoteRequests: () => readJSONFile<QuoteRequest[]>('quote_requests.json', []),
  saveQuoteRequests: (requests: QuoteRequest[]) => writeJSONFile<QuoteRequest[]>('quote_requests.json', requests),

  getQuoteProposals: () => readJSONFile<QuoteProposal[]>('quote_proposals.json', []),
  saveQuoteProposals: (proposals: QuoteProposal[]) => writeJSONFile<QuoteProposal[]>('quote_proposals.json', proposals),

  getChatSessions: () => readJSONFile<ChatSession[]>('chat_sessions.json', []),
  saveChatSessions: (sessions: ChatSession[]) => writeJSONFile<ChatSession[]>('chat_sessions.json', sessions),
};

// Initial Data Seed
export function seedDatabase() {
  ensureDataDir();

  // 1. Seed Users
  const users = db.getUsers();
  if (users.length === 0) {
    const initialUsers: User[] = [
      {
        id: 'user_sarah',
        name: 'Sarah Miller',
        email: 'sarah.travels@example.com',
        passwordHash: 'password123', // Raw password for mock simulation
        role: 'user',
        points: 450,
        badges: ['Local Explorer', 'Aseer Explorer'],
        notificationSettings: { bookings: true, offers: true, messages: true, system: true, weather: true }
      },
      {
        id: 'user_admin',
        name: 'LDF Administrator',
        email: 'admin@ldf.sa',
        passwordHash: 'admin123',
        role: 'admin',
        points: 1000,
        badges: ['Trusted Contributor'],
        notificationSettings: { bookings: true, offers: true, messages: true, system: true, weather: true }
      },
      {
        id: 'guide_abdullah',
        name: 'Abdullah Al-Harbi',
        email: 'abdullah@guide.ldf.sa',
        passwordHash: 'guide123',
        role: 'guide',
        points: 300,
        badges: ['City Expert'],
        notificationSettings: { bookings: true, offers: true, messages: true, system: true, weather: true }
      },
      {
        id: 'office_tours',
        name: 'Saudi Horizon Travel',
        email: 'horizon@office.ldf.sa',
        passwordHash: 'office123',
        role: 'office',
        points: 500,
        badges: ['Trusted Contributor'],
        notificationSettings: { bookings: true, offers: true, messages: true, system: true, weather: true }
      }
    ];
    db.saveUsers(initialUsers);
  }

  // 2. Seed Regions
  const regions = db.getRegions();
  if (regions.length === 0) {
    const initialRegions: Region[] = [
      {
        id: 'central_region',
        nameEn: 'Central Region',
        nameAr: 'المنطقة الوسطى',
        coverImage: '/riyadh_night.png',
        descriptionEn: 'The beating heart of Saudi Arabia, blending modern landmarks, historical heritage sites, and massive entertainment zones.',
        descriptionAr: 'القلب النابض للمملكة العربية السعودية، حيث تمتزج المعالم الحديثة والمواقع التراثية التاريخية مع مناطق الترفيه الكبرى.',
        bestTimeToVisitEn: 'October to March',
        bestTimeToVisitAr: 'من أكتوبر إلى مارس',
        famousFoodsEn: ['Kabsa', 'Jareesh', 'Qursan'],
        famousFoodsAr: ['الكبسة', 'الجريش', 'القرصان']
      },
      {
        id: 'aseer_region',
        nameEn: 'Aseer Region',
        nameAr: 'منطقة عسير',
        coverImage: '/abha_jacaranda.jpg',
        descriptionEn: 'A mountainous green paradise famous for high peaks, fog-draped scenery, beautiful jacaranda trees, and ancient stone heritage.',
        descriptionAr: 'جنة خضراء جبلية تشتهر بقممها العالية ومناظرها المكسوة بالضباب وأشجار الجاكاراندا الجميلة والتراث الحجري القديم.',
        bestTimeToVisitEn: 'June to September (Summer escape)',
        bestTimeToVisitAr: 'من يونيو إلى سبتمبر (ملاذ صيفي رائع)',
        famousFoodsEn: ['Haneeth', 'Aseedah', 'Mashghoutha'],
        famousFoodsAr: ['الحنيذ', 'العصيدة', 'المشغوثة']
      },
      {
        id: 'western_region',
        nameEn: 'Western Region',
        nameAr: 'المنطقة الغربية',
        coverImage: '/alula_hegra.jpg',
        descriptionEn: 'Stretching along the Red Sea coast, from the historical markets of Jeddah to the ancient archaeological tombs of AlUla.',
        descriptionAr: 'تمتد على طول ساحل البحر الأحمر، من أسواق جدة التاريخية إلى المقابر الأثرية القديمة في العلا.',
        bestTimeToVisitEn: 'November to April',
        bestTimeToVisitAr: 'من نوفمبر إلى أبريل',
        famousFoodsEn: ['Sayadiyah', 'Manto', 'Yaghmoush'],
        famousFoodsAr: ['الصيادية', 'المنتو', 'اليغموش']
      }
    ];
    db.saveRegions(initialRegions);
  }

  // 3. Seed Cities
  const cities = db.getCities();
  if (cities.length === 0) {
    const initialCities: City[] = [
      {
        id: 'riyadh',
        regionId: 'central_region',
        nameEn: 'Riyadh',
        nameAr: 'الرياض',
        coverImage: '/riyadh_night.png',
        descriptionEn: 'The dynamic capital city featuring soaring towers and world-class seasons.',
        descriptionAr: 'العاصمة الديناميكية التي تتميز بأبراجها الشاهقة ومواسمها الترفيهية العالمية.',
        weather: { temp: 24, statusEn: 'Sunny', statusAr: 'مشمس', wind: '12 km/h' },
        coordinates: { lat: 24.7136, lng: 46.6753 }
      },
      {
        id: 'abha',
        regionId: 'aseer_region',
        nameEn: 'Abha',
        nameAr: 'أبها',
        coverImage: '/abha_jacaranda.jpg',
        descriptionEn: 'Perched high in the mountains, famous for fresh breezes and purple jacarandas.',
        descriptionAr: 'تقع في أعالي الجبال، وتشتهر بنسماتها الباردة والجاكاراندا البنفسجية.',
        weather: { temp: 19, statusEn: 'Foggy', statusAr: 'ضبابي', wind: '8 km/h' },
        coordinates: { lat: 18.2164, lng: 42.5053 }
      },
      {
        id: 'jeddah',
        regionId: 'western_region',
        nameEn: 'Jeddah',
        nameAr: 'جدة',
        coverImage: '/jeddah_corniche.jpg',
        descriptionEn: 'The Bride of the Red Sea, offering deep diving spots and a heritage Al-Balad quarter.',
        descriptionAr: 'عروس البحر الأحمر، وتقدم مواقع غوص عميقة وحي البلد التراثي الشهير.',
        weather: { temp: 31, statusEn: 'Humid & Clear', statusAr: 'رطب وصافٍ', wind: '15 km/h' },
        coordinates: { lat: 21.5433, lng: 39.1728 }
      },
      {
        id: 'alula',
        regionId: 'western_region',
        nameEn: 'AlUla',
        nameAr: 'العلا',
        coverImage: '/alula_hegra.jpg',
        descriptionEn: 'A magical geological wonder displaying rock carvings and 2,000-year-old Nabataean tombs.',
        descriptionAr: 'أعجوبة جيولوجية ساحرة تعرض نقوشًا صخرية ومقابر نبطية تعود لألفي عام.',
        weather: { temp: 26, statusEn: 'Clear Night', statusAr: 'صافٍ', wind: '6 km/h' },
        coordinates: { lat: 26.6200, lng: 37.9300 }
      },
      {
        id: 'taif',
        regionId: 'western_region',
        nameEn: 'Taif',
        nameAr: 'الطائف',
        coverImage: 'https://images.unsplash.com/photo-1632731057400-f925c4efc587?auto=format&fit=crop&w=2000&q=80',
        descriptionEn: 'The City of Roses, perched high in the mountains. Famous for its pleasant weather and rose farms.',
        descriptionAr: 'مدينة الورود، تقع في أعالي الجبال. تشتهر بطقسها اللطيف ومزارع الورود العطرة.',
        weather: { temp: 22, statusEn: 'Cloudy', statusAr: 'غائم جزئياً', wind: '10 km/h' },
        coordinates: { lat: 21.2854, lng: 40.4244 }
      },
      {
        id: 'neom',
        regionId: 'western_region',
        nameEn: 'NEOM',
        nameAr: 'نيوم',
        coverImage: 'https://images.unsplash.com/photo-1682687981974-c5ef2111640c?auto=format&fit=crop&w=2000&q=80',
        descriptionEn: 'A vision of what a new future might look like, featuring breathtaking natural landscapes.',
        descriptionAr: 'رؤية لما قد يبدو عليه المستقبل الجديد، وتتميز بمناظر طبيعية خلابة.',
        weather: { temp: 28, statusEn: 'Sunny', statusAr: 'مشمس', wind: '14 km/h' },
        coordinates: { lat: 28.2800, lng: 34.6200 }
      }
    ];
    db.saveCities(initialCities);
  }

  // 4. Seed Destinations
  const destinations = db.getDestinations();
  if (destinations.length === 0) {
    const initialDestinations: Destination[] = [
      {
        id: 'alula_hegra',
        cityId: 'alula',
        neighborhoodEn: 'Hegra Archeological Site',
        neighborhoodAr: 'موقع الحجر الأثري',
        nameEn: 'Hegra (Mada’in Salih)',
        nameAr: 'الحجر (مدائن صالح)',
        category: 'Historical',
        rating: 4.9,
        reviews: 1240,
        image: '/alula_hegra.jpg',
        gallery: [
          '/alula_hegra.jpg',
          'https://images.unsplash.com/photo-1625414811202-e223ed33405c?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1610996537169-2f22e831c26b?auto=format&fit=crop&w=800&q=80'
        ],
        descriptionEn: 'The first UNESCO World Heritage site in Saudi Arabia, boasting 111 monumental tombs carved into sandstone rocks.',
        descriptionAr: 'أول موقع للتراث العالمي لليونسكو في المملكة العربية السعودية، ويضم 111 مقبرة أثرية ضخمة منحوتة في صخور الحجر الرملي.',
        coordinates: { lat: 26.7900, lng: 37.9500 },
        workingHoursEn: '09:00 AM - 05:00 PM',
        workingHoursAr: '09:00 ص - 05:00 م',
        entryFees: 95,
        contactInfo: { phone: '+966920025000', email: 'info@rcu.gov.sa' },
        priceLevel: '$$',
        servicesEn: ['Guided Tours', 'Shuttle Buses', 'Restrooms', 'Visitor Center'],
        servicesAr: ['جولات سياحية', 'حافلات ترددية', 'دورات مياه', 'مركز الزوار'],
        suitability: { families: true, kids: true, elderly: true, disabled: false },
        status: 'approved',
        distanceEn: '3 hr flight',
        distanceAr: 'رحلة طيران ٣ ساعات'
      },
      {
        id: 'abha_jacaranda',
        cityId: 'abha',
        neighborhoodEn: 'Al Art Walk',
        neighborhoodAr: 'ممشى الفن',
        nameEn: 'Art Street & Jacaranda Valley',
        nameAr: 'شارع الفن ووادي الجاكاراندا',
        category: 'Nature',
        rating: 4.7,
        reviews: 856,
        image: '/abha_jacaranda.jpg',
        gallery: [
          '/abha_jacaranda.jpg',
          'https://images.unsplash.com/photo-1620619711690-d4fb2163b860?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1598418579978-22cc26090ee5?auto=format&fit=crop&w=800&q=80'
        ],
        descriptionEn: 'A magical avenue lined with purple jacaranda trees that bloom beautifully during spring and summer months.',
        descriptionAr: 'شارع ساحر تحفه أشجار الجاكاراندا البنفسجية التي تتفتح بشكل رائع خلال أشهر الربيع والصيف.',
        coordinates: { lat: 18.2185, lng: 42.5020 },
        workingHoursEn: '24/7 (Best visited in Afternoon)',
        workingHoursAr: 'مفتوح دائماً (أفضل وقت للزيارة عصراً)',
        entryFees: 0,
        contactInfo: {},
        priceLevel: '$',
        servicesEn: ['Cafes & Restaurants', 'Benches', 'Art Galleries', 'Pedestrian Walkway'],
        servicesAr: ['مقاهي ومطاعم', 'مقاعد للجلوس', 'معارض فنية', 'ممشى مشاة'],
        suitability: { families: true, kids: true, elderly: true, disabled: true },
        status: 'approved',
        distanceEn: '2 hr flight',
        distanceAr: 'رحلة طيران ساعتين'
      },
      {
        id: 'riyadh_masmak',
        cityId: 'riyadh',
        neighborhoodEn: 'Deera District',
        neighborhoodAr: 'حي الديرة',
        nameEn: 'Al Masmak Palace Museum',
        nameAr: 'متحف قصر المصمك',
        category: 'Historical',
        rating: 4.8,
        reviews: 1420,
        image: '/riyadh_night.png',
        gallery: [
          '/riyadh_night.png',
          'https://images.unsplash.com/photo-1616421946806-6950798cd5d5?auto=format&fit=crop&w=800&q=80'
        ],
        descriptionEn: 'A clay and mud-brick fort in the old city of Riyadh, which played a pivotal role in the unification of Saudi Arabia.',
        descriptionAr: 'حصن طيني سميك في وسط مدينة الرياض القديمة، لعب دوراً محورياً في توحيد المملكة العربية السعودية.',
        coordinates: { lat: 24.6312, lng: 46.7134 },
        workingHoursEn: '08:00 AM - 09:00 PM',
        workingHoursAr: '08:00 ص - 09:00 م',
        entryFees: 0,
        contactInfo: { phone: '+966114110091' },
        priceLevel: '$',
        servicesEn: ['Audio Guides', 'Exhibits Hall', 'Souvenir Shop', 'Restrooms'],
        servicesAr: ['أجهزة إرشاد صوتي', 'قاعات عرض', 'متجر هدايا', 'دورات مياه'],
        suitability: { families: true, kids: true, elderly: true, disabled: true },
        status: 'approved',
        distanceEn: 'Current location',
        distanceAr: 'الموقع الحالي'
      },
      {
        id: 'jeddah_balad',
        cityId: 'jeddah',
        neighborhoodEn: 'Al-Balad Heritage',
        neighborhoodAr: 'البلد التاريخية',
        nameEn: 'Historic Jeddah (Al-Balad)',
        nameAr: 'جدة التاريخية (البلد)',
        category: 'Historical',
        rating: 4.6,
        reviews: 2150,
        image: '/jeddah_corniche.jpg',
        gallery: [
          '/jeddah_corniche.jpg'
        ],
        descriptionEn: 'Fascinating ancient residential block characterized by unique Roshan wooden windows and authentic historic houses.',
        descriptionAr: 'منطقة سكنية قديمة ورائعة تتميز بنوافذ الروشان الخشبية الفريدة والبيوت التاريخية الأصيلة.',
        coordinates: { lat: 21.4820, lng: 39.1865 },
        workingHoursEn: '04:00 PM - 11:00 PM',
        workingHoursAr: '04:00 م - 11:00 م',
        entryFees: 0,
        contactInfo: { email: 'info@jeddahalbalad.sa' },
        priceLevel: '$$',
        servicesEn: ['Bazaar Markets', 'Local Cafes', 'Heritage Hotels', 'Guided Golf Carts'],
        servicesAr: ['أسواق شعبية', 'مقاهي محلية', 'فنادق تراثية', 'عربات غولف بإرشاد'],
        suitability: { families: true, kids: true, elderly: false, disabled: false },
        status: 'approved',
        distanceEn: '1.5 hr flight',
        distanceAr: 'رحلة طيران ساعة ونصف'
      },
      {
        id: 'taif_shafa',
        cityId: 'taif',
        neighborhoodEn: 'Al Shafa Mountains',
        neighborhoodAr: 'جبال الشفا',
        nameEn: 'Al Shafa Mountain View',
        nameAr: 'جبل الشفا المفتوح',
        category: 'Mountains',
        rating: 4.5,
        reviews: 620,
        image: 'https://images.unsplash.com/photo-1632731057400-f925c4efc587?auto=format&fit=crop&w=2000&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1632731057400-f925c4efc587?auto=format&fit=crop&w=800&q=80'
        ],
        descriptionEn: 'The City of Roses, perched high in the mountains. Famous for its pleasant weather, fragrant rose farms, and scenic winding mountain roads.',
        descriptionAr: 'مدينة الورود، تقع في أعالي الجبال. تشتهر بطقسها اللطيف ومزارع الورود العطرة والطرق الجبلية المتعرجة الخلابة.',
        coordinates: { lat: 21.2854, lng: 40.4244 },
        workingHoursEn: '24/7',
        workingHoursAr: 'على مدار الساعة',
        entryFees: 0,
        contactInfo: {},
        priceLevel: '$',
        servicesEn: ['Viewpoints', 'Cafes', 'Hiking Paths'],
        servicesAr: ['مطلات طبيعية', 'مقاهي', 'مسارات مشي'],
        suitability: { families: true, kids: true, elderly: true, disabled: false },
        status: 'approved',
        distanceEn: '2.5 hr drive',
        distanceAr: '٢.٥ ساعة بالسيارة'
      },
      {
        id: 'neom_trojena',
        cityId: 'neom',
        neighborhoodEn: 'Trojena Snow Valley',
        neighborhoodAr: 'وادي تروجينا الثلجي',
        nameEn: 'Trojena Snow Mountain',
        nameAr: 'تروجينا نيوم',
        category: 'Adventure',
        rating: 4.9,
        reviews: 412,
        image: 'https://images.unsplash.com/photo-1682687981974-c5ef2111640c?auto=format&fit=crop&w=2000&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1682687981974-c5ef2111640c?auto=format&fit=crop&w=800&q=80'
        ],
        descriptionEn: 'A vision of what a new future might look like, featuring breathtaking natural landscapes from the Red Sea coast to snow-capped mountains.',
        descriptionAr: 'رؤية لما قد يبدو عليه المستقبل الجديد، وتتميز بمناظر طبيعية خلابة من ساحل البحر الأحمر إلى الجبال التي تغطيها الثلوج.',
        coordinates: { lat: 28.2800, lng: 34.6200 },
        workingHoursEn: '08:00 AM - 08:00 PM',
        workingHoursAr: '08:00 ص - 08:00 م',
        entryFees: 150,
        contactInfo: {},
        priceLevel: '$$$',
        servicesEn: ['Ski Slopes', 'Luxury Lodging', 'Guided Sports'],
        servicesAr: ['منحدرات تزلج', 'سكن فاخر', 'رياضات بإرشاد'],
        suitability: { families: true, kids: false, elderly: false, disabled: false },
        status: 'approved',
        distanceEn: '2 hr flight',
        distanceAr: 'رحلة طيران ساعتين'
      }
    ];
    db.saveDestinations(initialDestinations);
  }

  // 5. Seed Packages
  const packages = db.getPackages();
  if (packages.length === 0) {
    const initialPackages: Package[] = [
      {
        id: 'pkg_aseer_summer',
        officeId: 'office_tours',
        officeNameEn: 'Saudi Horizon Travel',
        officeNameAr: 'السهم السعودي للرحلات',
        nameEn: 'Aseer Mountain Escape',
        nameAr: 'ملاذ جبال عسير الصيفي',
        category: 'family',
        images: ['/abha_jacaranda.jpg', 'https://images.unsplash.com/photo-1620619711690-d4fb2163b860?auto=format&fit=crop&w=800&q=80'],
        citiesEn: ['Abha'],
        citiesAr: ['أبها'],
        durationDays: 3,
        startDate: '2026-08-01',
        endDate: '2026-08-03',
        itinerary: [
          {
            dayNumber: 1,
            activitiesEn: [
              { time: '09:00 AM', text: 'Airport pickup and check-in at Aseer Heritage Resort', location: 'Abha Airport' },
              { time: '04:00 PM', text: 'Stroll along Art Street and enjoy the Jacaranda tree shades', location: 'Art Street' }
            ],
            activitiesAr: [
              { time: '09:00 ص', text: 'الاستقبال في المطار والتسكين في منتجع تراث عسير', location: 'مطار أبها' },
              { time: '04:00 م', text: 'جولة مشي ممتعة في شارع الفن والاستمتاع بظلال الجاكاراندا', location: 'شارع الفن' }
            ]
          },
          {
            dayNumber: 2,
            activitiesEn: [
              { time: '08:00 AM', text: 'Cable car ride to Green Mountain peaks', location: 'Green Mountain' },
              { time: '02:00 PM', text: 'Traditional lunch containing delicious Haneeth', location: 'Local Restaurant' }
            ],
            activitiesAr: [
              { time: '08:00 ص', text: 'رحلة العربات المعلقة (تلفريك) لقمم الجبل الأخضر', location: 'الجبل الأخضر' },
              { time: '02:00 م', text: 'وجبة غداء شعبية فاخرة تحتوي على الحنيذ الأصيل', location: 'مطعم محلي' }
            ]
          },
          {
            dayNumber: 3,
            activitiesEn: [
              { time: '10:00 AM', text: 'Check-out and transfer back to the airport' }
            ],
            activitiesAr: [
              { time: '10:00 ص', text: 'تسجيل الخروج والتوجه نحو المطار للعودة' }
            ]
          }
        ],
        transportTypeEn: 'Private Mini-Bus',
        transportTypeAr: 'حافلة نقل خاصة مجهزة',
        pricePerPerson: 1200,
        totalSeats: 25,
        remainingSeats: 12,
        inclusionsEn: ['3-star accommodation', 'Daily traditional breakfast & lunch', 'Entry tickets & cable car fees', 'Certified tour guide'],
        inclusionsAr: ['الإقامة في فندق ٣ نجوم', 'وجبات الإفطار والغداء الشعبية يومياً', 'تذاكر الدخول ورسوم التلفريك', 'مرشد سياحي مرخص وموثق'],
        exclusionsEn: ['Airline flight tickets', 'Personal shopping expenses', 'Evening dinner meals'],
        exclusionsAr: ['تذاكر الطيران للذهاب والعودة', 'المصاريف الشخصية والهدايا', 'وجبات العشاء المسائية'],
        termsEn: 'Please bring warm jackets as weather can be chilly in mountain nights.',
        termsAr: 'يرجى إحضار ملابس دافئة نظراً لبرودة الأجواء في الجبال ليلاً.',
        cancellationPolicyEn: 'Free cancellation up to 48 hours before the trip starts.',
        cancellationPolicyAr: 'إلغاء مجاني كامل حتى ٤٨ ساعة قبل موعد بدء الرحلة.',
        rating: 4.8,
        reviewsCount: 42,
        isAvailable: true
      },
      {
        id: 'pkg_alula_adventure',
        officeId: 'office_tours',
        officeNameEn: 'Saudi Horizon Travel',
        officeNameAr: 'السهم السعودي للرحلات',
        nameEn: 'AlUla Historic Discovery',
        nameAr: 'استكشاف معالم العلا التاريخية',
        category: 'adventure',
        images: ['/alula_hegra.jpg', 'https://images.unsplash.com/photo-1625414811202-e223ed33405c?auto=format&fit=crop&w=800&q=80'],
        citiesEn: ['AlUla'],
        citiesAr: ['العلا'],
        durationDays: 2,
        startDate: '2026-09-10',
        endDate: '2026-09-12',
        itinerary: [
          {
            dayNumber: 1,
            activitiesEn: [
              { time: '10:00 AM', text: 'Arrive at AlUla Desert Camp and check-in to glamping pods', location: 'Desert Glamping' },
              { time: '03:00 PM', text: 'Sunset hiking tour at Elephant Rock', location: 'Elephant Rock' }
            ],
            activitiesAr: [
              { time: '10:00 ص', text: 'الوصول لمخيم العلا الصحراوي والتسكين في الغرف الزجاجية', location: 'التخييم الفاخر' },
              { time: '03:00 م', text: 'جولة لمشاهدة الغروب حول صخرة الفيل الشهيرة', location: 'جبل الفيل' }
            ]
          },
          {
            dayNumber: 2,
            activitiesEn: [
              { time: '09:00 AM', text: 'Guided exploration of UNESCO site Hegra tombs', location: 'Hegra Tombs' },
              { time: '04:00 PM', text: 'Departure flight back' }
            ],
            activitiesAr: [
              { time: '09:00 ص', text: 'جولة برفقة مرشد لاستكشاف مقابر الحجر الأثرية المسجلة باليونسكو', location: 'مقابر الحجر' },
              { time: '04:00 م', text: 'رحلة المغادرة والعودة للديار' }
            ]
          }
        ],
        transportTypeEn: '4x4 SUV Vehicles',
        transportTypeAr: 'سيارات دفع رباعي فاخرة',
        pricePerPerson: 2100,
        totalSeats: 15,
        remainingSeats: 4,
        inclusionsEn: ['Glamping camp resort stay', 'All meals included', 'Private 4x4 transport', 'Hegra entry slot booked'],
        inclusionsAr: ['الإقامة في مخيم صحراوي فاخر', 'شامل جميع الوجبات اليومية', 'تنقلات بسيارات دفع رباعي خاصة', 'حجز تذاكر وتصاريح دخول الحجر بالكامل'],
        exclusionsEn: ['Airline flights', 'Snacks'],
        exclusionsAr: ['رحلات الطيران للوصول للعلا', 'الوجبات الخفيفة والمسليات'],
        termsEn: 'Sunscreen, sunglasses, and comfortable walking shoes are highly recommended.',
        termsAr: 'نوصي بشدة بإحضار واقي شمس، نظارة شمسية، وحذاء مريح للمشي الطويل.',
        cancellationPolicyEn: 'Non-refundable if cancelled less than 5 days prior.',
        cancellationPolicyAr: 'غير مستردة القيمة في حال الإلغاء بأقل من ٥ أيام من الرحلة.',
        rating: 4.9,
        reviewsCount: 78,
        isAvailable: true
      }
    ];
    db.savePackages(initialPackages);
  }

  // 6. Seed Notifications
  const notifications = db.getNotifications();
  if (notifications.length === 0) {
    const initialNotifications: Notification[] = [
      {
        id: 'notif_1',
        userId: 'user_sarah',
        type: 'booking',
        titleEn: 'Trip coming up!',
        titleAr: 'رحلتك تقترب!',
        contentEn: 'Your flight to Abha is in 2 days! Prepare your luggage.',
        contentAr: 'رحلتك إلى أبها بعد يومين! جهز حقائبك للسفر.',
        isRead: false,
        link: '/profile',
        createdAt: new Date().toISOString()
      },
      {
        id: 'notif_2',
        userId: 'user_sarah',
        type: 'booking',
        titleEn: 'Guide Confirmed',
        titleAr: 'تأكيد المرشد',
        contentEn: 'Guide Abdullah Al-Harbi confirmed your booking request.',
        contentAr: 'أكد المرشد عبد الله الحربي حجزك السياحي المقترح.',
        isRead: false,
        link: '/guides',
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ];
    db.saveNotifications(initialNotifications);
  }

  // 7. Seed Favorite Lists
  const favLists = db.getFavoriteLists();
  if (favLists.length === 0) {
    const initialLists: FavoriteList[] = [
      {
        id: 'list_sarah_summer',
        userId: 'user_sarah',
        name: 'Summer Trip 2026',
        isPublic: true,
        invitees: ['friend1@example.com'],
        votes: {
          'alula_hegra': ['user_sarah', 'friend1'],
          'abha_jacaranda': ['user_sarah']
        },
        items: [
          { type: 'destination', itemId: 'alula_hegra' },
          { type: 'destination', itemId: 'abha_jacaranda' }
        ]
      }
    ];
    db.saveFavoriteLists(initialLists);
  }

  // 8. Seed Travel Offices
  const offices = db.getOffices();
  if (offices.length === 0) {
    const initialOffices: TravelOffice[] = [
      {
        id: 'office_saudi_tours',
        userId: 'user_office_saudi',
        nameEn: 'Saudi Horizon Tours',
        nameAr: 'جولات الأفق السعودية',
        logo: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=150&q=80',
        licenseNumber: 'L-55291-EXP',
        isVerified: true,
        citiesServedEn: ['Riyadh', 'Abha', 'AlUla'],
        citiesServedAr: ['الرياض', 'أبها', 'العلا'],
        descriptionEn: 'Premium luxury local travel coordinator specializing in heritage trips.',
        descriptionAr: 'منسق رحلات سفر محلية فاخرة متخصص في الجولات التراثية والتاريخية.',
        phone: '+966 50 123 4567',
        email: 'tours@saudihorizon.com',
        workingHoursEn: '09:00 AM - 06:00 PM (Sun - Thu)',
        workingHoursAr: '09:00 ص - 06:00 م (الأحد - الخميس)',
        coordinates: { lat: 24.7136, lng: 46.6753 },
        termsEn: 'Deposit is required for reservation confirmation.',
        termsAr: 'يتطلب دفع العربون لتأكيد الحجز.',
        cancellationPolicyEn: 'Free cancellation up to 72 hours before start.',
        cancellationPolicyAr: 'إلغاء مجاني قبل ٧٢ ساعة من تاريخ البدء.'
      }
    ];
    db.saveOffices(initialOffices);
  }

  // 9. Seed Guides
  const guides = db.getGuides();
  if (guides.length === 0) {
    const initialGuides: TravelGuide[] = [
      {
        id: 'guide_abdullah',
        userId: 'user_guide_abdullah',
        nameEn: 'Abdullah Al-Harbi',
        nameAr: 'عبد الله الحربي',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        licenseNumber: 'G-1029-LIC',
        isVerified: true,
        languagesEn: ['Arabic', 'English'],
        languagesAr: ['العربية', 'الإنجليزية'],
        specialtiesEn: ['Historical Monuments', 'Mountain Hiking'],
        specialtiesAr: ['الآثار التاريخية', 'المسارات الجبلية'],
        citiesCoveredEn: ['Riyadh', 'Abha'],
        citiesCoveredAr: ['الرياض', 'أبها'],
        pricePerHour: 50,
        pricePerDay: 300,
        rating: 4.8,
        reviewsCount: 34,
        yearsOfExperience: 5,
        availability: 'available',
        workingHoursEn: '08:00 AM - 08:00 PM',
        workingHoursAr: '08:00 ص - 08:00 م',
        servicesEn: ['City Tours', 'Historical walk', 'Desert Safari guide'],
        servicesAr: ['جولات المدينة', 'المسارات التراثية', 'رحلات السفاري البرية'],
        approximateLocation: { lat: 24.7200, lng: 46.6800 }
      },
      {
        id: 'guide_fatimah',
        userId: 'user_guide_fatimah',
        nameEn: 'Fatimah Al-Sudairy',
        nameAr: 'فاطمة السديري',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        licenseNumber: 'G-8812-LIC',
        isVerified: true,
        languagesEn: ['Arabic', 'English', 'French'],
        languagesAr: ['العربية', 'الإنجليزية', 'الفرنسية'],
        specialtiesEn: ['Archeology', 'Local Culinary Arts'],
        specialtiesAr: ['علم الآثار والمتاحف', 'تذوق الأطعمة المحلية'],
        citiesCoveredEn: ['AlUla', 'Jeddah'],
        citiesCoveredAr: ['العلا', 'جدة'],
        pricePerHour: 75,
        pricePerDay: 450,
        rating: 4.9,
        reviewsCount: 52,
        yearsOfExperience: 7,
        availability: 'available',
        workingHoursEn: '09:00 AM - 09:00 PM',
        workingHoursAr: '09:00 ص - 09:00 م',
        servicesEn: ['Hegra private tours', 'Culinary experiences'],
        servicesAr: ['جولات الحجر الخاصة', 'تجارب تذوق المأكولات المحلية'],
        approximateLocation: { lat: 26.6200, lng: 37.9200 }
      }
    ];
    db.saveGuides(initialGuides);
  }

  // 10. Seed Accommodations
  const accommodations = db.getAccommodations();
  if (accommodations.length === 0) {
    const initialAccommodations: Accommodation[] = [
      {
        id: 'hotel_riyadh_palace',
        nameEn: 'Riyadh Grand Palace Hotel',
        nameAr: 'فندق قصر الرياض الكبير',
        type: 'hotel',
        images: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80'
        ],
        cityId: 'riyadh',
        rating: 4.7,
        reviewsCount: 120,
        stars: 5,
        coordinates: { lat: 24.7111, lng: 46.6711 },
        descriptionEn: 'Five-star hotel offering state of the art luxury suite living in Riyadh central financial hub.',
        descriptionAr: 'فندق خمس نجوم يقدم أجنحة معيشة راقية وحديثة في قلب المركز المالي لمدينة الرياض.',
        facilitiesEn: ['Swimming Pool', 'Fitness Center', 'Spa', 'Free WiFi', 'Valet Parking'],
        facilitiesAr: ['حوض سباحة', 'مركز رياضي', 'سبا صحي', 'إنترنت مجاني', 'خدمة إيقاف السيارات'],
        checkInPolicyEn: '02:00 PM onwards',
        checkInPolicyAr: 'بدءاً من الساعة ٠٢:٠٠ ظهراً',
        checkOutPolicyEn: 'Until 12:00 PM',
        checkOutPolicyAr: 'حتى الساعة ١٢:٠٠ ظهراً',
        cancellationPolicyEn: 'Free cancellation 24 hours prior to check-in date.',
        cancellationPolicyAr: 'إلغاء مجاني قبل ٢٤ ساعة من تاريخ الدخول.',
        distanceFromCenterKm: 2.5,
        rooms: [
          {
            id: 'room_deluxe',
            nameEn: 'Deluxe King Room',
            nameAr: 'غرفة ديلوكس كينغ',
            pricePerNight: 550,
            capacityAdults: 2,
            capacityKids: 1,
            facilitiesEn: ['1 King Bed', 'City View', 'Mini Bar', 'Coffee Machine'],
            facilitiesAr: ['سرير كينغ كبير', 'إطلالة على المدينة', 'ثلاجة صغيرة', 'آلة قهوة'],
            availableCount: 15
          },
          {
            id: 'room_executive',
            nameEn: 'Executive Palace Suite',
            nameAr: 'جناح القصر التنفيذي',
            pricePerNight: 1200,
            capacityAdults: 3,
            capacityKids: 2,
            facilitiesEn: ['1 Super King Bed', 'Panoramic view', 'Living Room', 'Club access'],
            facilitiesAr: ['سرير سوبر كينغ', 'إطلالة بانورامية', 'صالة معيشة منفصلة', 'صلاحية النادي الخاص'],
            availableCount: 4
          }
        ]
      },
      {
        id: 'resort_alula_oasis',
        nameEn: 'AlUla Desert Oasis Resort',
        nameAr: 'منتجع واحة الصحراء بالعلا',
        type: 'resort',
        images: [
          'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=600&q=80'
        ],
        cityId: 'alula',
        rating: 4.9,
        reviewsCount: 89,
        stars: 5,
        coordinates: { lat: 26.6111, lng: 37.9111 },
        descriptionEn: 'Luxury boutique desert resort nested inside sandstone canyons with outdoor pools and stargazing pads.',
        descriptionAr: 'منتجع صحراوي فاخر يقع داخل المنحدرات الصخرية الفريدة في العلا مع مسابح مكشوفة ومواقع لرصد النجوم.',
        facilitiesEn: ['Sand Pool', 'Stargazing Platform', 'Guided tours', 'Outdoor Lounge'],
        facilitiesAr: ['مسبح رملي', 'منصة رصد النجوم', 'جولات إرشادية', 'مجلس خارجي مفتوح'],
        checkInPolicyEn: '03:00 PM onwards',
        checkInPolicyAr: 'بدءاً من الساعة ٠٣:٠٠ عصراً',
        checkOutPolicyEn: 'Until 11:00 AM',
        checkOutPolicyAr: 'حتى الساعة ١١:٠٠ صباحاً',
        cancellationPolicyEn: 'Non-refundable.',
        cancellationPolicyAr: 'غير مسترد القيمة.',
        distanceFromCenterKm: 12.0,
        rooms: [
          {
            id: 'room_canyon_villa',
            nameEn: 'Canyon Luxury Villa',
            nameAr: 'فيلا الوادي الفاخرة',
            pricePerNight: 2200,
            capacityAdults: 2,
            capacityKids: 2,
            facilitiesEn: ['Private outdoor pool', 'Fire pit', 'King bed'],
            facilitiesAr: ['مسبح خارجي خاص', 'موقد نار خارجي', 'سرير كينغ'],
            availableCount: 2
          }
        ]
      }
    ];
    db.saveAccommodations(initialAccommodations);
  }

  // 11. Seed Quote Requests
  const quotes = db.getQuoteRequests();
  if (quotes.length === 0) {
    const initialQuotes: QuoteRequest[] = [
      {
        id: 'quote_req_1',
        userId: 'user_sarah',
        userName: 'Sarah Miller',
        cities: ['Abha', 'AlUla'],
        startDate: '2026-08-15',
        daysCount: 5,
        budget: 'medium',
        notes: 'We need hotel reservations, breakfast, and hiking tour guides.',
        createdAt: new Date().toISOString()
      }
    ];
    db.saveQuoteRequests(initialQuotes);
  }

  // 12. Seed Quote Proposals
  const proposals = db.getQuoteProposals();
  if (proposals.length === 0) {
    const initialProposals: QuoteProposal[] = [
      {
        id: 'proposal_1',
        requestId: 'quote_req_1',
        officeId: 'office_saudi_tours',
        officeNameEn: 'Saudi Horizon Tours',
        officeNameAr: 'جولات الأفق السعودية',
        price: 3200,
        itinerarySummary: 'Includes 5-star hotel in Abha/AlUla, private guide for mountain hiking, and entry tickets.',
        status: 'pending'
      }
    ];
    db.saveQuoteProposals(initialProposals);
  }

  // 13. Seed Chat Sessions
  const chats = db.getChatSessions();
  if (chats.length === 0) {
    const initialChats: ChatSession[] = [
      {
        id: 'chat_sarah_abdullah',
        participants: ['user_sarah', 'guide_abdullah'],
        messages: [
          {
            senderId: 'guide_abdullah',
            senderName: 'Abdullah Al-Harbi',
            text: 'Hello Sarah! Welcome to LDF. I will be your mountain guide for your upcoming tour in Abha.',
            createdAt: new Date(Date.now() - 7200000).toISOString()
          },
          {
            senderId: 'user_sarah',
            senderName: 'Sarah Miller',
            text: 'Hi Abdullah! Glad to meet you. Can you recommend what to wear for the weather?',
            createdAt: new Date(Date.now() - 3600000).toISOString()
          },
          {
            senderId: 'guide_abdullah',
            senderName: 'Abdullah Al-Harbi',
            text: 'I suggest warm clothes as it gets breezy in Abha mountains at night. Here is the meeting point.',
            location: { lat: 18.2164, lng: 42.5053 },
            createdAt: new Date().toISOString()
          }
        ]
      }
    ];
    db.saveChatSessions(initialChats);
  }
}
