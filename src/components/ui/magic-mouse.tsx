import { useEffect, useRef, useState } from "react";

const SMOOTHNESS = 0.15;

function isTabletOrMobile() {
  return window.matchMedia("(max-width: 1024px)").matches;
}

function MagicMouse() {
  const [isHidden, setIsHidden] = useState(false);
  const elRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const rafId = useRef(0);

  useEffect(() => {
    setIsHidden(isTabletOrMobile());
    const handleResize = () => setIsHidden(isTabletOrMobile());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isHidden) return;

    const onMouseMove = (e: MouseEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
    };

    const tick = () => {
      const dx = target.current.x - current.current.x;
      const dy = target.current.y - current.current.y;

      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        current.current.x += dx * SMOOTHNESS;
        current.current.y += dy * SMOOTHNESS;
      } else {
        current.current.x = target.current.x;
        current.current.y = target.current.y;
      }

      if (elRef.current) {
        elRef.current.style.transform = `translate3d(${current.current.x - 15}px, ${current.current.y - 15}px, 0)`;
      }

      rafId.current = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMouseMove);
    rafId.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(rafId.current);
    };
  }, [isHidden]);

  if (isHidden) return null;

  return <div ref={elRef} className="cursor-circle" />;
}

export default MagicMouse;
