import { DestinationApiModel } from '../api/destinationTypes';
import { Destination } from '../types/models';

export function mapDestinationApiToDestination(apiModel: DestinationApiModel): Destination {
  return {
    id: apiModel.id,
    cityId: apiModel.cityId || 'riyadh',
    nameEn: apiModel.nameEn,
    nameAr: apiModel.nameAr,
    category: apiModel.category || 'Historical',
    rating: apiModel.rating ?? 5.0,
    reviews: apiModel.reviews ?? 0,
    image: apiModel.image || '/riyadh_masmak.jpg',
    gallery: (apiModel.gallery && apiModel.gallery.length > 0) ? apiModel.gallery : [apiModel.image || '/riyadh_masmak.jpg'],
    descriptionEn: apiModel.descriptionEn || '',
    descriptionAr: apiModel.descriptionAr || '',
    coordinates: {
      lat: apiModel.coordinates?.lat ?? 24.7136,
      lng: apiModel.coordinates?.lng ?? 46.6753
    },
    workingHoursEn: apiModel.workingHoursEn || '9:00 AM - 6:00 PM',
    workingHoursAr: apiModel.workingHoursAr || '9:00 ص - 6:00 م',
    entryFees: apiModel.entryFees ?? 0,
    contactInfo: {
      phone: apiModel.contactInfo?.phone || '',
      email: apiModel.contactInfo?.email || ''
    },
    priceLevel: (apiModel.priceLevel as '$' | '$$' | '$$$') || '$$',
    servicesEn: apiModel.servicesEn || [],
    servicesAr: apiModel.servicesAr || [],
    suitability: {
      families: apiModel.suitability?.families ?? true,
      kids: apiModel.suitability?.kids ?? true,
      elderly: apiModel.suitability?.elderly ?? true,
      disabled: apiModel.suitability?.disabled ?? true
    },
    status: (apiModel.status as any) || 'approved',
    submittedBy: apiModel.submittedBy,
    distanceEn: apiModel.distanceEn || 'Current location',
    distanceAr: apiModel.distanceAr || 'الموقع الحالي'
  };
}
