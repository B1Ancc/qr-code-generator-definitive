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
import db from "../db.server"
import { useEffect } from "react";
import Error404 from "./components/Error404";

export const loader = async ({ request, params }) => {
  const { admin, session, redirect } = await authenticate.admin(request);
  const { shop } = session;

  // Querying for existed QR code with the same UUID
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
        imageUrl: true,
      }
    }
  );

  if (!data) {
    throw new Response("Failed to get data!", { status: 404 });
  }

  try {
    if (data.imageUrl) {
      const queryImage = await admin.graphql(
        `#graphql
    query getFileByID($id: ID!) {
      node(id: $id) {
        ... on MediaImage {
          id
          image {
            url
          }
        }  
      }
    }`,
        {
          variables: {
            id: data.imageUrl,
          }
        }
      );

      const result = await queryImage.json();
      const imageData = result?.data?.node?.image?.url;

      return {
        data,
        imageData,
      };
    } else {
      const imageData = null;

      return {
        data,
        imageData
      }
    }
  } catch (error) {
    const imageData = JSON.stringify(error, null, 2);
    throw new Response(imageData, { status: 500 });
  }
};

export const action = async ({ request, params }) => {
  const { session, admin } = await authenticate.admin(request);
  const { shop } = session;

  // Images uploading function
  const formData = await request.formData();
  const file = formData.get("imageUrl");
  if (file) {
    const fileName = file.name

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
    };

    const updateQRCodeWithImage = await db.qRCode.update({
      where: {
        id: params.id,
      },
      data
    });
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
    };

    const updateQRCode = await db.qRCode.update({
      where: {
        id: params.id,
      },
      data
    });
  }
  return null;
}

export default function StaticQRPage() {
  const { data, imageData } = useLoaderData();

  return (
    <Grid>
      <Grid.Cell columnSpan={{ xs: 8, sm: 4, md: 4, lg: 8, xl: 8 }}>
        <Homepage qrData={{ data, imageData }} />
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
