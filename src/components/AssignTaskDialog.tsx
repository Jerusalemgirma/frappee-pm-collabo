import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { userApi, groupApi } from "@/services/userApi"
import { workloadApi } from "@/services/workloadApi"
import { taskApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
  
  const AssignTaskDialog = ({ open, onOpenChange, task, onAssign }: any) => {
    const [assignType, setAssignType] = useState("individual");
    const [selectedUser, setSelectedUser] = useState("");
    const [selectedTeam, setSelectedTeam] = useState("");
    const { toast } = useToast();
  
    const { data: usersResponse, isLoading: usersLoading } = useQuery({
      queryKey: ["users"],
      queryFn: async () => await userApi.getAll(),
    });
    const users = usersResponse?.data?.data || [];
  
    const { data: teamsResponse, isLoading: teamsLoading } = useQuery({
      queryKey: ["teams"],
      queryFn: async () => await groupApi.getAll(),
    });
    const teams = teamsResponse?.data?.data || [];
  
    const assignMutation = useMutation({
      mutationFn: async ({ type, assignee }: { type: string, assignee: string }) => {
        console.log('Assigning task:', { task: task.name, type, assignee });
        
        if (type === "individual") {
          return await taskApi.update(task.name, { assigned_to: assignee });
        } else {
          // This is where we call the workload logic
          const leastLoadedMember = await workloadApi.getLeastLoadedMember(assignee); // assignee is team_id here
          console.log('Least loaded member:', leastLoadedMember);
          return await taskApi.update(task.name, { assigned_to: leastLoadedMember.id });
        }
      },
      onSuccess: () => {
        toast({
          title: 'Task Assigned',
          description: 'Task has been successfully assigned.',
        });
        onAssign();
      },
      onError: (error) => {
        console.error('Assignment error:', error);
        toast({
          title: 'Assignment Failed',
          description: error.message || 'Failed to assign task.',
          variant: 'destructive',
        });
      }
    });
  
    const handleAssign = () => {
      const assignee = assignType === 'individual' ? selectedUser : selectedTeam;
      if (!assignee) {
        toast({
          title: 'Selection Required',
          description: 'Please select a user or team to assign the task to.',
          variant: 'destructive',
        });
        return;
      }
      assignMutation.mutate({ type: assignType, assignee });
    };
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Task: {task?.title}</DialogTitle>
                        <DialogDescription>
                          Select a user or team to assign this task to.
                        </DialogDescription>
          </DialogHeader>
          <RadioGroup value={assignType} onValueChange={setAssignType}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="individual" id="r1" />
              <Label htmlFor="r1">Assign to Individual</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="team" id="r2" />
              <Label htmlFor="r2">Assign to Team</Label>
            </div>
          </RadioGroup>
  
          {assignType === "individual" && (
            <select 
              onChange={(e) => setSelectedUser(e.target.value)} 
              className="w-full border rounded p-2"
              value={selectedUser}
            >
              <option value="">Select User</option>
              {users.map((u: any) => (
                <option key={u.name} value={u.name}>
                  {u.full_name || u.name}
                </option>
              ))}
            </select>
          )}
  
          {assignType === "team" && (
            <select 
              onChange={(e) => setSelectedTeam(e.target.value)} 
              className="w-full border rounded p-2"
              value={selectedTeam}
            >
              <option value="">Select Team</option>
              {teams.map((t: any) => (
                <option key={t.name} value={t.name}>
                  {t.team_name || t.name}
                </option>
              ))}
            </select>
          )}
          <Button onClick={handleAssign} disabled={assignMutation.isPending}>
            {assignMutation.isPending ? 'Assigning...' : 'Assign'}
          </Button>
        </DialogContent>
      </Dialog>
    );
  };
  
  export default AssignTaskDialog;
 