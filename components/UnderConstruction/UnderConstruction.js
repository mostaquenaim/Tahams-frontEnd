import React from 'react';
import { Construction } from 'lucide-react';
import { motion } from 'framer-motion';

const UnderConstruction = ({
    title = 'Page Under Construction',
    message = 'We’re working hard to bring you this feature. Please check back soon.',
}) => {
    return (
        <div className="flex items-center justify-center min-h-[80vh] bg-gradient-to-b from-white via-gray-50 to-white px-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-xl text-center p-6 bg-white rounded-2xl shadow-xl border border-gray-100"
            >
                <div className="flex justify-center mb-4">
                    <div className="bg-yellow-100 text-yellow-600 p-4 rounded-full shadow-inner">
                        <Construction className="w-10 h-10" />
                    </div>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{title}</h1>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                    {message}
                </p>
            </motion.div>
        </div>
    );
};

export default UnderConstruction;
