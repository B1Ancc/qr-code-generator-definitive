import { createContext, useState } from "react";

const QRTargetContext = createContext();

export const QRTargetProvider = ({ children }) => {
    const [selected, setSelected] = useState("Homepage");
    const [qrDestination, setQRDestination] = useState("");
    const [qrProductId, setQRProductId] = useState("");
    const [qrVariantId, setQRVariantId] = useState("");

    const value = {
        selected,
        setSelected,
        qrDestination,
        setQRDestination,
        qrProductId,
        setQRProductId,
        qrVariantId,
        setQRVariantId,
    };

    return (
        <QRTargetContext.Provider value={value}>
            {children}
        </QRTargetContext.Provider>
    )
}

export default QRTargetContext;