import React from "react";

const Input = ({ value, onChange, placeholder, type = "text", className = "" }) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full border border-gray-300 bg-gray-500 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
    />
  );
};

export default Input;
