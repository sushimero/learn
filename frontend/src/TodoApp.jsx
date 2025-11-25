import React, { useState, useEffect } from "react";

// GoバックエンドのURL
const API_URL = "http://localhost:8080/todos";

// gorm.Modelのフィールドは省略し、必要な3つのフィールドのみを定義
/**
 * @typedef {object} Todo
 * @property {number} ID - gorm.Modelから継承されるID
 * @property {string} title
 * @property {boolean} completed
 */

function TodoApp() {
  /** @type {[Todo[], React.Dispatch<React.SetStateAction<Todo[]>>]} */
  const [todos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- API通信処理 ---

  // 全Todo取得 (GET)
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(API_URL);

        // HTTPステータスコードをチェック
        if (!response.ok) {
          throw new Error(`HTTPエラー! ステータス: ${response.status}`);
        }

        /** @type {Todo[]} */
        const data = await response.json();
        setTodos(data);
      } catch (err) {
        console.error("Todoの取得に失敗:", err);
        setError("Todoリストの読み込みに失敗しました。");
      } finally {
        setLoading(false);
      }
    };
    fetchTodos();
  }, []); // 初回マウント時のみ実行

  // 新規Todo作成 (POST)
  const createTodo = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    /** @type {Todo} */
    const newTodo = { title: newTitle.trim(), completed: false };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newTodo)
      });

      if (!response.ok) {
        throw new Error("Todoの作成に失敗しました。");
      }

      /** @type {Todo} */
      const createdTodo = await response.json();
      setTodos((prevTodos) => [...prevTodos, createdTodo]);
      setNewTitle(""); // 入力フィールドをクリア
    } catch (err) {
      console.error("Todoの作成に失敗:", err);
      alert("Todoの作成に失敗しました。");
    }
  };

  // Todoの完了状態切り替え (PUT)
  const toggleTodo = async (id) => {
    // まずローカルの状態を更新してUXを向上させる
    setTodos((prevTodos) => prevTodos.map((todo) => (todo.ID === id ? { ...todo, completed: !todo.completed } : todo)));

    // APIを呼び出し
    try {
      // 更新後のTodoオブジェクトを見つける
      const todoToUpdate = todos.find((t) => t.ID === id);
      if (!todoToUpdate) return;

      // GoバックエンドはリクエストボディでTodo全体を受け取る
      const updatedTodo = { ...todoToUpdate, completed: !todoToUpdate.completed };

      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedTodo)
      });

      if (!response.ok) {
        // API失敗時はローカルの状態を元に戻す (ロールバック)
        setTodos((prevTodos) =>
          prevTodos.map((todo) => (todo.ID === id ? { ...todo, completed: todoToUpdate.completed } : todo))
        );
        throw new Error("Todoの更新に失敗しました。");
      }
      // 成功した場合、setTodosはすでにローカル更新済みなので不要
    } catch (err) {
      console.error("Todoの更新に失敗:", err);
      alert("Todoの更新に失敗しました。");
    }
  };

  // Todo削除 (DELETE)
  const deleteTodo = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Todoの削除に失敗しました。");
      }

      // 成功したらローカルの状態から削除
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.ID !== id));
    } catch (err) {
      console.error("Todoの削除に失敗:", err);
      alert("Todoの削除に失敗しました。");
    }
  };

  // --- UIレンダリング ---

  if (loading) return <div>ロード中...</div>;
  if (error) return <div style={{ color: "red" }}>エラー: {error}</div>;

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", fontFamily: "sans-serif" }}>
      <h1>Go/React Todoリスト</h1>

      {/* 新規作成フォーム */}
      <form onSubmit={createTodo} style={{ display: "flex", marginBottom: "20px" }}>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="新しいTodoを入力"
          style={{ flexGrow: 1, padding: "10px", border: "1px solid #ccc" }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 15px",
            marginLeft: "10px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            cursor: "pointer"
          }}
        >
          追加
        </button>
      </form>

      {/* Todoリスト */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {todos.map((todo) => (
          <li
            key={todo.ID}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px",
              borderBottom: "1px solid #eee",
              backgroundColor: todo.completed ? "#f0f0f0" : "white"
            }}
          >
            <span
              style={{
                textDecoration: todo.completed ? "line-through" : "none",
                cursor: "pointer",
                flexGrow: 1
              }}
              onClick={() => toggleTodo(todo.ID)}
            >
              {todo.title}
            </span>
            <button
              onClick={() => deleteTodo(todo.ID)}
              style={{
                padding: "5px 10px",
                backgroundColor: "#f44336",
                color: "white",
                border: "none",
                marginLeft: "10px",
                cursor: "pointer"
              }}
            >
              削除
            </button>
          </li>
        ))}
      </ul>
      {todos.length === 0 && !loading && <div>Todoはまだありません。</div>}
    </div>
  );
}

export default TodoApp;
