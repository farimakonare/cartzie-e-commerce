// "use client";

// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";

// type Product = { product_id: number; name: string; price: number };
// type Category = { category_id: number; name: string; products: Product[] };

// export default function CategoryDetail() {
//   const { id } = useParams();
//   const [category, setCategory] = useState<Category | null>(null);

//   useEffect(() => {
//     fetch(`/api/categories/${id}`)
//       .then((res) => res.json())
//       .then(setCategory);
//   }, [id]);

//   if (!category) return <p>Loading category...</p>;

//   return (
//     <div>
//       <h1 className="text-3xl font-bold mb-6">
//         Category: {category.name}
//       </h1>
//       {category.products.length === 0 ? (
//         <p className="text-gray-500">No products found in this category.</p>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {category.products.map((p) => (
//             <div key={p.product_id} className="border p-4 rounded shadow-sm">
//               <h2 className="font-semibold">{p.name}</h2>
//               <p className="text-blue-600 mt-2 font-bold">${p.price}</p>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
