import { createContext, useState } from "react";

const TargetContext = createContext();

export const TargetProvider = ({ children }) => {
    const [selected, setSelected] = useState("Homepage");
    const [qrDestination, setQRDestination] = useState("");

    const value = {
        selected,
        setSelected,
        qrDestination,
        setQRDestination,
    };

    return (
        <TargetContext.Provider value={value}>
            {children}
        </TargetContext.Provider>
    )
}

export default TargetContext;