"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, MapPin, Loader2 } from "lucide-react";

export function ProductCard({ product, onReserveSuccess }: { product: any, onReserveSuccess: () => void }) {
  const router = useRouter();
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>(product.inventories[0]?.warehouseId);
  const [quantity, setQuantity] = useState<number>(1);
  const [isReserving, setIsReserving] = useState(false);

  const selectedInventory = product.inventories.find((inv: any) => inv.warehouseId === selectedWarehouse);
  const availableUnits = selectedInventory ? selectedInventory.availableUnits : 0;

  const handleReserve = async () => {
    if (!selectedWarehouse) return;
    
    setIsReserving(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          warehouseId: selectedWarehouse,
          quantity
        })
      });

      if (!res.ok) {
        if (res.status === 409) {
          toast.error("Not enough stock available (Concurrency conflict)");
        } else {
          toast.error("Failed to reserve stock.");
        }
        return;
      }

      const reservation = await res.json();
      toast.success("Stock reserved successfully!");
      onReserveSuccess();
      router.push(`/reservation/${reservation.id}`);
    } catch (error) {
      toast.error("Network error while reserving.");
    } finally {
      setIsReserving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col bg-neutral-900/60 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm transition-all hover:border-neutral-700"
    >
      {/* Product Image Header */}
      <div className="h-48 w-full bg-neutral-800 relative group overflow-hidden">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <Package className="w-12 h-12 text-neutral-600" />
          </div>
        )}
        <div className="absolute top-4 right-4">
          <Badge variant="outline" className="bg-neutral-900/80 backdrop-blur-md border-neutral-700 text-white font-mono shadow-xl">
            {product.sku}
          </Badge>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
        <p className="text-neutral-400 text-sm mb-6 flex-1">{product.description}</p>
        
        <div className="space-y-4 mb-6">
          <div className="text-sm font-medium text-neutral-500 uppercase tracking-wider">Select Warehouse</div>
          <div className="flex flex-col gap-2">
            {product.inventories.map((inv: any) => (
              <button
                key={inv.warehouseId}
                onClick={() => setSelectedWarehouse(inv.warehouseId)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition-all ${
                  selectedWarehouse === inv.warehouseId 
                    ? 'border-teal-500 bg-teal-500/10 text-teal-100 shadow-[0_0_10px_rgba(20,184,166,0.1)]' 
                    : 'border-neutral-800 bg-neutral-900/50 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate max-w-[120px]">{inv.warehouse.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${inv.availableUnits > 0 ? 'text-teal-400' : 'text-red-400'}`}>
                    {inv.availableUnits} avail
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 pt-4 border-t border-neutral-800/50 mt-auto">
          <div className="flex items-center gap-3 bg-neutral-900/50 border border-neutral-800 rounded-lg p-1">
            <button 
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="w-8 h-8 flex items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors disabled:opacity-50"
              disabled={quantity <= 1 || availableUnits === 0}
            >
              -
            </button>
            <span className="text-white font-medium w-4 text-center">{quantity}</span>
            <button 
              onClick={() => setQuantity(q => Math.min(availableUnits, q + 1))}
              className="w-8 h-8 flex items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors disabled:opacity-50"
              disabled={quantity >= availableUnits || availableUnits === 0}
            >
              +
            </button>
          </div>
          
          <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
            <Button 
              onClick={handleReserve}
              disabled={availableUnits === 0 || isReserving || quantity > availableUnits}
              className="w-full bg-teal-600 hover:bg-teal-500 text-white font-medium shadow-[0_0_15px_rgba(13,148,136,0.3)] transition-all flex items-center gap-2"
            >
              {isReserving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Reserving...</>
              ) : availableUnits === 0 ? (
                "Out of Stock"
              ) : (
                "Reserve"
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
