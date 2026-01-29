import React from 'react';
import type {WeatherHistory} from '../services/api';

interface WeatherHistoryChartProps {
    history: WeatherHistory[];
}

const WeatherHistoryChart: React.FC<WeatherHistoryChartProps> = ({ history }) => {
    if (history.length === 0) {
        return (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
                <div className="text-4xl mb-2">📊</div>
                <div className="text-gray-600 dark:text-gray-400">
                    Chưa có dữ liệu lịch sử cho khoảng thời gian này
                </div>
            </div>
        );
    }

    // Sắp xếp theo ngày
    const sortedHistory = [...history].sort((a, b) =>
        new Date(a.logDate).getTime() - new Date(b.logDate).getTime()
    );

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                📈 Lịch sử thời tiết ({sortedHistory.length} bản ghi)
            </h3>

            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                        <th className="px-4 py-2 text-left text-sm font-semibold
                                     text-gray-700 dark:text-gray-300">
                            Ngày
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-semibold
                                     text-gray-700 dark:text-gray-300">
                            Nhiệt độ TB
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-semibold
                                     text-gray-700 dark:text-gray-300">
                            Max/Min
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-semibold
                                     text-gray-700 dark:text-gray-300">
                            Độ ẩm TB
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-semibold
                                     text-gray-700 dark:text-gray-300">
                            Lượng mưa
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {sortedHistory.map((record, index) => (
                        <tr
                            key={record.id || index}
                            className={`border-b dark:border-gray-700 hover:bg-gray-50 
                                      dark:hover:bg-gray-700/50 ${
                                record.hasHighVariation ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
                            }`}
                        >
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                {new Date(record.logDate).toLocaleDateString('vi-VN')}
                                {record.hasHighVariation && (
                                    <span className="ml-2 text-yellow-600 dark:text-yellow-400"
                                          title="Biến động nhiệt độ cao">
                                        ⚠️
                                    </span>
                                )}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {record.avgTemperature}°C
                            </td>
                            <td className="px-4 py-3 text-sm">
                                <span className="text-red-600 dark:text-red-400">
                                    {record.maxTemperature}°
                                </span>
                                {' / '}
                                <span className="text-blue-600 dark:text-blue-400">
                                    {record.minTemperature}°
                                </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                {record.avgHumidity}%
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                {record.totalRainfall || 0} mm
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Statistics Summary */}
            <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Nhiệt độ TB</div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {(
                            sortedHistory.reduce((sum, h) => sum + Number(h.avgTemperature), 0) /
                            sortedHistory.length
                        ).toFixed(1)}°C
                    </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Độ ẩm TB</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {(
                            sortedHistory.reduce((sum, h) => sum + Number(h.avgHumidity || 0), 0) /
                            sortedHistory.length
                        ).toFixed(1)}%
                    </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Tổng lượng mưa</div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {sortedHistory.reduce((sum, h) => sum + Number(h.totalRainfall || 0), 0).toFixed(1)} mm
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeatherHistoryChart;