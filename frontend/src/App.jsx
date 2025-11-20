import React, { useState, useEffect } from "react";
import "./App.css";
import Todo from './Todo.jsx';



const App = () => {
  const [message, setMessage] = useState("でーた取得中...");

  useEffect(() => {
    fetch("http://localhost:8080/todos")
      .then((responce) => responce.json())
      .then((data) => {
        setMessage(data);
      })
      .catch((error) => {
        console.error("つうしんえらー:", error);
        setMessage("データの取得に失敗しました。");
      });
  }, []);

  return (
    <>
      <Todo />
    </>
  );
};
export default App;
