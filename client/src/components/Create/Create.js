import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router';
import { addFlashMessage, removeFlashMessage, setIpv4, setRoom, setUsername } from '../../actions';
import io from 'socket.io-client';

import "./Create.css";
import { Link } from 'react-router-dom';
import { WEB_SOCKET_END_POINT } from "../../constants/configuration";

const maxLengthRoom = 30;
let socket;
const Create = () => {
    const [roomState, setRoomState] = useState("");
    const [usernameState, setUsernameState] = useState("");
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const { username, room } = useSelector(state => state.joinData)
    const history = useHistory();
    const END_POINT = WEB_SOCKET_END_POINT;
    const IP_END_POINT = "https://api.ipify.org/";
    let abortController;
    const handleSubmit = async (e) => {
        e.preventDefault()
        abortController = new AbortController();
        if (!roomState || !usernameState || loading) return
        setLoading(true);
        let res;
        let ip;
        try {
            res = await fetch(IP_END_POINT, { signal: abortController.signal });
            ip = await res.text();
        }
        catch (e) {
            console.log(e.message);
            return setLoading(false);
        }
        const connectionOptions = {
            "force new connection": true,
            "reconnectionAttempts": "Infinity",
            // "reconnection": true,
            "timeout": 10000,
            "transports": ["websocket"],
            "upgrade": false
        };
        socket = io(END_POINT, connectionOptions)
        socket.emit("newRoom", { room: { name: roomState, messageCount: 0 }, username }, (error) => {
            if (error) {
                const id = setTimeout(() => {
                    dispatch(removeFlashMessage(id))
                }, 14000)
                dispatch(addFlashMessage({
                    message: error,
                    timeOutId: id,
                    type: "error"
                }))
                setLoading(false)
                socket.disconnect()
                socket.off()
                return;
            }
            dispatch(setUsername(usernameState));
            dispatch(setRoom({ name: roomState, messageCount: 0 }));
            dispatch(setIpv4(ip));
            history.push("/chat");
        })

    }
    const handleRoom = (e) => {
        const { value, maxLength } = { ...e.target, maxLength: maxLengthRoom };
        setRoomState(value.substr(0, maxLength))
    }
    useEffect(() => {
        setUsernameState(username);
        setRoomState(room);
        return () => {
            if (abortController) abortController.abort()
            if (socket) {
                socket.disconnect();
                socket.off();
            }
        }
    }, [username, room, abortController])
    return (
        <div className="createInputContainer">
            <header className="create-header">Create New Room</header>
            <hr></hr>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Room" value={roomState} onChange={(e) => handleRoom(e)} autoFocus />
                {loading ? <button id="create-submit-btn" disabled>Creating...</button>
                    : <button id="create-submit-btn">Create</button>}
            </form>
            <Link className="roomsLink" to="/rooms">Rooms</Link>
        </div>
    )
}

export default Create;