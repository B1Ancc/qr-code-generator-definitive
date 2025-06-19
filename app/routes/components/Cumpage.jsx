import { useCallback, useEffect, useState } from "react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
  Grid,
  TextField,
  FormLayout,
  Tooltip,
  Select,
} from "@shopify/polaris";


export default function Cumpage() {
  const [titleValue, setTitleValue] = useState("");
  const [titleError, setTitleError] = useState(false);

  const [urlValue, setURLValue] = useState("");
  const [urlError, setURLError] = useState(false);

  const handleSelectChange = useCallback(
    (value) => setSelected(value),
    []
  )
  // Không dùng callback nếu không cần thiết (gây nặng code)
  const handleTitleChange = useCallback(
    (newTitleValue) => setTitleValue(newTitleValue),
    [],
  )

  const handleURLChange = useCallback(
    (newURLValue) => setURLValue(newURLValue),
    [],
  )

  return (
      <BlockStack gap="200">
        <Grid>
          <Grid.Cell columnSpan={{ xs: 8, sm: 4, md: 4, lg: 8, xl: 8 }}>
            <Card>
              <BlockStack gap="200">
                <Text variant="headingMd" as="h6">
                  Target
                </Text>
                <FormLayout>
                  <FormLayout.Group>
                    <Tooltip content="QR Code title" dismissOnMouseOut>
                      <TextField
                        id="title"
                        label="Title"
                        value={titleValue}
                        onChange={handleTitleChange}
                        onBlur={() => handleFieldBlur(titleValue, setTitleError)}
                        onFocus={() => handleFieldBlur(titleValue, setTitleError)}
                        maxLength={100}
                        placeholder="Title"
                        error={titleError}
                        showCharacterCount
                      />
                    </Tooltip>
                    <TextField
                      label="Title"
                      value={titleValue}
                      onChange={handleTitleChange}
                      maxLength={100}
                      placeholder="Title"
                      showCharacterCount
                    />
                  </FormLayout.Group>
                </FormLayout>
                <TextField
                  label="Destination URL"
                  value={urlValue}
                  onChange={handleURLChange}
                  type="url"
                />
              </BlockStack>
            </Card>
          </Grid.Cell>
          <Grid.Cell columnSpan={{ xs: 4, sm: 2, md: 2, lg: 4, xl: 4 }}>
            <Card>
              <Text>
                Preview
              </Text>
            </Card>
          </Grid.Cell>
        </Grid>
      </BlockStack>
  );
}
