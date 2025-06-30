import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader as DialogHeaderUI, DialogTitle as DialogTitleUI, DialogFooter, DialogDescription as DialogDescriptionUI } from '@/components/ui/dialog';
import { sprintApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const SprintDetail = () => {
  const { sprintName } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sprint, setSprint] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<any>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (sprintName) {
      sprintApi.get(sprintName).then(res => setSprint(res.data.data)).catch(() => toast({ title: 'Error', description: 'Failed to fetch sprint', variant: 'destructive' }));
    }
  }, [sprintName]);

  useEffect(() => {
    if (sprint) setForm(sprint);
  }, [sprint]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await sprintApi.update(sprint.name, form);
      setSprint(form);
      setEditMode(false);
      toast({ title: 'Sprint updated' });
    } catch {
      toast({ title: 'Error', description: 'Failed to update sprint', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    try {
      await sprintApi.delete(sprint.name);
      toast({ title: 'Sprint deleted' });
      navigate('/sprints');
    } catch {
      toast({ title: 'Error', description: 'Failed to delete sprint', variant: 'destructive' });
    }
  };

  if (!sprint) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sprint: {sprint.name}</CardTitle>
        <CardDescription>{sprint.goal}</CardDescription>
      </CardHeader>
      <CardContent>
        {editMode ? (
          <form className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input name="name" value={form.name} onChange={handleFormChange} disabled />
            </div>
            <div>
              <label className="text-sm font-medium">Goal</label>
              <Input name="goal" value={form.goal} onChange={handleFormChange} />
            </div>
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <Input name="start_date" value={form.start_date} onChange={handleFormChange} />
            </div>
            <div>
              <label className="text-sm font-medium">End Date</label>
              <Input name="end_date" value={form.end_date} onChange={handleFormChange} />
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
            <div><b>Name:</b> {sprint.name}</div>
            <div><b>Goal:</b> {sprint.goal}</div>
            <div><b>Start Date:</b> {sprint.start_date}</div>
            <div><b>End Date:</b> {sprint.end_date}</div>
            <div><b>Status:</b> {sprint.status}</div>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => setEditMode(true)}>Edit</Button>
              <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>Delete</Button>
              <Button variant="outline" onClick={() => navigate('/sprints')}>Back</Button>
            </div>
          </div>
        )}
      </CardContent>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeaderUI>
            <DialogTitleUI>Delete Sprint</DialogTitleUI>
          </DialogHeaderUI>
          <div>Are you sure you want to delete this sprint?</div>
          <DialogFooter>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default SprintDetail; 