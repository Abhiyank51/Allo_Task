"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Home() {
  const [page, setPage] = useState(1);
  const limit = 6;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["products", page],
    queryFn: async () => {
      const res = await fetch(`/api/products?page=${page}&limit=${limit}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex flex-col items-center text-center mb-16 space-y-4">
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
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-neutral-400 max-w-2xl"
        >
          Browse our catalog of certified medical equipment. Our high-concurrency reservation system guarantees your hospital gets the critical stock it needs without overselling.
        </motion.p>
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
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {data?.data?.map((product: any) => (
              <ProductCard key={product.id} product={product} onReserveSuccess={refetch} />
            ))}
          </motion.div>

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
