import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Calendar, Play, Square } from 'lucide-react';
import { sprintApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const SprintsList = () => {
  const { toast } = useToast();                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
  const navigate = useNavigate();
  
  const { data: sprints, isLoading, error, refetch } = useQuery({
    queryKey: ['sprints'],
    queryFn: async () => {
      try {
        // Temporarily disabled due to 417 error - Sprint DocType may not exist
        // const response = await sprintApi.getAll();
        // return response.data;
        console.log('Sprint API temporarily disabled - returning empty array');
        return [];
      } catch (error) {
        console.error('Error fetching sprints:', error);
        toast({
          title: "Error",
          description: "Failed to fetch sprints",
          variant: "destructive",
        });
        return [];
      }
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Sprints
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading sprints...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Sprints
            </CardTitle>
            <CardDescription>
              Time-boxed iterations for delivering working software
            </CardDescription>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Sprint
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {sprints && sprints.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sprints.map((sprint: any) => (
                <TableRow key={sprint.name || sprint.id}>
                  <TableCell className="font-medium">
                    <span className="text-blue-700 cursor-pointer underline" onClick={() => navigate(`/sprints/${sprint.name || sprint.id}`)}>
                      {sprint.name || 'Untitled Sprint'}
                    </span>
                  </TableCell>
                  <TableCell>{sprint.startDate || sprint.start_date || 'Not set'}</TableCell>
                  <TableCell>{sprint.endDate || sprint.end_date || 'Not set'}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-800">
                      {sprint.status || 'Active'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                      <span className="text-sm text-muted-foreground">60%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No sprints found</h3>
            <p className="text-muted-foreground mb-4">Create your first sprint to start planning iterations</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Sprint
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SprintsList;
