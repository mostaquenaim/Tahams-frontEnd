import Link from "next/link";
import { motion } from "framer-motion";

const ShowNewArrival = ({ prop }) => {
    // console.log(prop,'proooooo');
    if (!prop) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, ease: "easeOut" }} 
            className="relative w-4/5 h-full mx-auto group cursor-pointer"
        >
            <Link href={`/products/${prop.subsub?.id}`} className="block overflow-hidden rounded-xl shadow-lg">
                {/* Image with Animated Hover Effect */}
                <div className="relative overflow-hidden rounded-xl">
                    <motion.img 
                        src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${prop.filename}` || "/placeholder.jpg"} 
                        alt={prop.name || "New Arrival"} 
                        className="w-full h-full object-cover rounded-xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-1 group-hover:brightness-90"
                        loading="lazy"
                    />
                    
                    {/* Glassmorphism Overlay */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex flex-col justify-end p-6 rounded-xl">
                        <motion.h3 
                            initial={{ y: 20, opacity: 0 }} 
                            animate={{ y: 0, opacity: 1 }} 
                            transition={{ duration: 0.5, ease: "easeOut" }} 
                            className="text-white text-base md:text-lg lg:text-xl font-bold tracking-wide drop-shadow-md"
                        >
                            {prop.name}
                        </motion.h3>
                        <motion.p 
                            initial={{ y: 20, opacity: 0 }} 
                            animate={{ y: 0, opacity: 1 }} 
                            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                            className="text-gray-300 text-sm uppercase tracking-wider"
                        >
                            {prop.subsub?.name}
                        </motion.p>
                    </div>
                    
                    {/* Neon Glow Border on Hover */}
                    <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-blue-500 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] transition-all duration-700"></div>
                    
                    {/* Floating 3D Effect */}
                    <motion.div 
                        initial={{ scale: 1 }} 
                        whileHover={{ scale: 1.05, y: -5 }} 
                        transition={{ duration: 0.5, ease: "easeOut" }} 
                        className="absolute inset-0"
                    />
                </div>
            </Link>
        </motion.div>
    );
};

export default ShowNewArrival;
