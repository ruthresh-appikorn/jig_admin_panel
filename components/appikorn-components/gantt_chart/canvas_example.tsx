"use client";

import React, { useState, useEffect, useRef } from "react";

import GanttChart, { CanvasGanttTask } from "./gantt_chart_task_list";

const CanvasGanttChartExample: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);

  // Detect system dark mode preference
  useEffect(() => {
    const isDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    setDarkMode(true); // Force dark mode for professional look

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setDarkMode(e.matches);

    mediaQuery.addEventListener("change", handler);

    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const [tasks, setTasks] = useState<CanvasGanttTask[]>([
    {
      id: "1",
      name: "Software Development Project",
      start: "2025-11-03",
      end: "2026-01-15",
      progress: 35,
      color: "#3b82f6",
      expanded: true,
      order: 0,
      priority: "high",
      type: "summary",
      description: "Complete project for client delivery",
      assignee: "Project Manager",
      teamMembers: [
        {
          name: "John Doe",
          role: "Project Manager",
          email: "john@example.com",
        },
        { name: "Sarah Smith", role: "Tech Lead", email: "sarah@example.com" },
      ],
    },
    {
      id: "2",
      name: "Planning & Analysis",
      start: "2025-11-10",
      end: "2025-11-24",
      progress: 100,
      color: "#10b981",
      parentId: "1",
      order: 1,
      expanded: true,
      priority: "medium",
      description: "Requirements gathering and analysis phase",
      assignee: "Business Analyst",
      teamMembers: [
        { name: "Alice Johnson", role: "Business Analyst" },
        { name: "Bob Wilson", role: "Product Owner" },
      ],
    },
    {
      id: "3",
      name: "Requirements Gathering",
      start: "2025-11-10",
      end: "2025-11-17",
      progress: 100,
      color: "#10b981",
      parentId: "2",
      order: 2,
      priority: "critical",
      assignee: "Product Owner",
      dependencies: [],
    },
    {
      id: "4",
      name: "Technical Analysis",
      start: "2025-11-18",
      end: "2025-11-24",
      progress: 100,
      color: "#10b981",
      parentId: "2",
      order: 3,
      priority: "medium",
      assignee: "Tech Lead",
      dependencies: ["3"],
    },
    {
      id: "5",
      name: "Design Phase",
      start: "2025-11-24",
      end: "2025-12-15",
      progress: 80,
      color: "#f59e0b",
      parentId: "1",
      order: 4,
      expanded: true,
      priority: "high",
      dependencies: ["2"],
      description: "UI/UX design and architecture",
      assignee: "UI/UX Team",
      teamMembers: [
        { name: "Emma Davis", role: "UI/UX Designer" },
        { name: "Mike Brown", role: "UI Designer" },
      ],
    },
    {
      id: "6",
      name: "UI/UX Design",
      start: "2025-11-25",
      end: "2025-12-01",
      progress: 90,
      color: "#f59e0b",
      parentId: "5",
      order: 5,
      priority: "medium",
      assignee: "UI Designer",
    },
    {
      id: "7",
      name: "Database Design",
      start: "2025-11-30",
      end: "2025-12-08",
      progress: 80,
      color: "#f59e0b",
      parentId: "5",
      order: 6,
      priority: "critical",
      assignee: "Database Architect",
      dependencies: ["4"],
    },
    {
      id: "8",
      name: "Development Phase",
      start: "2025-12-02",
      end: "2025-12-15",
      progress: 45,
      color: "#8b5cf6",
      parentId: "1",
      order: 7,
      priority: "high",
      assignee: "Dev Team",
      dependencies: ["5"],
      expanded: true,
      description: "Implementation and development sprint",
      teamMembers: [
        { name: "Chris Lee", role: "Frontend Dev" },
        { name: "Anna Kim", role: "Backend Dev" },
        { name: "David Chen", role: "Full Stack Dev" },
      ],
    },
    {
      id: "9",
      name: "Frontend Development",
      start: "2025-12-02",
      end: "2025-12-10",
      progress: 60,
      color: "#8b5cf6",
      parentId: "8",
      order: 8,
      priority: "medium",
      assignee: "Frontend Dev",
    },
    {
      id: "10",
      name: "Backend Development",
      start: "2025-12-05",
      end: "2025-12-15",
      progress: 30,
      color: "#8b5cf6",
      parentId: "8",
      order: 9,
      priority: "critical",
      assignee: "Backend Dev",
      dependencies: ["7"],
    },
    {
      id: "11",
      name: "Testing & QA",
      start: "2025-12-12",
      end: "2025-12-20",
      progress: 10,
      color: "#ec4899",
      order: 10,
      priority: "high",
      assignee: "QA Team",
      dependencies: ["9", "10"],
    },
    {
      id: "12",
      name: "User Acceptance Testing",
      start: "2025-12-16",
      end: "2025-12-20",
      progress: 0,
      color: "#ec4899",
      parentId: "11",
      order: 11,
      priority: "medium",
      assignee: "Product Owner",
    },
    {
      id: "13",
      name: "Performance Testing",
      start: "2025-12-12",
      end: "2025-12-18",
      progress: 5,
      color: "#ec4899",
      parentId: "11",
      order: 12,
      priority: "critical",
      assignee: "Performance Engineer",
      teamMembers: [
        { name: "Alex Johnson", role: "QA Engineer" },
        { name: "Maria Garcia", role: "Performance Tester" },
      ],
    },
    {
      id: "14",
      name: "Phase 1 Completion",
      start: "2025-11-24",
      end: "2025-11-24",
      progress: 100,
      color: "#8b5cf6",
      order: 13,
      priority: "high",
      type: "milestone",
      assignee: "Project Manager",
      dependencies: ["2"],
    },
    {
      id: "15",
      name: "Design Approval",
      start: "2025-12-08",
      end: "2025-12-08",
      progress: 85,
      color: "#f59e0b",
      order: 14,
      priority: "critical",
      type: "milestone",
      assignee: "Design Lead",
      dependencies: ["5"],
    },
    {
      id: "16",
      name: "Integration Testing",
      start: "2025-12-16",
      end: "2025-12-22",
      progress: 0,
      color: "#ec4899",
      parentId: "11",
      order: 15,
      priority: "high",
      assignee: "QA Lead",
      teamMembers: [
        {
          name: "John Smith",
          role: "QA Engineer",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
        },
        {
          name: "Sarah Lee",
          role: "Test Analyst",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        },
        { name: "David Chen", role: "Automation Engineer" },
      ],
    },
    {
      id: "17",
      name: "Security Testing",
      start: "2025-12-18",
      end: "2025-12-24",
      progress: 0,
      color: "#ec4899",
      parentId: "11",
      order: 16,
      priority: "critical",
      assignee: "Security Team",
      teamMembers: [
        { name: "Robert Taylor", role: "Security Analyst" },
        { name: "Lisa Wang", role: "Penetration Tester" },
      ],
    },
    {
      id: "18",
      name: "Documentation Phase",
      start: "2025-12-20",
      end: "2025-12-30",
      progress: 0,
      color: "#06b6d4",
      order: 17,
      priority: "medium",
      dependencies: ["11"],
      description: "Technical and user documentation",
      assignee: "Technical Writer",
      teamMembers: [
        { name: "Jennifer Brown", role: "Technical Writer" },
        { name: "Michael Davis", role: "Documentation Specialist" },
      ],
    },
    {
      id: "19",
      name: "User Manual Creation",
      start: "2025-12-20",
      end: "2025-12-26",
      progress: 0,
      color: "#06b6d4",
      parentId: "18",
      order: 18,
      priority: "medium",
      assignee: "Technical Writer",
    },
    {
      id: "20",
      name: "API Documentation",
      start: "2025-12-22",
      end: "2025-12-28",
      progress: 0,
      color: "#06b6d4",
      parentId: "18",
      order: 19,
      priority: "low",
      assignee: "Backend Dev",
      dependencies: ["10"],
    },
    {
      id: "21",
      name: "Deployment Preparation",
      start: "2025-12-25",
      end: "2026-01-03",
      progress: 0,
      color: "#f97316",
      order: 20,
      priority: "high",
      dependencies: ["16", "17", "18"],
      description: "Environment setup and deployment planning",
      assignee: "DevOps Team",
      teamMembers: [
        { name: "Kevin Martinez", role: "DevOps Engineer" },
        { name: "Steve Johnson", role: "Cloud Architect" },
      ],
    },
    {
      id: "22",
      name: "Staging Environment Setup",
      start: "2025-12-25",
      end: "2025-12-29",
      progress: 0,
      color: "#f97316",
      parentId: "21",
      order: 21,
      priority: "high",
      assignee: "DevOps Engineer",
    },
    {
      id: "23",
      name: "Production Deployment",
      start: "2026-01-02",
      end: "2026-01-05",
      progress: 0,
      color: "#f97316",
      parentId: "21",
      order: 22,
      priority: "critical",
      assignee: "DevOps Lead",
      dependencies: ["22"],
    },
    {
      id: "24",
      name: "Post-Deployment Testing",
      start: "2026-01-05",
      end: "2026-01-08",
      progress: 0,
      color: "#ec4899",
      order: 23,
      priority: "high",
      dependencies: ["23"],
      assignee: "QA Team",
    },
    {
      id: "25",
      name: "Client Training",
      start: "2026-01-08",
      end: "2026-01-12",
      progress: 0,
      color: "#84cc16",
      order: 24,
      priority: "medium",
      dependencies: ["24"],
      description: "Training sessions for end users",
      assignee: "Training Team",
      teamMembers: [
        { name: "Amanda White", role: "Training Specialist" },
        { name: "Brian Miller", role: "Product Trainer" },
      ],
    },
    {
      id: "26",
      name: "Project Handover",
      start: "2026-01-13",
      end: "2026-01-15",
      progress: 0,
      color: "#84cc16",
      order: 25,
      priority: "critical",
      type: "milestone",
      dependencies: ["25"],
      assignee: "Project Manager",
    },
  ]);

  const handleDependencyCreated = (params: {
    fromId: string;
    fromName: string;
    toId: string;
    toName: string;
    dependencies: string[];
  }) => {
    console.log(
      JSON.stringify({
        event: "dependency_created",
        fromId: params.fromId,
        fromName: params.fromName,
        toId: params.toId,
        toName: params.toName,
        dependencies: params.dependencies,
      })
    );
  };

  const handleDependencyDeleted = (params: {
    fromId: string;
    fromName: string;
    toId: string;
    toName: string;
    dependencies: string[];
  }) => {
    console.log(
      JSON.stringify({
        event: "dependency_deleted",
        fromId: params.fromId,
        fromName: params.fromName,
        toId: params.toId,
        toName: params.toName,
        dependencies: params.dependencies,
      })
    );
  };

  const previousTasksRef = useRef<CanvasGanttTask[]>(tasks);

  useEffect(() => {
    previousTasksRef.current = tasks;
  }, [tasks]);

  const handleTaskReorder = (updatedTasks: CanvasGanttTask[]) => {
    const previousTasks = previousTasksRef.current;
    const changedTasks = updatedTasks
      .filter((updatedTask) => {
        const previous = previousTasks.find((t) => t.id === updatedTask.id);

        if (!previous) return true;

        return (
          previous.parentId !== updatedTask.parentId ||
          previous.order !== updatedTask.order
        );
      })
      .map((task) => ({
        id: task.id,
        name: task.name,
        parentId: task.parentId,
        order: task.order,
      }));

    if (changedTasks.length > 0) {
      console.log("Tasks updated:", changedTasks);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Full-screen Gantt Chart */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <GanttChart
          options={{
            showDependencies: true,
            showProgress: true,
            showCriticalPath: true,
            showResourceAssignment: true,
            showMilestones: true,
            showSummaryBars: true,
            zoomLevel: "day",
            darkMode: darkMode,
            showWeekendHighlight: true,
          }}
          setTasks={setTasks}
          tasks={tasks}
          onDependencyCreated={handleDependencyCreated}
          onDependencyDeleted={handleDependencyDeleted}
          onTaskDelete={(taskId) => console.log("Delete task", taskId)}
          onTaskEdit={(taskId) => console.log("Edit task", taskId)}
          // onTaskReorder={handleTaskReorder}
        />
      </div>
    </div>
  );
};

export default CanvasGanttChartExample;
