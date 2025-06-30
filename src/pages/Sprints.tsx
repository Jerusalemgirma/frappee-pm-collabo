import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SprintsList from '@/components/SprintsList';

const Sprints = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Sprints</h1>
        <p className="text-muted-foreground">Plan and execute development sprints</p>
      </div>
      
      <SprintsList />
    </div>
  );
};

export default Sprints;
