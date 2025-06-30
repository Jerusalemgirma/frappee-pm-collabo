import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TasksList from '@/components/TasksList';

const Tasks = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const project = params.get('project');
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <p className="text-muted-foreground">Manage and track all your tasks</p>
      </div>
      
      <TasksList project={project} />
    </div>
  );
};

export default Tasks;