import { combineReducers } from 'redux';
import flashMessageReducer from './flashMessageReducer';
import IDBReducer from './IdbReducer';
import joinDataReducer from './joinDataReducer';
import socketReducer from './socketReducer';


export default combineReducers({
    joinData: joinDataReducer,
    flashMessage: flashMessageReducer,
    socket: socketReducer,
    IDB: IDBReducer
})