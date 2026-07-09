import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, User, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchWithCache } from '@/lib/api';
import { useTranslation } from '@/lib/translations';

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  tags?: string[];
  created_at: string;
  author?: {
    name: string;
    avatar?: string;
  };
}

const Blog = () => {
  const { t } = useTranslation();
  const { data: posts, isLoading, isPlaceholderData } = useQuery<Post[]>({
    queryKey: ['posts'],
    queryFn: () => fetchWithCache<Post[]>('/api/get-posts', 'posts'),
    placeholderData: (prev) => prev,
  });

  if (isLoading && !isPlaceholderData) {
    return (
      <section id="blog" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-12">{t('blog.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
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
    <section id="blog" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {t('blog.title')}
          </h2>
          <div className="w-12 h-px bg-slate-700 mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts?.slice(0, 3).map((post) => (
            <Card key={post.id} className="bg-slate-900/30 border-slate-800 hover:border-slate-700 transition-all duration-300 group h-full cursor-pointer">
              <CardHeader>
                <CardTitle className="text-white group-hover:text-purple-400 transition-colors line-clamp-2 text-lg">
                  {post.title}
                </CardTitle>
                <CardDescription className="text-slate-500 line-clamp-3 text-sm">
                  {post.excerpt || post.content.substring(0, 150) + '...'}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags?.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-slate-800 text-slate-400 border-slate-700 text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-slate-600">
                  <div className="flex items-center space-x-2">
                    <User className="h-3.5 w-3.5" />
                    <span>{post.author?.name || t('blog.author')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center mt-2 text-xs text-slate-600">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{Math.ceil(post.content.length / 1000)} {t('blog.minRead')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {posts && posts.length > 3 && (
          <div className="text-center mt-12">
            <span className="inline-flex items-center px-6 py-3 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-all cursor-pointer text-sm border border-slate-700">
              {t('blog.viewAll')} <ChevronRight className="ml-2 h-4 w-4" />
            </span>
          </div>
        )}
      </div>
    </section>
  );
};

export default React.memo(Blog);
