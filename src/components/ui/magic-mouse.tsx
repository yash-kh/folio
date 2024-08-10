import { useEffect, useRef, useState } from "react";

function MagicMouse() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isUpdating = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const delay = 50;
  const smoothness = 0.4;

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

  return (
    <div
      className="cursor-circle"
      style={{
        top: position.y,
        left: position.x,
        position: "fixed"
      }}
    />
  );
}

export default MagicMouse;
