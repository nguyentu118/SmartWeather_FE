import React from 'react';

interface DatePickerProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
    minDate?: Date;
    maxDate?: Date;
}

const DatePicker: React.FC<DatePickerProps> = ({
                                                   selectedDate,
                                                   onDateChange,
                                                   minDate,
                                                   maxDate = new Date()
                                               }) => {
    const handlePrevDay = () => {
        const prevDay = new Date(selectedDate);
        prevDay.setDate(prevDay.getDate() - 1);

        if (!minDate || prevDay >= minDate) {
            onDateChange(prevDay);
        }
    };

    const handleNextDay = () => {
        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);

        if (nextDay <= maxDate) {
            onDateChange(nextDay);
        }
    };

    const handleToday = () => {
        onDateChange(new Date());
    };

    const isToday = selectedDate.toDateString() === new Date().toDateString();
    const canGoPrev = !minDate || new Date(selectedDate.getTime() - 86400000) >= minDate;
    const canGoNext = new Date(selectedDate.getTime() + 86400000) <= maxDate;

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = new Date(e.target.value);
        if (!isNaN(newDate.getTime())) {
            onDateChange(newDate);
        }
    };

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20
                      dark:to-indigo-900/20 rounded-lg p-4 mb-6 shadow-md">
            <div className="flex items-center justify-between gap-4">
                {/* Previous Day Button */}
                <button
                    onClick={handlePrevDay}
                    disabled={!canGoPrev}
                    className="flex-shrink-0 p-3 rounded-lg bg-white dark:bg-gray-800
                             hover:bg-gray-100 dark:hover:bg-gray-700
                             disabled:opacity-30 disabled:cursor-not-allowed
                             transition-all shadow-sm hover:shadow-md
                             border border-gray-200 dark:border-gray-600"
                    title="Ngày trước"
                >
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* Date Display & Picker */}
                <div className="flex-1 text-center">
                    <div className="flex flex-col gap-2">
                        {/* Date Display */}
                        <div className="text-lg md:text-xl font-bold text-gray-800 dark:text-white">
                            {isToday ? '🔵 Hôm nay' : formatDate(selectedDate)}
                        </div>

                        {/* Date Input */}
                        <div className="flex items-center justify-center gap-2">
                            <input
                                type="date"
                                value={selectedDate.toISOString().split('T')[0]}
                                onChange={handleDateInputChange}
                                min={minDate?.toISOString().split('T')[0]}
                                max={maxDate.toISOString().split('T')[0]}
                                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                         focus:outline-none focus:ring-2 focus:ring-blue-500
                                         text-sm md:text-base"
                            />

                            {!isToday && (
                                <button
                                    onClick={handleToday}
                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white
                                             rounded-lg transition-colors text-sm md:text-base font-medium
                                             whitespace-nowrap"
                                >
                                    📍 Hôm nay
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Next Day Button */}
                <button
                    onClick={handleNextDay}
                    disabled={!canGoNext}
                    className="flex-shrink-0 p-3 rounded-lg bg-white dark:bg-gray-800
                             hover:bg-gray-100 dark:hover:bg-gray-700
                             disabled:opacity-30 disabled:cursor-not-allowed
                             transition-all shadow-sm hover:shadow-md
                             border border-gray-200 dark:border-gray-600"
                    title="Ngày tiếp theo"
                >
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Quick Navigation */}
            <div className="flex justify-center gap-2 mt-3">
                <button
                    onClick={() => {
                        const date = new Date();
                        date.setDate(date.getDate() - 1);
                        onDateChange(date);
                    }}
                    className="px-3 py-1.5 text-xs md:text-sm bg-white dark:bg-gray-800
                             text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100
                             dark:hover:bg-gray-700 transition-colors border border-gray-200
                             dark:border-gray-600"
                >
                    Hôm qua
                </button>
                <button
                    onClick={() => {
                        const date = new Date();
                        date.setDate(date.getDate() - 7);
                        onDateChange(date);
                    }}
                    className="px-3 py-1.5 text-xs md:text-sm bg-white dark:bg-gray-800
                             text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100
                             dark:hover:bg-gray-700 transition-colors border border-gray-200
                             dark:border-gray-600"
                >
                    7 ngày trước
                </button>
                <button
                    onClick={() => {
                        const date = new Date();
                        date.setDate(date.getDate() - 30);
                        onDateChange(date);
                    }}
                    className="px-3 py-1.5 text-xs md:text-sm bg-white dark:bg-gray-800
                             text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100
                             dark:hover:bg-gray-700 transition-colors border border-gray-200
                             dark:border-gray-600"
                >
                    30 ngày trước
                </button>
            </div>
        </div>
    );
};

export default DatePicker;