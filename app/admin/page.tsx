"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

export default function AdminDashboard() {
  const { data: products, isLoading } = useQuery({
    queryKey: ["products-admin"],
    queryFn: async () => {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
    // Poll every 5 seconds for live dashboard updates
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // Calculate totals
  let totalUnitsOverall = 0;
  let reservedUnitsOverall = 0;
  let availableUnitsOverall = 0;

  products?.forEach((product: any) => {
    product.inventories.forEach((inv: any) => {
      totalUnitsOverall += inv.totalUnits;
      reservedUnitsOverall += inv.reservedUnits;
      availableUnitsOverall += inv.availableUnits;
    });
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Inventory Dashboard</h1>
        <p className="text-neutral-400">Live operational overview of all medical supply levels.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6"
        >
          <div className="text-neutral-400 text-sm font-medium uppercase tracking-wider mb-2">Total System Stock</div>
          <div className="text-4xl font-bold text-white">{totalUnitsOverall}</div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6"
        >
          <div className="text-neutral-400 text-sm font-medium uppercase tracking-wider mb-2">Available for Sale</div>
          <div className="text-4xl font-bold text-teal-400">{availableUnitsOverall}</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6"
        >
          <div className="text-neutral-400 text-sm font-medium uppercase tracking-wider mb-2">Currently Reserved</div>
          <div className="text-4xl font-bold text-amber-400">{reservedUnitsOverall}</div>
        </motion.div>
      </div>

      <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-300">
            <thead className="bg-neutral-900/80 text-neutral-400 border-b border-neutral-800 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Warehouse</th>
                <th className="px-6 py-4 text-right">Available</th>
                <th className="px-6 py-4 text-right">Reserved</th>
                <th className="px-6 py-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {products?.map((product: any) => (
                product.inventories.map((inv: any) => (
                  <tr key={`${product.id}-${inv.warehouseId}`} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-neutral-100 flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-neutral-800 flex items-center justify-center flex-shrink-0">
                        <Activity className="w-4 h-4 text-teal-500" />
                      </div>
                      <span className="truncate max-w-[200px] block">{product.name}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{product.sku}</td>
                    <td className="px-6 py-4">{inv.warehouse.name}</td>
                    <td className={`px-6 py-4 text-right font-medium ${inv.availableUnits > 0 ? 'text-teal-400' : 'text-red-400'}`}>
                      {inv.availableUnits}
                    </td>
                    <td className="px-6 py-4 text-right text-amber-400">{inv.reservedUnits}</td>
                    <td className="px-6 py-4 text-right">{inv.totalUnits}</td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
