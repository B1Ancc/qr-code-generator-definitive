import { createContext, useState } from "react";

const QRSettingsContext = createContext();

export const QRSettingsProvider = ({ children }) => {
    const [qrName, setQRName] = useState("");
    const [initialQRName, setInitialQRName] = useState("");

    const value = {
        qrName,
        setQRName,
        initialQRName,
        setInitialQRName
    };

    return (
        <QRSettingsContext.Provider value={value}>
            {children}
        </QRSettingsContext.Provider>
    )
}

export default QRSettingsContext;