import { motion } from "framer-motion";

function Header() {
  return (
    <header className="flex justify-center items-center">
      <div className="min-w-96">
        <motion.div
          className="header-group backdrop-blur-md flex justify-around items-center h-20 relative"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            className="py-3 px-5 header-btn bright-card active m-2"
          >
            Start
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            className="py-3 px-5 header-btn bright-card m-2"
          >
            Work
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            className="py-3 px-5 header-btn bright-card m-2"
          >
            Projects
          </motion.button>
        </motion.div>
      </div>
    </header>
  );
}

export default Header;
