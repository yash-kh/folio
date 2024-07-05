import { useEffect, useRef, useState } from "react";

function MagicMouse() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isUpdating = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const delay = 50;

  const handleMouseMove = (event: MouseEvent) => {
    if (!isUpdating.current) {
      isUpdating.current = true;
      setPosition({
        x: event.clientX,
        y: event.clientY,
      });

      setTimeout(() => {
        isUpdating.current = false;
      }, delay);
    }
    lastPos.current = {
      x: event.clientX,
      y: event.clientY,
    };
  };

  setInterval(() => {
    if (isUpdating.current) return;
    setPosition(lastPos.current);
  }, 1000);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
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
      }}
    />
  );
}

export default MagicMouse;
