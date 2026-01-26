import React, { useRef, useState, useEffect } from "react";
import CompanyCard from "./CompanyCard";

const AdvancedSlider = ({ companies }) => {
  const carouselRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    if (!companies.length) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % companies.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [companies]);

  // Scroll effect
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const child = carousel.children[currentIndex];
    child?.scrollIntoView({ behavior: "smooth", inline: "center" });
  }, [currentIndex]);

  const handleNext = () => setCurrentIndex(prev => (prev + 1) % companies.length);
  const handlePrev = () => setCurrentIndex(prev => (prev - 1 + companies.length) % companies.length);

  const handleTouchStart = e => setTouchStart(e.touches[0].clientX);
  const handleTouchMove = e => setTouchEnd(e.touches[0].clientX);
  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) handleNext();
    if (touchStart - touchEnd < -50) handlePrev();
  };

  return (
    <div className="relative w-full h-80 sm:h-96 overflow-hidden">
      <div
        ref={carouselRef}
        className="flex gap-6 sm:gap-8 overflow-x-auto scroll-smooth snap-x snap-mandatory px-6 sm:px-8 no-scrollbar"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {companies.map(company => (
          <div key={company.id} className="flex-shrink-0 w-64 sm:w-72 md:w-80 lg:w-64 snap-center">
            <CompanyCard company={company} onBook={() => { }} />
          </div>
        ))}
      </div>

      <button onClick={handlePrev} className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 bg-gray-300 p-2 rounded-full hover:bg-gray-400 z-10">‹</button>
      <button onClick={handleNext} className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 bg-gray-300 p-2 rounded-full hover:bg-gray-400 z-10">›</button>
    </div>
  );
};

export default AdvancedSlider;
