import React, { useState, useEffect } from 'react';
import LocationCard from './components/LocationCard';
import DateTabs from './components/DateTabs';
import HealthAlertList from './components/HealthAlertList';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import UVIndexCard from './components/UVIndexCard';
import { useTheme } from './context/ThemeContext';
import {
    type Location,
    type Weather,
    type HealthAlert,
    type WeatherHistory,
    weatherAPI,
    healthAlertAPI,
    weatherHistoryAPI,
} from './services/api';
import './App.css';

const App: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    const [userLocation, setUserLocation] = useState<Location | null>(null);
    const [currentWeather, setCurrentWeather] = useState<Weather | null>(null);
    const [alerts, setAlerts] = useState<HealthAlert[]>([]);

    // History data storage
    const [allHistoryData, setAllHistoryData] = useState<WeatherHistory[]>([]);
    const [weatherDataMap, setWeatherDataMap] = useState<Map<string, WeatherHistory | null>>(new Map());

    // Available dates (dates with data)
    const [availableDates, setAvailableDates] = useState<Date[]>([]);

    // Date management
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    // Loading states
    const [loadingWeather, setLoadingWeather] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [loadingAlerts, setLoadingAlerts] = useState(false);

    const [error, setError] = useState<string | null>(null);

    // Fetch data when location is ready
    useEffect(() => {
        if (userLocation?.id) {
            fetchCurrentWeather(userLocation.id);
            fetchHistoryData(userLocation.id);
        }
    }, [userLocation]);

    // Fetch alerts when on today's date and have weather
    useEffect(() => {
        const isToday = selectedDate.toDateString() === new Date().toDateString();

        if (currentWeather?.id && isToday) {
            fetchAlerts(currentWeather.id);
        } else {
            setAlerts([]);
        }
    }, [selectedDate, currentWeather]);

    const fetchCurrentWeather = async (locationId: number) => {
        setLoadingWeather(true);
        setError(null);
        try {
            const response = await weatherAPI.getByLocation(locationId);
            setCurrentWeather(response.data);
            console.log('✅ Weather data:', response.data);
            console.log('☀️ UV Index:', response.data.uvIndex);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Không thể tải dữ liệu thời tiết');
            setCurrentWeather(null);
        } finally {
            setLoadingWeather(false);
        }
    };

    const fetchHistoryData = async (locationId: number) => {
        setLoadingHistory(true);
        try {
            const response = await weatherHistoryAPI.getByLocation(locationId);
            const historyData = response.data;

            setAllHistoryData(historyData);

            // Create map for quick lookup
            const dataMap = new Map<string, WeatherHistory | null>();
            const dates: Date[] = [];

            historyData.forEach((record: WeatherHistory) => {
                const dateKey = new Date(record.logDate).toISOString().split('T')[0];
                const date = new Date(record.logDate);
                dataMap.set(dateKey, record);
                dates.push(date);
            });

            // Add today if has current weather
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (!dates.some(d => d.toDateString() === today.toDateString())) {
                dates.push(today);
            }

            setWeatherDataMap(dataMap);
            setAvailableDates(dates);

            console.log('📊 Đã tải', historyData.length, 'bản ghi lịch sử');
        } catch (err: any) {
            console.error('Không thể tải lịch sử:', err);
            setAllHistoryData([]);
            setWeatherDataMap(new Map());
            setAvailableDates([new Date()]); // At least today
        } finally {
            setLoadingHistory(false);
        }
    };

    const fetchAlerts = async (weatherCacheId: number) => {
        setLoadingAlerts(true);
        try {
            const response = await healthAlertAPI.checkAlerts(weatherCacheId);
            setAlerts(response.data);
            console.log('🔔 Cảnh báo:', response.data.length);
        } catch (err: any) {
            console.error('Không thể tải cảnh báo:', err);
            setAlerts([]);
        } finally {
            setLoadingAlerts(false);
        }
    };

    const handleRefreshWeather = async () => {
        if (!userLocation?.id) return;

        setLoadingWeather(true);
        try {
            await weatherAPI.refreshCache(userLocation.id);
            await fetchCurrentWeather(userLocation.id);
        } catch (err: any) {
            setError('Không thể làm mới dữ liệu');
        } finally {
            setLoadingWeather(false);
        }
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
    };

    const handleLocationReady = (location: Location) => {
        console.log('✅ Location ready:', location);
        setUserLocation(location);
    };

    const isToday = selectedDate.toDateString() === new Date().toDateString();
    const isFuture = selectedDate > new Date();
    const dateKey = selectedDate.toISOString().split('T')[0];
    const currentData = isToday ? currentWeather : weatherDataMap.get(dateKey) || null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50
                      dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
            {/* Header */}
            <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg
                             border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50
                             transition-colors">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600
                                          rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-2xl">🌤️</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600
                                             to-indigo-600 dark:from-blue-400 dark:to-indigo-400
                                             bg-clip-text text-transparent">
                                    Smart Weather
                                </h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Dự báo thời tiết thông minh với cảnh báo UV
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={toggleTheme}
                            className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200
                                     dark:hover:bg-gray-600 transition-all"
                            aria-label="Toggle theme"
                        >
                            <span className="text-2xl">
                                {theme === 'light' ? '🌙' : '☀️'}
                            </span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {!userLocation ? (
                    <div className="max-w-2xl mx-auto">
                        <LocationCard onLocationReady={handleLocationReady} />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Location Info */}
                        <LocationCard onLocationReady={handleLocationReady} />

                        {/* Date Tabs */}
                        {availableDates.length > 0 && (
                            <DateTabs
                                dates={availableDates}
                                selectedDate={selectedDate}
                                onSelectDate={handleDateSelect}
                            />
                        )}

                        {/* Error Message */}
                        {error && (
                            <ErrorMessage
                                message={error}
                                onRetry={() => userLocation?.id && fetchCurrentWeather(userLocation.id)}
                            />
                        )}

                        {/* Weather Data */}
                        {loadingWeather ? (
                            <LoadingSpinner message="Đang tải dữ liệu thời tiết..." />
                        ) : (
                            <div className="space-y-6">
                                {currentData ? (
                                    isToday && currentWeather ? (
                                        // TODAY - Full Weather Data with UV
                                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
                                            {/* Header with refresh */}
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                                                        {currentWeather.cityName}
                                                    </h2>
                                                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                                                        Cập nhật: {new Date(currentWeather.lastUpdated).toLocaleString('vi-VN')}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={handleRefreshWeather}
                                                    disabled={loadingWeather}
                                                    className="bg-gradient-to-r from-blue-500 to-indigo-600
                                                             hover:from-blue-600 hover:to-indigo-700
                                                             disabled:opacity-50 disabled:cursor-not-allowed
                                                             text-white px-5 py-2 rounded-xl
                                                             transition-all hover:scale-105 shadow-lg
                                                             flex items-center gap-2"
                                                >
                                                    <span className={loadingWeather ? 'animate-spin' : ''}>🔄</span>
                                                    <span>Làm mới</span>
                                                </button>
                                            </div>

                                            {/* Temperature & Description */}
                                            <div className="text-center">
                                                <div className="text-7xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                                                    {currentWeather.temperature}°C
                                                </div>
                                                <p className="text-2xl text-gray-600 dark:text-gray-300 capitalize">
                                                    {currentWeather.description}
                                                </p>
                                            </div>

                                            {/* Grid: Weather Details + UV */}
                                            <div className="grid lg:grid-cols-2 gap-6">
                                                {/* Left: Weather Details */}
                                                <div className="space-y-3">
                                                    <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                                        <span>📊</span>
                                                        <span>Thông tin chi tiết</span>
                                                    </h3>

                                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100
                                                                  dark:from-blue-900/30 dark:to-blue-800/30
                                                                  p-4 rounded-xl">
                                                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                            💧 Độ ẩm
                                                        </div>
                                                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                                            {currentWeather.humidity}%
                                                        </div>
                                                    </div>

                                                    <div className="bg-gradient-to-br from-green-50 to-green-100
                                                                  dark:from-green-900/30 dark:to-green-800/30
                                                                  p-4 rounded-xl">
                                                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                            💨 Tốc độ gió
                                                        </div>
                                                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                                                            {currentWeather.windSpeed}
                                                        </div>
                                                        <div className="text-xs text-gray-600 dark:text-gray-400">km/h</div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="bg-gradient-to-br from-purple-50 to-purple-100
                                                                      dark:from-purple-900/30 dark:to-purple-800/30
                                                                      p-4 rounded-xl">
                                                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                                🌡️ Áp suất
                                                            </div>
                                                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                                                {currentWeather.pressure}
                                                            </div>
                                                            <div className="text-xs text-gray-600 dark:text-gray-400">hPa</div>
                                                        </div>

                                                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100
                                                                      dark:from-yellow-900/30 dark:to-yellow-800/30
                                                                      p-4 rounded-xl">
                                                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                                👁️ Tầm nhìn
                                                            </div>
                                                            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                                                {currentWeather.visibility}
                                                            </div>
                                                            <div className="text-xs text-gray-600 dark:text-gray-400">km</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right: UV Index Card */}
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                                        <span>☀️</span>
                                                        <span>Chỉ số tia UV</span>
                                                    </h3>
                                                    <UVIndexCard uvIndex={currentWeather.uvIndex} />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        // HISTORY DATA
                                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                                            <div className="text-center mb-8">
                                                <div className="text-7xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                                                    {(currentData as WeatherHistory).avgTemperature}°C
                                                </div>
                                                <p className="text-xl text-gray-600 dark:text-gray-300">
                                                    Nhiệt độ trung bình
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-gradient-to-br from-red-50 to-red-100
                                                              dark:from-red-900/30 dark:to-red-800/30
                                                              p-4 rounded-xl">
                                                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                        🔥 Cao nhất
                                                    </div>
                                                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                                                        {(currentData as WeatherHistory).maxTemperature}°C
                                                    </div>
                                                </div>

                                                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100
                                                              dark:from-cyan-900/30 dark:to-cyan-800/30
                                                              p-4 rounded-xl">
                                                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                        ❄️ Thấp nhất
                                                    </div>
                                                    <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                                                        {(currentData as WeatherHistory).minTemperature}°C
                                                    </div>
                                                </div>

                                                <div className="bg-gradient-to-br from-green-50 to-green-100
                                                              dark:from-green-900/30 dark:to-green-800/30
                                                              p-4 rounded-xl">
                                                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                        💧 Độ ẩm TB
                                                    </div>
                                                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                                                        {(currentData as WeatherHistory).avgHumidity}%
                                                    </div>
                                                </div>

                                                <div className="bg-gradient-to-br from-purple-50 to-purple-100
                                                              dark:from-purple-900/30 dark:to-purple-800/30
                                                              p-4 rounded-xl">
                                                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                        🌧️ Lượng mưa
                                                    </div>
                                                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                                        {(currentData as WeatherHistory).totalRainfall || 0}
                                                    </div>
                                                    <div className="text-xs text-gray-600 dark:text-gray-400">mm</div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                ) : (
                                    // NO DATA
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
                                        <div className="text-6xl mb-4">📭</div>
                                        <div className="text-xl text-gray-600 dark:text-gray-400 mb-2">
                                            Không có dữ liệu
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-500">
                                            Chưa có thông tin thời tiết cho ngày này
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Alerts (chỉ hiển thị khi là hôm nay) */}
                        {isToday && (
                            <>
                                {loadingAlerts ? (
                                    <LoadingSpinner message="Đang kiểm tra cảnh báo..." />
                                ) : (
                                    <HealthAlertList alerts={alerts} />
                                )}
                            </>
                        )}

                        {/* Stats Summary */}
                        {allHistoryData.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                                    📊 Thống kê 30 ngày
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            Nhiệt độ TB
                                        </div>
                                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                            {(allHistoryData.reduce((sum, h) => sum + Number(h.avgTemperature), 0) /
                                                allHistoryData.length).toFixed(1)}°C
                                        </div>
                                    </div>
                                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            Độ ẩm TB
                                        </div>
                                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            {(allHistoryData.reduce((sum, h) => sum + Number(h.avgHumidity || 0), 0) /
                                                allHistoryData.length).toFixed(1)}%
                                        </div>
                                    </div>
                                    <div className="text-center p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            Nhiệt cao nhất
                                        </div>
                                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                            {Math.max(...allHistoryData.map(h => Number(h.maxTemperature || 0)))}°C
                                        </div>
                                    </div>
                                    <div className="text-center p-3 bg-cyan-50 dark:bg-cyan-900/30 rounded-lg">
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            Nhiệt thấp nhất
                                        </div>
                                        <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                                            {Math.min(...allHistoryData.map(h => Number(h.minTemperature || 100)))}°C
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-t
                             border-gray-200 dark:border-gray-700 mt-12 transition-colors">
                <div className="container mx-auto px-4 py-6 text-center text-gray-600
                              dark:text-gray-400">
                    <p className="text-sm">
                        © {new Date().getFullYear()} Smart Weather App |
                        <span className="ml-1">Powered by OpenWeatherMap & UV API</span>
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default App;