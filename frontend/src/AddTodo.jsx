import { useState } from "react";

const AddTodo = ({ setTodos }) => {
  fetch("http://localhost:8080/todos", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({title:title, completed:false}),
  })
.then(res => res.json())
    .then(newTodo => {
      setTodos([...todos, newTodo]);
    });
  };
  
export default AddTodo;
