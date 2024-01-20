import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useHistory } from 'react-router-dom';
import io from 'socket.io-client';
import { setIpv4, setRoom } from "../../actions";
import Room from "./Room/Room";
import "./AvailableRooms.css"

let socket;
const AvailableRooms = () => {
    const [rooms, setRooms] = useState([]);
    const [roomsWithUsers, setRoomsWithUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const history = useHistory();
    const END_POINT = "http://localhost:5000";
    const IP_END_POINT = "https://api.ipify.org/";
    let abortController;

    const handleJoin = async room => {
        if (!socket) return
        abortController = new AbortController();
        setLoading(true);
        let ip;
        try {
            const res = await fetch(IP_END_POINT, { signal: abortController.signal });
            ip = await res.text();
        }
        catch (e) {
            console.log(e.message)
        }
        setLoading(false);
        dispatch(setIpv4(ip));
        dispatch(setRoom(room));
        history.push("/chat");


    }
    useEffect(() => {
        const connectionOptions = {
            "force new connection": true,
            "reconnectionAttempts": "Infinity",
            "timeout": 10000,
            "transports": ["websocket"],
        };
        socket = io(END_POINT, connectionOptions)
        socket.emit("checkRooms")
    }, [END_POINT])

    useEffect(() => {
        socket.on("roomsData", ({ rooms, roomsWithUsers }) => {
            setRooms(rooms);
            setRoomsWithUsers(roomsWithUsers);
        })
        return () => {
            if (abortController) abortController.abort()
            socket.disconnect()
            socket.off()
        }
    }, [abortController])
    return (
        <>
            { loading ?
                <div className="loadingInRoomPath">
                    Loading...
        </div> :
                <div className="roomsDataContainer">
                    <header id="roomsDataContainerHeader">Rooms</header>

                    <Link className="createRoomLinkButton" to="/create">Create new room</Link>
                    {rooms.map((room, index) => (
                        <div key={index}>
                            <Room room={room} roomWithUsers={roomsWithUsers[index]} handleJoin={handleJoin} loading={loading} />
                        </div>
                    ))}
                </div>
            }
        </>
    )
}

export default AvailableRooms;