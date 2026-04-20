import { useState, useRef } from "react";
import {
  BlockStack,
  Text,
  Box,
  RadioButton,
  Link,
  Card,
  Button,
  InlineStack,
  Tag,
  Divider,
} from "@shopify/polaris";
import { ProductPicker, CollectionPicker } from "../ui";
import type {
  ProductSelectionType,
  PageSelectionType,
  GeolocationTargeting,
} from "../../types/timer";

interface PlacementTabProps {
  timerType: "product" | "top-bottom-bar";
  timerId?: string;
  shop?: string;
  // Placement state owned by TimerForm
  productSelection: ProductSelectionType;
  onProductSelectionChange: (value: string) => void;
  pageSelection: PageSelectionType;
  onPageSelectionChange: (value: string) => void;
  geolocation: GeolocationTargeting;
  onGeolocationChange: (value: string) => void;
  // Array setters — IDs go to the parent for submission
  setSelectedProducts: (ids: string[]) => void;
  setSelectedCollections: (ids: string[]) => void;
  setExcludedProducts: (ids: string[]) => void;
  setExcludedPages: (ids: string[]) => void;
}

// Shopify GraphQL IDs look like "gid://shopify/Product/1234567890".
// Liquid's {{ product.id }} and the storefront script send only the numeric part.
const extractShopifyId = (gid: string): string => gid.split("/").pop() ?? gid;

