import { useState } from "react";
import {
  BlockStack,
  Text,
  Box,
  FormLayout,
  RadioButton,
  Link,
  Card,
  Button,
  InlineStack,
  Tag,
} from "@shopify/polaris";
import { usePlacementState } from "../../hooks/usePlacementState";
import { ProductPicker, CollectionPicker } from "../ui";

interface PlacementTabProps {
  timerType: "product" | "top-bottom-bar";
  timerId?: string;
  shop?: string;
}

export default function PlacementTab({
  timerType,
  timerId,
  shop,
}: PlacementTabProps) {
  // Use custom hook for placement state management
  const {
    productSelection,
    handleProductSelectionChange,
    pageSelection,
    handlePageSelectionChange,
    geolocation,
    handleGeolocationChange,
    setSelectedProducts,
    setSelectedCollections,
  } = usePlacementState({ timerType });

  // Modal states
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [showCollectionPicker, setShowCollectionPicker] = useState(false);
  const [showExcludeProductPicker, setShowExcludeProductPicker] =
    useState(false);
  const [showExcludePagePicker, setShowExcludePagePicker] = useState(false);

  // Store product/collection data with full objects
  const [productData, setProductData] = useState<any[]>([]);
  const [collectionData, setCollectionData] = useState<any[]>([]);
  const [excludedProductData, setExcludedProductData] = useState<any[]>([]);
  const [excludedPageData, setExcludedPageData] = useState<any[]>([]);

  // Handle product selection
  const handleProductSelect = (products: any[]) => {
    setProductData(products);
    setSelectedProducts(products.map((p) => p.id));
  };

  // Handle collection selection
  const handleCollectionSelect = (collections: any[]) => {
    setCollectionData(collections);
    setSelectedCollections(collections.map((c) => c.id));
  };

  // Remove individual product
  const removeProduct = (id: string) => {
    const filtered = productData.filter((p) => p.id !== id);
    setProductData(filtered);
    setSelectedProducts(filtered.map((p) => p.id));
  };

  // Remove individual collection
  const removeCollection = (id: string) => {
    const filtered = collectionData.filter((c) => c.id !== id);
    setCollectionData(filtered);
    setSelectedCollections(filtered.map((c) => c.id));
  };

  // Handle excluded products
  const handleExcludedProductSelect = (products: any[]) => {
    setExcludedProductData(products);
  };

  const removeExcludedProduct = (id: string) => {
    const filtered = excludedProductData.filter((p) => p.id !== id);
    setExcludedProductData(filtered);
  };

  // Handle excluded pages
  const handleExcludedPageSelect = (pages: any[]) => {
    setExcludedPageData(pages);
  };

  const removeExcludedPage = (id: string) => {
    const filtered = excludedPageData.filter((p) => p.id !== id);
    setExcludedPageData(filtered);
  };

  if (timerType === "top-bottom-bar") {
    return (
      <>
        <FormLayout>
          <Card padding="400">
            <BlockStack gap="400">
              <Text as="h4" variant="headingSm" fontWeight="semibold">
                Select pages to display the bar
              </Text>

              <BlockStack gap="200">
                <Box>
                  <RadioButton
                    label="Show on every page"
                    checked={pageSelection === "every-page"}
                    id="every-page"
                    name="pageSelection"
                    onChange={() => handlePageSelectionChange("every-page")}
                    helpText={
                      <Button
                        variant="plain"
                        onClick={() => setShowExcludePagePicker(true)}
                      >
                        Exclude specific pages
                      </Button>
                    }
                  />
                  {excludedPageData.length > 0 && (
                    <Box paddingBlockStart="200" paddingInlineStart="600">
                      <Text as="p" variant="bodySm" tone="subdued">
                        Excluded pages ({excludedPageData.length}):
                      </Text>
                      <Box paddingBlockStart="100">
                        <InlineStack gap="200" wrap>
                          {excludedPageData.map((page) => (
                            <Tag
                              key={page.id}
                              onRemove={() => removeExcludedPage(page.id)}
                            >
                              {page.title}
                            </Tag>
                          ))}
                        </InlineStack>
                      </Box>
                    </Box>
                  )}
                </Box>

                <RadioButton
                  label="Show on home page only"
                  checked={pageSelection === "home-page"}
                  id="home-page"
                  name="pageSelection"
                  onChange={() => handlePageSelectionChange("home-page")}
                />

                <RadioButton
                  label="Show on all product pages"
                  checked={pageSelection === "all-product-pages"}
                  id="all-product-pages"
                  name="pageSelection"
                  onChange={() =>
                    handlePageSelectionChange("all-product-pages")
                  }
                />

                <Box>
                  <RadioButton
                    label="Show on specific product pages"
                    checked={pageSelection === "specific-product-pages"}
                    id="specific-product-pages"
                    name="pageSelection"
                    onChange={() =>
                      handlePageSelectionChange("specific-product-pages")
                    }
                  />
                  {pageSelection === "specific-product-pages" && (
                    <Box paddingBlockStart="200" paddingInlineStart="600">
                      <Button
                        onClick={() => setShowProductPicker(true)}
                        size="slim"
                      >
                        {productData.length > 0
                          ? `${productData.length} product${productData.length === 1 ? "" : "s"} selected`
                          : "Select products"}
                      </Button>
                      {productData.length > 0 && (
                        <Box paddingBlockStart="200">
                          <InlineStack gap="200" wrap>
                            {productData.map((product) => (
                              <Tag
                                key={product.id}
                                onRemove={() => removeProduct(product.id)}
                              >
                                {product.title}
                              </Tag>
                            ))}
                          </InlineStack>
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>

                <Box>
                  <RadioButton
                    label="All products in specific collections"
                    checked={pageSelection === "specific-collections"}
                    id="specific-collections"
                    name="pageSelection"
                    onChange={() =>
                      handlePageSelectionChange("specific-collections")
                    }
                  />
                  {pageSelection === "specific-collections" && (
                    <Box paddingBlockStart="200" paddingInlineStart="600">
                      <Button
                        onClick={() => setShowCollectionPicker(true)}
                        size="slim"
                      >
                        {collectionData.length > 0
                          ? `${collectionData.length} collection${collectionData.length === 1 ? "" : "s"} selected`
                          : "Select collections"}
                      </Button>
                      {collectionData.length > 0 && (
                        <Box paddingBlockStart="200">
                          <InlineStack gap="200" wrap>
                            {collectionData.map((collection) => (
                              <Tag
                                key={collection.id}
                                onRemove={() => removeCollection(collection.id)}
                              >
                                {collection.title}
                              </Tag>
                            ))}
                          </InlineStack>
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>

                <RadioButton
                  label="Show on all collection pages"
                  checked={pageSelection === "all-collection-pages"}
                  id="all-collection-pages"
                  name="pageSelection"
                  onChange={() =>
                    handlePageSelectionChange("all-collection-pages")
                  }
                />

                <Box>
                  <RadioButton
                    label="Show on specific collection pages"
                    checked={pageSelection === "specific-collection-pages"}
                    id="specific-collection-pages"
                    name="pageSelection"
                    onChange={() =>
                      handlePageSelectionChange("specific-collection-pages")
                    }
                  />
                  {pageSelection === "specific-collection-pages" && (
                    <Box paddingBlockStart="200" paddingInlineStart="600">
                      <Button
                        onClick={() => setShowCollectionPicker(true)}
                        size="slim"
                      >
                        {collectionData.length > 0
                          ? `${collectionData.length} collection${collectionData.length === 1 ? "" : "s"} selected`
                          : "Select collections"}
                      </Button>
                      {collectionData.length > 0 && (
                        <Box paddingBlockStart="200">
                          <InlineStack gap="200" wrap>
                            {collectionData.map((collection) => (
                              <Tag
                                key={collection.id}
                                onRemove={() => removeCollection(collection.id)}
                              >
                                {collection.title}
                              </Tag>
                            ))}
                          </InlineStack>
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              </BlockStack>

              <Box>
                <Text as="p" variant="headingSm" fontWeight="semibold">
                  Timer ID
                </Text>
                <Box paddingBlockStart="200">
                  {timerId ? (
                    <>
                      <Text as="p" variant="bodyMd" fontWeight="semibold">
                        {timerId}
                      </Text>
                      {shop && (
                        <Box paddingBlockStart="100">
                          <Text as="p" variant="bodySm" tone="subdued">
                            Store: {shop}
                          </Text>
                        </Box>
                      )}
                    </>
                  ) : (
                    <Text as="p" variant="bodySm" tone="subdued">
                      Save or Publish to show timer ID
                    </Text>
                  )}
                  <Box paddingBlockStart="100">
                    <Text as="p" variant="bodySm" tone="subdued">
                      Countdown timer app block can be added, removed,
                      repositioned, and customized through the theme editor
                      using timer ID.
                    </Text>
                  </Box>
                </Box>
              </Box>
            </BlockStack>
          </Card>

          <Card padding="400">
            <BlockStack gap="400">
              <Text as="h4" variant="headingSm" fontWeight="semibold">
                Geolocation targeting
              </Text>

              <BlockStack gap="200">
                <Box>
                  <RadioButton
                    label="All world"
                    checked={geolocation === "all-world"}
                    id="all-world"
                    name="geolocation"
                    onChange={() => handleGeolocationChange("all-world")}
                  />
                  <Box paddingBlockStart="100">
                    <Text as="p" variant="bodySm" tone="subdued">
                      Excluding specific countries from other timers
                    </Text>
                  </Box>
                </Box>

                <Box>
                  <RadioButton
                    label="Specific countries"
                    checked={geolocation === "specific-countries"}
                    id="specific-countries"
                    name="geolocation"
                    onChange={() =>
                      handleGeolocationChange("specific-countries")
                    }
                    disabled
                  />
                  <Box paddingBlockStart="100">
                    <Text as="p" variant="bodySm" tone="subdued">
                      Available with Essential plan.{" "}
                      <Link url="#" removeUnderline>
                        Upgrade now
                      </Link>
                    </Text>
                  </Box>
                </Box>
              </BlockStack>
            </BlockStack>
          </Card>
        </FormLayout>

        {/* Pickers */}
        <ProductPicker
          open={showProductPicker}
          onClose={() => setShowProductPicker(false)}
          onSelect={handleProductSelect}
          selectedProducts={productData}
          allowMultiple={true}
        />

        <CollectionPicker
          open={showCollectionPicker}
          onClose={() => setShowCollectionPicker(false)}
          onSelect={handleCollectionSelect}
          selectedCollections={collectionData}
          allowMultiple={true}
        />

        {/* Exclude Product Picker for pages */}
        <ProductPicker
          open={showExcludePagePicker}
          onClose={() => setShowExcludePagePicker(false)}
          onSelect={handleExcludedPageSelect}
          selectedProducts={excludedPageData}
          allowMultiple={true}
          title="Exclude specific pages"
        />
      </>
    );
  }

  // Product timer type
  return (
    <>
      <FormLayout>
        <Card padding="400">
          <BlockStack gap="400">
            <Text as="h4" variant="headingSm" fontWeight="semibold">
              Select Products
            </Text>

            <BlockStack gap="200">
              <Box>
                <RadioButton
                  label="All products"
                  checked={productSelection === "all"}
                  id="all"
                  name="productSelection"
                  onChange={() => handleProductSelectionChange("all")}
                  helpText={
                    <Button
                      variant="plain"
                      onClick={() => setShowExcludeProductPicker(true)}
                    >
                      Exclude specific products
                    </Button>
                  }
                />
                {excludedProductData.length > 0 && (
                  <Box paddingBlockStart="200" paddingInlineStart="600">
                    <Text as="p" variant="bodySm" tone="subdued">
                      Excluded products ({excludedProductData.length}):
                    </Text>
                    <Box paddingBlockStart="100">
                      <InlineStack gap="200" wrap>
                        {excludedProductData.map((product) => (
                          <Tag
                            key={product.id}
                            onRemove={() => removeExcludedProduct(product.id)}
                          >
                            {product.title}
                          </Tag>
                        ))}
                      </InlineStack>
                    </Box>
                  </Box>
                )}
              </Box>

              <Box>
                <RadioButton
                  label="Specific products"
                  checked={productSelection === "specific"}
                  id="specific"
                  name="productSelection"
                  onChange={() => handleProductSelectionChange("specific")}
                />
                {productSelection === "specific" && (
                  <Box paddingBlockStart="200" paddingInlineStart="600">
                    <Button
                      onClick={() => setShowProductPicker(true)}
                      size="slim"
                    >
                      {productData.length > 0
                        ? `${productData.length} product${productData.length === 1 ? "" : "s"} selected`
                        : "Select products"}
                    </Button>
                    {productData.length > 0 && (
                      <Box paddingBlockStart="200">
                        <InlineStack gap="200" wrap>
                          {productData.map((product) => (
                            <Tag
                              key={product.id}
                              onRemove={() => removeProduct(product.id)}
                            >
                              {product.title}
                            </Tag>
                          ))}
                        </InlineStack>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>

              <Box>
                <RadioButton
                  label="All products in specific collections"
                  checked={productSelection === "collections"}
                  id="collections"
                  name="productSelection"
                  onChange={() => handleProductSelectionChange("collections")}
                />
                {productSelection === "collections" && (
                  <Box paddingBlockStart="200" paddingInlineStart="600">
                    <Button
                      onClick={() => setShowCollectionPicker(true)}
                      size="slim"
                    >
                      {collectionData.length > 0
                        ? `${collectionData.length} collection${collectionData.length === 1 ? "" : "s"} selected`
                        : "Select collections"}
                    </Button>
                    {collectionData.length > 0 && (
                      <Box paddingBlockStart="200">
                        <InlineStack gap="200" wrap>
                          {collectionData.map((collection) => (
                            <Tag
                              key={collection.id}
                              onRemove={() => removeCollection(collection.id)}
                            >
                              {collection.title}
                            </Tag>
                          ))}
                        </InlineStack>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>

              <Box>
                <RadioButton
                  label="All products with specific tags"
                  checked={productSelection === "tags"}
                  id="tags"
                  name="productSelection"
                  onChange={() => handleProductSelectionChange("tags")}
                  disabled
                />
                <Box paddingBlockStart="100">
                  <Text as="p" variant="bodySm" tone="subdued">
                    Available with Essential plan.{" "}
                    <Link url="#" removeUnderline>
                      Upgrade now
                    </Link>
                  </Text>
                </Box>
              </Box>
            </BlockStack>

            <Box>
              <Text as="p" variant="headingSm" fontWeight="semibold">
                Timer ID
              </Text>
              <Box paddingBlockStart="200">
                {timerId ? (
                  <>
                    <Text as="p" variant="bodyMd" fontWeight="semibold">
                      {timerId}
                    </Text>
                    {shop && (
                      <Box paddingBlockStart="100">
                        <Text as="p" variant="bodySm" tone="subdued">
                          Store: {shop}
                        </Text>
                      </Box>
                    )}
                  </>
                ) : (
                  <Text as="p" variant="bodySm" tone="subdued">
                    Save or Publish to show timer ID
                  </Text>
                )}
                <Box paddingBlockStart="100">
                  <Text as="p" variant="bodySm" tone="subdued">
                    Countdown timer app block can be added, removed,
                    repositioned, and customized through the theme editor using
                    timer ID.
                  </Text>
                </Box>
              </Box>
            </Box>
          </BlockStack>
        </Card>

        <Card padding="400">
          <BlockStack gap="400">
            <Text as="h4" variant="headingSm" fontWeight="semibold">
              Geolocation targeting
            </Text>

            <BlockStack gap="200">
              <Box>
                <RadioButton
                  label="All world"
                  checked={geolocation === "all-world"}
                  id="all-world"
                  name="geolocation"
                  onChange={() => handleGeolocationChange("all-world")}
                />
                <Box paddingBlockStart="100">
                  <Text as="p" variant="bodySm" tone="subdued">
                    Excluding specific countries from other timers
                  </Text>
                </Box>
              </Box>

              <Box>
                <RadioButton
                  label="Specific countries"
                  checked={geolocation === "specific-countries"}
                  id="specific-countries"
                  name="geolocation"
                  onChange={() => handleGeolocationChange("specific-countries")}
                  disabled
                />
                <Box paddingBlockStart="100">
                  <Text as="p" variant="bodySm" tone="subdued">
                    Available with Essential plan.{" "}
                    <Link url="#" removeUnderline>
                      Upgrade now
                    </Link>
                  </Text>
                </Box>
              </Box>
            </BlockStack>
          </BlockStack>
        </Card>
      </FormLayout>

      {/* Pickers */}
      <ProductPicker
        open={showProductPicker}
        onClose={() => setShowProductPicker(false)}
        onSelect={handleProductSelect}
        selectedProducts={productData}
        allowMultiple={true}
      />

      <CollectionPicker
        open={showCollectionPicker}
        onClose={() => setShowCollectionPicker(false)}
        onSelect={handleCollectionSelect}
        selectedCollections={collectionData}
        allowMultiple={true}
      />

      {/* Exclude Product Picker */}
      <ProductPicker
        open={showExcludeProductPicker}
        onClose={() => setShowExcludeProductPicker(false)}
        onSelect={handleExcludedProductSelect}
        selectedProducts={excludedProductData}
        allowMultiple={true}
        title="Exclude specific products"
      />
    </>
  );
}
