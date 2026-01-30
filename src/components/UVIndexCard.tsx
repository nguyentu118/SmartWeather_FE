import React from 'react';

interface UVIndexCardProps {
    uvIndex: number | null | undefined;
}

const UVIndexCard: React.FC<UVIndexCardProps> = ({ uvIndex }) => {
    // Nếu không có dữ liệu UV
    if (uvIndex === null || uvIndex === undefined) {
        return (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100
                          dark:from-gray-700/30 dark:to-gray-600/30
                          p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-600">
                <div className="text-center">
                    <div className="text-4xl mb-2">☁️</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        UV Index không khả dụng
                    </div>
                </div>
            </div>
        );
    }

    // Xác định mức độ và màu sắc
    const getUVLevel = (uv: number) => {
        if (uv < 3) return {
            level: 'THẤP',
            color: 'green',
            icon: '✅',
            bgGradient: 'from-green-50 to-green-100',
            darkBgGradient: 'dark:from-green-900/30 dark:to-green-800/30',
            textColor: 'text-green-600 dark:text-green-400',
            borderColor: 'border-green-400 dark:border-green-500',
            recommendation: 'An toàn. Không cần biện pháp bảo vệ đặc biệt.',
            actions: [
                'Có thể hoạt động ngoài trời thoải mái',
                'Không cần kem chống nắng cho thời gian ngắn'
            ]
        };

        if (uv < 6) return {
            level: 'TRUNG BÌNH',
            color: 'yellow',
            icon: '⚠️',
            bgGradient: 'from-yellow-50 to-yellow-100',
            darkBgGradient: 'dark:from-yellow-900/30 dark:to-yellow-800/30',
            textColor: 'text-yellow-600 dark:text-yellow-400',
            borderColor: 'border-yellow-400 dark:border-yellow-500',
            recommendation: 'Cẩn thận. Cần bảo vệ da nếu ở ngoài lâu.',
            actions: [
                'Đeo kính râm khi ra ngoài',
                'Thoa kem chống nắng SPF 30+ nếu ở ngoài > 30 phút',
                'Mặc áo dài tay nếu có thể'
            ]
        };

        if (uv < 8) return {
            level: 'CAO',
            color: 'orange',
            icon: '🔶',
            bgGradient: 'from-orange-50 to-orange-100',
            darkBgGradient: 'dark:from-orange-900/30 dark:to-orange-800/30',
            textColor: 'text-orange-600 dark:text-orange-400',
            borderColor: 'border-orange-400 dark:border-orange-500',
            recommendation: 'NGUY HIỂM! Cần biện pháp bảo vệ đầy đủ.',
            actions: [
                'Hạn chế ra ngoài từ 10h-16h',
                'BẮT BUỘC thoa kem chống nắng SPF 50+',
                'Đội mũ rộng vành, đeo kính râm UV400',
                'Mặc áo dài tay, quần dài'
            ]
        };

        if (uv < 11) return {
            level: 'RẤT CAO',
            color: 'red',
            icon: '🚨',
            bgGradient: 'from-red-50 to-red-100',
            darkBgGradient: 'dark:from-red-900/30 dark:to-red-800/30',
            textColor: 'text-red-600 dark:text-red-400',
            borderColor: 'border-red-400 dark:border-red-500',
            recommendation: 'RẤT NGUY HIỂM! Tránh ra ngoài trời.',
            actions: [
                'TRÁNH ra ngoài từ 10h-16h',
                'Nếu bắt buộc ra ngoài: kem SPF 50+, thoa lại mỗi 2h',
                'Đội mũ, kính râm, áo dài tay BẮT BUỘC',
                'Tìm bóng râm thường xuyên',
                'Da có thể bị cháy < 15 phút'
            ]
        };

        return {
            level: 'CỰC KỲ CAO',
            color: 'purple',
            icon: '☢️',
            bgGradient: 'from-purple-50 to-purple-100',
            darkBgGradient: 'dark:from-purple-900/30 dark:to-purple-800/30',
            textColor: 'text-purple-600 dark:text-purple-400',
            borderColor: 'border-purple-400 dark:border-purple-500',
            recommendation: '🚫 CỰC KỲ NG위험! KHÔNG RA NGOÀI TRỜI!',
            actions: [
                '🚫 KHÔNG ra ngoài trừ khi thực sự cần thiết',
                'Da có thể bị cháy nghiêm trọng < 10 phút',
                'Bảo vệ toàn diện: kem SPF 50+, mũ, kính, áo dài',
                'Ở trong nhà hoặc bóng râm hoàn toàn',
                'Trẻ em và người da nhạy cảm TUYỆT ĐỐI không ra ngoài'
            ]
        };
    };

    const uvInfo = getUVLevel(uvIndex);

    return (
        <div className={`bg-gradient-to-br ${uvInfo.bgGradient} ${uvInfo.darkBgGradient}
                      p-6 rounded-2xl border-2 ${uvInfo.borderColor}
                      shadow-lg hover:shadow-xl transition-all`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="text-4xl">{uvInfo.icon}</div>
                    <div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                            UV Index
                        </div>
                        <div className={`text-sm font-bold ${uvInfo.textColor}`}>
                            {uvInfo.level}
                        </div>
                    </div>
                </div>

                {/* UV Number */}
                <div className={`text-5xl font-black ${uvInfo.textColor}`}>
                    {uvIndex.toFixed(1)}
                </div>
            </div>

            {/* UV Scale Visual */}
            <div className="mb-4">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full bg-gradient-to-r 
                            ${uvIndex < 3 ? 'from-green-400 to-green-500' : ''}
                            ${uvIndex >= 3 && uvIndex < 6 ? 'from-yellow-400 to-yellow-500' : ''}
                            ${uvIndex >= 6 && uvIndex < 8 ? 'from-orange-400 to-orange-500' : ''}
                            ${uvIndex >= 8 && uvIndex < 11 ? 'from-red-400 to-red-500' : ''}
                            ${uvIndex >= 11 ? 'from-purple-400 to-purple-500' : ''}
                            transition-all duration-500`}
                        style={{ width: `${Math.min((uvIndex / 15) * 100, 100)}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>0</span>
                    <span>3</span>
                    <span>6</span>
                    <span>8</span>
                    <span>11+</span>
                </div>
            </div>

            {/* Recommendation */}
            <div className={`p-3 rounded-lg mb-3 ${
                uvIndex < 3 ? 'bg-white/50 dark:bg-black/20' : 'bg-white/70 dark:bg-black/30'
            }`}>
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    📋 Khuyến nghị:
                </div>
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {uvInfo.recommendation}
                </div>
            </div>

            {/* Action Items */}
            <div className="space-y-2">
                {uvInfo.actions.map((action, index) => (
                    <div key={index} className="flex items-start gap-2">
                        <div className={`mt-0.5 ${uvInfo.textColor}`}>
                            {index === 0 ? '▶' : '•'}
                        </div>
                        <div className="text-xs text-gray-700 dark:text-gray-300 flex-1">
                            {action}
                        </div>
                    </div>
                ))}
            </div>

            {/* Safe Exposure Time (approximate) */}
            {uvIndex >= 3 && (
                <div className="mt-4 pt-3 border-t border-gray-300/50 dark:border-gray-600/50">
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                        ⏱️ Thời gian an toàn không kem chống nắng:
                    </div>
                    <div className={`text-lg font-bold ${uvInfo.textColor}`}>
                        {uvIndex < 6 ? '~60 phút' :
                            uvIndex < 8 ? '~30 phút' :
                                uvIndex < 11 ? '~15 phút' : '< 10 phút'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        (Cho da trắng, nhạy cảm - Da sẫm có thể chịu đựng lâu hơn)
                    </div>
                </div>
            )}
        </div>
    );
};

export default UVIndexCard;