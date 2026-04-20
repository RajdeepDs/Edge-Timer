import { useState, useCallback } from "react";
import type { ProductSelectionType, GeolocationTargeting, PageSelectionType } from "../types/timer";

interface UsePlacementStateProps {
  timerType: "product" | "top-bottom-bar";
  initialProductSelection?: ProductSelectionType;
  initialPageSelection?: PageSelectionType;
  initialGeolocation?: GeolocationTargeting;
  initialSelectedProducts?: string[];
  initialSelectedCollections?: string[];
  initialExcludedProducts?: string[];
  initialExcludedPages?: string[];
}

export function usePlacementState({
  timerType,
  initialProductSelection = "all",
  initialPageSelection = "every-page",
  initialGeolocation = "all-world",
  initialSelectedProducts = [],
  initialSelectedCollections = [],
  initialExcludedProducts = [],
  initialExcludedPages = [],
}: UsePlacementStateProps) {
  // Product selection state (for product timers)
  const [productSelection, setProductSelection] = useState<ProductSelectionType>(
    initialProductSelection
  );

  // Page selection state (for top-bottom-bar timers)
  const [pageSelection, setPageSelection] = useState<PageSelectionType>(
    initialPageSelection
  );

  // Geolocation state (common for both types)
  const [geolocation, setGeolocation] = useState<GeolocationTargeting>(
    initialGeolocation
  );

  // Selected product IDs (when productSelection is "specific")
  const [selectedProducts, setSelectedProducts] = useState<string[]>(initialSelectedProducts);

  // Selected collection IDs (when productSelection is "collections")
  const [selectedCollections, setSelectedCollections] = useState<string[]>(initialSelectedCollections);

  // Excluded product IDs (when excluding specific products)
  const [excludedProducts, setExcludedProducts] = useState<string[]>(initialExcludedProducts);

  // Product tags (when productSelection is "tags")
  const [productTags, setProductTags] = useState<string[]>([]);

  // Specific pages (when pageSelection is "specific-pages")
  const [specificPages, setSpecificPages] = useState<string[]>([]);

  // Excluded pages (when excluding specific pages)
  const [excludedPages, setExcludedPages] = useState<string[]>(initialExcludedPages);

  // Selected countries (when geolocation is "specific-countries")
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  // Handle product selection change
  const handleProductSelectionChange = useCallback((value: string) => {
    setProductSelection(value as ProductSelectionType);
  }, []);

  // Handle page selection change
  const handlePageSelectionChange = useCallback((value: string) => {
    setPageSelection(value as PageSelectionType);
  }, []);

  // Handle geolocation change
  const handleGeolocationChange = useCallback((value: string) => {
    setGeolocation(value as GeolocationTargeting);
  }, []);

  // Reset to defaults
  const resetPlacementState = useCallback(() => {
    setProductSelection("all");
    setPageSelection("every-page");
    setGeolocation("all-world");
    setSelectedProducts([]);
    setSelectedCollections([]);
    setExcludedProducts([]);
    setProductTags([]);
    setSpecificPages([]);
    setExcludedPages([]);
    setSelectedCountries([]);
  }, []);

  // Get placement config object for submission
  const getPlacementConfig = useCallback(() => {
    return {
      productSelection,
      selectedProducts: selectedProducts.length > 0 ? selectedProducts : null,
      selectedCollections: selectedCollections.length > 0 ? selectedCollections : null,
      excludedProducts: excludedProducts.length > 0 ? excludedProducts : null,
      productTags: productTags.length > 0 ? productTags : null,
      pageSelection,
      specificPages: specificPages.length > 0 ? specificPages : null,
      excludedPages: excludedPages.length > 0 ? excludedPages : null,
      geolocation,
      countries: selectedCountries.length > 0 ? selectedCountries : null,
    };
  }, [
    productSelection,
    selectedProducts,
    selectedCollections,
    excludedProducts,
    productTags,
    pageSelection,
    specificPages,
    excludedPages,
    geolocation,
    selectedCountries,
  ]);

  return {
    // Product selection
    productSelection,
    setProductSelection,
    handleProductSelectionChange,

    // Page selection
    pageSelection,
    setPageSelection,
    handlePageSelectionChange,

    // Geolocation
    geolocation,
    setGeolocation,
    handleGeolocationChange,

    // Product details
    selectedProducts,
    setSelectedProducts,
    selectedCollections,
    setSelectedCollections,
    excludedProducts,
    setExcludedProducts,
    productTags,
    setProductTags,

    // Page details
    specificPages,
    setSpecificPages,
    excludedPages,
    setExcludedPages,

    // Country details
    selectedCountries,
    setSelectedCountries,

    // Utility methods
    resetPlacementState,
    getPlacementConfig,
  };
}
