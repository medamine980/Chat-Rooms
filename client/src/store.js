import { createStore, applyMiddleware } from 'redux';
import reducers from './reducers'
import middlewareChecker from './reducers/middlewares'


const middleware =applyMiddleware(middlewareChecker)
const store = createStore( reducers, middleware)
store.subscribe(()=> localStorage["username"] = store.getState().joinData["username"])
export default store