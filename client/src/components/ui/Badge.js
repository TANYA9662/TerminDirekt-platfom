const Badge = ({ children, className = "" }) => (
  <span className={`px-3 py-1 bg-accentLight text-accent rounded-full text-sm ${className}`}>
    {children}
  </span>
);

export default Badge;
