/**
 * Product Catalog & SKU Domain Types for Agribid Shudh
 * Matches backend Go models in internal/catalog/ and API_Documentation.md
 */

import type { PaginationMeta } from "@/types/partner";

export type ProductStatus = "active" | "inactive" | "discontinued";

export type UnitOfMeasure =
  | "BAG"
  | "SACK"
  | "PACK"
  | "TIN"
  | "QUINTAL"
  | "MT"
  | "KG"
  | "LITER";

export interface Category {
  id: string;
  parent_id?: string;
  name: string;
  slug: string;
  path?: string;
  level?: number;
  created_at?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category_id?: string;
  category_name?: string;
  brand?: string;
  manufacturer_id?: string;
  manufacturer_name?: string;
  hsn_code: string;
  uom?: UnitOfMeasure | string;
  weight_grams?: number;
  mrp?: number;
  status: ProductStatus;
  created_at?: string;
  updated_at?: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  sort_order: number;
  is_primary: boolean;
}

export interface CreateProductRequest {
  sku: string;
  name: string;
  description?: string;
  category_id?: string;
  brand?: string;
  hsn_code: string;
  uom?: string;
  weight_grams?: number;
  mrp?: number;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  category_id?: string;
  brand?: string;
  hsn_code?: string;
  uom?: string;
  weight_grams?: number;
  mrp?: number;
}

export interface SetProductStatusRequest {
  status: ProductStatus;
}

export interface CreateCategoryRequest {
  parent_id?: string;
  name: string;
}

export interface ProductFilterParams {
  category_id?: string;
  brand?: string;
  status?: string;
  search?: string;
  manufacturer_id?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedProductsResponse {
  success: boolean;
  data: Product[];
  meta: PaginationMeta;
}