/**
 * Module 07: Order Fulfilment (Sell Side) Mock Data & State Machine Engine
 * Matches Dev Spec M07 and API_Documentation.md Section 5
 */

import { MOCK_ORDERS } from "@/lib/mock-orders";
import type { Order, OrderLine, OrderStatus } from "@/types/order";
import type {
  AcceptOrderRequest,
  BulkAcceptRequest,
  DispatchOrderRequest,
  FulfilmentReasonCode,
  FulfilmentStatus,
  PackOrderRequest,
  PartialLineInput,
  PickListItem,
  PickListSummary,
  RejectOrderRequest,
  SLAInfo,
} from "@/types/fulfilment";

// Rule FL-01: Valid State Transitions Table
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  new: ["confirmed", "cancelled", "on_hold"],
  confirmed: ["packed", "cancelled", "on_hold"],
  packed: ["shipped", "on_hold"],
  shipped: ["delivered", "cancelled"], // cancelled can represent returned
  delivered: [],
  cancelled: [],
  on_hold: ["new", "confirmed", "cancelled"],
};

export function canTransitionOrder(
  fromStatus: OrderStatus,
  toStatus: OrderStatus,
): boolean {
  const allowed = ALLOWED_TRANSITIONS[fromStatus] || [];
  return allowed.includes(toStatus);
}

/**
 * Calculates SLA status for an order based on 4 working hours rule
 */
export function calculateOrderSLA(order: Order): SLAInfo {
  const placedTime = new Date(order.placed_at).getTime();
  // 4 hours in ms = 4 * 3600 * 1000 = 14,400,000
  const slaDueTime = order.sla_due_at
    ? new Date(order.sla_due_at).getTime()
    : placedTime + 4 * 3600 * 1000;

  const now = Date.now();
  const diffMs = slaDueTime - now;
  const hoursRemaining = Math.round((diffMs / (3600 * 1000)) * 10) / 10;
  const isBreached =
    (order.status === "new" || order.status === "confirmed") && diffMs < 0;

  return {
    is_breached: isBreached,
    hours_remaining: hoursRemaining,
    sla_due_at: new Date(slaDueTime).toISOString(),
  };
}

/**
 * Update order status with state machine verification (Rule FL-01)
 */
export function updateOrderStatusFulfilment(
  orderId: string,
  newStatus: OrderStatus,
  reason?: string,
  actor: string = "Seller Warehouse Dispatch",
): Order {
  const order = MOCK_ORDERS.find((o) => o.id === orderId);
  if (!order) {
    throw new Error(`Order ${orderId} not found`);
  }

  if (!canTransitionOrder(order.status, newStatus)) {
    throw new Error(
      `Invalid state transition: Cannot transition from '${order.status}' to '${newStatus}' (Rule FL-01)`,
    );
  }

  const prevStatus = order.status;
  order.status = newStatus;

  if (newStatus === "delivered") {
    order.payment_status = "paid";
    for (const line of order.lines) {
      if (!line.fulfilled_qty) {
        line.fulfilled_qty = line.ordered_qty;
      }
    }
  }

  if (!order.history) {
    order.history = [];
  }

  order.history.push({
    id: `evt-${Date.now()}`,
    from_status: prevStatus,
    to_status: newStatus,
    changed_by: actor,
    reason: reason || `Fulfilment updated to ${newStatus}`,
    changed_at: new Date().toISOString(),
  });

  return order;
}

/**
 * Record partial fulfillment quantities per order line (POST /fulfillment/orders/{id}/partial)
 * Recalculates subtotal, taxes, and credit release (Rule FL-04)
 */
