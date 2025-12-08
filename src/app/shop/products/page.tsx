// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";

// type Product = {
//   product_id: number;
//   name: string;
//   price: number;
//   stock_quantity: number;
// };

// export default function ProductsPage() {
//   const [products, setProducts] = useState<Product[]>([]);

//   useEffect(() => {
//     fetch("/api/products")
//       .then(res => res.json())
//       .then(setProducts);
//   }, []);

//   return (
//     <div>
//       <h1 className="text-3xl font-semibold mb-6">All Products</h1>
//       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//         {products.map(p => (
//           <div key={p.product_id} className="border rounded-lg p-4 shadow-sm hover:shadow-md">
//             <h2 className="font-bold text-lg">{p.name}</h2>
//             <p className="text-gray-500 text-sm mt-1">
//               {p.stock_quantity} in stock
//             </p>
//             <p className="text-blue-600 font-semibold mt-2">${p.price.toFixed(2)}</p>
//             <Link
//               href={`/products/${p.product_id}`}
//               className="inline-block mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//             >
//               View Details
//             </Link>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
