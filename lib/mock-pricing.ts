import type {
  AppliedScheme,
  PriceList,
  PriceListItem,
  PriceQuoteRequest,
  PriceQuoteResult,
  Scheme,
} from "@/types/pricing";

export const MOCK_PRICE_LISTS: PriceList[] = [
  {
    id: "pl-001",
    state_code: "27",
    state_name: "Maharashtra",
    tier: "distributor",
    version: 1,
    effective_from: "2026-01-01T00:00:00Z",
    effective_to: "2026-12-31T23:59:59Z",
    status: "published",
    approved_by: "Finance Controller (USR-FIN-01)",
    created_by: "State Ops Manager (USR-OPS-09)",
    items_count: 6,
    created_at: "2025-12-20T10:00:00Z",
    updated_at: "2025-12-28T14:30:00Z",
  },
  {
    id: "pl-002",
    state_code: "27",
    state_name: "Maharashtra",
    tier: "retailer",
    version: 1,
    effective_from: "2026-01-01T00:00:00Z",
    effective_to: "2026-12-31T23:59:59Z",
    status: "published",
    approved_by: "Finance Controller (USR-FIN-01)",
    created_by: "State Ops Manager (USR-OPS-09)",
    items_count: 6,
    created_at: "2025-12-22T11:00:00Z",
    updated_at: "2025-12-28T15:00:00Z",
  },
  {
    id: "pl-003",
    state_code: "24",
    state_name: "Gujarat",
    tier: "distributor",
    version: 2,
    effective_from: "2026-04-01T00:00:00Z",
    status: "pending_approval",
    created_by: "Pricing Analyst (USR-PRC-03)",
    items_count: 6,
    created_at: "2026-03-25T09:15:00Z",
    updated_at: "2026-03-25T09:15:00Z",
  },
  {
    id: "pl-004",
    state_code: "23",
    state_name: "Madhya Pradesh",
    tier: "state_stockist",
    version: 1,
    effective_from: "2026-05-01T00:00:00Z",
    status: "draft",
    created_by: "Commercial Lead (USR-COM-05)",
    items_count: 6,
    created_at: "2026-04-02T16:20:00Z",
    updated_at: "2026-04-02T16:20:00Z",
  },
];

