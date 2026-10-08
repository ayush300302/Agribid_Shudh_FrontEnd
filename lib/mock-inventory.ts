/**
 * Module 10: Inventory Mock Store & Stock Movement Ledger Engine
 * Matches Dev Spec M10 and Rules IV-01..06
 */

import { MOCK_PRODUCTS } from "@/lib/mock-catalog";
import type {
  AdjustStockRequest,
  InventoryItem,
  ReorderSuggestion,
  StockInRequest,
  StockMovement,
  StockStatus,
} from "@/types/inventory";

export const MOCK_INVENTORY: InventoryItem[] = [
  {
    id: "inv-item-001",
    partner_id: "p-001",
    partner_name: "Maharashtra Agro Hub Pvt Ltd",
    partner_tier: "state_stockist",
    product_id: "prod-1",
    sku: "RICE-BAS-PRM-50KG",
    product_name: "Shudh Premium 1121 Basmati Rice",
    category_name: "Rice & Grains",
    uom: "BAG",
    on_hand: 450,
    reserved: 55,
    available: 395,
    min_level: 100,
    location_label: "Godown 1 · Aisle A · Bay 04",
    purchase_price: 3600,
    selling_price: 3800,
    stock_status: "IN_STOCK",
    is_low_stock: false,
    version: 1,
    updated_at: "2026-03-10T11:00:00Z",
  },
  {
    id: "inv-item-002",
    partner_id: "p-001",
    partner_name: "Maharashtra Agro Hub Pvt Ltd",
    partner_tier: "state_stockist",
    product_id: "prod-2",
    sku: "RICE-KLM-CLS-25KG",
    product_name: "Shudh Kolam Rice Classic",
    category_name: "Rice & Grains",
    uom: "BAG",
    on_hand: 320,
    reserved: 25,
    available: 295,
    min_level: 80,
    location_label: "Godown 1 · Aisle B · Bay 12",
    purchase_price: 1450,
    selling_price: 1550,
    stock_status: "IN_STOCK",
    is_low_stock: false,
    version: 1,
    updated_at: "2026-03-11T09:30:00Z",
  },
  {
    id: "inv-item-003",
    partner_id: "p-001",
    partner_name: "Maharashtra Agro Hub Pvt Ltd",
    partner_tier: "state_stockist",
    product_id: "prod-3",
    sku: "OIL-SNF-TIN-15L",
    product_name: "Shudh Refined Sunflower Oil 15L Tin",
    category_name: "Edible Oils",
    uom: "TIN",
    on_hand: 280,
    reserved: 50,
    available: 230,
    min_level: 50,
    location_label: "Godown 2 · Oil Staging Bay 01",
    purchase_price: 1720,
    selling_price: 1840,
    stock_status: "IN_STOCK",
    is_low_stock: false,
    version: 1,
    updated_at: "2026-03-12T14:00:00Z",
  },
  {
    id: "inv-item-004",
    partner_id: "p-001",
    partner_name: "Maharashtra Agro Hub Pvt Ltd",
    partner_tier: "state_stockist",
    product_id: "prod-4",
    sku: "DAL-TOR-UNP-30KG",
    product_name: "Shudh Unpolished Toor Dal",
    category_name: "Pulses & Dals",
    uom: "BAG",
    on_hand: 18,
    reserved: 10,
    available: 8,
    min_level: 30, // Min level is 30, available is 8 => LOW STOCK!
    location_label: "Godown 3 · Pulse Packing Zone",
    purchase_price: 2950,
    selling_price: 3150,
    stock_status: "LOW_STOCK",
    is_low_stock: true,
    version: 1,
    updated_at: "2026-03-12T16:20:00Z",
  },
  {
    id: "inv-item-005",
    partner_id: "p-001",
    partner_name: "Maharashtra Agro Hub Pvt Ltd",
    partner_tier: "state_stockist",
    product_id: "prod-5",
    sku: "FLR-WHT-SHR-50KG",
    product_name: "Shudh Sharbati Atta Premium",
    category_name: "Flour & Atta",
    uom: "BAG",
    on_hand: 5,
    reserved: 5,
    available: 0, // Available 0 => OUT OF STOCK!
    min_level: 25,
    location_label: "Godown 2 · Heavy Grain Silo 02",
    purchase_price: 1950,
    selling_price: 2100,
    stock_status: "OUT_OF_STOCK",
    is_low_stock: true,
    version: 1,
    updated_at: "2026-03-12T17:00:00Z",
  },
];

