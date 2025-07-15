import db from "../db.server"

export async function getQRCode(shop) {
    const result = await db.qRCode.findUnique(
        { 
            where: {
                id: "placeholder", 
                shop 
            },
            select: {
                title: true,
                fgColor: true,
            }
        }
    );

    return result ?? null;
}