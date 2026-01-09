import { createContext, useState } from "react";

const SettingsDateTimeContext = createContext();

export const SettingsDateTimeProvider = ({ children }) => {
    const [selectedTimeFormat, setSelectedTimeFormat] = useState("short");
    const [selectedHourFormat, setSelectedHourFormat] = useState("12h");
    const [selectedDateFormat, setSelectedDateFormat] = useState("dmy");
    const [selectedDateStringFormat, setSelectedDateStringFormat] = useState("short");
    const [timePreviewString, setTimePreviewString] = useState("");
    const [datePreviewString, setDatePreviewString] = useState("");

    const value = {
        selectedTimeFormat,
        setSelectedTimeFormat,
        selectedHourFormat, 
        setSelectedHourFormat,
        selectedDateFormat, 
        setSelectedDateFormat,
        selectedDateStringFormat, 
        setSelectedDateStringFormat,
        timePreviewString, 
        setTimePreviewString,
        datePreviewString, 
        setDatePreviewString,
    };

    return (
        <SettingsDateTimeContext.Provider value={value}>
            {children}
        </SettingsDateTimeContext.Provider>
    )
}

export default SettingsDateTimeContext;