export const MOCK_PRICE_LIST_ITEMS: Record<string, PriceListItem[]> = {
  "pl-001": [
    {
      id: "pli-101",
      price_list_id: "pl-001",
      sku_id: "prod-1",
      sku_code: "RICE-BAS-PRM-50KG",
      product_name: "Shudh Premium 1121 Basmati Rice",
      category_name: "Rice & Grains",
      uom: "BAG",
      mrp: 4500,
      buy_price: 3800,
      suggested_sell_price: 4100,
      max_discount_pct: 3.5,
      gst_rate: 5,
    },
    {
      id: "pli-102",
      price_list_id: "pl-001",
      sku_id: "prod-2",
      sku_code: "RICE-KLM-CLS-25KG",
      product_name: "Shudh Kolam Rice Classic",
      category_name: "Rice & Grains",
      uom: "BAG",
      mrp: 1850,
      buy_price: 1550,
      suggested_sell_price: 1680,
      max_discount_pct: 4.0,
      gst_rate: 5,
    },
    {
      id: "pli-103",
      price_list_id: "pl-001",
      sku_id: "prod-3",
      sku_code: "OIL-SNF-TIN-15L",
      product_name: "Shudh Refined Sunflower Oil 15L Tin",
      category_name: "Edible Oils",
      uom: "TIN",
      mrp: 2150,
      buy_price: 1820,
      suggested_sell_price: 1980,
      max_discount_pct: 3.0,
      gst_rate: 5,
    },
    {
      id: "pli-104",
      price_list_id: "pl-001",
      sku_id: "prod-4",
      sku_code: "DAL-TOR-UNP-30KG",
      product_name: "Shudh Unpolished Toor Dal",
      category_name: "Pulses & Dals",
      uom: "BAG",
      mrp: 3600,
      buy_price: 3050,
      suggested_sell_price: 3280,
      max_discount_pct: 3.5,
      gst_rate: 5,
    },
    {
      id: "pli-105",
      price_list_id: "pl-001",
      sku_id: "prod-5",
      sku_code: "AGR-NPK-BAG-50KG",
      product_name: "Kisan Shakti NPK 19:19:19 Water Soluble",
      category_name: "Fertilizers & Agri Inputs",
      uom: "BAG",
      mrp: 1250,
      buy_price: 1050,
      suggested_sell_price: 1150,
      max_discount_pct: 5.0,
      gst_rate: 5,
    },
    {
      id: "pli-106",
      price_list_id: "pl-001",
      sku_id: "prod-6",
      sku_code: "OIL-MST-BOT-1L",
      product_name: "Heritage Kachi Ghani Mustard Oil 1L",
      category_name: "Edible Oils",
      uom: "PACK",
      mrp: 165,
      buy_price: 138,
      suggested_sell_price: 150,
      max_discount_pct: 4.5,
      gst_rate: 5,
    },
  ],
  "pl-002": [
    {
      id: "pli-201",
      price_list_id: "pl-002",
      sku_id: "prod-1",
      sku_code: "RICE-BAS-PRM-50KG",
      product_name: "Shudh Premium 1121 Basmati Rice",
      category_name: "Rice & Grains",
      uom: "BAG",
      mrp: 4500,
      buy_price: 4100,
      suggested_sell_price: 4350,
      max_discount_pct: 2.0,
      gst_rate: 5,
    },
    {
      id: "pli-202",
      price_list_id: "pl-002",
      sku_id: "prod-2",
      sku_code: "RICE-KLM-CLS-25KG",
      product_name: "Shudh Kolam Rice Classic",
      category_name: "Rice & Grains",
      uom: "BAG",
      mrp: 1850,
      buy_price: 1680,
      suggested_sell_price: 1780,
      max_discount_pct: 2.5,
      gst_rate: 5,
    },
    {
      id: "pli-203",
      price_list_id: "pl-002",
      sku_id: "prod-3",
      sku_code: "OIL-SNF-TIN-15L",
      product_name: "Shudh Refined Sunflower Oil 15L Tin",
      category_name: "Edible Oils",
      uom: "TIN",
      mrp: 2150,
      buy_price: 1980,
      suggested_sell_price: 2080,
      max_discount_pct: 2.0,
      gst_rate: 5,
    },
    {
      id: "pli-204",
      price_list_id: "pl-002",
      sku_id: "prod-4",
      sku_code: "DAL-TOR-UNP-30KG",
      product_name: "Shudh Unpolished Toor Dal",
      category_name: "Pulses & Dals",
      uom: "BAG",
      mrp: 3600,
      buy_price: 3280,
      suggested_sell_price: 3450,
      max_discount_pct: 2.0,
      gst_rate: 5,
    },
    {
      id: "pli-205",
      price_list_id: "pl-002",
      sku_id: "prod-5",
      sku_code: "AGR-NPK-BAG-50KG",
      product_name: "Kisan Shakti NPK 19:19:19 Water Soluble",
      category_name: "Fertilizers & Agri Inputs",
      uom: "BAG",
      mrp: 1250,
      buy_price: 1150,
      suggested_sell_price: 1200,
      max_discount_pct: 3.0,
      gst_rate: 5,
    },
    {
      id: "pli-206",
      price_list_id: "pl-002",
      sku_id: "prod-6",
      sku_code: "OIL-MST-BOT-1L",
      product_name: "Heritage Kachi Ghani Mustard Oil 1L",
      category_name: "Edible Oils",
      uom: "PACK",
      mrp: 165,
      buy_price: 150,
      suggested_sell_price: 160,
      max_discount_pct: 3.0,
      gst_rate: 5,
    },
  ],
  "pl-003": [
    {
      id: "pli-301",
      price_list_id: "pl-003",
      sku_id: "prod-1",
      sku_code: "RICE-BAS-PRM-50KG",
      product_name: "Shudh Premium 1121 Basmati Rice",
      category_name: "Rice & Grains",
      uom: "BAG",
      mrp: 4500,
      buy_price: 3820,
      suggested_sell_price: 4120,
      max_discount_pct: 3.5,
      gst_rate: 5,
    },
    {
      id: "pli-302",
      price_list_id: "pl-003",
      sku_id: "prod-2",
      sku_code: "RICE-KLM-CLS-25KG",
      product_name: "Shudh Kolam Rice Classic",
      category_name: "Rice & Grains",
      uom: "BAG",
      mrp: 1850,
      buy_price: 1560,
      suggested_sell_price: 1690,
      max_discount_pct: 4.0,
      gst_rate: 5,
    },
    {
      id: "pli-303",
      price_list_id: "pl-003",
      sku_id: "prod-3",
      sku_code: "OIL-SNF-TIN-15L",
      product_name: "Shudh Refined Sunflower Oil 15L Tin",
      category_name: "Edible Oils",
      uom: "TIN",
      mrp: 2150,
      buy_price: 1810,
      suggested_sell_price: 1970,
      max_discount_pct: 3.0,
      gst_rate: 5,
    },
    {
      id: "pli-304",
      price_list_id: "pl-003",
      sku_id: "prod-4",
      sku_code: "DAL-TOR-UNP-30KG",
      product_name: "Shudh Unpolished Toor Dal",
      category_name: "Pulses & Dals",
      uom: "BAG",
      mrp: 3600,
      buy_price: 3040,
      suggested_sell_price: 3270,
      max_discount_pct: 3.5,
      gst_rate: 5,
    },
    {
      id: "pli-305",
      price_list_id: "pl-003",
      sku_id: "prod-5",
      sku_code: "AGR-NPK-BAG-50KG",
      product_name: "Kisan Shakti NPK 19:19:19 Water Soluble",
      category_name: "Fertilizers & Agri Inputs",
      uom: "BAG",
      mrp: 1250,
      buy_price: 1040,
      suggested_sell_price: 1140,
      max_discount_pct: 5.0,
      gst_rate: 5,
    },
    {
      id: "pli-306",
      price_list_id: "pl-003",
      sku_id: "prod-6",
      sku_code: "OIL-MST-BOT-1L",
      product_name: "Heritage Kachi Ghani Mustard Oil 1L",
      category_name: "Edible Oils",
      uom: "PACK",
      mrp: 165,
      buy_price: 136,
      suggested_sell_price: 148,
      max_discount_pct: 4.5,
      gst_rate: 5,
    },
  ],
};

