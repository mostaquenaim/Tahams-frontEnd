import { motion } from "framer-motion";

const TriangleLoader = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <motion.div
        className="relative w-20 h-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      >
        {/* White Triangle */}
        <div className="absolute top-0 left-0 w-0 h-0 border-l-[40px] border-r-[40px] border-b-[70px] border-l-transparent border-r-transparent border-b-white"></div>

        {/* Black Triangle (rotated) */}
        <div className="absolute top-0 left-0 w-0 h-0 border-l-[40px] border-r-[40px] border-b-[70px] border-l-transparent border-r-transparent border-b-black rotate-180"></div>
      </motion.div>
    </div>
  );
};

export default TriangleLoader;
