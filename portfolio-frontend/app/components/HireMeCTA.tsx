import React from 'react';
import { motion } from 'framer-motion';

const HireMeCTA = () => {
  return (
    <div className="fixed left-4 bottom-4 z-50">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <motion.svg
          viewBox="0 0 100 100"
          className="w-32 h-32 absolute"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          style={{ originX: '50%', originY: '50%' }}
        >
          <path
            id="circlePath"
            d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
            fill="transparent"
          />
          <text className="text-[10px] font-bold uppercase tracking-widest fill-slate-400">
            <textPath xlinkHref="#circlePath" startOffset="0%">
              Full Stack Developer • Available for Hire •
            </textPath>
          </text>
        </motion.svg>

        <a
          href="mailto:info@victortejada.dev"
          className="flex items-center justify-center bg-white text-black shadow-lg border border-solid border-black w-16 h-16 rounded-full font-semibold hover:bg-transparent hover:text-white hover:border-white transition-all duration-300 z-20 text-[10px]"
        >
          Hire Me
        </a>
      </div>
    </div>
  );
};

export default HireMeCTA;
