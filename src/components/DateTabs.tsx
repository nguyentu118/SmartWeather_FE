import React, { useRef, useEffect, useState } from 'react';

interface DateTabsProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
    dates: Date[]; // ← SỬA: đổi tên prop cho khớp với App.tsx
}

const DateTabs: React.FC<DateTabsProps> = ({
                                               selectedDate,
                                               onDateSelect,
                                               dates = [] // ← THÊM: default value
                                           }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);

    const minSwipeDistance = 80;

    // Generate 60 days (30 past + today + 29 future)
    const generateDates = () => {
        const dateArray: Date[] = [];
        const today = new Date();

        // 30 days in past
        for (let i = 30; i > 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            dateArray.push(date);
        }

        // Today
        dateArray.push(new Date(today));

        // 29 days in future
        for (let i = 1; i <= 29; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dateArray.push(date);
        }

        return dateArray;
    };

    const allDates = generateDates();

    // Find current index
    const currentIndex = allDates.findIndex(
        date => date.toDateString() === selectedDate.toDateString()
    );

    // Auto-scroll to selected date on mount and when selectedDate changes
    useEffect(() => {
        if (scrollRef.current && currentIndex !== -1) {
            const container = scrollRef.current;
            const buttonWidth = 100; // approximate width of each date button
            const scrollPosition = currentIndex * (buttonWidth + 16) - container.clientWidth / 2 + buttonWidth / 2;

            container.scrollTo({
                left: Math.max(0, scrollPosition),
                behavior: 'smooth'
            });
        }
    }, [selectedDate, currentIndex]);

    // Touch handlers for swipe
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX);
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && currentIndex < allDates.length - 1) {
            // Swipe left - next day
            onDateSelect(allDates[currentIndex + 1]);
        }

        if (isRightSwipe && currentIndex > 0) {
            // Swipe right - previous day
            onDateSelect(allDates[currentIndex - 1]);
        }
    };

    // Mouse drag handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setStartX(e.clientX);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollRef.current) return;

        const walk = startX - e.clientX;
        scrollRef.current.scrollLeft += walk;
        setStartX(e.clientX);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft' && currentIndex > 0) {
                e.preventDefault();
                onDateSelect(allDates[currentIndex - 1]);
            } else if (e.key === 'ArrowRight' && currentIndex < allDates.length - 1) {
                e.preventDefault();
                onDateSelect(allDates[currentIndex + 1]);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, allDates, onDateSelect]);

    // Navigation buttons
    const handlePrevious = () => {
        if (currentIndex > 0) {
            onDateSelect(allDates[currentIndex - 1]);
        }
    };

    const handleNext = () => {
        if (currentIndex < allDates.length - 1) {
            onDateSelect(allDates[currentIndex + 1]);
        }
    };

    const handleToday = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        onDateSelect(today);
    };

    // Helper functions
    const isSelected = (date: Date) => {
        return date.toDateString() === selectedDate.toDateString();
    };

    const isToday = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        return checkDate.toDateString() === today.toDateString();
    };

    const isFuture = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        return checkDate > today;
    };

    const hasData = (date: Date) => {
        // ✅ FIX: Thêm null check và default value
        if (!dates || dates.length === 0) return false;
        return dates.some(d => d.toDateString() === date.toDateString());
    };

    const formatDay = (date: Date) => {
        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        return days[date.getDay()];
    };

    const formatDate = (date: Date) => {
        return date.getDate();
    };

    const formatMonth = (date: Date) => {
        return date.toLocaleDateString('vi-VN', { month: 'short' });
    };

    return (
        <div className="w-full overflow-hidden">
            {/* Swipe Hint */}
            <div className="text-center mb-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20
                              rounded-full text-xs text-gray-600 dark:text-gray-400">
                    <span>👈</span>
                    <span className="font-medium">Vuốt hoặc kéo để chuyển ngày</span>
                    <span>👉</span>
                </div>
            </div>

            {/* Drag Container */}
            <div
                ref={containerRef}
                className={`relative ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} select-none`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
            >
                {/* Scrollable dates */}
                <div
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-auto py-4 px-2 hide-scrollbar"
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch',
                        pointerEvents: isDragging ? 'none' : 'auto'
                    }}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {allDates.map((date, index) => {
                        const selected = isSelected(date);
                        const today = isToday(date);
                        const future = isFuture(date);
                        const dataAvailable = hasData(date);

                        return (
                            <button
                                key={index}
                                onClick={(e) => {
                                    if (!isDragging) {
                                        e.stopPropagation();
                                        onDateSelect(date);
                                    }
                                }}
                                disabled={future}
                                className={`
                                    flex-shrink-0 w-20 p-3 rounded-xl transition-all duration-200
                                    ${selected
                                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl scale-110 ring-4 ring-blue-200 dark:ring-blue-800'
                                    : today
                                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-2 border-blue-400 dark:border-blue-600'
                                        : future
                                            ? 'bg-gray-100 dark:bg-gray-700/30 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
                                            : dataAvailable
                                                ? 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md'
                                                : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-dashed border-gray-300 dark:border-gray-600'
                                }
                                    ${!future && !selected ? 'hover:scale-105' : ''}
                                `}
                            >
                                <div className="flex flex-col items-center gap-1">
                                    {/* Day of week */}
                                    <div className={`text-xs font-medium uppercase ${
                                        selected ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                                    }`}>
                                        {formatDay(date)}
                                    </div>

                                    {/* Date number */}
                                    <div className={`text-2xl font-bold ${
                                        selected
                                            ? 'text-white'
                                            : today
                                                ? 'text-blue-600 dark:text-blue-400'
                                                : future
                                                    ? 'text-gray-400 dark:text-gray-500'
                                                    : 'text-gray-800 dark:text-gray-200'
                                    }`}>
                                        {formatDate(date)}
                                    </div>

                                    {/* Month */}
                                    <div className={`text-xs ${
                                        selected ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'
                                    }`}>
                                        {formatMonth(date)}
                                    </div>

                                    {/* Data indicator */}
                                    {dataAvailable && !selected && !future && (
                                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400"></div>
                                    )}

                                    {/* Today indicator */}
                                    {today && !selected && (
                                        <div className="mt-1 px-2 py-0.5 bg-blue-500 text-white text-[10px] rounded-full font-semibold">
                                            Hôm nay
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-center gap-3 mt-4">
                <button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="p-2 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-100
                             dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed
                             transition-all shadow-sm hover:shadow border border-gray-200
                             dark:border-gray-600"
                    aria-label="Previous day"
                >
                    <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <button
                    onClick={handleToday}
                    className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white
                             font-medium transition-all shadow-sm hover:shadow text-sm"
                >
                    📅 Hôm nay
                </button>

                <button
                    onClick={handleNext}
                    disabled={currentIndex === allDates.length - 1}
                    className="p-2 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-100
                             dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed
                             transition-all shadow-sm hover:shadow border border-gray-200
                             dark:border-gray-600"
                    aria-label="Next day"
                >
                    <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Date Range Info */}
            <div className="text-center mt-3 text-xs text-gray-500 dark:text-gray-400">
                <span>
                    {selectedDate.toLocaleDateString('vi-VN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </span>
            </div>

            {/* CSS for hiding scrollbar */}
            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default DateTabs;