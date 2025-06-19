import { hsbToHex } from "@shopify/polaris";
import { createContext, useState } from "react";

const SelectedContext = createContext();

export const SelectedProvider = ({ children }) => {
    const [selected, setSelected] = useState("homepage");
    const [singleQRCodeData, setSingleQRCodeData] = useState("");
    const [selectedForegroundColor, setSelectedForegroundColor] = useState(
        {
            hue: 0,
            brightness: 0,
            saturation: 0,
        });
    const [selectedBackgroundColor, setSelectedBackgroundColor] = useState(
        {
            hue: 0,
            brightness: 1,
            saturation: 0,
        });
    const [convertedForegroundColor, setConvertedForegroundColor] = useState(hsbToHex(selectedForegroundColor))
    const [convertedBackgroundColor, setConvertedBackgroundColor] = useState(hsbToHex(selectedBackgroundColor))
    const [marginValue, setMarginValue] = useState(15);
    const [selectedPattern, setSelectedPattern] = useState("square");
    const [selectedEye, setSelectedEye] = useState("square");
    const [file, setFile] = useState();

    const value = {
        selected,
        setSelected,
        singleQRCodeData,
        setSingleQRCodeData,
        selectedForegroundColor,
        setSelectedForegroundColor,
        selectedBackgroundColor,
        setSelectedBackgroundColor,
        convertedForegroundColor,
        setConvertedForegroundColor,
        convertedBackgroundColor,
        setConvertedBackgroundColor,
        marginValue,
        setMarginValue,
        selectedPattern,
        setSelectedPattern,
        selectedEye,
        setSelectedEye,
        file,
        setFile
    };

    return (
        <SelectedContext.Provider value={value}>
            {children}
        </SelectedContext.Provider>
    )
}

export default SelectedContext;