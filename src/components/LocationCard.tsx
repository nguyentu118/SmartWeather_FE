import React, { useState, useEffect } from 'react';
import { type Location, locationAPI } from '../services/api';
import { useGeolocation } from '../hooks/useGeolocation';

interface LocationCardProps {
    onLocationReady: (location: Location) => void;
}

const LocationCard: React.FC<LocationCardProps> = ({ onLocationReady }) => {
    const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
    const [loading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDetecting, setIsDetecting] = useState(false);

    const { position, error: geoError, loading: geoLoading, getLocation } = useGeolocation();

    // Auto-detect location on mount
    useEffect(() => {
        handleAutoDetect();
    }, []);

    // Process GPS coordinates when available
    useEffect(() => {
        if (position && !currentLocation) {
            handlePositionDetected(position.latitude, position.longitude);
        }
    }, [position]);

    const handleAutoDetect = () => {
        setError(null);
        getLocation();
    };

    const handlePositionDetected = async (latitude: number, longitude: number) => {
        setIsDetecting(true);
        setError(null);

        try {
            console.log('📍 Tọa độ:', latitude, longitude);

            // Gọi API để tìm hoặc tạo location từ coordinates
            const response = await locationAPI.findOrCreateByCoordinates(latitude, longitude);
            const location = response.data;

            console.log('✅ Location:', location);

            setCurrentLocation(location);
            onLocationReady(location);

        } catch (err: any) {
            console.error('❌ Lỗi:', err);
            setError(
                err.response?.data?.message ||
                'Không thể xác định vị trí. Vui lòng thử lại.'
            );
        } finally {
            setIsDetecting(false);
        }
    };

    const handleManualInput = async () => {
        const latitude = prompt('Nhập latitude (VD: 21.028):');
        const longitude = prompt('Nhập longitude (VD: 105.854):');

        if (latitude && longitude) {
            const lat = parseFloat(latitude);
            const lon = parseFloat(longitude);

            if (!isNaN(lat) && !isNaN(lon)) {
                await handlePositionDetected(lat, lon);
            } else {
                setError('Tọa độ không hợp lệ');
            }
        }
    };

    const handleChangeLocation = () => {
        setCurrentLocation(null);
        setError(null);
        handleAutoDetect();
    };

    // Loading state
    if (loading || geoLoading || isDetecting) {
        return (
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-2xl p-8 text-white">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-white/30 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-20 h-20 border-4 border-white
                                      rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl font-bold mb-2">
                            {geoLoading ? '📍 Đang lấy vị trí GPS...' : '🔍 Đang xác định địa điểm...'}
                        </div>
                        <div className="text-sm text-white/80">
                            {geoLoading ? 'Vui lòng cho phép truy cập vị trí' : 'Đang tìm kiếm thông tin địa điểm'}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error || geoError) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border-4 border-red-400">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="text-6xl">⚠️</div>
                    <div>
                        <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
                            Không thể lấy vị trí
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                            {error || geoError}
                        </p>
                    </div>

                    {geoError?.includes('từ chối') && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm
                                      text-gray-700 dark:text-gray-300 w-full">
                            <div className="font-semibold mb-2">💡 Cách bật quyền truy cập:</div>
                            <ol className="list-decimal list-inside space-y-1 text-left">
                                <li>Click biểu tượng 🔒 trên thanh địa chỉ</li>
                                <li>Chọn "Site settings" hoặc "Cài đặt trang"</li>
                                <li>Bật "Location" hoặc "Vị trí"</li>
                                <li>Tải lại trang</li>
                            </ol>
                        </div>
                    )}

                    <div className="flex gap-3 w-full">
                        <button
                            onClick={handleAutoDetect}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3
                                     rounded-xl font-semibold transition-all hover:scale-105
                                     shadow-lg"
                        >
                            🔄 Thử lại
                        </button>
                        <button
                            onClick={handleManualInput}
                            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3
                                     rounded-xl font-semibold transition-all hover:scale-105
                                     shadow-lg"
                        >
                            ✏️ Nhập thủ công
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Success state - Show location
    if (currentLocation) {
        return (
            <div className="bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl
                          shadow-2xl p-6 text-white relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full
                              -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full
                              -ml-12 -mb-12"></div>

                {/* Content */}
                <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center
                                          justify-center backdrop-blur-sm">
                                <span className="text-2xl">📍</span>
                            </div>
                            <div>
                                <div className="text-xs text-white/80 uppercase tracking-wide">
                                    Vị trí của bạn
                                </div>
                                <div className="text-sm text-white/60">
                                    Đã xác định tự động
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleChangeLocation}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            title="Đổi vị trí"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>

                    {/* Location Info */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="text-3xl">🏙️</div>
                            <div className="flex-1">
                                <div className="text-2xl font-bold">
                                    {currentLocation.cityName}
                                </div>
                                <div className="text-sm text-white/80">
                                    {currentLocation.country}
                                </div>
                            </div>
                        </div>

                        {/* Coordinates */}
                        <div className="pt-3 border-t border-white/20">
                            <div className="text-xs text-white/60 mb-1">Tọa độ GPS:</div>
                            <div className="flex gap-4 text-sm font-mono">
                                <div>
                                    <span className="text-white/80">Lat:</span>{' '}
                                    <span className="font-semibold">
                                        {currentLocation.latitude.toFixed(4)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-white/80">Lon:</span>{' '}
                                    <span className="font-semibold">
                                        {currentLocation.longitude.toFixed(4)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action hint */}
                    <div className="mt-4 text-center text-xs text-white/60">
                        ✨ Ứng dụng sẽ hiển thị thời tiết tại vị trí này
                    </div>
                </div>
            </div>
        );
    }

    // Initial state - Prompt to detect
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border-4
                      border-blue-400 dark:border-blue-600">
            <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500
                              rounded-full flex items-center justify-center">
                    <span className="text-4xl">📍</span>
                </div>

                <div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                        Xác định vị trí
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Cho phép truy cập vị trí để xem thời tiết chính xác
                    </p>
                </div>

                <button
                    onClick={handleAutoDetect}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600
                             hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-4
                             rounded-xl font-semibold text-lg transition-all hover:scale-105
                             shadow-lg hover:shadow-xl"
                >
                    <span className="flex items-center justify-center gap-2">
                        <span className="text-2xl">🎯</span>
                        <span>Lấy vị trí của tôi</span>
                    </span>
                </button>

                <button
                    onClick={handleManualInput}
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                    Hoặc nhập tọa độ thủ công
                </button>
            </div>
        </div>
    );
};

export default LocationCard;