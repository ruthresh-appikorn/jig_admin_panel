"use client";

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
  memo,
} from "react";
import {
  Plus,
  Minus,
  Trash2,
  Edit2,
  ChevronRight,
  ChevronDown,
  GripVertical,
  ChevronsLeft,
  ChevronsRight,
  Maximize2,
  Minimize2,
  AlertTriangle,
  X,
} from "lucide-react";

export interface TeamMember {
  name: string;
  avatar?: any;
  role?: string;
  email?: string;
}

export interface CanvasGanttTask {
  id: string;
  name: string;
  start: string;
  end: string;
  progress: number;
  color?: string;
  parentId?: string;
  dependencies?: string[];
  expanded?: boolean;
  order: number;
  assignee?: string;
  priority?: "low" | "medium" | "high" | "critical";
  description?: string;
  type?: "task" | "milestone" | "summary";
  teamMembers?: TeamMember[];
  depth?: number;
}

export interface TaskReorderEvent {
  targetTaskId: string;
  movingTaskId: string;
  position: "above" | "below";
  targetTaskName: string;
  movingTaskName: string;
  newParentId?: string | null;
}

interface CanvasGanttChartProps {
  tasks: CanvasGanttTask[];
  setTasks: (tasks: CanvasGanttTask[]) => void;
  options?: {
    showDependencies?: boolean;
    showCriticalPath?: boolean;
    showResourceAssignment?: boolean;
    showProgress?: boolean;
    zoomLevel?: "day" | "week" | "month";
    darkMode?: boolean;
    showMilestones?: boolean;
    showSummaryBars?: boolean;
    showWeekendHighlight?: boolean;
  };
  onTaskReorder?: (reorderEvent: TaskReorderEvent) => void;
  onTaskSelect?: (taskId: string | null) => void;
  onMultiSelect?: (taskIds: string[]) => void;
  onTaskEdit?: (taskId: string) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskAdd?: () => void;
  onTaskMoved?: (params: {
    taskId: string;
    taskName: string;
    newStart: string;
    newEnd: string;
  }) => void;
  onTaskResized?: (params: {
    taskId: string;
    taskName: string;
    side: "start" | "end";
    newStart?: string;
    newEnd?: string;
  }) => void;
  onDependencyCreated?: (params: {
    fromId: string;
    fromName: string;
    toId: string;
    toName: string;
    dependencies: string[];
  }) => void;
  onDependencyDeleted?: (params: {
    fromId: string;
    fromName: string;
    toId: string;
    toName: string;
    dependencies: string[];
  }) => void;
}

interface Point {
  x: number;
  y: number;
}

interface TaskBounds {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rowBounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

const CANVAS_GANTT = {
  ROW_HEIGHT: 44,
  HEADER_HEIGHT: 60,
  TASKBAR_HEIGHT: 32,
  TASKBAR_PADDING: 6,
  TREE_WIDTH: 400,
  MIN_TREE_WIDTH: 200,
  MAX_TREE_WIDTH: 800,
  MIN_ZOOM_DAYS: 1,
  MAX_ZOOM_DAYS: 365,
  COLORS: {
    light: {
      background: "#ffffff",
      gridLine: "#e5e7eb",
      weekend: "#f9fafb",
      today: "#ef4444",
      dependency: "#6b7280",
      criticalPath: "#dc2626",
      text: "#374151",
      textLight: "#9ca3af",
      treeBackground: "#ffffff",
      treeHeader: "#f9fafb",
      progressOverlay: "rgba(255, 255, 255, 0.4)",
      connectionPoint: "#3b82f6",
      connectionPointActive: "#2563eb",
      milestone: "#374151",
      milestoneBorder: "#6b7280",
      selectedRow: "#eff6ff",
      hoverRow: "#f8fafc",
      border: "#e5e7eb",
      divider: "#3b82f6",
    },
    dark: {
      background: "#0f172a",
      gridLine: "#334155",
      weekend: "#1e293b",
      today: "#f87171",
      dependency: "#94a3b8",
      criticalPath: "#f87171",
      text: "#e2e8f0",
      textLight: "#94a3b8",
      treeBackground: "#1e293b",
      treeHeader: "#334155",
      progressOverlay: "rgba(0, 0, 0, 0.3)",
      connectionPoint: "#60a5fa",
      connectionPointActive: "#3b82f6",
      milestone: "#e2e8f0",
      milestoneBorder: "#94a3b8",
      selectedRow: "#1e3a8a",
      hoverRow: "#1e293b",
      border: "#334155",
      divider: "#60a5fa",
    },
    priority: {
      low: "#10b981",
      medium: "#f59e0b",
      high: "#ef4444",
      critical: "#7c2d12",
    },
  },
};

function CanvasGanttChartV2({
  tasks,
  setTasks,
  options = {},
  onTaskReorder,
  onTaskSelect,
  onMultiSelect,
  onTaskEdit,
  onTaskDelete,
  onTaskAdd = () => {},
  onTaskMoved,
  onTaskResized,
  onDependencyCreated,
  onDependencyDeleted,
}: CanvasGanttChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);

