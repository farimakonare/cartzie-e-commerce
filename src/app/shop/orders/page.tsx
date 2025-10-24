// // src/app/userDashboard/orders/page.tsx
// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Eye, Package } from "lucide-react";

// interface Order {
//   order_id: number;
//   order_date: string;
//   total_amount: number;
//   status: string;
//   orderItems?: any[];
//   shipment?: {
//     status: string;
//     shipment_date: string;
//   };
// }

// export default function UserOrders() {
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [loading, setLoading] = useState(true);

//   // TODO: Replace with actual user ID from authentication
//   const userId = 1;

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const fetchOrders = async () => {
//     try {
//       const res = await fetch(`/api/orders?userId=${userId}`);
//       const data = await res.json();
//       setOrders(data);
//     } catch (error) {
//       console.error('Error fetching orders:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredOrders = statusFilter === "all"
//     ? orders
//     : orders.filter(order => order.status === statusFilter);

//   const getStatusColor = (status: string) => {
//     switch(status) {
//       case 'pending': return 'bg-yellow-500';
//       case 'processing': return 'bg-blue-500';
//       case 'shipped': return 'bg-purple-500';
//       case 'delivered': return 'bg-green-500';
//       case 'cancelled': return 'bg-red-500';
//       default: return 'bg-gray-500';
//     }
//   };

//   if (loading) return <div className="p-8">Loading...</div>;

//   return (
//     <div className="p-8">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">My Orders</h1>
//         <Select value={statusFilter} onValueChange={setStatusFilter}>
//           <SelectTrigger className="w-48">
//             <SelectValue placeholder="Filter by status" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All Orders</SelectItem>
//             <SelectItem value="pending">Pending</SelectItem>
//             <SelectItem value="processing">Processing</SelectItem>
//             <SelectItem value="shipped">Shipped</SelectItem>
//             <SelectItem value="delivered">Delivered</SelectItem>
//             <SelectItem value="cancelled">Cancelled</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>

//       {filteredOrders.length === 0 ? (
//         <Card>
//           <CardContent className="flex flex-col items-center justify-center py-12">
//             <Package className="h-16 w-16 text-gray-400 mb-4" />
//             <h3 className="text-lg font-medium mb-2">No orders found</h3>
//             <p className="text-gray-500 mb-4">Start shopping to see your orders here</p>
//             <Link href="/products">
//               <Button>Browse Products</Button>
//             </Link>
//           </CardContent>
//         </Card>
//       ) : (
//         <div className="space-y-4">
//           {filteredOrders.map((order) => (
//             <Card key={order.order_id}>
//               <CardHeader>
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <CardTitle className="text-lg">Order #{order.order_id}</CardTitle>
//                     <p className="text-sm text-gray-500 mt-1">
//                       Placed on {new Date(order.order_date).toLocaleDateString()}
//                     </p>
//                   </div>
//                   <Badge className={getStatusColor(order.status)}>
//                     {order.status}
//                   </Badge>
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <div className="flex justify-between items-center">
//                   <div>
//                     <p className="text-sm text-gray-600">
//                       {order.orderItems?.length || 0} item(s)
//                     </p>
//                     <p className="text-lg font-bold mt-1">
//                       ${order.total_amount.toFixed(2)}
//                     </p>
//                     {order.shipment && (
//                       <p className="text-sm text-gray-600 mt-2">
//                         Shipment: <span className="font-medium">{order.shipment.status}</span>
//                       </p>
//                     )}
//                   </div>
//                   <Link href={`/userDashboard/orders/${order.order_id}`}>
//                     <Button variant="outline">
//                       <Eye className="mr-2 h-4 w-4" />
//                       View Details
//                     </Button>
//                   </Link>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }