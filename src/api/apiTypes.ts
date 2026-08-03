export interface RegionApiModel {
  id: string;
  nameEn: string;
  nameAr: string;
  coverImage: string;
  descriptionEn: string;
  descriptionAr: string;
  bestTimeToVisitEn: string;
  bestTimeToVisitAr: string;
  famousFoodsEn: string[];
  famousFoodsAr: string[];
}

export interface WeatherApiModel {
  temp: number;
  statusEn: string;
  statusAr: string;
  wind: string;
}

export interface CoordinatesApiModel {
  lat: number;
  lng: number;
}

export interface CityApiModel {
  id: string;
  regionId: string;
  nameEn: string;
  nameAr: string;
  coverImage: string;
  descriptionEn: string;
  descriptionAr: string;
  weather: WeatherApiModel;
  coordinates: CoordinatesApiModel;
}

export interface RegionDetailsResponse {
  region: RegionApiModel;
  cities: CityApiModel[];
}
