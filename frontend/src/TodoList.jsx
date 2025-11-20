import React from "react";

const TodoList = ({ todos, setTodos }) => {
  fetch("http://localhost:8080/todos", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" }
  })
    .then((res) => res.json())
    .then((newTodo) => {
      setTodos([...todos, newTodo]);
    });

  const handleUpdateTask = (index) => {
    fetch("http://localhost:8080/todos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" }
    })
      .then((res) => res.json())
      .then((newTodo) => {
        setTodos([...todos, newTodo]);
      });
  };

  return (
    <ul>
      {todos.map((todo, index) => (
        <li
          key={index}
          style={{
            textDecoration: todo.isCompleted ? "line-through" : "none"
          }}
        >
          <input type="checkbox" checked={todo.isCompleted} onChange={() => handleUpdateTask(index)} />
          {todo.task}{" "}
          <button onClick={() => handleRemoveTask(index)} style={{ cursor: "pointer" }}>
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
};

export default TodoList;
