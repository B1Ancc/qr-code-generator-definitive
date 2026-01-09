import { useFetcher, useSubmit } from "@remix-run/react";
import { SaveBar } from "@shopify/app-bridge-react";
import { useContext, useEffect, useState } from "react";
import QRTargetContext from "../contexts/QRTargetContext";
import QRSettingsContext from "../contexts/QRSettingsContext";
import QRCustomizationsContext from "../contexts/QRCustomizationsContext";
import { useQRLoadingContext } from "../contexts/QRLoadingContext";


export default function GlobalSaveBar({ saveData }) {
    const qrTargetContext = useContext(QRTargetContext);
    const qrSettingsContext = useContext(QRSettingsContext);
    const qrCustomizationsContext = useContext(QRCustomizationsContext);
    const { loadingStates, setLoading } = useQRLoadingContext();
    const isLoading = loadingStates["SaveBar"] ?? true;
    const submit = useSubmit();

    useEffect(() => {
        const init = async () => {
            setLoading("SaveBar", true);
            await (qrTargetContext);
            await (qrSettingsContext);
            await (qrCustomizationsContext);
            setLoading("SaveBar", false);
        }
        init();
    }, [qrTargetContext, qrSettingsContext, qrCustomizationsContext])

    const {
        selected,
        setSelected,
        qrDestination,
        qrProductId,
        qrVariantId
    } = qrTargetContext;

    const {
        qrName,
        setQRName,
    } = qrSettingsContext;

    const {
        convertedForegroundColor,
        setConvertedForegroundColor,
        convertedBackgroundColor,
        setConvertedBackgroundColor,
        selectedPattern,
        setSelectedPattern,
        selectedEye,
        setSelectedEye,
        file,
        setFile,
    } = qrCustomizationsContext;

    // Checking for changes on any field
    useEffect(() => {
        const init = async () => {
            const hasChange = () => {
                const initial = saveData.data;
                const initialImage = saveData.imageData;
                return (
                    selected !== initial.endpoint ||
                    // qrDestination !== initial.destination ||
                    qrName !== initial.title ||
                    convertedForegroundColor !== initial.fgColor ||
                    convertedBackgroundColor !== initial.bgColor ||
                    selectedPattern !== initial.pattern ||
                    selectedEye !== initial.eye ||
                    false
                );
            }
            if (hasChange()) {
                shopify.saveBar.show('my-save-bar');
                console.log(saveData);
            }
            else {
                shopify.saveBar.hide('my-save-bar');
            }
        }
        init();
    }, [selected, qrName, convertedForegroundColor, convertedBackgroundColor, selectedPattern, selectedEye]);

    const handleSave = async () => {
        shopify.saveBar.hide('my-save-bar');

        switch (selected) {
            case (selected == "Product page" && !qrDestination):
                shopify.toast.show("Please select a valid product.", {
                    isError: true,
                    duration: 2000,
                });
                return null;
            case (selected == "Add to cart" && !qrDestination):
                shopify.toast.show("Please select a valid product.", {
                    isError: true,
                    duration: 2000,
                });
                return null;
            case (selected == "Custom URL" && !qrDestination):
                shopify.toast.show("Please select a valid product.", {
                    isError: true,
                    duration: 2000,
                });
                return null;
            case (!convertedForegroundColor || !convertedBackgroundColor || !selectedPattern || !selectedEye):
                shopify.toast.show("There was an error while saving the QR code. Please refresh the app and try again.", {
                    isError: true,
                    duration: 2000,
                });
                console.log("Missing data!");
                return null;
            default:
                shopify.toast.show("Saving... Please do not close the browser during this time.")
                setLoading("QR_Target", true)
                setLoading("QR_Settings", true);
                setLoading("QR_Customizations", true);

                const currentDate = new Date().toISOString();

                const formData = new FormData();
                formData.append("destination", qrDestination);
                formData.append("endpoint", selected);
                formData.append("title", qrName);
                formData.append("fgColor", convertedForegroundColor);
                formData.append("bgColor", convertedBackgroundColor);
                formData.append("pattern", selectedPattern);
                formData.append("eye", selectedEye);
                formData.append("productId", qrProductId || "");
                formData.append("variantId", qrVariantId || "");
                formData.append("createdAt", currentDate);
                formData.append("expiredAt", currentDate);

                if (file) {
                    const imageFile = new File([file], "qr.png", { type: file.type });
                    formData.append("imageUrl", imageFile);
                }

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

                    setLoading("QR_Target", false);
                    setLoading("QR_Settings", false);
                    setLoading("QR_Customizations", false);
                    if (saveData.actionData?.success === false) {
                        shopify.toast.show("Something went wrong.", {
                            isError: true,
                            duration: 2000
                        });
                    } else {
                        shopify.toast.show("Saved.")
                    }
                } catch (err) {
                    setLoading("QR_Target", false);
                    setLoading("QR_Settings", false);
                    setLoading("QR_Customizations", false);

                    console.error("Something went wrong: ", err);
                    shopify.toast.show("There was an error while creating the QR code.", {
                        isError: true,
                        duration: 2000
                    });
                }
        }
    };

    const handleDiscard = async () => {
        const initial = saveData.data;
        const initialImage = saveData.imageData;
        setSelected(initial.endpoint);
        setQRName(initial.title);
        setConvertedForegroundColor(initial.fgColor);
        setConvertedBackgroundColor(initial.bgColor);
        setSelectedPattern(initial.pattern);
        setSelectedEye(initial.eye);
        if (initialImage === "") {
            setFile(initialImage);
        }
        else {
            const response = await fetch(initialImage);
            if (!response.ok) throw new Error(initialImage);

            const blob = await response.blob();
            setFile(blob);
        }
        shopify.toast.show("All unsaved changes have been reverted.");
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