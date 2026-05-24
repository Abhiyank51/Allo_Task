"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

export function ProductCard({ product, onReserveSuccess }: { product: any; onReserveSuccess: () => void }) {
  const [selectedWarehouse, setSelectedWarehouse] = useState(product.inventories[0]?.warehouseId);
  const [quantity, setQuantity] = useState(1);
  const [isReserving, setIsReserving] = useState(false);
  const router = useRouter();

  const inventory = product.inventories.find((inv: any) => inv.warehouseId === selectedWarehouse);
  const availableUnits = inventory?.availableUnits || 0;

  const handleReserve = async () => {
    if (availableUnits < quantity) {
      toast.error("Not enough stock available!");
      return;
    }
    
    setIsReserving(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          warehouseId: selectedWarehouse,
          quantity,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          toast.error("Not enough stock available (Concurrency conflict)");
          onReserveSuccess(); // refresh stock
        } else {
          toast.error(data.error || "Failed to reserve");
        }
        return;
      }

      toast.success("Reservation secured!");
      router.push(`/reservation/${data.id}`);
    } catch (e) {
      toast.error("Something went wrong");
    } finally {
      setIsReserving(false);
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="flex flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/40 backdrop-blur-md shadow-xl"
    >
      <div className="relative h-48 w-full bg-neutral-800 overflow-hidden group">
        <img 
          src={product.imageUrl || ""} 
          alt={product.name} 
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
          <Badge variant="secondary" className="bg-neutral-800/80 text-neutral-100 backdrop-blur">
            {product.sku}
          </Badge>
          <span className="text-xl font-bold text-white">${product.price.toFixed(2)}</span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-lg text-neutral-100 line-clamp-1">{product.name}</h3>
        <p className="text-sm text-neutral-400 mt-2 line-clamp-2">{product.description}</p>
        
        <div className="mt-6 space-y-4 flex-1">
          <div>
            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Select Warehouse</label>
            <div className="mt-2 grid grid-cols-1 gap-2">
              {product.inventories.map((inv: any) => (
                <button
                  key={inv.warehouseId}
                  onClick={() => setSelectedWarehouse(inv.warehouseId)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-colors ${
                    selectedWarehouse === inv.warehouseId 
                      ? 'border-blue-500 bg-blue-500/10 text-blue-100' 
                      : 'border-neutral-800 bg-neutral-900/50 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {inv.warehouse.name}
                  </span>
                  <span className={`font-mono font-medium ${inv.availableUnits > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {inv.availableUnits} left
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-end gap-3 pt-2">
            <div className="flex-1">
              <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Qty</label>
              <div className="flex items-center mt-2 border border-neutral-800 rounded-lg overflow-hidden bg-neutral-900/50">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100 transition"
                  disabled={quantity <= 1}
                >-</button>
                <input 
                  type="number" 
                  value={quantity} 
                  readOnly 
                  className="w-full bg-transparent text-center text-sm font-medium focus:outline-none"
                />
                <button 
                  onClick={() => setQuantity(Math.min(availableUnits, quantity + 1))}
                  className="px-3 py-2 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100 transition"
                  disabled={quantity >= availableUnits}
                >+</button>
              </div>
            </div>
            
            <Button 
              onClick={handleReserve}
              disabled={availableUnits === 0 || isReserving || quantity > availableUnits}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all"
            >
              {isReserving ? "Reserving..." : availableUnits === 0 ? "Out of Stock" : "Reserve"}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
