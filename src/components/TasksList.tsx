import { useState } from 'react';                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, CheckSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { taskApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import UserAssignment from '@/components/UserAssignment';
import WorkloadDetector from '@/components/WorkloadDetector';
import { useNavigate } from 'react-router-dom';
import AssignTaskDialog from './AssignTaskDialog';

const emptyTask = { name: '', title: '', description: '', priority: 'Medium', status: 'To Do', assignee: '', weight: 1 };

const TasksList = ({ project }: { project?: string }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [form, setForm] = useState(emptyTask);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState<string | null>(null);
  const [assignTask, setAssignTask] = useState<any>(null);
  
  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      try {
        const response = await taskApi.getAll();
        return response.data.data || [];
      } catch (error) {
        toast({ title: "Error", description: "Failed to fetch tasks", variant: "destructive" });
        return [];
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => taskApi.create(data),
    onSuccess: () => {
      toast({ title: 'Task Created', description: 'Task has been created.' });
      setModalOpen(false);
      setForm(emptyTask);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to create task', variant: 'destructive' })
  });

  const updateMutation = useMutation({
    mutationFn: ({ name, data }: any) => taskApi.update(name, data),
    onSuccess: () => {
      toast({ title: 'Task Updated', description: 'Task has been updated.' });
      setModalOpen(false);
      setForm(emptyTask);
      setSelectedTask(null);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to update task', variant: 'destructive' })
  });

  const deleteMutation = useMutation({
    mutationFn: (name: string) => taskApi.delete(name),
    onSuccess: () => {
      toast({ title: 'Task Deleted', description: 'Task has been deleted.' });
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to delete task', variant: 'destructive' })
  });

  const openNewModal = () => {
    setForm(emptyTask);
    setSelectedTask(null);
    setModalOpen(true);
  };

  const openEditModal = (task: any) => {
    setForm({ ...task });
    setSelectedTask(task);
    setModalOpen(true);
  };

  const openDeleteDialog = (task: any) => {
    setDeleteTarget(task);
    setDeleteDialogOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTask) {
      updateMutation.mutate({ name: selectedTask.name, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleAssignUser = (taskId: string, userId: string, userName: string) => {
    // This is a mock function. In a real app, this would trigger a mutation.
    console.log(`Assigning user ${userName} (${userId}) to task ${taskId}`);
  };

  const handleReassignTask = (taskId: string, fromUser: string, toUser: string) => {
    // This is a mock function. In a real app, this would trigger a mutation.
    console.log(`Reassigning task ${taskId} from ${fromUser} to ${toUser}`);
  };

  const filteredTasks = project ? tasks.filter((task: any) => task.project === project) : tasks;

  return (
    <div className="space-y-6">
      <WorkloadDetector onReassign={handleReassignTask} />
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                Tasks
              </CardTitle>
              <CardDescription>Individual work items that need to be completed</CardDescription>
            </div>
            <Button onClick={openNewModal}>
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading tasks...</div>
          ) : filteredTasks && filteredTasks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task: any) => (
                  <TableRow key={task.name}>
                    <TableCell className="font-medium">
                      <span className="text-blue-700 cursor-pointer underline" onClick={() => navigate(`/tasks/${task.name}`)}>
                        {task.title || task.name || 'Untitled Task'}
                      </span>
                    </TableCell>
                    <TableCell>{task.description || 'No description'}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800">
                        {task.priority || 'Medium'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800">
                        {task.status || 'To Do'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {task.assigned_to ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{task.assigned_to}</span>
                          <Button size="sm" variant="secondary" disabled className="bg-green-100 text-green-800 hover:bg-green-100">
                            Assigned
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { setAssignTask(task); setAssignDialogOpen(task.name); }}>
                            Reassign
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => { setAssignTask(task); setAssignDialogOpen(task.name); }}>
                          Assign
                        </Button>
                      )}
                      <AssignTaskDialog
                        open={assignDialogOpen === task.name}
                        onOpenChange={(open: boolean) => { if (!open) setAssignDialogOpen(null); }}
                        task={task}
                        onAssign={() => { setAssignDialogOpen(null); queryClient.invalidateQueries({ queryKey: ['tasks'] }); }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditModal(task)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openDeleteDialog(task)}>
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
              <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No tasks found</h3>
              <p className="text-muted-foreground mb-4">Create your first task to start tracking work</p>
              <Button onClick={openNewModal}>
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTask ? 'Edit Task' : 'New Task'}</DialogTitle>
            <DialogDescription>
              {selectedTask ? 'Update task details.' : 'Create a new task.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input name="title" value={form.title} onChange={handleFormChange} required />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input name="description" value={form.description} onChange={handleFormChange} />
            </div>
            <div>
              <label className="text-sm font-medium">Priority</label>
              <Input name="priority" value={form.priority} onChange={handleFormChange} />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Input name="status" value={form.status} onChange={handleFormChange} />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Weight</label>
                            <Input name="weight" type="number" value={form.weight} onChange={handleFormChange} />
                          </div>
            <DialogFooter>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {selectedTask
                  ? updateMutation.isPending ? 'Saving...' : 'Save Changes'
                  : createMutation.isPending ? 'Creating...' : 'Create Task'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the task.
                        </AlertDialogDescription>
          </AlertDialogHeader>
          <div>Are you sure you want to delete the task "{deleteTarget?.title || deleteTarget?.name}"?</div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate(deleteTarget.name)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TasksList;
