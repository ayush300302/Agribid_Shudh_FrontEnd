/**
 * Module 12: Returns & Claims Mock Store & Workflow Engine
 * Enforces Dev Spec M12, Rules RC-01..04, Credit Note generation (M08),
 * Ledger Credit posting (M11), and Inventory Return Inward (M10).
 */

import { MOCK_CREDIT_ACCOUNTS, MOCK_LEDGER_ENTRIES } from "@/lib/mock-payments";
import { MOCK_STOCK_MOVEMENTS, MOCK_INVENTORY } from "@/lib/mock-inventory";
import { MOCK_ORDERS } from "@/lib/mock-orders";
import type {
  AdminResolveClaimRequest,
  Claim,
  ClaimLineItem,
  ClaimStatus,
  DecideClaimRequest,
  EscalateClaimRequest,
  RaiseClaimRequest,
} from "@/types/claim";

export const MOCK_CLAIMS: Claim[] = [
  {
    id: "clm-001",
    claim_no: "CLM-2609-0001",
    order_id: "ord-001",
    order_number: "PO-MH-2609-0142",
    invoice_id: "inv-001",
    invoice_number: "INV-2609-000101",
    raised_by: "p-002",
    buyer_name: "Kisan Seva Krishi Kendra",
    buyer_tier: "distributor",
    seller_id: "p-001",
    seller_name: "Maharashtra Agro Hub Pvt Ltd",
    type: "DAMAGE",
    status: "OPEN",
    physical_return: false,
    total_claimed_amount: 7980, // 2 bags @ 3800 + 5% GST = 7600 + 380
    total_approved_amount: 0,
    lines: [
      {
        id: "clm-l-001",
        order_line_id: "ord-l-101",
        product_id: "prod-1",
        sku: "RICE-BAS-PRM-50KG",
        product_name: "Shudh Premium 1121 Basmati Rice",
        uom: "BAG",
        unit_price: 3800,
        delivered_qty: 55,
        claimed_qty: 2,
        approved_qty: 0,
        total_line_claim: 7980,
        reason: "Two bags torn with heavy grain leakage upon vehicle unloading in bay.",
        photos: [
          "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
        ],
      },
    ],
    delivered_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString(), // 20 hours ago (within 48h window)
    sla_deadline: new Date(Date.now() + 28 * 3600 * 1000).toISOString(),
    is_escalated: false,
    created_at: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
  },
  {
    id: "clm-002",
    claim_no: "CLM-2609-0002",
    order_id: "ord-002",
    order_number: "PO-MH-2609-0143",
    invoice_id: "inv-002",
    invoice_number: "INV-2609-000102",
    raised_by: "p-003",
    buyer_name: "Vidarbha Fertilizers & Seeds",
    buyer_tier: "sub_distributor",
    seller_id: "p-002",
    seller_name: "Kisan Seva Krishi Kendra",
    type: "SHORTAGE",
    status: "ESCALATED",
    physical_return: false,
    total_claimed_amount: 9200,
    total_approved_amount: 0,
    lines: [
      {
        id: "clm-l-002",
        order_line_id: "ord-l-102",
        product_id: "prod-3",
        sku: "OIL-SNF-TIN-15L",
        product_name: "Shudh Refined Sunflower Oil 15L Tin",
        uom: "TIN",
        unit_price: 1840,
        delivered_qty: 50,
        claimed_qty: 5,
        approved_qty: 0,
        total_line_claim: 9200,
        reason: "Trip manifest stated 50 tins, but physically counted 45 tins at unloading gate.",
        photos: [],
      },
    ],
    delivered_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    sla_deadline: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
    is_escalated: true,
    escalation_reason: "Seller distributor rejected claiming truck was sealed; buyer provided CCTV weighbridge count showing 45 tins loaded.",
    created_at: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
  },
  {
    id: "clm-003",
    claim_no: "CLM-2609-0003",
    order_id: "ord-003",
    order_number: "PO-MH-2609-0138",
    invoice_id: "inv-003",
    invoice_number: "INV-2609-000098",
    raised_by: "p-004",
    buyer_name: "Sai Krishi Seva Kendra",
    buyer_tier: "retailer",
    seller_id: "p-002",
    seller_name: "Kisan Seva Krishi Kendra",
    type: "WRONG_ITEM",
    status: "APPROVED",
    resolution: "CREDIT_NOTE",
    credit_note_number: "CN-2609-0001",
    physical_return: true,
    total_claimed_amount: 6300,
    total_approved_amount: 6300,
    lines: [
      {
        id: "clm-l-003",
        product_id: "prod-4",
        sku: "DAL-TOR-UNP-30KG",
        product_name: "Shudh Unpolished Toor Dal",
        uom: "BAG",
        unit_price: 3150,
        delivered_qty: 10,
        claimed_qty: 2,
        approved_qty: 2,
        total_line_claim: 6300,
        reason: "Wrong SKU dispatched - received polished dal instead of unpolished grade.",
        photos: [
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
        ],
      },
    ],
    delivered_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    sla_deadline: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    is_escalated: false,
    decided_by: "Kisan Seva Operations Head",
    decided_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    decision_note: "Physical return collected by driver. Credit Note CN-2609-0001 generated.",
    created_at: new Date(Date.now() - 60 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
];

export function listClaimsMock(params?: {
  status?: string;
  type?: string;
  isEscalated?: boolean;
  search?: string;
}): Claim[] {
  return MOCK_CLAIMS.filter((c) => {
    if (params?.status && params.status !== "ALL") {
      if (c.status !== params.status) return false;
    }
    if (params?.type && params.type !== "ALL") {
      if (c.type !== params.type) return false;
    }
    if (params?.isEscalated !== undefined) {
      if (c.is_escalated !== params.isEscalated) return false;
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      const matchNo = c.claim_no.toLowerCase().includes(q);
      const matchOrder = c.order_number.toLowerCase().includes(q);
      const matchBuyer = c.buyer_name.toLowerCase().includes(q);
      const matchSeller = c.seller_name.toLowerCase().includes(q);
      const matchReason = c.lines.some((l) => l.reason.toLowerCase().includes(q));
      if (!matchNo && !matchOrder && !matchBuyer && !matchSeller && !matchReason) {
        return false;
      }
    }
    return true;
  });
}

export function getClaimMock(id: string): Claim | undefined {
  return MOCK_CLAIMS.find((c) => c.id === id || c.claim_no === id);
}

export function raiseClaimMock(orderId: string, req: RaiseClaimRequest): Claim {
  const order = MOCK_ORDERS.find((o) => o.id === orderId || o.order_number === orderId);
  const deliveredAt = order?.delivered_at || new Date(Date.now() - 10 * 3600 * 1000).toISOString();

  // Rule RC-01: Claim allowed only within 48h of delivery
  const hoursSinceDelivery =
    (Date.now() - new Date(deliveredAt).getTime()) / (1000 * 3600);
  if (hoursSinceDelivery > 48) {
    const error: any = new Error(
      `Claim window closed: Claims must be raised within 48 hours of delivery (Rule RC-01). Delivered ${Math.round(hoursSinceDelivery)} hours ago.`,
    );
    error.code = "CLAIM_WINDOW_CLOSED";
    error.status = 422;
    throw error;
  }

  // Rule RC-02: At least one photo required for DAMAGE / WRONG_ITEM / QUALITY
  if (
    req.type === "DAMAGE" ||
    req.type === "WRONG_ITEM" ||
    req.type === "QUALITY"
  ) {
    const hasPhoto = req.lines.some((l) => l.photos && l.photos.length > 0);
    if (!hasPhoto) {
      const error: any = new Error(
        `Photo evidence is mandatory for ${req.type} claims (Rule RC-02). Please upload at least one image showing the affected product.`,
      );
      error.code = "PHOTO_REQUIRED";
      error.status = 400;
      throw error;
    }
  }

  // Validate quantities
  for (const line of req.lines) {
    if (line.claimed_qty > line.delivered_qty) {
      const error: any = new Error(
        `Claimed quantity (${line.claimed_qty}) cannot exceed delivered quantity (${line.delivered_qty}) for ${line.product_name}.`,
      );
      error.code = "INVALID_QUANTITY";
      error.status = 422;
      throw error;
    }
  }

  const claimLines: ClaimLineItem[] = req.lines.map((l, idx) => ({
    id: `clm-l-${Date.now()}-${idx}`,
    product_id: l.product_id,
    sku: l.sku,
    product_name: l.product_name,
    uom: l.uom,
    unit_price: l.unit_price,
    delivered_qty: l.delivered_qty,
    claimed_qty: l.claimed_qty,
    approved_qty: 0,
    total_line_claim: Math.round(l.claimed_qty * l.unit_price * 1.05), // Incl 5% GST
    reason: l.reason,
    photos: l.photos || [],
  }));

  const totalClaimed = claimLines.reduce((sum, l) => sum + l.total_line_claim, 0);
  const claimNo = `CLM-2609-${String(MOCK_CLAIMS.length + 10).padStart(4, "0")}`;

  const newClaim: Claim = {
    id: `clm-${Date.now()}`,
    claim_no: claimNo,
    order_id: order?.id || orderId,
    order_number: order?.order_number || "PO-MH-2609-0150",
    invoice_number: `INV-2609-0001${String(MOCK_CLAIMS.length + 5).padStart(2, "0")}`,
    raised_by: order?.buyer_id || "p-002",
    buyer_name: order?.buyer_name || "Kisan Seva Krishi Kendra",
    buyer_tier: order?.buyer_tier || "distributor",
    seller_id: order?.seller_id || "p-001",
    seller_name: order?.seller_name || "Maharashtra Agro Hub Pvt Ltd",
    type: req.type,
    status: "OPEN",
    physical_return: !!req.physical_return,
    total_claimed_amount: totalClaimed,
    total_approved_amount: 0,
    lines: claimLines,
    delivered_at: deliveredAt,
    sla_deadline: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    is_escalated: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  MOCK_CLAIMS.unshift(newClaim);
  return newClaim;
}

export function decideClaimMock(
  claimId: string,
  req: DecideClaimRequest,
): Claim {
  const claim = MOCK_CLAIMS.find((c) => c.id === claimId || c.claim_no === claimId);
  if (!claim) {
    throw new Error(`Claim '${claimId}' not found`);
  }

  if (claim.status === "CLOSED" || claim.status === "APPROVED") {
    throw new Error(`Claim is already finalized as ${claim.status}`);
  }

  claim.decided_by = "Operations Manager";
  claim.decided_at = new Date().toISOString();
  claim.decision_note = req.note;
  claim.updated_at = new Date().toISOString();

  if (req.action === "REJECT") {
    claim.status = "REJECTED";
    return claim;
  }

  // Handle APPROVE or PARTIAL_APPROVE
  const resolution = req.resolution || "CREDIT_NOTE";
  claim.resolution = resolution;

  let approvedAmount = 0;
  claim.lines.forEach((l) => {
    const matchingApproval = req.approved_lines?.find((al) => al.line_id === l.id);
    const approvedQty = matchingApproval ? matchingApproval.approved_qty : l.claimed_qty;
    l.approved_qty = approvedQty;
    approvedAmount += Math.round(approvedQty * l.unit_price * 1.05);
  });

  claim.total_approved_amount = approvedAmount;
  claim.status = req.action === "PARTIAL_APPROVE" ? "PARTIALLY_APPROVED" : "APPROVED";

  // Rule RC-03: If CREDIT_NOTE -> Post ledger credit (M11) and update buyer debt
  if (resolution === "CREDIT_NOTE" && approvedAmount > 0) {
    const cnNumber = `CN-2609-${String(Date.now()).slice(-4)}`;
    claim.credit_note_number = cnNumber;

    const creditAccount = MOCK_CREDIT_ACCOUNTS.find(
      (c) => c.buyer_id === claim.raised_by,
    );

    if (creditAccount) {
      creditAccount.outstanding = Math.max(0, creditAccount.outstanding - approvedAmount);
      creditAccount.available_credit = Math.max(
        0,
        creditAccount.credit_limit - creditAccount.outstanding,
      );
      creditAccount.updated_at = new Date().toISOString();

      // Append Cr (Credit) entry to ledger
      MOCK_LEDGER_ENTRIES.unshift({
        id: `ledg-cn-${Date.now()}`,
        credit_account_id: creditAccount.id,
        partner_id: claim.raised_by,
        partner_name: claim.buyer_name,
        counterparty_id: claim.seller_id,
        counterparty_name: claim.seller_name,
        entry_type: "CREDIT_NOTE",
        debit: 0,
        credit: approvedAmount,
        balance_after: creditAccount.outstanding,
        ref_type: "CREDIT_NOTE",
        ref_id: cnNumber,
        narration: `Credit Note issued for claim ${claim.claim_no} (${claim.type}) against PO ${claim.order_number}`,
        created_at: new Date().toISOString(),
      });
    }
  }

  // If REPLACEMENT -> Create zero-value replacement PO (M06)
  if (resolution === "REPLACEMENT") {
    const replNumber = `ORD-REPL-${String(Date.now()).slice(-4)}`;
    claim.replacement_order_number = replNumber;
  }

  // If physical return expected -> Record return inward movement in inventory (M10)
  if (claim.physical_return && approvedAmount > 0) {
    claim.lines.forEach((l) => {
      const invItem = MOCK_INVENTORY.find((i) => i.product_id === l.product_id);
      if (invItem && l.approved_qty > 0) {
        invItem.on_hand += l.approved_qty;
        invItem.available = Math.max(0, invItem.on_hand - invItem.reserved);

        MOCK_STOCK_MOVEMENTS.unshift({
          id: `mov-ret-${Date.now()}`,
          partner_id: claim.seller_id,
          partner_name: claim.seller_name,
          product_id: l.product_id,
          sku: l.sku,
          product_name: l.product_name,
          type: "RETURN_IN",
          qty: l.approved_qty,
          on_hand_after: invItem.on_hand,
          reserved_after: invItem.reserved,
          ref_type: "CLAIM",
          ref_id: claim.claim_no,
          reason: `Physical goods returned from customer under claim ${claim.claim_no}`,
          performed_by: "Warehouse Inward Clerk",
          created_at: new Date().toISOString(),
        });
      }
    });
  }

  return claim;
}

export function escalateClaimMock(
  claimId: string,
  req: EscalateClaimRequest,
): Claim {
  const claim = MOCK_CLAIMS.find((c) => c.id === claimId || c.claim_no === claimId);
  if (!claim) {
    throw new Error(`Claim '${claimId}' not found`);
  }

  claim.is_escalated = true;
  claim.status = "ESCALATED";
  claim.escalation_reason = req.reason;
  claim.updated_at = new Date().toISOString();

  return claim;
}

export function adminResolveClaimMock(
  claimId: string,
  req: AdminResolveClaimRequest,
): Claim {
  const claim = MOCK_CLAIMS.find((c) => c.id === claimId || c.claim_no === claimId);
  if (!claim) {
    throw new Error(`Claim '${claimId}' not found`);
  }

  claim.decided_by = "Agribid Central QA & Compliance Admin";
  claim.decided_at = new Date().toISOString();
  claim.decision_note = `Admin Arbitration: ${req.note}`;
  claim.is_escalated = false;
  claim.updated_at = new Date().toISOString();

  if (req.action === "OVERRULE_REJECT") {
    claim.status = "REJECTED";
    return claim;
  }

  // Issue credit note
  const resolution = req.resolution || "CREDIT_NOTE";
  claim.resolution = resolution;
  claim.status = "APPROVED";
  claim.total_approved_amount = claim.total_claimed_amount;

  claim.lines.forEach((l) => {
    l.approved_qty = l.claimed_qty;
  });

  const cnNumber = `CN-ADMIN-${String(Date.now()).slice(-4)}`;
  claim.credit_note_number = cnNumber;

  const creditAccount = MOCK_CREDIT_ACCOUNTS.find(
    (c) => c.buyer_id === claim.raised_by,
  );

  if (creditAccount) {
    creditAccount.outstanding = Math.max(0, creditAccount.outstanding - claim.total_approved_amount);
    creditAccount.available_credit = Math.max(
      0,
      creditAccount.credit_limit - creditAccount.outstanding,
    );

    MOCK_LEDGER_ENTRIES.unshift({
      id: `ledg-admin-cn-${Date.now()}`,
      credit_account_id: creditAccount.id,
      partner_id: claim.raised_by,
      partner_name: claim.buyer_name,
      counterparty_id: claim.seller_id,
      counterparty_name: claim.seller_name,
      entry_type: "CREDIT_NOTE",
      debit: 0,
      credit: claim.total_approved_amount,
      balance_after: creditAccount.outstanding,
      ref_type: "CREDIT_NOTE",
      ref_id: cnNumber,
      narration: `Admin Arbitration Credit Note for ${claim.claim_no}: ${req.note}`,
      created_at: new Date().toISOString(),
    });
  }

  return claim;
}
