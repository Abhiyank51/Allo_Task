"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Clock } from "lucide-react";

export function ReservationCountdown({ expiresAt, onExpire }: { expiresAt: string; onExpire: () => void }) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const target = new Date(expiresAt).getTime();
    const start = target - 10 * 60 * 1000; // 10m window

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = target - now;

      if (remaining <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
        setProgress(0);
        onExpire();
      } else {
        setTimeLeft(remaining);
        const totalDuration = target - start;
        setProgress((remaining / totalDuration) * 100);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(timeLeft / 1000 / 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);
  
  const isDanger = minutes < 2;

  if (timeLeft <= 0) {
    return <div className="text-red-500 font-medium">Reservation Expired</div>;
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-sm font-medium">
        <span className="flex items-center gap-1.5 text-neutral-400">
          <Clock className="w-4 h-4" />
          Time remaining to confirm
        </span>
        <span className={`font-mono text-lg ${isDanger ? 'text-red-400 animate-pulse' : 'text-neutral-100'}`}>
          {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
      </div>
      <Progress value={progress} className={`h-2 ${isDanger ? 'bg-red-500/20' : 'bg-blue-500/20'}`} />
    </div>
  );
}
