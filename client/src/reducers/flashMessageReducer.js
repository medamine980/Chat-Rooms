import { flashMessageTypes } from "../actions/actionTypes";

const flashMessageReducer = (state = { messages: [] }, action) => {
    switch (action.type) {
        case flashMessageTypes.ADD_MESSAGE:
            return { ...state, messages: [...state.messages, action.payload] }
        case flashMessageTypes.REMOVE_MESSAGE:
            const state_clone_messages = [...state.messages]
            const index = state_clone_messages.findIndex(msg => msg.timeOutId === action.payload)
            if (index === -1) throw new Error("Message not found!")
            state_clone_messages.splice(index, 1)
            return { ...state, messages: state_clone_messages };
        default:
            return { ...state }
    }
}

export default flashMessageReducer;