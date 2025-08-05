import { useEffect, useState } from "react";
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
      imageUrl: imageId ? imageId : "",
      createdAt: formData.get("createdAt"),
      expiredAt: formData.get("expiredAt"),
      shop,
      id: uniqueId,
      type: "Static",
    };

    const createQRCodeWithImage = await db.qRCode.create({ data });

  } else {
    const data = {
      title: formData.get("title"),
      endpoint: formData.get("endpoint"),
      destination: formData.get("destination"),
      fgColor: formData.get("fgColor"),
      bgColor: formData.get("bgColor"),
      pattern: formData.get("pattern"),
      eye: formData.get("eye"),
      imageUrl: "",
      createdAt: formData.get("createdAt"),
      expiredAt: formData.get("expiredAt"),
      shop,
      id: uniqueId,
      type: "Static",
    };

    const createQRCode = await db.qRCode.create({ data });
  }
  return null;
}

export default function StaticIndexPage() {

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
