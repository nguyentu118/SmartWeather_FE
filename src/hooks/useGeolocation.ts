import { useState } from 'react';

interface GeolocationPosition {
    latitude: number;
    longitude: number;
}

interface GeolocationState {
    position: GeolocationPosition | null;
    error: string | null;
    loading: boolean;
}

export const useGeolocation = () => {
    const [state, setState] = useState<GeolocationState>({
        position: null,
        error: null,
        loading: false,
    });

    const getLocation = () => {
        if (!navigator.geolocation) {
            setState({
                position: null,
                error: 'Trình duyệt không hỗ trợ Geolocation',
                loading: false,
            });
            return;
        }

        setState(prev => ({ ...prev, loading: true, error: null }));

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setState({
                    position: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    },
                    error: null,
                    loading: false,
                });
            },
            (error) => {
                let errorMessage = 'Không thể lấy vị trí';

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Người dùng từ chối quyền truy cập vị trí';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Thông tin vị trí không khả dụng';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Yêu cầu lấy vị trí đã hết thời gian';
                        break;
                }

                setState({
                    position: null,
                    error: errorMessage,
                    loading: false,
                });
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    return {
        ...state,
        getLocation,
    };
};