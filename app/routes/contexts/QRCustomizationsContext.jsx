import { hsbToHex } from "@shopify/polaris";
import { createContext, useState } from "react";

const CustomizationContext = createContext();

export const CustomizationProvider = ({ children }) => {
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
    const [selectedPattern, setSelectedPattern] = useState("square");
    const [selectedEye, setSelectedEye] = useState("square");
    const [file, setFile] = useState();

    const value = {
        selectedForegroundColor,
        setSelectedForegroundColor,
        selectedBackgroundColor,
        setSelectedBackgroundColor,
        convertedForegroundColor,
        setConvertedForegroundColor,
        convertedBackgroundColor,
        setConvertedBackgroundColor,
        selectedPattern,
        setSelectedPattern,
        selectedEye,
        setSelectedEye,
        file,
        setFile
    };

    return (
        <CustomizationContext.Provider value={value}>
            {children}
        </CustomizationContext.Provider>
    )
}

export default CustomizationContext;