export const MOCK_STOCK_MOVEMENTS: StockMovement[] = [
  {
    id: "mov-001",
    partner_id: "p-001",
    partner_name: "Maharashtra Agro Hub Pvt Ltd",
    product_id: "prod-1",
    sku: "RICE-BAS-PRM-50KG",
    product_name: "Shudh Premium 1121 Basmati Rice",
    type: "OPENING",
    qty: 500,
    on_hand_after: 500,
    reserved_after: 0,
    ref_type: "MANUAL",
    reason: "Fiscal opening inventory count verified at MIDC warehouse",
    performed_by: "Warehouse Manager",
    created_at: "2026-03-01T08:00:00Z",
  },
  {
    id: "mov-002",
    partner_id: "p-001",
    partner_name: "Maharashtra Agro Hub Pvt Ltd",
    product_id: "prod-1",
    sku: "RICE-BAS-PRM-50KG",
    product_name: "Shudh Premium 1121 Basmati Rice",
    type: "SALE_RESERVE",
    qty: -55,
    on_hand_after: 500,
    reserved_after: 55,
    ref_type: "ORDER",
    ref_id: "ORD-2609-000101",
    reason: "Stock reserved on order acceptance for Kisan Seva Krishi Kendra",
    performed_by: "Order Processing System",
    created_at: "2026-03-10T10:30:00Z",
  },
  {
    id: "mov-003",
    partner_id: "p-001",
    partner_name: "Maharashtra Agro Hub Pvt Ltd",
    product_id: "prod-1",
    sku: "RICE-BAS-PRM-50KG",
    product_name: "Shudh Premium 1121 Basmati Rice",
    type: "SALE_DISPATCH",
    qty: -50,
    on_hand_after: 450,
    reserved_after: 5,
    ref_type: "SHIPMENT",
    ref_id: "SHP-MH-2609-0081",
    reason: "Goods physically loaded and dispatched onto truck MH-12-RN-4421",
    performed_by: "Logistics Gate Supervisor",
    created_at: "2026-03-11T14:00:00Z",
  },
  {
    id: "mov-004",
    partner_id: "p-001",
    partner_name: "Maharashtra Agro Hub Pvt Ltd",
    product_id: "prod-4",
    sku: "DAL-TOR-UNP-30KG",
    product_name: "Shudh Unpolished Toor Dal",
    type: "ADJUST_DAMAGE",
    qty: -2,
    on_hand_after: 18,
    reserved_after: 10,
    ref_type: "ADJUSTMENT",
    reason: "Torn bag spillage during fork-lift transit in Bay 3",
    performed_by: "Godown Inspector",
    created_at: "2026-03-12T16:15:00Z",
  },
];

function updateItemStatus(item: InventoryItem) {
  item.available = Math.max(0, item.on_hand - item.reserved);
  if (item.available === 0) {
    item.stock_status = "OUT_OF_STOCK";
    item.is_low_stock = true;
  } else if (item.available <= item.min_level) {
    item.stock_status = "LOW_STOCK";
    item.is_low_stock = true;
  } else {
    item.stock_status = "IN_STOCK";
    item.is_low_stock = false;
  }
  item.version++;
  item.updated_at = new Date().toISOString();
}

export function listInventoryMock(params?: {
  category?: string;
  lowOnly?: boolean;
  search?: string;
}): InventoryItem[] {
  return MOCK_INVENTORY.filter((item) => {
    if (params?.category && params.category !== "all") {
      const matchCat =
        item.category_name.toLowerCase() === params.category.toLowerCase();
      if (!matchCat) return false;
    }
    if (params?.lowOnly && !item.is_low_stock) {
      return false;
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      const matchSku = item.sku.toLowerCase().includes(q);
      const matchName = item.product_name.toLowerCase().includes(q);
      const matchLoc = item.location_label.toLowerCase().includes(q);
      return matchSku || matchName || matchLoc;
    }
    return true;
  });
}

