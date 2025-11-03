import React, { useState } from "react";

function TodoList() {
  const [tasks, setTasks] = useState([
    { text: "Design UI for dashboard", completed: false },
    { text: "Fix calendar timezone bug", completed: true },
    { text: "Test draggable events", completed: false },
    { text: "Add export to CSV", completed: false }
  ]);

  const toggleTask = (index) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].completed = !updatedTasks[index].completed;
    setTasks(updatedTasks);
  };

  return (
    <div className="card mt-4">
      <div className="card-header">
        <h3 className="card-title">Monthly Tasks</h3>
      </div>
      <div className="card-body">
        <ul className="list-unstyled todo-list">
          {tasks.map((task, index) => (
            <li key={index} className={`mb-2 ${task.completed ? "text-muted" : ""}`}>
              <label className="custom-control custom-checkbox">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  checked={task.completed}
                  onChange={() => toggleTask(index)}
                />
                <span className="custom-control-label">{task.text}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default TodoList;
