
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { User, Search, Users } from 'lucide-react';
import { userApi } from '@/services/userApi';
import { useToast } from '@/hooks/use-toast';

interface UserAssignmentProps {
  onAssign: (userId: string, userName: string) => void;
  currentAssignee?: string;
}

const UserAssignment = ({ onAssign, currentAssignee }: UserAssignmentProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await userApi.getAll();
      return response.data || [];
    },
  });

  // Ensure users is always an array
  const users = Array.isArray(usersData) ? usersData : 
                (usersData?.data && Array.isArray(usersData.data)) ? usersData.data : 
                [];

  console.log('UserAssignment - Users data structure:', { usersData, users, isArray: Array.isArray(users) });

  const filteredUsers = users.filter((user: any) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssign = (user: any) => {
    onAssign(user.id, user.name);
    setIsOpen(false);
    toast({
      title: "User Assigned",
      description: `Task assigned to ${user.name}`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <User className="h-4 w-4 mr-2" />
          {currentAssignee || 'Assign'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign to User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="max-h-60 overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="text-center py-4">Loading users...</div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user: any) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                  onClick={() => handleAssign(user)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{user.role}</Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No users found
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserAssignment;
