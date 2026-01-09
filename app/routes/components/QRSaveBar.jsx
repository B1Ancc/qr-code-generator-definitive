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
            case "Product page":
            case "Add to cart":
            case "Custom URL":
                if (!qrDestination) {
                    shopify.toast.show("Please select a valid product or URL.", {
                        isError: true,
                        duration: 2000,
                    });
                    return null;
                }
                break;

            default:
                if (!convertedForegroundColor || !convertedBackgroundColor || !selectedPattern || !selectedEye) {
                    shopify.toast.show("Missing customization data.", { isError: true });
                    return null;
                }
        }

        // If we reach here, validation passed
        shopify.toast.show("Saving... Please do not close the browser.");
        setLoading("QR_Target", true);
        setLoading("QR_Settings", true);
        setLoading("QR_Customizations", true);

        let shopifyResourceUrl = "";

        try {
            if (file && file instanceof File) {
                const imageFormData = new FormData();
                imageFormData.append("filename", file.name);
                imageFormData.append("mimeType", file.type);

                const imageResponse = await fetch("/api/sign-upload", {
                    method: "POST",
                    body: imageFormData
                });

                const imageData = await imageResponse.json();
                const target = imageData.data.stagedUploadsCreate.stagedTargets[0];

                const uploadForm = new FormData();
                target.parameters.forEach(p => uploadForm.append(p.name, p.value));
                uploadForm.append("file", file);

                const uploadResult = await fetch(target.url, {
                    method: "POST",
                    body: uploadForm,
                });

                if (!uploadResult.ok) throw new Error("Image upload failed");

                shopifyResourceUrl = target.resourceUrl;
            }

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
            // This is the "Cheat" - sending the URL string, not the file
            formData.append("shopifyResourceUrl", shopifyResourceUrl);

            // Submit to Remix action
            await submit(formData, { method: "post" });
            shopify.toast.show("Saved.");

        } catch (err) {
            console.error("Save error: ", err);
            shopify.toast.show("Error saving QR code.", { isError: true });
        } finally {
            setLoading("QR_Target", false);
            setLoading("QR_Settings", false);
            setLoading("QR_Customizations", false);
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