export function recordPartialFulfillmentMock(
  orderId: string,
  lines: PartialLineInput[],
): Order {
  const order = MOCK_ORDERS.find((o) => o.id === orderId);
  if (!order) {
    throw new Error(`Order ${orderId} not found`);
  }

  if (order.status !== "new" && order.status !== "confirmed") {
    throw new Error(
      `Partial fulfillment can only be recorded on NEW or CONFIRMED orders`,
    );
  }

  let totalFulfilledUnits = 0;

  for (const input of lines) {
    const orderLine = order.lines.find((l) => l.id === input.order_line_id);
    if (orderLine) {
      if (input.fulfilled_qty > orderLine.ordered_qty) {
        throw new Error(
          `Fulfilled quantity (${input.fulfilled_qty}) cannot exceed ordered quantity (${orderLine.ordered_qty})`,
        );
      }
      orderLine.fulfilled_qty = input.fulfilled_qty;
      totalFulfilledUnits += input.fulfilled_qty;

      // Recalculate line total based on fulfilled qty
      const unitTaxable = orderLine.unit_price * input.fulfilled_qty;
      const taxRate = orderLine.tax_rate || 5;
      const tax = Math.round(unitTaxable * (taxRate / 100) * 100) / 100;

      orderLine.taxable_amount = unitTaxable;
      orderLine.cgst_amount = Math.round((tax / 2) * 100) / 100;
      orderLine.sgst_amount = Math.round((tax / 2) * 100) / 100;
      orderLine.line_total = unitTaxable + tax;
    }
  }

  if (totalFulfilledUnits === 0) {
    order.status = "cancelled";
    order.hold_reason = "Cancelled: Zero stock fulfilled across all items";
  } else {
    // Recompute order-level financial totals (Rule FL-04)
    const newSubtotal = order.lines.reduce(
      (acc, l) => acc + l.taxable_amount,
      0,
    );
    const newTax = order.lines.reduce(
      (acc, l) => acc + l.cgst_amount + l.sgst_amount + l.igst_amount,
      0,
    );
    order.subtotal = newSubtotal;
    order.taxable_amount = newSubtotal;
    order.cgst_total = Math.round((newTax / 2) * 100) / 100;
    order.sgst_total = Math.round((newTax / 2) * 100) / 100;
    order.grand_total = Math.round((newSubtotal + newTax) * 100) / 100;
    order.status = "confirmed";
  }

  if (!order.history) order.history = [];
  order.history.push({
    id: `evt-partial-${Date.now()}`,
    from_status: order.status,
    to_status: order.status,
    changed_by: "Seller Warehouse Manager",
    reason: `Recorded partial fulfillment. Recalculated total: ₹${order.grand_total}`,
    changed_at: new Date().toISOString(),
  });

  return order;
}

/**
 * Accept Order (full or partial)
 */
export function acceptOrderMock(
  orderId: string,
  req?: AcceptOrderRequest,
): Order {
  const order = MOCK_ORDERS.find((o) => o.id === orderId);
  if (!order) throw new Error(`Order ${orderId} not found`);

  if (req?.lines && req.lines.length > 0) {
    const partialInputs: PartialLineInput[] = req.lines.map((l) => ({
      order_line_id: l.line_id,
      fulfilled_qty: l.qty_accepted,
      reason_code: l.reason_code,
    }));
    return recordPartialFulfillmentMock(orderId, partialInputs);
  }

  // Full accept
  for (const line of order.lines) {
    line.fulfilled_qty = line.ordered_qty;
  }
  return updateOrderStatusFulfilment(
    orderId,
    "confirmed",
    req?.reason || "Full order accepted by seller",
    "Seller Sales Operations",
  );
}

/**
 * Reject Order with mandatory reason code
 */
export function rejectOrderMock(
  orderId: string,
  req: RejectOrderRequest,
): Order {
  const order = MOCK_ORDERS.find((o) => o.id === orderId);
  if (!order) throw new Error(`Order ${orderId} not found`);

  order.status = "cancelled";
  order.hold_reason = `Rejected: [${req.reason_code}] ${req.note || ""}`.trim();

  if (!order.history) order.history = [];
  order.history.push({
    id: `evt-reject-${Date.now()}`,
    from_status: "new",
    to_status: "cancelled",
    changed_by: "Seller Dispatch Manager",
    reason: `Order rejected. Reason: ${req.reason_code}. Note: ${req.note || "N/A"}`,
    changed_at: new Date().toISOString(),
  });

  return order;
}

/**
 * Pack Order & initiate invoice readiness (Dev Spec M07 / M08 trigger)
 */
export function packOrderMock(
  orderId: string,
  req?: PackOrderRequest,
): Order {
  const order = MOCK_ORDERS.find((o) => o.id === orderId);
  if (!order) throw new Error(`Order ${orderId} not found`);

  const reason = `Goods packed into ${req?.package_count || "specified"} packages (Est. weight: ${req?.weight_kg || "standard"} kg). ${req?.notes || ""}`.trim();

  return updateOrderStatusFulfilment(
    orderId,
    "packed",
    reason,
    "Warehouse Packing Supervisor",
  );
}

