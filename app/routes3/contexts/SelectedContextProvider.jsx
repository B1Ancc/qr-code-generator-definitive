import { useState } from "react";
import SelectedContext from "./SelectedContext";

const SelectedContextProvider = ({ children }) => {
    const [selected, setSelected] = useState("homepage");
    const [qrCodeData, setQRCodeData] = useState("placeholder");

    const value = { selected, setSelected, qrCodeData, setQRCodeData };

    return (
        <SelectedContext.Provider value={value}>
            {children}
        </SelectedContext.Provider>
    )
}

export default SelectedContextProvider;