import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { taskApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import AssignTaskDialog from '@/components/AssignTaskDialog';

const statusOptions = ['To Do', 'In Progress', 'Review', 'Done', 'Blocked'];
const priorityOptions = ['Low', 'Medium', 'High', 'Urgent'];
const subtaskStatusOptions = ['To Do', 'In Progress', 'Done'];

const emptySubtask = { title: '', status: 'To Do' };

const TaskDetail = () => {
  const { taskId } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const response = await taskApi.getById(taskId!);
      return response.data.data || response.data;
    },
    enabled: !!taskId,
  });
  const [form, setForm] = useState<any>({});
  const [editing, setEditing] = useState(false);
  const [subtasks, setSubtasks] = useState<any[]>([]);
  const [subtaskEditIdx, setSubtaskEditIdx] = useState<number | null>(null);
  const [subtaskForm, setSubtaskForm] = useState<any>(emptySubtask);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const updateMutation = useMutation({
    mutationFn: (data: any) => taskApi.update(taskId!, data),
    onSuccess: () => {
      toast({ title: 'Task Updated', description: 'Task has been updated.' });
      setEditing(false);
      setSubtaskEditIdx(null);
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to update task', variant: 'destructive' })
  });
  useEffect(() => {
    if (data) {
      setForm(data);
      setSubtasks(Array.isArray(data.subtasks) ? data.subtasks : []);
    }
  }, [data]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ ...form, subtasks });
  };
  // Subtask CRUD
  const handleSubtaskChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSubtaskForm({ ...subtaskForm, [e.target.name]: e.target.value });
  };
  const handleAddSubtask = () => {
    setSubtasks([...subtasks, { ...subtaskForm }]);
    setSubtaskForm(emptySubtask);
  };
  const handleEditSubtask = (idx: number) => {
    setSubtaskEditIdx(idx);
    setSubtaskForm(subtasks[idx]);
  };
  const handleSaveSubtask = () => {
    setSubtasks(subtasks.map((st, idx) => (idx === subtaskEditIdx ? subtaskForm : st)));
    setSubtaskEditIdx(null);
    setSubtaskForm(emptySubtask);
  };
  const handleDeleteSubtask = (idx: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== idx));
    setSubtaskEditIdx(null);
    setSubtaskForm(emptySubtask);
  };
  const handleCancelEdit = () => {
    setEditing(false);
    setForm(data);
    setSubtasks(Array.isArray(data.subtasks) ? data.subtasks : []);
    setSubtaskEditIdx(null);
    setSubtaskForm(emptySubtask);
  };
  const handleAssignSuccess = () => {
    setIsAssignDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    toast({ title: 'Task Assigned', description: 'The task has been successfully assigned.' });
  }
  if (isLoading) return <div className="p-6">Loading...</div>;
  if (!data) return <div className="p-6">Task not found.</div>;
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Task Title</label>
              <Input name="task_title" value={form.task_title || ''} onChange={handleChange} disabled={!editing} />
            </div>
            <div>
              <label className="text-sm font-medium">Project</label>
              <Input name="project" value={form.project || ''} onChange={handleChange} disabled={!editing} />
            </div>
            <div>
              <label className="text-sm font-medium">Epic</label>
              <Input name="epic" value={form.epic || ''} onChange={handleChange} disabled={!editing} />
            </div>
            <div>
              <label className="text-sm font-medium">Sprint</label>
              <Input name="sprint" value={form.sprint || ''} onChange={handleChange} disabled={!editing} />
            </div>
            <div>
              <label className="text-sm font-medium">Assigned To</label>
              <div className="flex items-center gap-2">
                <Input name="assigned_to" value={form.assigned_to || 'Unassigned'} disabled />
                {editing && (
                  <Button type="button" onClick={(e) => { e.preventDefault(); setIsAssignDialogOpen(true); }}>
                    Re-assign
                  </Button>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <select name="status" value={form.status || ''} onChange={handleChange} disabled={!editing} className="w-full border rounded px-2 py-1">
                {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Priority</label>
              <select name="priority" value={form.priority || ''} onChange={handleChange} disabled={!editing} className="w-full border rounded px-2 py-1">
                {priorityOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Estimated Hours</label>
              <Input name="estimated_hours" value={form.estimated_hours || ''} onChange={handleChange} disabled={!editing} />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea name="description" value={form.description || ''} onChange={handleChange} disabled={!editing} className="w-full border rounded px-2 py-1" />
            </div>
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-2">Subtasks</h3>
              <table className="w-full border">
                <thead>
                  <tr>
                    <th className="border px-2 py-1">Title</th>
                    <th className="border px-2 py-1">Status</th>
                    <th className="border px-2 py-1">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subtasks.map((subtask, idx) => (
                    <tr key={idx}>
                      <td className="border px-2 py-1">
                        {subtaskEditIdx === idx && editing ? (
                          <Input name="title" value={subtaskForm.title} onChange={handleSubtaskChange} />
                        ) : (
                          subtask.title
                        )}
                      </td>
                      <td className="border px-2 py-1">
                        {subtaskEditIdx === idx && editing ? (
                          <select name="status" value={subtaskForm.status} onChange={handleSubtaskChange} className="w-full border rounded px-2 py-1">
                            {subtaskStatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        ) : (
                          subtask.status
                        )}
                      </td>
                      <td className="border px-2 py-1">
                        {editing ? (
                          subtaskEditIdx === idx ? (
                            <>
                              <Button type="button" size="sm" onClick={(e) => { e.preventDefault(); handleSaveSubtask(); }}>Save</Button>
                              <Button type="button" size="sm" variant="outline" onClick={(e) => { e.preventDefault(); setSubtaskEditIdx(null); }}>Cancel</Button>
                            </>
                          ) : (
                            <>
                              <Button type="button" size="sm" variant="outline" onClick={(e) => { e.preventDefault(); handleEditSubtask(idx); }}>Edit</Button>
                              <Button type="button" size="sm" variant="destructive" onClick={(e) => { e.preventDefault(); handleDeleteSubtask(idx); }}>Delete</Button>
                            </>
                          )
                        ) : null}
                      </td>
                    </tr>
                  ))}
                  {editing && subtaskEditIdx === null && (
                    <tr>
                      <td className="border px-2 py-1">
                        <Input name="title" value={subtaskForm.title} onChange={handleSubtaskChange} />
                      </td>
                      <td className="border px-2 py-1">
                        <select name="status" value={subtaskForm.status} onChange={handleSubtaskChange} className="w-full border rounded px-2 py-1">
                          {subtaskStatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </td>
                      <td className="border px-2 py-1">
                        <Button type="button" size="sm" onClick={(e) => { e.preventDefault(); handleAddSubtask(); }}>Add</Button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex gap-2 mt-4">
              {editing ? (
                <>
                  <Button type="submit" disabled={updateMutation.isPending}>{updateMutation.isPending ? 'Saving...' : 'Save'}</Button>
                  <Button type="button" variant="outline" onClick={(e) => { e.preventDefault(); handleCancelEdit(); }}>Cancel</Button>
                </>
              ) : (
                <Button type="button" onClick={(e) => { e.preventDefault(); setEditing(true); }}>Edit</Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
      <AssignTaskDialog
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        task={data}
        onAssign={handleAssignSuccess}
      />
    </div>
  );
};

export default TaskDetail;
