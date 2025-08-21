import { useEffect, useState } from "react";
import {
  Grid,
} from "@shopify/polaris";
import QRStaticPage from "./components/QRStaticPage";
import QRCard from "./components/QRCard";
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { json } from "@remix-run/node";

import { useActionData, useLoaderData } from "@remix-run/react";

export const loader = () => {
  const data = {
    // Placeholder, implement values from settings next update
    title: "",
    endpoint: "Homepage",
    fgColor: "#ff0000",
    bgColor: "#16ecec",
    pattern: "square",
    eye: "square",
    productId: "",
    variantId: "",
  };
  const imageData = "";

  return {
    data,
    imageData
  }
};

export const action = async ({ request, params }) => {
  const { session, admin } = await authenticate.admin(request);
  const { shop } = session;
  const uniqueId = uuidv4();

  // Images uploading function
  const formData = await request.formData();
  const file = formData.get("imageUrl");
  if (file) {
    const fileName = file.name;

    const stagedUploadsImage = await admin.graphql(
      `#graphql
    mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets {
        url
        resourceUrl
        parameters {
          name
          value
        }
      }
      userErrors {
        field
        message
      }
    }
  }`,
      {
        variables: {
          "input": [
            {
              resource: "IMAGE",
              filename: fileName,
              mimeType: file.type,
              httpMethod: "POST",
            }
          ]
        }
      }
    );

    const result = await stagedUploadsImage.json();
    const target = result?.data?.stagedUploadsCreate?.stagedTargets?.[0];

    if (!target) {
      console.error("Staged upload failed: Either the user hasn't uploaded an image or ", result?.data?.stagedUploadsCreate?.userErrors);
      return json({ success: false, error: "Failed to create staged upload" }, { status: 500 });
    }

    const uploadForm = new FormData();
    target.parameters.forEach(param => {
      uploadForm.append(param.name, param.value);
    });

    uploadForm.append("file", file, fileName);

    const uploadImage = await fetch(target.url, {
      method: "POST",
      body: uploadForm,
    })

    if (!uploadImage.ok) {
      console.error("Failed to upload file to S3:", await uploadImage.text());
      return json({ success: false, error: "Failed to upload file to storage" }, { status: 500 });
    }

    const uploadsImage = await admin.graphql(
      `#graphql
    mutation fileCreate($files: [FileCreateInput!]!) {
      fileCreate(files: $files) {
        files {
          fileStatus
          ... on MediaImage {
            id
          }
        }
        userErrors {
          field
          message
        }
      }
    }`,
      {
        variables: {
          "files": [
            {
              originalSource: target.resourceUrl,
            },
          ],
        }
      }
    );

    const uploadsImageResult = await uploadsImage.json();
    console.log(uploadsImageResult);
    const created = uploadsImageResult?.data?.fileCreate?.files?.[0];
    const imageId = created?.id;

    if (!imageId) {
      return json({ success: false, error: "Failed to get image ID" }, { status: 500 });
    }

    const data = {
      title: formData.get("title"),
      endpoint: formData.get("endpoint"),
      destination: formData.get("destination"),
      fgColor: formData.get("fgColor"),
      bgColor: formData.get("bgColor"),
      pattern: formData.get("pattern"),
      eye: formData.get("eye"),
      productId: formData.get("productId"),
      variantId: formData.get("variantId"),
      imageUrl: imageId ? imageId : "",
      createdAt: formData.get("createdAt"),
      expiredAt: formData.get("expiredAt"),
      shop,
      id: uniqueId,
      type: "Static",
      isDeleted: false,
    };

    try {
      const createQRCodeWithImage = await db.qRCode.create({ data });
      return json({ success: true, message: "QR created successfully" });
    } catch (err) {
      console.error("There was an error while creating the QR: ", err);
      return json({ success: false, error: "Failed to create QR code" }, { status: 500 });
    }

  } else {
    const data = {
      title: formData.get("title"),
      endpoint: formData.get("endpoint"),
      destination: formData.get("destination"),
      fgColor: formData.get("fgColor"),
      bgColor: formData.get("bgColor"),
      pattern: formData.get("pattern"),
      eye: formData.get("eye"),
      productId: formData.get("productId"),
      variantId: formData.get("variantId"),
      imageUrl: "",
      createdAt: formData.get("createdAt"),
      expiredAt: formData.get("expiredAt"),
      shop,
      id: uniqueId,
      type: "Static",
      isDeleted: false,
    };

    try {
      const createQRCode = await db.qRCode.create({ data });
      return json({ success: true, message: "QR created successfully" });
    } catch (err) {
      console.error("There was an error while creating the QR: ", err);
      return json({ success: false, error: "Failed to create QR code" }, { status: 500 });
    }
  }
}

export default function StaticIndexPage() {
  const { data, imageData } = useLoaderData();
  const actionData = useActionData();

  return (
    <Grid>
      <Grid.Cell columnSpan={{ xs: 8, sm: 4, md: 4, lg: 8, xl: 8 }}>
        <QRStaticPage qrData={{ data, imageData, actionData }} />
      </Grid.Cell>
      <Grid.Cell columnSpan={{ xs: 4, sm: 2, md: 2, lg: 4, xl: 4 }}>
        <QRCard />
      </Grid.Cell>
    </Grid>
  );
}
