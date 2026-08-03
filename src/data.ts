import { Destination } from './types';

export const categories = [
  'All',
  'Nature',
  'Mountains',
  'Historical',
  'Events',
  'Restaurants',
  'Hotels',
  'Museums',
  'Religious',
  'Adventure'
];

export const destinations: Destination[] = [
  {
    id: 'alula',
    name: 'AlUla',
    nameEn: 'AlUla',
    nameAr: 'العلا',
    category: 'Historical',
    categoryEn: 'Historical',
    categoryAr: 'historical',
    rating: 4.9,
    reviews: 1240,
    distance: '3 hr flight',
    distanceEn: '3 hr flight',
    distanceAr: 'رحلة طيران ٣ ساعات',
    image: '/alula_hegra.jpg',
    gallery: [
      '/alula_hegra.jpg',
      'https://images.unsplash.com/photo-1625414811202-e223ed33405c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1610996537169-2f22e831c26b?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'A living museum of preserved tombs, sandstone outcrops, historic dwellings and monuments, both natural and human-made, that hold 200,000 years of largely unexplored human history.',
    descriptionEn: 'A living museum of preserved tombs, sandstone outcrops, historic dwellings and monuments, both natural and human-made, that hold 200,000 years of largely unexplored human history.',
    descriptionAr: 'متحف حي من المقابر المحفوظة والنتوءات الصخرية الرملية والمساكن والمعالم التاريخية، الطبيعية والبشرية، التي تختزل 200,000 عام من التاريخ البشري غير المستكشف إلى حد كبير.',
    theme: 'from-amber-700/80 to-yellow-900/90'
  },
  {
    id: 'abha',
    name: 'Abha',
    nameEn: 'Abha',
    nameAr: 'أبها',
    category: 'Mountains',
    categoryEn: 'Mountains',
    categoryAr: 'mountains',
    rating: 4.7,
    reviews: 856,
    distance: '2 hr flight',
    distanceEn: '2 hr flight',
    distanceAr: 'رحلة طيران ساعتين',
    image: '/abha_jacaranda.jpg',
    gallery: [
      '/abha_jacaranda.jpg',
      'https://images.unsplash.com/photo-1620619711690-d4fb2163b860?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1598418579978-22cc26090ee5?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Known for its mild climate, beautiful mountains, and rich heritage. Abha is the cultural capital of the Aseer region, offering stunning views from the high peaks and vibrant local markets.',
    descriptionEn: 'Known for its mild climate, beautiful mountains, and rich heritage. Abha is the cultural capital of the Aseer region, offering stunning views from the high peaks and vibrant local markets.',
    descriptionAr: 'تشتهر بمناخها المعتدل وجبالها الجميلة وتراثها الغني. أبها هي العاصمة الثقافية لمنطقة عسير، وتقدم إطلالات خلابة من القمم العالية والأسواق المحلية النابضة بالحياة.',
    theme: 'from-emerald-700/80 to-teal-900/90'
  },
  {
    id: 'riyadh',
    name: 'Riyadh',
    nameEn: 'Riyadh',
    nameAr: 'الرياض',
    category: 'Events',
    categoryEn: 'Events',
    categoryAr: 'events',
    rating: 4.8,
    reviews: 3420,
    distance: 'Current location',
    distanceEn: 'Current location',
    distanceAr: 'الموقع الحالي',
    image: '/riyadh_night.png',
    gallery: [
      '/riyadh_night.png',
      'https://images.unsplash.com/photo-1616421946806-6950798cd5d5?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'The dynamic capital city where modern skyscrapers meet historical roots. Experience luxury shopping, world-class dining, and spectacular entertainment seasons.',
    descriptionEn: 'The dynamic capital city where modern skyscrapers meet historical roots. Experience luxury shopping, world-class dining, and spectacular entertainment seasons.',
    descriptionAr: 'العاصمة الديناميكية حيث تلتقي ناطحات السحاب الحديثة بالجذور التاريخية. جرب التسوق الفاخر وتناول الطعام ذو المستوى العالمي ومواسم الترفيه المذهلة.',
    theme: 'from-blue-900/80 to-slate-900/90'
  },
  {
    id: 'jeddah',
    name: 'Jeddah',
    nameEn: 'Jeddah',
    nameAr: 'جدة',
    category: 'Nature',
    categoryEn: 'Nature',
    categoryAr: 'nature',
    rating: 4.6,
    reviews: 2150,
    distance: '1.5 hr flight',
    distanceEn: '1.5 hr flight',
    distanceAr: 'رحلة طيران ساعة ونصف',
    image: '/jeddah_corniche.jpg',
    gallery: [
      '/jeddah_corniche.jpg'
    ],
    description: 'The vibrant coastal city on the Red Sea, known for its historic Al-Balad district, beautiful corniche, and spectacular diving spots.',
    descriptionEn: 'The vibrant coastal city on the Red Sea, known for its historic Al-Balad district, beautiful corniche, and spectacular diving spots.',
    descriptionAr: 'المدينة الساحلية النابضة بالحياة على البحر الأحمر، وتشتهر بمنطقة البلد التاريخية وكورنيشها الجميل ومواقع الغوص المذهلة.',
    theme: 'from-cyan-700/80 to-blue-900/90'
  },
  {
    id: 'taif',
    name: 'Taif',
    nameEn: 'Taif',
    nameAr: 'الطائف',
    category: 'Mountains',
    categoryEn: 'Mountains',
    categoryAr: 'mountains',
    rating: 4.5,
    reviews: 620,
    distance: '2.5 hr drive',
    distanceEn: '2.5 hr drive',
    distanceAr: '٢.٥ ساعة بالسيارة',
    image: 'https://images.unsplash.com/photo-1632731057400-f925c4efc587?auto=format&fit=crop&w=2000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1632731057400-f925c4efc587?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'The City of Roses, perched high in the mountains. Famous for its pleasant weather, fragrant rose farms, and scenic winding mountain roads.',
    descriptionEn: 'The City of Roses, perched high in the mountains. Famous for its pleasant weather, fragrant rose farms, and scenic winding mountain roads.',
    descriptionAr: 'مدينة الورود، تقع في أعالي الجبال. تشتهر بطقسها اللطيف ومزارع الورود العطرة والطرق الجبلية المتعرجة الخلابة.',
    theme: 'from-purple-700/80 to-fuchsia-900/90'
  },
  {
    id: 'neom',
    name: 'NEOM',
    nameEn: 'NEOM',
    nameAr: 'نيوم',
    category: 'Adventure',
    categoryEn: 'Adventure',
    categoryAr: 'adventure',
    rating: 4.9,
    reviews: 412,
    distance: '2 hr flight',
    distanceEn: '2 hr flight',
    distanceAr: 'رحلة طيران ساعتين',
    image: 'https://images.unsplash.com/photo-1682687981974-c5ef2111640c?auto=format&fit=crop&w=2000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1682687981974-c5ef2111640c?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'A vision of what a new future might look like, featuring breathtaking natural landscapes from the Red Sea coast to snow-capped mountains.',
    descriptionEn: 'A vision of what a new future might look like, featuring breathtaking natural landscapes from the Red Sea coast to snow-capped mountains.',
    descriptionAr: 'رؤية لما قد يبدو عليه المستقبل الجديد، وتتميز بمناظر طبيعية خلابة من ساحل البحر الأحمر إلى الجبال التي تغطيها الثلوج.',
    theme: 'from-slate-700/80 to-black/90'
  }
];
