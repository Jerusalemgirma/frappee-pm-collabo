
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ProjectsList from '@/components/ProjectsList';

const Projects = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Projects</h1>
        <p className="text-muted-foreground">Manage and track all your projects</p>
      </div>
      
      <ProjectsList />
    </div>
  );
};

export default Projects;