export function stockInMock(req: StockInRequest): InventoryItem {
  let item = MOCK_INVENTORY.find((i) => i.product_id === req.product_id);
  const product = MOCK_PRODUCTS.find((p) => p.id === req.product_id) || MOCK_PRODUCTS[0];

  if (!item) {
    item = {
      id: `inv-item-${Date.now()}`,
      partner_id: req.partner_id || "p-001",
      partner_name: "Maharashtra Agro Hub Pvt Ltd",
      partner_tier: "state_stockist",
      product_id: product.id,
      sku: product.sku,
      product_name: product.name,
      category_name: product.category_name || "General Commodities",
      uom: product.uom || "BAG",
      on_hand: req.quantity,
      reserved: 0,
      available: req.quantity,
      min_level: req.min_level || 30,
      location_label: req.location_label || "Godown 1 · Inbound Bay",
      purchase_price: req.unit_cost,
      selling_price: req.unit_cost * 1.08,
      stock_status: "IN_STOCK",
      is_low_stock: false,
      version: 1,
      updated_at: new Date().toISOString(),
    };
    MOCK_INVENTORY.push(item);
  } else {
    // Weighted average purchase cost calculation
    const totalPreviousValue = item.on_hand * item.purchase_price;
    const newAdditionValue = req.quantity * req.unit_cost;
    const newTotalQty = item.on_hand + req.quantity;
    const weightedAvgCost =
      newTotalQty > 0
        ? Math.round(((totalPreviousValue + newAdditionValue) / newTotalQty) * 100) / 100
        : req.unit_cost;

    item.on_hand += req.quantity;
    item.purchase_price = weightedAvgCost;
    if (req.location_label) item.location_label = req.location_label;
    if (req.min_level) item.min_level = req.min_level;
  }

  updateItemStatus(item);

  // Append movement ledger
  MOCK_STOCK_MOVEMENTS.unshift({
    id: `mov-${Date.now()}`,
    partner_id: item.partner_id,
    partner_name: item.partner_name,
    product_id: item.product_id,
    sku: item.sku,
    product_name: item.product_name,
    type: "GRN",
    qty: req.quantity,
    on_hand_after: item.on_hand,
    reserved_after: item.reserved,
    ref_type: "GRN",
    ref_id: `GRN-${Date.now().toString().slice(-6)}`,
    reason: req.notes || "Inbound supplier delivery receipt (GRN)",
    performed_by: "Godown Inward Officer",
    created_at: new Date().toISOString(),
  });

  return item;
}

export function adjustStockMock(
  productIdOrSku: string,
  req: AdjustStockRequest,
): InventoryItem {
  const item = MOCK_INVENTORY.find(
    (i) => i.product_id === productIdOrSku || i.sku === productIdOrSku,
  );
  if (!item) {
    throw new Error(`Inventory item '${productIdOrSku}' not found`);
  }

  // Rule IV-04: On hand can never go negative!
  if (item.on_hand + req.quantity_change < 0) {
    throw new Error(
      `Stock conflict: On-hand stock cannot go negative. Current on-hand is ${item.on_hand}, cannot adjust by ${req.quantity_change} (Rule IV-04)`,
    );
  }

  item.on_hand += req.quantity_change;
  updateItemStatus(item);

  // Append movement ledger
  MOCK_STOCK_MOVEMENTS.unshift({
    id: `mov-${Date.now()}`,
    partner_id: item.partner_id,
    partner_name: item.partner_name,
    product_id: item.product_id,
    sku: item.sku,
    product_name: item.product_name,
    type: req.type,
    qty: req.quantity_change,
    on_hand_after: item.on_hand,
    reserved_after: item.reserved,
    ref_type: "ADJUSTMENT",
    ref_id: `ADJ-${Date.now().toString().slice(-6)}`,
    reason: req.reason,
    performed_by: "Inventory Controller",
    created_at: new Date().toISOString(),
  });

  return item;
}

export function listMovementsMock(productIdOrSku?: string): StockMovement[] {
  if (productIdOrSku) {
    return MOCK_STOCK_MOVEMENTS.filter(
      (m) => m.product_id === productIdOrSku || m.sku === productIdOrSku,
    );
  }
  return MOCK_STOCK_MOVEMENTS;
}

export function getReorderSuggestionsMock(): ReorderSuggestion[] {
  // SKUs with available <= min_level
  const lowItems = MOCK_INVENTORY.filter((i) => i.is_low_stock);

  return lowItems.map((item) => {
    // Rule IV-05: suggested reorder = max(min_level * 2 - available, 20)
    const suggestedQty = Math.max(item.min_level * 2 - item.available, 20);
    return {
      product_id: item.product_id,
      sku: item.sku,
      product_name: item.product_name,
      uom: item.uom,
      available: item.available,
      min_level: item.min_level,
      suggested_reorder_qty: suggestedQty,
      unit_price: item.purchase_price,
      estimated_cost: suggestedQty * item.purchase_price,
      vendor_name: "Agribid Shudh Central Plant",
    };
  });
}

