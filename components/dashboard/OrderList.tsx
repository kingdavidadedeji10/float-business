import { Order } from "@/types/order";
import { formatCurrency } from "@/lib/helpers";

interface OrderListProps {
  orders: Order[];
}

export default function OrderList({ orders }: OrderListProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
        <p className="text-gray-500">No orders yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Buyer</th>
            <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Amount</th>
            <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Status</th>
            <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-900">{order.customer_email || order.customer_name}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(order.total)}</td>
              <td className="px-4 py-3">
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    order.status === "paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {order.status}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {new Date(order.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
