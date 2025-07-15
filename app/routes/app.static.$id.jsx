import {
  Card,
  EmptyState,
  Grid,
  Link,
  Text,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import Homepage from "./components/Homepage";
import QRCard from "./components/QRCard";
import { isRouteErrorResponse, redirect, useLoaderData, useRouteError } from "@remix-run/react";
import { v4 as uuidv4 } from 'uuid';
import db from "../db.server"
import { useEffect } from "react";
import Error404 from "./components/Error404";

export const loader = async ({ request, params }) => {
  const { session, redirect } = await authenticate.admin(request);
  const { shop } = session;
  const data = await db.qRCode.findUnique(
    {
      where: {
        shop,
        id: params.id,
      },
      select: {
        id: true,
        title: true,
        fgColor: true,
        bgColor: true,
        pattern: true,
        eye: true,
      }
    }
  );

  if (!data) {
    throw new Response("Fake", { status: 404 });
  }

  return data;
};

export const action = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  const uniqueId = uuidv4();

  const data = {
    ...Object.fromEntries(await request.formData()),
    shop,
    id: uniqueId,
    type: "Static",
  };

  const createQRCode = await db.qRCode.create({ data });

  return null;
}

export default function StaticQRPage() {
  const loadedData = useLoaderData();

  return (
    <Grid>
      <Grid.Cell columnSpan={{ xs: 8, sm: 4, md: 4, lg: 8, xl: 8 }}>
        <Homepage qrData={loadedData} />
      </Grid.Cell>
      <Grid.Cell columnSpan={{ xs: 4, sm: 2, md: 2, lg: 4, xl: 4 }}>
        <QRCard />
      </Grid.Cell>
    </Grid>
  );
}


export function ErrorBoundary() {
  const caught = useRouteError();

  useEffect(() => {
    if (isRouteErrorResponse(caught) && caught.status === 404) {
      shopify.toast.show("The QR code you're looking for doesn't exist.", {
        isError: true,
        duration: 5000
      });
    }
  }, [caught]);

  if (isRouteErrorResponse(caught) && caught.status === 404) {
    return (
      <Error404 />
    );
  }
}
