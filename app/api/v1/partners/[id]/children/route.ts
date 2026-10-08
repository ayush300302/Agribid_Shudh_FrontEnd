import { NextResponse } from "next/server";
import type { Partner } from "@/types/partner";

const mockChildren: Partner[] = [
  {
    id: "p-003",
    code: "AGB-SD-MH-204",
    type: "sub_distributor",
    business_name: "Vidarbha Fertilizers & Seeds",
    trade_name: "Vidarbha Agri",
    parent_id: "p-002",
    parent_name: "Kisan Seva Krishi Kendra",
    gstin: "27AABCV9988C1Z9",
    status: "active",
    kyc_status: "approved",
    address: {
      line1: "Near APMC Market",
      city: "Nagpur",
      state: "Maharashtra",
      pincode: "440002",
    },
    created_at: "2026-03-01T09:15:00Z",
    updated_at: "2026-03-01T09:15:00Z",
  },
  {
    id: "p-004",
    code: "AGB-RT-MH-501",
    type: "retailer",
    business_name: "Shri Ganesh Krishi Dukan",
    trade_name: "Ganesh Agro",
    parent_id: "p-002",
    parent_name: "Kisan Seva Krishi Kendra",
    gstin: "27AALPS3344D1Z1",
    status: "active",
    kyc_status: "submitted",
    address: {
      line1: "Main Bazaar Ward 2",
      city: "Baramati",
      state: "Maharashtra",
      pincode: "413102",
    },
    created_at: "2026-03-12T14:40:00Z",
    updated_at: "2026-03-12T14:40:00Z",
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    data: mockChildren,
  });
}

