"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Activity, Search, Filter, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useDebounce } from "use-debounce";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const [productSearch, setProductSearch] = useState("");
  const [resSearch, setResSearch] = useState("");
  const [debouncedResSearch] = useDebounce(resSearch, 500);
  const [resStatus, setResStatus] = useState("ALL");
  const [resPage, setResPage] = useState(1);
  const [isCleaning, setIsCleaning] = useState(false);

  // Reset page when filter changes
  useState(() => {
    setResPage(1);
  });

  const { data: products, isLoading: isProductsLoading } = useQuery({
    queryKey: ["products-admin"],
    queryFn: async () => {
      const res = await fetch("/api/products?limit=1000"); // Fetch all for accurate totals
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
    refetchInterval: 5000,
  });

  const { data: reservations, isLoading: isReservationsLoading, refetch: refetchRes } = useQuery({
    queryKey: ["reservations-admin", resPage, debouncedResSearch, resStatus],
    queryFn: async () => {
      const res = await fetch(`/api/reservations?page=${resPage}&limit=5&search=${encodeURIComponent(debouncedResSearch)}&status=${resStatus}`);
      if (!res.ok) throw new Error("Failed to fetch reservations");
      return res.json();
    },
    refetchInterval: 5000,
  });

  const handleQuickClean = async () => {
    setIsCleaning(true);
    try {
      const res = await fetch("/api/cron/release-expired");
      if (res.ok) {
        toast.success("Successfully cleaned up all expired reservations!");
        refetchRes();
      } else {
        toast.error("Failed to run cleanup task.");
      }
    } finally {
      setIsCleaning(false);
    }
  };

  if (isProductsLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // Calculate true totals across all products
  let totalUnitsOverall = 0;
  let reservedUnitsOverall = 0;
  let availableUnitsOverall = 0;

  products?.data?.forEach((product: any) => {
    product.inventories.forEach((inv: any) => {
      totalUnitsOverall += inv.totalUnits;
      reservedUnitsOverall += inv.reservedUnits;
      availableUnitsOverall += inv.availableUnits;
    });
  });

  // Client-side filter for the inventory table
  const filteredProducts = products?.data?.filter((p: any) => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Inventory Dashboard</h1>
        <p className="text-neutral-400">Live operational overview of all medical supply levels.</p>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6">
          <div className="text-neutral-400 text-sm font-medium uppercase tracking-wider mb-2">Total System Stock</div>
          <div className="text-4xl font-bold text-white">{totalUnitsOverall}</div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6">
          <div className="text-neutral-400 text-sm font-medium uppercase tracking-wider mb-2">Available for Sale</div>
          <div className="text-4xl font-bold text-teal-400">{availableUnitsOverall}</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6">
          <div className="text-neutral-400 text-sm font-medium uppercase tracking-wider mb-2">Currently Reserved</div>
          <div className="text-4xl font-bold text-amber-400">{reservedUnitsOverall}</div>
        </motion.div>
      </div>

      {/* INVENTORY TABLE */}
      <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl mb-16">
        <div className="p-4 border-b border-neutral-800 flex items-center gap-4 bg-neutral-900/60">
          <div className="relative w-full max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-neutral-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-2 border border-neutral-700 rounded-lg text-sm bg-neutral-900 text-neutral-300 placeholder-neutral-500 focus:ring-1 focus:ring-teal-500"
              placeholder="Filter inventory by SKU or Name..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto h-[400px]">
          <table className="w-full text-left text-sm text-neutral-300 relative">
            <thead className="bg-neutral-900/90 text-neutral-400 border-b border-neutral-800 text-xs uppercase font-semibold sticky top-0 backdrop-blur-sm">
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
              {filteredProducts?.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-neutral-500">No matching products found.</td></tr>
              ) : (
                filteredProducts?.map((product: any) => (
                  product.inventories.map((inv: any) => (
                    <tr key={`${product.id}-${inv.warehouseId}`} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="px-6 py-3 font-medium text-neutral-100 flex items-center gap-3">
                        <div className="w-6 h-6 rounded bg-neutral-800 flex items-center justify-center flex-shrink-0">
                          <Activity className="w-3 h-3 text-teal-500" />
                        </div>
                        <span className="truncate max-w-[200px] block">{product.name}</span>
                      </td>
                      <td className="px-6 py-3 font-mono text-xs">{product.sku}</td>
                      <td className="px-6 py-3">{inv.warehouse.name}</td>
                      <td className={`px-6 py-3 text-right font-medium ${inv.availableUnits > 0 ? 'text-teal-400' : 'text-red-400'}`}>
                        {inv.availableUnits}
                      </td>
                      <td className="px-6 py-3 text-right text-amber-400">{inv.reservedUnits}</td>
                      <td className="px-6 py-3 text-right">{inv.totalUnits}</td>
                    </tr>
                  ))
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RESERVATIONS TABLE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Active & Past Reservations</h2>
          <p className="text-neutral-400">View, search, and manage all customer order holds.</p>
        </div>
        <Button 
          onClick={handleQuickClean}
          disabled={isCleaning}
          variant="outline"
          className="border-neutral-700 hover:bg-teal-500/10 hover:text-teal-400 hover:border-teal-500/50"
        >
          <Trash2 className="w-4 h-4 mr-2" /> 
          {isCleaning ? "Cleaning..." : "Quick Clean Expired Holds"}
        </Button>
      </div>

      <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl mb-12">
        <div className="p-4 border-b border-neutral-800 flex flex-col md:flex-row gap-4 bg-neutral-900/60">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-neutral-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-2 border border-neutral-700 rounded-lg text-sm bg-neutral-900 text-neutral-300 placeholder-neutral-500 focus:ring-1 focus:ring-teal-500"
              placeholder="Search reservations by product name..."
              value={resSearch}
              onChange={(e) => setResSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-neutral-500" />
            <select
              value={resStatus}
              onChange={(e) => { setResStatus(e.target.value); setResPage(1); }}
              className="block w-40 pl-3 pr-8 py-2 text-sm border-neutral-700 focus:ring-teal-500 rounded-lg bg-neutral-900 text-neutral-300"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="RELEASED">Released</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-300">
            <thead className="bg-neutral-900/80 text-neutral-400 border-b border-neutral-800 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Warehouse</th>
                <th className="px-6 py-4 text-right">Qty</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {isReservationsLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-neutral-500">Loading...</td></tr>
              ) : reservations?.data?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                    No reservations found matching your criteria.
                  </td>
                </tr>
              ) : (
                reservations?.data?.map((res: any) => (
                  <tr key={res.id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="px-6 py-4">
                      {res.status === "PENDING" && <span className="bg-amber-500/10 text-amber-500 px-2 py-1 rounded text-xs font-medium border border-amber-500/20">PENDING</span>}
                      {res.status === "CONFIRMED" && <span className="bg-teal-500/10 text-teal-500 px-2 py-1 rounded text-xs font-medium border border-teal-500/20">CONFIRMED</span>}
                      {res.status === "RELEASED" && <span className="bg-neutral-500/10 text-neutral-400 px-2 py-1 rounded text-xs font-medium border border-neutral-500/20">RELEASED</span>}
                      {res.status === "EXPIRED" && <span className="bg-red-500/10 text-red-500 px-2 py-1 rounded text-xs font-medium border border-red-500/20">EXPIRED</span>}
                    </td>
                    <td className="px-6 py-4 font-medium text-neutral-100">{res.product.name}</td>
                    <td className="px-6 py-4">{res.warehouse.name}</td>
                    <td className="px-6 py-4 text-right font-medium">{res.quantity}</td>
                    <td className="px-6 py-4 text-right">
                      <a href={`/reservation/${res.id}`} className="text-teal-400 hover:text-teal-300 font-medium text-xs uppercase">
                        Manage &rarr;
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Reservations Pagination */}
        {reservations?.metadata && reservations.metadata.totalPages > 1 && (
          <div className="p-4 border-t border-neutral-800 flex justify-between items-center bg-neutral-900/30">
            <span className="text-neutral-400 text-sm">
              Showing {((resPage - 1) * 5) + 1} to {Math.min(resPage * 5, reservations.metadata.totalItems)} of {reservations.metadata.totalItems}
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" size="sm"
                onClick={() => setResPage(p => Math.max(1, p - 1))} disabled={resPage === 1}
                className="border-neutral-700 bg-neutral-800 text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" size="sm"
                onClick={() => setResPage(p => Math.min(reservations.metadata.totalPages, p + 1))} disabled={resPage === reservations.metadata.totalPages}
                className="border-neutral-700 bg-neutral-800 text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
