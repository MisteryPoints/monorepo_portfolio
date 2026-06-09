import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Github, ExternalLink, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fetchWithCache } from '@/lib/api';

interface Project {
  id: string;
  name: string;
  content: string;
  technologies: { name: string }[];
  githubUrl?: string;
  url?: string;
  images: string[];
  architecture?: string;
}

import { useTranslation } from '@/lib/translations';
import { AnimatedTooltip } from './AnimatedTooltip';

const Projects = () => {
  const { t, lang } = useTranslation();
  const { data: projects, isLoading, isPlaceholderData } = useQuery<Project[]>({
    queryKey: ['projects', lang],
    queryFn: () => fetchWithCache<Project[]>(`/api/get-projects?lang=${lang}`, `projects_${lang}`),
    placeholderData: (prev) => prev,
  });

  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading && !isPlaceholderData) {
    return (
      <section id="projects" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-16">{t('projects.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-slate-800 rounded-lg h-64"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-16">
          {t('projects.title')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {projects?.map((project) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden group hover:border-purple-500/50 transition-all duration-500 cursor-pointer"
              onClick={() => project.url && window.open(project.url, '_blank')}
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div className="aspect-square md:aspect-auto relative overflow-hidden">
                  <img
                    src={project.images?.[0] || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop'}
                    alt={project.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                </div>

                <div className="p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      {project.technologies?.slice(0, 5).map((tech, i) => (
                        <Badge key={i} variant="secondary" className="bg-purple-900/30 text-purple-400 border-purple-500/20">
                          {tech.name}
                        </Badge>
                      ))}
                    </div>

                    <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors">
                      {project.name}
                    </h3>

                    <p className="text-slate-400 mb-6 line-clamp-3 text-sm">
                      {project.content}
                    </p>

                    {project.architecture && (
                      <div className="mb-6 p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                        <div className="text-[10px] font-mono text-purple-400 uppercase tracking-widest mb-2">Technical Architecture</div>
                        <p className="text-xs text-slate-500 font-mono italic">
                          {project.architecture}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    {project.githubUrl && (
                      <Button size="sm" variant="outline" asChild className="border-slate-700 hover:border-purple-500 bg-transparent text-slate-300">
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                          <Github className="h-4 w-4 mr-2" />
                          Source
                        </a>
                      </Button>
                    )}
                    {project.url && (
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                        <a href={project.url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Demo
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
