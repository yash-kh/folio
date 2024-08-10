import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Tooltip = ({
  children,
  message,
}: {
  children: React.ReactNode;
  message: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative inline-block cursor-default">
      <motion.div
        className="text-[#5BBCFF]"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
      </motion.div>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute top-[-40px] left-1/2 w-max bg-[#5BBCFF] text-[#000000] text-sm p-2 rounded shadow-lg z-10"
            initial={{ opacity: .8, transform: "translate(-50%, 20%)" }}
            animate={{ opacity: 1, transform: "translate(-50%, -50%)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {message}
            <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-[#5BBCFF]"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;
