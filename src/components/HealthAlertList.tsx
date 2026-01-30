import React from 'react';
import type {HealthAlert} from '../services/api';

interface HealthAlertListProps {
    alerts: HealthAlert[];
}

const HealthAlertList: React.FC<HealthAlertListProps> = ({ alerts }) => {
    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'DANGER':
                return 'bg-red-100 dark:bg-red-900/30 border-red-500 text-red-800 dark:text-red-300';
            case 'WARNING':
                return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500 text-yellow-800 dark:text-yellow-300';
            case 'INFO':
                return 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-800 dark:text-blue-300';
            default:
                return 'bg-gray-100 dark:bg-gray-700 border-gray-500 text-gray-800 dark:text-gray-300';
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'DANGER':
                return '🚨';
            case 'WARNING':
                return '⚠️';
            case 'INFO':
                return 'ℹ️';
            default:
                return '📢';
        }
    };

    const getConditionIcon = (type: string) => {
        switch (type) {
            case 'UV_INDEX':
                return '☀️';
            case 'TEMPERATURE':
                return '🌡️';
            case 'HUMIDITY':
                return '💧';
            case 'WIND_SPEED':
                return '💨';
            case 'AIR_QUALITY':
                return '🏭';
            default:
                return '📊';
        }
    };

    const getConditionLabel = (type: string) => {
        switch (type) {
            case 'UV_INDEX':
                return 'Chỉ số UV';
            case 'TEMPERATURE':
                return 'Nhiệt độ';
            case 'HUMIDITY':
                return 'Độ ẩm';
            case 'WIND_SPEED':
                return 'Tốc độ gió';
            case 'AIR_QUALITY':
                return 'Chất lượng không khí';
            default:
                return type;
        }
    };

    const formatThreshold = (alert: HealthAlert) => {
        const unit = alert.conditionType === 'UV_INDEX' ? '' :
            alert.conditionType === 'TEMPERATURE' ? '°C' :
                alert.conditionType === 'HUMIDITY' ? '%' :
                    alert.conditionType === 'WIND_SPEED' ? 'km/h' : '';

        if (alert.thresholdMin && alert.thresholdMax) {
            return `${alert.thresholdMin}${unit} - ${alert.thresholdMax}${unit}`;
        } else if (alert.thresholdMin) {
            return `≥ ${alert.thresholdMin}${unit}`;
        } else if (alert.thresholdMax) {
            return `≤ ${alert.thresholdMax}${unit}`;
        }
        return 'N/A';
    };

    if (alerts.length === 0) {
        return (
            <div className="bg-gradient-to-br from-green-50 to-emerald-100
                          dark:from-green-900/30 dark:to-emerald-900/30
                          border-2 border-green-200 dark:border-green-700
                          rounded-2xl p-8 text-center shadow-lg">
                <div className="text-6xl mb-3">✅</div>
                <div className="text-green-800 dark:text-green-300 font-bold text-xl mb-2">
                    Không có cảnh báo
                </div>
                <div className="text-green-600 dark:text-green-400 text-sm">
                    Điều kiện thời tiết hiện tại rất tốt cho sức khỏe
                </div>
                <div className="mt-4 text-xs text-green-700 dark:text-green-400">
                    ✨ Bạn có thể hoạt động ngoài trời thoải mái
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/30
                              rounded-full flex items-center justify-center">
                    <span className="text-2xl">🔔</span>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                        Cảnh báo sức khỏe
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {alerts.length} cảnh báo đang hoạt động
                    </p>
                </div>
            </div>

            {alerts.map((alert, index) => (
                <div
                    key={alert.id || index}
                    className={`border-l-4 rounded-xl p-5 ${getSeverityColor(alert.severity)}
                              shadow-md hover:shadow-lg transition-all`}
                >
                    <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className="flex-shrink-0">
                            <div className="w-14 h-14 rounded-full bg-white/50 dark:bg-black/20
                                          flex items-center justify-center">
                                <span className="text-3xl">
                                    {getConditionIcon(alert.conditionType)}
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-lg">
                                        {getConditionLabel(alert.conditionType)}
                                    </h4>
                                    <span className="text-xl">
                                        {getSeverityIcon(alert.severity)}
                                    </span>
                                </div>
                                <span className="px-3 py-1 rounded-full text-xs font-bold
                                               bg-white/70 dark:bg-black/30 uppercase tracking-wide">
                                    {alert.severity}
                                </span>
                            </div>

                            {/* Recommendation */}
                            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3 mb-3">
                                <div className="text-sm font-medium leading-relaxed">
                                    💡 {alert.recommendation}
                                </div>
                            </div>

                            {/* Threshold Info */}
                            <div className="flex items-center gap-2 text-sm">
                                <span className="opacity-75">Ngưỡng cảnh báo:</span>
                                <span className="font-semibold px-2 py-1 bg-white/30 dark:bg-black/20
                                               rounded">
                                    {formatThreshold(alert)}
                                </span>
                            </div>

                            {/* Special UV Warning */}
                            {alert.conditionType === 'UV_INDEX' && alert.severity !== 'INFO' && (
                                <div className="mt-3 p-2 bg-orange-100 dark:bg-orange-900/40
                                              rounded-lg border border-orange-300 dark:border-orange-700">
                                    <div className="text-xs font-semibold text-orange-800
                                                  dark:text-orange-300">
                                        ⚠️ LƯU Ý: Da có thể bị cháy nếu tiếp xúc trực tiếp với nắng mà không
                                        bảo vệ. Hãy thoa kem chống nắng SPF 30+ và hạn chế ra ngoài vào
                                        giờ cao điểm (10h-16h).
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {/* Summary Footer */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    💡 <span className="font-semibold">Khuyến nghị chung:</span> Hãy chú ý đến các
                    cảnh báo trên và điều chỉnh hoạt động của bạn phù hợp để bảo vệ sức khỏe tốt nhất.
                </div>
            </div>
        </div>
    );
};

export default HealthAlertList;