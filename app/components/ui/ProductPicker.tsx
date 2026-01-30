import { useState, useCallback, useEffect } from "react";
import {
  Modal,
  ResourceList,
  ResourceItem,
  Text,
  TextField,
  Thumbnail,
  InlineStack,
  BlockStack,
  Button,
  Spinner,
  EmptyState,
  Box,
} from "@shopify/polaris";
import { SearchIcon, ImageIcon } from "@shopify/polaris-icons";

interface Product {
  id: string;
  title: string;
  handle: string;
  description?: string;
  image?: string | null;
  imageAlt?: string;
  price: {
    min: string;
    max: string;
    currencyCode: string;
  };
  status: string;
  inventory: number;
  variantsCount: number;
}

interface ProductPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (products: Product[]) => void;
  selectedProducts?: Product[];
  allowMultiple?: boolean;
  title?: string;
}

export function ProductPicker({
  open,
  onClose,
  onSelect,
  selectedProducts = [],
  allowMultiple = true,
  title = "Select products",
}: ProductPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>(
    selectedProducts.map((p) => p.id),
  );

  // Fetch products based on search query
  const fetchProducts = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        query: query,
        limit: "20",
      });

      const response = await fetch(`/api/products/search?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch products");
      }

      setProducts(data.products || []);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err instanceof Error ? err.message : "Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      fetchProducts(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, open, fetchProducts]);

  // Load initial products when modal opens
  useEffect(() => {
    if (open) {
      fetchProducts("");
      setSelectedItems(selectedProducts.map((p) => p.id));
    }
  }, [open, selectedProducts, fetchProducts]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleSelectionChange = useCallback(
    (selectedIds: string[]) => {
      if (allowMultiple) {
        setSelectedItems(selectedIds);
      } else {
        setSelectedItems(selectedIds.slice(-1));
      }
    },
    [allowMultiple],
  );

  const handleSave = useCallback(() => {
    const selected = products.filter((p) => selectedItems.includes(p.id));
    onSelect(selected);
    onClose();
  }, [products, selectedItems, onSelect, onClose]);

  const handleCancel = useCallback(() => {
    setSelectedItems(selectedProducts.map((p) => p.id));
    setSearchQuery("");
    onClose();
  }, [selectedProducts, onClose]);

  const formatPrice = (price: Product["price"]) => {
    const min = parseFloat(price.min);
    const max = parseFloat(price.max);

    if (min === max) {
      return `${price.currencyCode} ${min.toFixed(2)}`;
    }

    return `${price.currencyCode} ${min.toFixed(2)} - ${max.toFixed(2)}`;
  };

  const renderItem = (item: Product) => {
    const { id, title, image, imageAlt, price, status, variantsCount } = item;

    const media = (
      <Thumbnail
        source={image || ImageIcon}
        alt={imageAlt || title}
        size="small"
      />
    );

    return (
      <ResourceItem
        id={id}
        media={media}
        accessibilityLabel={`Select ${title}`}
        onClick={() => {}}
      >
        <InlineStack align="space-between" blockAlign="center">
          <BlockStack gap="100">
            <Text as="h3" variant="bodyMd" fontWeight="semibold">
              {title}
            </Text>
            <InlineStack gap="200">
              <Text as="p" variant="bodySm" tone="subdued">
                {formatPrice(price)}
              </Text>
              {variantsCount > 1 && (
                <Text as="p" variant="bodySm" tone="subdued">
                  {variantsCount} variants
                </Text>
              )}
              <Text
                as="p"
                variant="bodySm"
                tone={status === "ACTIVE" ? "success" : "subdued"}
              >
                {status === "ACTIVE" ? "Active" : status}
              </Text>
            </InlineStack>
          </BlockStack>
        </InlineStack>
      </ResourceItem>
    );
  };

  const emptyState = error ? (
    <EmptyState
      heading="Error loading products"
      image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
    >
      <Text as="p" tone="subdued">
        {error}
      </Text>
      <Box paddingBlockStart="400">
        <Button onClick={() => fetchProducts(searchQuery)}>Try again</Button>
      </Box>
    </EmptyState>
  ) : (
    <EmptyState
      heading="No products found"
      image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
    >
      <Text as="p" tone="subdued">
        {searchQuery
          ? `No products match "${searchQuery}"`
          : "Try adjusting your search"}
      </Text>
    </EmptyState>
  );

  return (
    <Modal
      open={open}
      onClose={handleCancel}
      title={title}
      primaryAction={{
        content: "Select",
        onAction: handleSave,
        disabled: selectedItems.length === 0,
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: handleCancel,
        },
      ]}
    >
      <Modal.Section>
        <BlockStack gap="400">
          <TextField
            label=""
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search products by title, SKU, or tag"
            prefix={<SearchIcon />}
            autoComplete="off"
            clearButton
            onClearButtonClick={() => setSearchQuery("")}
          />

          {loading ? (
            <Box padding="800">
              <InlineStack align="center">
                <Spinner size="large" />
              </InlineStack>
            </Box>
          ) : products.length > 0 ? (
            <ResourceList
              resourceName={{ singular: "product", plural: "products" }}
              items={products}
              renderItem={renderItem}
              selectedItems={selectedItems}
              onSelectionChange={handleSelectionChange}
              selectable
              loading={loading}
            />
          ) : (
            emptyState
          )}

          {selectedItems.length > 0 && (
            <Text as="p" variant="bodySm" tone="subdued">
              {selectedItems.length}{" "}
              {selectedItems.length === 1 ? "product" : "products"} selected
            </Text>
          )}
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
