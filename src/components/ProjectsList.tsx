import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, FolderKanban } from 'lucide-react';
import { projectApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import CreateProjectDialog from './CreateProjectDialog';

const ProjectsList = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCreateProjectOpen, setCreateProjectOpen] = useState(false);
  
  const { data: projects, isLoading, error, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
          try {
            const response = await projectApi.getAll();
            return response.data.data;
          } catch (error) {
            console.error('Error fetching projects:', error);
            toast({
              title: "Error",
              description: "Failed to fetch projects",
              variant: "destructive",
            });
            return [];
          }
        },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5" />
            Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading projects...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5" />
              Projects
            </CardTitle>
            <CardDescription>
              Manage your projects and track progress
            </CardDescription>
          </div>
          <Button onClick={() => setCreateProjectOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {projects && projects.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Lead</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project: any) => (
                <TableRow key={project.name}>
                  <TableCell className="font-medium">
                    <span className="text-blue-700 cursor-pointer underline" onClick={() => navigate(`/tasks?project=${project.name}`)}>
                      {project.project_name || 'Untitled Project'}
                    </span>
                  </TableCell>
                  <TableCell>{project.description || 'No description'}</TableCell>
                  <TableCell>{project.status || 'Active'}</TableCell>
                  <TableCell>{project.start_date || 'N/A'}</TableCell>
                  <TableCell>{project.end_date || 'N/A'}</TableCell>
                  <TableCell>{project.project_lead || 'N/A'}</TableCell>
                  <TableCell>{Array.isArray(project.tags) ? project.tags.join(', ') : project.tags || 'N/A'}</TableCell>
                  <TableCell>{project.weight || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">Get started by creating your first project</p>
            <Button onClick={() => setCreateProjectOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </div>
        )}
      </CardContent>
            <CreateProjectDialog
              isOpen={isCreateProjectOpen}
              onClose={() => setCreateProjectOpen(false)}
              onProjectCreated={refetch}
            />
    </Card>
  );
};

export default ProjectsList;
