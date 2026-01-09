import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  
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
        input: [{
          resource: "IMAGE",
          filename: formData.get("filename"),
          mimeType: formData.get("mimeType"),
          httpMethod: "POST",
        }]
      }
    }
  );

  return json(await response.json());
};