  const [treeWidth, setTreeWidth] = useState(CANVAS_GANTT.TREE_WIDTH);
  const [actualTreeWidth, setActualTreeWidth] = useState(
    CANVAS_GANTT.TREE_WIDTH
  );
  const [isDraggingDivider, setIsDraggingDivider] = useState(false);
  const dividerDragState = useRef<{
    startX: number;
    startWidth: number;
  } | null>(null);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dragOverTask, setDragOverTask] = useState<string | null>(null);
  const [dragInsertDirection, setDragInsertDirection] = useState<
    "above" | "below" | null
  >(null);
  // SINGLE SOURCE OF TRUTH for selection - used by left panel, canvas row, and canvas bar
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const [tooltipData, setTooltipData] = useState<{
    task: CanvasGanttTask;
    x: number;
    y: number;
    absolute?: boolean;
    side?: "left" | "right";
  } | null>(null);
  const [showTooltipForTask, setShowTooltipForTask] = useState<string | null>(
    null
  );
  const tooltipHoverTimeoutRef = useRef<number | null>(null);
  const tooltipAutoHideTimeoutRef = useRef<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [scrollX, setScrollX] = useState(0);
  const scrollYRef = useRef(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const ganttContainerRef = useRef<HTMLDivElement>(null);

  // Ref for left panel to sync scroll
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const leftContentRef = useRef<HTMLDivElement>(null);
  const stickyHeaderCanvasRef = useRef<HTMLCanvasElement>(null);
  const scrollSyncRafRef = useRef<number | null>(null);

  const scheduleLeftPanelSync = useCallback(() => {
    if (scrollSyncRafRef.current !== null) {
      window.cancelAnimationFrame(scrollSyncRafRef.current);
    }

    scrollSyncRafRef.current = window.requestAnimationFrame(() => {
      scrollSyncRafRef.current = null;
      if (leftContentRef.current) {
        const y = Math.round(scrollYRef.current);

        leftContentRef.current.style.transform = `translateY(-${y}px)`;
      }
    });
  }, []);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<{
    taskId: string;
    type: "start" | "end";
    x: number;
    y: number;
  } | null>(null);
  const [connectionCurrent, setConnectionCurrent] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [highlightedDropTargets, setHighlightedDropTargets] = useState<
    string[]
  >([]);

  // Multi-selection feature disabled for now
  // const [multiSelectedTasks, setMultiSelectedTasks] = useState<string[]>([]);

  const [isResizing, setIsResizing] = useState(false);
  const [resizeTask, setResizeTask] = useState<{
    taskId: string;
    side: "left" | "right";
  } | null>(null);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeCursor, setResizeCursor] = useState<
    "ew-resize" | "all-scroll" | "pointer" | "grab" | "default" | "copy"
  >("default");

  const [isDraggingTask, setIsDraggingTask] = useState(false);
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [selectedDependency, setSelectedDependency] = useState<{
    from: string;
    to: string;
  } | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [dependencyToDelete, setDependencyToDelete] = useState<{
    from: string;
    to: string;
    fromName: string;
    toName: string;
  } | null>(null);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [containerHeight, setContainerHeight] = useState(600);
  const [containerWidth, setContainerWidth] = useState(800);

  // Track last payloads so we can emit a single move/resize event on interaction end
  const lastMovePayloadRef = useRef<{
    taskId: string;
    taskName: string;
    newStart: string;
    newEnd: string;
  } | null>(null);
  const lastResizePayloadRef = useRef<{
    taskId: string;
    taskName: string;
    side: "start" | "end";
    newStart?: string;
    newEnd?: string;
  } | null>(null);

  // Handle sidebar collapse with smooth transition
  useEffect(() => {
    if (isSidebarCollapsed) {
      if (treeWidth !== 65) {
        setActualTreeWidth(treeWidth);
        setTreeWidth(65); // Minimal width aligned with ID column (w-16)
      }
    } else {
      if (treeWidth !== actualTreeWidth && actualTreeWidth !== 65) {
        setTreeWidth(actualTreeWidth);
      }
    }
  }, [isSidebarCollapsed]);

  // Track container height with ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
        setContainerWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Fullscreen toggle handler
  const toggleFullscreen = useCallback(async () => {
    if (!ganttContainerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await ganttContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Error toggling fullscreen:", err);
    }
  }, []);

  // Listen for fullscreen changes (including ESC key)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const mergedOptions = {
    showDependencies: true,
    showCriticalPath: true,
    showResourceAssignment: true,
    showProgress: true,
    showMilestones: true,
    showSummaryBars: true,
    zoomLevel: "day" as const,
    darkMode: false,
    showWeekendHighlight: false,
    ...options,
  };

  const colors = mergedOptions.darkMode
    ? CANVAS_GANTT.COLORS.dark
    : CANVAS_GANTT.COLORS.light;

  // Process tasks with hierarchy
  const processedTasks = useMemo(() => {
    const taskMap = new Map<
      string,
      CanvasGanttTask & { children: CanvasGanttTask[] }
    >();

    tasks.forEach((t) => {
      taskMap.set(t.id, { ...t, children: [], expanded: t.expanded !== false });
    });

    const roots: (CanvasGanttTask & { children: CanvasGanttTask[] })[] = [];

    taskMap.forEach((task) => {
      if (task.parentId && taskMap.has(task.parentId)) {
        taskMap.get(task.parentId)!.children.push(task);
      } else {
        roots.push(task);
      }
    });

    const sortTasks = (
      taskList: (CanvasGanttTask & { children: CanvasGanttTask[] })[]
    ) => {
      taskList.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      taskList.forEach((task) => {
        if (task.children?.length) {
          sortTasks(
            task.children as (CanvasGanttTask & {
              children: CanvasGanttTask[];
            })[]
          );
        }
      });
    };

    sortTasks(roots);

    return { roots, taskMap };
  }, [tasks]);

  // Flatten tasks for rendering
  const flatTasks = useMemo(() => {
    const result: (CanvasGanttTask & {
      depth: number;
      children?: CanvasGanttTask[];
    })[] = [];

    const flatten = (
      tasks: (CanvasGanttTask & { children: CanvasGanttTask[] })[],
      depth: number = 0
    ) => {
      tasks.forEach((task) => {
        result.push({ ...task, depth, children: task.children });
        if (task.expanded && task.children?.length) {
          flatten(
            task.children as (CanvasGanttTask & {
              children: CanvasGanttTask[];
            })[],
            depth + 1
          );
        }
      });
    };

    flatten(processedTasks.roots);

    return result;
  }, [processedTasks]);

  // Handle keyboard events for dependency deletion
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedDependency) {
        // Get task names before showing modal
        const toTask = flatTasks.find((t) => t.id === selectedDependency.to);
        const fromTask = flatTasks.find(
          (t) => t.id === selectedDependency.from
        );

        // Show confirmation modal instead of direct deletion
        setDependencyToDelete({
          from: selectedDependency.from,
          to: selectedDependency.to,
          fromName: fromTask?.name || "",
          toName: toTask?.name || "",
        });
        setShowDeleteConfirmModal(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedDependency, flatTasks]);

  // Function to handle actual deletion after confirmation
  const handleConfirmDelete = useCallback(() => {
    if (!dependencyToDelete) return;

    // Delete the selected dependency
    const updatedTasks = tasks.map((t) => {
      if (t.id === dependencyToDelete.to) {
        const currentDeps = t.dependencies || [];
        const newDeps = currentDeps.filter(
          (depId) => depId !== dependencyToDelete.from
        );

        return { ...t, dependencies: newDeps };
      }

      return t;
    });

    setTasks(updatedTasks);

    const updatedTask = updatedTasks.find(
      (t) => t.id === dependencyToDelete.to
    );

    // Call the new handler with comprehensive information
    if (onDependencyDeleted && updatedTask) {
      onDependencyDeleted({
        fromId: dependencyToDelete.from,
        fromName: dependencyToDelete.fromName,
        toId: dependencyToDelete.to,
        toName: dependencyToDelete.toName,
        dependencies: updatedTask.dependencies || [],
      });
    }

    console.log(
      JSON.stringify({
        event: "dependency_deleted",
        fromId: dependencyToDelete.from,
        fromName: dependencyToDelete.fromName,
        toId: dependencyToDelete.to,
        toName: dependencyToDelete.toName,
        dependencies: updatedTask?.dependencies,
      })
    );

    // Clear selection and close modal
    setSelectedDependency(null);
    setShowDeleteConfirmModal(false);
    setDependencyToDelete(null);
  }, [dependencyToDelete, tasks, onDependencyDeleted, setTasks]);

  useEffect(() => {
    return () => {
      if (tooltipHoverTimeoutRef.current !== null) {
        window.clearTimeout(tooltipHoverTimeoutRef.current);
      }
      if (tooltipAutoHideTimeoutRef.current !== null) {
        window.clearTimeout(tooltipAutoHideTimeoutRef.current);
      }
      if (scrollSyncRafRef.current !== null) {
        window.cancelAnimationFrame(scrollSyncRafRef.current);
      }
    };
  }, []);

  const normalizeParentId = (parentId?: string | null) =>
    parentId ?? "__root__";

  const reorderTasks = useCallback(
    (
      dragId: string,
      targetId: string,
      direction: "above" | "below" = "above"
    ) => {
      if (dragId === targetId) return;

      const dragTask = tasks.find((t) => t.id === dragId);
      const targetTask = tasks.find((t) => t.id === targetId);

      if (!dragTask || !targetTask) return;

      const dragParent = normalizeParentId(dragTask.parentId);
      const targetParent = normalizeParentId(targetTask.parentId);

      console.log(
        `Reorder Debug: Drag=${dragTask.name} (${dragId}) -> Target=${targetTask.name} (${targetId})`
      );
      console.log(
        `Reorder Debug: DragParent=${dragParent}, TargetParent=${targetParent}, Direction=${direction}`
      );

      // 🔧 Special Case: Drop BELOW an EXPANDED parent -> Make it the FIRST CHILD
      // Condition: Target must be expanded AND have children (to distinguish from simple reorder of leaf tasks)
      const targetHasChildren = tasks.some(
        (t) => normalizeParentId(t.parentId) === targetTask.id
      );

      if (
        direction === "below" &&
        targetTask.expanded !== false &&
        targetHasChildren
      ) {
        console.log(
          "Reorder Debug: Dropping below expanded parent (with children) -> Reparenting to target"
        );

        const newParentId = targetTask.id;
        let working = tasks.map((t) => ({ ...t }));

        // 1. Update parent of dragged task
        working = working.map((t) =>
          t.id === dragId ? { ...t, parentId: newParentId } : t
        );

        // 2. Get children of the target (new siblings)
        const children = working
          .filter((t) => normalizeParentId(t.parentId) === newParentId)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        // 3. Remove dragged task from children list if it's there (to re-insert at top)
        const dragIndex = children.findIndex((t) => t.id === dragId);
        if (dragIndex !== -1) {
          children.splice(dragIndex, 1);
        }

        // 4. Insert at the beginning (index 0)
        const draggedTaskObj = working.find((t) => t.id === dragId);
        if (draggedTaskObj) {
          children.unshift(draggedTaskObj);
        }

        // 5. Re-index children
        working = working.map((t) => {
          if (normalizeParentId(t.parentId) !== newParentId) return t;
          const newIndex = children.findIndex((c) => c.id === t.id);
          return newIndex !== -1 ? { ...t, order: newIndex } : t;
        });

        onTaskReorder?.({
          targetTaskId: targetId,
          movingTaskId: dragId,
          position: "below",
          targetTaskName: targetTask.name,
          movingTaskName: dragTask.name,
          newParentId: targetTask.id,
        });

        setTasks(working);
        return;
      }

      let working = tasks.map((task: CanvasGanttTask) => ({ ...task }));

      if (dragParent !== targetParent) {
        console.log("Reorder Debug: Reparenting detected");
        working = working.map((task: CanvasGanttTask) =>
          task.id === dragId ? { ...task, parentId: targetTask.parentId } : task
        );
      }

      const siblings = working
        .filter(
          (t: CanvasGanttTask) => normalizeParentId(t.parentId) === targetParent
        )
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      const dragIndex = siblings.findIndex((t) => t.id === dragId);
      const targetIndex = siblings.findIndex((t) => t.id === targetId);

      console.log(
        `Reorder Debug: Indices - Drag=${dragIndex}, Target=${targetIndex}`
      );

      if (dragIndex === -1 || targetIndex === -1) {
        console.error("Reorder Debug: Failed to find tasks in siblings list!");
        return;
      }

      const reorderedSiblings = [...siblings];
      const [moved] = reorderedSiblings.splice(dragIndex, 1);

      let insertionIndex = targetIndex;

      if (direction === "below") {
        insertionIndex = targetIndex + 1;
      }
      if (dragIndex < targetIndex && insertionIndex > 0) {
        insertionIndex -= 1; // account for index shift after removal
      }

      reorderedSiblings.splice(insertionIndex, 0, moved);

      working = working.map((task: CanvasGanttTask) => {
        if (normalizeParentId(task.parentId) !== targetParent) {
          return task;
        }
        const siblingIndex = reorderedSiblings.findIndex(
          (s) => s.id === task.id
        );

        if (siblingIndex === -1) return task;

        return { ...task, order: siblingIndex };
      });

      onTaskReorder?.({
        targetTaskId: targetId,
        movingTaskId: dragId,
        position: direction,
        targetTaskName: targetTask.name,
        movingTaskName: dragTask.name,
        newParentId:
          normalizeParentId(targetTask.parentId) === "__root__"
            ? null
            : targetTask.parentId,
      });
      setTasks(working);

      console.log(
        JSON.stringify({
          event: "task_reorder",
          targetTaskId: targetId,
          movingTaskId: dragId,
          position: direction,
          targetTaskName: targetTask.name,
          movingTaskName: dragTask.name,
        })
      );
    },
    [tasks, setTasks, onTaskReorder]
  );

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId);
  };

  const handleDragOver = (
    taskId: string,
    e: React.DragEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    if (!draggedTask || draggedTask === taskId) {
      return;
    }

    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const relY = e.clientY - rect.top;

    // 🔧 Use 50% threshold instead of 25% to eliminate dead zone
    // Top 50% = "above", Bottom 50% = "below"
    const dir: "above" | "below" = relY <= rect.height / 2 ? "above" : "below";

    setDragInsertDirection(dir);
    setDragOverTask(taskId);
  };

  const handleDrop = (taskId: string) => {
    if (draggedTask && draggedTask !== taskId && dragInsertDirection) {
      reorderTasks(draggedTask, taskId, dragInsertDirection);
    }
    setDragOverTask(null);
    setDraggedTask(null);
    setDragInsertDirection(null);
  };

  const handleDragEnd = () => {
    setDragOverTask(null);
    setDraggedTask(null);
  };

  const handleIndent = useCallback(() => {
    if (!selectedTaskId) return;
    const idx = tasks.findIndex((t) => t.id === selectedTaskId);

    if (idx <= 0) return;
    const prevSibling = tasks[idx - 1];

    if (!prevSibling) return;

    const targetParentId = prevSibling.id;
    const siblings = tasks.filter(
      (t: CanvasGanttTask) =>
        normalizeParentId(t.parentId) === normalizeParentId(targetParentId)
    );
    const nextOrder = siblings.length;

    const updated = tasks.map((task: CanvasGanttTask) =>
      task.id === selectedTaskId
        ? {
            ...task,
            parentId: targetParentId,
            order: nextOrder,
          }
        : task
    );

    setTasks(updated);
  }, [selectedTaskId, tasks, setTasks, onTaskReorder]);

  const handleOutdent = useCallback(() => {
    if (!selectedTaskId) return;
    const current = tasks.find((t) => t.id === selectedTaskId);

    if (!current || !current.parentId) return;
    const parent = tasks.find(
      (t: CanvasGanttTask) => t.id === current.parentId
    );
    const newParentId = parent?.parentId ?? null;

    const siblings = tasks.filter(
      (t: CanvasGanttTask) =>
        normalizeParentId(t.parentId) ===
        normalizeParentId(newParentId || undefined)
    );
    const nextOrder = siblings.length;

    const updated = tasks.map((task: CanvasGanttTask) =>
      task.id === selectedTaskId
        ? {
            ...task,
            parentId: newParentId || undefined,
            order: nextOrder,
          }
        : task
    );

    setTasks(updated);
  }, [selectedTaskId, tasks, setTasks, onTaskReorder]);

  // Calculate date range
  const dateRange = useMemo(() => {
    const dates = tasks.flatMap((t) => [new Date(t.start), new Date(t.end)]);
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 7);

    return { minDate, maxDate };
  }, [tasks]);

  // Calculate task bounds (kept for future features like tooltips)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const taskBounds = useMemo(() => {
    const bounds: TaskBounds[] = [];
    const { minDate } = dateRange;
    const pixelsPerDay = 32 * zoomLevel;

    flatTasks.forEach((task, index) => {
      const startDate = new Date(task.start);
      const endDate = new Date(task.end);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return;
      }

      const startDays = Math.round(
        (startDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const duration = Math.max(
        1,
        Math.round(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        )
      );

      const yOffset =
        CANVAS_GANTT.HEADER_HEIGHT + index * CANVAS_GANTT.ROW_HEIGHT;
      const x = startDays * pixelsPerDay;
      const width = duration * pixelsPerDay;
      const y =
        yOffset + (CANVAS_GANTT.ROW_HEIGHT - CANVAS_GANTT.TASKBAR_HEIGHT) / 2;
      const height = CANVAS_GANTT.TASKBAR_HEIGHT;

      bounds.push({
        id: task.id,
        x,
        y,
        width,
        height,
        rowBounds: {
          x: 0,
          y: yOffset,
          width: 0,
          height: CANVAS_GANTT.ROW_HEIGHT,
        },
      });
    });

    return bounds;
  }, [flatTasks, dateRange, zoomLevel, treeWidth]);

  // No-op hooks retained for potential future side effects (currently unused)

  // Calculate canvas dimensions
  const canvasDimensions = useMemo(() => {
    const { minDate, maxDate } = dateRange;
    const pixelsPerDay = 32 * zoomLevel;
    const totalDays = Math.round(
      (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    // Always use container height to fill available space, but ensure minimum for tasks
    const taskBasedHeight =
      CANVAS_GANTT.HEADER_HEIGHT + flatTasks.length * CANVAS_GANTT.ROW_HEIGHT;
    // Add extra buffer to fill the container fully
    const totalHeight = Math.max(
      containerHeight + CANVAS_GANTT.HEADER_HEIGHT,
      taskBasedHeight
    );

    // Calculate width - use container width to fill viewport
    const taskBasedWidth = totalDays * pixelsPerDay + 200;
    const totalWidth = Math.max(containerWidth, taskBasedWidth);

    return {
      width: totalWidth,
      height: totalHeight,
    };
  }, [dateRange, zoomLevel, flatTasks.length, containerHeight, containerWidth]);

  // Render sticky header canvas
  useEffect(() => {
    const canvas = stickyHeaderCanvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const { minDate, maxDate } = dateRange;
    const pixelsPerDay = 32 * zoomLevel;
    const totalDays = Math.round(
      (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const canvasWidth = totalDays * pixelsPerDay + 200;

    // Scale for high-DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = CANVAS_GANTT.HEADER_HEIGHT * dpr;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${CANVAS_GANTT.HEADER_HEIGHT}px`;

    // Scale the context to match
    ctx.scale(dpr, dpr);

    // Render header dates
    const colors = {
      treeHeader: mergedOptions.darkMode ? "#1f2937" : "#f9fafb",
      gridLine: mergedOptions.darkMode ? "#374151" : "#e5e7eb",
      text: mergedOptions.darkMode ? "#9ca3af" : "#6b7280",
      weekend: mergedOptions.darkMode
        ? "rgba(239, 68, 68, 0.1)"
        : "rgba(239, 68, 68, 0.05)",
    };

    // Header background
    ctx.fillStyle = colors.treeHeader;
    ctx.fillRect(0, 0, canvasWidth, CANVAS_GANTT.HEADER_HEIGHT);

    // Draw dates
    ctx.font = "11px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let i = 0; i <= totalDays; i++) {
      const currentDate = new Date(minDate);

      currentDate.setDate(minDate.getDate() + i);
      const x = i * pixelsPerDay;

      // Month/Year header
      if (currentDate.getDate() === 1 || i === 0) {
        ctx.fillStyle = mergedOptions.darkMode ? "#e5e7eb" : "#374151";
        ctx.font = "bold 12px Inter, system-ui, sans-serif";
        const monthYear = currentDate.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });

        ctx.fillText(monthYear, x + 40, 15);
        ctx.font = "11px Inter, system-ui, sans-serif";

        // Divider line
        if (i > 0 && x < canvasWidth) {
          ctx.strokeStyle = mergedOptions.darkMode ? "#4b5563" : "#d1d5db";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, CANVAS_GANTT.HEADER_HEIGHT);
          ctx.stroke();
        }
      }

      // Weekend highlight
      const dayOfWeek = currentDate.getDay();

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        ctx.fillStyle = colors.weekend;
        ctx.fillRect(
          i * pixelsPerDay,
          CANVAS_GANTT.HEADER_HEIGHT - 25,
          pixelsPerDay,
          25
        );
      }

      // Day number
      const day = currentDate.getDate();

      ctx.fillStyle =
        dayOfWeek === 0 || dayOfWeek === 6
          ? "#ef4444"
          : mergedOptions.darkMode
            ? "#ffffff"
            : colors.text;
      ctx.fillText(
        day.toString(),
        x + pixelsPerDay / 2,
        CANVAS_GANTT.HEADER_HEIGHT - 10
      );
    }

    // Bottom border
    ctx.strokeStyle = colors.gridLine;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_GANTT.HEADER_HEIGHT);
    ctx.lineTo(canvasWidth, CANVAS_GANTT.HEADER_HEIGHT);
    ctx.stroke();
  }, [dateRange, zoomLevel, mergedOptions.darkMode]);

  useEffect(() => {
    if (!isDraggingDivider) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dividerDragState.current) return;
      const delta = e.clientX - dividerDragState.current.startX;
      let newWidth = dividerDragState.current.startWidth + delta;

      newWidth = Math.max(
        CANVAS_GANTT.MIN_TREE_WIDTH,
        Math.min(CANVAS_GANTT.MAX_TREE_WIDTH, newWidth)
      );
      setTreeWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDraggingDivider(false);
      dividerDragState.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingDivider]);

  // Canvas mouse event handlers
  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      const container = containerRef.current;

      if (!canvas || !container) return;

      // Mouse position in canvas drawing coordinates (scroll-independent)
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const pixelsPerDay = 32 * zoomLevel;

      // Handle task dragging (moving) - horizontal only
      if (isDraggingTask && dragTaskId) {
        const deltaX = mouseX - dragStartX;
        const deltaDays = Math.round(deltaX / pixelsPerDay);

        if (deltaDays !== 0) {
          const task = flatTasks.find((t) => t.id === dragTaskId);

          if (task) {
            const startDate = new Date(task.start);
            const endDate = new Date(task.end);

            startDate.setDate(startDate.getDate() + deltaDays);
            endDate.setDate(endDate.getDate() + deltaDays);

            const updatedTasks = tasks.map((t) =>
              t.id === task.id
                ? {
                    ...t,
                    start: startDate.toISOString().split("T")[0],
                    end: endDate.toISOString().split("T")[0],
                  }
                : t
            );

            setTasks(updatedTasks);
            setDragStartX(mouseX);
            // Only remember last move; actual log happens on mouse up
            lastMovePayloadRef.current = {
              taskId: task.id,
              taskName: task.name,
              newStart: startDate.toISOString().split("T")[0],
              newEnd: endDate.toISOString().split("T")[0],
            };
          }
        }

        return;
      }

      // Handle resizing
      if (isResizing && resizeTask) {
        const deltaX = mouseX - resizeStartX;
        const deltaDays = Math.round(deltaX / pixelsPerDay);

        if (deltaDays !== 0) {
          const task = flatTasks.find((t) => t.id === resizeTask.taskId);

          if (task) {
            const startDate = new Date(task.start);
            const endDate = new Date(task.end);

            if (resizeTask.side === "left") {
              startDate.setDate(startDate.getDate() + deltaDays);
              // Don't allow start to go past end
              if (startDate < endDate) {
                const updatedTasks = tasks.map((t) =>
                  t.id === task.id
                    ? { ...t, start: startDate.toISOString().split("T")[0] }
                    : t
                );

                setTasks(updatedTasks);
                setResizeStartX(mouseX);
                // Remember last resize from left side; log on mouse up
                lastResizePayloadRef.current = {
                  taskId: task.id,
                  taskName: task.name,
                  side: "start",
                  newStart: startDate.toISOString().split("T")[0],
                };
              }
            } else {
              endDate.setDate(endDate.getDate() + deltaDays);
              // Don't allow end to go before start
              if (endDate > startDate) {
                const updatedTasks = tasks.map((t) =>
                  t.id === task.id
                    ? { ...t, end: endDate.toISOString().split("T")[0] }
                    : t
                );

                setTasks(updatedTasks);
                setResizeStartX(mouseX);
                // Remember last resize from right side; log on mouse up
                lastResizePayloadRef.current = {
                  taskId: task.id,
                  taskName: task.name,
                  side: "end",
                  newEnd: endDate.toISOString().split("T")[0],
                };
              }
            }
          }
        }

        return;
      }

      // Update connection current position if dragging
      if (isConnecting && connectionStart) {
        const hitRadius = 26; // Stronger magnet effect
        let snappedPoint: { x: number; y: number } | null = null;
        let nearestTargetId: string | null = null;
        let nearestDist = Number.POSITIVE_INFINITY;

        // Find closest connection point on any other task
        for (let index = 0; index < flatTasks.length; index++) {
          const task = flatTasks[index];

          if (task.id === connectionStart.taskId) continue;

          const startDate = new Date(task.start);
          const endDate = new Date(task.end);

          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) continue;

          const startDays = Math.round(
            (startDate.getTime() - dateRange.minDate.getTime()) /
              (1000 * 60 * 60 * 24)
          );
          const duration = Math.max(
            1,
            Math.round(
              (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
            )
          );

          const yOffset =
            CANVAS_GANTT.HEADER_HEIGHT + index * CANVAS_GANTT.ROW_HEIGHT;
          const x = startDays * pixelsPerDay;
          const taskWidth = duration * pixelsPerDay;
          const y =
            yOffset +
            (CANVAS_GANTT.ROW_HEIGHT - CANVAS_GANTT.TASKBAR_HEIGHT) / 2;
          const taskHeight = CANVAS_GANTT.TASKBAR_HEIGHT;
          const centerY = y + taskHeight / 2;

          const leftPointX = x - 6;
          const rightPointX = x + taskWidth + 6;

          // Determine which side we are coming from: start or end
          const candidatePoints: { x: number; y: number; taskId: string }[] =
            [];

          if (connectionStart.type === "start") {
            // drag from left side, so prefer connecting into right side of other tasks
            candidatePoints.push({
              x: rightPointX,
              y: centerY,
              taskId: task.id,
            });
          } else {
            // drag from right side, prefer left side of other tasks
            candidatePoints.push({
              x: leftPointX,
              y: centerY,
              taskId: task.id,
            });
          }

          for (const p of candidatePoints) {
            const d = Math.hypot(mouseX - p.x, mouseY - p.y);

            if (d < hitRadius && d < nearestDist) {
              nearestDist = d;
              snappedPoint = { x: p.x, y: p.y };
              nearestTargetId = p.taskId;
            }
          }
        }

        if (snappedPoint && nearestTargetId) {
          // Magnet effect: snap to nearest dot and highlight only that task
          setConnectionCurrent(snappedPoint);
          setHighlightedDropTargets([nearestTargetId]);
        } else {
          // No nearby target: free cursor and clear highlight
          setConnectionCurrent({ x: mouseX, y: mouseY });
          setHighlightedDropTargets([]);
        }

        return;
      }

      // Simple index-based row detection (matches left list exactly)
      let currentHoveredTaskId: string | null = null;
      let newCursor:
        | "ew-resize"
        | "all-scroll"
        | "pointer"
        | "grab"
        | "default"
        | "copy" = "default";
      const edgeThreshold = 12;

      // Calculate which row the mouse is in (after header)
      const relativeY = mouseY - CANVAS_GANTT.HEADER_HEIGHT;

      if (relativeY >= 0) {
        const rowIndex = Math.floor(relativeY / CANVAS_GANTT.ROW_HEIGHT);

        if (rowIndex >= 0 && rowIndex < flatTasks.length) {
          const task = flatTasks[rowIndex];

          currentHoveredTaskId = task.id;

          // Calculate task bar position for this row
          const index = rowIndex;
          const startDate = new Date(task.start);
          const endDate = new Date(task.end);

          if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
            const startDays = Math.round(
              (startDate.getTime() - dateRange.minDate.getTime()) /
                (1000 * 60 * 60 * 24)
            );
            const duration = Math.max(
              1,
              Math.round(
                (endDate.getTime() - startDate.getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            );

            const yOffset =
              CANVAS_GANTT.HEADER_HEIGHT + index * CANVAS_GANTT.ROW_HEIGHT;
            const x = startDays * pixelsPerDay;
            const taskWidth = duration * pixelsPerDay;
            const y =
              yOffset +
              (CANVAS_GANTT.ROW_HEIGHT - CANVAS_GANTT.TASKBAR_HEIGHT) / 2;
            const taskHeight = CANVAS_GANTT.TASKBAR_HEIGHT;

            const centerY = y + taskHeight / 2;
            const leftDotX = x - 6;
            const rightDotX = x + taskWidth + 6;
            const connectionRadius = 14;

            const distToLeft = Math.hypot(mouseX - leftDotX, mouseY - centerY);
            const distToRight = Math.hypot(
              mouseX - rightDotX,
              mouseY - centerY
            );

            const overLeftDot = distToLeft <= connectionRadius;
            const overRightDot = distToRight <= connectionRadius;

            // Connection dots get priority
            if (overLeftDot || overRightDot) {
              newCursor = "copy";
            }
            // Only show resize/drag cursors if this task is selected
            else if (selectedTaskId === task.id) {
              const onLeftEdge = mouseX >= x && mouseX <= x + edgeThreshold;
              const onRightEdge =
                mouseX >= x + taskWidth - edgeThreshold &&
                mouseX <= x + taskWidth;
              const onBar = mouseX >= x && mouseX <= x + taskWidth;

              if (onLeftEdge || onRightEdge) {
                newCursor = "ew-resize";
              } else if (onBar) {
                newCursor = "all-scroll";
              } else {
                newCursor = "pointer";
              }
            } else {
              newCursor = "pointer";
            }
          }
        }
      }

      // Apply cursor state once
      if (newCursor !== resizeCursor) {
        setResizeCursor(newCursor);
      }

      setHoveredTaskId(currentHoveredTaskId);

      if (!showTooltipForTask) {
        setTooltipData(null);
      }
    },
    [
      flatTasks,
      zoomLevel,
      dateRange,
      isConnecting,
      connectionStart,
      resizeCursor,
      isResizing,
      resizeTask,
      resizeStartX,
      tasks,
      setTasks,
      selectedTaskId,
      showTooltipForTask,
      isDraggingTask,
      dragTaskId,
      dragStartX,
    ]
  );

  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      const container = containerRef.current;

      if (!canvas || !container) return;

      // Mouse position in canvas drawing coordinates (already includes scroll)
      const canvasRect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - canvasRect.left;
      const mouseY = e.clientY - canvasRect.top;

      const pixelsPerDay = 32 * zoomLevel;
      const edgeThreshold = 12;

      // PRIORITY 0: Check connection dots FIRST (before dependency lines)
      // Simple index-based row detection
      const relativeY = mouseY - CANVAS_GANTT.HEADER_HEIGHT;

      if (relativeY >= 0) {
        const rowIndex = Math.floor(relativeY / CANVAS_GANTT.ROW_HEIGHT);

        if (rowIndex >= 0 && rowIndex < flatTasks.length) {
          const task = flatTasks[rowIndex];
          const startDate = new Date(task.start);
          const endDate = new Date(task.end);

          if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
            const startDays = Math.round(
              (startDate.getTime() - dateRange.minDate.getTime()) /
                (1000 * 60 * 60 * 24)
            );
            const duration = Math.max(
              1,
              Math.round(
                (endDate.getTime() - startDate.getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            );

            const yOffset =
              CANVAS_GANTT.HEADER_HEIGHT + rowIndex * CANVAS_GANTT.ROW_HEIGHT;
            const x = startDays * pixelsPerDay;
            const taskWidth = duration * pixelsPerDay;
            const y =
              yOffset +
              (CANVAS_GANTT.ROW_HEIGHT - CANVAS_GANTT.TASKBAR_HEIGHT) / 2;
            const taskHeight = CANVAS_GANTT.TASKBAR_HEIGHT;

            const pointY = y + taskHeight / 2;
            const connectionRadius = 14;
            const leftPointX = x - 6;
            const rightPointX = x + taskWidth + 6;

            // Check Connection Dots
            const distToStart = Math.hypot(
              mouseX - leftPointX,
              mouseY - pointY
            );
            const distToEnd = Math.hypot(mouseX - rightPointX, mouseY - pointY);

            if (distToStart <= connectionRadius) {
              setSelectedTaskId(task.id);
              setSelectedDependency(null);
              onTaskSelect?.(task.id);
              setTooltipData(null);
              setShowTooltipForTask(null);

              setIsConnecting(true);
              setConnectionStart({
                taskId: task.id,
                type: "start",
                x: leftPointX,
                y: pointY,
              });
              setConnectionCurrent({ x: mouseX, y: mouseY });
              console.log(
                JSON.stringify({
                  event: "connection_start",
                  taskId: task.id,
                  taskName: task.name,
                  type: "start",
                })
              );

              return;
            }

            if (distToEnd <= connectionRadius) {
              setSelectedTaskId(task.id);
              setSelectedDependency(null);
              onTaskSelect?.(task.id);
              setTooltipData(null);
              setShowTooltipForTask(null);

              setIsConnecting(true);
              setConnectionStart({
                taskId: task.id,
                type: "end",
                x: rightPointX,
                y: pointY,
              });
              setConnectionCurrent({ x: mouseX, y: mouseY });
              console.log(
                JSON.stringify({
                  event: "connection_start",
                  taskId: task.id,
                  taskName: task.name,
                  type: "end",
                })
              );

              return;
            }
          }
        }
      }

      // PRIORITY 1: Check dependency click (after connection dots)
      let dependencyClicked = false;

      flatTasks.forEach((task, taskIndex) => {
        if (
          !task.dependencies ||
          task.dependencies.length === 0 ||
          dependencyClicked
        )
          return;

        task.dependencies.forEach((depId) => {
          if (dependencyClicked) return;

          const depTask = flatTasks.find((t) => t.id === depId);

          if (!depTask) return;

          const depIndex = flatTasks.indexOf(depTask);

          if (depIndex === -1) return;

          const depEndDate = new Date(depTask.end);
          const taskStartDate = new Date(task.start);

          if (isNaN(depEndDate.getTime()) || isNaN(taskStartDate.getTime()))
            return;

          const depEndDays = Math.round(
            (depEndDate.getTime() - dateRange.minDate.getTime()) /
              (1000 * 60 * 60 * 24)
          );
          const taskStartDays = Math.round(
            (taskStartDate.getTime() - dateRange.minDate.getTime()) /
              (1000 * 60 * 60 * 24)
          );

          const fromX = depEndDays * pixelsPerDay;
          const fromY =
            CANVAS_GANTT.HEADER_HEIGHT +
            depIndex * CANVAS_GANTT.ROW_HEIGHT +
            CANVAS_GANTT.ROW_HEIGHT / 2;
          const toX = taskStartDays * pixelsPerDay;
          const toY =
            CANVAS_GANTT.HEADER_HEIGHT +
            taskIndex * CANVAS_GANTT.ROW_HEIGHT +
            CANVAS_GANTT.ROW_HEIGHT / 2;

          // Hit test for dependency path with larger threshold
          const midX = fromX + 20;
          const threshold = 15; // Increased from 10 to 15 for easier clicking

          // Check all segments of the path
          const isNearPath =
            // First horizontal segment
            (mouseY >= fromY - threshold &&
              mouseY <= fromY + threshold &&
              mouseX >= fromX - threshold &&
              mouseX <= midX + threshold) ||
            // Vertical segment
            (mouseX >= midX - threshold &&
              mouseX <= midX + threshold &&
              mouseY >= Math.min(fromY, toY) - threshold &&
              mouseY <= Math.max(fromY, toY) + threshold) ||
            // Second horizontal segment
            (mouseY >= toY - threshold &&
              mouseY <= toY + threshold &&
              mouseX >= midX - threshold &&
              mouseX <= toX + threshold);

          if (isNearPath) {
            dependencyClicked = true;
            setSelectedDependency({ from: depId, to: task.id });
            setSelectedTaskId(null); // Deselect task when selecting dependency
            const fromTask = flatTasks.find((t) => t.id === depId);

            console.log(
              JSON.stringify({
                event: "dependency_selected",
                from: depId,
                fromName: fromTask?.name,
                to: task.id,
                toName: task.name,
              })
            );
          }
        });
      });

      // If dependency was clicked, don't process task clicks
      if (dependencyClicked) {
        return;
      }

      // PRIORITY 2: Task Bar Interactions (Resize, Drag, Select)
      // Re-calculate row index since we need it again (or could have saved it, but this is cleaner for now)
      if (relativeY >= 0) {
        const rowIndex = Math.floor(relativeY / CANVAS_GANTT.ROW_HEIGHT);

        if (rowIndex >= 0 && rowIndex < flatTasks.length) {
          const task = flatTasks[rowIndex];
          const startDate = new Date(task.start);
          const endDate = new Date(task.end);

          if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
            const startDays = Math.round(
              (startDate.getTime() - dateRange.minDate.getTime()) /
                (1000 * 60 * 60 * 24)
            );
            const duration = Math.max(
              1,
              Math.round(
                (endDate.getTime() - startDate.getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            );

            const yOffset =
              CANVAS_GANTT.HEADER_HEIGHT + rowIndex * CANVAS_GANTT.ROW_HEIGHT;
            const x = startDays * pixelsPerDay;
            const taskWidth = duration * pixelsPerDay;
            const y =
              yOffset +
              (CANVAS_GANTT.ROW_HEIGHT - CANVAS_GANTT.TASKBAR_HEIGHT) / 2;
            const taskHeight = CANVAS_GANTT.TASKBAR_HEIGHT;

            // Priority 2: Resize/Drag (only if task is already selected)
            if (selectedTaskId === task.id) {
              const onBar = mouseX >= x && mouseX <= x + taskWidth;
              const onLeftEdge = mouseX >= x && mouseX <= x + edgeThreshold;
              const onRightEdge =
                mouseX >= x + taskWidth - edgeThreshold &&
                mouseX <= x + taskWidth;

              if (onLeftEdge && onBar) {
                setIsResizing(true);
                setResizeTask({ taskId: task.id, side: "left" });
                setResizeStartX(mouseX);

                return;
              }

              if (onRightEdge && onBar) {
                setIsResizing(true);
                setResizeTask({ taskId: task.id, side: "right" });
                setResizeStartX(mouseX);

                return;
              }

              if (onBar) {
                setIsDraggingTask(true);
                setDragTaskId(task.id);
                setDragStartX(mouseX);
                setResizeCursor("all-scroll");
                console.log(
                  JSON.stringify({
                    event: "task_drag_start",
                    taskId: task.id,
                    taskName: task.name,
                  })
                );

                return;
              }
            }

            // Priority 3: Row click - Select task (click anywhere in row)
            setSelectedTaskId(task.id);
            setSelectedDependency(null);
            onTaskSelect?.(task.id);
            console.log(
              JSON.stringify({
                event: "task_selected",
                taskId: task.id,
                taskName: task.name,
              })
            );

            return;
          }
        }
      }
    },
    [flatTasks, zoomLevel, dateRange, onTaskSelect, selectedTaskId]
  );

  const handleCanvasMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      // Stop task dragging
      if (isDraggingTask) {
        setIsDraggingTask(false);
        setDragTaskId(null);
        setResizeCursor("default");

        // Emit a single move event at the end of the interaction
        if (lastMovePayloadRef.current) {
          console.log(
            JSON.stringify({
              event: "task_moved",
              ...lastMovePayloadRef.current,
            })
          );

          // Call the onTaskMoved handler if provided
          onTaskMoved?.(lastMovePayloadRef.current);

          lastMovePayloadRef.current = null;
        }

        // Do not return; allow dependency / resize cleanup below if needed
      }

      // Stop resizing
      if (isResizing) {
        setIsResizing(false);
        setResizeTask(null);
        setResizeCursor("default");

        // Emit a single resize event at the end of the interaction
        if (lastResizePayloadRef.current) {
          const payload = lastResizePayloadRef.current;

          const task = tasks.find((t) => t.id === payload.taskId);

          onTaskResized?.({
            taskId: payload.taskId,
            taskName: payload.taskName,
            side: payload.side,
            newStart: payload.newStart ?? task?.start,
            newEnd: payload.newEnd ?? task?.end,
          });

          lastResizePayloadRef.current = null;
        }

        // Do not return; allow dependency logic below to run if applicable
      }

      if (isConnecting && connectionStart) {
        const canvas = canvasRef.current;
        const container = containerRef.current;

        if (!canvas || !container) return;

        // Mouse position in canvas drawing coordinates (already includes scroll)
        const canvasRect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - canvasRect.left;
        const mouseY = e.clientY - canvasRect.top;

        const pixelsPerDay = 32 * zoomLevel;

        // Find task under cursor
        flatTasks.forEach((task, index) => {
          if (task.id === connectionStart.taskId) return; // Can't connect to self

          const startDate = new Date(task.start);
          const endDate = new Date(task.end);

          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return;

          const startDays = Math.round(
            (startDate.getTime() - dateRange.minDate.getTime()) /
              (1000 * 60 * 60 * 24)
          );
          const duration = Math.max(
            1,
            Math.round(
              (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
            )
          );

          const yOffset =
            CANVAS_GANTT.HEADER_HEIGHT + index * CANVAS_GANTT.ROW_HEIGHT;
          const x = startDays * pixelsPerDay;
          const taskWidth = duration * pixelsPerDay;
          const y =
            yOffset +
            (CANVAS_GANTT.ROW_HEIGHT - CANVAS_GANTT.TASKBAR_HEIGHT) / 2;
          const taskHeight = CANVAS_GANTT.TASKBAR_HEIGHT;

          const hitRadius = 26; // Match snap radius used during drag

          // Treat drops slightly outside the bar (near connection dots) as hitting this task
          if (
            mouseX >= x - hitRadius &&
            mouseX <= x + taskWidth + hitRadius &&
            mouseY >= y &&
            mouseY <= y + taskHeight
          ) {
            // Get task names for logging
            const fromTask = flatTasks.find(
              (t) => t.id === connectionStart.taskId
            );

            // Update task dependencies
            const updatedTasks = tasks.map((t) => {
              if (t.id === task.id) {
                const currentDeps = t.dependencies || [];

                if (!currentDeps.includes(connectionStart.taskId)) {
                  return {
                    ...t,
                    dependencies: [...currentDeps, connectionStart.taskId],
                  };
                }
              }

              return t;
            });

            setTasks(updatedTasks);
            const updatedTask = updatedTasks.find((t) => t.id === task.id);

            // Call the new handler with comprehensive information
            if (onDependencyCreated && updatedTask) {
              onDependencyCreated({
                fromId: connectionStart.taskId,
                fromName: fromTask?.name || "",
                toId: task.id,
                toName: task.name,
                dependencies: updatedTask.dependencies || [],
              });
            }

            console.log(
              JSON.stringify({
                event: "dependency_created",
                fromId: connectionStart.taskId,
                fromName: fromTask?.name,
                toId: task.id,
                toName: task.name,
                dependencies: updatedTask?.dependencies,
              })
            );
          }
        });

        setIsConnecting(false);
        setConnectionStart(null);
        setConnectionCurrent(null);
        setHighlightedDropTargets([]);
      }
    },
    [
      isDraggingTask,
      isResizing,
      isConnecting,
      connectionStart,
      flatTasks,
      zoomLevel,
      dateRange,
      onDependencyCreated,
      tasks,
      setTasks,
      onTaskMoved,
    ]
  );

  const handleCanvasMouseLeave = useCallback(() => {
    // Only clear tooltip if it's not in click-to-show mode
    if (!showTooltipForTask) {
      setTooltipData(null);
    }
    setHoveredTaskId(null);
  }, [showTooltipForTask]);

  // Removed synthetic mouse event dispatch - it interferes with real clicks and causes selection lag

  // Canvas drawing effect
  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const { width, height } = canvasDimensions;

    // Scale for high-DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Scale the context to match
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, width, height);

    // Draw grid only (timeline header is now sticky at top)
    drawGrid(ctx);
    // drawTimeline(ctx); // Removed - using sticky header instead

    // Draw dependencies first (so they appear behind tasks)
    drawDependencies(ctx);

    // Draw task bars aligned with tree rows
    flatTasks.forEach((task, index) => {
      const startDate = new Date(task.start);
      const endDate = new Date(task.end);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return;

      const pixelsPerDay = 32 * zoomLevel;
      const startDays = Math.round(
        (startDate.getTime() - dateRange.minDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      const duration = Math.max(
        1,
        Math.round(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        )
      );

      const yOffset =
        CANVAS_GANTT.HEADER_HEIGHT + index * CANVAS_GANTT.ROW_HEIGHT;
      const x = startDays * pixelsPerDay;
      const taskWidth = duration * pixelsPerDay;
      const y =
        yOffset + (CANVAS_GANTT.ROW_HEIGHT - CANVAS_GANTT.TASKBAR_HEIGHT) / 2;
      const taskHeight = CANVAS_GANTT.TASKBAR_HEIGHT;

      // Draw task bar
      const baseColor =
        task.color ||
        (task.priority ? CANVAS_GANTT.COLORS.priority[task.priority] : null) ||
        "#3b82f6";
      const isSelected = selectedTaskId === task.id;
      const isHovered = hoveredTaskId === task.id;

      // Task bar with rounded corners
      const cornerRadius = 6;

      ctx.fillStyle = baseColor;
      ctx.beginPath();
      ctx.roundRect(x, y, taskWidth, taskHeight, cornerRadius);
      ctx.fill();

      // Progress overlay
      if (task.progress > 0) {
        ctx.fillStyle = colors.progressOverlay;
        ctx.beginPath();
        ctx.roundRect(
          x,
          y,
          taskWidth * (task.progress / 100),
          taskHeight,
          cornerRadius
        );
        ctx.fill();
      }

      // Border - highlight if selected
      if (isSelected) {
        ctx.strokeStyle = mergedOptions.darkMode ? "#60a5fa" : "#3b82f6";
        ctx.lineWidth = 3;
      } else if (isHovered) {
        ctx.strokeStyle = "#374151";
        ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = colors.gridLine;
        ctx.lineWidth = 1;
      }
      ctx.beginPath();
      ctx.roundRect(x, y, taskWidth, taskHeight, cornerRadius);
      ctx.stroke();

      // Task name
      if (taskWidth > 60) {
        ctx.fillStyle = "#ffffff"; // White text is visible on all task bar colors
        ctx.font = "bold 12px -apple-system, sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";

        // Draw task name
        const text = task.name.substring(0, 20);

        ctx.fillText(text, x + 8, y + taskHeight / 2);
      }

      // Draw connection points only for selected task
      const showConnectionPoints = isSelected || isConnecting;

      if (showConnectionPoints) {
        const visualRadius = 5; // Smaller visual dot like reference image
        const pointY = y + taskHeight / 2;
        const leftPointX = x - 6; // Position outside bar
        const rightPointX = x + taskWidth + 6; // Position outside bar

        // Start point (left) - positioned outside bar
        ctx.fillStyle =
          connectionStart?.taskId === task.id &&
          connectionStart?.type === "start"
            ? colors.connectionPointActive
            : highlightedDropTargets.includes(task.id)
              ? "#22c55e"
              : colors.connectionPoint;
        ctx.beginPath();
        ctx.arc(leftPointX, pointY, visualRadius, 0, 2 * Math.PI);
        ctx.fill();

        // End point (right) - positioned outside bar
        ctx.fillStyle =
          connectionStart?.taskId === task.id && connectionStart?.type === "end"
            ? colors.connectionPointActive
            : highlightedDropTargets.includes(task.id)
              ? "#22c55e"
              : colors.connectionPoint;
        ctx.beginPath();
        ctx.arc(rightPointX, pointY, visualRadius, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    // Draw temporary connection line while dragging
    if (isConnecting && connectionStart && connectionCurrent) {
      ctx.strokeStyle = colors.connectionPoint;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(connectionStart.x, connectionStart.y);
      ctx.lineTo(connectionCurrent.x, connectionCurrent.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Vertical reorder only available in sidebar (not on canvas bars)
  }, [
    canvasDimensions,
    flatTasks,
    selectedTaskId,
    hoveredTaskId,
    zoomLevel,
    dateRange,
    colors,
    isConnecting,
    connectionStart,
    connectionCurrent,
    highlightedDropTargets,
    selectedDependency,
    mergedOptions.darkMode,
    showTooltipForTask,
  ]);

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    const { minDate, maxDate } = dateRange;
    const pixelsPerDay = 32 * zoomLevel;
    const totalDays = Math.round(
      (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    ctx.strokeStyle = colors.gridLine;
    ctx.lineWidth = 1;

    // Vertical lines
    for (let i = 0; i <= totalDays; i++) {
      const x = i * pixelsPerDay;
      const currentDate = new Date(minDate);

      currentDate.setDate(currentDate.getDate() + i);
      const isWeekend =
        currentDate.getDay() === 0 || currentDate.getDay() === 6;

      if (mergedOptions.showWeekendHighlight && isWeekend) {
        ctx.fillStyle = colors.weekend;
        ctx.fillRect(
          x,
          CANVAS_GANTT.HEADER_HEIGHT,
          pixelsPerDay,
          canvasDimensions.height - CANVAS_GANTT.HEADER_HEIGHT
        );
      }

      ctx.beginPath();
      ctx.moveTo(x + 0.5, CANVAS_GANTT.HEADER_HEIGHT);
      ctx.lineTo(x + 0.5, canvasDimensions.height);
      ctx.stroke();
    }

    // Horizontal lines - fill entire canvas height
    const totalRows = Math.ceil(
      (canvasDimensions.height - CANVAS_GANTT.HEADER_HEIGHT) /
        CANVAS_GANTT.ROW_HEIGHT
    );
    for (let i = 0; i <= totalRows; i++) {
      const y = CANVAS_GANTT.HEADER_HEIGHT + i * CANVAS_GANTT.ROW_HEIGHT;

      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(canvasDimensions.width, y + 0.5);
      ctx.stroke();
    }
  };

  const drawDependencies = (ctx: CanvasRenderingContext2D) => {
    if (!mergedOptions.showDependencies) return;

    const pixelsPerDay = 32 * zoomLevel;

    flatTasks.forEach((task, taskIndex) => {
      if (!task.dependencies || task.dependencies.length === 0) return;

      task.dependencies.forEach((depId) => {
        const depTask = flatTasks.find((t) => t.id === depId);

        if (!depTask) return;

        const depIndex = flatTasks.indexOf(depTask);

        if (depIndex === -1) return;

        // Calculate positions
        const depEndDate = new Date(depTask.end);
        const taskStartDate = new Date(task.start);

        const depEndDays = Math.round(
          (depEndDate.getTime() - dateRange.minDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        const taskStartDays = Math.round(
          (taskStartDate.getTime() - dateRange.minDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        const fromX = depEndDays * pixelsPerDay;
        const fromY =
          CANVAS_GANTT.HEADER_HEIGHT +
          depIndex * CANVAS_GANTT.ROW_HEIGHT +
          CANVAS_GANTT.ROW_HEIGHT / 2;
        const toX = taskStartDays * pixelsPerDay;
        const toY =
          CANVAS_GANTT.HEADER_HEIGHT +
          taskIndex * CANVAS_GANTT.ROW_HEIGHT +
          CANVAS_GANTT.ROW_HEIGHT / 2;

        // Check if this dependency is selected
        const isSelected =
          selectedDependency?.from === depId &&
          selectedDependency?.to === task.id;

        // Draw clean 90-degree elbow path (no rounded corners)
        ctx.strokeStyle = isSelected
          ? mergedOptions.darkMode
            ? "#60a5fa"
            : "#3b82f6"
          : colors.dependency;
        ctx.lineWidth = isSelected ? 4 : 2;
        ctx.setLineDash([]);

        // Fixed horizontal offset before turning vertically
        const midX = fromX + 20;

        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        // First horizontal segment
        ctx.lineTo(midX, fromY);
        // Vertical segment straight up/down
        ctx.lineTo(midX, toY);
        // Final horizontal segment into target
        ctx.lineTo(toX, toY);

        ctx.stroke();

        // Draw filled arrowhead
        const arrowSize = 7;

        ctx.fillStyle = colors.dependency;
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - arrowSize, toY - arrowSize / 2);
        ctx.lineTo(toX - arrowSize, toY + arrowSize / 2);
        ctx.closePath();
        ctx.fill();
      });
    });
  };

  // Sticky header replaced this function
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const drawTimeline = (ctx: CanvasRenderingContext2D) => {
    const { minDate, maxDate } = dateRange;
    const pixelsPerDay = 32 * zoomLevel;
    const totalDays = Math.round(
      (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Header background with two rows
    ctx.fillStyle = colors.treeHeader;
    ctx.fillRect(0, 0, canvasDimensions.width, CANVAS_GANTT.HEADER_HEIGHT);

    // Draw date headers with dividers (YYYY-MM-DD format)
    ctx.fillStyle = mergedOptions.darkMode ? "#ffffff" : colors.text;
    ctx.font = "11px -apple-system, sans-serif";
    ctx.textAlign = "center";

    // Show dates at intervals based on zoom
    const dateInterval = Math.max(1, Math.floor(7 / zoomLevel));

    for (let i = 0; i < totalDays; i += dateInterval) {
      const currentDate = new Date(minDate);

      currentDate.setDate(currentDate.getDate() + i);

      const x = i * pixelsPerDay + (pixelsPerDay * dateInterval) / 2;

      // Format as YYYY-MM-DD
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0");
      const dateLabel = `${year}-${month}-${day}`;

      ctx.fillText(dateLabel, x, 18);

      // Draw vertical divider after each date
      const dividerX = i * pixelsPerDay + pixelsPerDay * dateInterval;

      if (dividerX < canvasDimensions.width) {
        ctx.strokeStyle = colors.gridLine;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(dividerX, 0);
        ctx.lineTo(dividerX, CANVAS_GANTT.HEADER_HEIGHT);
        ctx.stroke();
      }
    }

    // Draw day numbers (bottom row)
    ctx.font = "11px -apple-system, sans-serif";
    ctx.fillStyle = colors.textLight;
    ctx.textAlign = "center";

    for (let i = 0; i < totalDays; i++) {
      const x = i * pixelsPerDay + pixelsPerDay / 2;
      const currentDate = new Date(minDate);

      currentDate.setDate(currentDate.getDate() + i);

      const day = currentDate.getDate();

      const isWeekend =
        currentDate.getDay() === 0 || currentDate.getDay() === 6;

      if (mergedOptions.showWeekendHighlight && isWeekend) {
        ctx.fillStyle = colors.weekend;
        ctx.fillRect(
          i * pixelsPerDay,
          CANVAS_GANTT.HEADER_HEIGHT - 25,
          pixelsPerDay,
          25
        );
      }

      ctx.fillStyle =
        mergedOptions.showWeekendHighlight && isWeekend
          ? mergedOptions.darkMode
            ? "#a1a1aa"
            : colors.textLight
          : mergedOptions.darkMode
            ? "#ffffff"
            : colors.text;
      ctx.fillText(day.toString(), x, CANVAS_GANTT.HEADER_HEIGHT - 10);
    }

    // Draw horizontal line separating header from content
    ctx.strokeStyle = colors.gridLine;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_GANTT.HEADER_HEIGHT);
    ctx.lineTo(canvasDimensions.width, CANVAS_GANTT.HEADER_HEIGHT);
    ctx.stroke();
  };

  return (
    <div
      ref={ganttContainerRef}
      className={`h-full w-full flex flex-col overflow-hidden ${mergedOptions.darkMode ? "bg-gray-900" : "bg-white"}`}
    >
      {/* Toolbar */}
      <div
        className={`flex items-center justify-between px-4 py-2 border-b ${mergedOptions.darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"}`}
      >
        <div className="flex items-center space-x-2">
          <button
            type="button"
            className={`px-2 py-1.5 text-sm rounded flex items-center space-x-1 ${mergedOptions.darkMode ? "text-gray-200 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"}`}
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            {isSidebarCollapsed ? (
              <ChevronsRight className="w-4 h-4" />
            ) : (
              <ChevronsLeft className="w-4 h-4" />
            )}
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 text-sm rounded flex items-center space-x-1 ${mergedOptions.darkMode ? "text-gray-200 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"}`}
            onClick={onTaskAdd}
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 text-sm rounded flex items-center space-x-1 disabled:opacity-50 ${mergedOptions.darkMode ? "text-gray-200 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"}`}
            disabled={!selectedTaskId}
            onClick={() =>
              selectedTaskId && onTaskEdit && onTaskEdit(selectedTaskId)
            }
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 text-sm rounded flex items-center space-x-1 disabled:opacity-50 ${mergedOptions.darkMode ? "text-gray-200 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"}`}
            disabled={!selectedTaskId}
            onClick={() =>
              selectedTaskId && onTaskDelete && onTaskDelete(selectedTaskId)
            }
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>

          <div
            className={`h-6 w-px mx-2 ${mergedOptions.darkMode ? "bg-gray-600" : "bg-gray-300"}`}
          />

          <button
            type="button"
            className={`px-3 py-1.5 text-sm rounded disabled:opacity-50 ${
              mergedOptions.darkMode
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            disabled={!selectedTaskId}
            title="Indent (Alt + →)"
            onClick={handleIndent}
          >
            →
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 text-sm rounded disabled:opacity-50 ${
              mergedOptions.darkMode
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            disabled={!selectedTaskId}
            title="Outdent (Alt + ←)"
            onClick={handleOutdent}
          >
            ←
          </button>

          <div
            className={`h-6 w-px mx-2 ${mergedOptions.darkMode ? "bg-gray-600" : "bg-gray-300"}`}
          />

          <button
            type="button"
            className={`px-3 py-1.5 text-sm rounded ${
              mergedOptions.darkMode
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() =>
              setTasks(tasks.map((t) => ({ ...t, expanded: true })))
            }
          >
            Expand all
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 text-sm rounded ${
              mergedOptions.darkMode
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() =>
              setTasks(tasks.map((t) => ({ ...t, expanded: false })))
            }
          >
            Collapse all
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            className={`p-1.5 rounded ${
              mergedOptions.darkMode
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
          >
            <Minus className="w-4 h-4" />
          </button>
          <span
            className={`text-sm min-w-[60px] text-center ${
              mergedOptions.darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            className={`p-1.5 rounded ${
              mergedOptions.darkMode
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}
          >
            <Plus className="w-4 h-4" />
          </button>

          <div
            className={`h-6 w-px mx-2 ${mergedOptions.darkMode ? "bg-gray-600" : "bg-gray-300"}`}
          />

          <button
            type="button"
            className={`p-1.5 rounded ${
              mergedOptions.darkMode
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            title={isFullscreen ? "Exit fullscreen (ESC)" : "Enter fullscreen"}
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content - Unified Vertical Scroll with Separate Horizontal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Task List with Sticky Header */}
        <div className="flex flex-col" style={{ width: treeWidth }}>
          {/* Left Header - Sticky */}
          <div
            className={`shrink-0 border-r border-b transition-all duration-300 ease-in-out z-10 relative ${mergedOptions.darkMode ? "border-gray-700 bg-gray-900 text-gray-300" : "border-gray-200 bg-gray-50 text-gray-700"}`}
          >
            <div
              className="flex text-sm font-medium"
              style={{ height: CANVAS_GANTT.HEADER_HEIGHT }}
            >
              <div
                className={`flex items-center justify-start pl-2 ${!isSidebarCollapsed ? "border-r" : ""} ${mergedOptions.darkMode ? "border-gray-700 text-gray-100" : "border-gray-200 text-gray-700"} text-xs font-medium`}
                style={{ width: 65, minWidth: 65, maxWidth: 65 }}
              >
                ID
              </div>
              {!isSidebarCollapsed && (
                <div
                  className={`flex-1 flex items-center px-4 text-xs font-medium ${mergedOptions.darkMode ? "text-gray-100" : "text-gray-700"}`}
                >
                  Task Name
                </div>
              )}
            </div>
          </div>

          {/* Left Content - Task List (No native scrollbar; forwards wheel events) */}
          <div
            ref={leftPanelRef}
            className="flex-1 overflow-hidden relative"
            style={{ clipPath: "inset(0 0 0 0)" }}
            onWheel={(e) => {
              if (containerRef.current) {
                containerRef.current.scrollTop += e.deltaY;
              }
            }}
          >
            <div
              ref={leftContentRef}
              className={`border-r ${mergedOptions.darkMode ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-white"}`}
              style={{ willChange: "transform" }}
            >
              {flatTasks.map((task, index) => (
                <div
                  key={task.id}
                  className={`flex border-b transition-colors ${
                    mergedOptions.darkMode
                      ? "border-gray-700"
                      : "border-gray-200"
                  } ${
                    draggedTask === task.id
                      ? "opacity-60"
                      : dragOverTask === task.id &&
                          dragInsertDirection === "above"
                        ? mergedOptions.darkMode
                          ? "border-t-1 border-t-blue-400"
                          : "border-t-1 border-t-blue-500"
                        : dragOverTask === task.id &&
                            dragInsertDirection === "below"
                          ? mergedOptions.darkMode
                            ? "border-b-1 border-b-blue-400"
                            : "border-b-1 border-b-blue-500"
                          : selectedTaskId === task.id
                            ? mergedOptions.darkMode
                              ? "bg-gray-700"
                              : "bg-gray-100"
                            : hoveredTaskId === task.id
                              ? mergedOptions.darkMode
                                ? "bg-gray-800"
                                : "bg-gray-50"
                              : ""
                  }`}
                  role="button"
                  style={{ height: CANVAS_GANTT.ROW_HEIGHT }}
                  tabIndex={0}
                  onClick={() => {
                    setSelectedTaskId(task.id);
                    setSelectedDependency(null);
                    onTaskSelect?.(task.id);
                    console.log(
                      JSON.stringify({
                        event: "task_selected",
                        taskId: task.id,
                        taskName: task.name,
                      })
                    );
                  }}
                  onDragOver={(e) => handleDragOver(task.id, e)}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDrop(task.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedTaskId(task.id);
                      setSelectedDependency(null);
                      onTaskSelect?.(task.id);
                    }
                  }}
                  onMouseEnter={(e) => {
                    setHoveredTaskId(task.id);

                    if (tooltipHoverTimeoutRef.current !== null) {
                      window.clearTimeout(tooltipHoverTimeoutRef.current);
                    }

                    const target = e.currentTarget as HTMLDivElement;
                    const rect = target.getBoundingClientRect();
                    const dividerX = rect.left + treeWidth + 1; // align with vertical divider

                    tooltipHoverTimeoutRef.current = window.setTimeout(() => {
                      setShowTooltipForTask(task.id);
                      setTooltipData({
                        task,
                        x: dividerX,
                        y: rect.top,
                        absolute: true,
                        side: "right",
                      });
                    }, 500);
                  }}
                  onMouseLeave={() => {
                    setHoveredTaskId((prev) =>
                      prev === task.id ? null : prev
                    );

                    // Clear the show timeout if still pending
                    if (tooltipHoverTimeoutRef.current !== null) {
                      window.clearTimeout(tooltipHoverTimeoutRef.current);
                      tooltipHoverTimeoutRef.current = null;
                    }

                    // If tooltip is showing for this row, start auto-hide countdown
                    if (showTooltipForTask === task.id) {
                      if (tooltipAutoHideTimeoutRef.current !== null) {
                        window.clearTimeout(tooltipAutoHideTimeoutRef.current);
                      }
                      tooltipAutoHideTimeoutRef.current = window.setTimeout(
                        () => {
                          setTooltipData(null);
                          setShowTooltipForTask(null);
                        },
                        1000
                      );
                    } else {
                      setTooltipData(null);
                    }
                  }}
                >
                  {/* ID Column */}
                  <div
                    className={`flex items-center justify-start pl-2 border-r ${mergedOptions.darkMode ? "border-gray-700" : "border-gray-200"}`}
                    style={{ width: 65, minWidth: 65, maxWidth: 65 }}
                  >
                    <div
                      className={`flex items-center ${mergedOptions.darkMode ? "text-gray-200" : "text-gray-600"}`}
                      role="group"
                    >
                      <div className="w-4 flex justify-center">
                        <div
                          draggable
                          className={`cursor-grab active:cursor-grabbing ${mergedOptions.darkMode ? "text-gray-300 hover:text-white" : "text-gray-400 hover:text-gray-600"}`}
                          onDragEnd={handleDragEnd}
                          onDragStart={(e) => {
                            e.stopPropagation();
                            e.dataTransfer.effectAllowed = "move";
                            e.dataTransfer.setData("text/plain", task.id);
                            handleDragStart(task.id);
                          }}
                        >
                          <GripVertical className="w-4 h-4" strokeWidth={1.5} />
                        </div>
                      </div>
                      <span
                        className={`ml-2 text-sm font-medium ${mergedOptions.darkMode ? "text-white" : ""}`}
                      >
                        {index + 1}
                      </span>
                    </div>
                  </div>

                  {/* Task Name Column */}
                  {!isSidebarCollapsed && (
                    <div className="flex-1 flex items-center px-2">
                      <div
                        className={`flex items-center space-x-1 ${mergedOptions.darkMode ? "text-white" : "text-gray-700"}`}
                        style={{ paddingLeft: `${task.depth * 20}px` }}
                      >
                        {/* Expand/Collapse */}
                        {task.children && task.children.length > 0 && (
                          <button
                            type="button"
                            className={`p-0.5 rounded ${mergedOptions.darkMode ? "text-gray-200 hover:bg-gray-700 hover:text-white" : "hover:bg-gray-200"}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setTasks(
                                tasks.map((t) =>
                                  t.id === task.id
                                    ? { ...t, expanded: !t.expanded }
                                    : t
                                )
                              );
                            }}
                          >
                            {task.expanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        )}

                        {/* Task Name */}
                        <span
                          className={`text-sm truncate font-medium ${mergedOptions.darkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {task.name}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vertical Divider for Resizing */}
        {!isSidebarCollapsed && (
          <div
            ref={dividerRef}
            aria-label="Resize sidebar"
            aria-orientation="vertical"
            aria-valuemax={CANVAS_GANTT.MAX_TREE_WIDTH}
            aria-valuemin={CANVAS_GANTT.MIN_TREE_WIDTH}
            aria-valuenow={treeWidth}
            className={`w-1 cursor-col-resize shrink-0 ${isDraggingDivider ? "bg-blue-500" : mergedOptions.darkMode ? "bg-gray-700" : "bg-gray-300"}`}
            role="slider"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") {
                e.preventDefault();
                setTreeWidth(
                  Math.max(CANVAS_GANTT.MIN_TREE_WIDTH, treeWidth - 10)
                );
              } else if (e.key === "ArrowRight") {
                e.preventDefault();
                setTreeWidth(
                  Math.min(CANVAS_GANTT.MAX_TREE_WIDTH, treeWidth + 10)
                );
              }
            }}
            onMouseDown={(e) => {
              dividerDragState.current = {
                startX: e.clientX,
                startWidth: treeWidth,
              };
              setIsDraggingDivider(true);
              e.preventDefault();
            }}
          />
        )}

        {/* Right Side - Canvas with Sticky Header and Horizontal + Vertical Scroll */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Sticky Canvas Header */}
          <div
            className={`shrink-0 border-b z-10 overflow-hidden ${mergedOptions.darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"}`}
            style={{
              height: CANVAS_GANTT.HEADER_HEIGHT,
              marginLeft: -scrollX, // Sync horizontal scroll
            }}
          >
            <canvas ref={stickyHeaderCanvasRef} />
          </div>

          {/* Scrollable Canvas Content */}
          <div
            ref={containerRef}
            className="flex-1 overflow-auto relative"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: mergedOptions.darkMode
                ? "#4b5563 transparent"
                : "#9ca3af transparent",
            }}
            onScroll={(e) => {
              const target = e.target as HTMLDivElement;

              setScrollX(target.scrollLeft);
              scrollYRef.current = target.scrollTop;
              scheduleLeftPanelSync();
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                width: Number.isNaN(canvasDimensions.width)
                  ? 0
                  : canvasDimensions.width,
                height: canvasDimensions.height,
                marginTop: -CANVAS_GANTT.HEADER_HEIGHT,
                cursor: isDraggingTask
                  ? "all-scroll"
                  : isResizing
                    ? "ew-resize"
                    : isConnecting
                      ? "copy"
                      : selectedDependency
                        ? "pointer"
                        : resizeCursor,
              }}
              onMouseDown={handleCanvasMouseDown}
              onMouseLeave={handleCanvasMouseLeave}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
            />

            {/* Hover Tooltip */}
            {tooltipData &&
              (() => {
                const tooltipWidth = 320;
                const tooltipHeight = 480; // generous estimate to handle tall tooltips
                const margin = 15;

                let left = 0;
                let top = 0;

                if (tooltipData.absolute) {
                  // Use absolute screen coordinates: align top exactly to y (row top)
                  left =
                    tooltipData.side === "left"
                      ? tooltipData.x - tooltipWidth - margin
                      : tooltipData.x + margin;
                  top = tooltipData.y;
                } else {
                  const canvasRect = canvasRef.current?.getBoundingClientRect();

                  if (!canvasRect) return null;
                  left = canvasRect.left + tooltipData.x + margin;
                  top = canvasRect.top + tooltipData.y + margin;
                  if (left + tooltipWidth > window.innerWidth - margin) {
                    left =
                      canvasRect.left + tooltipData.x - tooltipWidth - margin;
                  }
                }

                // Clamp vertically so tooltip never goes off-screen at top/bottom
                if (top + tooltipHeight > window.innerHeight - margin) {
                  top = window.innerHeight - tooltipHeight - margin;
                }
                if (top < margin) top = margin;
                if (left < margin) left = margin;

                return (
                  <div
                    className="fixed z-50 pointer-events-none"
                    style={{ left, top }}
                  >
                    <div className="bg-gray-900 text-white rounded-lg shadow-xl p-4 max-w-sm max-h-[60vh] overflow-auto border border-gray-700">
                      <div className="font-semibold text-sm mb-2 text-white">
                        {tooltipData.task.name}
                      </div>
                      <div className="space-y-1 text-xs text-gray-100">
                        <div className="flex justify-between">
                          <span className="text-gray-200">Start:</span>
                          <span>
                            {new Date(
                              tooltipData.task.start
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-200">End:</span>
                          <span>
                            {new Date(
                              tooltipData.task.end
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-200">Progress:</span>
                          <span>{tooltipData.task.progress}%</span>
                        </div>
                        {tooltipData.task.priority && (
                          <div className="flex justify-between">
                            <span className="text-gray-200">Priority:</span>
                            <span className="capitalize">
                              {tooltipData.task.priority}
                            </span>
                          </div>
                        )}
                        {tooltipData.task.assignee && (
                          <div className="flex justify-between">
                            <span className="text-gray-200">Assignee:</span>
                            <span>{tooltipData.task.assignee}</span>
                          </div>
                        )}
                        {tooltipData.task.description && (
                          <div className="mt-2 pt-2 border-t border-gray-700">
                            <div className="text-gray-200 mb-1">
                              Description:
                            </div>
                            <div className="text-white">
                              {tooltipData.task.description}
                            </div>
                          </div>
                        )}
                        {tooltipData.task.teamMembers &&
                          tooltipData.task.teamMembers.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-700">
                              <div className="text-gray-200 mb-2">
                                Team Members:
                              </div>
                              <div className="space-y-2">
                                {tooltipData.task.teamMembers.map(
                                  (member, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center space-x-2"
                                    >
                                      {member.avatar ? (
                                        <img
                                          alt={member.name}
                                          className="w-6 h-6 rounded-full"
                                          src={member.avatar}
                                        />
                                      ) : (
                                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-semibold">
                                          {member.name?.charAt(0).toUpperCase()}
                                        </div>
                                      )}
                                      <div>
                                        <div className="text-white text-xs font-medium">
                                          {member.name}
                                        </div>
                                        {member.role && (
                                          <div className="text-gray-200 text-xs">
                                            {member.role}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                );
              })()}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && dependencyToDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowDeleteConfirmModal(false);
              setDependencyToDelete(null);
            }}
          />

          {/* Modal */}
          <div
            className={`relative z-10 w-full max-w-md mx-4 rounded-2xl shadow-2xl transform transition-all ${
              mergedOptions.darkMode
                ? "bg-gray-800 border border-gray-700"
                : "bg-white border border-gray-200"
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 pb-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3
                    className={`text-lg font-semibold ${
                      mergedOptions.darkMode ? "text-gray-100" : "text-gray-900"
                    }`}
                  >
                    Delete Dependency
                  </h3>
                  <p
                    className={`text-sm mt-0.5 ${
                      mergedOptions.darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    This action cannot be undone
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDeleteConfirmModal(false);
                  setDependencyToDelete(null);
                }}
                className={`flex-shrink-0 rounded-lg p-1.5 transition-colors ${
                  mergedOptions.darkMode
                    ? "hover:bg-gray-700 text-gray-400 hover:text-gray-200"
                    : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 pb-6">
              <div
                className={`rounded-lg p-4 mb-6 ${
                  mergedOptions.darkMode
                    ? "bg-gray-900/50 border border-gray-700"
                    : "bg-gray-50 border border-gray-200"
                }`}
              >
                <p
                  className={`text-sm mb-3 ${
                    mergedOptions.darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Are you sure you want to delete this dependency?
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        mergedOptions.darkMode
                          ? "bg-blue-900/30 text-blue-300"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      From
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        mergedOptions.darkMode
                          ? "text-gray-200"
                          : "text-gray-900"
                      }`}
                    >
                      {dependencyToDelete.fromName}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        mergedOptions.darkMode
                          ? "bg-purple-900/30 text-purple-300"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      To
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        mergedOptions.darkMode
                          ? "text-gray-200"
                          : "text-gray-900"
                      }`}
                    >
                      {dependencyToDelete.toName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirmModal(false);
                    setDependencyToDelete(null);
                  }}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    mergedOptions.darkMode
                      ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20"
                >
                  Delete Dependency
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(CanvasGanttChartV2);
