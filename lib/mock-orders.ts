import type {
  Cart,
  CartItem,
  Order,
  OrderLine,
  OrderStatus,
  PlaceOnBehalfOrderRequest,
  PlaceOrderRequest,
} from "@/types/order";
import { MOCK_PRODUCTS } from "@/lib/mock-catalog";
import { MOCK_PARTNERS } from "@/lib/mock-partners";
import { calculateQuote } from "@/lib/mock-pricing";

export const MOCK_ORDERS: Order[] = [
  {
    id: "ord-001",
    order_number: "ORD-2609-000101",
    buyer_id: "p-002",
    buyer_name: "Kisan Seva Krishi Kendra",
    buyer_tier: "distributor",
    buyer_code: "AGB-DS-MH-102",
    seller_id: "p-001",
    seller_name: "Maharashtra Agro Hub Pvt Ltd",
    seller_tier: "state_stockist",
    source: "self",
    status: "delivered",
    payment_mode: "credit",
    payment_status: "paid",
    subtotal: 209000,
    discount_total: 8360,
    taxable_amount: 200640,
    cgst_total: 5016,
    sgst_total: 5016,
    igst_total: 0,
    grand_total: 210672,
    delivery_address: {
      line1: "Market Yard Shop #14",
      city: "Nashik",
      state: "Maharashtra",
      pincode: "422003",
    },
    notes: "Direct mandi warehouse unloading at Bay 2.",
    placed_at: "2026-03-10T10:15:00Z",
    expected_delivery_date: "2026-03-12",
    sla_due_at: "2026-03-12T18:00:00Z",
    lines: [
      {
        id: "line-101",
        order_id: "ord-001",
        product_id: "prod-1",
        sku: "RICE-BAS-PRM-50KG",
        product_name: "Shudh Premium 1121 Basmati Rice",
        uom: "BAG",
        hsn_code: "10063020",
        ordered_qty: 55,
        fulfilled_qty: 55,
        unit_price: 3800,
        discount_amount: 8360,
        taxable_amount: 200640,
        tax_rate: 5,
        cgst_amount: 5016,
        sgst_amount: 5016,
        igst_amount: 0,
        line_total: 210672,
      },
    ],
    history: [
      {
        id: "h-1",
        from_status: "none",
        to_status: "new",
        changed_by: "Kisan Seva Procurement (Partner App)",
        changed_at: "2026-03-10T10:15:00Z",
      },
      {
        id: "h-2",
        from_status: "new",
        to_status: "confirmed",
        changed_by: "Sales Ops Maharashtra (State Stockist)",
        changed_at: "2026-03-10T11:30:00Z",
      },
      {
        id: "h-3",
        from_status: "confirmed",
        to_status: "packed",
        changed_by: "Pune Central Warehouse Dispatch",
        changed_at: "2026-03-11T09:00:00Z",
      },
      {
        id: "h-4",
        from_status: "packed",
        to_status: "shipped",
        changed_by: "Logistics Partner (Truck MH-12-RN-4421)",
        changed_at: "2026-03-11T14:00:00Z",
      },
      {
        id: "h-5",
        from_status: "shipped",
        to_status: "delivered",
        changed_by: "Driver / Nashik APMC Receiver Sign-off",
        changed_at: "2026-03-12T16:30:00Z",
      },
    ],
  },
  {
    id: "ord-002",
    order_number: "ORD-2609-000102",
    buyer_id: "p-003",
    buyer_name: "Vidarbha Fertilizers & Seeds",
    buyer_tier: "sub_distributor",
    buyer_code: "AGB-SD-MH-204",
    seller_id: "p-002",
    seller_name: "Kisan Seva Krishi Kendra",
    seller_tier: "distributor",
    source: "self",
    status: "shipped",
    payment_mode: "pod",
    payment_status: "unpaid",
    subtotal: 89400,
    discount_total: 2000,
    taxable_amount: 87400,
    cgst_total: 2185,
    sgst_total: 2185,
    igst_total: 0,
    grand_total: 91770,
    delivery_address: {
      line1: "Station Road Near APMC Yard",
      city: "Nagpur",
      state: "Maharashtra",
      pincode: "440002",
    },
    notes: "Call warehouse manager 30 mins before arrival.",
    placed_at: "2026-03-14T09:30:00Z",
    expected_delivery_date: "2026-03-16",
    sla_due_at: "2026-03-16T18:00:00Z",
    lines: [
      {
        id: "line-201",
        order_id: "ord-002",
        product_id: "prod-3",
        sku: "OIL-SNF-TIN-15L",
        product_name: "Shudh Refined Sunflower Oil 15L Tin",
        uom: "TIN",
        hsn_code: "15121910",
        ordered_qty: 40,
        fulfilled_qty: 40,
        unit_price: 1820,
        discount_amount: 2000,
        taxable_amount: 70800,
        tax_rate: 5,
        cgst_amount: 1770,
        sgst_amount: 1770,
        igst_amount: 0,
        line_total: 74340,
      },
    ],
    history: [
      {
        id: "h-21",
        from_status: "none",
        to_status: "new",
        changed_by: "Vidarbha Sales Desk",
        changed_at: "2026-03-14T09:30:00Z",
      },
      {
        id: "h-22",
        from_status: "new",
        to_status: "confirmed",
        changed_by: "Kisan Seva Distributor",
        changed_at: "2026-03-14T11:00:00Z",
      },
      {
        id: "h-23",
        from_status: "confirmed",
        to_status: "shipped",
        changed_by: "Nashik Hub Delivery Desk",
        changed_at: "2026-03-15T08:30:00Z",
      },
    ],
  },
  {
    id: "ord-003",
    order_number: "ORD-2609-000103",
    buyer_id: "p-004",
    buyer_name: "Shri Ganesh Krishi Dukan",
    buyer_tier: "retailer",
    buyer_code: "AGB-RT-MH-501",
    seller_id: "p-003",
    seller_name: "Vidarbha Fertilizers & Seeds",
    seller_tier: "sub_distributor",
    source: "assisted", // Order placed on behalf of child retailer!
    status: "new",
    payment_mode: "credit",
    payment_status: "unpaid",
    subtotal: 41500,
    discount_total: 1200,
    taxable_amount: 40300,
    cgst_total: 1007.5,
    sgst_total: 1007.5,
    igst_total: 0,
    grand_total: 42315,
    delivery_address: {
      line1: "Main Bazaar Ward 2",
      city: "Baramati",
      state: "Maharashtra",
      pincode: "413102",
    },
    notes: "Assisted PO created by Area Field Officer (AFO-08) on behalf of retailer.",
    placed_at: "2026-03-16T11:20:00Z",
    expected_delivery_date: "2026-03-18",
    sla_due_at: "2026-03-18T18:00:00Z",
    lines: [
      {
        id: "line-301",
        order_id: "ord-003",
        product_id: "prod-2",
        sku: "RICE-KLM-CLS-25KG",
        product_name: "Shudh Kolam Rice Classic",
        uom: "BAG",
        hsn_code: "10063010",
        ordered_qty: 25,
        fulfilled_qty: 0,
        unit_price: 1660,
        discount_amount: 1200,
        taxable_amount: 40300,
        tax_rate: 5,
        cgst_amount: 1007.5,
        sgst_amount: 1007.5,
        igst_amount: 0,
        line_total: 42315,
      },
    ],
    history: [
      {
        id: "h-31",
        from_status: "none",
        to_status: "new",
        changed_by: "Field Sales Officer (AFO-08 Assisted Order)",
        changed_at: "2026-03-16T11:20:00Z",
      },
    ],
  },
  {
    id: "ord-004",
    order_number: "ORD-2609-000104",
    buyer_id: "p-005",
    buyer_name: "Gujarat Agro Trade Corp",
    buyer_tier: "distributor",
    buyer_code: "AGB-DS-GJ-109",
    seller_id: "p-001",
    seller_name: "Maharashtra Agro Hub Pvt Ltd",
    seller_tier: "state_stockist",
    source: "self",
    status: "cancelled",
    hold_reason: "Trade Account Blocked (Rule OR-04: KYC Rejected)",
    payment_mode: "credit",
    payment_status: "unpaid",
    subtotal: 152000,
    discount_total: 0,
    taxable_amount: 152000,
    cgst_total: 0,
    sgst_total: 0,
    igst_total: 7600,
    grand_total: 159600,
    delivery_address: {
      line1: "GIDC Industrial Area",
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: "382445",
    },
    notes: "Order cancelled automatically by risk control.",
    placed_at: "2026-03-08T15:00:00Z",
    lines: [
      {
        id: "line-401",
        order_id: "ord-004",
        product_id: "prod-4",
        sku: "DAL-TOR-UNP-30KG",
        product_name: "Shudh Unpolished Toor Dal",
        uom: "BAG",
        hsn_code: "07136000",
        ordered_qty: 50,
        fulfilled_qty: 0,
        unit_price: 3040,
        discount_amount: 0,
        taxable_amount: 152000,
        tax_rate: 5,
        cgst_amount: 0,
        sgst_amount: 0,
        igst_amount: 7600,
        line_total: 159600,
      },
    ],
    history: [
      {
        id: "h-41",
        from_status: "none",
        to_status: "new",
        changed_by: "Gujarat Agro Trade Corp",
        changed_at: "2026-03-08T15:00:00Z",
      },
      {
        id: "h-42",
        from_status: "new",
        to_status: "cancelled",
        changed_by: "System Compliance Daemon",
        reason: "KYC Compliance Rejected - Account in Blocked State",
        changed_at: "2026-03-08T15:02:00Z",
      },
    ],
  },
];

