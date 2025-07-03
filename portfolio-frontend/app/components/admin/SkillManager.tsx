import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
}

const SkillManager = () => {
  const [newSkill, setNewSkill] = useState({
    name: '',
    category: '',
    level: 0
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: skills, isLoading } = useQuery<Skill[]>({
    queryKey: ['skills'],
    queryFn: async () => {
      const response = await fetch('/api/get-skills');
      if (!response.ok) throw new Error('Failed to fetch skills');
      return response.json();
    },
  });

  const addMutation = useMutation({
    mutationFn: async (skill: typeof newSkill) => {
      const response = await fetch('/api/add-skill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(skill),
      });
      if (!response.ok) throw new Error('Failed to add skill');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      setNewSkill({ name: '', category: '', level: 0 });
      toast({
        title: "Success",
        description: "Skill added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add skill",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/delete-skill?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete skill');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      toast({
        title: "Success",
        description: "Skill deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete skill",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.name && newSkill.category) {
      addMutation.mutate(newSkill);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this skill?')) {
      deleteMutation.mutate(id);
    }
  };

  const groupedSkills = skills?.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Skills</h2>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Add New Skill</CardTitle>
          <CardDescription className="text-gray-400">
            Add a new skill to your portfolio
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Skill name"
                value={newSkill.name}
                onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
              
              <Select 
                value={newSkill.category} 
                onValueChange={(value) => setNewSkill(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="frontend">Frontend</SelectItem>
                  <SelectItem value="backend">Backend</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                  <SelectItem value="devops">DevOps</SelectItem>
                  <SelectItem value="tools">Tools</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                type="number"
                placeholder="Level (0-100)"
                min="0"
                max="100"
                value={newSkill.level}
                onChange={(e) => setNewSkill(prev => ({ ...prev, level: parseInt(e.target.value) || 0 }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={addMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              {addMutation.isPending ? 'Adding...' : 'Add Skill'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-slate-800 rounded-lg h-32"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSkills || {}).map(([category, categorySkills]) => (
            <Card key={category} className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white capitalize">{category}</CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {categorySkills.map((skill) => (
                    <div key={skill.id} className="flex items-center space-x-2">
                      <Badge 
                        variant="secondary" 
                        className="bg-purple-900/50 text-purple-300 pr-1"
                      >
                        {skill.name}
                        {skill.level > 0 && (
                          <span className="ml-2 text-xs opacity-70">
                            {skill.level}%
                          </span>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(skill.id)}
                          className="ml-1 h-4 w-4 p-0 hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillManager;