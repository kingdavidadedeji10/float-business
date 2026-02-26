"use client";

import { StatusUpdate } from "@/types/delivery";

interface StatusTimelineProps {
  currentStatus: string;
  history: StatusUpdate[];
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Order Placed",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  delivered: "Delivered",
  failed: "Failed",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-400",
  picked_up: "bg-blue-400",
  in_transit: "bg-indigo-500",
  delivered: "bg-green-500",
  failed: "bg-red-500",
};

export default function StatusTimeline({ currentStatus, history }: StatusTimelineProps) {
  const displayHistory = history.length > 0 ? history : [{ status: currentStatus, timestamp: new Date().toISOString() }];

  return (
    <div className="relative">
      <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200" />
      <div className="space-y-4">
        {displayHistory.map((item, idx) => (
          <div key={idx} className="flex gap-4 relative">
            <div
              className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center z-10 ${
                STATUS_COLORS[item.status] || "bg-gray-400"
              }`}
            >
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
            <div className="pb-2">
              <p className="text-sm font-medium text-gray-900">
                {STATUS_LABELS[item.status] || item.status}
              </p>
              {item.description && (
                <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
              )}
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(item.timestamp).toLocaleString("en-NG")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