export const MOCK_CART: Cart = {
  id: "cart-active",
  buyer_id: "p-002",
  seller_id: "p-001",
  seller_name: "Maharashtra Agro Hub Pvt Ltd (State Stockist)",
  items: [
    {
      id: "c-item-1",
      product_id: "prod-1",
      sku: "RICE-BAS-PRM-50KG",
      product_name: "Shudh Premium 1121 Basmati Rice",
      uom: "BAG",
      quantity: 20,
      unit_price: 3800,
      discount_amount: 1520, // 2% slab discount
      line_total: 78204, // (3800*20 - 1520) + 5% GST
    },
    {
      id: "c-item-2",
      product_id: "prod-3",
      sku: "OIL-SNF-TIN-15L",
      product_name: "Shudh Refined Sunflower Oil 15L Tin",
      uom: "TIN",
      quantity: 15,
      unit_price: 1820,
      discount_amount: 750, // ₹50/unit flat scheme
      line_total: 27877.5,
    },
  ],
  subtotal: 103300,
  discount_total: 2270,
  taxable_total: 101030,
  tax_total: 5051.5,
  grand_total: 106081.5,
  updated_at: new Date().toISOString(),
};

function recalculateCartTotals(cart: Cart) {
  let subtotal = 0;
  let discountTotal = 0;
  for (const item of cart.items) {
    subtotal += item.unit_price * item.quantity;
    discountTotal += item.discount_amount;
  }
  const taxable = Math.max(0, subtotal - discountTotal);
  const tax = Math.round(taxable * 0.05 * 100) / 100;
  cart.subtotal = Math.round(subtotal * 100) / 100;
  cart.discount_total = Math.round(discountTotal * 100) / 100;
  cart.taxable_total = taxable;
  cart.tax_total = tax;
  cart.grand_total = Math.round((taxable + tax) * 100) / 100;
  cart.updated_at = new Date().toISOString();
}

