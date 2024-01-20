import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { setRoom } from '../../actions';
import UsersCount from '../UsersCount/UsersCount';
// import UsersDisplay from '../UsersDisplay/UsersDisplay';
import doorImg from './../../images/leave_door.png';
import './InfoBar.css';


const InfoBar = ({ users, kickEvent, banEvent }) => {
    const { room } = useSelector(state => state.joinData)
    const dispatch = useDispatch();


    return (
        <div className="InfoBarContainer">
            <header style={{ overflowWrap: "break-word", width: "35%" }}>{(room.name || room).toLowerCase()}</header>
            <UsersCount users={users} room={room} kickEvent={kickEvent} banEvent={banEvent} />
            <Link to="/" id="leaveRoom" onClick={() => dispatch(setRoom(""))} title="leave &times;">
                <img src={doorImg} alt="leaving door" width={25} height={25} />
            </Link>
        </div>)
}

export default InfoBar;