"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  KeyRound,
  MapPin,
  Navigation,
  Phone,
  QrCode,
  ShieldCheck,
  Truck,
  User,
  UserCheck,
} from "lucide-react";
import { completeDelivery, getTrackingInfo } from "@/lib/delivery-api";
import type { DeliveryTrackingInfo, PODMethod } from "@/types/delivery";

export default function PublicLiveTrackingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const queryClient = useQueryClient();

  // Handover state
  const [method, setMethod] = useState<PODMethod>("OTP");
  const [otpInput, setOtpInput] = useState("");
  const [receiverName, setReceiverName] = useState("Kailash Patil");
  const [receiverPhone, setReceiverPhone] = useState("+91 98220 99441");
  const [podSuccess, setPodSuccess] = useState(false);
  const [handoverError, setHandoverError] = useState<string | null>(null);

  const { data: trackingInfo, isLoading, error } = useQuery({
    queryKey: ["live-tracking", token],
    queryFn: () => getTrackingInfo(token),
  });

  const completeMutation = useMutation({
    mutationFn: () => {
      if (!trackingInfo) throw new Error("No tracking info");
      const targetOrderId = trackingInfo.shipment.order_ids[0];
      return completeDelivery({
        order_id: targetOrderId,
        method,
        otp: otpInput,
        receiver_name: receiverName,
        receiver_phone: receiverPhone,
        notes: "Mandi gate sign-off verified via secure OTP",
      });
    },
    onSuccess: () => {
      setPodSuccess(true);
      setHandoverError(null);
      queryClient.invalidateQueries({ queryKey: ["live-tracking", token] });
    },
    onError: (err: any) => {
      setHandoverError(err.message || "Invalid OTP or delivery failure");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f1f5f1] flex items-center justify-center p-4">
        <div className="text-center text-xs text-[#64766a]">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#1b5e20] border-t-transparent" />
          <p className="mt-2 font-medium">Loading live shipment tracking...</p>
        </div>
      </div>
    );
  }

  if (!trackingInfo) {
    return (
      <div className="min-h-screen bg-[#f1f5f1] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-xl border border-red-200 bg-white p-8 text-center shadow-xs">
          <AlertCircle size={32} className="mx-auto text-red-600" />
          <h2 className="mt-2 text-base font-bold text-[#19392a]">Tracking Link Expired or Invalid</h2>
          <p className="mt-1 text-xs text-[#64766a]">
            Tracking tokens expire 7 days after delivery as per Rule DL-05.
          </p>
        </div>
      </div>
    );
  }

  const { shipment, timeline, active_delivery_otp } = trackingInfo;
  const isDelivered = shipment.status === "COMPLETED" || podSuccess;

  return (
    <div className="min-h-screen bg-[#f1f5f1] text-[#19392a]">
      {/* Top Tracking Header */}
      <header className="border-b border-[#dce5dd] bg-white sticky top-0 z-10 shadow-xs">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-[#1b5e20] text-xs font-bold text-white">
              AS
            </span>
            <div>
              <span className="block text-xs font-bold text-[#19392a]">Agribid Shudh Live Tracking</span>
              <span className="block text-[10px] text-[#64766a] font-mono">{shipment.shipment_number}</span>
            </div>
          </div>

          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
              isDelivered
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-800 animate-pulse"
            }`}
          >
            {isDelivered ? "DELIVERED" : shipment.status.replace("_", " ")}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl p-4 sm:p-6 space-y-6">
        {/* Route Overview Card */}
        <div className="rounded-xl border border-[#dce5dd] bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation size={18} className="text-[#1b5e20]" />
              <h2 className="text-sm font-bold text-[#19392a]">
                Route: {shipment.destination_summary}
              </h2>
            </div>
            <span className="text-xs font-semibold text-[#87958b]">
              ETA: {shipment.eta}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs rounded-lg bg-[#f8faf8] p-3 border border-[#eef2ef]">
            <div>
              <span className="text-[#87958b]">Origin Godown:</span>
              <p className="font-semibold text-[#19392a]">{shipment.pickup_location}</p>
            </div>
            <div>
              <span className="text-[#87958b]">Carrier / Fleet:</span>
              <p className="font-semibold text-[#19392a]">
                {shipment.delivery_partner?.name || shipment.transporter_name} ({shipment.delivery_partner?.vehicle_no})
              </p>
            </div>
          </div>
        </div>

        {/* Live Timeline Stepper */}
        <div className="rounded-xl border border-[#dce5dd] bg-white p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-[#87958b] uppercase tracking-wider">
            Consignment Journey
          </h3>

          <div className="space-y-4 pl-2">
            {timeline.map((step, idx) => {
              const done = isDelivered ? true : step.completed;
              return (
                <div key={idx} className="flex items-start gap-3 relative">
                  <div className="flex flex-col items-center">
                    <div
                      className={`size-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        done
                          ? "bg-[#1b5e20] text-white"
                          : "bg-gray-200 text-[#64766a]"
                      }`}
                    >
                      {done ? <CheckCircle2 size={14} /> : idx + 1}
                    </div>
                    {idx < timeline.length - 1 && (
                      <div
                        className={`w-0.5 h-10 ${
                          done ? "bg-[#1b5e20]" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>

                  <div className="flex-1 text-xs pt-0.5">
                    <div className="flex justify-between items-baseline">
                      <p className="font-bold text-[#19392a]">{step.label}</p>
                      <span className="text-[10px] text-[#87958b]">{step.timestamp}</span>
                    </div>
                    {step.note && (
                      <p className="text-[11px] text-[#64766a] mt-0.5">{step.note}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Driver Proof of Delivery Handover Card (Rule DL-03) */}
        {!isDelivered ? (
          <div className="rounded-xl border-2 border-[#1b5e20]/40 bg-white p-5 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-[#eef2ef] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-[#1b5e20]" />
                <h3 className="text-sm font-bold text-[#19392a]">
                  Mandi Delivery Handover & Verification
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Rule DL-03 OTP Gate
              </span>
            </div>

            {handoverError && (
              <div className="rounded-lg bg-red-50 p-3 text-xs text-red-800 border border-red-200 flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0 text-red-600" />
                <span>{handoverError}</span>
              </div>
            )}

            {/* Test Helper Banner for OTP */}
            {active_delivery_otp && (
              <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-900 border border-blue-200 flex items-center justify-between">
                <div>
                  <span className="font-bold">Simulated Buyer OTP:</span> Sent to registered store mobile
                </div>
                <span className="font-mono text-base font-extrabold text-blue-800 tracking-widest bg-white px-2.5 py-0.5 rounded border border-blue-300">
                  {active_delivery_otp}
                </span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#3b4c40] mb-1">
                    Store Receiver Name *
                  </label>
                  <input
                    type="text"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    className="w-full rounded-md border border-[#cbd8ce] bg-white px-3 py-2 text-xs text-[#19392a] outline-none focus:border-[#1b5e20]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#3b4c40] mb-1">
                    Receiver Phone Number *
                  </label>
                  <input
                    type="text"
                    value={receiverPhone}
                    onChange={(e) => setReceiverPhone(e.target.value)}
                    className="w-full rounded-md border border-[#cbd8ce] bg-white px-3 py-2 text-xs text-[#19392a] outline-none focus:border-[#1b5e20]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#3b4c40] mb-1">
                  Enter 4-Digit Buyer Delivery OTP *
                </label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#87958b]" />
                  <input
                    type="text"
                    maxLength={4}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="e.g. 4829"
                    className="w-full rounded-md border border-[#cbd8ce] bg-white pl-9 pr-3 py-2.5 text-base font-mono font-bold tracking-widest text-[#19392a] outline-none focus:border-[#1b5e20]"
                  />
                </div>
                <p className="text-[11px] text-[#87958b] mt-1">
                  The partner has received this 4-digit verification code via SMS.
                </p>
              </div>

              <button
                type="button"
                onClick={() => completeMutation.mutate()}
                disabled={completeMutation.isPending || otpInput.length < 4}
                className="w-full mt-2 rounded-md bg-[#1b5e20] py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#154a19] disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
              >
                {completeMutation.isPending ? "Verifying OTP..." : "Verify OTP & Complete Delivery"}
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-6 text-center space-y-2 shadow-xs">
            <CheckCircle2 size={36} className="mx-auto text-emerald-700" />
            <h3 className="text-base font-bold text-emerald-950">
              Delivery Completed & Stock Transferred
            </h3>
            <p className="text-xs text-emerald-800">
              Proof of Delivery has been recorded. The buyer's godown inventory has been credited automatically.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