export function getCartMock(): Cart {
  return MOCK_CART;
}

export function addCartItemMock(productId: string, quantity: number): Cart {
  const product = MOCK_PRODUCTS.find((p) => p.id === productId);
  if (!product) return MOCK_CART;

  const existing = MOCK_CART.items.find((i) => i.product_id === productId);
  if (existing) {
    existing.quantity += quantity;
    existing.line_total = existing.quantity * existing.unit_price;
  } else {
    const unitPrice = product.mrp ? Math.round(product.mrp * 0.85) : 2000;
    MOCK_CART.items.push({
      id: `c-item-${Date.now()}`,
      product_id: product.id,
      sku: product.sku,
      product_name: product.name,
      uom: product.uom || "BAG",
      quantity,
      unit_price: unitPrice,
      discount_amount: 0,
      line_total: Math.round(unitPrice * quantity * 1.05),
    });
  }

  recalculateCartTotals(MOCK_CART);
  return MOCK_CART;
}

export function updateCartItemMock(itemId: string, quantity: number): Cart {
  const item = MOCK_CART.items.find((i) => i.id === itemId);
  if (item) {
    if (quantity <= 0) {
      MOCK_CART.items = MOCK_CART.items.filter((i) => i.id !== itemId);
    } else {
      item.quantity = quantity;
      item.line_total = Math.round(item.unit_price * quantity * 1.05);
    }
    recalculateCartTotals(MOCK_CART);
  }
  return MOCK_CART;
}

