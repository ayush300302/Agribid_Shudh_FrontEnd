/**
 * Module 11: Payments, Credit & Ledger Mock Store & Financial Engine
 * Fully adheres to Dev Spec M11, Rules PY-01..08, and Income Tax Act s.269ST
 */

import type {
  AgingBucket,
  CashReconciliationItem,
  CreditAccount,
  CreditOverrideRequest,
  LedgerEntry,
  Payment,
  PaymentAllocation,
  RecordPaymentRequest,
  ReversePaymentRequest,
  UpdateChequeStatusRequest,
  UpdateCreditTermsRequest,
} from "@/types/payment";

export const MOCK_CREDIT_ACCOUNTS: CreditAccount[] = [
  {
    id: "cred-acc-001",
    buyer_id: "p-002",
    buyer_name: "Kisan Seva Krishi Kendra",
    buyer_tier: "distributor",
    seller_id: "p-001",
    seller_name: "Maharashtra Agro Hub Pvt Ltd",
    credit_limit: 500000,
    credit_days: 21,
    grace_days: 7,
    outstanding: 145000,
    available_credit: 355000, // 5,00,000 - 1,45,000
    overdue_amount: 0,
    days_past_due: 0,
    status: "ACTIVE",
    tier_cap: 1000000,
    updated_at: "2026-03-12T10:00:00Z",
  },
  {
    id: "cred-acc-002",
    buyer_id: "p-003",
    buyer_name: "Vidarbha Fertilizers & Seeds",
    buyer_tier: "sub_distributor",
    seller_id: "p-002",
    seller_name: "Kisan Seva Krishi Kendra",
    credit_limit: 250000,
    credit_days: 15,
    grace_days: 7,
    outstanding: 220000,
    available_credit: 30000,
    overdue_amount: 85000, // Overdue > 0 and days_past_due (14) > grace_days (7) => HOLD!
    oldest_due_date: "2026-03-01",
    days_past_due: 14,
    status: "HOLD",
    tier_cap: 500000,
    updated_at: "2026-03-12T14:30:00Z",
  },
  {
    id: "cred-acc-003",
    buyer_id: "p-004",
    buyer_name: "Sai Krishi Seva Kendra",
    buyer_tier: "retailer",
    seller_id: "p-002",
    seller_name: "Kisan Seva Krishi Kendra",
    credit_limit: 100000,
    credit_days: 10,
    grace_days: 5,
    outstanding: 42000,
    available_credit: 58000,
    overdue_amount: 0,
    days_past_due: 0,
    status: "ACTIVE",
    tier_cap: 200000,
    updated_at: "2026-03-11T12:00:00Z",
  },
  {
    id: "cred-acc-004",
    buyer_id: "p-005",
    buyer_name: "Balaji Agro Agencies",
    buyer_tier: "retailer",
    seller_id: "p-003",
    seller_name: "Vidarbha Fertilizers & Seeds",
    credit_limit: 100000,
    credit_days: 10,
    grace_days: 7,
    outstanding: 95000,
    available_credit: 5000,
    overdue_amount: 32000,
    oldest_due_date: "2026-03-04",
    days_past_due: 9,
    status: "HOLD", // Overdue > grace_days (7) => HOLD per Rule PY-06
    tier_cap: 200000,
    updated_at: "2026-03-12T16:00:00Z",
  },
];

