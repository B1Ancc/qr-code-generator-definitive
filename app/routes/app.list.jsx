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
  ChoiceList,
  Badge,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import Footer from "./components/Footer";
import db from "../db.server"
import { authenticate } from "../shopify.server";
import { useLoaderData } from "@remix-run/react";
import { useCallback, useEffect, useState } from "react";
import Loading from "./components/Loading";
import { dateTimeFormat } from "./utils/dateTimeFormat";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const { shop } = session;
  const rows = await db.qRCode.findMany(
    {
      where: { 
        shop,
        isDeleted: false,
       },
      select: {
        id: true,
        destination: true,
        endpoint: true,
        title: true,
        type: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
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

  return {
    rows,
    settings
  };
};

export default function ListPage() {
  const { rows, settings } = useLoaderData();
  const [pageLoading, setPageLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredRows, setFilteredRows] = useState(rows);
  const [queryValue, setQueryValue] = useState();
  const [qrType, setQRType] = useState();
  const [qrEndpoint, setQREndpoint] = useState();
  const [pageNumber, setPageNumber] = useState(1);

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

  useEffect(() => {
    // setIsLoading(true);

    const timer = setTimeout(() => {
      if (!queryValue.trim()) {
        setFilteredRows(rows);
      } else {
        const query = queryValue.toLowerCase();

        const result = rows.filter(({ title, destination }) =>
          [title, destination].some((field) => field?.toLowerCase().includes(query))
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

  const handleQRTypeChange = useCallback(
    (value) => setQRType(value),
    [],
  )

  const handleQREndpointChange = useCallback(
    (value) => setQREndpoint(value),
    [],
  )

  const handleQRTypeRemove = () => setQRType("");

  const handleQREndpointRemove = () => setQREndpoint("");


  const handleFiltersClearAll = () => {
    handleQRTypeRemove();
    handleQREndpointRemove();
  }

  const handlePaginationNext = () => {
    setPageNumber(pageNumber + 1);
  }

  const handlePaginationPrevious = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  }

  const resourceName = {
    singular: 'order',
    plural: 'orders',
  };

  const filters = [
    {
      key: 'qrType',
      label: `QR Type`,
      filter: (
        <ChoiceList
          title="QR Type"
          titleHidden
          choices={[
            {
              label: 'Static',
              value: 'Static'
            },
            {
              label: 'Dynamic',
              value: 'Dynamic'
            }
          ]}
          selected={qrType || []}
          onChange={handleQRTypeChange}
        />
      )
    },
    {
      key: 'qrEndpoint',
      label: 'Endpoint',
      filter: (
        <ChoiceList
          title="Endpoint"
          titleHidden
          choices={[
            {
              label: 'Homepage',
              value: 'Homepage',
            },
            {
              label: 'Product page',
              value: 'Product page',
            },
            {
              label: 'Add to cart',
              value: 'Add to cart',
            },
            {
              label: 'Custom URL',
              value: 'Custom URL',
            },
            {
              label: 'Text',
              value: 'Text',
            },
            {
              label: 'Wi-Fi',
              value: 'Wi-Fi',
            }
          ]}
          selected={qrEndpoint || []}
          onChange={handleQREndpointChange}
        />
      )
    }
  ]

  const appliedFilters = [];

  let filteredResults = filteredRows.filter(
    ({ type, endpoint }) =>
      type == qrType && endpoint == qrEndpoint
  );

  if (!qrType && !qrEndpoint) {
    filteredResults = filteredRows;
  } else if (qrType && !qrEndpoint) {
    filteredResults = filteredRows.filter(
      ({ type }) =>
        type == qrType
    );
  } else if (!qrType && qrEndpoint) {
    filteredResults = filteredRows.filter(
      ({ endpoint }) =>
        endpoint == qrEndpoint
    );
  }

  if (qrType) {
    appliedFilters.push({
      key: 'qrType',
      label: `${qrType}`,
      onRemove: handleQRTypeRemove
    });
  }

  if (qrEndpoint) {
    appliedFilters.push({
      key: 'qrEndpoint',
      label: `${qrEndpoint}`,
      onRemove: handleQREndpointRemove
    });
  }

  const row = filteredResults
    .map(
      ({ id, title, destination, endpoint, type, createdAt }) => {
        const date = new Date(createdAt);
        const formattedDate = dateTimeFormat(date, settings);

        return (
          <IndexTable.Row
            id={id}
            key={id}
          >
            <IndexTable.Cell>
              <Text>
                <Link
                  url={type == "Static" ? `/app/static/${id}` : `/app/dynamic/${id}`}
                  key={id}
                >
                  {title.length <= 28 ? title : `${title.slice(0, 27)}...`}
                </Link>
              </Text>
            </IndexTable.Cell>
            <IndexTable.Cell><Badge>{endpoint}</Badge></IndexTable.Cell>
            <IndexTable.Cell><Badge tone="info">{type}</Badge></IndexTable.Cell>
            <IndexTable.Cell>{formattedDate}</IndexTable.Cell>
          </IndexTable.Row>
        )
      }
    );

  return (
    <Page
      title="QR Codes List"
      subtitle="QR codes you created will be shown up here."
      backAction={{ content: 'Generator', url: '../' }}
    >
      <TitleBar title="Your QR codes" />
      <Card>
        <BlockStack gap="200">
          <Filters
            queryValue={queryValue}
            queryPlaceholder="Search a QR code(s) by name or its content"
            filters={filters}
            appliedFilters={appliedFilters}
            onQueryChange={handleFiltersQueryChange}
            onClearAll={handleFiltersClearAll}
            loading={isLoading}
          />
          {pageLoading ?
            <Loading />
            :
            (row.length !== 0 ?
              <IndexTable
                resourceName={resourceName}
                itemCount={row.length}
                headings={[
                  { title: 'Name' },
                  { title: 'Endpoint' },
                  { title: 'Type' },
                  { title: 'Last modified' },
                ]}
                selectable={false}
                pagination={{
                  hasNext: pageNumber <= Math.floor(row.length / 25),
                  hasPrevious: pageNumber > 1,
                  onNext: handlePaginationNext,
                  onPrevious: handlePaginationPrevious,
                  label: pageNumber,
                }}
              >
                {row.slice((pageNumber - 1) * 25, pageNumber * 25)}
              </IndexTable>
              :
              <BlockStack inlineAlign="center" gap="200">
                <Text fontWeight="headingLg" as="h5">
                  There's nothing here...
                </Text>
                <Text fontWeight="bodyLg" as="p">
                  Maybe you could try to create some QR codes first?
                </Text>
              </BlockStack>
            )
          }
        </BlockStack>
      </Card>
      <Footer />
    </Page>
  );
}
