import React, { useState, useEffect } from 'react';
import {type Location, locationAPI } from '../services/api';
import { useGeolocation } from '../hooks/useGeolocation';

interface LocationSelectorProps {
    onSelect: (location: Location) => void;
    selectedLocationId?: number;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
                                                               onSelect,
                                                               selectedLocationId
                                                           }) => {
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [autoDetecting, setAutoDetecting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const { position, error: geoError, loading: geoLoading, getLocation } = useGeolocation();

    useEffect(() => {
        fetchLocations();
    }, []);

    useEffect(() => {
        if (position && !selectedLocationId) {
            handlePositionDetected(position.latitude, position.longitude);
        }
    }, [position]);

    const fetchLocations = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await locationAPI.getAll();
            setLocations(response.data);
        } catch (err: any) {
            setError(err.message || 'Không thể tải danh sách địa điểm');
        } finally {
            setLoading(false);
        }
    };

    const handlePositionDetected = async (latitude: number, longitude: number) => {
        setAutoDetecting(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await locationAPI.findOrCreateByCoordinates(latitude, longitude);
            const location = response.data;

            await fetchLocations();
            onSelect(location);

            setSuccessMessage(
                `✅ Đã xác định vị trí: ${location.cityName}, ${location.country}`
            );

            setTimeout(() => setSuccessMessage(null), 5000);

        } catch (err: any) {
            console.error('Lỗi khi xử lý vị trí:', err);
            setError(
                err.response?.data?.message ||
                'Không thể xác định địa điểm từ tọa độ. Vui lòng chọn thủ công.'
            );
        } finally {
            setAutoDetecting(false);
        }
    };

    const handleAutoDetect = () => {
        setSuccessMessage(null);
        setError(null);
        getLocation();
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
                <label className="block text-gray-700 dark:text-gray-300 font-semibold">
                    📍 Chọn địa điểm
                </label>

                <button
                    onClick={handleAutoDetect}
                    disabled={geoLoading || autoDetecting || loading}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600
                             dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm
                             rounded-lg transition-colors disabled:bg-gray-400
                             disabled:cursor-not-allowed"
                >
                    {geoLoading || autoDetecting ? (
                        <>
                            <span className="animate-spin">🔄</span>
                            <span>
                                {geoLoading ? 'Đang lấy vị trí...' : 'Đang xử lý...'}
                            </span>
                        </>
                    ) : (
                        <>
                            <span>📍</span>
                            <span>Tự động phát hiện</span>
                        </>
                    )}
                </button>
            </div>

            {loading && !autoDetecting && (
                <div className="text-gray-500 dark:text-gray-400 text-center py-2">
                    Đang tải...
                </div>
            )}

            {error && (
                <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300
                              p-3 rounded-lg mb-2 text-sm">
                    ⚠️ {error}
                </div>
            )}

            {geoError && (
                <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700
                              dark:text-yellow-300 p-3 rounded-lg mb-2 text-sm">
                    <div className="font-semibold mb-1">⚠️ Lỗi vị trí</div>
                    <div>{geoError}</div>
                    {geoError.includes('từ chối') && (
                        <div className="mt-2 text-xs">
                            💡 Mẹo: Bật quyền truy cập vị trí trong cài đặt trình duyệt
                        </div>
                    )}
                </div>
            )}

            {successMessage && (
                <div className="bg-green-100 dark:bg-green-900/30 text-green-700
                              dark:text-green-300 p-3 rounded-lg mb-2 text-sm font-medium">
                    {successMessage}
                </div>
            )}

            {position && !geoError && !successMessage && (
                <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300
                              p-2 rounded-lg mb-2 text-xs">
                    📍 Tọa độ: {position.latitude.toFixed(4)}, {position.longitude.toFixed(4)}
                </div>
            )}

            <select
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={selectedLocationId || ''}
                onChange={(e) => {
                    const loc = locations.find(l => l.id === Number(e.target.value));
                    if (loc) {
                        setSuccessMessage(null);
                        onSelect(loc);
                    }
                }}
                disabled={loading || autoDetecting}
            >
                <option value="">-- Chọn thành phố --</option>
                {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                        {location.cityName}, {location.country}
                    </option>
                ))}
            </select>

            <div className="flex items-center gap-4 mt-3">
                <button
                    onClick={fetchLocations}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800
                             dark:hover:text-blue-300 text-sm flex items-center gap-1"
                    disabled={loading}
                >
                    🔄 Làm mới danh sách
                </button>

                {autoDetecting && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                        Đang tạo location mới từ tọa độ...
                    </span>
                )}
            </div>
        </div>
    );
};

export default LocationSelector;