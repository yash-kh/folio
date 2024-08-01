import React, { useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { SimpleIcon } from "simple-icons";

interface ScrollLineItem {
  text: string;
  IconComponent: SimpleIcon;
}

interface ScrollLineProps {
  items: ScrollLineItem[];
  moveLeft: boolean;
  speed: number;
}

const ScrollLine: React.FC<ScrollLineProps> = ({ items, moveLeft, speed }) => {
  const motionDivRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  useEffect(() => {
    const animate = async () => {
      const motionDivWidth = motionDivRef.current?.scrollWidth || 0;
      await controls.start({
        x: moveLeft
          ? [-motionDivWidth / 2 + 100, 0]
          : [0, -motionDivWidth / 2 + 100],
        transition: {
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: speed,
            ease: "linear",
          },
        },
      });
    };

    animate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controls]);

  return (
    <div className="relative overflow-hidden whitespace-nowrap">
      <motion.div
        className="inline-flex items-center space-x-4 p-2"
        ref={motionDivRef}
        animate={controls}
      >
        {[
          ...items,
          ...items,
          ...items,
          ...items,
          ...items,
          ...items,
          ...items,
          ...items,
          ...items,
          ...items,
          ...items,
          ...items,
          ...items,
        ].map((item, index) => (
          <React.Fragment key={index}>
            <svg
              role="img"
              viewBox="0 0 24 24"
              width="25"
              height="25"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d={item.IconComponent.path} />
            </svg>
            <span className="text-xl font-semibold">{item.text}</span>
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
};

export default ScrollLine;
