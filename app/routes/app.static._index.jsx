import { useState } from "react";
import {
  Grid,
} from "@shopify/polaris";
import Homepage from "./components/Homepage";
import QRCard from "./components/QRCard";
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = () => {
  return null;
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

export default function StaticIndexPage() {
  const [isLoading, setIsLoading] = useState(true);

  return (  
      <Grid>
        <Grid.Cell columnSpan={{ xs: 8, sm: 4, md: 4, lg: 8, xl: 8 }}>
          <Homepage />
        </Grid.Cell>
        <Grid.Cell columnSpan={{ xs: 4, sm: 2, md: 2, lg: 4, xl: 4 }}>
          <QRCard />
        </Grid.Cell>
      </Grid>
  );
}
