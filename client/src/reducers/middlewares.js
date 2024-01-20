const middlewareChecker = (store) => (next) => (action) => {
    // if(typeof action === "function"){
    //     return action(store.dispatch, store.getState)
    // }
    // next(action)
    switch(typeof action ){
        case 'function':
            return action(store.dispatch, store.getState)
        default:
            next(action)
    }
};

export default middlewareChecker;