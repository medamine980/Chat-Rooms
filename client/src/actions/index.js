import { flashMessageTypes, IDB_NAME, joinActionTypes, socketTypes } from "./actionTypes";

export const setRoom = room => ({
    type: joinActionTypes.ROOM,
    payload: room
})

export const setUsername = username => ({
    type: joinActionTypes.USERNAME,
    payload: username
})

export const setIpv4 = ip => ({
    type: joinActionTypes.IPv4,
    payload: ip
})

export const addFlashMessage = messageTimeOutIdType => ({
    type: flashMessageTypes.ADD_MESSAGE,
    payload: messageTimeOutIdType
})

export const removeFlashMessage = id => ({
    type: flashMessageTypes.REMOVE_MESSAGE,
    payload: id
})

export const setSocket = socket => ({
    type: socketTypes.SET_SOCKET,
    payload: socket
});

export const setDBName = name => ({
    type: IDB_NAME.SET_DB_NAME,
    payload: name
})


