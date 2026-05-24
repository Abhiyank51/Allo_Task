"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search, Filter, SearchX } from "lucide-react";
import { useDebounce } from "use-debounce";

export default function Home() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [warehouseId, setWarehouseId] = useState("ALL");
  const limit = 6;

  // Reset page to 1 when search or filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, warehouseId]);

  const { data: warehouses } = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => {
      const res = await fetch("/api/warehouses");
      return res.json();
    }
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["products", page, debouncedSearch, warehouseId],
    queryFn: async () => {
      const res = await fetch(`/api/products?page=${page}&limit=${limit}&search=${encodeURIComponent(debouncedSearch)}&warehouseId=${warehouseId === "ALL" ? "" : warehouseId}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex flex-col items-center text-center mb-12 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-sm font-medium text-teal-300"
        >
          Enterprise Medical Supplies
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-100 to-neutral-400"
        >
          Reliable Supply Fulfillment
        </motion.h1>
      </div>

      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-neutral-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-neutral-700 rounded-xl leading-5 bg-neutral-900 text-neutral-300 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition-colors"
            placeholder="Search products by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-5 h-5 text-neutral-500" />
          <select
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            className="block w-full md:w-64 pl-3 pr-10 py-2 text-base border-neutral-700 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-xl bg-neutral-900 text-neutral-300"
          >
            <option value="ALL">All Warehouses</option>
            {warehouses?.map((w: any) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col space-y-3 p-6 rounded-2xl border border-neutral-800 bg-neutral-900/50">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-full mt-4" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {data?.data?.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-24 bg-neutral-900/40 rounded-3xl border border-neutral-800/80 shadow-2xl flex flex-col items-center justify-center max-w-2xl mx-auto"
            >
              <div className="w-20 h-20 bg-neutral-800/50 rounded-full flex items-center justify-center mb-6">
                <SearchX className="w-10 h-10 text-neutral-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No products found</h3>
              <p className="text-neutral-400 text-base mb-8 max-w-md">
                We couldn't find any medical supplies matching your current search and filter criteria. Try adjusting your parameters.
              </p>
              <Button 
                onClick={() => { setSearchTerm(""); setWarehouseId("ALL"); }} 
                className="bg-teal-600 hover:bg-teal-500 text-white font-medium px-8"
              >
                Clear All Filters
              </Button>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {data?.data?.map((product: any) => (
                <ProductCard key={product.id} product={product} onReserveSuccess={refetch} />
              ))}
            </motion.div>
          )}

          {data?.metadata && data.metadata.totalPages > 1 && (
            <div className="flex justify-center items-center mt-12 gap-4">
              <Button 
                variant="outline" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              <span className="text-neutral-400 text-sm font-medium">
                Page {page} of {data.metadata.totalPages}
              </span>
              <Button 
                variant="outline" 
                onClick={() => setPage(p => Math.min(data.metadata.totalPages, p + 1))}
                disabled={page === data.metadata.totalPages}
                className="border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
