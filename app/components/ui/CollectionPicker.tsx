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
  Badge,
} from "@shopify/polaris";
import { SearchIcon, ImageIcon } from "@shopify/polaris-icons";

interface Collection {
  id: string;
  title: string;
  handle: string;
  description?: string;
  image?: string | null;
  imageAlt?: string;
  productsCount: number;
  isAutomatic: boolean;
}

interface CollectionPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (collections: Collection[]) => void;
  selectedCollections?: Collection[];
  allowMultiple?: boolean;
  title?: string;
}

export function CollectionPicker({
  open,
  onClose,
  onSelect,
  selectedCollections = [],
  allowMultiple = true,
  title = "Select collections",
}: CollectionPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>(
    selectedCollections.map((c) => c.id),
  );

  // Fetch collections based on search query
  const fetchCollections = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        query: query,
        limit: "20",
      });

      const response = await fetch(`/api/collections/search?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch collections");
      }

      setCollections(data.collections || []);
    } catch (err) {
      console.error("Error fetching collections:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load collections",
      );
      setCollections([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      fetchCollections(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, open, fetchCollections]);

  // Load initial collections when modal opens
  useEffect(() => {
    if (open) {
      fetchCollections("");
      setSelectedItems(selectedCollections.map((c) => c.id));
    }
  }, [open, selectedCollections, fetchCollections]);

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
    const selected = collections.filter((c) => selectedItems.includes(c.id));
    onSelect(selected);
    onClose();
  }, [collections, selectedItems, onSelect, onClose]);

  const handleCancel = useCallback(() => {
    setSelectedItems(selectedCollections.map((c) => c.id));
    setSearchQuery("");
    onClose();
  }, [selectedCollections, onClose]);

  const renderItem = (item: Collection) => {
    const { id, title, image, imageAlt, productsCount, isAutomatic } = item;

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
            <InlineStack gap="200" blockAlign="center">
              <Text as="h3" variant="bodyMd" fontWeight="semibold">
                {title}
              </Text>
              {isAutomatic && (
                <Badge tone="info" size="small">
                  Automated
                </Badge>
              )}
            </InlineStack>
            <Text as="p" variant="bodySm" tone="subdued">
              {productsCount} {productsCount === 1 ? "product" : "products"}
            </Text>
          </BlockStack>
        </InlineStack>
      </ResourceItem>
    );
  };

  const emptyState = error ? (
    <EmptyState
      heading="Error loading collections"
      image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
    >
      <Text as="p" tone="subdued">
        {error}
      </Text>
      <Box paddingBlockStart="400">
        <Button onClick={() => fetchCollections(searchQuery)}>Try again</Button>
      </Box>
    </EmptyState>
  ) : (
    <EmptyState
      heading="No collections found"
      image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
    >
      <Text as="p" tone="subdued">
        {searchQuery
          ? `No collections match "${searchQuery}"`
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
            placeholder="Search collections by title"
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
          ) : collections.length > 0 ? (
            <ResourceList
              resourceName={{ singular: "collection", plural: "collections" }}
              items={collections}
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
              {selectedItems.length === 1 ? "collection" : "collections"}{" "}
              selected
            </Text>
          )}
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
