import { useState } from 'react';
import AddTodo from './AddTodo';
import TodoList from './TodoList';

const Todo = () => {
  const initialState = []
   
  const [todos, setTodos] = useState(initialState);

  return (
    <div>
      <h1 className='Todobar'>ToDo List</h1>
      <AddTodo setTodos={setTodos} />
      <TodoList todos={todos} setTodos={setTodos} />
    </div>
  );
};

export default Todo;