/**
 * Dispatch Order with Transporter and E-Way Bill details
 */
export function dispatchOrderMock(
  orderId: string,
  req: DispatchOrderRequest,
): Order {
  const order = MOCK_ORDERS.find((o) => o.id === orderId);
  if (!order) throw new Error(`Order ${orderId} not found`);

  const trackingNote = `Dispatched via ${req.transporter_name} (Vehicle #${req.vehicle_number}). E-Way Bill: ${req.eway_bill_number || "Generated"}. Driver: ${req.driver_contact || "N/A"}`;

  order.notes = order.notes
    ? `${order.notes}\n[Dispatch]: ${trackingNote}`
    : `[Dispatch]: ${trackingNote}`;

  return updateOrderStatusFulfilment(
    orderId,
    "shipped",
    trackingNote,
    "Logistics Desk",
  );
}

/**
 * Bulk Accept Multiple Orders
 */
export function bulkAcceptOrdersMock(req: BulkAcceptRequest): Order[] {
  const updatedOrders: Order[] = [];
  for (const id of req.order_ids) {
    const order = MOCK_ORDERS.find((o) => o.id === id);
    if (order && order.status === "new") {
      for (const line of order.lines) {
        line.fulfilled_qty = line.ordered_qty;
      }
      const updated = updateOrderStatusFulfilment(
        id,
        "confirmed",
        req.reason || "Bulk accepted via Master Fulfilment Console",
        "Stockist Warehouse Admin",
      );
      updatedOrders.push(updated);
    }
  }
  return updatedOrders;
}

/**
 * Generate Warehouse Pick List aggregating SKUs across selected orders
 */
export function generatePickListMock(orderIds: string[]): PickListSummary {
  const selectedOrders = MOCK_ORDERS.filter((o) => orderIds.includes(o.id));
  const skuMap: Record<string, PickListItem> = {};

  const binLocations = [
    "Godown 1 · Aisle A · Bin 04",
    "Godown 1 · Aisle B · Bin 12",
    "Godown 2 · Heavy Grain Silo 02",
    "Godown 2 · Oil Staging Bay 01",
    "Godown 3 · Pulse Packing Zone",
  ];

  let totalUnits = 0;
  let binIdx = 0;

  for (const order of selectedOrders) {
    for (const line of order.lines) {
      const qty = line.fulfilled_qty > 0 ? line.fulfilled_qty : line.ordered_qty;
      totalUnits += qty;

      if (!skuMap[line.sku]) {
        skuMap[line.sku] = {
          product_id: line.product_id,
          sku: line.sku,
          product_name: line.product_name,
          uom: line.uom,
          hsn_code: line.hsn_code,
          total_quantity: 0,
          order_ids: [],
          orders_count: 0,
          bin_location: binLocations[binIdx % binLocations.length],
        };
        binIdx++;
      }

      skuMap[line.sku].total_quantity += qty;
      if (!skuMap[line.sku].order_ids.includes(order.order_number)) {
        skuMap[line.sku].order_ids.push(order.order_number);
        skuMap[line.sku].orders_count++;
      }
    }
  }

  const items = Object.values(skuMap).sort(
    (a, b) => b.total_quantity - a.total_quantity,
  );

  return {
    generated_at: new Date().toISOString(),
    total_orders: selectedOrders.length,
    total_sku_count: items.length,
    total_units: totalUnits,
    order_numbers: selectedOrders.map((o) => o.order_number),
    items,
  };
}

/**
 * Administrative Emergency Status Override with audit justification
 */
export function overrideOrderStatusMock(
  orderId: string,
  status: FulfilmentStatus,
  reason: string,
): Order {
  const order = MOCK_ORDERS.find((o) => o.id === orderId);
  if (!order) throw new Error(`Order ${orderId} not found`);

  const prevStatus = order.status;
  order.status = status;

  if (!order.history) order.history = [];
  order.history.push({
    id: `evt-override-${Date.now()}`,
    from_status: prevStatus,
    to_status: status,
    changed_by: "Super Admin (Emergency Override)",
    reason: `[ADMIN OVERRIDE]: ${reason}`,
    changed_at: new Date().toISOString(),
  });

  return order;
}
