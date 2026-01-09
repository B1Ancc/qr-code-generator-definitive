import { useContext, useEffect } from "react";
import { useQRLoadingContext } from "../contexts/QRLoadingContext"
import QRCustomizationsContext from "../contexts/QRCustomizationsContext";
import { useSubmit } from "@remix-run/react";
import { SaveBar } from "@shopify/app-bridge-react";
import SettingsDateTimeContext from "../contexts/SettingsDateTimeContext";

export default function SettingsSaveBar({ settingsSaveData }) {
    const qrCustomizationsContext = useContext(QRCustomizationsContext);
    const settingsDateTimeContext = useContext(SettingsDateTimeContext);
    const { loadingStates, setLoading } = useQRLoadingContext();
    const isLoading = loadingStates["Settings_SaveBar"] ?? true;
    const submit = useSubmit();

    useEffect(() => {
        const init = async () => {
            setLoading("Settings_SaveBar", true);
            await (qrCustomizationsContext);
            await (settingsDateTimeContext);
            setLoading("Settings_SaveBar", false);
        }
        init();
    }, [qrCustomizationsContext, settingsDateTimeContext])

    const {
        convertedForegroundColor,
        setConvertedForegroundColor,
        convertedBackgroundColor,
        setConvertedBackgroundColor,
    } = qrCustomizationsContext;

    const {
        selectedTimeFormat,
        setSelectedTimeFormat,
        selectedHourFormat,
        setSelectedHourFormat,
        selectedDateFormat,
        setSelectedDateFormat,
        selectedDateStringFormat,
        setSelectedDateStringFormat,
    } = settingsDateTimeContext;

    useEffect(() => {
        const init = async () => {
            const hasChange = () => {
                const initial = settingsSaveData.data;
                return (
                    convertedForegroundColor !== initial.fgColor ||
                    convertedBackgroundColor !== initial.bgColor ||
                    selectedTimeFormat !== initial.timeFormat ||
                    selectedHourFormat !== initial.hourFormat ||
                    selectedDateFormat !== initial.dateFormat ||
                    selectedDateStringFormat !== initial.dateStringFormat ||
                    false
                );
            }
            if (hasChange()) {
                shopify.saveBar.show('settings-save-bar');
            }
            else {
                shopify.saveBar.hide('settings-save-bar');
            }
        }
        init();
    }, [convertedForegroundColor, convertedBackgroundColor, selectedTimeFormat, selectedHourFormat, selectedDateFormat, selectedDateStringFormat])

    const handleSave = async () => {
        shopify.saveBar.hide('settings-save-bar');
        shopify.toast.show("Saving... Please do not close the browser during this time.");

        setLoading("Settings_Colors", true);
        setLoading("Settings_DateTime", true);

        const formData = new FormData();
        formData.append("fgColor", convertedForegroundColor);
        formData.append("bgColor", convertedBackgroundColor);
        formData.append("timeFormat", selectedTimeFormat);
        formData.append("hourFormat", selectedHourFormat);
        formData.append("dateFormat", selectedDateFormat);
        formData.append("dateStringFormat", selectedDateStringFormat);

        const submitTimeout = () => new Promise((resolve, reject) => {
            setTimeout(async () => {
                try {
                    const submitData = await submit(formData, {
                        method: "post",
                        encType: "multipart/form-data"
                    });
                    resolve(submitData);
                } catch (err) {
                    reject(err)
                }
            }, 5000);
        });

        try {
            await submitTimeout();

            setLoading("Settings_Colors", false);
            setLoading("Settings_DateTime", false);

            if (settingsSaveData.actionData?.success === false) {
                shopify.toast.show("Something went wrong.", {
                    isError: true,
                    duration: 2000
                });
            } else {
                shopify.toast.show("Saved.");
            }
            
        } catch (err) {
            setLoading("Settings_Colors", false);
            setLoading("Settings_DateTime", false);

            console.error("Something went wrong: ", err);
            shopify.toast.show("There was an error while saving the settings.", {
                isError: true,
                duration: 2000
            });
        }
    }

    const handleDiscard = async () => {
        const initial = settingsSaveData.data;
        setConvertedForegroundColor(initial.fgColor);
        setConvertedBackgroundColor(initial.bgColor);
        setSelectedTimeFormat(initial.timeFormat);
        setSelectedHourFormat(initial.hourFormat);
        setSelectedDateFormat(initial.dateFormat);
        setSelectedDateStringFormat(initial.dateStringFormat);
        shopify.toast.show("All unsaved changes have been reverted.");
        shopify.saveBar.hide('settings-save-bar');
        console.log(settingsSaveData);
        console.log(settingsDateTimeContext);
    };

    return (
        <>
            <SaveBar id="settings-save-bar">
                <button variant="primary" onClick={handleSave}></button>
                <button onClick={handleDiscard}></button>
            </SaveBar>
        </>
    )
}


