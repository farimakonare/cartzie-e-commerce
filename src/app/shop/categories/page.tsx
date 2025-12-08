// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";

// type Category = {
//   category_id: number;
//   name: string;
//   products: { product_id: number }[];
// };

// export default function CategoriesPage() {
//   const [categories, setCategories] = useState<Category[]>([]);

//   useEffect(() => {
//     fetch("/api/categories")
//       .then((res) => res.json())
//       .then(setCategories);
//   }, []);

//   return (
//     <div>
//       <h1 className="text-3xl font-semibold mb-6">All Categories</h1>
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//         {categories.map((c) => (
//           <Link
//             key={c.category_id}
//             href={`/categories/${c.category_id}`}
//             className="border rounded-lg p-4 shadow hover:shadow-md transition block"
//           >
//             <h2 className="font-semibold text-lg mb-2">{c.name}</h2>
//             <p className="text-gray-500 text-sm">
//               {c.products.length} product(s)
//             </p>
//           </Link>
//         ))}
//       </div>
//     </div>
//   );
// }
