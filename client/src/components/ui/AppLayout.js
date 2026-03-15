import React from "react";
import Header from "./Header";
import Footer from "../common/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AppLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">

      <Header />

      <main className="flex-1 pt-[88px] md:pt-[56px]">
        {children}
      </main>

      <Footer />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
        newestOnTop
        closeOnClick
        pauseOnHover
        style={{ zIndex: 9999 }}
      />
    </div>
  );
}