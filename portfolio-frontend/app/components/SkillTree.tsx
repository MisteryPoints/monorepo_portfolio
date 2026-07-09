import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Cpu, Globe, Database, Layout, Shield, Server, Code2, Braces, Container, GitMerge, Cloud, Lock, Terminal, Wrench } from 'lucide-react';
import { useState } from 'react';
import { fetchWithCache } from '@/lib/api';
import { useTranslation } from '@/lib/translations';
import { useInView } from '@/hooks/use-in-view';

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

const TreeNode = ({ node, depth = 0 }: { node: SkillNode; depth?: number }) => {
  const [isOpen, setIsOpen] = useState(depth < 1);
  const hasChildren = node.children && node.children.length > 0;
  const Icon = IconMap[node.category?.toLowerCase() || 'core'] || Cpu;
  const [nodeRef, nodeInView] = useInView();

  return (
    <div
      ref={nodeRef}
      className={`relative transition-all duration-500 ease-out ${
        nodeInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
      }`}
      style={{ transitionDelay: `${depth * 0.1}s` }}
    >
      {depth > 0 && (
        <div className="absolute left-[-1.5rem] top-0 w-6 h-full">
          <div className="absolute left-0 top-1/2 w-full h-px bg-slate-700/50" />
          <div className="absolute left-0 top-0 w-px h-full bg-slate-700/50" />
        </div>
      )}

      <div className="ml-4 md:ml-8 border-l border-slate-800 pl-4 py-2">
        <div
          className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 cursor-pointer ${
            isOpen ? 'bg-slate-800/30' : 'hover:bg-slate-800/20'
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-slate-900 border border-slate-700 text-slate-400">
            {hasChildren ? (
              <div className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : 'rotate-0'}`}>
                <ChevronRight size={14} />
              </div>
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            )}
          </div>

          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-slate-900 border border-slate-700">
            <Icon size={16} className="text-slate-400" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-300 font-medium text-sm truncate">{node.name}</span>
              {node.level != null && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500/60 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: nodeInView ? `${node.level}%` : '0%',
                        transitionDelay: `${0.3 + depth * 0.1}s`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-600 font-mono">{node.level}%</span>
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
    </div>
  );
};

const SkillTree = () => {
  const { t, lang } = useTranslation();
  const [titleRef, titleInView] = useInView<HTMLHeadingElement>();
  const [subtitleRef, subtitleInView] = useInView<HTMLParagraphElement>();

  const { data: skillTree, isLoading, isPlaceholderData } = useQuery<SkillNode[]>({
    queryKey: ['skillTree', lang],
    queryFn: () => fetchWithCache<SkillNode[]>(`/api/get-skill-tree?lang=${lang}`, `skillTree_${lang}`),
    placeholderData: (prev) => prev,
  });

  if (isLoading && !isPlaceholderData) {
    return (
      <section id="skills" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 text-center">
            <div className="h-10 w-48 bg-slate-800/60 rounded mx-auto animate-pulse" />
            <div className="h-3 w-36 bg-slate-800/40 rounded mx-auto mt-3 animate-pulse" />
          </div>
          <div className="max-w-4xl mx-auto animate-pulse space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 bg-slate-900/50 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="skills" className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12 text-center">
          <h2
            ref={titleRef}
            className={`text-3xl md:text-4xl font-bold text-white mb-3 transition-all duration-700 ${
              titleInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
          >
            {t('skills.title')}
          </h2>
          <p
            ref={subtitleRef}
            className={`text-slate-500 text-sm transition-all duration-700 delay-200 ${
              subtitleInView ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {t('skills.subtitle')}
          </p>
          <div className="w-12 h-px bg-slate-700 mx-auto mt-4" />
        </div>

        <div className="bg-slate-900/20 rounded-xl border border-slate-800/50 p-6">
          {skillTree?.map((root) => (
            <TreeNode key={root.id} node={root} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SkillTree;
