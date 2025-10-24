// // src/app/adminDashboard/shipments/page.tsx
// "use client";

// import { useState, useEffect } from "react";
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
// import { Package, Truck, Calendar } from "lucide-react";

// interface Shipment {
//   shipment_id: number;
//   order_id: number;
//   shipment_date: string;
//   status: string;
//   order?: {
//     total_amount: number;
//     user?: {
//       user_name: string;
//     };
//   };
// }

// export default function ShipmentsManagement() {
//   const [shipments, setShipments] = useState<Shipment[]>([]);
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchShipments();
//   }, []);

//   const fetchShipments = async () => {
//     try {
//       const res = await fetch('/api/shipments');
//       const data = await res.json();
//       setShipments(data);
//     } catch (error) {
//       console.error('Error fetching shipments:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateShipmentStatus = async (shipmentId: number, newStatus: string) => {
//     try {
//       await fetch(`/api/shipments/${shipmentId}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ status: newStatus })
//       });
//       fetchShipments();
//     } catch (error) {
//       console.error('Error updating shipment status:', error);
//     }
//   };

//   const filteredShipments = statusFilter === "all"
//     ? shipments
//     : shipments.filter(s => s.status === statusFilter);

//   const getStatusColor = (status: string) => {
//     switch(status) {
//       case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
//       case 'in_transit': return 'bg-blue-100 text-blue-800 border-blue-200';
//       case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
//       case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
//       default: return 'bg-gray-100 text-gray-800 border-gray-200';
//     }
//   };

//   const formatStatus = (status: string) => {
//     return status.split('_').map(word => 
//       word.charAt(0).toUpperCase() + word.slice(1)
//     ).join(' ');
//   };

//   if (loading) {
//     return (
//       <div className="space-y-6">
//         <div className="animate-pulse">
//           <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
//           <div className="h-96 bg-gray-200 rounded-lg"></div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Page Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h2 className="text-3xl font-bold text-gray-900">Shipments</h2>
//           <p className="text-gray-600 mt-1">Track and manage order shipments</p>
//         </div>
//         <Select value={statusFilter} onValueChange={setStatusFilter}>
//           <SelectTrigger className="w-48">
//             <SelectValue placeholder="Filter by status" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All Shipments</SelectItem>
//             <SelectItem value="pending">Pending</SelectItem>
//             <SelectItem value="in_transit">In Transit</SelectItem>
//             <SelectItem value="delivered">Delivered</SelectItem>
//             <SelectItem value="cancelled">Cancelled</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>

//       {/* Shipments List */}
//       <Card className="border-gray-200">
//         <CardHeader>
//           <div className="flex items-center justify-between">
//             <CardTitle>Shipments List</CardTitle>
//             <Badge variant="secondary" className="text-sm">
//               {filteredShipments.length} {filteredShipments.length === 1 ? 'shipment' : 'shipments'}
//             </Badge>
//           </div>
//         </CardHeader>
//         <CardContent>
//           {filteredShipments.length === 0 ? (
//             <div className="text-center py-12">
//               <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//               <p className="text-gray-500 text-lg font-medium">No shipments found</p>
//               <p className="text-gray-400 text-sm mt-1">
//                 {statusFilter === "all" ? "No shipments have been created yet" : `No ${formatStatus(statusFilter).toLowerCase()} shipments`}
//               </p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr className="border-b border-gray-200">
//                     <th className="text-left p-4 font-semibold text-gray-700">Shipment ID</th>
//                     <th className="text-left p-4 font-semibold text-gray-700">Order ID</th>
//                     <th className="text-left p-4 font-semibold text-gray-700">Customer</th>
//                     <th className="text-left p-4 font-semibold text-gray-700">Shipment Date</th>
//                     <th className="text-left p-4 font-semibold text-gray-700">Status</th>
//                     <th className="text-right p-4 font-semibold text-gray-700">Update Status</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredShipments.map((shipment) => (
//                     <tr key={shipment.shipment_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
//                       <td className="p-4">
//                         <div className="flex items-center gap-2">
//                           <Package className="h-4 w-4 text-gray-400" />
//                           <span className="font-medium text-gray-900">#{shipment.shipment_id}</span>
//                         </div>
//                       </td>
//                       <td className="p-4">
//                         <span className="font-medium text-blue-600">Order #{shipment.order_id}</span>
//                       </td>
//                       <td className="p-4">
//                         <span className="text-gray-700">{shipment.order?.user?.user_name || 'N/A'}</span>
//                       </td>
//                       <td className="p-4">
//                         <div className="flex items-center gap-2 text-gray-600">
//                           <Calendar className="h-4 w-4 text-gray-400" />
//                           <span className="text-sm">
//                             {new Date(shipment.shipment_date).toLocaleDateString('en-US', {
//                               year: 'numeric',
//                               month: 'short',
//                               day: 'numeric'
//                             })}
//                           </span>
//                         </div>
//                       </td>
//                       <td className="p-4">
//                         <Badge className={`${getStatusColor(shipment.status)} border`}>
//                           {formatStatus(shipment.status)}
//                         </Badge>
//                       </td>
//                       <td className="p-4">
//                         <div className="flex justify-end">
//                           <Select
//                             value={shipment.status}
//                             onValueChange={(value) => updateShipmentStatus(shipment.shipment_id, value)}
//                           >
//                             <SelectTrigger className="w-40 h-8">
//                               <SelectValue />
//                             </SelectTrigger>
//                             <SelectContent>
//                               <SelectItem value="pending">Pending</SelectItem>
//                               <SelectItem value="in_transit">In Transit</SelectItem>
//                               <SelectItem value="delivered">Delivered</SelectItem>
//                               <SelectItem value="cancelled">Cancelled</SelectItem>
//                             </SelectContent>
//                           </Select>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }