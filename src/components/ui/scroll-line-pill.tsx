import { useRef } from "react";
import { ScrollLineItem } from "./scroll-line";
import { motion, useInView } from "framer-motion";

function ScrollLinePill({ item }: { item: ScrollLineItem }) {
  const ref = useRef(null);
  const inView = useInView(ref);

  return (
    <motion.div
      className="flex items-center bright-card py-1 px-3 m-1"
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={
        inView
          ? { opacity: 1, scale: [0.8, 1], translateY: 0 }
          : { opacity: 0, translateY: -30 }
      }
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <svg
        role="img"
        viewBox="0 0 24 24"
        width="25"
        height="25"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className="mr-2"
      >
        <path d={item.IconComponent.path} />
      </svg>
      <span className="text-xl font-semibold">{item.text}</span>
    </motion.div>
  );
}

export default ScrollLinePill;
