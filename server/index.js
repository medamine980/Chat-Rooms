const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const PORT = process.env.PORT || 5000
const fetch = require("node-fetch");
const cors = require("cors");

const reactRoute = require("./reactapp-route")
const { addUser, removeUser, getUser, getUsersInRoom, users, rooms, addNewRoom, removeRoom, bannedUsersInRooms } = require("./users")
function create_UUID() {
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}


const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: ["http://localhost:3000", "https://join-chat-room.herokuapp.com"],
        methods: ["GET", "POST"],
    },
    maxHttpBufferSize: 1048570000,
    pingTimeout: 10000
})

app.get("/api/ip", (req, res) => {
    fetch("https://api.ipify.org/")
        .then(respond => respond.text())
        .then(respond => res.send(respond))
})



// middlewares
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
    app.use(express.static(path.join(__dirname, '/build')));

    app.use(reactRoute)
};

// app.use(cors({
//     "origin": (origin, callback) => ["https://www.google.com"].indexOf(origin) !== -1 
//     ? callback(null, true)
//     : callback(new Error("Origin not allowed"))
// }));

io.use((socket, next) => {
    if (socket.handshake.headers.origin.match(/(http)|(https):\/\/localhost:3000/ig)) next()
})

const removeSocketAndUser = (socket, message) => {
    const user = removeUser(socket.id);
    if (user.error) return
    console.log("removingUser");
    const roomCount = ++rooms.find(room => room.name === user.room).messageCount;
    if (message) {
        io.to(user.room).emit("message", { order: roomCount, user: "admin", text: `${message}` })
    }
    else if (!message) {
        io.to(user.room).emit("message", { order: roomCount, user: "admin", text: `${user.username} has left.` })
    }
    /**
     * Incrementing messageCount in room by one because of "message"
    */
    ++rooms.find(room => room.name === user.room).messageCount;
    io.to(user.room).emit("roomData", { room: user.room, users: getUsersInRoom(user.room) })
    socket.leave(user.room)
    const users = getUsersInRoom(user.room)
    if (users.length <= 0) {
        console.log(removeRoom(user.room))
        const roomsData = rooms.map(room => ({ [room.name]: users.map(user => user.username) }))
        socket.broadcast.emit("roomsData", { rooms: rooms.map(room => room.name), roomsWithUsers: roomsData })
    }
}

io.on("connection", socket => {
    console.log("Client connected");

    socket.on("newRoom", (data, callback) => {
        console.log("data", data);
        const { error } = addNewRoom(data.room);
        if (error) return callback(error);
        const roomsData = rooms.map(room => ({ [room.name]: getUsersInRoom(room).map(user => user.username) }));
        console.log(roomsData)
        socket.broadcast.emit("roomsData", { rooms: rooms.map(room => room.name), roomsWithUsers: roomsData });

        callback();

    })
    socket.on("checkRooms", (data, callback) => {
        // const roomsData = rooms.map(room => ({ [room]: getUsersInRoom(room).map(user => user.username) }))
        const roomsData = rooms.map(room => ({
            [room.name]: getUsersInRoom(room.name).map(user => user.username)
        }))
        console.log("roomsData checkRooms", roomsData)
        socket.emit("roomsData", { "rooms": rooms.map(room => room.name), roomsWithUsers: roomsData })
    })
    socket.on("join", (data, callback) => {
        const { error, user } = addUser({ id: socket.id, ...data, room: data.room.name || data.room });
        if (error) return callback(error);
        const room = rooms.find(room => room.name === user.room);
        if (!room) return callback("This room doesn't exists...");
        socket.join(user.room)
        const roomCount_admin_message = ++room.messageCount;
        socket.emit("message",
            {
                user: "admin", text: `welcome, ${user.username}!`, id: create_UUID(),
                order: roomCount_admin_message
            },
        );
        socket.broadcast.to(user.room).emit("message",
            {

                user: "admin", text: `${user.username} has joined`, order: roomCount_admin_message,
            });
        /**
         * Incrementing messageCount in room by one because of "message"
        */
        callback();
        io.to(user.room).emit("roomData", { room: user.room, users: getUsersInRoom(user.room) })
        const roomsData = rooms.map(room => ({ [room.name]: getUsersInRoom(room.name).map((user) => user.username) }))
        socket.broadcast.emit("roomsData", { rooms: rooms.map(room => room.name), roomsWithUsers: roomsData })
        socket.on("sendMessage", (message, callback) => {
            const user = getUser(socket.id);
            const id = create_UUID();
            const roomCount_message = ++rooms.find(room => room.name === user.room).messageCount;
            console.log(rooms);
            if (message.text) {
                message.text = message.text.trim();
            }
            if (message.type === "text") {
                io.to(user.room).emit("message", { order: roomCount_message, user: user.username, id, text: message.text });
            }
            else if (message.type === "file") {
                io.to(user.room).emit("message", {
                    order: roomCount_message,
                    user: user.username,
                    text: message.text,
                    id,
                    fileName: message.fileName,
                    fileBuffer: message.buffer,
                    // fileBase64: message.buffer.toString('base64'),
                    fileType: message.fileType,

                })
            }

            callback();
        });
        socket.on("kickUser", ({ username, room }, thisUser) => {
            const host = getUsersInRoom(room).find(u => u.username === thisUser).host
            if (!host) return
            const user = getUsersInRoom(room).find(u => u.username === username)
            io.to(user.id).emit("forceDisconnection", { type: "kick", message: `${username} has been kicked out by ${thisUser}!` })//
        })
        socket.on("banUser", ({ username, room, reason, banTime, ip }, thisUser) => {
            const host = getUsersInRoom(room).find(u => u.username === thisUser).host
            if (!host) return
            // const user = getUsersInRoom(room).find(u => u.username === username)
            io.to(room).emit("forceDisconnection", ({
                room, reason, ip, banTime, type: "ban", message:
                    `${username} has been banned by ${thisUser}`
            }))

        })
    })

    socket.on("disconnected", (data, callback) => {
        if (data && data.type === "ban") {

            const roomInBannedList = bannedUsersInRooms.find(obj => obj.room === data.room);
            if (!roomInBannedList) {
                console.log("data", data);
                bannedUsersInRooms.push({
                    room: data.room,
                    bans: [[data.ip, (new Date().getTime() / 1000) + data.banTime, data.reason]]
                });
            }
            else if (roomInBannedList) {
                roomInBannedList.bans.push([data.ip, (new Date().getTime() / 1000) + data.banTime, data.reason])
            }
            removeSocketAndUser(socket, data.message);
            callback();
        }


        else if (data && data.type === "kick") {
            removeSocketAndUser(socket, data.message)
            callback()
        }
        else {
            removeSocketAndUser(socket);
            callback();
        }
    })

    socket.on("disconnect", () => {
        removeSocketAndUser(socket)
        console.log("Client disconnected")
    })
})

// app.use(reactRoute)
app.get("*", (req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.sendFile(__dirname + "/build/index.html");
})

server.listen(PORT, () => console.log(`Sever Running at ${PORT}`))