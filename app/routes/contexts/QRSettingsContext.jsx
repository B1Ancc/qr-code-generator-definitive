import { createContext, useState } from "react";

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [qrName, setQRName] = useState("");
    const [initialQRName, setInitialQRName] = useState("");

    const value = {
        qrName,
        setQRName,
        initialQRName,
        setInitialQRName
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    )
}

export default SettingsContext;