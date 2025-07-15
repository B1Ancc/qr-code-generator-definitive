import { createContext, useState } from "react";

const QRTargetContext = createContext();

export const QRTargetProvider = ({ children }) => {
    const [selected, setSelected] = useState("Homepage");
    const [qrDestination, setQRDestination] = useState("");

    const value = {
        selected,
        setSelected,
        qrDestination,
        setQRDestination,
    };

    return (
        <QRTargetContext.Provider value={value}>
            {children}
        </QRTargetContext.Provider>
    )
}

export default QRTargetContext;