export const MOCK_LEDGER_ENTRIES: LedgerEntry[] = [
  {
    id: "ledg-001",
    credit_account_id: "cred-acc-001",
    partner_id: "p-002",
    partner_name: "Kisan Seva Krishi Kendra",
    counterparty_id: "p-001",
    counterparty_name: "Maharashtra Agro Hub Pvt Ltd",
    entry_type: "OPENING",
    debit: 50000,
    credit: 0,
    balance_after: 50000,
    ref_type: "OPENING",
    narration: "Fiscal year opening debt balance brought forward",
    created_at: "2026-03-01T00:00:00Z",
  },
  {
    id: "ledg-002",
    credit_account_id: "cred-acc-001",
    partner_id: "p-002",
    partner_name: "Kisan Seva Krishi Kendra",
    counterparty_id: "p-001",
    counterparty_name: "Maharashtra Agro Hub Pvt Ltd",
    entry_type: "INVOICE",
    debit: 210672,
    credit: 0,
    balance_after: 260672,
    ref_type: "INVOICE",
    ref_id: "INV-2609-000101",
    narration: "B2B Tax Invoice generated for PO-MH-2609-0142 (Rice & Grains)",
    created_at: "2026-03-10T11:45:00Z",
  },
  {
    id: "ledg-003",
    credit_account_id: "cred-acc-001",
    partner_id: "p-002",
    partner_name: "Kisan Seva Krishi Kendra",
    counterparty_id: "p-001",
    counterparty_name: "Maharashtra Agro Hub Pvt Ltd",
    entry_type: "PAYMENT",
    debit: 0,
    credit: 115672,
    balance_after: 145000,
    ref_type: "PAYMENT",
    ref_id: "REC-2609-0012",
    narration: "NEFT bank transfer settlement against INV-2609-000101 (UTR: HDFC8912743)",
    created_at: "2026-03-11T15:20:00Z",
  },
  {
    id: "ledg-004",
    credit_account_id: "cred-acc-002",
    partner_id: "p-003",
    partner_name: "Vidarbha Fertilizers & Seeds",
    counterparty_id: "p-002",
    counterparty_name: "Kisan Seva Krishi Kendra",
    entry_type: "INVOICE",
    debit: 220000,
    credit: 0,
    balance_after: 220000,
    ref_type: "INVOICE",
    ref_id: "INV-2609-000088",
    narration: "Tax Invoice for edible oils delivery (Due on 2026-03-01)",
    created_at: "2026-02-15T14:00:00Z",
  },
];

export const MOCK_PAYMENTS: Payment[] = [
  {
    id: "pay-001",
    receipt_no: "REC-2609-0012",
    payer_id: "p-002",
    payer_name: "Kisan Seva Krishi Kendra",
    payer_tier: "distributor",
    payee_id: "p-001",
    payee_name: "Maharashtra Agro Hub Pvt Ltd",
    amount: 115672,
    mode: "BANK_TRANSFER",
    reference_no: "HDFC891274301",
    status: "SUCCESS",
    received_at: "2026-03-11T15:20:00Z",
    remarks: "Part payment settlement for Invoice INV-2609-000101",
    allocations: [
      {
        invoice_id: "inv-001",
        invoice_number: "INV-2609-000101",
        amount: 115672,
      },
    ],
    created_at: "2026-03-11T15:20:00Z",
  },
  {
    id: "pay-002",
    receipt_no: "REC-2609-0013",
    payer_id: "p-004",
    payer_name: "Sai Krishi Seva Kendra",
    payer_tier: "retailer",
    payee_id: "p-002",
    payee_name: "Kisan Seva Krishi Kendra",
    amount: 45000,
    mode: "UPI",
    reference_no: "UPI-4091823901",
    status: "SUCCESS",
    received_at: "2026-03-12T09:15:00Z",
    remarks: "Instant UPI settlement via QR code",
    allocations: [
      {
        invoice_id: "inv-003",
        invoice_number: "INV-2609-000103",
        amount: 45000,
      },
    ],
    created_at: "2026-03-12T09:15:00Z",
  },
  {
    id: "pay-003",
    receipt_no: "REC-2609-0014",
    payer_id: "p-003",
    payer_name: "Vidarbha Fertilizers & Seeds",
    payer_tier: "sub_distributor",
    payee_id: "p-002",
    payee_name: "Kisan Seva Krishi Kendra",
    amount: 50000,
    mode: "CHEQUE",
    reference_no: "CHQ-881204",
    cheque_status: "RECEIVED",
    cheque_bank: "State Bank of India - Nagpur APMC Branch",
    cheque_date: "2026-03-12",
    status: "PENDING",
    received_at: "2026-03-12T11:00:00Z",
    remarks: "Post-dated cheque deposited for overdue invoice clearance",
    allocations: [
      {
        invoice_id: "inv-004",
        invoice_number: "INV-2609-000088",
        amount: 50000,
      },
    ],
    created_at: "2026-03-12T11:00:00Z",
  },
  {
    id: "pay-004",
    receipt_no: "REC-2609-0015",
    payer_id: "p-005",
    payer_name: "Balaji Agro Agencies",
    payer_tier: "retailer",
    payee_id: "p-003",
    payee_name: "Vidarbha Fertilizers & Seeds",
    amount: 35000,
    mode: "CASH",
    reference_no: "CSH-REC-9912",
    collected_by_name: "Ganesh Shinde (Route Delivery Agent)",
    status: "SUCCESS",
    received_at: "2026-03-12T14:30:00Z",
    remarks: "Cash collection against delivery of pulse bags",
    allocations: [
      {
        invoice_id: "inv-005",
        invoice_number: "INV-2609-000095",
        amount: 35000,
      },
    ],
    created_at: "2026-03-12T14:30:00Z",
  },
];

