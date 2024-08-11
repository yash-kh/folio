import { useEffect, useRef, useState } from "react";

function isTabletOrMobile() {
  return window.matchMedia("(max-width: 1024px)").matches;
}

function MagicMouse() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHidden, setIsHidden] = useState(false);
  const isUpdating = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const delay = 50;
  const smoothness = 0.4;

  useEffect(() => {
    setIsHidden(isTabletOrMobile());

    const handleResize = () => {
      setIsHidden(isTabletOrMobile());
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleMouseMove = (event: MouseEvent) => {
    lastPos.current = {
      x: event.clientX,
      y: event.clientY,
    };

    if (!isUpdating.current) {
      isUpdating.current = true;
      setPosition(lastPos.current);

      setTimeout(() => {
        isUpdating.current = false;
      }, delay);
    }
  };

  useEffect(() => {
    const updatePosition = () => {
      if (!isUpdating.current) {
        setPosition((prev) => ({
          x: prev.x + (lastPos.current.x - prev.x) * smoothness,
          y: prev.y + (lastPos.current.y - prev.y) * smoothness,
        }));
      }
      requestAnimationFrame(updatePosition);
    };

    window.addEventListener("mousemove", handleMouseMove);
    requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  if (isHidden) return null;

  return (
    <div
      className="cursor-circle"
      style={{
        top: position.y,
        left: position.x,
        position: "fixed",
      }}
    />
  );
}

export default MagicMouse;
