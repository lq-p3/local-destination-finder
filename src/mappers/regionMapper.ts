import { RegionApiModel, CityApiModel } from '../api/apiTypes';
import { Region, City } from '../../server/types';

export function mapRegionApiToRegion(apiModel: RegionApiModel): Region {
  return {
    id: apiModel.id,
    nameEn: apiModel.nameEn,
    nameAr: apiModel.nameAr,
    coverImage: apiModel.coverImage || '/alula_hegra.jpg',
    descriptionEn: apiModel.descriptionEn,
    descriptionAr: apiModel.descriptionAr,
    bestTimeToVisitEn: apiModel.bestTimeToVisitEn,
    bestTimeToVisitAr: apiModel.bestTimeToVisitAr,
    famousFoodsEn: apiModel.famousFoodsEn || [],
    famousFoodsAr: apiModel.famousFoodsAr || []
  };
}

export function mapCityApiToCity(apiModel: CityApiModel): City {
  return {
    id: apiModel.id,
    regionId: apiModel.regionId,
    nameEn: apiModel.nameEn,
    nameAr: apiModel.nameAr,
    coverImage: apiModel.coverImage || '/riyadh_night.png',
    descriptionEn: apiModel.descriptionEn,
    descriptionAr: apiModel.descriptionAr,
    weather: {
      temp: apiModel.weather?.temp ?? 25,
      statusEn: apiModel.weather?.statusEn || 'Clear Sky',
      statusAr: apiModel.weather?.statusAr || 'سماء صافية',
      wind: apiModel.weather?.wind || '10 km/h'
    },
    coordinates: {
      lat: apiModel.coordinates?.lat ?? 24.7136,
      lng: apiModel.coordinates?.lng ?? 46.6753
    }
  };
}
