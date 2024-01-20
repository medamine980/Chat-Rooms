import threeUsersIcon from "../../../images/3users_icon.png";
import "./Room.css";

const Room = ({ room, roomWithUsers, handleJoin }) => {
    return (
        <>
            { roomWithUsers &&
                <div className="roomDataContainer">

                    <header>{room}</header>
                    <hr className="roomDataHr" />
                    <div className="roomDataAndJoinButtonContainer">
                        <div className="usersInRoom">
                            <span style={{ paddingRight: "5px" }}>
                                {roomWithUsers[room] && roomWithUsers[room].length}
                            </span>
                            <img style={{ float: "right" }} src={threeUsersIcon} alt="three users" width={25} height={25} />

                        </div>

                        <button className="joinRoomButton" onClick={() => handleJoin(room)}>Join</button>
                    </div>
                </div>
            }
        </>
    )
}

export default Room;