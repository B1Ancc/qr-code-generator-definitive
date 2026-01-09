import {
  Button,
  Card,
  EmptyState,
  Grid,
  Link,
  Page,
  Text,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import QRStaticPage from "./components/QRStaticPage";
import QRCard from "./components/QRCard";
import { isRouteErrorResponse, redirect, useActionData, useLoaderData, useNavigate, useRouteError, useSubmit } from "@remix-run/react";
import db from "../db.server"
import { useEffect } from "react";
import Error404 from "./components/Error404";
import { json } from "@remix-run/node";
import { useQRLoadingContext } from "./contexts/QRLoadingContext";
import { dateTimeFormat } from "./utils/dateTimeFormat";

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
        destination: true,
        endpoint: true,
        title: true,
        fgColor: true,
        bgColor: true,
        pattern: true,
        eye: true,
        productId: true,
        variantId: true,
        imageUrl: true,
        isDeleted: true,
        createdAt: true
      }
    }
  );

  const settingsData = await db.settings.findFirst(
    {
      where: {
        shop
      },
      select: {
        timeFormat: true,
        hourFormat: true,
        dateFormat: true,
        dateStringFormat: true,
      }
    }
  );

  const settings = {
    timeFormat: settingsData ? settingsData.timeFormat : "short",
    hourFormat: settingsData ? settingsData.hourFormat : "12h",
    dateFormat: settingsData ? settingsData.dateFormat : "dmy",
    dateStringFormat: settingsData ? settingsData.dateStringFormat : "short",
  }

  if (!data || data.isDeleted === true) {
    throw new Response("Failed to get data!", { status: 404 });
  }

  try {
    if (data.endpoint === "Product page") {
      const productGID = data.productId;
      const queryProduct = await admin.graphql(
        `#graphql
        query($identifier: ProductIdentifierInput!) {
          product: productByIdentifier(identifier: $identifier) {
            id
            handle
            title
            media(first: 1) {
              edges {
                node {
                  id
                  alt
                  preview {
                    image {
                      url
                    }
                  }
                }
              }
            }
          }
        }`,
        {
          variables: {
            "identifier": {
              "id": productGID,
            }
          }
        }
      );
      const result = await queryProduct.json();
      const productData = result?.data?.product;

      data.productTitle = productData.title || null;
      data.productImage = productData.media.edges[0].node.preview.image.url || null;
    } else if (data.endpoint === "Add to cart") {
      const variantGID = data.variantId;
      const queryVariant = await admin.graphql(
        `#graphql
        query($identifier: ProductVariantIdentifierInput!) {
          product: productVariantByIdentifier(identifier: $identifier) {
            id
            title
            displayName
            inventoryQuantity
            media(first: 1) {
              edges {
                node {
                  id
                  alt
                  preview {
                    image {
                      url
                    }
                  }
                }
              }
            }
          }
        }`,
        {
          variables: {
            "identifier": {
              "id": variantGID,
            }
          }
        }
      );
      const result = await queryVariant.json();
      const productData = result?.data?.product;

      const displayTitle = productData.displayName.split(` - ${productData.title}`);
      data.productTitle = displayTitle[0] || null;
      data.productVariantTitle = productData.title || null;
      data.productVariantImage = productData.media.edges[0].node.preview.image.url || null;
      data.productVariantQuantity = productData.inventoryQuantity || null;
    } else {
    }
  } catch (err) {
    console.error("There was an error while fetching the QR: ", err);
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
        settings,
      };
    } else {
      const imageData = "";

      return {
        data,
        imageData,
        settings,
      }
    }
  } catch (err) {
    // const errorsMessage = ["body", "errors", "networkStatusCode", "message"];
    // const imageData = JSON.stringify(error.body.errors, null, 2);
    const imageData = "200";
    return {
      data,
      imageData,
      settings,
    }
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
      productId: formData.get("productId"),
      variantId: formData.get("variantId"),
      imageUrl: imageId ? imageId : "",
      createdAt: formData.get("createdAt"),
      expiredAt: formData.get("expiredAt"),
      shop,
    };

    try {
      const updateQRCodeWithImage = await db.qRCode.update({
        where: {
          id: params.id,
        },
        data
      });
      return json({ success: true, message: "QR updated successfully" });
    } catch (err) {
      console.error("There was an error while updating the QR: ", err);
      return json({ success: false, error: "Failed to update QR code" }, { status: 500 });
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
    };

    try {
      if (request.method === "POST") {
        const updateQRCode = await db.qRCode.update({
          where: {
            id: params.id,
          },
          data
        });
        return json({ success: true, message: "QR updated successfully" });
      }
      else {
        const deleteQRCode = await db.qRCode.update({
          where: {
            id: params.id,
          },
          data: {
            isDeleted: true,
          }
        });
        return json({ success: true, message: "QR deleted successfully" });
      }
    } catch (err) {
      console.error("There was an error while updating the QR: ", err);
      return json({ success: false, error: "Failed to update QR code" }, { status: 500 });
    }
  }
}

export default function StaticQRPage() {
  const { data, imageData, settings } = useLoaderData();
  const actionData = useActionData();

  const { loadingStates, setLoading } = useQRLoadingContext();
  const submit = useSubmit();
  const navigate = useNavigate();

  const handleDelete = async () => {
    shopify.toast.show("Deleting... Please do not close the browser during this time.")
    setLoading("QR_Target", true)
    setLoading("QR_Settings", true);
    setLoading("QR_Customizations", true);

    const formData = new FormData();
    formData.append("isDeleted", true);

    const submitTimeout = () => new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const submitData = await submit(formData, {
            method: "delete",
            encType: "multipart/form-data",
          });
          resolve(submitData);
          navigate("/app");
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
      if (actionData?.success === false) {
        shopify.toast.show("Something went wrong.", {
          isError: true,
          duration: 2000
        });
      } else {
        shopify.toast.show("Saved.");
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

  const date = new Date(data.createdAt);
  const dateModifiedString = `Last modified: ${dateTimeFormat(date, settings)}`

  return (
    <Page
      backAction={{ content: 'List', url: '/app/list' }}
      title={data.title.length >= 28 ? `${data.title.slice(0, 28)}...` : data.title}
      subtitle={dateModifiedString}
      primaryAction={<Button variant="primary" tone="critical" onClick={handleDelete}>Delete</Button>}
    >
      <QRStaticPage qrData={{ data, imageData, actionData }} />
    </Page>
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
