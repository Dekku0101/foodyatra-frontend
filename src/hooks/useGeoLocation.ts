
import { useState, useEffect } from 'react';

export interface LocationData {
    city: string;
    area: string;
    lat: number;
    lng: number;
}

interface GeoLocationState {
    location: LocationData | null;
    isLoading: boolean;
    error: string | null;
    requestLocation: () => Promise<void>;
    manualSetLocation: (city: string) => void;
}

export const useGeoLocation = (): GeoLocationState => {
    const [location, setLocation] = useState<LocationData | null>(() => {
        // Try to restore from local storage on init
        try {
            const saved = localStorage.getItem('userLocation');
            if (saved) {
                const parsed = JSON.parse(saved);
                // If we have saved data but it's "Unknown Location" or invalid, treat as null to re-prompt
                if (parsed.city === 'Unknown Location' || !parsed.city) {
                    localStorage.removeItem('userLocation');
                    return null;
                }
                return parsed;
            }
            return null;
        } catch (e) {
            return null;
        }
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const saveLocation = (data: LocationData) => {
        setLocation(data);
        localStorage.setItem('userLocation', JSON.stringify(data));
        setError(null);
    };

    const manualSetLocation = (city: string) => {
        // For manual set, we might not have coords immediately, using mock/defaults or just storing the city
        // Ideally we would geocode this too, but for now let's just save the city
        const mockData: LocationData = {
            city: city,
            area: 'Selected Location',
            lat: 0,
            lng: 0
        };
        saveLocation(mockData);
    };

    const getCityFromCoords = async (lat: number, lng: number) => {
        try {
            // Using OpenStreetMap Nominatim API (Free, requires User-Agent)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
                {
                    headers: {
                        'User-Agent': 'FoodYatra-App/1.0'
                    }
                }
            );

            if (!response.ok) throw new Error('Failed to fetch location details');

            const data = await response.json();
            const address = data.address || {};

            // Extract city/town/village and area
            // Improved priority order for Indian locations & general fallback
            const city = (
                address.city ||
                address.town ||
                address.municipality ||
                address.county ||
                address.state_district || // Common in India
                address.state ||
                'Unknown Location'
            ).trim();

            const area = (
                address.suburb ||
                address.neighbourhood ||
                address.residential ||
                address.village ||
                address.road ||
                ''
            ).trim();

            const locationData: LocationData = {
                city,
                area,
                lat,
                lng
            };

            saveLocation(locationData);
        } catch (err) {
            setError('Failed to resolve location details. Please try again.');
            console.error(err);
        }
    };

    const requestLocation = async () => {
        setIsLoading(true);
        setError(null);

        if (!('geolocation' in navigator)) {
            setError('Geolocation is not supported by your browser');
            setIsLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                await getCityFromCoords(position.coords.latitude, position.coords.longitude);
                setIsLoading(false);
            },
            (err) => {
                setError(err.message || 'Access to location denied');
                setIsLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    return { location, isLoading, error, requestLocation, manualSetLocation };
};
