import { useActionData, useLoaderData } from "@remix-run/react";
import { BlockStack, Box, Card, ColorPicker, Divider, Grid, hsbToHex, InlineStack, Page, Popover, Select, Text, TextField } from "@shopify/polaris";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import Footer from "./components/Footer";
import QRCustomizationsContext, { QRCustomizationsProvider } from "./contexts/QRCustomizationsContext";
import { QRLoadingProvider } from "./contexts/QRLoadingContext";
import { authenticate } from "../shopify.server";
import db from "../db.server"
import { SettingsDateTimeProvider } from "./contexts/SettingsDateTimeContext";
import SettingsPage from "./components/SettingsPage";
import { json } from "@remix-run/node";

export const loader = async ({ request }) => {
    const { session } = await authenticate.admin(request);
    const { id, shop } = session;

    const settingsData = await db.settings.findFirst(
        {
            where: {
                shop
            },
            select: {
                fgColor: true,
                bgColor: true,
                timeFormat: true,
                hourFormat: true,
                dateFormat: true,
                dateStringFormat: true,
            }
        }
    );

    const data = {
        fgColor: settingsData ? settingsData.fgColor : "#000000",
        bgColor: settingsData ? settingsData.bgColor : "#ffffff",
        timeFormat: settingsData ? settingsData.timeFormat : "short",
        hourFormat: settingsData ? settingsData.hourFormat : "12h",
        dateFormat: settingsData ? settingsData.dateFormat : "dmy",
        dateStringFormat: settingsData ? settingsData.dateStringFormat : "short",
    }

    return { data };
}

export const action = async ({ request }) => {
    const { session, admin } = await authenticate.admin(request);
    const { id, shop } = session;
    const settingsData = await db.settings.findFirst(
        {
            where: {
                shop
            },
            select: {
                fgColor: true,
                bgColor: true,
                timeFormat: true,
                hourFormat: true,
                dateFormat: true,
                dateStringFormat: true,
            }
        }
    );

    const formData = await request.formData();

    const data = {
        id,
        fgColor: formData.get("fgColor"),
        bgColor: formData.get("bgColor"),
        timeFormat: formData.get("timeFormat"),
        hourFormat: formData.get("hourFormat"),
        dateFormat: formData.get("dateFormat"),
        dateStringFormat: formData.get("dateStringFormat"),
        shop,
    };

    try {
        if (!settingsData) {
            const createSettings = await db.settings.create({
                data
            });
        } else {
            const updateSettings = await db.settings.update({
                where: {
                    id,
                    shop,
                },
                data,
            });
        }
        return json({ success: true, message: "Settings saved successfully!" });
    } catch (err) {
        console.error("There was an error while saving the settings: ", err);
        return json({ success: false, error: "Failed to save settings" }, { status: 500 });
    }
}

export default function Settings() {
    const { data } = useLoaderData();
    const actionData = useActionData();
    return (
        <QRLoadingProvider>
            <QRCustomizationsProvider>
                <SettingsDateTimeProvider>
                    <Page title="Settings">
                        <BlockStack gap="600">
                            <SettingsPage settingsData={{ data, actionData }} />
                        </BlockStack >
                        <Footer />
                    </Page >
                </SettingsDateTimeProvider>
            </QRCustomizationsProvider>
        </QRLoadingProvider>
    )
}