import {
  Box,
  Card,
  Layout,
  Link,
  List,
  Page,
  Text,
  BlockStack,
  EmptyState,
  DataTable,
  IndexTable,
  Filters,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import Footer from "./components/Footer";
import db from "../db.server"
import { authenticate } from "../shopify.server";
import { useLoaderData } from "@remix-run/react";
import { useCallback, useEffect, useState } from "react";
import Loading from "./components/Loading";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const { shop } = session;
  const data = await db.qRCode.findMany(
    {
      where: { shop },
      select: {
        id: true,
        destination: true,
        endpoint: true,
        title: true,
        type: true,
        createdAt: true,
      }
    }
  );
  return data ?? null;
};

export default function ListPage() {
  const rows = useLoaderData();
  const [pageLoading, setPageLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredRows, setFilteredRows] = useState(rows);
  const [queryValue, setQueryValue] = useState();

  useEffect(() => {
    const init = async () => {
      if (!rows) {
        console.log("Loading...");
      } else {
        setPageLoading(false);
      }
    }
    init();
  }, [rows]);

  // const filteredRows = rows.filter(({ title, endpoint, destination }) =>
  //   [title, endpoint, destination]
  //     .some(field =>
  //       field?.includes(queryValue)
  //     )
  // );

  useEffect(() => {
    setIsLoading(true);

    const timer = setTimeout(() => {
      if (!queryValue.trim()) {
        setFilteredRows(rows);
      } else {
        const query = queryValue.toLowerCase();

        const result = rows.filter(({ title, endpoint, destination }) =>
          [title, endpoint, destination].some((field) => field?.toLowerCase().includes(query))
        );

        setFilteredRows(result);
      }
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [queryValue, rows]);

  const handleFiltersQueryChange = useCallback(
    (value) => setQueryValue(value),
    [],
  );

  const row = filteredRows.map(
    ({ id, title, destination, endpoint, type, createdAt }) => {
      const date = new Date(createdAt);
      const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

      return (
        <IndexTable.Row
          id={id}
          key={id}
        >
          <IndexTable.Cell>
            <Text>
              <Link
                url={`/app/static/${id}`}
                key={id}
              >
                {title}
              </Link>
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell>{endpoint}</IndexTable.Cell>
          <IndexTable.Cell>{type}</IndexTable.Cell>
          <IndexTable.Cell>{formattedDate}</IndexTable.Cell>
        </IndexTable.Row>
      )
    }
  );

  const resourceName = {
    singular: 'order',
    plural: 'orders',
  };


  return (
    <Page
      title="QR Codes List"
      subtitle="QR codes you created will be shown up here."
      backAction={{ content: 'Generator', url: '../' }}
    >
      <TitleBar title="Your QR codes" />
      <Card>
        <Filters
          queryValue={queryValue}
          queryPlaceholder="Search a QR code(s) by name, endpoint or URL"
          filters={["lol", "lmao"]}
          onQueryChange={handleFiltersQueryChange}
          loading={isLoading}
        />
        {pageLoading ?
          <Loading />
          :
          (row.length !== 0 ?
            <IndexTable
              resourceName={resourceName}
              itemCount={rows.length}
              headings={[
                { title: 'Name' },
                { title: 'Endpoint' },
                { title: 'Type' },
                { title: 'Created at' },
              ]}
              selectable={false}
              pagination={{
                hasNext: true,
                onNext: () => {},
              }}
              >
              {row}
            </IndexTable>
            :
            <BlockStack inlineAlign="center" gap="200">
              <Text fontWeight="headingLg" as="h5">
                There's nothing here...
              </Text>
              <Text fontWeight="bodyLg" as="p">
                Maybe try to create some QR codes with us?
              </Text>
            </BlockStack>
          )
        }
      </Card>
      <Footer />
    </Page>
  );
}
