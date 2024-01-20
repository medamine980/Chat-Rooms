import {joinActionTypes} from '../actions/actionTypes'

const ROOM_KEY = "room"
const USERNAME_KEY = "username"
const IP_V4 = "ipV4"
const InitialeValue = {}
InitialeValue[ROOM_KEY] = ""
InitialeValue[USERNAME_KEY] = "username" in localStorage ? localStorage["username"] : ""
InitialeValue[IP_V4] = ""

const joinDataReducer = (state = {...InitialeValue}, action) => {
    const data = {...state}
    switch(action.type){
        case joinActionTypes.ROOM:
            // const data = {...state}
            data[ROOM_KEY] = action.payload
            break
        case joinActionTypes.USERNAME:
            // const data = {...state}
            data[USERNAME_KEY] = action.payload       
            break
        case joinActionTypes.IPv4:
            data[IP_V4] = action.payload
            break;
        default:
            break
        }
    return data
}

export default joinDataReducer