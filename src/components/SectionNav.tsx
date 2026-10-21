import { useEffect, useState } from "react";
const items = [
  ["overview", "Tổng quan"],
  ["itinerary", "Lịch trình"],
  ["packages", "Gói dịch vụ"],
  ["departures", "Lịch khởi hành"],
  ["policies", "Chính sách"],
  ["reviews", "Đánh giá"],
  ["faq", "Hỏi đáp"],
];
export function SectionNav() {
  const [active, setActive] = useState("overview");
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries.find((e) => e.isIntersecting);
        if (entry) setActive(entry.target.id);
      },
      { rootMargin: "-145px 0px -55% 0px", threshold: 0 },
    );
    items.forEach(([id]) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);
  return (
    <nav className="section-nav" aria-label="Mục lục hành trình">
      {items.map(([id, label]) => (
        <a
          key={id}
          href={"#" + id}
          aria-current={active === id ? "location" : undefined}
          className={active === id ? "active" : ""}
          onClick={() => setActive(id)}
        >
          {label}
        </a>
      ))}
    </nav>
  );
}
