import { useContext } from "react";
import { createContext, useState } from "react";

const QRLoadingContext = createContext();

export const QRLoadingProvider = ({ children }) => {
    const [loadingStates, setLoadingState] = useState({});

    const setLoading = (key, value) => {
        setLoadingState(prev => ({
            ...prev, [key]: value
        }))
    };

    const value = {
        loadingStates,
        setLoading
    };

    return (
        <QRLoadingContext.Provider value={value}>
            {children}
        </QRLoadingContext.Provider>
    )
}

export const useQRLoadingContext = () => useContext(QRLoadingContext);