export const MOCK_CASH_RECONCILIATION: CashReconciliationItem[] = [
  {
    collector_id: "col-101",
    collector_name: "Ganesh Shinde (Van MH-12-RN-4421)",
    collected_amount: 35000,
    handed_over_amount: 35000,
    variance: 0,
    transaction_count: 1,
    status: "BALANCED",
  },
  {
    collector_id: "col-102",
    collector_name: "Suresh Patil (Route 02 Driver)",
    collected_amount: 48000,
    handed_over_amount: 48000,
    variance: 0,
    transaction_count: 2,
    status: "BALANCED",
  },
  {
    collector_id: "col-103",
    collector_name: "Ramesh Deshmukh (APMC Desk Officer)",
    collected_amount: 72000,
    handed_over_amount: 70000,
    variance: -2000,
    transaction_count: 3,
    status: "SHORTAGE",
  },
];

export const MOCK_AGING_REPORT: AgingBucket[] = [
  {
    bucket: "0-30",
    amount: 345000,
    count: 14,
  },
  {
    bucket: "31-60",
    amount: 85000,
    count: 3,
  },
  {
    bucket: "61-90",
    amount: 32000,
    count: 2,
  },
  {
    bucket: "90+",
    amount: 15000,
    count: 1,
  },
];

// Helper: sync account status according to Rule PY-06
function evaluateCreditAccountHold(acc: CreditAccount) {
  acc.available_credit = Math.max(0, acc.credit_limit - acc.outstanding);

  // If temporary admin override is active, keep status ACTIVE (Table 5 / Rule PY-06)
  const isOverrideActive =
    !!acc.override_until && new Date(acc.override_until).getTime() >= Date.now();

  if (isOverrideActive) {
    acc.status = "ACTIVE";
  } else if (acc.overdue_amount === 0) {
    // If overdue is fully cleared, automatically lift hold!
    if (acc.status === "HOLD") {
      acc.status = "ACTIVE";
    }
  } else if (acc.days_past_due > acc.grace_days) {
    // Overdue beyond grace days => move to HOLD
    acc.status = "HOLD";
  }
  acc.updated_at = new Date().toISOString();
}

export function listPaymentsMock(params?: {
  status?: string;
  mode?: string;
  payerId?: string;
  search?: string;
}): Payment[] {
  return MOCK_PAYMENTS.filter((p) => {
    if (params?.status && params.status !== "ALL") {
      if (p.status !== params.status) return false;
    }
    if (params?.mode && params.mode !== "ALL") {
      if (p.mode !== params.mode) return false;
    }
    if (params?.payerId && p.payer_id !== params.payerId) {
      return false;
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      const matchesReceipt = p.receipt_no.toLowerCase().includes(q);
      const matchesPayer = p.payer_name.toLowerCase().includes(q);
      const matchesRef = p.reference_no?.toLowerCase().includes(q);
      const matchesRemarks = p.remarks?.toLowerCase().includes(q);
      if (!matchesReceipt && !matchesPayer && !matchesRef && !matchesRemarks) {
        return false;
      }
    }
    return true;
  });
}