export function removeCartItemMock(itemId: string): Cart {
  MOCK_CART.items = MOCK_CART.items.filter((i) => i.id !== itemId);
  recalculateCartTotals(MOCK_CART);
  return MOCK_CART;
}

export function clearCartMock(): Cart {
  MOCK_CART.items = [];
  recalculateCartTotals(MOCK_CART);
  return MOCK_CART;
}

export function placeOrderMock(req: PlaceOrderRequest): Order {
  const seller = MOCK_PARTNERS.find((p) => p.id === req.seller_id) || MOCK_PARTNERS[0];
  const buyer = MOCK_PARTNERS[1]; // Active distributor session

  const lines: OrderLine[] = req.lines.map((l, idx) => {
    const product = MOCK_PRODUCTS.find((p) => p.id === l.product_id) || MOCK_PRODUCTS[0];
    const unitPrice = product.mrp ? Math.round(product.mrp * 0.85) : 2000;
    const subtotal = unitPrice * l.quantity;
    const tax = Math.round(subtotal * 0.05 * 100) / 100;

    return {
      id: `line-${Date.now()}-${idx}`,
      order_id: `ord-${Date.now()}`,
      product_id: product.id,
      sku: product.sku,
      product_name: product.name,
      uom: product.uom || "BAG",
      hsn_code: product.hsn_code,
      ordered_qty: l.quantity,
      fulfilled_qty: 0,
      unit_price: unitPrice,
      discount_amount: 0,
      taxable_amount: subtotal,
      tax_rate: 5,
      cgst_amount: Math.round((tax / 2) * 100) / 100,
      sgst_amount: Math.round((tax / 2) * 100) / 100,
      igst_amount: 0,
      line_total: subtotal + tax,
    };
  });

  const subtotal = lines.reduce((acc, l) => acc + l.taxable_amount, 0);
  const totalTax = lines.reduce((acc, l) => acc + l.cgst_amount + l.sgst_amount, 0);

  const orderNum = `ORD-2609-${Math.floor(100000 + Math.random() * 900000)}`;
  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    order_number: orderNum,
    buyer_id: buyer.id,
    buyer_name: buyer.business_name,
    buyer_tier: buyer.type,
    buyer_code: buyer.code,
    seller_id: seller.id,
    seller_name: seller.business_name,
    seller_tier: seller.type,
    source: "self",
    status: "new",
    payment_mode: req.payment_mode,
    payment_status: "unpaid",
    subtotal,
    discount_total: 0,
    taxable_amount: subtotal,
    cgst_total: Math.round((totalTax / 2) * 100) / 100,
    sgst_total: Math.round((totalTax / 2) * 100) / 100,
    igst_total: 0,
    grand_total: Math.round((subtotal + totalTax) * 100) / 100,
    delivery_address: req.delivery_address,
    notes: req.notes,
    placed_at: new Date().toISOString(),
    expected_delivery_date: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
    sla_due_at: new Date(Date.now() + 2 * 86400000).toISOString(),
    lines,
    history: [
      {
        id: `h-${Date.now()}`,
        from_status: "none",
        to_status: "new",
        changed_by: `${buyer.business_name} (Procurement)`,
        changed_at: new Date().toISOString(),
      },
    ],
  };

  MOCK_ORDERS.unshift(newOrder);
  clearCartMock();
  return newOrder;
}

