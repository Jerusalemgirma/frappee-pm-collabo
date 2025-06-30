                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, User, Edit, Trash2 } from 'lucide-react';
import { groupApi, userApi } from '@/services/userApi';
import { projectApi, taskApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { MultiSelect } from '@/components/ui/multi-select';
import { workloadApi } from '@/services/workloadApi';

const TeamManagement = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [assignTasksOpen, setAssignTasksOpen] = useState(false);
  const [activeTeam, setActiveTeam] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTeam, setEditTeam] = useState<any>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTeam, setDeleteTeam] = useState<any>(null);

  const { data: teamsData, isLoading: teamsLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const response = await groupApi.getAll();
            return response.data.data || [];
    },
  });

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await userApi.getAll();
            return response.data.data || [];
    },
  });

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await projectApi.getAll();
            return response.data.data || [];
    },
  });

  const { data: tasksData } = useQuery({
    queryKey: ['tasks', activeTeam?.project],
    queryFn: async () => {
      if (!activeTeam?.project) return [];
      const response = await taskApi.getAll();
      const allTasks = response.data.data || [];
      return allTasks.filter((task: any) => task.project === activeTeam.project);
    },
    enabled: !!activeTeam?.project,
  });

  // Ensure teams is always an array
  const teams = teamsData || [];

  // Ensure users is always an array
  const users = Array.isArray(usersData) ? usersData : (usersData?.data && Array.isArray(usersData.data)) ? usersData.data : [];

  const projects = projectsData || [];

  const tasksForProject = tasksData || [];

  const userOptions = users.map((user: any) => ({ value: user.id, label: user.name }));

  useEffect(() => {
    console.log("TeamManagement state changed:", {
      teams,
      users,
      projects,
      userOptions
    });
  }, [teams, users, projects, userOptions]);

  console.log('TeamManagement - Teams data structure:', { teamsData, teams, isTeamsArray: Array.isArray(teams) });
  console.log('TeamManagement - Users data structure:', { usersData, users, isUsersArray: Array.isArray(users) });

  const createTeamMutation = useMutation({
    mutationFn: async (teamData: any) => {
      return await groupApi.create(teamData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setIsCreateOpen(false);
      setTeamName('');
      setTeamDescription('');
      setSelectedMembers([]);
      setSelectedProject('');
      toast({
        title: "Team Created",
        description: "New team has been created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create team",
        variant: "destructive",
      });
    }
  });

  const handleCreateTeam = () => {
    if (!teamName.trim()) {
      toast({
        title: "Error",
        description: "Team name is required",
        variant: "destructive",
      });
      return;
    }
    if (!selectedProject) {
      toast({
        title: "Error",
        description: "Project is required",
        variant: "destructive",
      });
      return;
    }
    const payload = {
      doctype: "Team",
      team_name: teamName,
      description: teamDescription,
      leader: selectedMembers[0] || null,
      project: selectedProject,
      ...(selectedMembers.length > 0 && {
        members: selectedMembers
          .filter(Boolean)
          .map(m => ({
            doctype: "Team Member",
            member: m
          }))
      })
    };
    console.log('Team creation payload:', payload);
    createTeamMutation.mutate(payload);
  };

  const toggleMemberSelection = (userId: string) => {
    setSelectedMembers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const getUserById = (id: string) => {
    return users.find((user: any) => user.id === id);
  };

  const openAssignTasks = (team: any) => {
    setActiveTeam(team);
    setAssignTasksOpen(true);
  };

  const handleRandomAssign = async (task) => {
    if (!activeTeam?.id) {
      toast({ title: 'No team selected', variant: 'destructive' });
      return;
    }
    try {
      const leastLoaded = await workloadApi.getLeastLoadedMember(activeTeam.id);
      await taskApi.update(task.id, { assigned_to: leastLoaded.id });
      toast({ title: `Assigned task to ${leastLoaded.id}` });
      // Optionally update UI state to show 'Assigned'
    } catch (err) {
      toast({ title: 'Assignment failed', description: err.message, variant: 'destructive' });
    }
  };

  const handleEditTeam = (team: any) => {
    setEditTeam(team);
    setIsEditOpen(true);
  };

  const handleDeleteTeam = (team: any) => {
    setDeleteTeam(team);
    setIsDeleteOpen(true);
  };

  const confirmDeleteTeam = useMutation({
    mutationFn: async (team: any) => {
      return await groupApi.delete(team.name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setIsDeleteOpen(false);
      setDeleteTeam(null);
      toast({ title: 'Team deleted' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete team', variant: 'destructive' });
    }
  });

  const handleUpdateTeam = useMutation({
    mutationFn: async (teamData: any) => {
      return await groupApi.update(teamData.name, teamData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setIsEditOpen(false);
      setEditTeam(null);
      toast({ title: 'Team updated' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update team', variant: 'destructive' });
    }
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Management
            </CardTitle>
            <CardDescription>
              Create and manage teams and assign team leaders
            </CardDescription>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
                <DialogDescription>
                  Fill in the details below to create a new team.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Team Name</label>
                  <Input
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Enter team name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={teamDescription}
                    onChange={(e) => setTeamDescription(e.target.value)}
                    placeholder="Team description (optional)"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Select Members</label>
                  <MultiSelect
                    options={userOptions}
                    value={selectedMembers}
                    onValueChange={setSelectedMembers}
                    placeholder="Select members..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Select Project</label>
                  <select
                    className="w-full border rounded px-2 py-2 mt-1"
                    value={selectedProject}
                    onChange={e => setSelectedProject(e.target.value)}
                      >
                    <option value="">Select a project...</option>
                    {projects.map((project: any) => (
                      <option key={project.name} value={project.name}>
                        {project.project_name || project.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Button 
                  onClick={handleCreateTeam} 
                  className="w-full"
                  disabled={createTeamMutation.isPending}
                >
                  {createTeamMutation.isPending ? 'Creating...' : 'Create Team'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {teamsLoading ? (
          <div className="text-center py-8">Loading teams...</div>
        ) : teams.length > 0 ? (
          <div className="space-y-4">
            {teams.map((team: any) => (
              <div key={team.name} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium">{team.team_name}</h3>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditTeam(team)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteTeam(team)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Team Leader:</span>
                    {team.leader && (
                      <Badge variant="default">
                        {getUserById(team.leader)?.name || 'Unknown'}
                      </Badge>
                    )}
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium">Members ({team.members?.length || 0}):</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {team.members?.map((member: any) => {
                        const user = getUserById(member.member);
                        return user ? (
                          <Badge key={member.member} variant="secondary">
                            {user.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex -space-x-2 overflow-hidden">
                    {(team.members || []).slice(0, 5).map((member: any) => {
                      const user = getUserById(member.member);
                      return user ? (
                        <img
                          key={member.member}
                          className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                          src={`https://avatar.vercel.sh/${user.name}.png`}
                          alt={user.name}
                          title={user.name}
                        />
                      ) : null;
                    })}
                    {(team.members || []).length > 5 && (
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-xs font-medium">
                        +{(team.members || []).length - 5}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No teams found</h3>
            <p className="text-muted-foreground mb-4">Create your first team to get started</p>
          </div>
        )}
      </CardContent>
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
          </DialogHeader>
          {editTeam && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Team Name</label>
                <Input
                  value={editTeam.team_name}
                  onChange={e => setEditTeam({ ...editTeam, team_name: e.target.value })}
                  placeholder="Enter team name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={editTeam.description}
                  onChange={e => setEditTeam({ ...editTeam, description: e.target.value })}
                  placeholder="Team description (optional)"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Select Members</label>
                <MultiSelect
                  options={userOptions}
                  value={editTeam.members?.map((m: any) => m.member) || []}
                  onValueChange={vals => setEditTeam({ ...editTeam, members: vals.map((m: string) => ({ doctype: 'Team Member', member: m })) })}
                  placeholder="Select members..."
                />
              </div>
              <Button
                onClick={() => {
                  const payload = {
                    ...editTeam,
                    ...(editTeam.members && editTeam.members.length > 0 && {
                      members: editTeam.members.map((m: any) => ({
                        doctype: 'Team Member',
                        member: m.member
                      }))
                    })
                  };
                  console.log('Team update payload:', payload);
                  handleUpdateTeam.mutate(payload);
                }}
                className="w-full"
                disabled={handleUpdateTeam.isPending}
              >
                {handleUpdateTeam.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Team</DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. This will permanently delete the team and all of its data.
                        </DialogDescription>
          </DialogHeader>
          <div>Are you sure you want to delete this team?</div>
          <div className="flex gap-2 mt-4">
            <Button variant="destructive" onClick={() => confirmDeleteTeam.mutate(deleteTeam)} disabled={confirmDeleteTeam.isPending}>
              {confirmDeleteTeam.isPending ? 'Deleting...' : 'Delete'}
            </Button>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TeamManagement;
