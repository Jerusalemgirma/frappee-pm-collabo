import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FolderKanban, Target, CheckSquare, Calendar, Users } from 'lucide-react';
import ProjectsList from '@/components/ProjectsList';
import EpicsList from '@/components/EpicsList';
import TasksList from '@/components/TasksList';
import SprintsList from '@/components/SprintsList';
import TeamManagement from '@/components/TeamManagement';
import { useQuery } from '@tanstack/react-query';
import { projectApi, epicApi, taskApi, sprintApi } from '@/services/api';
import { groupApi } from '@/services/userApi';

const Index = () => {
  const [activeTab, setActiveTab] = useState('projects');

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => (await projectApi.getAll()).data.data || [],
  });

  const { data: epics = [] } = useQuery({
    queryKey: ['epics'],
    queryFn: async () => (await epicApi.getAll()).data.data || [],
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => (await taskApi.getAll()).data.data || [],
  });

  const { data: sprints = [] } = useQuery({
    queryKey: ['sprints'],
    queryFn: async () => (await sprintApi.getAll()).data.data || [],
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => (await groupApi.getAll()).data.data || [],
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Project Management Dashboard</h1>
        <p className="text-muted-foreground">Manage your projects, epics, tasks, sprints, and teams</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">Active projects</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Epics</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{epics.length}</div>
            <p className="text-xs text-muted-foreground">Open epics</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
            <p className="text-xs text-muted-foreground">Open tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sprints</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sprints.length}</div>
            <p className="text-xs text-muted-foreground">Active sprints</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams.length}</div>
            <p className="text-xs text-muted-foreground">Active teams</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="epics">Epics</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="sprints">Sprints</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
        </TabsList>
        
        <TabsContent value="projects" className="mt-6">
          <ProjectsList />
        </TabsContent>
        
        <TabsContent value="epics" className="mt-6">
          <EpicsList />
        </TabsContent>
        
        <TabsContent value="tasks" className="mt-6">
          <TasksList />
        </TabsContent>
        
        <TabsContent value="sprints" className="mt-6">
          <SprintsList />
        </TabsContent>
        
        <TabsContent value="teams" className="mt-6">
          <TeamManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
