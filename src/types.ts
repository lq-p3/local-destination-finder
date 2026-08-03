export interface Destination {
  id: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  category: string;
  categoryAr?: string;
  categoryEn?: string;
  rating: number;
  reviews: number;
  distance: string;
  distanceAr?: string;
  distanceEn?: string;
  image: string;
  gallery: string[];
  description: string;
  descriptionAr?: string;
  descriptionEn?: string;
  theme: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}
