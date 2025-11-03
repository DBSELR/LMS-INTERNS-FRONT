import React from "react";
import TaskCard from "./TaskCard";

function TaskBoard() {
  const tasks = [
    { id: 1, title: "Finish project proposal", description: "Complete the proposal for the new project." },
    { id: 2, title: "Update taskboard UI", description: "Revamp the task board layout for better UX." },
    { id: 3, title: "Team meeting", description: "Discuss the next sprint's tasks with the team." },
    // More tasks can be added here
  ];

  return (
    <div className="task-board">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}

export default TaskBoard;