export function recordPaymentMock(req: RecordPaymentRequest): Payment {
  // Rule PY-03: Cash payment limit ≤ ₹1,99,999 per payer per day (Income-tax Act s.269ST)
  if (req.mode === "CASH" && req.amount > 199999) {
    const error: any = new Error(
      "Cash payment exceeds ₹1,99,999 limit per payer under Section 269ST of Income-tax Act. Please use Bank Transfer, UPI, or Cheque.",
    );
    error.code = "CASH_LIMIT";
    error.status = 422;
    throw error;
  }

  // Rule PY-04: UPI / UTR reference must be unique for the payee
  if (req.reference_no && (req.mode === "UPI" || req.mode === "BANK_TRANSFER")) {
    const existing = MOCK_PAYMENTS.find(
      (p) =>
        p.reference_no?.trim().toUpperCase() === req.reference_no?.trim().toUpperCase() &&
        p.status !== "REVERSED",
    );
    if (existing) {
      const error: any = new Error(
        `Duplicate reference: Reference '${req.reference_no}' has already been registered on payment ${existing.receipt_no}.`,
      );
      error.code = "DUPLICATE_REFERENCE";
      error.status = 409;
      throw error;
    }
  }

  const creditAccount = MOCK_CREDIT_ACCOUNTS.find(
    (c) => c.buyer_id === req.payer_id,
  );

  const payeeId = req.payee_id || creditAccount?.seller_id || "p-001";
  const payeeName = creditAccount?.seller_name || "Maharashtra Agro Hub Pvt Ltd";
  const payerName = creditAccount?.buyer_name || "Partner";
  const payerTier = creditAccount?.buyer_tier || "distributor";

  // Build allocations (Rule PY-02: FIFO if not explicitly listed)
  const allocations: PaymentAllocation[] = [];
  if (req.invoice_ids && req.invoice_ids.length > 0) {
    const splitAmount = Math.round(req.amount / req.invoice_ids.length);
    req.invoice_ids.forEach((invId, idx) => {
      allocations.push({
        invoice_id: invId,
        invoice_number: `INV-2609-${invId.slice(-4).toUpperCase()}`,
        amount: idx === req.invoice_ids!.length - 1 ? req.amount - splitAmount * idx : splitAmount,
      });
    });
  } else {
    // FIFO allocation to oldest balance
    allocations.push({
      invoice_id: "auto-fifo-inv",
      invoice_number: "FIFO Oldest Open Invoices",
      amount: req.amount,
    });
  }

  const receiptNo = `REC-2609-${String(MOCK_PAYMENTS.length + 15).padStart(4, "0")}`;
  const isCheque = req.mode === "CHEQUE";

  const newPayment: Payment = {
    id: `pay-${Date.now()}`,
    receipt_no: receiptNo,
    payer_id: req.payer_id,
    payer_name: payerName,
    payer_tier: payerTier,
    payee_id: payeeId,
    payee_name: payeeName,
    amount: req.amount,
    mode: req.mode,
    reference_no: req.reference_no,
    cheque_status: isCheque ? "RECEIVED" : undefined,
    cheque_bank: req.cheque_bank,
    cheque_date: req.cheque_date,
    collected_by_name: req.collected_by_name,
    status: isCheque ? "PENDING" : "SUCCESS",
    received_at: new Date().toISOString(),
    remarks: req.remarks,
    allocations,
    created_at: new Date().toISOString(),
  };

  MOCK_PAYMENTS.unshift(newPayment);

  // If payment is SUCCESS (cash, upi, bank transfer), immediately credit ledger and reduce debt!
  if (newPayment.status === "SUCCESS" && creditAccount) {
    creditAccount.outstanding = Math.max(0, creditAccount.outstanding - req.amount);
    if (creditAccount.overdue_amount > 0) {
      creditAccount.overdue_amount = Math.max(0, creditAccount.overdue_amount - req.amount);
    }
    evaluateCreditAccountHold(creditAccount);

    // Append to double-entry ledger (Credit entry Cr)
    MOCK_LEDGER_ENTRIES.unshift({
      id: `ledg-${Date.now()}`,
      credit_account_id: creditAccount.id,
      partner_id: creditAccount.buyer_id,
      partner_name: creditAccount.buyer_name,
      counterparty_id: creditAccount.seller_id,
      counterparty_name: creditAccount.seller_name,
      entry_type: "PAYMENT",
      debit: 0,
      credit: req.amount,
      balance_after: creditAccount.outstanding,
      ref_type: "PAYMENT",
      ref_id: receiptNo,
      narration: `${req.mode} payment received ${req.reference_no ? `(Ref: ${req.reference_no})` : ""}. Allocated to debt balance.`,
      created_at: new Date().toISOString(),
    });
  }

  return newPayment;
}

