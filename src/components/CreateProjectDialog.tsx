import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { projectApi } from '@/services/api';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/services/userApi';

const STATUS_OPTIONS = ['Planned', 'In Progress', 'On Hold', 'Completed', 'Cancelled'];

const CreateProjectDialog = ({ isOpen, onClose, onProjectCreated }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Planned');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [projectLead, setProjectLead] = useState('none');
  const [tags, setTags] = useState('');
  const [weight, setWeight] = useState(1);

  // Fetch users for project lead selection
  const { data: usersResponse } = useQuery({
    queryKey: ['users'],
    queryFn: async () => await userApi.getAll(),
  });
  const users = usersResponse?.data?.data || [];

  const createProjectMutation = useMutation({
    mutationFn: (newProject) => projectApi.create(newProject),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Project created successfully.',
      });
      queryClient.invalidateQueries(['projects']);
      onProjectCreated();
      onClose();
      // Reset form
      setProjectName('');
      setDescription('');
      setStatus('Planned');
      setStartDate('');
      setEndDate('');
      setProjectLead('none');
      setTags('');
      setWeight(1);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create project.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = () => {
    if (!projectName) {
      toast({
        title: 'Error',
        description: 'Project name is required.',
        variant: 'destructive',
      });
      return;
    }
    
    const projectData = {
      project_name: projectName,
      description,
      status,
      start_date: startDate,
      end_date: endDate,
      project_lead: projectLead !== 'none' ? projectLead : undefined,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      weight: parseInt(weight)
    };
    
    // Debug logging
    console.log('Submitting project data:', projectData);
    console.log('Project lead value:', projectLead);
    console.log('Project lead type:', typeof projectLead);
    
    createProjectMutation.mutate(projectData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new project.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name *</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((statusOption) => (
                    <SelectItem key={statusOption} value={statusOption}>
                      {statusOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter project description"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <DatePicker 
                id="startDate" 
                value={startDate ? new Date(startDate) : undefined} 
                onChange={date => setStartDate(date ? date.toISOString().slice(0, 10) : '')} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <DatePicker 
                id="endDate" 
                value={endDate ? new Date(endDate) : undefined} 
                onChange={date => setEndDate(date ? date.toISOString().slice(0, 10) : '')} 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectLead">Project Lead</Label>
              <Select value={projectLead} onValueChange={setProjectLead}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project lead (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Project Lead</SelectItem>
                  {users.map((user: any) => (
                    <SelectItem key={user.name} value={user.name}>
                      {user.full_name || user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight</Label>
              <Input
                id="weight"
                type="number"
                min="1"
                max="10"
                value={weight}
                onChange={(e) => setWeight(parseInt(e.target.value) || 1)}
                placeholder="1-10"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Enter tags separated by commas (e.g., frontend, backend, urgent)"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createProjectMutation.isLoading}>
            {createProjectMutation.isLoading ? 'Creating...' : 'Create Project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;