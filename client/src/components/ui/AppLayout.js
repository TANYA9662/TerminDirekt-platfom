import React from "react";
import Header from "./Header";
import Footer from "../common/Footer";

export default function AppLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">

      <Header />
      <main className="flex-1 pt-[88px] md:pt-[56px]">
        {children}
      </main>

      <Footer />

    </div>
  );
}