export default function PlacementTab({
  timerType,
  timerId,
  shop,
  productSelection,
  onProductSelectionChange,
  pageSelection,
  onPageSelectionChange,
  geolocation,
  onGeolocationChange,
  setSelectedProducts,
  setSelectedCollections,
  setExcludedProducts,
  setExcludedPages,
}: PlacementTabProps) {
  const [copied, setCopied] = useState(false);
  const copyDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopyTimerId = () => {
    if (!timerId || copied) return;
    if (copyDebounceRef.current) clearTimeout(copyDebounceRef.current);
    navigator.clipboard.writeText(timerId).then(() => {
      setCopied(true);
      shopify.toast.show("Copied to clipboard", { duration: 2000 });
      copyDebounceRef.current = setTimeout(() => setCopied(false), 2000);
    });
  };

  // Modal open states
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [showCollectionPicker, setShowCollectionPicker] = useState(false);
  const [showExcludeProductPicker, setShowExcludeProductPicker] =
    useState(false);
  const [showExcludePagePicker, setShowExcludePagePicker] = useState(false);

  // Display data — full objects needed to render Tag labels
  const [productData, setProductData] = useState<any[]>([]);
  const [collectionData, setCollectionData] = useState<any[]>([]);
  const [excludedProductData, setExcludedProductData] = useState<any[]>([]);
  const [excludedPageData, setExcludedPageData] = useState<any[]>([]);

  // Product selection — store numeric IDs (strips GID prefix)
  const handleProductSelect = (products: any[]) => {
    setProductData(products);
    setSelectedProducts(products.map((p) => extractShopifyId(p.id)));
  };
  const removeProduct = (id: string) => {
    const filtered = productData.filter((p) => p.id !== id);
    setProductData(filtered);
    setSelectedProducts(filtered.map((p) => extractShopifyId(p.id)));
  };

  // Collection selection — store handles because the storefront script detects
  // the active collection by parsing the handle from the page URL, not by numeric ID.
  const handleCollectionSelect = (collections: any[]) => {
    setCollectionData(collections);
    setSelectedCollections(collections.map((c) => c.handle));
  };
  const removeCollection = (id: string) => {
    const filtered = collectionData.filter((c) => c.id !== id);
    setCollectionData(filtered);
    setSelectedCollections(filtered.map((c) => c.handle));
  };

  // Excluded products — store numeric IDs
  const handleExcludedProductSelect = (products: any[]) => {
    setExcludedProductData(products);
    setExcludedProducts(products.map((p) => extractShopifyId(p.id)));
  };
  const removeExcludedProduct = (id: string) => {
    const filtered = excludedProductData.filter((p) => p.id !== id);
    setExcludedProductData(filtered);
    setExcludedProducts(filtered.map((p) => extractShopifyId(p.id)));
  };

  // Excluded pages — store numeric product IDs
  const handleExcludedPageSelect = (pages: any[]) => {
    setExcludedPageData(pages);
    setExcludedPages(pages.map((p) => extractShopifyId(p.id)));
  };
  const removeExcludedPage = (id: string) => {
    const filtered = excludedPageData.filter((p) => p.id !== id);
    setExcludedPageData(filtered);
    setExcludedPages(filtered.map((p) => extractShopifyId(p.id)));
  };

  const timerIdSection = (
    <Box>
      <Box paddingBlockEnd="400">
        <Divider />
      </Box>
      <Text as="p" variant="headingSm" fontWeight="semibold">
        Timer ID
      </Text>
      <Box paddingBlockStart="200">
        {timerId ? (
          <InlineStack gap="100" blockAlign="center">
            <Text as="p" variant="bodyMd">
              {timerId}
            </Text>
            <button
              onClick={handleCopyTimerId}
              aria-label="Copy timer ID"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "2px",
                display: "inline-flex",
                alignItems: "center",
                color: "#616161",
              }}
            >
              {copied ? (
                <s-icon type="clipboard-check" color="base" size="small" />
              ) : (
                <s-icon type="clipboard" color="base" size="small" />
              )}
            </button>
          </InlineStack>
        ) : (
          <Text as="p" variant="bodySm" tone="subdued">
            Save or Publish to show timer ID
          </Text>
        )}
        <Box paddingBlockStart="100">
          <Text as="p" variant="bodySm" tone="subdued">
            Countdown timer app block can be added, removed, repositioned, and
            customized through the theme editor using timer ID.
          </Text>
        </Box>
      </Box>
    </Box>
  );

  const geolocationSection = (
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
              onChange={() => onGeolocationChange("all-world")}
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
              onChange={() => onGeolocationChange("specific-countries")}
              disabled
            />
            <Box paddingBlockStart="100">
              <Text as="p" variant="bodySm" tone="subdued">
                Available with Standard plan.{" "}
                <Link url="#" removeUnderline>
                  Upgrade now
                </Link>
              </Text>
            </Box>
          </Box>
        </BlockStack>
      </BlockStack>
    </Card>
  );

  if (timerType === "top-bottom-bar") {
    return (
      <>
        <BlockStack gap="400">
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
                    onChange={() => onPageSelectionChange("every-page")}
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
                  onChange={() => onPageSelectionChange("home-page")}
                />

                <RadioButton
                  label="Show on all product pages"
                  checked={pageSelection === "all-product-pages"}
                  id="all-product-pages"
                  name="pageSelection"
                  onChange={() => onPageSelectionChange("all-product-pages")}
                />

                <Box>
                  <RadioButton
                    label="Show on specific product pages"
                    checked={pageSelection === "specific-product-pages"}
                    id="specific-product-pages"
                    name="pageSelection"
                    onChange={() =>
                      onPageSelectionChange("specific-product-pages")
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

                <RadioButton
                  label="Show on all collection pages"
                  checked={pageSelection === "all-collection-pages"}
                  id="all-collection-pages"
                  name="pageSelection"
                  onChange={() => onPageSelectionChange("all-collection-pages")}
                />

                <Box>
                  <RadioButton
                    label="Show on specific collection pages"
                    checked={pageSelection === "specific-collection-pages"}
                    id="specific-collection-pages"
                    name="pageSelection"
                    onChange={() =>
                      onPageSelectionChange("specific-collection-pages")
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

              {timerIdSection}
            </BlockStack>
          </Card>

          {geolocationSection}
        </BlockStack>

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
      <BlockStack gap="400">
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
                  onChange={() => onProductSelectionChange("all")}
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
                  onChange={() => onProductSelectionChange("specific")}
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
                  onChange={() => onProductSelectionChange("collections")}
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
                  onChange={() => onProductSelectionChange("tags")}
                  disabled
                />
                <Box paddingBlockStart="100">
                  <Text as="p" variant="bodySm" tone="subdued">
                    Available with Standard plan.{" "}
                    <Link url="#" removeUnderline>
                      Upgrade now
                    </Link>
                  </Text>
                </Box>
              </Box>
            </BlockStack>

            {timerIdSection}
          </BlockStack>
        </Card>

        {geolocationSection}
      </BlockStack>

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
