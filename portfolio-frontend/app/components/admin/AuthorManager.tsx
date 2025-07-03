import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

interface Author {
  id: string;
  name: string;
  bio?: string;
  avatar?: string;
  email?: string;
  social_links?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
}

const AuthorManager = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    avatar: '',
    email: '',
    twitter: '',
    github: '',
    linkedin: '',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: authors, isLoading } = useQuery<Author[]>({
    queryKey: ['authors'],
    queryFn: async () => {
      const response = await fetch('/api/get-authors');
      if (!response.ok) throw new Error('Failed to fetch authors');
      return response.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const url = editingAuthor ? '/api/update-author' : '/api/add-author';
      const method = editingAuthor ? 'PUT' : 'POST';
      
      const payload = {
        name: data.name,
        bio: data.bio,
        avatar: data.avatar,
        email: data.email,
        social_links: {
          twitter: data.twitter,
          github: data.github,
          linkedin: data.linkedin,
        },
        ...(editingAuthor && { id: editingAuthor.id }),
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save author');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] });
      resetForm();
      toast({
        title: "Success",
        description: `Author ${editingAuthor ? 'updated' : 'created'} successfully`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to ${editingAuthor ? 'update' : 'create'} author`,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/delete-author?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete author');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] });
      toast({
        title: "Success",
        description: "Author deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete author",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      bio: '',
      avatar: '',
      email: '',
      twitter: '',
      github: '',
      linkedin: '',
    });
    setShowForm(false);
    setEditingAuthor(null);
  };

  const handleEdit = (author: Author) => {
    setEditingAuthor(author);
    setFormData({
      name: author.name,
      bio: author.bio || '',
      avatar: author.avatar || '',
      email: author.email || '',
      twitter: author.social_links?.twitter || '',
      github: author.social_links?.github || '',
      linkedin: author.social_links?.linkedin || '',
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this author?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Authors</h2>
        <Button onClick={() => setShowForm(true)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Author
        </Button>
      </div>

      {showForm && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">
              {editingAuthor ? 'Edit Author' : 'Add New Author'}
            </CardTitle>
            <CardDescription className="text-gray-400">
              Fill in the author information
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="bg-slate-700 border-slate-600 text-white"
                />
                
                <Input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              
              <Input
                name="avatar"
                type="url"
                placeholder="Avatar URL"
                value={formData.avatar}
                onChange={handleChange}
                className="bg-slate-700 border-slate-600 text-white"
              />
              
              <Textarea
                name="bio"
                placeholder="Bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                className="bg-slate-700 border-slate-600 text-white"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  name="twitter"
                  placeholder="Twitter URL"
                  value={formData.twitter}
                  onChange={handleChange}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                
                <Input
                  name="github"
                  placeholder="GitHub URL"
                  value={formData.github}
                  onChange={handleChange}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                
                <Input
                  name="linkedin"
                  placeholder="LinkedIn URL"
                  value={formData.linkedin}
                  onChange={handleChange}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="border-slate-600 text-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {saveMutation.isPending ? 'Saving...' : (editingAuthor ? 'Update' : 'Create')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-slate-800 rounded-lg h-48"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {authors?.map((author) => (
            <Card key={author.id} className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={author.avatar} alt={author.name} />
                    <AvatarFallback className="bg-purple-600">
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <CardTitle className="text-white">{author.name}</CardTitle>
                    <CardDescription className="text-gray-400">
                      {author.email}
                    </CardDescription>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(author)}
                      className="border-slate-600 hover:border-purple-400"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(author.id)}
                      className="border-slate-600 hover:border-red-400 text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {author.bio && (
                <CardContent>
                  <p className="text-gray-300 text-sm">{author.bio}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuthorManager;
