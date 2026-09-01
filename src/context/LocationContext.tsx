
import React, { createContext, useContext, ReactNode } from 'react';
import { useGeoLocation, LocationData } from '../hooks/useGeoLocation';

interface LocationContextType {
    location: LocationData | null;
    isLoading: boolean;
    error: string | null;
    requestLocation: () => Promise<void>;
    manualSetLocation: (city: string) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
    const geoLocation = useGeoLocation();

    return (
        <LocationContext.Provider value={geoLocation}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
};
