const { socketTypes } = require("../actions/actionTypes");

const socketReducer = (state=null, action) => {
    switch(action.type){
        case socketTypes.SET_SOCKET:
            return action.payload;
        default:
            return state;
    }
}

export default socketReducer;