import React from "react";
import Header from "./Header";

export default function AppLayout({ children }) {
  return (
    <>
      <Header />
      {/* Padding-top = visina header-a, responsive opcionalno */}
      <main className="pt-[88px] md:pt-[56px]">{children}</main>
    </>
  );
}
