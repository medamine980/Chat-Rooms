import { useState, useEffect } from "react";
import threeUsersIcon from './../../images/3users_icon.png';
import UsersDisplay from './../UsersDisplay/UsersDisplay';
import "./UsersCount.css";

const UsersCount = ({ users, kickEvent, banEvent }) => {
    const [currentUsers, setCurrentUsers] = useState(users.length);
    useEffect(() => {
        setTimeout(() => {
            setCurrentUsers(users.length)
        }, 2000)
        return () => setCurrentUsers(users.length)
    }, [users])

    return (
        <UsersDisplay users={users} kickEvent={kickEvent} banEvent={banEvent} jsx={
            <span className="usersCount" title="people in this room">
                <img src={threeUsersIcon} alt="three users" width={25} height={25} />
                {currentUsers > users.length && <span id="usersCountRed" className="innerUsersCount">{users.length}</span>}
                {currentUsers < users.length && <span id="usersCountGreen" className="innerUsersCount">{users.length}</span>}
                {currentUsers === users.length && <span className="innerUsersCount">{users.length}</span>}
            </span>
        } />

    )
}

export default UsersCount;