// Timer Types for Edge Timer App

export type TimerType =
  | "product-page"
  | "top-bottom-bar"
  | "landing-page"
  | "cart-page";

export type TimerTypeValue = "countdown" | "fixed";

export type TimerStarts = "now" | "later";

export type OnExpiryAction = "unpublish" | "keep" | "hide";

export type CallToActionType = "no" | "button" | "clickable";

export type ProductSelectionType =
  | "all"
  | "specific"
  | "collections"
  | "tags"
  | "custom";

export type PageSelectionType =
  | "every-page"
  | "home-page"
  | "all-product-pages"
  | "specific-product-pages"
  | "all-collection-pages"
  | "specific-collection-pages"
  | "specific-collections"
  | "cart-page"
  | "specific-pages"
  | "custom";

export type GeolocationTargeting = "all-world" | "specific-countries";

export type BackgroundType = "single" | "gradient";

export type PositioningType = "top" | "bottom" | "inside-top" | "inside-bottom";

// Color structure used by Shopify Polaris ColorPicker
export interface ColorHSBA {
  hue: number;
  saturation: number;
  brightness: number;
  alpha: number;
}

// Design Configuration
export interface DesignConfig {
  // Positioning (for top-bottom-bar)
  positioning?: PositioningType;

  // Background
  backgroundType?: BackgroundType;
  backgroundColor?: string; // Hex color
  gradientStartColor?: string;
  gradientEndColor?: string;

  // Border
  borderRadius?: number;
  borderSize?: number;
  borderColor?: string;

  // Spacing
  paddingTop?: number;
  paddingBottom?: number;
  marginTop?: number;
  marginBottom?: number;

  // Typography - Title
  titleSize?: number;
  titleColor?: string;
  titleFontWeight?: string;
  titleFontFamily?: string;

  // Typography - Subheading
  subheadingSize?: number;
  subheadingColor?: string;
  subheadingFontWeight?: string;
  subheadingFontFamily?: string;

  // Typography - Timer
  timerSize?: number;
  timerColor?: string;
  timerFontWeight?: string;
  timerFontFamily?: string;

  // Typography - Legend (Days, Hrs, Mins, Secs)
  legendSize?: number;
  legendColor?: string;
  legendFontWeight?: string;
  legendFontFamily?: string;

  // Button (for CTA)
  buttonFontSize?: number;
  buttonCornerRadius?: number;
  buttonColor?: string;
  buttonBackgroundColor?: string;
  buttonBorderColor?: string;
  buttonBorderSize?: number;
}

// Placement Configuration
export interface PlacementConfig {
  // Product Selection
  productSelection?: ProductSelectionType;
  selectedProducts?: string[]; // Product IDs
  selectedCollections?: string[]; // Collection IDs
  excludedProducts?: string[]; // Product IDs to exclude
  productTags?: string[]; // Product tags

  // Page Selection (for top-bottom-bar)
  pageSelection?: PageSelectionType;
  specificPages?: string[]; // URLs
  excludedPages?: string[]; // URLs to exclude

  // Geolocation
  geolocation?: GeolocationTargeting;
  countries?: string[]; // Country codes (ISO)
}

// Recurring Timer Configuration
export interface RecurringConfig {
  frequency: "daily" | "weekly" | "monthly";
  interval?: number; // e.g., every 2 days, every 3 weeks
  daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
  dayOfMonth?: number; // 1-31
  endRecurrence?: Date | null;
}

// Timer Labels
export interface TimerLabels {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

// Complete Timer Data for Creating/Updating
export interface TimerFormData {
  // Basic Info
  name: string;
  type: TimerType;

  // Content
  title: string;
  subheading?: string;

  // Timer Settings
  timerType: TimerTypeValue;
  endDate?: Date | string | null;
  fixedMinutes?: number | null;
  isRecurring?: boolean;
  recurringConfig?: RecurringConfig | null;

  // Labels
  daysLabel?: string;
  hoursLabel?: string;
  minutesLabel?: string;
  secondsLabel?: string;

  // Scheduling
  startsAt?: Date | string | null;
  onExpiry?: OnExpiryAction;

