import React from 'react';
import type {Weather} from '../services/api';

interface WeatherCardProps {
    weather: Weather;
    onRefresh?: () => void;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ weather, onRefresh }) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl
                      transition-all">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                        {weather.cityName}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Cập nhật: {formatDate(weather.lastUpdated)}
                    </p>
                </div>
                {onRefresh && (
                    <button
                        onClick={onRefresh}
                        className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600
                                 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg
                                 transition-colors"
                    >
                        🔄 Làm mới
                    </button>
                )}
            </div>

            {/* Temperature */}
            <div className="text-center mb-6">
                <div className="text-6xl font-bold text-blue-600 dark:text-blue-400">
                    {weather.temperature}°C
                </div>
                <p className="text-xl text-gray-600 dark:text-gray-300 mt-2">
                    {weather.description}
                </p>
            </div>

            {/* Weather Details Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                    <div className="text-gray-600 dark:text-gray-400 text-sm">Độ ẩm</div>
                    <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                        {weather.humidity}%
                    </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                    <div className="text-gray-600 dark:text-gray-400 text-sm">Tốc độ gió</div>
                    <div className="text-2xl font-semibold text-green-600 dark:text-green-400">
                        {weather.windSpeed} km/h
                    </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
                    <div className="text-gray-600 dark:text-gray-400 text-sm">Áp suất</div>
                    <div className="text-2xl font-semibold text-purple-600 dark:text-purple-400">
                        {weather.pressure} hPa
                    </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg">
                    <div className="text-gray-600 dark:text-gray-400 text-sm">Tầm nhìn</div>
                    <div className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">
                        {weather.visibility} km
                    </div>
                </div>

                {weather.uvIndex && (
                    <div className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-lg col-span-2">
                        <div className="text-gray-600 dark:text-gray-400 text-sm">UV Index</div>
                        <div className="text-2xl font-semibold text-orange-600 dark:text-orange-400">
                            {weather.uvIndex}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WeatherCard;