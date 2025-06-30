import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import EpicsList from '@/components/EpicsList';

const Epics = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Epics</h1>
        <p className="text-muted-foreground">Track and manage project epics</p>
      </div>
      
      <EpicsList />
    </div>
  );
};

export default Epics;