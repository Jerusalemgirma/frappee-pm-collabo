import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Target } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { epicApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const emptyEpic = { name: '', description: '', priority: 'Medium', status: 'In Progress' };

const EpicsList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEpic, setSelectedEpic] = useState<any | null>(null);
  const [form, setForm] = useState(emptyEpic);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  
  const { data: epics, isLoading, error } = useQuery({
    queryKey: ['epics'],
    queryFn: async () => {
      try {
        const response = await epicApi.getAll();
        return response.data.data;
      } catch (error) {
        toast({ title: "Error", description: "Failed to fetch epics", variant: "destructive" });
        return [];
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => epicApi.create(data),
    onSuccess: () => {
      toast({ title: 'Epic Created', description: 'Epic has been created.' });
      setModalOpen(false);
      setForm(emptyEpic);
      queryClient.invalidateQueries({ queryKey: ['epics'] });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to create epic', variant: 'destructive' })
  });

  const updateMutation = useMutation({
    mutationFn: ({ name, data }: any) => epicApi.update(name, data),
    onSuccess: () => {
      toast({ title: 'Epic Updated', description: 'Epic has been updated.' });
      setModalOpen(false);
      setForm(emptyEpic);
      setSelectedEpic(null);
      queryClient.invalidateQueries({ queryKey: ['epics'] });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to update epic', variant: 'destructive' })
  });

  const deleteMutation = useMutation({
    mutationFn: (name: string) => epicApi.delete(name),
    onSuccess: () => {
      toast({ title: 'Epic Deleted', description: 'Epic has been deleted.' });
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['epics'] });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to delete epic', variant: 'destructive' })
  });

  const openNewModal = () => {
    setForm(emptyEpic);
    setSelectedEpic(null);
    setModalOpen(true);
  };

  const openEditModal = (epic: any) => {
    setForm({ ...epic });
    setSelectedEpic(epic);
    setModalOpen(true);
  };

  const openDeleteDialog = (epic: any) => {
    setDeleteTarget(epic);
    setDeleteDialogOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEpic) {
      updateMutation.mutate({ name: selectedEpic.name, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Epics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading epics...</div>
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
              <Target className="h-5 w-5" />
              Epics
            </CardTitle>
            <CardDescription>
              Large bodies of work that can be broken down into smaller tasks
            </CardDescription>
          </div>
          <Button onClick={openNewModal}>
            <Plus className="h-4 w-4 mr-2" />
            New Epic
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {epics && epics.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {epics.map((epic: any) => (
                <TableRow key={epic.name}>
                  <TableCell className="font-medium">
                    <span className="text-blue-700 cursor-pointer underline" onClick={() => navigate(`/epics/${epic.name}`)}>
                      {epic.name || 'Untitled Epic'}
                    </span>
                  </TableCell>
                  <TableCell>{epic.description || 'No description'}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800">
                      {epic.priority || 'Medium'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800">
                      {epic.status || 'In Progress'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditModal(epic)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openDeleteDialog(epic)}>
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
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No epics found</h3>
            <p className="text-muted-foreground mb-4">Create your first epic to organize large features</p>
            <Button onClick={openNewModal}>
              <Plus className="h-4 w-4 mr-2" />
              Create Epic
            </Button>
          </div>
        )}
      </CardContent>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEpic ? 'Edit Epic' : 'New Epic'}</DialogTitle>
            <DialogDescription>
              {selectedEpic ? 'Update epic details.' : 'Create a new epic.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input name="name" value={form.name} onChange={handleFormChange} required disabled={!!selectedEpic} />
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
            <DialogFooter>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {selectedEpic
                  ? updateMutation.isPending ? 'Saving...' : 'Save Changes'
                  : createMutation.isPending ? 'Creating...' : 'Create Epic'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Epic</AlertDialogTitle>
          </AlertDialogHeader>
          <div>Are you sure you want to delete the epic "{deleteTarget?.name}"?</div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate(deleteTarget.name)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default EpicsList;
