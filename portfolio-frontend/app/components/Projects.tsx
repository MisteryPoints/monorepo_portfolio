import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Github, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      <section id="projects" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-12">{t('projects.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-slate-800 rounded-lg h-48"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {t('projects.title')}
          </h2>
          <div className="w-12 h-px bg-slate-700 mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects?.map((project) => (
            <div
              key={project.id}
              className="bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all duration-300"
              onClick={() => project.url && window.open(project.url, '_blank')}
            >
              <div className="grid md:grid-cols-2">
                <div className="aspect-square md:aspect-auto relative overflow-hidden">
                  <img
                    src={project.images?.[0] || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop'}
                    alt={project.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-50" />
                </div>

                <div className="p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      {project.technologies?.slice(0, 4).map((tech, i) => (
                        <Badge key={i} variant="secondary" className="bg-slate-800 text-slate-400 border-slate-700 text-[10px]">
                          {tech.name}
                        </Badge>
                      ))}
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-2">
                      {project.name}
                    </h3>

                    <p className="text-slate-500 mb-4 line-clamp-2 text-sm">
                      {project.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {project.githubUrl && (
                      <Button size="sm" variant="outline" asChild className="border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 bg-transparent">
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                          <Github className="h-3.5 w-3.5 mr-1.5" />
                          Source
                        </a>
                      </Button>
                    )}
                    {project.url && (
                      <Button size="sm" className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700">
                        <a href={project.url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                          <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                          Demo
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default React.memo(Projects);