export function placeOnBehalfOrderMock(req: PlaceOnBehalfOrderRequest): Order {
  const buyer = MOCK_PARTNERS.find((p) => p.id === req.buyer_id) || MOCK_PARTNERS[3]; // Shri Ganesh
  const seller = MOCK_PARTNERS.find((p) => p.id === buyer.parent_id) || MOCK_PARTNERS[1];

  const lines: OrderLine[] = req.lines.map((l, idx) => {
    const product = MOCK_PRODUCTS.find((p) => p.id === l.product_id) || MOCK_PRODUCTS[0];
    const unitPrice = product.mrp ? Math.round(product.mrp * 0.9) : 1800;
    const subtotal = unitPrice * l.quantity;
    const tax = Math.round(subtotal * 0.05 * 100) / 100;

    return {
      id: `line-${Date.now()}-${idx}`,
      order_id: `ord-${Date.now()}`,
      product_id: product.id,
      sku: product.sku,
      product_name: product.name,
      uom: product.uom || "BAG",
      hsn_code: product.hsn_code,
      ordered_qty: l.quantity,
      fulfilled_qty: 0,
      unit_price: unitPrice,
      discount_amount: 0,
      taxable_amount: subtotal,
      tax_rate: 5,
      cgst_amount: Math.round((tax / 2) * 100) / 100,
      sgst_amount: Math.round((tax / 2) * 100) / 100,
      igst_amount: 0,
      line_total: subtotal + tax,
    };
  });

  const subtotal = lines.reduce((acc, l) => acc + l.taxable_amount, 0);
  const totalTax = lines.reduce((acc, l) => acc + l.cgst_amount + l.sgst_amount, 0);

  const orderNum = `ORD-2609-${Math.floor(100000 + Math.random() * 900000)}`;
  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    order_number: orderNum,
    buyer_id: buyer.id,
    buyer_name: buyer.business_name,
    buyer_tier: buyer.type,
    buyer_code: buyer.code,
    seller_id: seller.id,
    seller_name: seller.business_name,
    seller_tier: seller.type,
    source: "assisted", // Assisted / On Behalf!
    status: "new",
    payment_mode: req.payment_mode,
    payment_status: "unpaid",
    subtotal,
    discount_total: 0,
    taxable_amount: subtotal,
    cgst_total: Math.round((totalTax / 2) * 100) / 100,
    sgst_total: Math.round((totalTax / 2) * 100) / 100,
    igst_total: 0,
    grand_total: Math.round((subtotal + totalTax) * 100) / 100,
    delivery_address: req.delivery_address || {
      line1: buyer.address?.line1 || "APMC Yard",
      city: buyer.address?.city || "Nashik",
      state: buyer.address?.state || "Maharashtra",
      pincode: buyer.address?.pincode || "422003",
    },
    notes: req.notes || `Assisted order created on behalf of ${buyer.business_name}.`,
    placed_at: new Date().toISOString(),
    expected_delivery_date: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
    sla_due_at: new Date(Date.now() + 2 * 86400000).toISOString(),
    lines,
    history: [
      {
        id: `h-${Date.now()}`,
        from_status: "none",
        to_status: "new",
        changed_by: `Field Sales Officer (Assisted Order for ${buyer.business_name})`,
        changed_at: new Date().toISOString(),
      },
    ],
  };

  MOCK_ORDERS.unshift(newOrder);
  return newOrder;
}

export function updateOrderStatusMock(
  orderId: string,
  newStatus: OrderStatus,
  reason?: string,
): Order | null {
  const order = MOCK_ORDERS.find((o) => o.id === orderId);
  if (!order) return null;

  const prevStatus = order.status;
  order.status = newStatus;

  if (newStatus === "delivered") {
    order.payment_status = "paid";
    for (const l of order.lines) {
      l.fulfilled_qty = l.ordered_qty;
    }
  }

  if (reason) {
    order.hold_reason = reason;
  }

  if (!order.history) order.history = [];
  order.history.push({
    id: `h-${Date.now()}`,
    from_status: prevStatus,
    to_status: newStatus,
    changed_by: "Admin Operations Console",
    reason,
    changed_at: new Date().toISOString(),
  });

  return order;
}

export function cancelOrderMock(orderId: string, reason?: string): Order | null {
  return updateOrderStatusMock(orderId, "cancelled", reason || "Order cancelled by administrator");
}
