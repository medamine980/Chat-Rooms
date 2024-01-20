import { IDB_NAME } from "../actions/actionTypes";

const IDBReducer = (state = { name: "" }, action) => {
    switch (action.type) {
        case IDB_NAME.SET_DB_NAME:
            return { ...state, name: action.payload };
        default:
            return { ...state };
    }
}

export default IDBReducer;