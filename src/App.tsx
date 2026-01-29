import React, { useState, useEffect } from 'react';
import LocationSelector from './components/LocationSelector';
import SwipeableWeatherCard from './components/SwipeableWeatherCard';
import HealthAlertList from './components/HealthAlertList';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
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

    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [currentWeather, setCurrentWeather] = useState<Weather | null>(null);
    const [alerts, setAlerts] = useState<HealthAlert[]>([]);

    // History data storage
    const [allHistoryData, setAllHistoryData] = useState<WeatherHistory[]>([]);
    const [weatherDataMap, setWeatherDataMap] = useState<Map<string, WeatherHistory | null>>(new Map());

    // Date management
    const [dates, setDates] = useState<Date[]>([]);
    const [currentDateIndex, setCurrentDateIndex] = useState(0);

    // Loading states
    const [loadingWeather, setLoadingWeather] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [loadingAlerts, setLoadingAlerts] = useState(false);

    const [error, setError] = useState<string | null>(null);

    // Generate date array (30 days back to today)
    useEffect(() => {
        const generateDates = () => {
            const dateArray: Date[] = [];
            const today = new Date();

            // Generate 30 days (from 30 days ago to today)
            for (let i = 29; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                dateArray.push(date);
            }

            return dateArray;
        };

        const generatedDates = generateDates();
        setDates(generatedDates);
        // Set index to today (last item)
        setCurrentDateIndex(generatedDates.length - 1);
    }, []);

    // Fetch data when location selected
    useEffect(() => {
        if (selectedLocation?.id) {
            fetchCurrentWeather(selectedLocation.id);
            fetchHistoryData(selectedLocation.id);
        }
    }, [selectedLocation]);

    // Fetch alerts when on today's date and have weather
    useEffect(() => {
        const isToday = dates[currentDateIndex]?.toDateString() === new Date().toDateString();

        if (currentWeather?.id && isToday) {
            fetchAlerts(currentWeather.id);
        } else {
            setAlerts([]);
        }
    }, [currentDateIndex, dates, currentWeather]);

    const fetchCurrentWeather = async (locationId: number) => {
        setLoadingWeather(true);
        setError(null);
        try {
            const response = await weatherAPI.getByLocation(locationId);
            setCurrentWeather(response.data);
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

            historyData.forEach((record: WeatherHistory) => {
                const dateKey = new Date(record.logDate).toISOString().split('T')[0];
                dataMap.set(dateKey, record);
            });

            setWeatherDataMap(dataMap);

            console.log('📊 Đã tải', historyData.length, 'bản ghi lịch sử');
        } catch (err: any) {
            console.error('Không thể tải lịch sử:', err);
            setAllHistoryData([]);
            setWeatherDataMap(new Map());
        } finally {
            setLoadingHistory(false);
        }
    };

    const fetchAlerts = async (weatherCacheId: number) => {
        setLoadingAlerts(true);
        try {
            const response = await healthAlertAPI.checkAlerts(weatherCacheId);
            setAlerts(response.data);
        } catch (err: any) {
            console.error('Không thể tải cảnh báo:', err);
            setAlerts([]);
        } finally {
            setLoadingAlerts(false);
        }
    };

    const handleRefreshWeather = async () => {
        if (!selectedLocation?.id) return;

        setLoadingWeather(true);
        try {
            await weatherAPI.refreshCache(selectedLocation.id);
            await fetchCurrentWeather(selectedLocation.id);
        } catch (err: any) {
            setError('Không thể làm mới dữ liệu');
        } finally {
            setLoadingWeather(false);
        }
    };

    const handleQuickJump = (daysBack: number) => {
        const targetIndex = dates.length - 1 - daysBack;
        if (targetIndex >= 0 && targetIndex < dates.length) {
            setCurrentDateIndex(targetIndex);
        }
    };

    const isToday = dates[currentDateIndex]?.toDateString() === new Date().toDateString();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50
                      dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
            {/* Header */}
            <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg
                             transition-colors sticky top-0 z-50 border-b border-gray-200
                             dark:border-gray-700">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r
                                         from-blue-600 to-purple-600 dark:from-blue-400
                                         dark:to-purple-400 bg-clip-text text-transparent">
                                🌤️ Smart Weather
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                Vuốt để xem thời tiết các ngày
                            </p>
                        </div>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200
                                     dark:from-gray-700 dark:to-gray-600 hover:scale-110
                                     transition-transform shadow-lg"
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
            <main className="container mx-auto px-4 py-6 max-w-2xl">
                {/* Location Selector */}
                <LocationSelector
                    onSelect={setSelectedLocation}
                    selectedLocationId={selectedLocation?.id}
                />

                {/* Content Area */}
                {!selectedLocation ? (
                    <div className="text-center py-16">
                        <div className="text-8xl mb-6 animate-bounce">📍</div>
                        <h2 className="text-3xl font-bold text-gray-700 dark:text-gray-300 mb-3">
                            Chọn địa điểm
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                            Để bắt đầu xem thời tiết
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Error Message */}
                        {error && (
                            <ErrorMessage
                                message={error}
                                onRetry={() => selectedLocation.id && fetchCurrentWeather(selectedLocation.id)}
                            />
                        )}

                        {/* Loading State */}
                        {(loadingWeather || loadingHistory) && dates.length === 0 ? (
                            <LoadingSpinner message="Đang tải dữ liệu thời tiết..." />
                        ) : dates.length > 0 ? (
                            <>
                                {/* Quick Jump Buttons */}
                                <div className="flex justify-center gap-2 flex-wrap">
                                    <button
                                        onClick={() => handleQuickJump(0)}
                                        className={`px-4 py-2 rounded-full font-medium transition-all ${
                                            isToday
                                                ? 'bg-blue-500 text-white shadow-lg scale-105'
                                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        📍 Hôm nay
                                    </button>
                                    <button
                                        onClick={() => handleQuickJump(1)}
                                        className="px-4 py-2 rounded-full bg-white dark:bg-gray-800
                                                 text-gray-700 dark:text-gray-300 hover:bg-blue-50
                                                 dark:hover:bg-gray-700 font-medium transition-all"
                                    >
                                        Hôm qua
                                    </button>
                                    <button
                                        onClick={() => handleQuickJump(7)}
                                        className="px-4 py-2 rounded-full bg-white dark:bg-gray-800
                                                 text-gray-700 dark:text-gray-300 hover:bg-blue-50
                                                 dark:hover:bg-gray-700 font-medium transition-all"
                                    >
                                        7 ngày trước
                                    </button>
                                    <button
                                        onClick={() => handleQuickJump(30)}
                                        className="px-4 py-2 rounded-full bg-white dark:bg-gray-800
                                                 text-gray-700 dark:text-gray-300 hover:bg-blue-50
                                                 dark:hover:bg-gray-700 font-medium transition-all"
                                    >
                                        30 ngày trước
                                    </button>
                                </div>

                                {/* Swipeable Weather Card */}
                                <SwipeableWeatherCard
                                    dates={dates}
                                    currentIndex={currentDateIndex}
                                    onIndexChange={setCurrentDateIndex}
                                    weatherData={weatherDataMap}
                                    currentWeather={isToday ? currentWeather : null}
                                    locationName={selectedLocation.cityName}
                                    onRefresh={isToday ? handleRefreshWeather : undefined}
                                />

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

                                {/* Info Box */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4
                                              border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">💡</span>
                                        <div className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                                            <div className="font-semibold mb-1">Cách sử dụng:</div>
                                            <ul className="space-y-1">
                                                <li>• <strong>Vuốt sang trái/phải</strong> để xem ngày khác</li>
                                                <li>• <strong>Click dots</strong> ở trên để jump nhanh</li>
                                                <li>• <strong>Dùng phím ← →</strong> trên bàn phím</li>
                                                <li>• <strong>Click quick buttons</strong> để jump đến ngày cụ thể</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

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
                            </>
                        ) : null}
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
                        <span className="ml-1">Powered by OpenWeatherMap API</span>
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default App;