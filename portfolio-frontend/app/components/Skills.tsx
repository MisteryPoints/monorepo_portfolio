
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';

interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
}

const Skills = () => {
  const { data: skills, isLoading } = useQuery<Skill[]>({
    queryKey: ['skills'],
    queryFn: async () => {
      const response = await fetch('/api/get-skills');
      if (!response.ok) throw new Error('Failed to fetch skills');
      return response.json();
    },
  });

  const groupedSkills = skills?.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  if (isLoading) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-16">Skills & Technologies</h2>
          <div className="animate-pulse space-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-slate-800 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-400 mb-16">
          Skills & Technologies
        </h2>
        
        <div className="space-y-12">
          {Object.entries(groupedSkills || {}).map(([category, categorySkills]) => (
            <div key={category} className="text-center">
              <h3 className="text-2xl font-semibold text-white mb-6 capitalize">
                {category}
              </h3>
              
              <div className="flex flex-wrap justify-center gap-3">
                {categorySkills.map((skill) => (
                  <Badge 
                    key={skill.id} 
                    variant="secondary" 
                    className="bg-linear-to-r from-slate-700 to-slate-800 text-white px-4 py-2 text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 cursor-default"
                  >
                    {skill.name}
                    {skill.level && (
                      <span className="ml-2 text-xs opacity-70">
                        {skill.level}%
                      </span>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;