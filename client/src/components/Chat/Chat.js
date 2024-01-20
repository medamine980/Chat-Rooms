import { useState, useEffect, createRef, useRef, useMemo } from 'react';
import io from "socket.io-client";
import { useDispatch, useSelector } from 'react-redux';
import InfoBar from '../InfoBar/InfoBar';
import { useHistory } from 'react-router-dom';

import './Chat.css';
import Input from '../Input/UserForm';
import Messages from '../Messages/Messages';
import { removeFlashMessage, addFlashMessage, setRoom } from '../../actions';
import useChatIDB from './useChatIDB';

let socket;
const Chat = () => {
    const { username, room, ipV4 } = useSelector(state => state.joinData);
    const { timeOutId } = useSelector(state => state.flashMessage);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const messagesLength = useRef(messages.length);
    const [roomUsers, setRoomUsers] = useState([]);
    const isHost = useRef();
    const history = useHistory();
    const dispatch = useDispatch();
    const END_POINT = "http://localhost:5000";
    const readInputFileDocument = createRef();
    const events = useRef(() => { });
    const { messagesObjectStore } = useChatIDB();
    const handleDragOverFile = (e) => {
        e.preventDefault();
        if ((e.dataTransfer && (e.dataTransfer.items.length > 1 && e.dataTransfer.items.length < 0)
            || e.dataTransfer.items[0].kind !== "file" || !e.dataTransfer.items[0].type)
            || (e.dataTransfer.files.length > 1 && !e.dataTransfer.files[0].type)) {
            return;
        }

        if (!e.currentTarget.className.includes("dragOver"))
            e.currentTarget.classList.add("dragOver");
    }
    const handleDropFile = (e) => {
        e.stopPropagation();
        e.preventDefault();
        e.currentTarget.classList.remove("dragOver");
        if (e.dataTransfer.items) {
            if ((e.dataTransfer.items.length > 1 && e.dataTransfer.items.length < 0)
                || e.dataTransfer.items[0].kind !== "file" || !e.dataTransfer.items[0].type) return;

            readInputFileDocument.current(undefined, e.dataTransfer.items[0].getAsFile());
        }
        else {
            if (e.dataTransfer.files.length > 1 && !e.dataTransfer.files[0].type) return;
            console.log(e.dataTransfer.files)
        }
    }
    const handleDragExitFile = e => {
        if (e.target !== e.currentTarget && e.currentTarget.className.includes("dragOver")) {
            e.currentTarget.classList.remove("dragOver");
        }
    }

    useEffect(() => {
        const connectionOptions = {
            "force new connection": true,
            "reconnectionAttempts": "Infinity",
            "reconnection": true,
            "timeout": 10000,
            "transports": ["websocket"],
            "upgrade": false
        };
        socket = io(END_POINT, connectionOptions)
        socket.emit("join", { username, room, ip: ipV4 }, error => {
            if (error) {
                const id = setTimeout(() => {
                    dispatch(removeFlashMessage(id));
                }, 14000);
                dispatch(addFlashMessage({
                    message: error,
                    timeOutId: id,
                    type: "error"
                }));
                history.push("/")
            }
        })

        return () => {
            if (socket) {
                socket.disconnect()
                dispatch(setRoom(""))
                socket.off();
                socket = null;
            }
        }
    }, [END_POINT, username, room, ipV4, dispatch, history])
    // useEffect(() => {a
    //     window.onbeforeunload = () => db.current.deleteDB();
    //     return () => {
    //         if (db.current) db.current.deleteDB();
    //         window.onbeforeunload = () => { };
    //     }
    // }, [])
    useEffect(() => {
        socket.on("diconnect", event => {
            console.log(event, "disconnected");
        })
        socket.on("forceDisconnection", data => {
            if (isHost.current) return;
            if (!(data.type === "ban" && data.ip === ipV4)) return;
            socket.emit("disconnected", data, () => {
                history.push("/")
                const id = setTimeout(() => {
                    dispatch(removeFlashMessage(id));
                }, 14000);
                let message;

                if (data.type === "kick") message = "You have been kicked out"
                else if (data.type === "ban") {
                    message = ("You have been banned for " + (data.banTime / 60).toFixed(2) + " minutes") + (data.reason ? ", Reason: " + data.reason : "");
                }
                dispatch(addFlashMessage({
                    message,
                    timeOutId: id,
                    type: "error"
                }));
            })
        });
    }, [username, room, history, ipV4, dispatch, timeOutId])
    useEffect(() => {
        messagesLength.current = messages.length;
    }, [messages])
    useEffect(() => {
        socket.on("message", message => {
            if (message.fileBuffer) {
                const blob = new Blob([new Uint8Array(message.fileBuffer)], { type: message.type });
                delete message.fileBuffer;

                message.blob = blob;
            }
            if (message.user != "admin") {
                message.time = new Date().getHours() + ":" + (new Date().getMinutes() < 10 ? "0" + new Date().getMinutes() : new Date().getMinutes());
            }
            events.current(messagesLength.current)
            setMessages(messages => [...messages, message]);
        })

        socket.on("roomData", ({ room, users }) => {
            if (isHost.current === undefined) isHost.current = users.find(user => user.username === username).host;
            console.log(isHost.current)
            setRoomUsers(users);
        })
    }, [])
    useEffect(() => {
        const checkRoomUsername = () => {
            if (!username || !room) {
                history.push("/")
            }
        }
        checkRoomUsername()
        // window.onbeforeunload = event =>{
        //     // event.preventDefault()
        //     delete event.returnValue
        //     // return 'ok'
        // };

        return () => {
            window.onbeforeunload = () => { };

        };
    }, [history, username, room]);

    const sendMessage = event => {
        event.preventDefault();
        const maxCharacters = 700;
        if (message.length > maxCharacters) {
            const id = setTimeout(() => {
                dispatch(removeFlashMessage(id));
            }, 140000)
            dispatch(addFlashMessage({
                message: `The message you're trying to send is too big, maximum characters length is 
                        ${(maxCharacters)}`,
                timeOutId: id,
                type: "error"
            }));
        }
        if (message) {
            socket.emit("sendMessage", { text: message, type: "text" }, () => {
                setMessage("");
            });
        }
    };
    const sendFile = ({ event, data, caption, fileName, callback }) => {
        event.preventDefault();
        const captionSize = caption ? 2 * caption.length : 0;
        //1048500000 MAX
        const maxSize = 104850000;
        if (data.size + captionSize > maxSize) {
            const id = setTimeout(() => {
                dispatch(removeFlashMessage(id));
            }, 140000)
            dispatch(addFlashMessage({
                message: `The file(s) you're trying to send is too big, maximum size is 
                        ${(maxSize / (1024 ** 2)).toFixed(2)} MB`,
                timeOutId: id,
                type: "error"
            }));
            callback();
            return;
        }

        socket.emit("sendMessage", { buffer: data, fileType: data.type, text: caption, fileName, type: "file" }, callback)
    };
    const kickEvent = (user) => {
        socket.emit("kickUser", user, username)
    }
    const banEvent = (user, reason, banTime) => {
        socket.emit("banUser", { ...user, banTime: banTime * 60, reason }, username)
    }

    return (
        <>
            {socket &&
                <div id="chat" onDragLeave={(e) => handleDragExitFile(e)} onDrop={(e) => handleDropFile(e)} onDragOver={(e) => handleDragOverFile(e)} className="outerContainer">

                    <InfoBar users={roomUsers} kickEvent={kickEvent} banEvent={banEvent} />
                    <div className="innerContainer">
                        <Messages messageEvent={events} messagesObjectStore={messagesObjectStore} setMessages={setMessages} messages={messages} username={username} />
                        {/* </div> */}
                        <div />
                    </div>
                    <Input ref={readInputFileDocument} message={message} sendFile={sendFile} setMessage={setMessage} sendMessage={sendMessage} />

                </div>}
        </>
    )
}

export default Chat;