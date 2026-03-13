import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const sections = ["about-me", "work", "projects", "stack-match"];

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function Header() {
  const [active, setActive] = useState("about-me");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px" }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center items-center py-2 backdrop-blur-md" style={{ pointerEvents: "auto", backgroundColor: 'rgba(var(--folio-bg-rgb), 0.8)' }}>
      <div className="w-full max-w-2xl px-4">
        <motion.div
          className="header-group backdrop-blur-md flex justify-between items-center h-16 relative"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <button onClick={() => scrollTo("about-me")} className="text-xl font-bold tracking-tight px-4 cursor-pointer">
            Yash
          </button>
          <div className="flex items-center" style={{ position: "relative", zIndex: 10 }}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              className={`py-2 px-4 header-btn bright-card m-1 text-sm cursor-pointer ${active === "about-me" ? "active" : ""}`}
              onClick={() => scrollTo("about-me")}
            >
              About
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              className={`py-2 px-4 header-btn bright-card m-1 text-sm cursor-pointer ${active === "work" ? "active" : ""}`}
              onClick={() => scrollTo("work")}
            >
              Work
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              className={`py-2 px-4 header-btn bright-card m-1 text-sm cursor-pointer ${active === "projects" ? "active" : ""}`}
              onClick={() => scrollTo("projects")}
            >
              Projects
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              className={`py-2 px-4 header-btn bright-card m-1 text-sm cursor-pointer ${active === "stack-match" ? "active" : ""}`}
              onClick={() => scrollTo("stack-match")}
            >
              Play
            </motion.button>
          </div>
        </motion.div>
      </div>
    </header>
  );
}

export default Header;
