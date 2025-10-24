// // src/app/userDashboard/reviews/page.tsx
// "use client";

// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Star, Edit, Trash2, MessageSquare } from "lucide-react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";

// interface Review {
//   review_id: number;
//   user_id: number;
//   product_id: number;
//   rating: number;
//   comment: string;
//   product?: {
//     name: string;
//   };
// }

// export default function UserReviews() {
//   const [reviews, setReviews] = useState<Review[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [editingReview, setEditingReview] = useState<Review | null>(null);
//   const [formData, setFormData] = useState({
//     rating: 5,
//     comment: ''
//   });

//   // TODO: Replace with actual user ID from authentication
//   const userId = 1;

//   useEffect(() => {
//     fetchReviews();
//   }, []);

//   const fetchReviews = async () => {
//     try {
//       const res = await fetch(`/api/reviews?userId=${userId}`);
//       const data = await res.json();
//       setReviews(data);
//     } catch (error) {
//       console.error('Error fetching reviews:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!editingReview) return;

//     try {
//       await fetch(`/api/reviews/${editingReview.review_id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData)
//       });

//       fetchReviews();
//       setIsDialogOpen(false);
//       setEditingReview(null);
//       setFormData({ rating: 5, comment: '' });
//     } catch (error) {
//       console.error('Error updating review:', error);
//     }
//   };

//   const deleteReview = async (id: number) => {
//     if (!confirm('Are you sure you want to delete this review?')) return;

//     try {
//       await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
//       setReviews(reviews.filter(r => r.review_id !== id));
//     } catch (error) {
//       console.error('Error deleting review:', error);
//     }
//   };

//   const openEditDialog = (review: Review) => {
//     setEditingReview(review);
//     setFormData({
//       rating: review.rating,
//       comment: review.comment
//     });
//     setIsDialogOpen(true);
//   };

//   const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
//     return (
//       <div className="flex">
//         {[1, 2, 3, 4, 5].map((star) => (
//           <Star
//             key={star}
//             className={`h-5 w-5 ${interactive ? 'cursor-pointer' : ''} ${
//               star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
//             }`}
//             onClick={() => interactive && onRate && onRate(star)}
//           />
//         ))}
//       </div>
//     );
//   };

//   if (loading) return <div className="p-8">Loading...</div>;

//   return (
//     <div className="p-8">
//       <h1 className="text-3xl font-bold mb-6">My Reviews</h1>

//       {reviews.length === 0 ? (
//         <Card>
//           <CardContent className="flex flex-col items-center justify-center py-12">
//             <MessageSquare className="h-16 w-16 text-gray-400 mb-4" />
//             <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
//             <p className="text-gray-500 mb-4">Purchase products to leave reviews</p>
//             <Button onClick={() => window.location.href = '/products'}>
//               Browse Products
//             </Button>
//           </CardContent>
//         </Card>
//       ) : (
//         <div className="space-y-4">
//           {reviews.map((review) => (
//             <Card key={review.review_id}>
//               <CardHeader>
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <CardTitle className="text-lg">
//                       {review.product?.name || `Product #${review.product_id}`}
//                     </CardTitle>
//                     <div className="mt-2">
//                       {renderStars(review.rating)}
//                     </div>
//                   </div>
//                   <div className="flex gap-2">
//                     <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//                       <DialogTrigger asChild>
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => openEditDialog(review)}
//                         >
//                           <Edit className="h-4 w-4" />
//                         </Button>
//                       </DialogTrigger>
//                       <DialogContent>
//                         <DialogHeader>
//                           <DialogTitle>Edit Review</DialogTitle>
//                         </DialogHeader>
//                         <form onSubmit={handleSubmit} className="space-y-4">
//                           <div>
//                             <Label>Rating</Label>
//                             {renderStars(formData.rating, true, (rating) => 
//                               setFormData({...formData, rating})
//                             )}
//                           </div>
//                           <div>
//                             <Label htmlFor="comment">Your Review</Label>
//                             <Textarea
//                               id="comment"
//                               value={formData.comment}
//                               onChange={(e) => setFormData({...formData, comment: e.target.value})}
//                               rows={4}
//                               required
//                             />
//                           </div>
//                           <Button type="submit">Update Review</Button>
//                         </form>
//                       </DialogContent>
//                     </Dialog>
                    
//                     <Button
//                       variant="destructive"
//                       size="sm"
//                       onClick={() => deleteReview(review.review_id)}
//                     >
//                       <Trash2 className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <p className="text-gray-700">{review.comment}</p>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }