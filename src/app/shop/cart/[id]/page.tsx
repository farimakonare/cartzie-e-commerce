// "use client";

// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";

// type Cart = {
//   cart_id: number;
//   user_id: number;
//   cartItems: { cart_item_id: number; quantity: number; product: { name: string; price: number } }[];
// };

// export default function CartDetail() {
//   const { id } = useParams();
//   const [cart, setCart] = useState<Cart | null>(null);

//   useEffect(() => {
//     fetch(`/api/carts/${id}`)
//       .then((res) => res.json())
//       .then(setCart);
//   }, [id]);

//   if (!cart) return <p>Loading cart...</p>;

//   const total = cart.cartItems.reduce(
//     (sum, item) => sum + item.product.price * item.quantity,
//     0
//   );

//   return (
//     <div>
//       <h1 className="text-2xl font-bold mb-4">Cart #{cart.cart_id}</h1>
//       <ul className="divide-y">
//         {cart.cartItems.map((i) => (
//           <li key={i.cart_item_id} className="py-3 flex justify-between">
//             <span>
//               {i.product.name} × {i.quantity}
//             </span>
//             <span>${(i.product.price * i.quantity).toFixed(2)}</span>
//           </li>
//         ))}
//       </ul>
//       <p className="mt-4 font-bold text-blue-700">Total: ${total.toFixed(2)}</p>
//     </div>
//   );
// }