export const MOCK_SCHEMES: Scheme[] = [
  {
    id: "sch-001",
    code: "SCH-KHARIF-VOL-01",
    name: "Kharif Grain Volume Incentive (Slab Discount)",
    description: "Volume-linked slab discount on bulk rice shipments for distributors and retailers.",
    type: "slab_pct",
    slabs: [
      { min_qty: 10, discount_pct: 2.0 },
      { min_qty: 50, discount_pct: 4.0 },
    ],
    target_type: "category",
    target_id: "cat-1",
    targets: [{ target_type: "category", target_id: "cat-1", target_name: "Rice & Grains" }],
    target_tiers: ["distributor", "sub_distributor", "retailer"],
    valid_from: "2026-01-01T00:00:00Z",
    valid_to: "2026-06-30T23:59:59Z",
    is_exclusive: false,
    budget_amount: 250000,
    budget_used: 114500,
    status: "active",
    created_by: "VP Commercial (USR-COM-01)",
    created_at: "2025-12-28T10:00:00Z",
    updated_at: "2026-02-15T12:00:00Z",
  },
  {
    id: "sch-002",
    code: "SCH-OIL-CASH-50",
    name: "Sunflower Oil 15L Tin Flat Subsidy",
    description: "Direct price protection incentive: ₹50 instant deduction per 15L tin.",
    type: "flat",
    discount_value: 50,
    target_type: "product",
    target_id: "prod-3",
    targets: [{ target_type: "product", target_id: "prod-3", target_name: "Shudh Refined Sunflower Oil 15L Tin" }],
    target_tiers: ["distributor", "retailer"],
    valid_from: "2026-02-01T00:00:00Z",
    valid_to: "2026-04-30T23:59:59Z",
    is_exclusive: false,
    budget_amount: 100000,
    budget_used: 42000,
    status: "active",
    created_by: "Category Manager Oils (USR-CAT-04)",
    created_at: "2026-01-20T14:30:00Z",
    updated_at: "2026-02-01T09:00:00Z",
  },
  {
    id: "sch-003",
    code: "SCH-B20-G1-TOOR",
    name: "Toor Dal Super Bumper Deal (Buy 20 Bags, Get 1 Free)",
    description: "Wholesale stocking trade offer: 1 complimentary 30KG bag on purchase of every 20 bags.",
    type: "buy_x_get_y",
    buy_qty: 20,
    get_qty: 1,
    target_type: "product",
    target_id: "prod-4",
    targets: [{ target_type: "product", target_id: "prod-4", target_name: "Shudh Unpolished Toor Dal" }],
    target_tiers: ["distributor", "sub_distributor"],
    valid_from: "2026-03-01T00:00:00Z",
    valid_to: "2026-05-31T23:59:59Z",
    is_exclusive: true,
    budget_amount: 150000,
    budget_used: 36000,
    status: "active",
    created_by: "Sales Head Pulses (USR-SLS-02)",
    created_at: "2026-02-25T11:45:00Z",
    updated_at: "2026-03-01T00:00:00Z",
  },
];

/**
 * Live Price & Scheme Calculation Engine (Rule PR-01 to PR-05)
 */
export function calculateQuote(req: PriceQuoteRequest): PriceQuoteResult {
  const {
    sku_id,
    buyer_tier,
    quantity,
    seller_state_code,
    buyer_state_code,
  } = req;

  // 1. Resolve matching price list item
  // Defaults to pl-001 (Distributor MH) or pl-002 (Retailer MH)
  const priceListKey = buyer_tier === "retailer" ? "pl-002" : "pl-001";
  const items = MOCK_PRICE_LIST_ITEMS[priceListKey] || MOCK_PRICE_LIST_ITEMS["pl-001"];
  const item = items.find((i) => i.sku_id === sku_id) || items[0];

  const basePrice = item.buy_price;
  const subtotal = Math.round(basePrice * quantity * 100) / 100;

  // 2. Resolve Scheme Engine & Discounts
  let totalDiscount = 0;
  const appliedSchemes: AppliedScheme[] = [];

  for (const scheme of MOCK_SCHEMES) {
    if (scheme.status !== "active") continue;

    // Check targeting
    const matchesTarget =
      !scheme.target_id ||
      scheme.target_id === sku_id ||
      (scheme.target_type === "category" &&
        (item.category_name.toLowerCase().includes("grain") ||
          item.category_name.toLowerCase().includes("rice")));

    if (!matchesTarget) continue;

    if (scheme.type === "slab_pct" && scheme.slabs) {
      // Find highest qualifying slab
      const sortedSlabs = [...scheme.slabs].sort((a, b) => b.min_qty - a.min_qty);
      const matchedSlab = sortedSlabs.find((s) => quantity >= s.min_qty);
      if (matchedSlab) {
        const discountAmt = Math.round(subtotal * (matchedSlab.discount_pct / 100) * 100) / 100;
        totalDiscount += discountAmt;
        appliedSchemes.push({
          id: scheme.id,
          name: `${scheme.name} (${matchedSlab.discount_pct}%)`,
          type: "slab_pct",
          discount_amount: discountAmt,
        });
      }
    } else if (scheme.type === "flat" && scheme.discount_value) {
      const discountAmt = scheme.discount_value * quantity;
      totalDiscount += discountAmt;
      appliedSchemes.push({
        id: scheme.id,
        name: `${scheme.name} (₹${scheme.discount_value}/unit)`,
        type: "flat",
        discount_amount: discountAmt,
      });
    } else if (scheme.type === "buy_x_get_y" && scheme.buy_qty && scheme.get_qty) {
      const freePacks = Math.floor(quantity / scheme.buy_qty) * scheme.get_qty;
      if (freePacks > 0) {
        appliedSchemes.push({
          id: scheme.id,
          name: `${scheme.name} (+${freePacks} Free Bags)`,
          type: "buy_x_get_y",
          discount_amount: 0,
          free_qty: freePacks,
        });
      }
    }
  }

  // 3. Taxable Amount & GST Calculation (Rule PR-04)
  const taxableAmount = Math.max(0, subtotal - totalDiscount);
  const isInterstate = seller_state_code !== buyer_state_code;

  let cgstRate = 0;
  let cgstAmount = 0;
  let sgstRate = 0;
  let sgstAmount = 0;
  let igstRate = 0;
  let igstAmount = 0;

  if (isInterstate) {
    // Interstate: 5% IGST
    igstRate = item.gst_rate;
    igstAmount = Math.round(taxableAmount * (igstRate / 100) * 100) / 100;
  } else {
    // Intra-state: 2.5% CGST + 2.5% SGST
    cgstRate = item.gst_rate / 2;
    cgstAmount = Math.round(taxableAmount * (cgstRate / 100) * 100) / 100;
    sgstRate = item.gst_rate / 2;
    sgstAmount = Math.round(taxableAmount * (sgstRate / 100) * 100) / 100;
  }

  const totalTax = Math.round((cgstAmount + sgstAmount + igstAmount) * 100) / 100;
  const lineTotal = Math.round((taxableAmount + totalTax) * 100) / 100;

  return {
    sku_id: item.sku_id,
    sku_code: item.sku_code,
    product_name: item.product_name,
    quantity,
    uom: item.uom,
    base_price: basePrice,
    subtotal,
    discount_amount: totalDiscount,
    taxable_amount: taxableAmount,
    is_interstate: isInterstate,
    cgst_rate: cgstRate,
    cgst_amount: cgstAmount,
    sgst_rate: sgstRate,
    sgst_amount: sgstAmount,
    igst_rate: igstRate,
    igst_amount: igstAmount,
    total_tax: totalTax,
    line_total: lineTotal,
    applied_schemes: appliedSchemes,
  };
}

