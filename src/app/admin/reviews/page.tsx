
// // File: app/admin/reviews/page.tsx
// "use client";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Eye, Trash2, Star, Search } from "lucide-react";
// import { useEffect, useState } from "react";

// interface Review {
//   review_id: number;
//   user?: { user_name: string };
//   product?: { name: string; category?: { name: string } };
//   rating: number;
//   comment?: string;
// }

// export default function AdminReviews() {
//   const [reviews, setReviews] = useState<Review[]>([]);
//   const [searchQuery, setSearchQuery] = useState("");

//   useEffect(() => {
//     fetch("/api/reviews")
//       .then((res) => res.json())
//       .then((data) => setReviews(data))
//       .catch((err) => console.error(err));
//   }, []);

//   const avgRating =
//     reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

//   const filteredReviews = reviews.filter(
//     (review) =>
//       review.product?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       review.user?.user_name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="mb-2">Reviews</h1>
//         <p className="text-muted-foreground">Manage customer reviews and ratings</p>
//       </div>

//       <div className="grid gap-4 md:grid-cols-4">
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium text-muted-foreground">
//               Total Reviews
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{reviews.length}</div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium text-muted-foreground">
//               Average Rating
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="flex items-center gap-2">
//               <div className="text-2xl font-bold">{avgRating.toFixed(1)}</div>
//               <Star className="h-5 w-5 fill-amber-500 text-brand-500" />
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium text-muted-foreground">
//               5 Star Reviews
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-emerald-600">
//               {reviews.filter((r) => r.rating === 5).length}
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium text-muted-foreground">
//               Low Ratings
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-brand-600">
//               {reviews.filter((r) => r.rating <= 2).length}
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       <Card>
//         <CardHeader>
//           <div className="flex items-center justify-between">
//             <CardTitle>All Reviews</CardTitle>
//             <div className="relative w-64">
//               <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//               <Input
//                 placeholder="Search reviews..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="pl-9"
//               />
//             </div>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="rounded-lg border">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Customer</TableHead>
//                   <TableHead>Product</TableHead>
//                   <TableHead>Rating</TableHead>
//                   <TableHead>Comment</TableHead>
//                   <TableHead className="text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {filteredReviews.length === 0 ? (
//                   <TableRow>
//                     <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
//                       No reviews found.
//                     </TableCell>
//                   </TableRow>
//                 ) : (
//                   filteredReviews.map((review) => (
//                     <TableRow key={review.review_id}>
//                       <TableCell>
//                         <span className="font-medium">{review.user?.user_name || "—"}</span>
//                       </TableCell>
//                       <TableCell>
//                         <div>
//                           <p className="font-medium">{review.product?.name || "—"}</p>
//                           <p className="text-sm text-muted-foreground">
//                             {review.product?.category?.name || "—"}
//                           </p>
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         <div className="flex items-center gap-1">
//                           {[...Array(5)].map((_, i) => (
//                             <Star
//                               key={i}
//                               className={`h-4 w-4 ${
//                                 i < review.rating
//                                   ? "fill-amber-500 text-brand-500"
//                                   : "text-muted"
//                               }`}
//                             />
//                           ))}
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         <p className="line-clamp-2 max-w-md text-sm text-muted-foreground">
//                           {review.comment || "No comment"}
//                         </p>
//                       </TableCell>
//                       <TableCell className="text-right">
//                         <div className="flex justify-end gap-2">
//                           <Button variant="ghost" size="sm">
//                             <Eye className="h-4 w-4" />
//                           </Button>
//                           <Button variant="ghost" size="sm">
//                             <Trash2 className="h-4 w-4" />
//                           </Button>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 )}
//               </TableBody>
//             </Table>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
