/** @jsx hJSX */
import Cycle from '@cycle/core';
import {hJSX, makeDOMDriver} from '@cycle/dom';
import Rx from 'rx';

const intent = (DOM) => {
    const addTodo$ = DOM
        .select('#addTodo')
        .events('click')
        .map( _ => ({action: 'create'}));
    const removeTodo$ = DOM
        .select('.Todo .remove')
        .events('click')
        .map(evt => evt.target.getAttribute('data-id'))
        .map(id => ({action: 'remove', payload: +id}));
    const updateTodo$ = DOM
        .select('.Todo input[type="text"]')
        .events('input')
        .map(evt => ({
            name: evt.target.value,
            id: +evt.target.getAttribute('data-id')
        }))
        .map(value => ({action: 'update', payload: value}));
    const checkTodo$ = DOM
        .select('.Todo input[type="checkbox"]')
        .events('change')
        .map(evt => ({
            checked: evt.target.checked,
            id: +evt.target.getAttribute('data-id')
        }))
        .map(value => ({action: 'update', payload: value}));
    return addTodo$.merge(removeTodo$).merge(updateTodo$).merge(checkTodo$);
};


const model = (action$) => action$
    .scan((todos, {action, payload}, index) => {
        switch(action) {
        case 'create':
            return todos.concat([{
                id: index,
                name: `Todo ${index}`,
                order: todos.length
            }]);
        case 'remove':
            return todos.filter(todo => todo.id !== payload);
        case 'update':
            return todos.map(todo => {
                if(todo.id === payload.id) {
                    return Object.assign(todo, payload, {});
                }
                return todo;
            });
        }
    }, [])
    .startWith([]);

const view = (todo$) => todo$
    .map(todos => todos.map(renderTodo))
    .map(todoViews => (<ul>
        <h1>Todo List</h1>
        <button id="addTodo">Add Todo</button>
        {todoViews}
    </ul>));

const renderTodo = todo => (<li className={`Todo Todo-${todo.id}`}>
    <input type="text" attributes={{'data-id': todo.id}} value={todo.name}/>
    <input type="checkbox" attributes={{'data-id': todo.id}} checked={todo.checked} />
    <button attributes={{'data-id': todo.id}} className='remove'>Remove</button>
</li>);

const main = ({DOM}) => ({
    DOM: view(model(intent(DOM)))
});

Cycle.run(main, {
    DOM: makeDOMDriver('#app')
});
