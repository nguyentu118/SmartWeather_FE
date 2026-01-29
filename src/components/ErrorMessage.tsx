import React from 'react';

interface ErrorMessageProps {
    message: string;
    onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
    return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start">
                <div className="text-3xl mr-3">❌</div>
                <div className="flex-1">
                    <h3 className="text-red-800 font-bold text-lg mb-2">
                        Đã xảy ra lỗi
                    </h3>
                    <p className="text-red-700 mb-4">{message}</p>
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            🔄 Thử lại
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ErrorMessage;