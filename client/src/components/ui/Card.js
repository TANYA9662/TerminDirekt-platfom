import React from "react";
import { useTranslation } from "react-i18next";

const Card = ({ children, className = "" }) => {
  const { t } = useTranslation();

  return (
    <div className={`bg-gray-200 text-textDark p-4 rounded-2xl shadow-md ${className}`}>
      {typeof children === "string" ? t(children, children) : children}
    </div>
  );
};

export default Card;
