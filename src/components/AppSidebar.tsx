import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { 
  FolderKanban, 
  Target, 
  CheckSquare, 
  Calendar, 
  FileText, 
  BarChart3,
  Home,
  Users
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Projects",
    url: "/projects",
    icon: FolderKanban,
  },
  {
    title: "Epics",
    url: "/epics",
    icon: Target,
  },
  {
    title: "Tasks",
    url: "/tasks",
    icon: CheckSquare,
  },
  {
    title: "Sprints",
    url: "/sprints",
    icon: Calendar,
  },
  {
    title: "Teams",
    url: "/teams",
    icon: Users,
  },
];

const reportItems = [
  {
    title: "Project Reports",
    action: "project-reports",
    icon: FileText,
  },
  {
    title: "Overall Report",
    action: "overall-report",
    icon: BarChart3,
  },
];

interface AppSidebarProps {
  onReportGenerate: (type: string) => void;
}

export function AppSidebar({ onReportGenerate }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <FolderKanban className="h-6 w-6" />
          <span className="font-semibold text-lg">Project Manager</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Reports</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {reportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton onClick={() => onReportGenerate(item.action)}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="px-4 py-2 text-xs text-muted-foreground">
          Jira-like Management System
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