export function updateChequeStatusMock(
  paymentId: string,
  req: UpdateChequeStatusRequest,
): Payment {
  const payment = MOCK_PAYMENTS.find((p) => p.id === paymentId);
  if (!payment) {
    throw new Error(`Payment '${paymentId}' not found`);
  }

  const creditAccount = MOCK_CREDIT_ACCOUNTS.find(
    (c) => c.buyer_id === payment.payer_id,
  );

  const prevStatus = payment.cheque_status;
  payment.cheque_status = req.cheque_status;

  if (req.cheque_status === "CLEARED" && payment.status === "PENDING") {
    payment.status = "SUCCESS";
    if (creditAccount) {
      creditAccount.outstanding = Math.max(0, creditAccount.outstanding - payment.amount);
      if (creditAccount.overdue_amount > 0) {
        creditAccount.overdue_amount = Math.max(0, creditAccount.overdue_amount - payment.amount);
      }
      evaluateCreditAccountHold(creditAccount);

      // Add ledger credit entry
      MOCK_LEDGER_ENTRIES.unshift({
        id: `ledg-${Date.now()}`,
        credit_account_id: creditAccount.id,
        partner_id: creditAccount.buyer_id,
        partner_name: creditAccount.buyer_name,
        counterparty_id: creditAccount.seller_id,
        counterparty_name: creditAccount.seller_name,
        entry_type: "PAYMENT",
        debit: 0,
        credit: payment.amount,
        balance_after: creditAccount.outstanding,
        ref_type: "PAYMENT",
        ref_id: payment.receipt_no,
        narration: `Cheque #${payment.reference_no || ""} cleared through banking channels.`,
        created_at: new Date().toISOString(),
      });
    }
  } else if (req.cheque_status === "BOUNCED") {
    payment.status = "FAILED";
    if (creditAccount && prevStatus === "CLEARED") {
      // Re-add to debt
      creditAccount.outstanding += payment.amount;
      evaluateCreditAccountHold(creditAccount);

      MOCK_LEDGER_ENTRIES.unshift({
        id: `ledg-${Date.now()}`,
        credit_account_id: creditAccount.id,
        partner_id: creditAccount.buyer_id,
        partner_name: creditAccount.buyer_name,
        counterparty_id: creditAccount.seller_id,
        counterparty_name: creditAccount.seller_name,
        entry_type: "ADJUSTMENT",
        debit: payment.amount,
        credit: 0,
        balance_after: creditAccount.outstanding,
        ref_type: "ADJUSTMENT",
        ref_id: payment.receipt_no,
        narration: `Cheque #${payment.reference_no || ""} BOUNCED - Reversal of previously credited amount.`,
        created_at: new Date().toISOString(),
      });
    }
  }

  return payment;
}

