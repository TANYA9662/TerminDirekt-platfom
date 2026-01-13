import React from "react";
import Badge from "../ui/Badge";

const CategoryList = ({ categories }) => {
  return (
    <section className="py-10">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 animate-fadeInUp">Kategorije</h2>

        <div className="flex flex-wrap gap-4">
          {categories.map((cat) => (
            <Badge key={cat.id}>{cat.name}</Badge>
          ))}
        </div>
      </div>

    </section>
  );
};

export default CategoryList;
