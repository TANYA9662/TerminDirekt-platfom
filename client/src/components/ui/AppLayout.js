import React from "react";
import Header from "./Header";

export default function AppLayout({ children }) {
  return (
    <>
      <Header />
      {/* Padding-top = high header-a, responsive opcional */}
      <main className="pt-[88px] md:pt-[56px]">{children}</main>
    </>
  );
}