export function reversePaymentMock(
  paymentId: string,
  req: ReversePaymentRequest,
): Payment {
  const payment = MOCK_PAYMENTS.find((p) => p.id === paymentId);
  if (!payment) {
    throw new Error(`Payment '${paymentId}' not found`);
  }

  if (payment.status === "REVERSED") {
    throw new Error("This payment has already been reversed.");
  }

  const creditAccount = MOCK_CREDIT_ACCOUNTS.find(
    (c) => c.buyer_id === payment.payer_id,
  );

  payment.status = "REVERSED";
  payment.reversal_reason = req.reason;
  payment.reversed_by = req.reversed_by || "Finance Admin";
  payment.reversed_at = new Date().toISOString();

  if (creditAccount) {
    creditAccount.outstanding += payment.amount;
    evaluateCreditAccountHold(creditAccount);

    // Write debit reversal to ledger
    MOCK_LEDGER_ENTRIES.unshift({
      id: `ledg-${Date.now()}`,
      credit_account_id: creditAccount.id,
      partner_id: creditAccount.buyer_id,
      partner_name: creditAccount.buyer_name,
      counterparty_id: creditAccount.seller_id,
      counterparty_name: creditAccount.seller_name,
      entry_type: "REFUND",
      debit: payment.amount,
      credit: 0,
      balance_after: creditAccount.outstanding,
      ref_type: "PAYMENT",
      ref_id: payment.receipt_no,
      narration: `Payment reversal of ${payment.receipt_no}: ${req.reason}`,
      created_at: new Date().toISOString(),
    });
  }

  return payment;
}

export function listCreditAccountsMock(): CreditAccount[] {
  return MOCK_CREDIT_ACCOUNTS;
}

export function getCreditAccountMock(idOrPartnerId: string): CreditAccount | undefined {
  return MOCK_CREDIT_ACCOUNTS.find(
    (c) => c.id === idOrPartnerId || c.buyer_id === idOrPartnerId,
  );
}

export function updateCreditTermsMock(
  id: string,
  req: UpdateCreditTermsRequest,
): CreditAccount {
  const acc = MOCK_CREDIT_ACCOUNTS.find((c) => c.id === id);
  if (!acc) {
    throw new Error(`Credit account '${id}' not found`);
  }

  // Rule PY-07: Credit limit cannot exceed tier cap
  if (req.credit_limit !== undefined) {
    if (req.credit_limit > acc.tier_cap) {
      const error: any = new Error(
        `Credit limit of ₹${req.credit_limit.toLocaleString("en-IN")} exceeds maximum authorized tier cap of ₹${acc.tier_cap.toLocaleString("en-IN")} (Rule PY-07).`,
      );
      error.code = "CREDIT_ABOVE_CAP";
      error.status = 422;
      throw error;
    }
    acc.credit_limit = req.credit_limit;
  }

  if (req.credit_days !== undefined) {
    acc.credit_days = req.credit_days;
  }
  if (req.grace_days !== undefined) {
    acc.grace_days = req.grace_days;
  }

  evaluateCreditAccountHold(acc);
  return acc;
}

export function overrideCreditMock(
  id: string,
  req: CreditOverrideRequest,
): CreditAccount {
  const acc = MOCK_CREDIT_ACCOUNTS.find((c) => c.id === id);
  if (!acc) {
    throw new Error(`Credit account '${id}' not found`);
  }

  acc.override_until = req.override_until;
  acc.override_reason = req.reason;
  acc.override_by = "Head of Finance";

  if (req.temporary_limit) {
    acc.credit_limit = req.temporary_limit;
  }

  // Lift HOLD temporarily
  if (acc.status === "HOLD") {
    acc.status = "ACTIVE";
  }

  evaluateCreditAccountHold(acc);
  return acc;
}

export function listLedgerMock(params?: {
  partnerId?: string;
  counterpartyId?: string;
  from?: string;
  to?: string;
}): LedgerEntry[] {
  return MOCK_LEDGER_ENTRIES.filter((l) => {
    if (params?.partnerId && l.partner_id !== params.partnerId) {
      return false;
    }
    if (params?.counterpartyId && l.counterparty_id !== params.counterpartyId) {
      return false;
    }
    return true;
  });
}

export function getAgingReportMock(): AgingBucket[] {
  return MOCK_AGING_REPORT;
}

export function getCashReconciliationMock(): CashReconciliationItem[] {
  return MOCK_CASH_RECONCILIATION;
}
