import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import ReportGenerator from "@/components/ReportGenerator";
import { useState, useEffect } from "react";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import Index from "./pages/Index";
import Projects from "./pages/Projects";
import Epics from "./pages/Epics";
import Tasks from "./pages/Tasks";
import Sprints from "./pages/Sprints";
import Teams from "./pages/Teams";
import NotFound from "./pages/NotFound";
import TaskDetail from './pages/TaskDetail';

const queryClient = new QueryClient();

const App = () => {
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportType, setReportType] = useState<'' | 'OVERALL' | 'PROJECT' | 'TASK'>('');
  const { isTelegramWebApp, webApp, user, showAlert } = useTelegramWebApp();

  const handleReportGenerate = (type: string) => {
    setReportType(type as 'OVERALL' | 'PROJECT' | 'TASK');
    setReportDialogOpen(true);
  };

  // Show welcome message when opened in Telegram
  useEffect(() => {
    if (isTelegramWebApp && user) {
      showAlert(`Welcome, ${user.first_name}! 🚀`);
    }
  }, [isTelegramWebApp, user, showAlert]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className={`min-h-screen flex w-full ${isTelegramWebApp ? 'telegram-webapp' : ''}`}>
              {!isTelegramWebApp && <AppSidebar onReportGenerate={handleReportGenerate} />}
              <main className="flex-1">
                {!isTelegramWebApp && (
                  <div className="border-b bg-card p-4">
                    <SidebarTrigger />
                  </div>
                )}
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/epics" element={<Epics />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/tasks/:taskId" element={<TaskDetail />} />
                  <Route path="/sprints" element={<Sprints />} />
                  <Route path="/teams" element={<Teams />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
            
            <ReportGenerator
              isOpen={reportDialogOpen}
              onClose={() => setReportDialogOpen(false)}
              reportType={reportType as 'OVERALL' | 'PROJECT' | 'TASK'}                                                                                                                                                                                                                                                                                                                                                                                                 
            />
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;