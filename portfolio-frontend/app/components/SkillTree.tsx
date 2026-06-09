import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, Cpu, Globe, Database, Layout, Shield, Server, Code2, Braces, Container, GitMerge, Cloud, Lock, Terminal, Wrench } from 'lucide-react';
import { useState } from 'react';
import { fetchWithCache } from '@/lib/api';

interface SkillNode {
  id: string;
  name: string;
  icon?: string;
  category?: string;
  level?: number;
  children: SkillNode[];
}

const IconMap: Record<string, any> = {
  frontend: Layout,
  backend: Server,
  database: Database,
  infrastructure: Globe,
  security: Shield,
  core: Cpu,
  languages: Code2,
  devops: Container,
  tools: Wrench,
  cloud: Cloud,
  git: GitMerge,
  script: Terminal,
  typescript: Braces,
};

import { useTranslation } from '@/lib/translations';

const TreeNode = ({ node, depth = 0 }: { node: SkillNode; depth?: number }) => {
  const [isOpen, setIsOpen] = useState(depth < 1);
  const hasChildren = node.children && node.children.length > 0;
  const Icon = IconMap[node.category?.toLowerCase() || 'core'] || Cpu;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: depth * 0.1 }}
      className="relative"
    >
      {depth > 0 && (
        <div className="absolute left-[-1.5rem] top-0 w-6 h-full">
          <div className="absolute left-0 top-1/2 w-full h-px bg-gradient-to-r from-purple-500/30 to-transparent" />
          <div className="absolute left-0 top-0 w-px h-full bg-gradient-to-b from-purple-500/30 to-transparent" />
        </div>
      )}

      <div className="ml-4 md:ml-8 border-l border-slate-800/50 pl-4 py-2 hover:border-l-purple-500/30 transition-colors duration-300">
        <div
          className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 cursor-pointer group
            ${isOpen ? 'bg-slate-800/50 border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.1)]' : 'hover:bg-slate-800/20'} 
            border border-transparent`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-900 border border-slate-700 group-hover:border-purple-500 text-purple-400 group-hover:text-purple-300 transition-all duration-300 shadow-lg group-hover:shadow-purple-500/20">
            {hasChildren ? (
              <motion.div
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight size={16} />
              </motion.div>
            ) : (
              <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)] group-hover:shadow-[0_0_12px_rgba(168,85,247,0.8)] transition-shadow" />
            )}
          </div>

          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 group-hover:border-purple-500/50 transition-all duration-300">
            <Icon size={18} className="text-slate-400 group-hover:text-purple-300 transition-colors" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-200 font-medium group-hover:text-white truncate">{node.name}</span>
              {node.level != null && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-24 h-2 bg-slate-900 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${node.level}%` }}
                      transition={{ duration: 1.2, delay: 0.3 + depth * 0.1, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 rounded-full"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono tabular-nums">{node.level}%</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && hasChildren && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {node.children.map((child) => (
                <TreeNode key={child.id} node={child} depth={depth + 1} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const SkillTree = () => {
  const { t, lang } = useTranslation();
  const { data: skillTree, isLoading, isPlaceholderData } = useQuery<SkillNode[]>({
    queryKey: ['skillTree', lang],
    queryFn: () => fetchWithCache<SkillNode[]>(`/api/get-skill-tree?lang=${lang}`, `skillTree_${lang}`),
    placeholderData: (prev) => prev,
  });

  if (isLoading && !isPlaceholderData) {
    return (
      <div className="max-w-4xl mx-auto p-8 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 bg-slate-900/50 rounded-lg mb-4 border border-slate-800" />
        ))}
      </div>
    );
  }

  return (
    <section className="py-24 px-4 bg-slate-950/50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent" />
      <div className="absolute left-1/4 top-0 w-px h-full bg-gradient-to-b from-purple-500/10 via-transparent to-purple-500/10" />
      <div className="absolute right-1/4 top-0 w-px h-full bg-gradient-to-b from-pink-500/10 via-transparent to-pink-500/10" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="mb-16 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold mb-4 tracking-tighter"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-slate-400">
              {t('skills.title')}
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 font-mono text-sm"
          >
            {t('skills.subtitle')}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-6 md:p-10 shadow-2xl hover:border-slate-700/50 transition-colors"
        >
          {skillTree?.map((root) => (
            <TreeNode key={root.id} node={root} />
          ))}
        </motion.div>

        <div className="mt-12 flex justify-center gap-8 text-slate-500 text-xs font-mono">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.5)]" />
            <span>Mastered</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-slate-700" />
            <span>In Progress</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SkillTree;
