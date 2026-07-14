import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  tags?: string[];
}

interface BlogFormProps {
  post?: Post | null;
  onClose: () => void;
}

const BlogForm = ({ post, onClose }: BlogFormProps) => {
  const [formData, setFormData] = useState({
    title: post?.title || '',
    content: post?.content || '',
    excerpt: post?.excerpt || '',
    tags: post?.tags?.join(', ') || '',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const url = post ? '/api/update-post' : '/api/add-post';
      const method = post ? 'PUT' : 'POST';

      const payload: Record<string, unknown> = {
        subject: data.title,
        content: data.content,
        badges: data.tags.split(',').map(t => t.trim()).filter(Boolean),
        ...(post && { id: post.id }),
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Failed to save post (${response.status})`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast({
        title: "Success",
        description: `Post ${post ? 'updated' : 'created'} successfully`,
      });
      onClose();
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : `Failed to ${post ? 'update' : 'create'} post`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={onClose}
          className="mr-4 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="text-2xl font-bold text-white">
          {post ? 'Edit Post' : 'Add New Post'}
        </h2>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Post Details</CardTitle>
          <CardDescription className="text-gray-400">
            Create or edit your blog post
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title
              </label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Post title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Excerpt
              </label>
              <Textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                rows={3}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Brief description of the post"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags (comma-separated)
              </label>
              <Input
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="react, typescript, web development"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Content
              </label>
              <Textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={15}
                className="bg-slate-700 border-slate-600 text-white font-mono text-sm"
                placeholder="Write your post content here..."
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-slate-600 text-gray-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {mutation.isPending ? 'Saving...' : (post ? 'Update' : 'Publish')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogForm;