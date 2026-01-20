import {
  BlockStack,
  Text,
  Box,
  FormLayout,
  RadioButton,
  Link,
  Card,
} from "@shopify/polaris";
import { useState } from "react";

interface PlacementTabProps {
  timerType: "product" | "top-bottom-bar";
}

export default function PlacementTab({ timerType }: PlacementTabProps) {
  const [productSelection, setProductSelection] = useState("all");
  const [geolocation, setGeolocation] = useState("all-world");
  const [pageSelection, setPageSelection] = useState("every-page");

  if (timerType === "top-bottom-bar") {
    return (
      <FormLayout>
        <Card padding="400">
          <BlockStack gap="400">
            <Text as="h4" variant="headingSm" fontWeight="semibold">
              Select pages to display the bar
            </Text>

            <BlockStack gap="200">
              <RadioButton
                label="Show on every page"
                checked={pageSelection === "every-page"}
                id="every-page"
                name="pageSelection"
                onChange={() => setPageSelection("every-page")}
                helpText={
                  <Link url="#" removeUnderline>
                    Exclude specific pages
                  </Link>
                }
              />

              <RadioButton
                label="Show on home page only"
                checked={pageSelection === "home-page"}
                id="home-page"
                name="pageSelection"
                onChange={() => setPageSelection("home-page")}
              />

              <RadioButton
                label="Show on all product pages"
                checked={pageSelection === "all-product-pages"}
                id="all-product-pages"
                name="pageSelection"
                onChange={() => setPageSelection("all-product-pages")}
              />

              <RadioButton
                label="Show on specific product pages"
                checked={pageSelection === "specific-product-pages"}
                id="specific-product-pages"
                name="pageSelection"
                onChange={() => setPageSelection("specific-product-pages")}
              />

              <RadioButton
                label="All products in specific collections"
                checked={pageSelection === "specific-collections"}
                id="specific-collections"
                name="pageSelection"
                onChange={() => setPageSelection("specific-collections")}
              />

              <RadioButton
                label="Show on all collection pages"
                checked={pageSelection === "all-collection-pages"}
                id="all-collection-pages"
                name="pageSelection"
                onChange={() => setPageSelection("all-collection-pages")}
              />

              <RadioButton
                label="Show on specific collection pages"
                checked={pageSelection === "specific-collection-pages"}
                id="specific-collection-pages"
                name="pageSelection"
                onChange={() => setPageSelection("specific-collection-pages")}
              />

              <Box>
                <RadioButton
                  label="Custom position"
                  checked={pageSelection === "custom"}
                  id="custom"
                  name="pageSelection"
                  onChange={() => setPageSelection("custom")}
                />
                <Box paddingBlockStart="100">
                  <Text as="p" variant="bodySm" tone="subdued">
                    Add timer anywhere using app blocks or code snippet provided
                    below.
                  </Text>
                </Box>
              </Box>
            </BlockStack>

            <Box>
              <Text as="p" variant="headingSm" fontWeight="semibold">
                Timer ID
              </Text>
              <Box paddingBlockStart="200">
                <Text as="p" variant="bodySm" tone="subdued">
                  Save or Publish to show timer ID
                </Text>
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
                  onChange={() => setGeolocation("all-world")}
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
                  onChange={() => setGeolocation("specific-countries")}
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
    );
  }

  // Product timer type
  return (
    <FormLayout>
      <Card padding="400">
        <BlockStack gap="400">
          <Text as="h4" variant="headingSm" fontWeight="semibold">
            Select Products
          </Text>

          <BlockStack gap="200">
            <RadioButton
              label="All products"
              checked={productSelection === "all"}
              id="all"
              name="productSelection"
              onChange={() => setProductSelection("all")}
              helpText={
                <Link url="#" removeUnderline>
                  Exclude specific products
                </Link>
              }
            />

            <RadioButton
              label="Specific products"
              checked={productSelection === "specific"}
              id="specific"
              name="productSelection"
              onChange={() => setProductSelection("specific")}
            />

            <RadioButton
              label="All products in specific collections"
              checked={productSelection === "collections"}
              id="collections"
              name="productSelection"
              onChange={() => setProductSelection("collections")}
            />

            <Box>
              <RadioButton
                label="All products with specific tags"
                checked={productSelection === "tags"}
                id="tags"
                name="productSelection"
                onChange={() => setProductSelection("tags")}
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

            <Box>
              <RadioButton
                label="Custom position"
                checked={productSelection === "custom"}
                id="custom"
                name="productSelection"
                onChange={() => setProductSelection("custom")}
              />
              <Box paddingBlockStart="100">
                <Text as="p" variant="bodySm" tone="subdued">
                  Add timer anywhere using app blocks or code snippet provided
                  below.
                </Text>
              </Box>
            </Box>
          </BlockStack>

          <Box>
            <Text as="p" variant="headingSm" fontWeight="semibold">
              Timer ID
            </Text>
            <Box paddingBlockStart="200">
              <Text as="p" variant="bodySm" tone="subdued">
                Save or Publish to show timer ID
              </Text>
              <Box paddingBlockStart="100">
                <Text as="p" variant="bodySm" tone="subdued">
                  Countdown timer app block can be added, removed, repositioned,
                  and customized through the theme editor using timer ID.
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
                onChange={() => setGeolocation("all-world")}
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
                onChange={() => setGeolocation("specific-countries")}
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
  );
}
