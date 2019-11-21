import React, { useReducer, useContext, useEffect, useRef } from 'react';
import styled from 'styled-components';
import './styles/App.css';
import './styles/base.css';
import helpers from './functionStore';

const { flex, noSelect } = helpers;

const AppWrapper = styled.div`
    ${flex('center', 'center', 'column')}
    ${noSelect}
    position: absolute;
    left: 50%;
    transform: translate(-50%, 0);
    width:auto;
    height:auto;
    padding-top:10%;
`;

const TodoItemMother = styled.div`
  ${flex('space-between', 'center')}
  height: auto;
  width: auto;
  background: grey;
  padding: 1rem 1.5rem;
  margin-top: 0.5rem;
`;

const TodoText = styled.p`
  color:white;
  font-size:1.5rem;
  margin:0rem 1.4rem;
  font-weight:bold;
  text-decoration: ${({ striked }) => striked && 'line-through'};
  &:hover{
    cursor:pointer; 
  }
`;

const ButtonHolder = styled.div`
  ${flex('space-around', 'center')}
  width:auto;
  height:auto; 
`;

const ActionBtn = styled.button`
  margin:1rem 1rem;
  font-size:1.3rem;
`;

function appReducer(state, action) {
  switch (action.type) {
    case 'reset': {
      return action.payload;
    }
    case "field":
      return {
        ...state,
        text: action.payload
      };
    case 'add': {
      if (state.text !== '') {
        return {
          ...state,
          todos: [{
            id: Date.now(),
            text: state.text,
            completed: false,
          }, ...state.todos],
          todoCount: state.todoCount + 1,
          text: ""
        };
      } 
      return state;
    }
    case 'delete': {
      return {
        ...state, 
       todos: state.todos.filter(item => item.id !== action.payload),
       todoCount: state.todoCount - 1
      }
      
    }
    case 'deleteAll': {
      return {
        ...state, 
        todos: [],
        todoCount: 0,
        text:""
      }
    }
    case 'completed': {
      return {
        ...state, 
        todos: state.todos.map(item => {
        if (item.id === action.payload) {
          return {
            ...item,
            completed: !item.completed,
          };
        }
        return item;
      })

      }
      
    }
    default: {
      return state;
    }
  }
}

const Context = React.createContext();

const initialState = {
  todos: [],
  todoCount: 0,
  text: ""
};

const TodosApp = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const didRun = useRef(false);

  useEffect(() => {
    if (!didRun.current) {
      const raw = localStorage.getItem('data');
      dispatch({ type: 'reset', payload: raw ? JSON.parse(raw) : [] });
      didRun.current = true;
    }
  }, [])

  useEffect(
    () => {
      localStorage.setItem('data', JSON.stringify(state));
    },
    [state]
  );

  return (
    <Context.Provider value={dispatch}>
      <AppWrapper>
      <h1>Todos App</h1>
      <form
          onSubmit={e => {
            e.preventDefault();
            dispatch({ type: "add" });
          }}
        >
          <input
            value={state.text}
            onChange={e =>
              dispatch({
                type: "field",
                payload: e.currentTarget.value
              })
            }
          />
          </form>
          <pre>{JSON.stringify(state.text)}</pre>
      <ButtonHolder>
      <ActionBtn onClick={() => dispatch({ type: 'add' })}>New Todo</ActionBtn>
      <ActionBtn onClick={() => dispatch({ type: 'deleteAll' })}>Clear all</ActionBtn>
      </ButtonHolder>
      <div>todos : {state.todoCount}</div>
      <br />
      <br />
      <TodosList items={state.todos} />
      </AppWrapper>
    </Context.Provider>
  );
}

function TodosList({ items }) {
  return items.map(item => <TodoItem key={item.id} {...item} />);
}

function TodoItem({ id, completed, text }) {
  const dispatch = useContext(Context);
  return (
    <TodoItemMother>
      <input
        type="checkbox"
        checked={completed}
        onChange={() => dispatch({ type: 'completed', payload: id })}
      />
<TodoText onClick={() => dispatch({ type: 'completed', payload: id })} striked={completed}>{text}</TodoText>
      <button onClick={() => dispatch({ type: 'delete', payload: id })}>
        x
      </button>
    </TodoItemMother>
  );
}

export default TodosApp;
