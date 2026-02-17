import React from "react";
import { useTranslation } from "react-i18next";

const Badge = ({ children, className = "" }) => {
  const { t } = useTranslation();

  return (
    <span className={`px-3 py-1 bg-accentLight text-accent rounded-full text-sm ${className}`}>
      {typeof children === "string" ? t(children, children) : children}
    </span>
  );
};

export default Badge;
