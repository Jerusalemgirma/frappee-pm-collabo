import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Download, X } from 'lucide-react';
import { projectApi, taskApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface ReportGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: 'OVERALL' | 'PROJECT' | 'TASK';
  projectId?: string;
  projectName?: string;
}

const ReportGenerator = ({ isOpen, onClose, reportType, projectId, projectName }: ReportGeneratorProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: projects } = useQuery({
    queryKey: ['projects-report'],
    queryFn: async () => {
      try {
        const response = await projectApi.getAll();
        return response.data;
      } catch (error) {
        console.error('Error fetching projects for report:', error);
        return [];
      }
    },
    enabled: isOpen,
  });

  const { data: tasks } = useQuery({
    queryKey: ['tasks-report'],
    queryFn: async () => {
      try {
        const response = await taskApi.getAll();
        return response.data;
      } catch (error) {
        console.error('Error fetching tasks for report:', error);
        return [];
      }
    },
    enabled: isOpen,
  });

  const { parentTasks, subTasks } = useMemo(() => {
    if (!tasks) return { parentTasks: [], subTasks: new Map<string, any[]>() };
    return { parentTasks: tasks, subTasks: new Map<string, any[]>() };
  }, [tasks]);

  const generateReportHeader = (title: string) => {
    let header = '**************************************************\n';
    header += `          ${title}          \n`;
    header += '**************************************************\n';
    header += `Report Generated: ${new Date().toLocaleString()}\n\n`;
    return header;
  };

  const generateReportFooter = () => {
    let footer = '\n\n--------------------------------------------------\n';
    footer += '              End of Report              \n';
    footer += '--------------------------------------------------\n';
    return footer;
  };

  const generateReport = async () => {
    setIsGenerating(true);
    
    try {
      let reportContent = '';
      
      if (reportType === 'OVERALL') {
        reportContent = generateOverallReport();
      } else if (reportType === 'PROJECT' && projectId) {
        reportContent = generateIndividualProjectReport(projectId);
      } else if (reportType === 'TASK') {
        reportContent = generateTaskReport();
      }

      // Create and download the report
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType.toLowerCase()}-report-${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Report Generated",
        description: "Your report has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const formatTask = (task: any, indent: string) => {
    let taskDetails = `${indent}* Task: ${task.name || 'Untitled Task'}\n`;
    taskDetails += `${indent}  - Subject: ${task.subject || 'N/A'}\n`;
    taskDetails += `${indent}  - Status: ${task.status || 'N/A'}\n`;
    return taskDetails;
  };

  const generateOverallReport = () => {
    let report = generateReportHeader('Overall Project Report');

    if (!projects || projects.length === 0) {
      report += 'No projects found.\n';
      return report + generateReportFooter();
    }

    projects.forEach((project: any) => {
      report += `\n## Project: ${project.name || 'Untitled Project'} ##\n`;
      report += `  - Description: ${project.description || 'N/A'}\n`;
      report += `  - Status: ${project.status || 'N/A'}\n`;

      const projectTasks = parentTasks.filter((task: any) => task.project === project.name);
      if (projectTasks.length > 0) {
        projectTasks.forEach((task: any) => {
          report += formatTask(task, '  ');
          report += '\n';
        });
      } else {
        report += '  No tasks for this project.\n';
      }
    });

    report += generateReportFooter();
    return report;
  };
  
  const generateIndividualProjectReport = (projectId: string) => {
    const project = projects?.find((p: any) => p.name === projectId);
    let report = generateReportHeader(`Report for Project: ${project?.name || projectId}`);

    if (!project) {
        report += 'Project not found.\n';
        return report + generateReportFooter();
    }
    
    report += `\n## Project: ${project.name || 'Untitled Project'} ##\n`;
    report += `  - Description: ${project.description || 'N/A'}\n`;
    report += `  - Status: ${project.status || 'N/A'}\n`;

    const projectTasks = parentTasks.filter((task: any) => task.project === project.name);
    if (projectTasks.length > 0) {
      projectTasks.forEach((task: any) => {
        report += formatTask(task, '  ');
        report += '\n';
      });
    } else {
      report += '  No tasks for this project.\n';
    }

    report += generateReportFooter();
    return report;
  };

  const generateTaskReport = () => {
    let report = generateReportHeader('Task Report');

    if (parentTasks.length === 0) {
      report += 'No tasks found.\n';
      return report + generateReportFooter();
    }

    parentTasks.forEach((task: any) => {
      report += formatTask(task, '');
      report += '\n';
    });
    
    report += generateReportFooter();
    return report;
  };


  const getDialogContent = () => {
    switch(reportType) {
      case 'OVERALL':
        return { 
          title: "Generate Overall Report", 
          description: "Generate a detailed report for all projects, tasks, and sub-tasks.",
          type: "Overall Detailed Report"
        };
      case 'PROJECT':
        return { 
          title: `Report for ${projectName || 'Project'}`, 
          description: `Generate a detailed report for project: ${projectName}`,
          type: `Individual Report for ${projectName}`
        };
      case 'TASK':
        return { 
          title: "Generate Task Report", 
          description: "Generate a report of all tasks and their sub-tasks.",
          type: "Task & Sub-task Report"
        };
      default:
        return { title: "Generate Report", description: "", type: "" };
    }
  };

  const { title, description, type } = getDialogContent();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Report Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>Format: Text (.txt)</div>
              <div>Date: {new Date().toLocaleDateString()}</div>
              <div>
                Type: {type}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button 
              onClick={generateReport} 
              disabled={isGenerating}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Download Report'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportGenerator;
