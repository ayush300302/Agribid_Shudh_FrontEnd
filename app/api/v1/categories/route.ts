import { NextResponse } from "next/server";
import type { Category } from "@/types/catalog";

const MOCK_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Rice & Grains", slug: "rice-grains", level: 1 },
  { id: "cat-2", name: "Edible Oils", slug: "edible-oils", level: 1 },
  { id: "cat-3", name: "Pulses & Dals", slug: "pulses-dals", level: 1 },
  { id: "cat-4", name: "Sugar & Sweeteners", slug: "sugar-sweeteners", level: 1 },
  { id: "cat-5", name: "Fertilizers & Agri Inputs", slug: "fertilizers-inputs", level: 1 },
  { id: "cat-6", name: "Spices & Condiments", slug: "spices", level: 1 },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    data: MOCK_CATEGORIES,
  });
}

