/**
 * Product Catalog & SKU API Service
 * Agribid Shudh Admin Web Console
 * Connects to documented catalog endpoints in internal/catalog/handler.go
 */

import { apiRequest } from "@/lib/api-client";
import type {
  Category,
  CreateCategoryRequest,
  CreateProductRequest,
  PaginatedProductsResponse,
  Product,
  ProductFilterParams,
  ProductStatus,
  UpdateProductRequest,
} from "@/types/catalog";
import type { PaginationMeta } from "@/types/partner";

type ApiResponseWrapper<T> = T | { data: T };

function unwrapResponse<T>(payload: ApiResponseWrapper<T>): T {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    (payload as { data: T }).data !== undefined
  ) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

/**
 * Lists products with filtering by category, brand, status, search, and pagination.
 * GET /api/v1/products?category_id=...&status=...&search=...
 */
export async function listProducts(
  params: ProductFilterParams = {},
): Promise<{ products: Product[]; meta: PaginationMeta }> {
  const query = new URLSearchParams();

  if (params.category_id && params.category_id !== "all") {
    query.set("category_id", params.category_id);
  }
  if (params.brand) {
    query.set("brand", params.brand);
  }
  if (params.status && params.status !== "all") {
    query.set("status", params.status);
  }
  if (params.search) {
    query.set("search", params.search);
  }
  if (params.page) {
    query.set("page", String(params.page));
  }
  if (params.pageSize) {
    query.set("page_size", String(params.pageSize));
  }

  const queryString = query.toString();
  const path = `/api/v1/products${queryString ? `?${queryString}` : ""}`;

  const response = await apiRequest<PaginatedProductsResponse>(path);

  return {
    products: response.data || [],
    meta: response.meta || {
      page: params.page || 1,
      page_size: params.pageSize || 20,
      total: response.data ? response.data.length : 0,
    },
  };
}

/**
 * Fetches a single product SKU by ID.
 * GET /api/v1/products/{id}
 */
export async function getProductById(id: string): Promise<Product> {
  const response = await apiRequest<ApiResponseWrapper<Product>>(
    `/api/v1/products/${id}`,
  );
  return unwrapResponse(response);
}

/**
 * Creates a new product SKU in the master catalog.
 * POST /api/v1/products
 */
export async function createProduct(
  data: CreateProductRequest,
): Promise<Product> {
  const response = await apiRequest<ApiResponseWrapper<Product>>(
    "/api/v1/products",
    {
      method: "POST",
      body: data,
    },
  );
  return unwrapResponse(response);
}

/**
 * Updates an existing product SKU.
 * PUT /api/v1/products/{id}
 */
export async function updateProduct(
  id: string,
  data: UpdateProductRequest,
): Promise<Product> {
  const response = await apiRequest<ApiResponseWrapper<Product>>(
    `/api/v1/products/${id}`,
    {
      method: "PUT",
      body: data,
    },
  );
  return unwrapResponse(response);
}

/**
 * Sets product availability status (active, inactive, discontinued).
 * PATCH /api/v1/products/{id}/status
 */
export async function setProductStatus(
  id: string,
  status: ProductStatus,
): Promise<{ message: string }> {
  const response = await apiRequest<ApiResponseWrapper<{ message: string }>>(
    `/api/v1/products/${id}/status`,
    {
      method: "PATCH",
      body: { status },
    },
  );
  return unwrapResponse(response);
}

/**
 * Fetches all product commodity categories.
 * GET /api/v1/categories
 */
export async function listCategories(): Promise<Category[]> {
  const response = await apiRequest<ApiResponseWrapper<Category[]>>(
    "/api/v1/categories",
  );
  return unwrapResponse(response);
}

/**
 * Creates a new category.
 * POST /api/v1/categories
 */
export async function createCategory(
  data: CreateCategoryRequest,
): Promise<Category> {
  const response = await apiRequest<ApiResponseWrapper<Category>>(
    "/api/v1/categories",
    {
      method: "POST",
      body: data,
    },
  );
  return unwrapResponse(response);
}