"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ReservationCountdown } from "@/components/reservation-countdown";
import { Package, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";

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
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-12 max-w-2xl">
      <button 
        onClick={() => router.push("/")}
        className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </button>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
        
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Checkout Reservation</h1>
            <p className="text-neutral-400 text-sm">Review your order and confirm within the time limit.</p>
          </div>
          
          {status === "PENDING" && (
            <div className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full border border-amber-500/20 text-sm font-medium">
              Pending Confirmation
            </div>
          )}
          {status === "CONFIRMED" && (
            <div className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full border border-green-500/20 text-sm font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Confirmed
            </div>
          )}
          {(status === "RELEASED" || status === "EXPIRED") && (
            <div className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full border border-red-500/20 text-sm font-medium flex items-center gap-1.5">
              <XCircle className="w-4 h-4" /> {status === "EXPIRED" ? "Expired" : "Cancelled"}
            </div>
          )}
        </div>

        <div className="bg-neutral-950/50 rounded-xl p-5 border border-neutral-800/50 mb-8">
          <div className="flex gap-4">
            <div className="w-16 h-16 bg-neutral-800 rounded-lg flex items-center justify-center">
              <Package className="w-8 h-8 text-neutral-500" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">Product ID: {reservation.productId}</h3>
              <p className="text-neutral-400 text-sm">Warehouse ID: {reservation.warehouseId}</p>
              <div className="mt-2 text-sm font-medium text-neutral-300">
                Quantity Reserved: <span className="text-white">{reservation.quantity}</span>
              </div>
            </div>
          </div>
        </div>

        {status === "PENDING" && (
          <div className="mb-8">
            <ReservationCountdown 
              expiresAt={reservation.expiresAt} 
              onExpire={() => setStatus("EXPIRED")} 
            />
          </div>
        )}

        {status === "PENDING" && (
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              className="flex-1 border-neutral-700 hover:bg-neutral-800 hover:text-white"
              onClick={handleCancel}
              disabled={isProcessing}
            >
              Cancel Order
            </Button>
            <Button 
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg"
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
