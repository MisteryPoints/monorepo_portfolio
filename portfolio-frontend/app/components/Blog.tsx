import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, User, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchWithCache } from '@/lib/api';

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
  const { data: posts, isLoading, isPlaceholderData } = useQuery<Post[]>({
    queryKey: ['posts'],
    queryFn: () => fetchWithCache<Post[]>('/api/get-posts', 'posts'),
    placeholderData: (prev) => prev,
  });

  if (isLoading && !isPlaceholderData) {
    return (
      <section id="blog" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-16">Latest Blog Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-slate-700 rounded-lg h-48"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="blog" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-16">
          Latest Blog Posts
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts?.slice(0, 3).map((post) => (
            <Card key={post.id} className="bg-slate-800/50 border-slate-700 hover:border-purple-500 transition-all duration-300 group h-full cursor-pointer">
              <CardHeader>
                <CardTitle className="text-white group-hover:text-purple-400 transition-colors line-clamp-2">
                  {post.title}
                </CardTitle>
                <CardDescription className="text-gray-400 line-clamp-3">
                  {post.excerpt || post.content.substring(0, 150) + '...'}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags?.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-purple-900/50 text-purple-300">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{post.author?.name || 'Author'}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{Math.ceil(post.content.length / 1000)} min read</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {posts && posts.length > 3 && (
          <div className="text-center mt-12">
            <span className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all cursor-pointer">
              View All Posts <ChevronRight className="ml-2 h-4 w-4" />
            </span>
          </div>
        )}
      </div>
    </section>
  );
};

export default Blog;
