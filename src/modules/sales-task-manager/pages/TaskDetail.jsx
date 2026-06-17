import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useSalesTask } from "../hooks/useSalesTasks";
import TaskDetailDialog from "../components/TaskDetailDialog";

const TaskDetail = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();

  if (!taskId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-white/30">No task ID provided</p>
      </div>
    );
  }

  return <TaskDetailDialog isOpen={true} onClose={() => navigate("/sales/tasks")} taskId={taskId} onUpdate={() => navigate("/sales/tasks")} />;
};

export default TaskDetail;