  // Call to Action (for top-bottom-bar)
  ctaType?: CallToActionType | null;
  buttonText?: string | null;
  buttonLink?: string | null;

  // Design & Placement
  designConfig?: DesignConfig;
  placementConfig?: PlacementConfig;

  // Product/Page Selection (flattened for convenience)
  productSelection?: ProductSelectionType;
  selectedProducts?: string[] | null;
  selectedCollections?: string[] | null;
  excludedProducts?: string[] | null;
  productTags?: string[] | null;

  pageSelection?: PageSelectionType | null;
  excludedPages?: string[] | null;

  // Geolocation
  geolocation?: GeolocationTargeting;
  countries?: string[] | null;

  // Status
  isPublished?: boolean;
}

// Timer Response from Database
export interface Timer {
  id: string;
  shop: string;
  name: string;
  type: string;

  // Content
  title: string;
  subheading: string | null;

  // Timer Settings
  endDate: Date | null;
  isRecurring: boolean;
  recurringConfig: RecurringConfig | null;

  // Timer Labels
  daysLabel: string;
  hoursLabel: string;
  minutesLabel: string;
  secondsLabel: string;

  // Timer Type Settings
  timerType: string;
  fixedMinutes: number | null;

  // Scheduling
  startsAt: Date | null;
  onExpiry: string;

  // Call to Action
  ctaType: string | null;
  buttonText: string | null;
  buttonLink: string | null;

  // Design Settings
  designConfig: DesignConfig;

  // Placement Settings
  placementConfig: PlacementConfig;

  // Product/Collection Selection
  productSelection: string;
  selectedProducts: string[] | null;
  selectedCollections: string[] | null;
  excludedProducts: string[] | null;
  productTags: string[] | null;

  // Page Selection
  pageSelection: string | null;
  excludedPages: string[] | null;

  // Geolocation
  geolocation: string;
  countries: string[] | null;

  // Status
  isPublished: boolean;
  isActive: boolean;

  // Stats
  viewCount: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface TimerListResponse {
  timers: Timer[];
}

export interface TimerResponse {
  timer: Timer;
}

export interface TimerErrorResponse {
  error: string;
}

// Form State for Components
export interface ContentTabState {
  timerName: string;
  title: string;
  subheading: string;
  timerTypeValue: TimerTypeValue;
  timerStarts: TimerStarts;
  endDate: Date;
  hour: string;
  minute: string;
  period: "AM" | "PM";
  fixedMinutes?: number;
  daysLabel: string;
  hoursLabel: string;
  minutesLabel: string;
  secondsLabel: string;
  onceItEnds: OnExpiryAction;

  // CTA (for top-bottom-bar)
  callToAction?: CallToActionType;
  buttonText?: string;
  buttonLink?: string;
}

export interface DesignTabState {
  // Positioning
  positioning: PositioningType;

  // Background
  backgroundType: BackgroundType;
  backgroundColor: ColorHSBA;

  // Border
  borderRadius: string;
  borderSize: string;
  borderColor: ColorHSBA;

  // Spacing
  insideTop: string;
  insideBottom: string;
  outsideTop: string;
  outsideBottom: string;

  // Typography
  titleSize: string;
  titleColor: ColorHSBA;
  subheadingSize: string;
  subheadingColor: ColorHSBA;
  timerSize: string;
  timerColor: ColorHSBA;
  legendSize: string;
  legendColor: ColorHSBA;

  // Button
  buttonFontSize: string;
  cornerRadius: string;
  buttonColor: ColorHSBA;
}

export interface PlacementTabState {
  productSelection: ProductSelectionType;
  selectedProducts: string[];
  selectedCollections: string[];
  excludedProducts: string[];
  productTags: string[];

  pageSelection: PageSelectionType;
  specificPages: string[];
  excludedPages: string[];

  geolocation: GeolocationTargeting;
  countries: string[];
}

// Helper type for converting ColorHSBA to hex
export type HexColor = string;

// Utility type for API request body
export interface CreateTimerRequest {
  timer: TimerFormData;
}

export interface UpdateTimerRequest {
  timer: Partial<TimerFormData>;
}

export interface TogglePublishRequest {
  isPublished: boolean;
}
