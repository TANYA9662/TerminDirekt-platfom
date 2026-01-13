import React from "react";

const CompanyImageUpload = ({ onUpload }) => {
  return (
    <div>
      <p>Placeholder för CompanyImageUpload</p>
      <input type="file" onChange={(e) => onUpload && onUpload(e.target.files[0])} />
    </div>
  );
};

export default CompanyImageUpload;
