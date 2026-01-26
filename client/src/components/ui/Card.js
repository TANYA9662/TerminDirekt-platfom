const Card = ({ children, className = "" }) => {
  return (
    <div className={`bg-gray-200 text-textDark p-4 rounded-2xl shadow-md ${className}`}>
      {children}
    </div>
  );
};

export default Card;
