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

    const getConditionLabel = (type: string) => {
        switch (type) {
            case 'UV_INDEX':
                return 'UV Index';
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

    if (alerts.length === 0) {
        return (
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200
                          dark:border-green-700 rounded-lg p-6 text-center">
                <div className="text-4xl mb-2">✅</div>
                <div className="text-green-800 dark:text-green-300 font-semibold">
                    Không có cảnh báo nào
                </div>
                <div className="text-green-600 dark:text-green-400 text-sm mt-1">
                    Điều kiện thời tiết hiện tại rất tốt
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                🔔 Cảnh báo sức khỏe ({alerts.length})
            </h3>

            {alerts.map((alert, index) => (
                <div
                    key={alert.id || index}
                    className={`border-l-4 rounded-lg p-4 ${getSeverityColor(alert.severity)}`}
                >
                    <div className="flex items-start">
                        <span className="text-2xl mr-3">
                            {getSeverityIcon(alert.severity)}
                        </span>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-bold text-lg">
                                    {getConditionLabel(alert.conditionType)}
                                </h4>
                                <span className="px-3 py-1 rounded-full text-xs font-semibold
                                               bg-white/50 dark:bg-black/20">
                                    {alert.severity}
                                </span>
                            </div>

                            <p className="mb-2">{alert.recommendation}</p>

                            <div className="text-sm opacity-75">
                                Ngưỡng: {alert.thresholdMin || 'N/A'} - {alert.thresholdMax || 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default HealthAlertList;