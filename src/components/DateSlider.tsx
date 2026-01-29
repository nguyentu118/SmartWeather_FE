import React, { useState, useEffect, useRef } from 'react';

interface DateSliderProps {
    startDate: Date;
    endDate: Date;
    selectedDate: Date;
    onDateChange: (date: Date) => void;
}

const DateSlider: React.FC<DateSliderProps> = ({
                                                   startDate,
                                                   endDate,
                                                   selectedDate,
                                                   onDateChange
                                               }) => {
    const [isDragging, setIsDragging] = useState(false);
    const sliderRef = useRef<HTMLDivElement>(null);

    // Tính tổng số ngày
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Tạo array các ngày
    const dates = Array.from({ length: totalDays }, (_, i) => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        return date;
    });

    // Tìm index của ngày đang chọn
    const selectedIndex = dates.findIndex(
        date => date.toDateString() === selectedDate.toDateString()
    );

    const handleDateClick = (date: Date) => {
        onDateChange(date);
    };

    const handlePrevDay = () => {
        if (selectedIndex > 0) {
            onDateChange(dates[selectedIndex - 1]);
        }
    };

    const handleNextDay = () => {
        if (selectedIndex < dates.length - 1) {
            onDateChange(dates[selectedIndex + 1]);
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft') {
            handlePrevDay();
        } else if (e.key === 'ArrowRight') {
            handleNextDay();
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIndex]);

    // Scroll to selected date
    useEffect(() => {
        if (sliderRef.current && selectedIndex >= 0) {
            const selectedElement = sliderRef.current.children[selectedIndex] as HTMLElement;
            if (selectedElement) {
                selectedElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            }
        }
    }, [selectedIndex]);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit'
        });
    };

    const formatDayName = (date: Date) => {
        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        return days[date.getDay()];
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                    📅 Chọn ngày xem
                </h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrevDay}
                        disabled={selectedIndex === 0}
                        className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30
                                 hover:bg-blue-200 dark:hover:bg-blue-800/50
                                 disabled:opacity-50 disabled:cursor-not-allowed
                                 transition-colors"
                        title="Ngày trước (←)"
                    >
                        <span className="text-xl">←</span>
                    </button>
                    <button
                        onClick={handleNextDay}
                        disabled={selectedIndex === dates.length - 1}
                        className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30
                                 hover:bg-blue-200 dark:hover:bg-blue-800/50
                                 disabled:opacity-50 disabled:cursor-not-allowed
                                 transition-colors"
                        title="Ngày tiếp (→)"
                    >
                        <span className="text-xl">→</span>
                    </button>
                </div>
            </div>

            {/* Date Selected Display */}
            <div className="text-center mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50
                          dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {isToday(selectedDate) ? '🔵 Hôm nay' : formatDayName(selectedDate)}
                </div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {selectedDate.toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                    })}
                </div>
            </div>

            {/* Timeline Slider */}
            <div className="relative">
                {/* Scroll container */}
                <div
                    ref={sliderRef}
                    className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin
                             scrollbar-thumb-blue-400 dark:scrollbar-thumb-blue-600
                             scrollbar-track-gray-200 dark:scrollbar-track-gray-700"
                    style={{
                        scrollbarWidth: 'thin',
                        scrollBehavior: 'smooth'
                    }}
                >
                    {dates.map((date, index) => {
                        const isSelected = index === selectedIndex;
                        const isTodayDate = isToday(date);

                        return (
                            <button
                                key={index}
                                onClick={() => handleDateClick(date)}
                                className={`
                                    flex-shrink-0 snap-center w-20 h-24 rounded-xl 
                                    flex flex-col items-center justify-center gap-1
                                    transition-all duration-300 transform
                                    ${isSelected
                                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white scale-110 shadow-lg'
                                    : isTodayDate
                                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-2 border-blue-500'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }
                                    ${isSelected ? 'ring-4 ring-blue-300 dark:ring-blue-700' : ''}
                                `}
                            >
                                <div className={`text-xs font-medium ${isSelected ? 'opacity-90' : 'opacity-75'}`}>
                                    {formatDayName(date)}
                                </div>
                                <div className={`text-2xl font-bold ${isSelected ? '' : ''}`}>
                                    {date.getDate()}
                                </div>
                                <div className={`text-xs ${isSelected ? 'opacity-90' : 'opacity-75'}`}>
                                    Th{date.getMonth() + 1}
                                </div>
                                {isTodayDate && !isSelected && (
                                    <div className="text-xs mt-1">●</div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Gradient overlays for scroll indication */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r
                              from-white dark:from-gray-800 to-transparent pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l
                              from-white dark:from-gray-800 to-transparent pointer-events-none" />
            </div>

            {/* Navigation hint */}
            <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
                💡 Sử dụng phím ← → hoặc kéo thanh trượt để chuyển ngày
            </div>
        </div>
    );
};

export default DateSlider;