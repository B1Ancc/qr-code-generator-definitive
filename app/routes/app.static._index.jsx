import { useEffect, useState } from "react";
import {
  Button,
  Grid,
  Page,
} from "@shopify/polaris";
import QRStaticPage from "./components/QRStaticPage";
import QRCard from "./components/QRCard";
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { json } from "@remix-run/node";

import { useActionData, useLoaderData } from "@remix-run/react";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const { id, shop } = session;

  const settingsData = await db.settings.findFirst(
    {
      where: {
        id,
        shop,
      },
      select: {
        fgColor: true,
        bgColor: true,
      }
    }
  );

  const data = {
    // Placeholder, implement values from settings next update
    title: "",
    endpoint: "Homepage",
    fgColor: settingsData ? settingsData.fgColor : "#000000",
    bgColor: settingsData ? settingsData.bgColor : "#ffffff",
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

    // if (!target) {
    //   console.error("Staged upload failed: Either the user hasn't uploaded an image or ", result?.data?.stagedUploadsCreate?.userErrors);
    //   return json({ success: false, error: "Failed to create staged upload" }, { status: 500 });
    // }

    const uploadForm = new FormData();
    target.parameters.forEach(param => {
      uploadForm.append(param.name, param.value);
    });

    const arrayBuffer = await file.arrayBuffer();

    uploadForm.append(
      "file",
      new Blob([arrayBuffer], { type: file.type }),
      file.name
    );
    
    const uploadImage = await fetch(target.url, {
      method: "POST",
      body: uploadForm,
    })

    // if (!uploadImage.ok) {
    //   console.error("Failed to upload file to S3:", await uploadImage.text());
    //   return json({ success: false, error: "Failed to upload file to storage" }, { status: 500 });
    // }

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

    // if (!imageId) {
    //   return json({ success: false, error: "Failed to get image ID" }, { status: 500 });
    // }

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
      return json({ extraSuccess: true, message: "QR created successfully" });
    } catch (err) {
      console.error("There was an error while creating the QR: ", err);
      return json({ extraSuccess: false, error: "Failed to create QR code" }, { status: 500 });
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
      return json({ extraSuccess: true, message: "QR created successfully" });
    } catch (err) {
      console.error("There was an error while creating the QR: ", err);
      return json({ extraSuccess: false, error: "Failed to create QR code" }, { status: 500 });
    }
  }
}

export default function StaticIndexPage() {
  const { data, imageData } = useLoaderData();
  const actionData = useActionData();

  return (
    <Page
      title="Static QR Codes Generator"
      subtitle="Create a QR code instantly (without trackers)."
    >
      <QRStaticPage qrData={{ data, imageData, actionData }} />
    </Page>
  );
}
