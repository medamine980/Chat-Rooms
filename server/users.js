const users = [];
const rooms = [];
const bannedUsersInRooms = [];

const addUser = ({ id, username, room, ip }) => {
    const trimmedLoweredUsername = username.trim().toLowerCase()
    console.log(room)
    room = room.trim().toLowerCase()
    const existingUser = users.find(user => user.username.trim().toLowerCase() === trimmedLoweredUsername
        && user.room === room)
    const bannedUserInRoom = bannedUsersInRooms.find(data => data.room === room &&
        data.bans.find(arr => arr[0] === ip))
    console.log(bannedUsersInRooms, room, ip);
    if (existingUser) {
        return { error: "This name is already taken in this room" }
    }
    else if (trimmedLoweredUsername === "admin") {
        return { error: "Sorry, you can't have that name" }
    }
    else if (bannedUserInRoom) {
        const thisBan = bannedUserInRoom.bans.find(arr => arr[0] === ip)
        if (thisBan[1] < (new Date().getTime() / 1000)) {
            bannedUserInRoom.bans.splice(bannedUserInRoom.bans.indexOf(thisBan), 1);
            if (bannedUserInRoom.bans.length === 0) {
                bannedUsersInRooms.splice(bannedUsersInRooms.splice(bannedUsersInRooms.indexOf(bannedUserInRoom), 1))
            }
        }
        else {
            return {
                error: `You have been banned from this room for 
        ${(((thisBan[1] - (new Date().getTime() / 1000)) / 60).toFixed(2))} minutes${thisBan[2] ?
                        ` Reason: ${thisBan[2]}` : ""}`
            }
        }

    }
    const user = { id, username, room, ip }
    getUsersInRoom(room).length === 0 ? user.host = true : user.host = false;
    users.push(user);

    return { user }
}

const addNewRoom = room => {
    room.name = room.name.trim().toLowerCase()
    const foundedRoom = rooms.find(rm => rm.name === room.name)
    if (!foundedRoom) {
        rooms.push(room)
        return { room }
    }
    else if (foundedRoom) return { error: "There is already a room with the same name." }
}

const removeRoom = room => {
    const roomIndex = rooms.findIndex(rm => rm.name === room)
    if (roomIndex === -1) return { error: "Can't find the room with the name " + room };
    const bannedUserInRoomIndex = bannedUsersInRooms.findIndex(obj => obj.room === room);
    console.log("room", room);
    if (bannedUserInRoomIndex !== -1) bannedUsersInRooms.splice(bannedUserInRoomIndex, 1);
    return { room: rooms.splice(roomIndex, 1)[0] }
}

const removeUser = id => {
    const userIndex = users.findIndex(user => user.id === id)
    if (userIndex === -1) return { error: `Can't find user with id "${id}"` }
    return users.splice(userIndex, 1)[0]
}

const getUser = id => users.find(user => user.id === id)

const getUsersInRoom = room => users.filter(user => user.room === (room.name || room))

module.exports = { addUser, removeUser, getUser, getUsersInRoom, users, rooms, bannedUsersInRooms, addNewRoom, removeRoom }
