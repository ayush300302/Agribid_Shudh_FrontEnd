"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Filter,
  Package,
  Plus,
  Search,
  ShieldAlert,
  Tag,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import AdminShell from "@/components/layout/AdminShell";
import { listCategories, listProducts } from "@/lib/catalog-api";
import type { Product, ProductStatus } from "@/types/catalog";

function getStatusBadge(status: ProductStatus) {
  switch (status) {
    case "active":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "inactive":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "discontinued":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

export default function ProductCatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Queries
  const categoriesQuery = useQuery({
    queryKey: ["catalog-categories"],
    queryFn: () => listCategories(),
  });

  const productsQuery = useQuery({
    queryKey: ["catalog-products", selectedCategory, selectedStatus],
    queryFn: () =>
      listProducts({
        category_id: selectedCategory,
        status: selectedStatus,
      }),
  });

  const categories = categoriesQuery.data || [];
  const products: Product[] = productsQuery.data?.products || [];

  // Filter client-side for search query
  const filteredProducts = products.filter((product) => {
    const query = searchQuery.toLowerCase();
    return (
      query === "" ||
      product.name.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query) ||
      (product.brand && product.brand.toLowerCase().includes(query)) ||
      product.hsn_code.includes(query)
    );
  });

  return (
    <RoleGuard
      allowedRoles={[
        "ADM_SUPER",
        "ADM_CATALOG",
        "ADM_SALES_OPS",
        "ADM_STATE_MGR",
      ]}
    >
      <AdminShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#1b5e20]/10 p-1.5 text-[#1b5e20]">
                  <Package size={20} />
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-[#19392a]">
                  Product Catalog & SKUs
                </h1>
              </div>
              <p className="mt-1 text-sm text-[#64766a]">
                Master directory of agricultural commodities, HSN tax classifications, packaging units, and inventory SKUs.
              </p>
            </div>

            <Link
              href="/admin/products/new"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#1b5e20] px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#154a19] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b5e20]"
            >
              <Plus size={16} />
              Add Product SKU
            </Link>
          </div>

          {/* Commodity Category Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-[#dce5dd] pb-3">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                selectedCategory === "all"
                  ? "bg-[#1b5e20] text-white shadow-xs"
                  : "bg-white text-[#64766a] border border-[#dce5dd] hover:bg-[#f1f5f1] hover:text-[#19392a]"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-[#1b5e20] text-white shadow-xs"
                    : "bg-white text-[#64766a] border border-[#dce5dd] hover:bg-[#f1f5f1] hover:text-[#19392a]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#87958b]"
              />
              <input
                type="text"
                placeholder="Search by SKU Code, Name, Brand, or HSN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-md border border-[#cbd8ce] bg-white pl-9 pr-4 text-sm text-[#19392a] outline-none transition-colors placeholder:text-[#87958b] focus:border-[#1b5e20] focus:ring-2 focus:ring-[#1b5e20]/15"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={16} className="text-[#64766a]" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-10 rounded-md border border-[#cbd8ce] bg-white px-3 text-sm text-[#19392a] outline-none focus:border-[#1b5e20]"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>
          </div>

          {/* Data Table Container */}
          <div className="overflow-hidden rounded-lg border border-[#dce5dd] bg-white shadow-xs">
            {productsQuery.isLoading ? (
              <div className="flex h-64 flex-col items-center justify-center gap-3">
                <div className="size-8 animate-spin rounded-full border-3 border-[#1b5e20] border-t-transparent" />
                <p className="text-sm text-[#64766a]">Loading catalog items...</p>
              </div>
            ) : productsQuery.isError ? (
              <div className="flex h-64 flex-col items-center justify-center gap-2 text-center p-6">
                <ShieldAlert size={32} className="text-[#842029]" />
                <p className="font-semibold text-[#842029]">Failed to load catalog</p>
                <p className="text-xs text-[#64766a]">
                  {(productsQuery.error as Error)?.message}
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center gap-2 p-6 text-center">
                <Package size={36} className="text-[#cbd8ce]" />
                <p className="text-sm font-semibold text-[#19392a]">No products found</p>
                <p className="text-xs text-[#64766a]">
                  Try adjusting your category selection or search keywords.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[#dce5dd] bg-[#f9fbf9] text-xs font-semibold uppercase tracking-wider text-[#64766a]">
                    <tr>
                      <th className="px-5 py-3.5">SKU & Product Name</th>
                      <th className="px-5 py-3.5">Category</th>
                      <th className="px-5 py-3.5">Brand</th>
                      <th className="px-5 py-3.5">Packaging / UOM</th>
                      <th className="px-5 py-3.5">Tax / HSN</th>
                      <th className="px-5 py-3.5">MRP</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e8eee9]">
                    {filteredProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="transition-colors hover:bg-[#f9fbf9]"
                      >
                        {/* SKU & Name */}
                        <td className="px-5 py-4">
                          <div>
                            <span className="font-mono text-xs font-semibold text-[#1b5e20] bg-[#e9f1e9] px-2 py-0.5 rounded">
                              {product.sku}
                            </span>
                            <p className="mt-1 font-semibold text-[#19392a]">
                              {product.name}
                            </p>
                            {product.description ? (
                              <p className="line-clamp-1 text-xs text-[#64766a]">
                                {product.description}
                              </p>
                            ) : null}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-5 py-4 text-xs font-medium text-[#31483a]">
                          <span className="inline-flex items-center gap-1">
                            <Tag size={12} className="text-[#64766a]" />
                            {product.category_name || "General Commodity"}
                          </span>
                        </td>

                        {/* Brand */}
                        <td className="px-5 py-4 text-xs font-medium text-[#19392a]">
                          {product.brand || "—"}
                        </td>

                        {/* Packaging / UOM */}
                        <td className="px-5 py-4 text-xs">
                          <span className="font-semibold text-[#31483a]">
                            {product.uom || "BAG"}
                          </span>
                          {product.weight_grams ? (
                            <span className="text-[#64766a] block">
                              {(product.weight_grams / 1000).toFixed(1)} KG
                            </span>
                          ) : null}
                        </td>

                        {/* HSN */}
                        <td className="px-5 py-4 text-xs font-mono text-[#64766a]">
                          {product.hsn_code}
                        </td>

                        {/* MRP */}
                        <td className="px-5 py-4 text-xs font-semibold text-[#19392a]">
                          {product.mrp ? `₹${product.mrp.toLocaleString("en-IN")}` : "—"}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-block rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${getStatusBadge(
                              product.status,
                            )}`}
                          >
                            {product.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="rounded-md border border-[#cbd8ce] bg-white px-2.5 py-1 text-xs font-medium text-[#19392a] shadow-xs hover:bg-[#f1f5f1] transition-colors"
                          >
                            View SKU
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </AdminShell>
    </RoleGuard>
  );
}

