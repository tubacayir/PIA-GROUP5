import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import KpiCard, { type KpiCardProps } from "./KpiCard";

type KpiSliderProps = {
  items: KpiCardProps[];
  size?: "sm" | "lg";
};

export default function KpiSlider({ items, size = "sm" }: KpiSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToIndex = (index: number) => {
    const track = trackRef.current;
    if (!track) return;

    const clamped = Math.max(0, Math.min(index, items.length - 1));
    const slide = track.children[clamped] as HTMLElement | undefined;

    if (slide) {
      track.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
    }

    setActiveIndex(clamped);
  };

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;

    const slides = Array.from(track.children) as HTMLElement[];
    let closest = 0;
    let minDistance = Infinity;

    slides.forEach((slide, index) => {
      const distance = Math.abs(slide.offsetLeft - track.scrollLeft);
      if (distance < minDistance) {
        minDistance = distance;
        closest = index;
      }
    });

    setActiveIndex(closest);
  };

  return (
    <div className={`kpi-slider kpi-slider-${size}`}>
      <div className="kpi-slider-viewport">
        <button
          type="button"
          className="kpi-slider-arrow kpi-slider-arrow-prev"
          onClick={() => scrollToIndex(activeIndex - 1)}
          disabled={activeIndex === 0}
          aria-label="Previous cards"
        >
          <ChevronLeft size={size === "lg" ? 22 : 16} />
        </button>

        <div className="kpi-slider-track" ref={trackRef} onScroll={handleScroll}>
          {items.map((item) => (
            <div className="kpi-slider-slide" key={item.title}>
              <KpiCard {...item} size={size} />
            </div>
          ))}
        </div>

        <button
          type="button"
          className="kpi-slider-arrow kpi-slider-arrow-next"
          onClick={() => scrollToIndex(activeIndex + 1)}
          disabled={activeIndex === items.length - 1}
          aria-label="Next cards"
        >
          <ChevronRight size={size === "lg" ? 22 : 16} />
        </button>
      </div>

      <div className="kpi-slider-dots">
        {items.map((item, index) => (
          <button
            key={item.title}
            type="button"
            className={`kpi-slider-dot${index === activeIndex ? " kpi-slider-dot-active" : ""}`}
            onClick={() => scrollToIndex(index)}
            aria-label={`Go to ${item.title}`}
          />
        ))}
      </div>
    </div>
  );
}
