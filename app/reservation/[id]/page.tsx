"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ReservationCountdown } from "@/components/reservation-countdown";
import { Package, CheckCircle2, XCircle, ArrowLeft, MapPin } from "lucide-react";

export default function ReservationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [reservation, setReservation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<"PENDING" | "CONFIRMED" | "RELEASED" | "EXPIRED">("PENDING");

  useEffect(() => {
    fetch(`/api/reservations/${id}`)
      .then(res => res.json())
      .then(data => {
        setReservation(data);
        if (data.status === "PENDING" && new Date(data.expiresAt) < new Date()) {
          setStatus("EXPIRED");
        } else {
          setStatus(data.status);
        }
        setIsLoading(false);
      });
  }, [id]);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/reservations/${id}/confirm`, { method: "POST" });
      if (res.ok) {
        setStatus("CONFIRMED");
        toast.success("Order Confirmed! Stock has been deducted permanently.");
      } else if (res.status === 410) {
        setStatus("EXPIRED");
        toast.error("Reservation expired.");
      } else {
        toast.error("Failed to confirm reservation.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/reservations/${id}/release`, { method: "POST" });
      if (res.ok) {
        setStatus("RELEASED");
        toast.info("Reservation cancelled. Stock released.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  const product = reservation?.product;
  const warehouse = reservation?.warehouse;
  const totalCost = (product?.price * reservation?.quantity).toFixed(2);

  return (
    <main className="container mx-auto px-4 py-12 max-w-3xl">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Go Back
      </button>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-cyan-500" />
        
        <div className="flex items-start justify-between mb-8 border-b border-neutral-800 pb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Checkout Reservation</h1>
            <p className="text-neutral-400 text-sm max-w-sm">Review your order details below. Stock is temporarily held for you.</p>
          </div>
          
          {status === "PENDING" && (
            <div className="bg-amber-500/10 text-amber-500 px-4 py-1.5 rounded-full border border-amber-500/20 text-sm font-bold tracking-wide">
              PENDING
            </div>
          )}
          {status === "CONFIRMED" && (
            <div className="bg-teal-500/10 text-teal-500 px-4 py-1.5 rounded-full border border-teal-500/20 text-sm font-bold tracking-wide flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> CONFIRMED
            </div>
          )}
          {(status === "RELEASED" || status === "EXPIRED") && (
            <div className="bg-red-500/10 text-red-500 px-4 py-1.5 rounded-full border border-red-500/20 text-sm font-bold tracking-wide flex items-center gap-1.5">
              <XCircle className="w-4 h-4" /> {status === "EXPIRED" ? "EXPIRED" : "CANCELLED"}
            </div>
          )}
        </div>

        {/* Enhanced Product Details */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {product?.imageUrl ? (
            <div className="w-full md:w-48 h-48 rounded-xl overflow-hidden bg-neutral-800 border border-neutral-700 flex-shrink-0">
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-full md:w-48 h-48 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center flex-shrink-0">
              <Package className="w-12 h-12 text-neutral-600" />
            </div>
          )}

          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{product?.name}</h2>
              <p className="text-neutral-400 text-sm mb-4 leading-relaxed">{product?.description}</p>
              
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                <div className="flex flex-col">
                  <span className="text-neutral-500 font-medium text-xs uppercase">SKU</span>
                  <span className="text-neutral-200 font-mono">{product?.sku}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-neutral-500 font-medium text-xs uppercase">Warehouse</span>
                  <span className="text-neutral-200 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-teal-500" /> {warehouse?.name}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-800/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-neutral-400">Qty:</span>
                <span className="text-xl font-bold text-white bg-neutral-800 px-3 py-1 rounded-md">{reservation.quantity}</span>
              </div>
              <div className="text-right">
                <div className="text-neutral-500 text-xs font-medium uppercase mb-0.5">Total Cost</div>
                <div className="text-3xl font-extrabold text-teal-400">${totalCost}</div>
              </div>
            </div>
          </div>
        </div>

        {status === "PENDING" && (
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 mb-8">
            <ReservationCountdown 
              expiresAt={reservation.expiresAt} 
              onExpire={() => setStatus("EXPIRED")} 
            />
          </div>
        )}

        {status === "PENDING" && (
          <div className="flex gap-4 pt-4 border-t border-neutral-800">
            <Button 
              variant="outline" 
              className="flex-1 border-neutral-700 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 transition-colors h-12 text-base font-medium"
              onClick={handleCancel}
              disabled={isProcessing}
            >
              Cancel Order
            </Button>
            <Button 
              className="flex-1 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white shadow-[0_0_20px_rgba(20,184,166,0.3)] h-12 text-base font-medium"
              onClick={handleConfirm}
              disabled={isProcessing}
            >
              Confirm Purchase
            </Button>
          </div>
        )}
      </motion.div>
    </main>
  );
}
