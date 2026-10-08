/**
 * Module 08: Invoicing & GST Compliance Mock Store & Engine
 * Matches Dev Spec M08 and Section 15 of PRD
 */

import { MOCK_ORDERS } from "@/lib/mock-orders";
import type {
  CreateCreditNoteRequest,
  CreditNote,
  GenerateEwayBillRequest,
  Invoice,
  InvoiceLine,
  InvoiceStatus,
  IRNStatus,
} from "@/types/invoice";

// Helper: Convert numbers to Indian Rupees words
export function numberToIndianWords(num: number): string {
  if (num === 0) return "Zero Rupees Only";
  const a = [
    "",
    "One ",
    "Two ",
    "Three ",
    "Four ",
    "Five ",
    "Six ",
    "Seven ",
    "Eight ",
    "Nine ",
    "Ten ",
    "Eleven ",
    "Twelve ",
    "Thirteen ",
    "Fourteen ",
    "Fifteen ",
    "Sixteen ",
    "Seventeen ",
    "Eighteen ",
    "Nineteen ",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function inWords(n: number): string {
    let str = "";
    if (n >= 10000000) {
      str += inWords(Math.floor(n / 10000000)) + "Crore ";
      n %= 10000000;
    }
    if (n >= 100000) {
      str += inWords(Math.floor(n / 100000)) + "Lakh ";
      n %= 100000;
    }
    if (n >= 1000) {
      str += inWords(Math.floor(n / 1000)) + "Thousand ";
      n %= 1000;
    }
    if (n >= 100) {
      str += inWords(Math.floor(n / 100)) + "Hundred ";
      n %= 100;
    }
    if (n > 0) {
      if (str !== "") str += "and ";
      if (n < 20) str += a[n];
      else str += b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : " ");
    }
    return str;
  }

  const rounded = Math.round(num);
  return (inWords(rounded).trim() + " Rupees Only").replace(/\s+/g, " ");
}

let nextInvoiceSeq = 103;
let nextCreditNoteSeq = 45;

