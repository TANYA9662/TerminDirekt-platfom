import React from "react";

const Button = ({ children, onClick, type = "button", variant = "primary", className = "" }) => {
  let baseClasses = "px-4 py-2 rounded text-white transition";

  const variants = {
    primary: "bg-primary hover:bg-primaryHover",
    accent: "bg-accent hover:bg-accentLight",
    black: "bg-black hover:bg-gray-700",
    gray: "bg-gray-400 hover:bg-gray-500",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant] || variants.primary} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
