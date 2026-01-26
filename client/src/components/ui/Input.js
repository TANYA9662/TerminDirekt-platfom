const Input = ({ value, onChange, placeholder, type = "text", className = "" }) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full border border-gray-300 bg-gray-200 text-textDark px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${className}`}
    />
  );
};

export default Input;
