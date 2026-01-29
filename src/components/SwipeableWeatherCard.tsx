import React, { useState, useRef, useEffect } from 'react';
import type { WeatherHistory, Weather } from '../services/api';

interface SwipeableWeatherCardProps {
    dates: Date[];
    currentIndex: number;
    onIndexChange: (index: number) => void;
    weatherData: Map<string, WeatherHistory | null>;
    currentWeather?: Weather | null;
    locationName: string;
    onRefresh?: () => void;
}

const SwipeableWeatherCard: React.FC<SwipeableWeatherCardProps> = ({
                                                                       dates,
                                                                       currentIndex,
                                                                       onIndexChange,
                                                                       weatherData,
                                                                       currentWeather,
                                                                       locationName,
                                                                       onRefresh
                                                                   }) => {
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState(0);
    const cardRef = useRef<HTMLDivElement>(null);

    const minSwipeDistance = 50;

    const currentDate = dates[currentIndex];
    const isToday = currentDate?.toDateString() === new Date().toDateString();
    const dateKey = currentDate?.toISOString().split('T')[0];
    const data = dateKey ? weatherData.get(dateKey) : null;

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(0);
        setTouchStart(e.targetTouches[0].clientX);
        setIsDragging(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        const touch = e.targetTouches[0].clientX;
        setTouchEnd(touch);
        setDragOffset(touch - touchStart);
    };

    const handleTouchEnd = () => {
        if (!isDragging) return;
        setIsDragging(false);

        if (!touchStart || !touchEnd) {
            setDragOffset(0);
            return;
        }

        const distance = touchStart - touchEnd;
        const isSwipe = Math.abs(distance) > minSwipeDistance;

        if (isSwipe) {
            if (distance > 0) {
                // Swipe left - next
                handleNext();
            } else {
                // Swipe right - prev
                handlePrev();
            }
        }

        setDragOffset(0);
        setTouchStart(0);
        setTouchEnd(0);
    };

    // Mouse events for desktop
    const handleMouseDown = (e: React.MouseEvent) => {
        setTouchEnd(0);
        setTouchStart(e.clientX);
        setIsDragging(true);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setTouchEnd(e.clientX);
        setDragOffset(e.clientX - touchStart);
    };

    const handleMouseUp = () => {
        if (!isDragging) return;
        setIsDragging(false);

        if (!touchStart || !touchEnd) {
            setDragOffset(0);
            return;
        }

        const distance = touchStart - touchEnd;
        const isSwipe = Math.abs(distance) > minSwipeDistance;

        if (isSwipe) {
            if (distance > 0) {
                handleNext();
            } else {
                handlePrev();
            }
        }

        setDragOffset(0);
        setTouchStart(0);
        setTouchEnd(0);
    };

    const handleMouseLeave = () => {
        if (isDragging) {
            setIsDragging(false);
            setDragOffset(0);
            setTouchStart(0);
            setTouchEnd(0);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            onIndexChange(currentIndex - 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < dates.length - 1) {
            onIndexChange(currentIndex + 1);
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'ArrowRight') handleNext();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, dates.length]);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getCardStyle = () => {
        if (isDragging) {
            return {
                transform: `translateX(${dragOffset}px)`,
                transition: 'none'
            };
        }
        return {
            transform: 'translateX(0)',
            transition: 'transform 0.3s ease-out'
        };
    };

    return (
        <div className="relative overflow-hidden">
            {/* Date Indicator Dots */}
            <div className="flex justify-center gap-1.5 mb-4">
                {dates.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => onIndexChange(idx)}
                        className={`h-1.5 rounded-full transition-all ${
                            idx === currentIndex
                                ? 'w-8 bg-blue-500 dark:bg-blue-400'
                                : 'w-1.5 bg-gray-300 dark:bg-gray-600'
                        }`}
                        aria-label={`Ngày ${idx + 1}`}
                    />
                ))}
            </div>

            {/* Swipeable Card Container */}
            <div
                ref={cardRef}
                className="relative select-none cursor-grab active:cursor-grabbing"
                style={getCardStyle()}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
            >
                {/* Card Content */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6
                              border-4 border-blue-500 dark:border-blue-600">

                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                {locationName}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {isToday ? '🔵 Hôm nay' : formatDate(currentDate)}
                            </p>
                        </div>

                        {isToday && onRefresh && (
                            <button
                                onClick={onRefresh}
                                className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30
                                         hover:bg-blue-200 dark:hover:bg-blue-800/50
                                         transition-colors"
                            >
                                <span className="text-xl">🔄</span>
                            </button>
                        )}
                    </div>

                    {/* Weather Content */}
                    {isToday && currentWeather ? (
                        // Current Weather Display
                        <>
                            <div className="text-center mb-8">
                                <div className="text-7xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                                    {currentWeather.temperature}°C
                                </div>
                                <p className="text-2xl text-gray-600 dark:text-gray-300">
                                    {currentWeather.description}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    Cập nhật: {formatTime(currentWeather.lastUpdated)}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
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
                                        💨 Gió
                                    </div>
                                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                                        {currentWeather.windSpeed}
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">km/h</div>
                                </div>

                                <div className="bg-gradient-to-br from-purple-50 to-purple-100
                                              dark:from-purple-900/30 dark:to-purple-800/30
                                              p-4 rounded-xl">
                                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                        🌡️ Áp suất
                                    </div>
                                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
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
                                    <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                                        {currentWeather.visibility}
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">km</div>
                                </div>

                                {currentWeather.uvIndex && (
                                    <div className="bg-gradient-to-br from-orange-50 to-orange-100
                                                  dark:from-orange-900/30 dark:to-orange-800/30
                                                  p-4 rounded-xl col-span-2">
                                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                            ☀️ UV Index
                                        </div>
                                        <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                                            {currentWeather.uvIndex}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : data ? (
                        // History Weather Display
                        <>
                            <div className="text-center mb-8">
                                <div className="text-7xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                                    {data.avgTemperature}°C
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
                                        {data.maxTemperature}°C
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100
                                              dark:from-cyan-900/30 dark:to-cyan-800/30
                                              p-4 rounded-xl">
                                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                        ❄️ Thấp nhất
                                    </div>
                                    <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                                        {data.minTemperature}°C
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-green-50 to-green-100
                                              dark:from-green-900/30 dark:to-green-800/30
                                              p-4 rounded-xl">
                                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                        💧 Độ ẩm TB
                                    </div>
                                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                                        {data.avgHumidity}%
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-purple-50 to-purple-100
                                              dark:from-purple-900/30 dark:to-purple-800/30
                                              p-4 rounded-xl">
                                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                        🌧️ Lượng mưa
                                    </div>
                                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                        {data.totalRainfall || 0}
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">mm</div>
                                </div>

                                {data.hasHighVariation && (
                                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100
                                                  dark:from-yellow-900/30 dark:to-yellow-800/30
                                                  p-4 rounded-xl col-span-2">
                                        <div className="text-center">
                                            <div className="text-2xl mb-1">⚠️</div>
                                            <div className="text-sm font-semibold text-yellow-700
                                                          dark:text-yellow-300">
                                                Biến động nhiệt độ cao
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        // No Data
                        <div className="text-center py-12">
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
            </div>

            {/* Navigation Arrows */}
            <div className="flex justify-between items-center mt-4 px-4">
                <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg
                             hover:shadow-xl disabled:opacity-30 disabled:cursor-not-allowed
                             transition-all border-2 border-gray-200 dark:border-gray-600"
                >
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3}
                              d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                    {currentIndex + 1} / {dates.length}
                    <div className="text-xs mt-1">
                        👆 Vuốt hoặc dùng phím ← →
                    </div>
                </div>

                <button
                    onClick={handleNext}
                    disabled={currentIndex === dates.length - 1}
                    className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg
                             hover:shadow-xl disabled:opacity-30 disabled:cursor-not-allowed
                             transition-all border-2 border-gray-200 dark:border-gray-600"
                >
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3}
                              d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default SwipeableWeatherCard;