export const MOCK_INVOICES: Invoice[] = [
  {
    id: "inv-001",
    invoice_number: "INV-MH-2627-00101",
    order_id: "ord-001",
    order_number: "ORD-2609-000101",
    seller_id: "p-001",
    seller_name: "Maharashtra Agro Hub Pvt Ltd",
    seller_trade_name: "MahaAgro Stockist Central",
    seller_gstin: "27AAACM1234A1Z5",
    seller_pan: "AAACM1234A",
    seller_state_code: "27",
    seller_address: {
      line1: "Plot 42, MIDC Bhosari",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411026",
      state_code: "27",
    },
    buyer_id: "p-002",
    buyer_name: "Kisan Seva Krishi Kendra",
    buyer_trade_name: "Kisan Seva APMC",
    buyer_gstin: "27AAPFK5678B1Z2",
    buyer_pan: "AAPFK5678B",
    buyer_state_code: "27",
    buyer_address: {
      line1: "Market Yard Shop #14",
      city: "Nashik",
      state: "Maharashtra",
      pincode: "422003",
      state_code: "27",
    },
    place_of_supply: "27 - Maharashtra",
    is_interstate: false,
    reverse_charge: false,
    invoice_date: "2026-03-10",
    due_date: "2026-03-25",
    subtotal: 209000,
    discount_total: 8360,
    taxable_amount: 200640,
    cgst_total: 5016,
    sgst_total: 5016,
    igst_total: 0,
    round_off: 0,
    grand_total: 210672,
    amount_in_words: "Two Lakh Ten Thousand Six Hundred and Seventy Two Rupees Only",
    irn: "3b29c9a41f874288b89e3a6c92e742881b4d812300b991475e7a9b0a1f49618c",
    ack_no: "122610098412",
    ack_date: "2026-03-10 11:45:00",
    signed_qr_code: "https://api.agribid.in/qr/inv-001.png",
    irn_status: "generated",
    eway_bill_number: "241009841235",
    eway_valid_upto: "2026-03-13 23:59:00",
    vehicle_number: "MH-12-RN-4421",
    transporter_name: "MahaAgro Logistics Fleet",
    status: "paid",
    notes: "Original for Recipient. Computer generated invoice.",
    created_at: "2026-03-10T11:45:00Z",
    lines: [
      {
        id: "inv-l-101",
        product_id: "prod-1",
        sku: "RICE-BAS-PRM-50KG",
        product_name: "Shudh Premium 1121 Basmati Rice",
        hsn_code: "10063020",
        quantity: 55,
        uom: "BAG",
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
  },
  {
    id: "inv-002",
    invoice_number: "INV-MH-2627-00102",
    order_id: "ord-002",
    order_number: "ORD-2609-000102",
    seller_id: "p-002",
    seller_name: "Kisan Seva Krishi Kendra",
    seller_trade_name: "Kisan Seva",
    seller_gstin: "27AAPFK5678B1Z2",
    seller_pan: "AAPFK5678B",
    seller_state_code: "27",
    seller_address: {
      line1: "Market Yard Shop #14",
      city: "Nashik",
      state: "Maharashtra",
      pincode: "422003",
      state_code: "27",
    },
    buyer_id: "p-003",
    buyer_name: "Vidarbha Fertilizers & Seeds",
    buyer_trade_name: "Vidarbha Agri",
    buyer_gstin: "27AABCV9988C1Z9",
    buyer_pan: "AABCV9988C",
    buyer_state_code: "27",
    buyer_address: {
      line1: "Station Road Near APMC",
      city: "Nagpur",
      state: "Maharashtra",
      pincode: "440002",
      state_code: "27",
    },
    place_of_supply: "27 - Maharashtra",
    is_interstate: false,
    reverse_charge: false,
    invoice_date: "2026-03-12",
    due_date: "2026-03-27",
    subtotal: 92000,
    discount_total: 4600,
    taxable_amount: 87400,
    cgst_total: 2185,
    sgst_total: 2185,
    igst_total: 0,
    round_off: 0,
    grand_total: 91770,
    amount_in_words: "Ninety One Thousand Seven Hundred and Seventy Rupees Only",
    irn: "7a19c9b42e774218c99e3a6c92e742881b4d812300b991475e7a9b0a1f49699f",
    ack_no: "122610098499",
    ack_date: "2026-03-12 14:15:00",
    signed_qr_code: "https://api.agribid.in/qr/inv-002.png",
    irn_status: "generated",
    eway_bill_number: "241009848811",
    eway_valid_upto: "2026-03-15 23:59:00",
    vehicle_number: "MH-31-CB-8899",
    transporter_name: "Nagpur Vidarbha Roadways",
    status: "issued",
    notes: "Goods in transit via tempo MH-31-CB-8899.",
    created_at: "2026-03-12T14:15:00Z",
    lines: [
      {
        id: "inv-l-201",
        product_id: "prod-3",
        sku: "OIL-SNF-TIN-15L",
        product_name: "Shudh Refined Sunflower Oil 15L Tin",
        hsn_code: "15121910",
        quantity: 50,
        uom: "TIN",
        unit_price: 1840,
        discount_amount: 4600,
        taxable_amount: 87400,
        tax_rate: 5,
        cgst_amount: 2185,
        sgst_amount: 2185,
        igst_amount: 0,
        line_total: 91770,
      },
    ],
  },
];

export const MOCK_CREDIT_NOTES: CreditNote[] = [
  {
    id: "cn-001",
    credit_note_number: "CN-MH-2627-00041",
    invoice_id: "inv-001",
    invoice_number: "INV-MH-2627-00101",
    order_number: "ORD-2609-000101",
    buyer_id: "p-002",
    buyer_name: "Kisan Seva Krishi Kendra",
    reason: "SCHEME",
    amount: 5000,
    tax_adjusted: 250,
    total_adjusted: 5250,
    note: "Volume incentive quarterly rebate credit under Scheme SCH-2609-VOL",
    status: "issued",
    created_at: "2026-03-15T10:00:00Z",
  },
];

export function listInvoicesMock(params?: {
  status?: string;
  irn_status?: string;
  search?: string;
}): Invoice[] {
  return MOCK_INVOICES.filter((inv) => {
    if (params?.status && params.status !== "all" && inv.status !== params.status) {
      return false;
    }
    if (
      params?.irn_status &&
      params.irn_status !== "all" &&
      inv.irn_status !== params.irn_status
    ) {
      return false;
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      const matchInv = inv.invoice_number.toLowerCase().includes(q);
      const matchOrd = inv.order_number.toLowerCase().includes(q);
      const matchBuyer = inv.buyer_name.toLowerCase().includes(q);
      const matchGstin = inv.buyer_gstin?.toLowerCase().includes(q) || false;
      return matchInv || matchOrd || matchBuyer || matchGstin;
    }
    return true;
  });
}

export function getInvoiceByIdMock(id: string): Invoice | null {
  return MOCK_INVOICES.find((i) => i.id === id || i.invoice_number === id) || null;
}

export function generateOrderInvoiceMock(orderId: string): Invoice {
  // Check if invoice already exists for this order (Rule: one invoice per order)
  const existing = MOCK_INVOICES.find((i) => i.order_id === orderId);
  if (existing) {
    return existing;
  }

  const order = MOCK_ORDERS.find((o) => o.id === orderId);
  if (!order) {
    throw new Error(`Order ${orderId} not found`);
  }

  const isInterstate = order.seller_tier !== order.buyer_tier && false; // By default intra-state MH-to-MH
  const invSeq = nextInvoiceSeq++;
  const invoiceNumber = `INV-MH-2627-${invSeq.toString().padStart(5, "0")}`;

  const lines: InvoiceLine[] = order.lines.map((l, idx) => {
    const qty = l.fulfilled_qty > 0 ? l.fulfilled_qty : l.ordered_qty;
    const taxable = l.unit_price * qty;
    const taxRate = l.tax_rate || 5;
    const tax = Math.round(taxable * (taxRate / 100) * 100) / 100;

    return {
      id: `inv-line-${Date.now()}-${idx}`,
      product_id: l.product_id,
      sku: l.sku,
      product_name: l.product_name,
      hsn_code: l.hsn_code,
      quantity: qty,
      uom: l.uom,
      unit_price: l.unit_price,
      discount_amount: l.discount_amount || 0,
      taxable_amount: taxable,
      tax_rate: taxRate,
      cgst_amount: isInterstate ? 0 : Math.round((tax / 2) * 100) / 100,
      sgst_amount: isInterstate ? 0 : Math.round((tax / 2) * 100) / 100,
      igst_amount: isInterstate ? tax : 0,
      line_total: taxable + tax,
    };
  });

  const taxableTotal = lines.reduce((acc, l) => acc + l.taxable_amount, 0);
  const cgstTotal = lines.reduce((acc, l) => acc + l.cgst_amount, 0);
  const sgstTotal = lines.reduce((acc, l) => acc + l.sgst_amount, 0);
  const igstTotal = lines.reduce((acc, l) => acc + l.igst_amount, 0);
  const grandTotal = Math.round((taxableTotal + cgstTotal + sgstTotal + igstTotal) * 100) / 100;

  // Generate 64-char IRN hash
  const sampleHex = Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("");

  const newInvoice: Invoice = {
    id: `inv-${Date.now()}`,
    invoice_number: invoiceNumber,
    order_id: order.id,
    order_number: order.order_number,
    seller_id: order.seller_id,
    seller_name: order.seller_name,
    seller_trade_name: order.seller_name,
    seller_gstin: "27AAACM1234A1Z5",
    seller_pan: "AAACM1234A",
    seller_state_code: "27",
    seller_address: {
      line1: "Plot 42, MIDC Bhosari Industrial Area",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411026",
      state_code: "27",
    },
    buyer_id: order.buyer_id,
    buyer_name: order.buyer_name,
    buyer_trade_name: order.buyer_name,
    buyer_gstin: order.buyer_code === "AGB-RT-MH-501" ? "27AALPS3344D1Z1" : "27AAPFK5678B1Z2",
    buyer_pan: "AAPFK5678B",
    buyer_state_code: "27",
    buyer_address: {
      line1: order.delivery_address?.line1 || "APMC Yard Shop",
      city: order.delivery_address?.city || "Nashik",
      state: order.delivery_address?.state || "Maharashtra",
      pincode: order.delivery_address?.pincode || "422003",
      state_code: "27",
    },
    place_of_supply: "27 - Maharashtra",
    is_interstate: isInterstate,
    reverse_charge: false,
    invoice_date: new Date().toISOString().split("T")[0],
    due_date: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
    subtotal: taxableTotal,
    discount_total: 0,
    taxable_amount: taxableTotal,
    cgst_total: cgstTotal,
    sgst_total: sgstTotal,
    igst_total: igstTotal,
    round_off: 0,
    grand_total: grandTotal,
    amount_in_words: numberToIndianWords(grandTotal),
    irn: sampleHex,
    ack_no: `${Date.now()}`.slice(-12),
    ack_date: new Date().toISOString().replace("T", " ").slice(0, 19),
    signed_qr_code: `https://api.agribid.in/qr/${invoiceNumber}.png`,
    irn_status: "generated",
    status: "issued",
    notes: "Tax Invoice generated automatically on PACKED stage.",
    created_at: new Date().toISOString(),
    lines,
  };

  MOCK_INVOICES.unshift(newInvoice);
  return newInvoice;
}

export function cancelInvoiceMock(invoiceId: string, reason: string): Invoice {
  const inv = MOCK_INVOICES.find((i) => i.id === invoiceId);
  if (!inv) throw new Error(`Invoice ${invoiceId} not found`);

  inv.status = "cancelled";
  inv.irn_status = "cancelled";
  inv.notes = `${inv.notes || ""}\n[CANCELLED]: ${reason}`.trim();
  return inv;
}

export function generateEwayBillMock(
  invoiceId: string,
  req: GenerateEwayBillRequest,
): Invoice {
  const inv = MOCK_INVOICES.find((i) => i.id === invoiceId);
  if (!inv) throw new Error(`Invoice ${invoiceId} not found`);

  const ewbNumber = `24${Math.floor(1000000000 + Math.random() * 9000000000)}`;
  inv.eway_bill_number = ewbNumber;
  inv.eway_valid_upto = new Date(Date.now() + 3 * 86400000).toISOString().replace("T", " ").slice(0, 19);
  inv.vehicle_number = req.vehicle_number;
  inv.transporter_name = req.transporter_name;

  return inv;
}

export function createCreditNoteMock(req: CreateCreditNoteRequest): CreditNote {
  const inv = MOCK_INVOICES.find((i) => i.id === req.invoice_id);
  if (!inv) throw new Error(`Invoice ${req.invoice_id} not found`);

  const cnSeq = nextCreditNoteSeq++;
  const cnNumber = `CN-MH-2627-${cnSeq.toString().padStart(5, "0")}`;

  const tax = Math.round(req.amount * 0.05 * 100) / 100;
  const newCN: CreditNote = {
    id: `cn-${Date.now()}`,
    credit_note_number: cnNumber,
    invoice_id: inv.id,
    invoice_number: inv.invoice_number,
    order_number: inv.order_number,
    buyer_id: inv.buyer_id,
    buyer_name: inv.buyer_name,
    reason: req.reason,
    amount: req.amount,
    tax_adjusted: tax,
    total_adjusted: req.amount + tax,
    note: req.note,
    status: "issued",
    created_at: new Date().toISOString(),
  };

  MOCK_CREDIT_NOTES.unshift(newCN);
  return newCN;
}

export function listCreditNotesMock(invoiceId?: string): CreditNote[] {
  if (invoiceId) {
    return MOCK_CREDIT_NOTES.filter((cn) => cn.invoice_id === invoiceId);
  }
  return MOCK_CREDIT_NOTES;
}

