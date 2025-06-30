import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader as DialogHeaderUI, DialogTitle as DialogTitleUI, DialogFooter, DialogDescription as DialogDescriptionUI } from '@/components/ui/dialog';
import { epicApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const EpicDetail = () => {
  const { epicName } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [epic, setEpic] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<any>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (epicName) {
      epicApi.get(epicName).then(res => setEpic(res.data.data)).catch(() => toast({ title: 'Error', description: 'Failed to fetch epic', variant: 'destructive' }));
    }
  }, [epicName]);

  useEffect(() => {
    if (epic) setForm(epic);
  }, [epic]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await epicApi.update(epic.name, form);
      setEpic(form);
      setEditMode(false);
      toast({ title: 'Epic updated' });
    } catch {
      toast({ title: 'Error', description: 'Failed to update epic', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    try {
      await epicApi.delete(epic.name);
      toast({ title: 'Epic deleted' });
      navigate('/epics');
    } catch {
      toast({ title: 'Error', description: 'Failed to delete epic', variant: 'destructive' });
    }
  };

  if (!epic) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Epic: {epic.name}</CardTitle>
        <CardDescription>{epic.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {editMode ? (
          <form className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input name="name" value={form.name} onChange={handleFormChange} disabled />
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
            <Button type="button" onClick={handleSave}>Save</Button>
            <Button type="button" variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
          </form>
        ) : (
          <div className="space-y-2">
            <div><b>Name:</b> {epic.name}</div>
            <div><b>Description:</b> {epic.description}</div>
            <div><b>Priority:</b> {epic.priority}</div>
            <div><b>Status:</b> {epic.status}</div>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => setEditMode(true)}>Edit</Button>
              <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>Delete</Button>
              <Button variant="outline" onClick={() => navigate('/epics')}>Back</Button>
            </div>
          </div>
        )}
      </CardContent>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeaderUI>
            <DialogTitleUI>Delete Epic</DialogTitleUI>
          </DialogHeaderUI>
          <div>Are you sure you want to delete this epic?</div>
          <DialogFooter>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default EpicDetail; 