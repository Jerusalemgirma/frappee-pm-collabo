import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TeamManagement from '@/components/TeamManagement';

const Teams = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Teams</h1>
        <p className="text-muted-foreground">Manage team members and assignments</p>
      </div>
      
      <TeamManagement />
    </div>
  );
};

export default Teams;
