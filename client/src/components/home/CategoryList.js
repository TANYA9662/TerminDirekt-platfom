import React from "react";
import Badge from "../ui/Badge";

const CategoryList = ({ categories }) => {
  return (
    <section className="py-10 bg-gray-200">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-textDark">
          Kategorije
        </h2>

        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <span
              key={cat.id}
              className="px-4 py-2 rounded-full border border-accent text-accent font-medium hover:bg-accent hover:text-cardBg transition cursor-pointer"
            >
              {cat.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};


export default CategoryList;
