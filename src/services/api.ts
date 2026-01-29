import axiosInstance from '../config/axiosConfig';

// ==================== TYPES ====================
export interface Location {
    id?: number;
    latitude: number;
    longitude: number;
    cityName: string;
    country: string;
    countryCode?: string;
}

export interface Weather {
    id?: number;
    temperature: number;
    humidity: number;
    description: string;
    uvIndex?: number;
    windSpeed: number;
    pressure: number;
    visibility: number;
    lastUpdated: string;
    locationId: number;
    cityName?: string;
}

export interface HealthAlert {
    id?: number;
    conditionType: 'UV_INDEX' | 'TEMPERATURE' | 'HUMIDITY' | 'WIND_SPEED' | 'AIR_QUALITY';
    thresholdMin?: number;
    thresholdMax?: number;
    recommendation: string;
    severity: 'INFO' | 'WARNING' | 'DANGER';
}

export interface WeatherHistory {
    id?: number;
    logDate: string;
    avgTemperature: number;
    maxTemperature?: number;
    minTemperature?: number;
    avgHumidity?: number;
    totalRainfall?: number;
    locationId: number;
    cityName?: string;
    hasHighVariation?: boolean;
}

// ==================== LOCATION API ====================
export const locationAPI = {
    getAll: () => axiosInstance.get<Location[]>('/locations'),

    getById: (id: number) => axiosInstance.get<Location>(`/locations/${id}`),

    searchByCity: (city: string) =>
        axiosInstance.get<Location>('/locations/search', { params: { city } }),

    // Tìm hoặc tạo location từ coordinates
    findOrCreateByCoordinates: (latitude: number, longitude: number) =>
        axiosInstance.post<Location>('/locations/coordinates', { latitude, longitude }),

    create: (location: Location) =>
        axiosInstance.post<Location>('/locations', location),

    update: (id: number, location: Location) =>
        axiosInstance.put<Location>(`/locations/${id}`, location),

    delete: (id: number) => axiosInstance.delete(`/locations/${id}`),
};

// ==================== WEATHER API ====================
export const weatherAPI = {
    getAll: () => axiosInstance.get<Weather[]>('/weather'),

    getByLocation: (locationId: number) =>
        axiosInstance.get<Weather>(`/weather/location/${locationId}`),

    refreshCache: (locationId: number) =>
        axiosInstance.post<string>(`/weather/refresh/${locationId}`),
};

// ==================== HEALTH ALERT API ====================
export const healthAlertAPI = {
    getAll: () => axiosInstance.get<HealthAlert[]>('/health-alerts'),

    getById: (id: number) =>
        axiosInstance.get<HealthAlert>(`/health-alerts/${id}`),

    checkAlerts: (weatherCacheId: number) =>
        axiosInstance.get<HealthAlert[]>(`/health-alerts/check/${weatherCacheId}`),

    create: (alert: HealthAlert) =>
        axiosInstance.post<HealthAlert>('/health-alerts', alert),

    update: (id: number, alert: HealthAlert) =>
        axiosInstance.put<HealthAlert>(`/health-alerts/${id}`, alert),

    delete: (id: number) => axiosInstance.delete(`/health-alerts/${id}`),
};

// ==================== WEATHER HISTORY API ====================
export const weatherHistoryAPI = {
    getAll: () => axiosInstance.get<WeatherHistory[]>('/weather-history'),

    getById: (id: number) =>
        axiosInstance.get<WeatherHistory>(`/weather-history/${id}`),

    getByLocation: (locationId: number) =>
        axiosInstance.get<WeatherHistory[]>(`/weather-history/location/${locationId}`),

    create: (history: WeatherHistory) =>
        axiosInstance.post<WeatherHistory>('/weather-history', history),

    update: (id: number, history: WeatherHistory) =>
        axiosInstance.put<WeatherHistory>(`/weather-history/${id}`, history),

    delete: (id: number) => axiosInstance.delete(`/weather-history/${id}`),
};