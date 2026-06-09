import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/lib/translations';

const techUrls: Record<string, string> = {
  Golang: 'https://go.dev',
  React: 'https://react.dev',
  TypeScript: 'https://www.typescriptlang.org',
  PostgreSQL: 'https://www.postgresql.org',
  Docker: 'https://www.docker.com',
  'Next.js': 'https://nextjs.org',
  AWS: 'https://aws.amazon.com',
  GSAP: 'https://gsap.com',
  Tailwind: 'https://tailwindcss.com',
  Framer: 'https://www.framer.com/motion',
  Redis: 'https://redis.io',
  gRPC: 'https://grpc.io',
  Python: 'https://www.python.org',
  SAS: 'https://www.sas.com',
  Node: 'https://nodejs.org',
  Kubernetes: 'https://kubernetes.io',
  Go: 'https://go.dev',
};

const SkillItem = ({ x, y, name }: { x: string, y: string, name: string }) => {
  const url = techUrls[name];
  const Tag = url ? 'a' : 'div';

  return (
    <motion.div
      initial={{ x: 0, y: 0, opacity: 0 }}
      whileInView={{ x, y, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.5, type: 'spring' }}
      className="absolute flex items-center justify-center"
    >
      <Tag
        {...(url ? { href: url, target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="group relative flex items-center justify-center"
      >
        <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center hover:border-purple-500 hover:bg-slate-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/20 cursor-pointer">
          <span className="text-xs font-bold text-slate-400 group-hover:text-purple-400 transition-colors">{name[0]}</span>
        </div>

        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-medium rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-50 shadow-lg">
          {name}
          {url && <span className="ml-1 opacity-60">↗</span>}
        </div>
      </Tag>
    </motion.div>
  );
};

const SkillWheel = () => {
  const { t } = useTranslation();

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center overflow-hidden py-20">
      <h2 className="absolute top-0 text-3xl font-bold text-white mb-10">{t('skills.title')}</h2>

      {/* Central Hub */}
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600/30 to-pink-600/20 border-2 border-purple-500 flex items-center justify-center z-10 backdrop-blur-md shadow-[0_0_50px_rgba(168,85,247,0.3)]"
      >
        <span className="text-white font-bold text-sm text-center leading-tight">Full<br/>Stack</span>
      </motion.div>

      {/* Orbit Rings */}
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        transition={{ duration: 0.6 }}
        className="absolute w-[200px] h-[200px] border border-slate-800 rounded-full"
      />
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="absolute w-[350px] h-[350px] border border-slate-800/50 rounded-full"
      />
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="absolute w-[500px] h-[500px] border border-slate-800/30 rounded-full"
      />

      {/* Skills Nodes */}
      <SkillItem name="Golang" x="-120px" y="-50px" />
      <SkillItem name="React" x="120px" y="-50px" />
      <SkillItem name="TypeScript" x="0px" y="-140px" />
      <SkillItem name="PostgreSQL" x="0px" y="140px" />
      <SkillItem name="Docker" x="-100px" y="100px" />
      <SkillItem name="Next.js" x="100px" y="100px" />

      {/* Outer Ring */}
      <SkillItem name="AWS" x="-220px" y="-100px" />
      <SkillItem name="GSAP" x="220px" y="-100px" />
      <SkillItem name="Tailwind" x="-220px" y="100px" />
      <SkillItem name="Framer" x="220px" y="100px" />
      <SkillItem name="Redis" x="0px" y="-220px" />
      <SkillItem name="gRPC" x="0px" y="220px" />

      {/* Extra outer nodes */}
      <SkillItem name="Python" x="-160px" y="-200px" />
      <SkillItem name="Kubernetes" x="160px" y="-200px" />
      <SkillItem name="SAS" x="-160px" y="200px" />
      <SkillItem name="Node" x="160px" y="200px" />
    </div>
  );
};

export default SkillWheel;
