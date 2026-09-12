export interface StorageOption {
  storage: string;
  ram?: string;
  size?: string;
  chip?: string;
  originalPrice: number;
  salePrice?: number;
}

export interface ProductVariant {
  name?: string;
  color: string;
  colorCode: string;
  defaultStorage?: string;
  images?: string[];
  storageOptions?: StorageOption[];
}

export interface ProductSection {
  _id?: string;
  type: "design" | "camera" | "performance" | "battery" | string;
  title: string;
  subtitle?: string;
  content: Record<string, unknown>;
  media?: { type: string; url: string; alt?: string; sortOrder?: number }[];
  sortOrder: number;
  isActive: boolean;
}

export interface Product {
  _id: string;
  name: string;
  brief?: string;
  originalPrice: number;
  salePrice?: number;
  price: number;
  discountPercent: number;
  description?: string;
  image?: string;
  images?: string[];
  color?: string;
  storage?: string;
  network?: string;
  screenSize?: string;
  purchasable?: boolean;
  variants?: ProductVariant[];
  specGroups?: { group: string; items: { key: string; value: string }[] }[];
  specs?: {
    screen?: string;
    processor?: string;
    ram?: string;
    storage?: string;
    rearCamera?: string;
    frontCamera?: string;
    battery?: string;
    batteryLife?: string;
    charging?: string;
    os?: string;
    extras?: string;
  };
  sections?: ProductSection[];
  freeDelivery: boolean;
  deliveryTime: string;
  warrantyYears: number;
  installment?: {
    available: boolean;
    downPayment?: number;
    months?: number;
    note?: string;
    conditions?: string[];
    policy?: string;
  };
  taxIncluded: boolean;
  category?: string;
  subCategory?: string;
  brand?: string;
  inStock: boolean;
}
