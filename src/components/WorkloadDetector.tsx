
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, User } from 'lucide-react';
import { taskApi } from '@/services/api';
import { userApi } from '@/services/userApi';
import { useToast } from '@/hooks/use-toast';

interface WorkloadDetectorProps {
  projectId?: string;
  onReassign: (taskId: string, fromUser: string, toUser: string) => void;
}

const WorkloadDetector = ({ projectId, onReassign }: WorkloadDetectorProps) => {
  const { toast } = useToast();

  const { data: tasks } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const taskResponse = await taskApi.getAll();
            return taskResponse.data.data || [];
    },
  });

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const userResponse = await userApi.getAll();
            return userResponse.data.data || [];
    },
  });

  // Ensure users is always an array
  const users = usersData || [];

  console.log('Users data structure:', { usersData, users, isArray: Array.isArray(users) });

  // Calculate workload for each user
  const calculateWorkload = () => {
    const workload: { [key: string]: { user: any; taskCount: number; tasks: any[] } } = {};
    
    if (Array.isArray(users)) {
          users.forEach((user: any) => {
            workload[user.id] = { user, taskCount: 0, tasks: [] };
          });
        }

    const tasksArray = Array.isArray(tasks) ? tasks : [];
    tasksArray.forEach((task: any) => {
      if (task.assignee && workload[task.assignee]) {
        workload[task.assignee].taskCount++;
        workload[task.assignee].tasks.push(task);
      }
    });

    return Object.values(workload).sort((a, b) => b.taskCount - a.taskCount);
  };

  const workloadData = calculateWorkload();
  const overloadedUsers = workloadData.filter(item => item.taskCount > 5);
  const leastLoadedUser = workloadData.find(item => item.taskCount < 3);

  const handleAutoReassign = (overloadedUser: any) => {
    if (leastLoadedUser && overloadedUser.tasks.length > 0) {
      const taskToReassign = overloadedUser.tasks[0];
      onReassign(taskToReassign.id, overloadedUser.user.id, leastLoadedUser.user.id);
      
      toast({
        title: "Task Reassigned",
        description: `Task moved from ${overloadedUser.user.name} to ${leastLoadedUser.user.name}`,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Workload Analysis
        </CardTitle>
        <CardDescription>
          Detect overloaded team members and suggest reassignments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {overloadedUsers.length > 0 ? (
            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Overloaded Users (5+ tasks)
              </h4>
              {overloadedUsers.map((item) => (
                <div key={item.user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4" />
                    <div>
                      <p className="font-medium">{item.user.name}</p>
                      <p className="text-xs text-muted-foreground">{item.taskCount} active tasks</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">{item.taskCount} tasks</Badge>
                    {leastLoadedUser && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAutoReassign(item)}
                      >
                        Auto Reassign
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No workload issues detected
            </div>
          )}

          <div className="mt-6">
            <h4 className="font-medium text-sm mb-3">Team Workload Distribution</h4>
            <div className="space-y-2">
              {workloadData.map((item) => (
                <div key={item.user.id} className="flex items-center justify-between p-2 rounded">
                  <span className="text-sm">{item.user.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          item.taskCount > 5 ? 'bg-red-500' :
                          item.taskCount > 3 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(100, (item.taskCount / 8) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs">{item.taskCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkloadDetector;
