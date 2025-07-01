import { useFetcher, useSubmit } from "@remix-run/react";
import { SaveBar } from "@shopify/app-bridge-react";
import { useContext, useEffect, useState } from "react";
import TargetContext from "../contexts/TargetContext";
import SettingsContext from "../contexts/SettingsContext";
import CustomizationContext from "../contexts/CustomizationContext";

export default function GlobalSaveBar() {
    const [isLoading, setIsLoading] = useState(true);
    const targetContext = useContext(TargetContext);
    const settingsContext = useContext(SettingsContext);
    const customizationContext = useContext(CustomizationContext);

    useEffect(() => {
        const init = async () => {
            if (!targetContext || !settingsContext || !customizationContext) {
                console.log("Loading...")
            } else {
                setIsLoading(false);
            }
        }
        init();
    }, [targetContext, settingsContext, customizationContext])

    const {
        selected,
        qrDestination,
        setQRDestination
    } = targetContext;

    const {
        qrName,
        setQRName,
        initialQRName,
        setInitialQRName
    } = settingsContext;

    const {
        convertedForegroundColor,
        setConvertedForegroundColor,
        convertedBackgroundColor,
        setConvertedBackgroundColor,
        selectedPattern,
        setSelectedPattern,
        selectedEye,
        setSelectedEye,
    } = customizationContext;

    const [formData, setFormData] = useState({
        qrDestination: qrDestination,
        qrName: qrName,

    });

    const [initialData, setInitialData] = useState({ ...formData });

    useEffect(() => {
        const isChanged = true;
        const init = async () => {
            if (isChanged) {
                shopify.saveBar.show("my-save-bar");
            } else {
                shopify.saveBar.hide("my-save-bar");
            }
        }
        init();
    }, [formData, initialData])

    useEffect(() => {
        console.log(formData);
        console.log(initialData);
    }, [formData, initialData])

    const submit = useSubmit();

    const handleSave = async () => {
        setInitialQRName(qrName);

        const currentDate = new Date().toISOString();

        const data = {
            destination: qrDestination,
            title: qrName,
            fgColor: convertedForegroundColor,
            bgColor: convertedBackgroundColor,
            pattern: selectedPattern,
            frame: selectedEye,
            createdAt: currentDate,
            expiredAt: currentDate,
        };

        submit(data, { method: "post" });
        shopify.saveBar.hide('my-save-bar');
    };

    const handleDiscard = () => {
        setQRName(initialQRName);
        shopify.saveBar.hide('my-save-bar');
    };

    return (
        <>
            <SaveBar id="my-save-bar">
                <button variant="primary" onClick={handleSave}></button>
                <button onClick={handleDiscard}></button>
            </SaveBar>
        </>
    )
}